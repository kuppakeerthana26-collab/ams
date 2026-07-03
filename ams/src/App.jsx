import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Download,
  LogOut,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { api } from './services/api.js'
import { clearUserSession, getSavedUser, saveUserSession } from './utils/session.js'
import './App.css'

const today = () => new Date().toISOString().slice(0, 10)
const classFromUser = (user) =>
  user?.assignedClass
    ? `${user.assignedClass.branch}_${user.assignedClass.year}_${user.assignedClass.section}`
    : ''

function App() {
  const [user, setUser] = useState(getSavedUser)
  const [view, setView] = useState('attendance')
  const [toast, setToast] = useState('')

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 4000)
  }

  const logout = () => {
    clearUserSession()
    setUser(null)
  }

  if (!user) {
    return <AuthScreen onAuth={(data) => { saveUserSession(data); setUser(data.user) }} />
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <strong>College AMS</strong>
          <span>{user.role === 'admin' ? 'Admin Console' : classFromUser(user)}</span>
        </div>
        <nav>
          <button className={view === 'attendance' ? 'active' : ''} onClick={() => setView('attendance')}>
            <Save size={17} /> Attendance
          </button>
          {user.role === 'admin' && (
            <>
              <button className={view === 'students' ? 'active' : ''} onClick={() => setView('students')}>
                <Users size={17} /> Students
              </button>
              <button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}>
                <BarChart3 size={17} /> Admin
              </button>
            </>
          )}
          <button onClick={logout} title="Logout">
            <LogOut size={17} />
          </button>
        </nav>
      </header>

      {toast && <div className="toast">{toast}</div>}
      {view === 'attendance' && <AttendanceView user={user} onToast={showToast} />}
      {view === 'students' && <StudentsView onToast={showToast} />}
      {view === 'admin' && <AdminView />}
    </div>
  )
}

function AuthScreen({ onAuth }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const payload = { email: form.email, password: form.password }
      onAuth(await api.login(payload))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <div className="brand-mark"><ShieldCheck size={28} /></div>
        <h1>College AMS</h1>
        <p>Secure attendance register for teachers, admins, parents, and records.</p>
        <form onSubmit={submit}>
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="form-error">{error}</p>}
          <button className="primary" disabled={busy}>{busy ? 'Please wait...' : 'Login'}</button>
        </form>
      </section>
    </main>
  )
}

