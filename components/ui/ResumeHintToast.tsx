import React, { useEffect, useState } from "react";

interface ResumeHintToastProps {
  seconds: number;
  open?: boolean;
  duration?: number; // ms
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}m`;
  if (m > 0) return `${m}min${s > 0 ? ` ${s}s` : ""}`;
  return `${s}s`;
}

const ResumeHintToast: React.FC<ResumeHintToastProps> = ({
  seconds,
  open = true,
  duration = 3500
}) => {
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, seconds]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        zIndex: 40,
        background: "rgba(30,30,36,0.92)",
        color: "#fff",
        borderRadius: 12,
        padding: "14px 22px",
        boxShadow: "0 6px 24px 0 rgba(42,32,74,.18)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        minWidth: 210,
        fontSize: 15,
        fontWeight: 500,
        letterSpacing: 0.1,
        pointerEvents: "none"
      }}
      aria-live="polite"
      tabIndex={-1}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{marginRight: 8}}>
        <circle cx="12" cy="12" r="11" stroke="#a78bfa" strokeWidth="2" />
        <path d="M12 7v5l4 2" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>
        Vous vous étiez arrêté à <span style={{ color: "#a78bfa", fontWeight: 700 }}>{formatTime(seconds)}</span>
      </span>
    </div>
  );
};

export default ResumeHintToast;