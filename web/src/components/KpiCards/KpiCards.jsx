import React from "react";
import "./KpiCards.css";

export const KpiCards = ({ overview }) => {
  return (
    <section className="kpi-grid">
      {/* Card 1: Today Attendance Rate */}
      <div className="kpi-card blue">
        <div className="kpi-header">
          <span className="kpi-title">Campus Attendance</span>
          <div className="kpi-icon-box blue">
            <i className="fa-solid fa-chart-pie"></i>
          </div>
        </div>
        <div className="kpi-main">
          <span className="kpi-value">
            {overview ? `${overview.kpi.todayAttendanceRate}%` : "--"}
          </span>
          <span
            className={`kpi-badge ${(overview?.kpi.todayAttendanceRate || 0) >= 75 ? "safe" : "warning"}`}
          >
            Target 75%+
          </span>
        </div>
        <div className="kpi-footer">
          <span>Monthly Average:</span>
          <strong>{overview ? `${overview.kpi.monthlyAverageRate}%` : "--"}</strong>
        </div>
      </div>

      {/* Card 2: Today Present vs Absent */}
      <div className="kpi-card emerald">
        <div className="kpi-header">
          <span className="kpi-title">Students Status Today</span>
          <div className="kpi-icon-box emerald">
            <i className="fa-solid fa-users"></i>
          </div>
        </div>
        <div className="kpi-main">
          <span className="kpi-value" style={{ color: "var(--success)" }}>
            {overview ? overview.kpi.todayPresentCount : 0}
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>
            Present / {overview ? overview.kpi.todayAbsentCount : 0} Absent
          </span>
        </div>
        <div className="kpi-footer">
          <span>Total Enrolled:</span>
          <strong>{overview ? overview.kpi.totalStudents : 0} Students</strong>
        </div>
      </div>

      {/* Card 3: Submission Compliance */}
      <div className="kpi-card purple">
        <div className="kpi-header">
          <span className="kpi-title">Faculty Compliance</span>
          <div className="kpi-icon-box purple">
            <i className="fa-solid fa-clipboard-check"></i>
          </div>
        </div>
        <div className="kpi-main">
          <span className="kpi-value" style={{ color: "var(--purple)" }}>
            {overview ? `${overview.submissionCompliance.complianceRate}%` : "--"}
          </span>
          <span className="kpi-badge safe">
            {overview ? overview.submissionCompliance.submittedCount : 0} /{" "}
            {overview ? overview.submissionCompliance.totalClasses : 0} Submitted
          </span>
        </div>
        <div className="kpi-footer">
          <span>Pending Classes:</span>
          <strong style={{ color: (overview?.submissionCompliance.pendingCount || 0) > 0 ? "var(--danger)" : "var(--success)" }}>
            {overview ? `${overview.submissionCompliance.pendingCount} Sections` : "--"}
          </strong>
        </div>
      </div>
    </section>
  );
};
