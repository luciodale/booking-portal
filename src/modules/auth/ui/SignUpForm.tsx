import { $clerkStore, $isLoadedStore, $signUpStore } from "@clerk/astro/client";
import type { OAuthStrategy } from "@clerk/types";
import { useStore } from "@nanostores/react";
import { useState } from "react";
import { CodeInput } from "./CodeInput";
import { OAuthButtons } from "./OAuthButtons";

type Step = "form" | "verify";

function useHandleSignUp() {
  const signUp = useStore($signUpStore);
  const clerk = useStore($clerkStore);
  const isLoaded = useStore($isLoadedStore);
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

      if (result.status === "complete" && clerk) {
        await clerk.setActive({ session: result.createdSessionId });
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
    submitting: loading,
    disabled: loading || !isLoaded,
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
    submitting,
    disabled,
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
            <OAuthButtons onOAuth={handleOAuth} disabled={disabled} />

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
                  disabled={disabled}
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
                  disabled={disabled}
                  data-testid="signup-password"
                />
              </div>

              {error && <p className="text-sm text-error">{error}</p>}

              <button
                type="submit"
                disabled={disabled}
                className="btn-primary w-full mt-2"
                data-testid="signup-submit"
              >
                {submitting ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3 text-center">
                Verification code
              </label>
              <CodeInput value={code} onChange={setCode} disabled={disabled} />
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <button
              type="submit"
              disabled={disabled}
              className="btn-primary w-full mt-2"
              data-testid="signup-verify"
            >
              {submitting ? "Verifying..." : "Verify Email"}
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
  return <SignUpFormInner />;
}
