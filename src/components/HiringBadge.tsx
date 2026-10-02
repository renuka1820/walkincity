import type { HiringStatus } from "@/lib/data";

export function HiringBadge({ status }: { status: HiringStatus }) {
  const styles =
    status === "Hiring"
      ? "bg-hire-soft text-hire"
      : status === "Not hiring"
        ? "bg-chip text-ink-soft"
        : "bg-transparent text-ink-soft border border-dashed border-line-strong";
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>
      {status === "Hiring" && <span className="h-1.5 w-1.5 rounded-full bg-hire" aria-hidden />}
      {status === "Unknown" ? "Not checked" : status}
    </span>
  );
}
