import { useRef, useCallback } from "react";

const CODE_LENGTH = 6;
const DIGIT_KEYS = Array.from({ length: CODE_LENGTH }, (_, i) => `digit-${i}`);

export function CodeInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (code: string) => void;
  disabled: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(CODE_LENGTH).slice(0, CODE_LENGTH).split("");

  const focusInput = useCallback((index: number) => {
    inputsRef.current[index]?.focus();
  }, []);

  function handleChange(index: number, char: string) {
    if (char && !/^\d$/.test(char)) return;

    const next = [...digits];
    next[index] = char;
    const joined = next.join("");
    onChange(joined.replace(/ /g, ""));

    if (char && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    }
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    onChange(pasted);
    focusInput(Math.min(pasted.length, CODE_LENGTH - 1));
  }

  return (
    <div className="flex gap-2 justify-center" data-testid="signup-code">
      {digits.map((digit, i) => (
        <input
          key={DIGIT_KEYS[i]}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit === " " ? "" : digit}
          onChange={(e) => handleChange(i, e.target.value.slice(-1))}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          data-testid={`signup-code-digit-${i}`}
          className="w-12 h-14 text-center text-xl font-semibold tracking-normal rounded-lg border border-border bg-card text-foreground transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
        />
      ))}
    </div>
  );
}
