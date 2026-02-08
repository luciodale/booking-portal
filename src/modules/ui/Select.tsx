/**
 * Custom Select Component using Floating UI
 * Replaces native select with a custom dropdown
 */

import { cn } from "@/modules/utils/cn";
import {
  autoUpdate,
  flip,
  offset,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  id?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  className,
  error = false,
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const listRef = useRef<Array<HTMLElement | null>>([]);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip(),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "listbox" });
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [click, dismiss, role, listNav]
  );

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        id={id}
        ref={refs.setReference}
        disabled={disabled}
        className={cn(
          "input w-full flex items-center justify-between",
          error && "border-error",
          disabled && "opacity-50 cursor-not-allowed",
          !selectedOption && "text-muted-foreground",
          className
        )}
        {...getReferenceProps()}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform shrink-0 ml-2",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="z-50 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
          {...getFloatingProps()}
        >
          <div className="max-h-60 overflow-y-auto py-2">
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = activeIndex === index;

              return (
                <button
                  key={option.value}
                  type="button"
                  ref={(node) => {
                    listRef.current[index] = node;
                  }}
                  aria-selected={isSelected}
                  tabIndex={isActive ? 0 : -1}
                  className={cn(
                    "w-full text-left px-4 py-3 transition-colors",
                    isSelected && "bg-primary/10 text-primary font-medium",
                    isActive && !isSelected && "bg-secondary",
                    !isSelected && !isActive && "text-foreground",
                    "hover:bg-secondary cursor-pointer"
                  )}
                  {...getItemProps({
                    onClick: () => handleSelect(option.value),
                  })}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
