/**
 * IconTextInput - Text input + IconPicker + Add button row
 * Extracted from IconTagsInput for reuse in CategoryPicker
 */

import { IconPicker } from "@/modules/ui/react/IconPicker";

interface IconTextInputProps {
  textValue: string;
  iconValue: string;
  onTextChange: (value: string) => void;
  onIconChange: (value: string) => void;
  onAdd: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function IconTextInput({
  textValue,
  iconValue,
  onTextChange,
  onIconChange,
  onAdd,
  disabled = false,
  placeholder = "Add custom...",
}: IconTextInputProps) {
  return (
    <div className="flex gap-2 mt-3">
      <input
        type="text"
        value={textValue}
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd();
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="input flex-1 text-sm"
      />
      <div className="w-40">
        <IconPicker
          value={iconValue}
          onChange={onIconChange}
          disabled={disabled}
        />
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled || !textValue.trim()}
        className="btn-secondary text-sm disabled:opacity-50"
      >
        Add
      </button>
    </div>
  );
}
