import React from "react";
import "./FacultyLog.css";

export const FacultyLog = ({ facultyStatus = [], selectedDate, onSendReminder }) => {
  return (
    <section className="content-card">
      <div className="content-card-header">
        <div className="card-title-group">
          <h2 className="card-title">
            <i className="fa-solid fa-user-check" style={{ color: "#2563eb", marginRight: "8px" }}></i>
            Faculty Attendance Submission Audit Log ({selectedDate})
          </h2>
          <span className="card-subtitle">
            Real-time monitoring of attendance marked by class teachers
          </span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Teacher Name</th>
              <th>Email Address</th>
              <th>Assigned Class</th>
              <th>Submission Status</th>
              <th>Submission Time</th>
              <th>Register Lock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {facultyStatus.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <div className="empty-icon-box">
                      <i className="fa-solid fa-user-xmark"></i>
                    </div>
                    <span className="empty-title">No Faculty Records</span>
                    <span className="empty-subtitle">
                      No faculty accounts are registered in the current system.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              facultyStatus.map((fac) => (
                <tr key={fac._id || fac.email}>
                  <td>
                    <div className="fac-row-identity">
                      <div className="fac-initials-badge">
                        {fac.name ? fac.name.charAt(0) : "F"}
                      </div>
                      <span className="fac-full-name">{fac.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="fac-email-text">{fac.email}</span>
                  </td>
                  <td>
                    <span className="fac-class-tag">
                      {fac.assignedClass || "Unassigned"}
                    </span>
                  </td>
                  <td>
                    {fac.isSubmitted ? (
                      <span className="status-pill safe">
                        <i className="fa-solid fa-circle-check"></i> Marked Today
                      </span>
                    ) : (
                      <span className="status-pill warning">
                        <i className="fa-solid fa-clock"></i> Pending
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="fac-time-text">
                      {fac.submittedAt
                        ? new Date(fac.submittedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--"}
                    </span>
                  </td>
                  <td>
                    {fac.isSubmitted ? (
                      <span className="lock-status locked">
                        <i className="fa-solid fa-lock"></i> Locked
                      </span>
                    ) : (
                      <span className="lock-status unlocked">
                        <i className="fa-solid fa-lock-open"></i> Unlocked
                      </span>
                    )}
                  </td>
                  <td>
                    {!fac.isSubmitted && (
                      <button
                        className="btn btn-outline btn-sm reminder-btn"
                        onClick={() => onSendReminder && onSendReminder(fac.name)}
                      >
                        <i className="fa-solid fa-bell"></i> Send Reminder
                      </button>
                    )}
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
export default FacultyLog;
