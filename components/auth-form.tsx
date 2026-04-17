"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signInAction, signUpAction } from "@/app/actions/auth";

type Mode = "sign-in" | "sign-up";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const onSubmit = (formData: FormData) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const res =
        mode === "sign-in"
          ? await signInAction(formData)
          : await signUpAction(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (mode === "sign-up") {
        setNotice("Check your email to confirm your account, then sign in.");
        return;
      }
      router.replace("/");
      router.refresh();
    });
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        padding: "0 20px",
        fontFamily: "'DM Sans', sans-serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "var(--ib-bg-card)",
          borderRadius: 24,
          padding: "36px 28px 32px",
          boxShadow: "0 10px 40px rgba(45,42,38,0.08)",
          border: "1px solid rgba(138,126,116,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              fontWeight: 900,
              color: "var(--ib-accent)",
              letterSpacing: "-0.02em",
            }}
          >
            Inkblot Pulse
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 900,
            color: "var(--ib-text-primary)",
            marginBottom: 6,
            textAlign: "center",
          }}
        >
          {mode === "sign-in" ? "Welcome back" : "Create your account"}
        </h1>
        <p
          style={{
            color: "var(--ib-text-secondary)",
            fontSize: 14,
            marginBottom: 28,
            textAlign: "center",
          }}
        >
          {mode === "sign-in"
            ? "Sign in to save excerpts and follow your feed."
            : "Sign up to start saving excerpts."}
        </p>

        <form action={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ib-text-primary)" }}>
              Email
            </span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              className="ib-auth-input"
              style={inputStyle}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ib-text-primary)" }}>
              Password
            </span>
            <input
              type="password"
              name="password"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              minLength={8}
              required
              className="ib-auth-input"
              style={inputStyle}
            />
          </label>

          {error && (
            <div
              role="alert"
              style={{
                background: "rgba(196,104,109,0.1)",
                border: "1px solid rgba(196,104,109,0.3)",
                color: "var(--ib-accent)",
                padding: "10px 12px",
                borderRadius: 10,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}
          {notice && (
            <div
              role="status"
              style={{
                background: "rgba(100,170,120,0.12)",
                border: "1px solid rgba(100,170,120,0.35)",
                color: "#3a6b4a",
                padding: "10px 12px",
                borderRadius: 10,
                fontSize: 13,
              }}
            >
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="ib-auth-submit"
            style={{
              background: "var(--ib-accent)",
              color: "#FFFFFF",
              border: "none",
              padding: "14px 20px",
              borderRadius: 999,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              cursor: isPending ? "wait" : "pointer",
              marginTop: 6,
              boxShadow: "0 4px 12px rgba(196,104,109,0.3)",
              transition: "background 200ms, transform 200ms, box-shadow 200ms",
            }}
          >
            {isPending ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div
          style={{
            marginTop: 28,
            fontSize: 14,
            color: "var(--ib-text-secondary)",
            textAlign: "center",
          }}
        >
          {mode === "sign-in" ? (
            <>
              New here?{" "}
              <Link
                href="/auth/sign-up"
                style={{ color: "var(--ib-accent)", fontWeight: 600, padding: "8px 4px" }}
              >
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href="/auth/sign-in"
                style={{ color: "var(--ib-accent)", fontWeight: 600, padding: "8px 4px" }}
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: 12,
  border: "1.5px solid rgba(138,126,116,0.25)",
  background: "var(--ib-bg-primary)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 16,
  color: "var(--ib-text-primary)",
  transition: "border-color 200ms, box-shadow 200ms",
};
