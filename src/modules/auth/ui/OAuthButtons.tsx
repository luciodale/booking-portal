import type { OAuthStrategy } from "@clerk/types";

interface OAuthButtonsProps {
  onOAuth: (strategy: OAuthStrategy) => void;
  disabled?: boolean;
}

const providers: { strategy: OAuthStrategy; label: string; icon: string }[] = [
  { strategy: "oauth_google", label: "Google", icon: "G" },
  { strategy: "oauth_facebook", label: "Facebook", icon: "f" },
  { strategy: "oauth_apple", label: "Apple", icon: "" },
];

export function OAuthButtons({ onOAuth, disabled }: OAuthButtonsProps) {
  return (
    <div className="flex flex-col gap-3">
      {providers.map(({ strategy, label, icon }) => (
        <button
          key={strategy}
          type="button"
          disabled={disabled}
          onClick={() => onOAuth(strategy)}
          className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-lg border border-border bg-secondary text-secondary-foreground text-sm font-medium transition-all duration-200 hover:bg-card-hover hover:border-border-accent disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid={`oauth-${strategy.replace("oauth_", "")}`}
        >
          <span className="w-5 h-5 flex items-center justify-center text-xs font-bold">
            {icon}
          </span>
          Continue with {label}
        </button>
      ))}
    </div>
  );
}
