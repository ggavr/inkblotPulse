"use client";

import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (typeof window !== "undefined") {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            textAlign: "center",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26,
              fontWeight: 700,
              color: "var(--ib-text-primary)",
              marginBottom: 10,
            }}
          >
            Something went wrong
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--ib-text-secondary)",
              maxWidth: 420,
              marginBottom: 22,
              lineHeight: 1.55,
            }}
          >
            {this.state.message ?? "An unexpected error interrupted the page. Try reloading."}
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, message: undefined });
              if (typeof window !== "undefined") window.location.reload();
            }}
            style={{
              background: "var(--ib-accent)",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
