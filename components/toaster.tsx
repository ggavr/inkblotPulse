"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ToastKind = "info" | "error" | "success";
type Toast = { id: number; message: string; kind: ToastKind };

type Ctx = {
  show: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      show: (message: string) => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("ib:toast", { detail: { message, kind: "info" } }));
        }
      },
    };
  }
  return ctx;
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ message: string; kind?: ToastKind }>).detail;
      if (detail?.message) show(detail.message, detail.kind ?? "info");
    };
    window.addEventListener("ib:toast", handler);
    return () => window.removeEventListener("ib:toast", handler);
  }, [show]);

  return (
    <ToastContext.Provider value={{ show }}>
      <div className="ib-toast-root" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`ib-toast${t.kind === "error" ? " ib-toast--error" : ""}${t.kind === "success" ? " ib-toast--success" : ""}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function toast(message: string, kind: ToastKind = "info") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ib:toast", { detail: { message, kind } }));
  }
}
