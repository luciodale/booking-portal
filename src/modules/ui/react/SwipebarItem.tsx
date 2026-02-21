import type { ReactNode } from "react";

type SwipebarItemProps = {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
};

export function SwipebarItem({ icon, label, isActive = false }: SwipebarItemProps) {
  return (
    <span
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
}
