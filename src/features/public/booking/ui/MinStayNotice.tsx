type MinStayNoticeProps = {
  minStayNights: number | null;
};

export function MinStayNotice({ minStayNights }: MinStayNoticeProps) {
  if (minStayNights == null) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
      <svg
        aria-hidden="true"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary shrink-0"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="16" y2="12" />
        <line x1="12" x2="12.01" y1="8" y2="8" />
      </svg>
      <span className="text-xs text-muted-foreground">
        Minimum stay: <strong className="text-foreground">{minStayNights} nights</strong>
      </span>
    </div>
  );
}
