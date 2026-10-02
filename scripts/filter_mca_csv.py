#!/usr/bin/env python3
"""
Phase 1, step 2 — turn the Karnataka company master CSV from data.gov.in
into a WalkInCity import file.

Usage:
    python3 scripts/filter_mca_csv.py karnataka_companies.csv
    python3 scripts/filter_mca_csv.py karnataka_companies.csv --min-capital 1000000 --limit 500

It keeps companies that are:
  * Active
  * registered at a Bangalore PIN code (560xxx, found in the address)
  * paid-up capital >= --min-capital (default ₹10 lakh)

Output: data/companies_filtered.csv with the exact columns the Supabase
`companies` table expects. Hiring columns are left blank / "Unknown" for
you (or Claude) to fill in.

data.gov.in files change column names between releases, so the script
matches columns loosely. If it can't find one, it tells you which
headers it saw.
"""
import argparse
import csv
import re
import sys
from collections import Counter
from pathlib import Path

# Only PIN codes we're confident about. Everything else becomes
# "Bangalore" — fix those by hand in the sheet or in Supabase.
PIN_AREAS = {
    "560001": "MG Road", "560003": "Malleshwaram", "560004": "Basavanagudi",
    "560010": "Rajajinagar", "560011": "Jayanagar", "560017": "HAL Airport Road",
    "560022": "Yeshwanthpur", "560024": "Hebbal", "560027": "Wilson Garden",
    "560032": "RT Nagar", "560034": "Koramangala", "560035": "Sarjapur Road",
    "560036": "KR Puram", "560037": "Marathahalli", "560038": "Indiranagar",
    "560040": "Vijayanagar", "560041": "Jayanagar", "560043": "Kalyan Nagar",
    "560048": "Mahadevapura", "560058": "Peenya", "560060": "Kengeri",
    "560064": "Yelahanka", "560066": "Whitefield", "560067": "Kadugodi",
    "560068": "Bommanahalli", "560070": "Banashankari", "560071": "Domlur",
    "560076": "BTM Layout", "560078": "JP Nagar", "560085": "Banashankari",
    "560087": "Varthur", "560092": "Sahakara Nagar", "560093": "CV Raman Nagar",
    "560095": "Koramangala", "560098": "RR Nagar", "560099": "Bommasandra",
    "560100": "Electronic City", "560102": "HSR Layout", "560103": "Bellandur",
}

# Keyword → industry label used on the site. First match wins.
INDUSTRY_RULES = [
    (r"computer|software|information technology|\bit\b|data processing|programming", "IT Services"),
    (r"pharma|drug|medicin|biotech|chemical", "Pharma & Chemicals"),
    (r"financ|bank|insurance|credit|invest|leasing|nbfc", "Finance"),
    (r"health|hospital|clinic|diagnos", "Healthcare"),
    (r"educat|school|training|coaching", "Education"),
    (r"construct|real estate|building|infra", "Construction & Real Estate"),
    (r"manufactur|machinery|metal|textile|electrical|electronic|auto|food products", "Manufacturing"),
    (r"trading|wholesale|retail|e-?commerce", "Trading & Retail"),
    (r"transport|logistic|storage|courier|warehous", "Logistics"),
    (r"hotel|restaurant|hospitality|travel|tour", "Hospitality & Travel"),
    (r"business services|consult|research|advertis|market", "Business Services"),
]

OUT_COLUMNS = [
    "company_name", "industry", "area", "pin_code", "website", "careers_url",
    "linkedin_url", "hiring_status", "open_roles", "last_checked",
]


def find_col(headers, *patterns):
    for pat in patterns:
        for h in headers:
            if re.search(pat, h, re.I):
                return h
    return None


def parse_capital(raw):
    try:
        return float(re.sub(r"[^\d.]", "", raw or "") or 0)
    except ValueError:
        return 0.0


def guess_industry(text):
    t = (text or "").lower()
    for pattern, label in INDUSTRY_RULES:
        if re.search(pattern, t):
            return label
    return "Other"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("csv_path")
    ap.add_argument("--min-capital", type=float, default=1_000_000, help="rupees, default 10 lakh")
    ap.add_argument("--limit", type=int, default=0, help="keep at most N rows (0 = all)")
    ap.add_argument("--out", default="data/companies_filtered.csv")
    args = ap.parse_args()

    with open(args.csv_path, newline="", encoding="utf-8-sig", errors="replace") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames or []
        c_name = find_col(headers, r"^company_?name$", r"company.?name", r"name")
        c_status = find_col(headers, r"company_?status", r"status")
        c_cap = find_col(headers, r"paid.?up", r"capital")
        c_addr = find_col(headers, r"registered_?office_?address", r"address")
        c_pin = find_col(headers, r"pin")
        c_act = find_col(headers, r"principal.?business", r"activity", r"industr")

        missing = [n for n, c in [("name", c_name), ("status", c_status), ("capital", c_cap)] if not c]
        if missing or not (c_addr or c_pin):
            sys.exit(f"Couldn't find columns {missing or ['address/pin']}. Headers seen:\n  " + "\n  ".join(headers))

        rows, seen, stats = [], set(), Counter()
        for r in reader:
            stats["total"] += 1
            status = (r.get(c_status) or "").strip().lower()
            if status not in ("active", "actv"):
                continue
            stats["active"] += 1
            pin_src = " ".join(filter(None, [r.get(c_pin) if c_pin else "", r.get(c_addr) if c_addr else ""]))
            m = re.search(r"\b(560\d{3})\b", pin_src)
            if not m:
                continue
            stats["bangalore"] += 1
            if parse_capital(r.get(c_cap)) < args.min_capital:
                continue
            stats["capital_ok"] += 1
            name = re.sub(r"\s+", " ", (r.get(c_name) or "").strip()).title()
            name = re.sub(r"\bPvt\b\.?", "Pvt", name).replace("Private Limited", "Pvt Ltd").replace("Limited", "Ltd")
            pin = m.group(1)
            key = (name.lower(), pin)
            if not name or key in seen:
                continue
            seen.add(key)
            rows.append({
                "company_name": name,
                "industry": guess_industry(r.get(c_act) if c_act else ""),
                "area": PIN_AREAS.get(pin, "Bangalore"),
                "pin_code": pin,
                "website": "", "careers_url": "", "linkedin_url": "",
                "hiring_status": "Unknown", "open_roles": "", "last_checked": "",
            })

    if args.limit:
        # Spread the pick across industries instead of taking the first N.
        by_ind = {}
        for row in rows:
            by_ind.setdefault(row["industry"], []).append(row)
        picked = []
        while len(picked) < args.limit and any(by_ind.values()):
            for ind in list(by_ind):
                if by_ind[ind] and len(picked) < args.limit:
                    picked.append(by_ind[ind].pop(0))
        rows = picked

    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    with open(args.out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=OUT_COLUMNS)
        w.writeheader()
        w.writerows(rows)

    print(f"Read {stats['total']:,} rows → active {stats['active']:,} → Bangalore {stats['bangalore']:,} "
          f"→ capital ≥ ₹{args.min_capital:,.0f}: {stats['capital_ok']:,}")
    print(f"Wrote {len(rows):,} companies to {args.out}")
    print("By industry:", dict(Counter(r["industry"] for r in rows).most_common()))
    unknown_area = sum(r["area"] == "Bangalore" for r in rows)
    if unknown_area:
        print(f"{unknown_area} rows have area 'Bangalore' (PIN not in the lookup) — set those by hand.")


if __name__ == "__main__":
    main()
