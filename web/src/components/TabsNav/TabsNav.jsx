import React from "react";
import "./TabsNav.css";

export const TabsNav = ({
  activeTab,
  onTabChange,
  departmentsCount,
  sectionsCount,
  facultyCount,
  studentsCount,
}) => {
  return (
    <nav className="tabs-nav-bar">
      <button
        className={`tab-btn ${activeTab === "site_dashboard" ? "active" : ""}`}
        onClick={() => onTabChange("site_dashboard")}
      >
        <i className="fa-solid fa-chart-line"></i>
        <span>Site Dashboard</span>
      </button>

      <button
        className={`tab-btn ${activeTab === "branches" ? "active" : ""}`}
        onClick={() => onTabChange("branches")}
      >
        <i className="fa-solid fa-code-branch"></i>
        <span>Branch Intelligence</span>
        <span className="tab-badge">{departmentsCount || 5}</span>
      </button>

      <button
        className={`tab-btn ${activeTab === "departments" ? "active" : ""}`}
        onClick={() => onTabChange("departments")}
      >
        <i className="fa-solid fa-building-columns"></i>
        <span>Department Matrix</span>
        <span className="tab-badge">{departmentsCount}</span>
      </button>

      <button
        className={`tab-btn ${activeTab === "sections" ? "active" : ""}`}
        onClick={() => onTabChange("sections")}
      >
        <i className="fa-solid fa-chalkboard-user"></i>
        <span>Classes &amp; Sections</span>
        <span className="tab-badge">{sectionsCount}</span>
      </button>

      <button
        className={`tab-btn ${activeTab === "faculty" ? "active" : ""}`}
        onClick={() => onTabChange("faculty")}
      >
        <i className="fa-solid fa-user-check"></i>
        <span>Faculty Submissions</span>
        <span className="tab-badge">{facultyCount}</span>
      </button>

      <button
        className={`tab-btn ${activeTab === "directory" ? "active" : ""}`}
        onClick={() => onTabChange("directory")}
      >
        <i className="fa-solid fa-address-book"></i>
        <span>Student Lookup</span>
        <span className="tab-badge">{studentsCount}</span>
      </button>
    </nav>
  );
};
