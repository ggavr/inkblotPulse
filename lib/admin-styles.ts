export const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(138,126,116,0.3)",
  background: "var(--ib-bg-primary)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 16,
  color: "var(--ib-text-primary)",
  transition: "border-color 200ms",
};

export const primaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  background: "var(--ib-accent)",
  color: "#FFFFFF",
  border: "none",
  padding: "12px 18px",
  borderRadius: 999,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

export const ghostBtn: React.CSSProperties = {
  background: "transparent",
  color: "var(--ib-text-secondary)",
  border: "1px solid rgba(138,126,116,0.3)",
  padding: "12px 18px",
  borderRadius: 999,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

export const iconBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 10,
  minWidth: 44,
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--ib-text-secondary)",
};

export const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(45,42,38,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  zIndex: 100,
};

export const modalPanel: React.CSSProperties = {
  background: "var(--ib-bg-primary)",
  borderRadius: 18,
  padding: 22,
  width: "100%",
  maxWidth: 560,
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 20px 60px rgba(45,42,38,0.25)",
};
