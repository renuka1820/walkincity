export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-ink-soft">Last updated: {updated}</p>
      <div className="prose-legal mt-6">{children}</div>
    </div>
  );
}
