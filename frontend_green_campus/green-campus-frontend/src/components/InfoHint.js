import React, { useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function InfoHint({
  title = "What this means",
  text,
  width = 280,
  align = "left",
  placement = "bottom",
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  const tooltip = useRef(null);
  const tooltipId = useId();
  const [position, setPosition] = useState({ left: 16, top: 16 });
  useLayoutEffect(() => {
    if (!open) return;
    const anchor = trigger.current.getBoundingClientRect();
    const box = tooltip.current.getBoundingClientRect();
    const preferredLeft = align === "right" ? anchor.right - box.width : align === "center" ? anchor.left + anchor.width / 2 - box.width / 2 : anchor.left;
    const fitsBelow = anchor.bottom + box.height + 12 < window.innerHeight;
    const top = placement === "top" || !fitsBelow ? anchor.top - box.height - 8 : anchor.bottom + 8;
    setPosition({ left: Math.max(12, Math.min(preferredLeft, window.innerWidth - box.width - 12)), top: Math.max(12, Math.min(top, window.innerHeight - box.height - 12)) });
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open, align, placement]);

  return (
    <span
      style={styles.wrapper}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        ref={trigger}
        style={styles.button}
        aria-label={title}
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
      >
        !
      </button>
      {open ? createPortal(
        <span
          ref={tooltip}
          id={tooltipId}
          role="tooltip"
          style={{
            ...styles.tooltip,
            width,
            maxWidth: "min(320px, calc(100vw - 32px))",
            ...position,
          }}
        >
          <strong style={styles.tooltipTitle}>{title}</strong>
          <span style={styles.tooltipText}>{text}</span>
        </span>, document.body
      ) : null}
    </span>
  );
}

const styles = {
  wrapper: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    marginLeft: "8px",
    verticalAlign: "middle",
  },
  button: {
    width: "22px",
    height: "22px",
    borderRadius: "999px",
    border: "1px solid #b8d2c8",
    background: "#f5fbf8",
    color: "#1b7f62",
    fontWeight: "800",
    fontSize: "12px",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    lineHeight: 1,
  },
  tooltip: {
    position: "fixed",
    zIndex: 100,
    pointerEvents: "none",
    maxHeight: "calc(100vh - 24px)",
    overflowY: "auto",
    background: "#17342d",
    color: "#f5fbf8",
    borderRadius: "16px",
    padding: "12px 14px",
    boxShadow: "0 18px 36px rgba(8, 18, 16, 0.28)",
    display: "grid",
    gap: "6px",
  },
  tooltipTitle: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#9ee8c8",
  },
  tooltipText: {
    fontSize: "13px",
    lineHeight: 1.6,
  },
};
