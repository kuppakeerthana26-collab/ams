import React from "react";
import "./Header.css";
import { ROLES } from "../../config/roles.js";

export const Header = ({
  selectedDate,
  onDateChange,
  activeRoleKey,
  onRoleChange,
  onRefresh,
  onExportExcel,
  onExportDocx,
  loading,
  onToggleSidebar,
}) => {
  return (
    <header className="top-header">
      <div className="header-inner">
        <div className="header-left-section">
          <button className="sidebar-toggle-btn" onClick={onToggleSidebar} title="Toggle Navigation">
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>

        <div className="header-actions">
          {/* Live Date Picker */}
          <div className="date-picker-box">
            <i className="fa-regular fa-calendar" style={{ color: "var(--primary)" }}></i>
            <input
              type="date"
              className="date-picker-input"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>

          {/* Quick Role Switcher */}
          <div className="role-select-box">
            <select
              className="role-select"
              value={activeRoleKey}
              onChange={onRoleChange}
            >
              {Object.entries(ROLES).map(([key, role]) => (
                <option key={key} value={key}>
                  {role.name} ({role.roleTag})
                </option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down role-select-arrow"></i>
          </div>

          {/* Export Defaulters Word Document */}
          <button
            className="btn btn-outline"
            onClick={onExportDocx}
            title="Download Official Shortage Report (.docx) for HODs & Deans"
          >
            <i className="fa-solid fa-file-word" style={{ color: "#2563eb" }}></i>
            <span>Defaulters Report</span>
          </button>

          {/* Export Excel Button */}
          <button
            className="btn btn-primary"
            onClick={onExportExcel}
            title="Download Monthly Attendance Excel"
          >
            <i className="fa-solid fa-file-excel"></i> Export Sheet
          </button>

          {/* Refresh Data */}
          <button
            className="btn btn-outline"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Attendance Feeds"
          >
            <i className={`fa-solid fa-arrows-rotate ${loading ? "fa-spin" : ""}`}></i>
            <span className="refresh-text">Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
};
