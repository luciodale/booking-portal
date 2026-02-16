import { cn } from "@/modules/utils/cn";
import { type LucideIcon, icons } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  disabled?: boolean;
}

const iconEntries = Object.entries(icons) as [string, LucideIcon][];

export function IconPicker({
  value,
  onChange,
  disabled = false,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return iconEntries
      .filter(([name]) => name.toLowerCase().includes(q))
      .slice(0, 50);
  }, [search]);

  const SelectedIcon = value
    ? (icons[value as keyof typeof icons] ?? null)
    : null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-4 py-3 rounded-lg border border-border text-sm w-full",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "hover:border-primary/50"
        )}
      >
        {SelectedIcon ? (
          <>
            <SelectedIcon className="w-4 h-4 text-foreground" />
            <span className="text-foreground truncate">{value}</span>
          </>
        ) : (
          <span className="text-muted-foreground">Pick icon...</span>
        )}
      </button>

      {open && !disabled && (
        <div className="absolute z-50 top-full mt-1 left-0 w-72 bg-card border border-border rounded-lg shadow-lg p-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons..."
            className="input w-full mb-2 text-sm"
          />
          <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
            {filtered.map(([name, Icon]) => (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "p-2 rounded-md hover:bg-secondary transition-colors flex items-center justify-center",
                  value === name && "bg-primary/10 ring-1 ring-primary"
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-6 py-4 text-center text-sm text-muted-foreground">
                No icons found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
