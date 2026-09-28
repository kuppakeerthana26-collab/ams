import React from "react";
import "./Footer.css";

export const Footer = () => {
  return (
    <footer className="portal-footer">
      <div className="footer-left">
        <span>© {new Date().getFullYear()} Gokula Krishna College of Engineering (GKCE), Sullurpeta.</span>
        <span className="footer-subtext">Autonomous Institution • Affiliated to JNTUA • Approved by AICTE</span>
      </div>
      <div className="footer-right">
        <span className="system-status-indicator">
          <span className="live-dot"></span> System Live &amp; Operational
        </span>
        <span className="footer-version">v2.4 Leadership Edition</span>
      </div>
    </footer>
  );
};
