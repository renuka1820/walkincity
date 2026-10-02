import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-ink-soft">That company or page isn&apos;t in our directory.</p>
      <Link href="/search" className="btn btn-primary mt-6">Search companies</Link>
    </div>
  );
}
