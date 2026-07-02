export default function Logo({ size = 36 }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="rounded-2xl bg-gradient-primary grid place-items-center shadow-glow"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none">
          <path
            d="M4 12c0-4 3-7 7-7s7 3 7 7c0 3-2 5-4 6l-3 4-3-4c-2-1-4-3-4-6z"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="11" r="2" fill="white" />
        </svg>
      </div>
      <span className="font-display text-2xl font-semibold tracking-tight">
        VAU<span className="text-accent">.</span>
      </span>
    </div>
  );
}
