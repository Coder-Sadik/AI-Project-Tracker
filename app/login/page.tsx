"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, Mail, Lock, Zap, Globe } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { user, signIn, signInWithGoogle, signInAsGuest } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [redirectPending, setRedirectPending] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);

  // Handle redirect once user is authenticated
  useEffect(() => {
    if (redirectPending && user && redirectTarget) {
      router.push(redirectTarget);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRedirectPending(false);
      setRedirectTarget(null);
    }
  }, [redirectPending, user, redirectTarget, router]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      setRedirectTarget("/dashboard");
      setRedirectPending(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in";
      toast.error(msg.includes("auth/") ? "Invalid email or password" : msg);
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await signInWithGoogle();
      setRedirectTarget("/dashboard");
      setRedirectPending(true);
    } catch {
      toast.error("Google sign-in failed. Try again.");
      setLoading(false);
    }
  }

  async function handleGuest() {
    setGuestLoading(true);
    try {
      await signInAsGuest();
      setRedirectTarget("/demo");
      setRedirectPending(true);
    } catch {
      toast.error("Guest mode unavailable.");
      setGuestLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center hero-gradient"
      style={{ padding: "1rem" }}
    >
      <div className="auth-card fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <Image src="/logo.png" alt="Logo" width={56} height={56} className="rounded-xl hover:opacity-80 transition-opacity" />
            </Link>
          </div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Welcome back
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Sign in to your AI Project Tracker account
          </p>
        </div>

        {/* Google Sign-in */}
        <button
          id="google-signin-btn"
          className="btn btn-secondary w-full mb-4"
          style={{ width: "100%", justifyContent: "center", gap: "0.5rem" }}
          onClick={handleGoogle}
          disabled={loading}
        >
          <Globe size={16} />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 divider" style={{ margin: 0 }} />
          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
            or
          </span>
          <div className="flex-1 divider" style={{ margin: 0 }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleSignIn} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute"
                style={{
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                id="login-email"
                type="email"
                className="input"
                style={{ paddingLeft: "2.25rem" }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute"
                style={{
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                id="login-password"
                type={showPass ? "text" : "password"}
                className="input"
                style={{ paddingLeft: "2.25rem", paddingRight: "2.25rem" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute"
                style={{
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: 0,
                }}
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Guest mode */}
        <button
          id="guest-mode-btn"
          className="btn btn-ghost"
          style={{
            width: "100%",
            justifyContent: "center",
            marginTop: "0.75rem",
          }}
          onClick={handleGuest}
          disabled={guestLoading}
        >
          {guestLoading ? "Loading guest mode…" : "✨ Continue as Guest"}
        </button>

        {/* Register link */}
        <p
          className="text-center mt-4 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            style={{
              color: "var(--brand-500)",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
