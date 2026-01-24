import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavButtonProps {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
}

export function NavButton({ direction, onClick, label }: NavButtonProps) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 rounded-lg bg-secondary hover:bg-card-hover transition-colors border border-border"
      aria-label={label}
    >
      <Icon className="w-5 h-5 text-card-foreground" />
    </button>
  );
}
