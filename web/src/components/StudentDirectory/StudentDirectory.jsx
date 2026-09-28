import React from "react";
import "./StudentDirectory.css";

export const StudentDirectory = ({
  students = [],
  searchQuery = "",
  onSearchChange,
  onViewStudent,
}) => {
  return (
    <section className="content-card">
      <div className="content-card-header">
        <div className="card-title-group">
          <h2 className="card-title">
            <i className="fa-solid fa-address-book" style={{ color: "#2563eb", marginRight: "8px" }}></i>
            Student Enrollment &amp; Attendance Directory
          </h2>
          <span className="card-subtitle">
            Direct student lookup by Roll Number, Name, or Section
          </span>
        </div>

        <div className="card-actions-group">
          <div className="search-input-wrap">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Search Roll No or Name (e.g. 24F81A0532)..."
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Total Sessions</th>
              <th>Attended</th>
              <th>Attendance %</th>
              <th>Parent Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <div className="empty-state">
                    <div className="empty-icon-box">
                      <i className="fa-solid fa-user-graduate"></i>
                    </div>
                    <span className="empty-title">No Students Found</span>
                    <span className="empty-subtitle">
                      No students matched your search filter.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((st) => {
                const rate = st.attendanceRate !== undefined ? st.attendanceRate : 0;
                const rateClass = rate >= 75 ? "safe" : rate >= 50 ? "warning" : "danger";

                return (
                  <tr key={st._id || st.rollNo}>
                    <td>
                      <strong className="roll-number-code">{st.rollNo}</strong>
                    </td>
                    <td>
                      <span className="student-name-text">{st.name}</span>
                    </td>
                    <td>
                      <span className="student-class-text">{st.className}</span>
                    </td>
                    <td>{st.totalClasses || 0}</td>
                    <td>
                      <strong style={{ color: "#059669" }}>{st.attendedClasses || 0}</strong>
                    </td>
                    <td>
                      <span className={`status-pill ${rateClass}`}>{rate}%</span>
                    </td>
                    <td>
                      <a href={`tel:${st.parentPhone}`} className="parent-phone-link">
                        <i className="fa-solid fa-phone"></i>
                        {st.parentPhone || "Not set"}
                      </a>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onViewStudent && onViewStudent(st._id)}
                      >
                        <i className="fa-solid fa-id-card"></i> View Profile
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
export default StudentDirectory;
