import React from "react";
import "./ScopeBanner.css";

export const ScopeBanner = ({
  activeRole,
  selectedDepartment,
  onDepartmentChange,
}) => {
  return (
    <section className="scope-banner">
      <div className="scope-user-info">
        <div className="user-avatar-badge">
          {activeRole.avatar}
        </div>
        <div className="user-details">
          <div className="user-name-row">
            <span className="user-name">{activeRole.name}</span>
            <span className={`user-badge ${activeRole.badgeClass}`}>
              {activeRole.roleTag}
            </span>
          </div>
          <span className="scope-description">
            Scope: {activeRole.scopeLabel}
          </span>
        </div>
      </div>

      {activeRole.department === "ALL" && (
        <div className="scope-filter-group">
          <label className="filter-label">Filter Branch:</label>
          <select
            className="filter-select"
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="CSE">CSE - Computer Science</option>
            <option value="ECE">ECE - Electronics &amp; Comm</option>
            <option value="MECH">MECH - Mechanical</option>
            <option value="CIVIL">CIVIL - Civil Engg</option>
            <option value="EEE">EEE - Electrical Engg</option>
          </select>
        </div>
      )}
    </section>
  );
};
