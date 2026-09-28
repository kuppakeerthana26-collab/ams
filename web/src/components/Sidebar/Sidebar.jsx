import React from "react";
import "./Sidebar.css";

export const Sidebar = ({
  activeTab,
  onTabChange,
  activeRole,
  overview,
  departmentsCount,
  sectionsCount,
  facultyCount,
  studentsCount,
  isOpen,
  onClose,
}) => {
  const attendanceRate = overview?.kpi?.todayAttendanceRate || 0;

  const navItems = [
    {
      id: "site_dashboard",
      label: "Site Dashboard",
      icon: "fa-solid fa-chart-line",
      section: "CORE ANALYTICS",
    },
    {
      id: "branches",
      label: "Branch Intelligence",
      icon: "fa-solid fa-code-branch",
      badge: departmentsCount || 5,
    },
    {
      id: "departments",
      label: "Department Matrix",
      icon: "fa-solid fa-building-columns",
      badge: departmentsCount,
    },
    {
      id: "sections",
      label: "Classes & Sections",
      icon: "fa-solid fa-chalkboard-user",
      badge: sectionsCount,
    },
    {
      id: "directory",
      label: "Student Lookup",
      icon: "fa-solid fa-address-book",
      badge: studentsCount,
      section: "STUDENT RECORDS",
    },
    {
      id: "faculty",
      label: "Faculty Submissions",
      icon: "fa-solid fa-user-check",
      badge: facultyCount,
      section: "ACADEMIC AUDIT",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}

      <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
        {/* Top College Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/college-logo.png" alt="GKCE College Logo" className="sidebar-logo-img" />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">GKCE SULLURPETA</span>
            <span className="sidebar-brand-badge">
              <span className="sidebar-pulse-dot"></span>
              AMS Leadership
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <React.Fragment key={item.id}>
                {item.section && (
                  <span className="sidebar-section-label">{item.section}</span>
                )}
                <button
                  className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    onTabChange(item.id);
                    if (onClose) onClose();
                  }}
                >
                  <div className="sidebar-nav-left">
                    <i className={`${item.icon} sidebar-nav-icon`}></i>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`sidebar-badge ${item.badgeClass || ""}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Quick Pulse Widget */}
        <div className="sidebar-pulse-card">
          <div className="sidebar-pulse-header">
            <span>Campus Live Pulse</span>
            <i className="fa-solid fa-satellite-dish" style={{ color: "var(--primary)" }}></i>
          </div>
          <div className="sidebar-pulse-rate">
            {attendanceRate}%
            <span>{attendanceRate >= 75 ? "• Optimal" : "• Attention"}</span>
          </div>
          <div className="sidebar-pulse-bar">
            <div
              className="sidebar-pulse-fill"
              style={{ width: `${Math.min(100, Math.max(5, attendanceRate))}%` }}
            ></div>
          </div>
        </div>

        {/* Footer User Profile Card */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {activeRole?.avatar || "U"}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name" title={activeRole?.name}>
                {activeRole?.name}
              </span>
              <span className="sidebar-user-role">
                {activeRole?.roleTag}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
