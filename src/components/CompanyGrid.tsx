import { getDetails, getViewer, type Company } from "@/lib/data";
import { CompanyCard } from "./CompanyCard";

export async function CompanyGrid({ rows }: { rows: Company[] }) {
  const viewer = await getViewer();
  const details = viewer.hasAccess ? await getDetails(rows.map((r) => r.id)) : {};
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((c) => <CompanyCard key={c.id} c={c} details={details[c.id]} locked={!viewer.hasAccess} />)}
    </div>
  );
}
