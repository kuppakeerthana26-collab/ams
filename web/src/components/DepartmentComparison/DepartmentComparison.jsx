import React from "react";
import "./DepartmentComparison.css";

export const DepartmentComparison = ({ departments = [], onInspectDept }) => {
  return (
    <section className="content-card">
      <div className="content-card-header">
        <div className="card-title-group">
          <h2 className="card-title">
            <i className="fa-solid fa-building-columns" style={{ color: "#2563eb", marginRight: "8px" }}></i>
            Campus Department Performance Matrix
          </h2>
          <span className="card-subtitle">
            Comparative attendance rates, enrolled strength, and daily submission compliance
          </span>
        </div>
      </div>

      <div className="departments-grid">
        {departments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-box">
              <i className="fa-solid fa-building"></i>
            </div>
            <span className="empty-title">No Departments Found</span>
            <span className="empty-subtitle">
              No departmental statistics are currently available for this date.
            </span>
          </div>
        ) : (
          departments.map((dept) => {
            const isHigh = dept.todayAttendanceRate >= 75;
            const isMedium = dept.todayAttendanceRate >= 60 && dept.todayAttendanceRate < 75;
            const statusClass = isHigh ? "high" : isMedium ? "medium" : "low";
            const badgeColorClass = isHigh ? "safe" : isMedium ? "warning" : "danger";

            return (
              <div key={dept.code} className="dept-card">
                <div className="dept-card-top">
                  <div className="dept-card-identity">
                    <div className="dept-badge-icon">{dept.code}</div>
                    <div className="dept-title-box">
                      <span className="dept-title">{dept.name}</span>
                      <span className="dept-hod-name">
                        <i className="fa-solid fa-user-tie" style={{ marginRight: "4px" }}></i>
                        HOD: {dept.hodName}
                      </span>
                    </div>
                  </div>
                  <div className={`status-pill ${badgeColorClass}`}>
                    {dept.todayAttendanceRate}%
                  </div>
                </div>

                <div className="dept-progress-section">
                  <div className="dept-rate-label-row">
                    <span className="label">Today's Rate</span>
                    <span className="value">
                      {dept.todayAttendanceRate}% (Monthly: {dept.monthlyAverageRate}%)
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-bar ${statusClass}`}
                      style={{
                        width: `${Math.min(100, Math.max(8, dept.todayAttendanceRate))}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="dept-metrics-row">
                  <div className="dept-metric-item">
                    <span>Students</span>
                    <strong>{dept.totalStudents}</strong>
                  </div>
                  <div className="dept-metric-item">
                    <span>Sections</span>
                    <strong>{dept.totalSections}</strong>
                  </div>
                  <div className="dept-metric-item">
                    <span>Submitted</span>
                    <strong
                      style={{
                        color: dept.pendingSections > 0 ? "#d97706" : "#059669",
                      }}
                    >
                      {dept.submittedSections}/{dept.totalSections}
                    </strong>
                  </div>
                </div>

                <button
                  className="btn btn-outline inspect-btn"
                  onClick={() => onInspectDept && onInspectDept(dept.code)}
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <span>Inspect {dept.code} Classes</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
export default DepartmentComparison;
