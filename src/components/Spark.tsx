// Four-point sparkle used as the logo mark and as decoration.
export function Spark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 0c1 6.500 4.500 10 12 12-7.500 2-11 5.500-12 12-1-6.500-4.500-10-12-12C7.500 10 11 6.500 12 0z" />
    </svg>
  );
}
