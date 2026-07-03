import './DashboardPage.css'

const attendanceRows = [
  { rollNo: '01', name: 'Student Name', status: 'Present' },
  { rollNo: '02', name: 'Student Name', status: 'Absent' },
  { rollNo: '03', name: 'Student Name', status: 'Present' },
  { rollNo: '04', name: 'Student Name', status: 'Present' },
  { rollNo: '05', name: 'Student Name', status: 'Absent' },
]

function DashboardPage({ teacher, onLogout }) {
  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Attendance overview</h1>
        </div>
        <div className="class-summary">
          <span>Assigned Class</span>
          <strong>
            {teacher.assignedClass.branch} {teacher.assignedClass.year}{' '}
            {teacher.assignedClass.section}
          </strong>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-heading">
            <h2>Attendance List</h2>
            <span>Today</span>
          </div>

          <ul className="attendance-list-view">
            {attendanceRows.map((student) => (
              <li key={student.rollNo}>
                <div>
                  <strong>{student.rollNo}</strong>
                  <span>{student.name}</span>
                </div>
                <span className={`status ${student.status.toLowerCase()}`}>
                  {student.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashboard-panel">
          <div className="panel-heading">
            <h2>Sheet View</h2>
            <span>Class register</span>
          </div>

          <div className="sheet-wrap">
            <table className="attendance-sheet">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRows.map((student) => (
                  <tr key={student.rollNo}>
                    <td>{student.rollNo}</td>
                    <td>{student.name}</td>
                    <td>{student.status}</td>
                    <td>-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="dashboard-teacher">
        <div>
          <p className="eyebrow">Teacher Details</p>
          <h2>{teacher.name}</h2>
          <p>{teacher.email}</p>
          <p>
            Class: {teacher.assignedClass.branch} {teacher.assignedClass.year}{' '}
            {teacher.assignedClass.section}
          </p>
        </div>

        <button type="button" onClick={onLogout}>
          Logout
        </button>
      </section>
    </main>
  )
}

export default DashboardPage
