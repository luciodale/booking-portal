import { cn } from "@/modules/utils/cn";
import { Plus, Trash2 } from "lucide-react";

interface RemoveRowButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function RemoveRowButton({ onClick, disabled }: RemoveRowButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-4 rounded-lg border border-border text-base leading-normal flex items-center justify-center text-muted-foreground transition-colors shrink-0",
        "hover:text-error hover:border-error/50",
        "disabled:opacity-50"
      )}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

interface AddRowButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}

export function AddRowButton({ onClick, disabled, label }: AddRowButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
    >
      <Plus className="w-4 h-4" />
      {label}
    </button>
  );
}
