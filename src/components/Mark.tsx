export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0c2340" />
      <path d="M6 16h20M16 6v20" stroke="#e7eef6" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="5" fill="none" stroke="#e4b65a" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="1.5" fill="#3dce97" />
    </svg>
  );
}
