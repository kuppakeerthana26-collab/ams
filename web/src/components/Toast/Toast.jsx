import React from "react";
import "./Toast.css";

export const Toast = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className={`toast-message ${toast.type || "success"}`}>
      <span className="toast-icon">
        {toast.type === "error" ? "⚠️" : "✓"}
      </span>
      <span>{toast.msg}</span>
    </div>
  );
};
