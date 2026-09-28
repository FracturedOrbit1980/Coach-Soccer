export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#7c1c2b" />
      <path d="M7 16h18M16 7v18" stroke="#f7f1ea" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="5.2" fill="none" stroke="#f7f1ea" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="1.6" fill="#1f8a56" />
    </svg>
  );
}
