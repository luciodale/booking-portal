interface NavButtonProps {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
}

export function NavButton({ direction, onClick, label }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 rounded-lg bg-secondary hover:bg-card-hover transition-colors border border-border"
      aria-label={label}
    >
      <svg
        className="w-5 h-5 text-card-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={direction === "prev" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
        />
      </svg>
    </button>
  );
}

