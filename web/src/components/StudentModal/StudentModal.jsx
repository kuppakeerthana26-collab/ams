import React from "react";
import "./StudentModal.css";

export const StudentModal = ({ student, onClose, onOpenNotice }) => {
  if (!student) return null;

  const rate = student.attendanceRate !== undefined ? student.attendanceRate : 0;
  const isSafe = rate >= 75;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">
            <i className="fa-solid fa-user-graduate" style={{ color: "#2563eb", marginRight: "8px" }}></i>
            Student Attendance Dossier
          </span>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Header Identity Box */}
          <div className="modal-student-identity">
            <div>
              <h3 className="modal-student-name">{student.name}</h3>
              <p className="modal-student-sub">
                Roll No: <strong>{student.rollNo}</strong> • Class: <strong>{student.className}</strong>
              </p>
              <p className="modal-student-phone">
                <i className="fa-solid fa-phone" style={{ marginRight: "4px" }}></i>
                Parent Phone: {student.parentPhone || "Not set"}
              </p>
            </div>
            <div className="modal-rate-badge-box">
              <div className={`status-pill ${isSafe ? "safe" : "danger"} modal-rate-pill`}>
                {rate}%
              </div>
              <span className="modal-rate-sub">Overall Attendance</span>
            </div>
          </div>

          {/* 3 Metric Summary Boxes */}
          <div className="modal-metrics-grid">
            <div className="modal-metric-card">
              <span className="label">TOTAL CONDUCTED</span>
              <div className="value total">{student.totalClasses || 0}</div>
            </div>
            <div className="modal-metric-card">
              <span className="label">PRESENT</span>
              <div className="value present">{student.attendedClasses || 0}</div>
            </div>
            <div className="modal-metric-card">
              <span className="label">MISSED / ABSENT</span>
              <div className="value absent">{student.absentClasses || 0}</div>
            </div>
          </div>

          {/* Recent Attendance Entries */}
          <div className="modal-history-section">
            <h4 className="modal-history-title">Recent Attendance Log</h4>
            {!student.history || student.history.length === 0 ? (
              <p className="modal-history-empty">
                No individual session logs found for this student.
              </p>
            ) : (
              <div className="table-responsive modal-history-table-wrap">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.history.map((h, i) => (
                      <tr key={i}>
                        <td>{h.date}</td>
                        <td>
                          <span
                            className={`status-pill ${h.status === "P" ? "safe" : "danger"}`}
                          >
                            {h.status === "P" ? "PRESENT" : "ABSENT"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-outline"
            onClick={() => onOpenNotice && onOpenNotice(student)}
          >
            <i className="fa-brands fa-whatsapp" style={{ color: "#25D366" }}></i> Send Trilingual Notice
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default StudentModal;
