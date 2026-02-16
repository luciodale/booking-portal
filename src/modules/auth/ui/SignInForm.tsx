import { $clerkStore, $isLoadedStore, $signInStore } from "@clerk/astro/client";
import type { OAuthStrategy } from "@clerk/types";
import { useStore } from "@nanostores/react";
import { useState } from "react";
import { OAuthButtons } from "./OAuthButtons";

function useHandleSignIn() {
  const signIn = useStore($signInStore);
  const clerk = useStore($clerkStore);
  const isLoaded = useStore($isLoadedStore);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete" && clerk) {
        await clerk.setActive({ session: result.createdSessionId });
        window.location.href = "/";
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Sign in failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(strategy: OAuthStrategy) {
    if (!isLoaded || !signIn) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sign-in/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "OAuth sign in failed.";
      setError(message);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    submitting: loading,
    disabled: loading || !isLoaded,
    handleSubmit,
    handleOAuth,
  };
}

function SignInFormInner() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    submitting,
    disabled,
    handleSubmit,
    handleOAuth,
  } = useHandleSignIn();

  return (
    <div className="w-full max-w-md">
      <div className="bg-card border border-border rounded-2xl p-8 shadow-xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to your account
          </p>
        </div>

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
              data-testid="signin-email"
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
              placeholder="Enter your password"
              required
              className="input"
              disabled={disabled}
              data-testid="signin-password"
            />
          </div>

          {error && (
            <p className="text-sm text-error" data-testid="signin-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={disabled}
            className="btn-primary w-full mt-2"
            data-testid="signin-submit"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <a
            href="/sign-up"
            className="text-primary hover:text-primary-hover transition-colors font-medium"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export function SignInForm() {
  return <SignInFormInner />;
}
