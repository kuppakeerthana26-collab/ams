import React from "react";
import "./SiteDashboard.css";
import { KpiCards } from "../KpiCards/KpiCards.jsx";
import { AttendanceGraph } from "../AttendanceGraph/AttendanceGraph.jsx";

export const SiteDashboard = ({
  activeRole,
  selectedDate,
  overview,
  departments = [],
  sections = [],
  facultyStatus = [],
  trendsData,
  selectedDays = 14,
  onDaysChange,
  onNavigateTab,
  onSendReminder,
  onExportExcel,
  onExportDocx,
  onViewStudent,
}) => {
  const pendingFaculty = facultyStatus.filter((f) => !f.isSubmitted);

  return (
    <div className="site-dashboard-container">
      {/* 1. Executive 3-Card KPI Summary (Only on Site Dashboard) */}
      <KpiCards overview={overview} />

      {/* 2. Interactive Time-Series Attendance History Graph */}
      <AttendanceGraph
        trendsData={trendsData}
        selectedDays={selectedDays}
        onDaysChange={onDaysChange}
      />

      {/* 3. Operational Performance & Compliance Grid */}
      <div className="dashboard-grid-dual">
        {/* Left Column: Department Performance Summary */}
        <section className="white-section-card">
          <div className="section-card-header">
            <div>
              <h3 className="section-card-title">
                <i className="fa-solid fa-building-columns" style={{ color: "#2563eb", marginRight: "8px" }}></i>
                Department Attendance Snapshot
              </h3>
              <p className="section-card-desc">Real-time daily percentage and student strength</p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onNavigateTab && onNavigateTab("departments")}
            >
              View All
            </button>
          </div>

          <div className="dept-summary-list">
            {departments.length === 0 ? (
              <div className="empty-state-mini">
                <i className="fa-solid fa-inbox"></i>
                <span>No department data available.</span>
              </div>
            ) : (
              departments.slice(0, 5).map((dept) => {
                const isGood = dept.todayAttendanceRate >= 75;
                const isMed = dept.todayAttendanceRate >= 60 && dept.todayAttendanceRate < 75;
                const rateColor = isGood ? "#059669" : isMed ? "#d97706" : "#dc2626";

                return (
                  <div key={dept.code} className="dept-summary-row">
                    <div className="dept-badge-box">{dept.code}</div>
                    <div className="dept-info-box">
                      <div className="dept-name-line">
                        <span className="dept-name">{dept.name}</span>
                        <strong style={{ color: rateColor, fontSize: "14px" }}>
                          {dept.todayAttendanceRate}%
                        </strong>
                      </div>
                      <div className="dept-sub-line">
                        <span>{dept.totalStudents} Students</span>
                        <span>•</span>
                        <span>{dept.submittedSections}/{dept.totalSections} Sections Marked</span>
                      </div>
                      <div className="mini-progress-track">
                        <div
                          className="mini-progress-fill"
                          style={{
                            width: `${Math.min(100, Math.max(8, dept.todayAttendanceRate))}%`,
                            backgroundColor: rateColor,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Column: Faculty Submission Monitor */}
        <section className="white-section-card">
          <div className="section-card-header">
            <div>
              <h3 className="section-card-title">
                <i className="fa-solid fa-user-clock" style={{ color: "#7c3aed", marginRight: "8px" }}></i>
                Today's Submission Status
              </h3>
              <p className="section-card-desc">
                {pendingFaculty.length} pending register submissions for {selectedDate}
              </p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onNavigateTab && onNavigateTab("faculty")}
            >
              View Log
            </button>
          </div>

          <div className="pending-faculty-list">
            {pendingFaculty.length === 0 ? (
              <div className="all-submitted-state">
                <div className="all-submitted-icon">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <h4>100% Submission Completed</h4>
                <p>All faculty members have submitted their attendance registers for today!</p>
              </div>
            ) : (
              pendingFaculty.slice(0, 5).map((fac) => (
                <div key={fac._id || fac.email} className="pending-faculty-item">
                  <div className="fac-avatar">{fac.name ? fac.name.charAt(0) : "F"}</div>
                  <div className="fac-info">
                    <span className="fac-name">{fac.name}</span>
                    <span className="fac-class">{fac.assignedClass || "Class In-Charge"}</span>
                  </div>
                  <button
                    className="btn btn-outline btn-sm remind-btn"
                    onClick={() => onSendReminder && onSendReminder(fac.name)}
                  >
                    <i className="fa-solid fa-bell"></i> Remind
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* 4. Quick Action Toolbar */}
      <div className="dashboard-quick-actions">
        <button className="btn btn-primary" onClick={onExportDocx}>
          <i className="fa-solid fa-file-word"></i> Download Shortage Report (.docx)
        </button>
        <button className="btn btn-outline" onClick={onExportExcel}>
          <i className="fa-solid fa-file-excel"></i> Export Monthly Excel
        </button>
        <button className="btn btn-outline" onClick={() => onNavigateTab && onNavigateTab("branches")}>
          <i className="fa-solid fa-code-branch"></i> Branch Defaulters Hub
        </button>
        <button className="btn btn-outline" onClick={() => onNavigateTab && onNavigateTab("directory")}>
          <i className="fa-solid fa-address-book"></i> Student Directory
        </button>
      </div>
    </div>
  );
};
export default SiteDashboard;
