import './TeacherCard.css'

function TeacherCard({ teacher, onLogout }) {
  // Handle both the legacy nested structure and the new flattened one
  const assignedClass = teacher?.assignedClass
    ? teacher.assignedClass
    : teacher?.branch && teacher?.year && teacher?.section
      ? { branch: teacher.branch, year: teacher.year, section: teacher.section }
      : null

  return (
    <section className="teacher-card">
      <div>
        <h2>Teacher</h2>
        <p>Name: {teacher.name}</p>
        <p>Email: {teacher.email}</p>
        <p>
          Class: {teacher.assignedClass.branch} {teacher.assignedClass.year}{' '}
          {teacher.assignedClass.section}
        </p>
      </div>

      <button type="button" onClick={onLogout}>
        Logout
      </button>
    </section>
  )
}

export default TeacherCard
