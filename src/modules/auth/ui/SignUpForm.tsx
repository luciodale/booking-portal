import { useSignUp } from "@clerk/clerk-react";
import type { OAuthStrategy } from "@clerk/types";
import { useState } from "react";
import { ClerkProviderWrapper } from "./ClerkProviderWrapper";
import { OAuthButtons } from "./OAuthButtons";

type Step = "form" | "verify";

function useHandleSignUp() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setLoading(true);
    setError("");

    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Sign up failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete" && setActive) {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/";
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Verification failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(strategy: OAuthStrategy) {
    if (!isLoaded || !signUp) return;

    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sign-in/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "OAuth sign up failed.";
      setError(message);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    code,
    setCode,
    step,
    error,
    loading: loading || !isLoaded,
    handleSubmit,
    handleVerify,
    handleOAuth,
  };
}

function SignUpFormInner() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    code,
    setCode,
    step,
    error,
    loading,
    handleSubmit,
    handleVerify,
    handleOAuth,
  } = useHandleSignUp();

  return (
    <div className="w-full max-w-md">
      <div className="bg-card border border-border rounded-2xl p-8 shadow-xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            {step === "form" ? "Create your account" : "Verify your email"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {step === "form"
              ? "Get started with EliteStay"
              : `We sent a code to ${email}`}
          </p>
        </div>

        {step === "form" ? (
          <>
            <OAuthButtons onOAuth={handleOAuth} disabled={loading} />

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">
                or continue with email
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input"
                  disabled={loading}
                  data-testid="signup-email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className="input"
                  disabled={loading}
                  data-testid="signup-password"
                />
              </div>

              {error && <p className="text-sm text-error">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2"
                data-testid="signup-submit"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Verification code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter the 6-digit code"
                required
                className="input text-center tracking-widest"
                disabled={loading}
                autoFocus
                data-testid="signup-code"
              />
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
              data-testid="signup-verify"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <a
            href="/sign-in"
            className="text-primary hover:text-primary-hover transition-colors font-medium"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

export function SignUpForm() {
  return (
    <ClerkProviderWrapper>
      <SignUpFormInner />
    </ClerkProviderWrapper>
  );
}