function AttendanceView({ user, onToast }) {
  const defaultClass = classFromUser(user)
  const [className, setClassName] = useState(defaultClass)
  const [date, setDate] = useState(today())
  const [students, setStudents] = useState([])
  const [marks, setMarks] = useState({})
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadRegister = async () => {
    setLoading(true)
    try {
      const data = await api.attendanceRegister({ className, date })
      setStudents(data.students)
      setLocked(data.locked)
      const existing = {}
      data.submission?.entries?.forEach((entry) => { existing[entry.student] = entry.status })
      setMarks(existing)
    } catch (err) {
      onToast(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (className) loadRegister()
  }, [className, date])

  const days = useMemo(() => Array.from({ length: 31 }, (_, index) => index + 1), [])
  const currentDay = new Date(`${date}T00:00:00`).getDate()

  const setAll = (status) => {
    const next = {}
    students.forEach((student) => { next[student._id] = status })
    setMarks(next)
  }

  const submit = async () => {
    const entries = students.map((student) => ({ studentId: student._id, status: marks[student._id] || 'P' }))
    try {
      const data = await api.submitAttendance({ className, date, entries })
      setLocked(true)
      onToast(`Submitted. ${data.absentees.length} absentee notifications processed.`)
    } catch (err) {
      onToast(err.message)
    }
  }

  return (
    <main className="page">
      <section className="toolbar">
        <div>
          <h1>Attendance Register</h1>
          <p>Rows are students, columns are days of the month. Today's column is editable.</p>
        </div>
        <div className="toolbar-actions">
          <input value={className} onChange={(e) => setClassName(e.target.value)} disabled={user.role !== 'admin'} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button onClick={() => setAll('P')} disabled={locked}>All P</button>
          <button onClick={() => setAll('A')} disabled={locked}>All A</button>
          <button className="primary" onClick={submit} disabled={locked || loading || students.length === 0}>
            <Save size={17} /> {locked ? 'Locked' : 'Submit'}
          </button>
        </div>
      </section>

      <section className="register-wrap">
        <table className="register-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              {days.map((day) => <th key={day} className={day === currentDay ? 'today' : ''}>{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.rollNo}</td>
                <td>{student.name}</td>
                {days.map((day) => (
                  <td key={day} className={day === currentDay ? 'today mark-cell' : 'mark-cell'}>
                    {day === currentDay ? (
                      <button
                        disabled={locked}
                        className={marks[student._id] === 'A' ? 'absent' : 'present'}
                        onClick={() => setMarks({ ...marks, [student._id]: marks[student._id] === 'A' ? 'P' : 'A' })}
                      >
                        {marks[student._id] || 'P'}
                      </button>
                    ) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!students.length && <div className="empty-state">No active students found for {className}.</div>}
      </section>
    </main>
  )
}

function StudentsView({ onToast }) {
  const [query, setQuery] = useState({ className: '', search: '' })
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({ rollNo: '', name: '', className: '', parentPhone: '' })

  const load = async () => {
    try {
      const data = await api.students(query)
      setStudents(data.students)
    } catch (err) {
      onToast(err.message)
    }
  }

  useEffect(() => { load() }, [])

  const create = async (event) => {
    event.preventDefault()
    try {
      await api.createStudent(form)
      setForm({ rollNo: '', name: '', className: form.className, parentPhone: '' })
      await load()
      onToast('Student saved')
    } catch (err) {
      onToast(err.message)
    }
  }

  return (
    <main className="page grid-page">
      <section className="panel">
        <h1>Student Management</h1>
        <form className="student-form" onSubmit={create}>
          <input placeholder="Roll number" value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} />
          <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Class e.g. CSE_1_A" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
          <input placeholder="Parent WhatsApp +919876543210" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} />
          <button className="primary"><Plus size={17} /> Add student</button>
        </form>
      </section>
      <section className="panel">
        <div className="search-row">
          <input placeholder="Class" value={query.className} onChange={(e) => setQuery({ ...query, className: e.target.value })} />
          <input placeholder="Search" value={query.search} onChange={(e) => setQuery({ ...query, search: e.target.value })} />
          <button onClick={load}><Search size={17} /></button>
        </div>
        <div className="list">
          {students.map((student) => (
            <div key={student._id} className="list-row">
              <strong>{student.rollNo}</strong>
              <span>{student.name}</span>
              <small>{student.className} · {student.parentPhone}</small>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

function AdminView() {
  const [className, setClassName] = useState('')
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])

  const load = async () => {
    const [statsData, historyData] = await Promise.all([
      api.statistics(className ? { className } : {}),
      api.absentees(className ? { className } : {}),
    ])
    setStats(statsData.stats)
    setHistory(historyData.history)
  }

  useEffect(() => { load() }, [])

  const download = async () => {
    const blob = await api.downloadReport(className ? { className } : {})
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'attendance-report.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="page">
      <section className="toolbar">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Statistics, absentee history, Google Sheets view, and CSV reports.</p>
        </div>
        <div className="toolbar-actions">
          <input placeholder="Filter class" value={className} onChange={(e) => setClassName(e.target.value)} />
          <button onClick={load}><Search size={17} /></button>
          <button className="primary" onClick={download}>
            <Download size={17} /> CSV
          </button>
        </div>
      </section>
      {stats && (
        <section className="stats-grid">
          <Metric label="Students" value={stats.students} />
          <Metric label="Submissions" value={stats.submissions} />
          <Metric label="Present %" value={`${stats.presentPercent}%`} />
          <Metric label="Failed WhatsApp" value={stats.failedMessages} />
        </section>
      )}
      <section className="panel">
        <h2>Absentee History</h2>
        <div className="list">
          {history.map((item, index) => (
            <div key={`${item.date}-${item.rollNo}-${index}`} className="list-row">
              <strong>{item.rollNo}</strong>
              <span>{item.name}</span>
              <small>{item.className} · {item.date}</small>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default App
