import React from "react";
import "./SectionMatrix.css";

export const SectionMatrix = ({ sections = [], selectedDate, onViewRoster }) => {
  return (
    <section className="content-card">
      <div className="content-card-header">
        <div className="card-title-group">
          <h2 className="card-title">
            <i className="fa-solid fa-chalkboard-user" style={{ color: "#2563eb", marginRight: "8px" }}></i>
            Class-wise Attendance Registers ({selectedDate})
          </h2>
          <span className="card-subtitle">
            Live submission state, assigned faculty in-charge, and present/absent counts
          </span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Class / Section</th>
              <th>Assigned Faculty</th>
              <th>Enrolled</th>
              <th>Status Today</th>
              <th>Present / Absent</th>
              <th>Attendance Rate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <div className="empty-icon-box">
                      <i className="fa-solid fa-inbox"></i>
                    </div>
                    <span className="empty-title">No Sections Found</span>
                    <span className="empty-subtitle">
                      No classes matched the current department filter or date.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              sections.map((sec) => (
                <tr key={sec.className}>
                  <td>
                    <span className="section-tag">{sec.className}</span>
                  </td>
                  <td>
                    <div className="faculty-cell">
                      <span className="faculty-name">{sec.facultyName}</span>
                      <span className="faculty-email">
                        {sec.facultyEmail || "Class In-Charge"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <strong>{sec.enrolledCount}</strong> Students
                  </td>
                  <td>
                    {sec.isSubmitted ? (
                      <span className="status-pill safe">
                        <i className="fa-solid fa-check"></i> Submitted
                      </span>
                    ) : (
                      <span className="status-pill warning">
                        <i className="fa-solid fa-clock"></i> Pending
                      </span>
                    )}
                  </td>
                  <td>
                    {sec.isSubmitted ? (
                      <span>
                        <strong style={{ color: "#059669" }}>{sec.presentCount} P</strong> /{" "}
                        <strong style={{ color: "#dc2626" }}>{sec.absentCount} A</strong>
                      </span>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>Not marked yet</span>
                    )}
                  </td>
                  <td>
                    <div className="rate-cell">
                      <strong className="rate-value">
                        {sec.isSubmitted ? `${sec.attendanceRate}%` : "--"}
                      </strong>
                      {sec.isSubmitted && (
                        <div className="rate-track">
                          <div
                            className="rate-fill"
                            style={{
                              width: `${sec.attendanceRate}%`,
                              backgroundColor:
                                sec.attendanceRate >= 75 ? "#059669" : "#dc2626",
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => onViewRoster && onViewRoster(sec.className)}
                    >
                      <i className="fa-solid fa-users-viewfinder"></i> View Roster
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
export default SectionMatrix;
