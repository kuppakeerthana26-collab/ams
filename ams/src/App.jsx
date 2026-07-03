import { useEffect, useState } from 'react'
import {
  AlertCircle,
  BarChart3,
  BellRing,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Download,
  HelpCircle,
  LogOut,
  Menu,
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
const dashboardDates = () => {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  return {
    today: now.toISOString().slice(0, 10),
    yesterday: yesterday.toISOString().slice(0, 10),
  }
}
const classFromUser = (user) =>
  user?.assignedClass
    ? `${user.assignedClass.branch}_${user.assignedClass.year}_${user.assignedClass.section}`
    : ''
const userInitial = (user) => (user?.name || user?.email || 'U').trim().charAt(0).toUpperCase()

const getPageTitle = (view) => ({
  dashboard: 'Dashboard',
  attendance: 'Attendance',
  students: 'Students',
  admin: 'Reports',
  help: 'Help',
}[view] || 'Dashboard')

function App() {
  const [user, setUser] = useState(getSavedUser)
  const [view, setView] = useState('dashboard')
  const [toast, setToast] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 4000)
  }

  const logout = () => {
    clearUserSession()
    setUser(null)
  }

  const canManage = user.role === 'admin' || user.role === 'hod'

  const navigate = (nextView) => {
    setView(nextView)
    setSidebarOpen(false)
  }

  if (!user) {
    return <AuthScreen onAuth={(data) => { saveUserSession(data); setUser(data.user) }} />
  }

  return (
    <div className="app-shell">
      <aside className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand-block">
          <div className="brand-icon"><BookOpenCheck size={24} /></div>
          <div>
            <strong>College AMS</strong>
            <span>{canManage ? 'Academic Administration Console' : classFromUser(user)}</span>
          </div>
        </div>
        <nav className="side-nav" aria-label="Primary navigation">
          <button className={view === 'dashboard' ? 'active' : ''} onClick={() => navigate('dashboard')}>
            <BarChart3 size={18} /> <span>Dashboard</span>
          </button>
          <button className={view === 'attendance' ? 'active' : ''} onClick={() => navigate('attendance')}>
            <Save size={18} /> <span>Attendance</span>
          </button>
          {canManage && (
            <>
              <button className={view === 'students' ? 'active' : ''} onClick={() => navigate('students')}>
                <Users size={18} /> <span>Students</span>
              </button>
              <button className={view === 'admin' ? 'active' : ''} onClick={() => navigate('admin')}>
                <Download size={18} /> <span>Reports</span>
              </button>
            </>
          )}
          <button className={view === 'help' ? 'active' : ''} onClick={() => navigate('help')}>
            <HelpCircle size={18} /> <span>Help</span>
          </button>
        </nav>

        <div className="sidebar-profile">
          <div className="person-avatar">{userInitial(user)}</div>
          <div>
            <strong>{user.name || 'User'}</strong>
            <span>{user.role.toUpperCase()}</span>
          </div>
          <button onClick={logout} title="Logout" aria-label="Logout">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}

      <div className="main-shell">
        <header className="mobile-topbar">
          <button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
            <Menu size={20} />
          </button>
          <div>
            <strong>{getPageTitle(view)}</strong>
            <span>{canManage ? `${user.role.toUpperCase()} Console` : classFromUser(user)}</span>
          </div>
          <div className="person-avatar compact">{userInitial(user)}</div>
        </header>

        {toast && <div className="toast">{toast}</div>}
        {view === 'dashboard' && <DashboardView user={user} onToast={showToast} onNavigate={navigate} />}
        {view === 'attendance' && <AttendanceView user={user} onToast={showToast} />}
        {view === 'students' && <StudentsView onToast={showToast} />}
        {view === 'admin' && <AdminView />}
        {view === 'help' && <HelpView />}
      </div>
    </div>
  )
}

function AuthScreen({ onAuth }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      onAuth(await api.login({ email: form.email, password: form.password }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-hero">
        <div className="brand-lockup">
          <div className="brand-icon large"><BookOpenCheck size={34} /></div>
          <span>College Attendance Monitoring System</span>
        </div>
        <h1>Campus attendance, without the spreadsheet mess.</h1>
        <p>Mark registers, review students, notify parents, and export reports from a focused academic workspace.</p>
        <div className="auth-highlights">
          <span><CheckCircle2 size={16} /> Daily locks</span>
          <span><BellRing size={16} /> Parent alerts</span>
          <span><ShieldCheck size={16} /> Admin audit</span>
        </div>
      </section>
      <section className="auth-panel">
        <div className="brand-mark"><ShieldCheck size={28} /></div>
        <h2>Sign in</h2>
        <p>Use your institutional account to continue.</p>
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

function DashboardView({ user, onToast, onNavigate }) {
  const defaultClass = classFromUser(user)
  const canManage = user.role === 'admin' || user.role === 'hod'
  const [className, setClassName] = useState(defaultClass)
  const [stats, setStats] = useState(null)
  const [absentees, setAbsentees] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [absenteeDay, setAbsenteeDay] = useState('today')
  const [presenteeDay, setPresenteeDay] = useState('today')
  const [dateFilters] = useState(dashboardDates)

  const load = async () => {
    try {
      const params = className ? { className } : {}
      const [statsData, historyData] = await Promise.all([
        api.statistics(params),
        api.absentees(params),
      ])
      setStats(statsData.stats)
      setSubmissions(statsData.recentSubmissions || [])
      setAbsentees(historyData.history)
    } catch (err) {
      onToast(err.message)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedAbsenteeDate = dateFilters[absenteeDay]
  const filteredAbsentees = absentees.filter((item) => item.date === selectedAbsenteeDate)
  const selectedPresenteeDate = dateFilters[presenteeDay]
  const selectedSubmission = submissions.find((submission) => submission.date === selectedPresenteeDate)
  const filteredPresentees = selectedSubmission?.entries?.filter((entry) => entry.status === 'P') || []

  return (
    <main className="page dashboard-page">
      <section className="hero-panel">
        <div>
          <h1>Dashboard</h1>
          <p>Track students, attendance completion, absentees, and reports from a single workspace.</p>
        </div>
        <div className="hero-actions">
          <input placeholder="Class e.g. CSE_1_A" value={className} onChange={(e) => setClassName(e.target.value)} disabled={!canManage} />
          <button onClick={load}><Search size={17} /> Refresh</button>
          <button className="primary" onClick={() => onNavigate('attendance')}><Save size={17} /> Mark attendance</button>
        </div>
      </section>

      <section className="stats-grid">
        <Metric icon={<Users size={18} />} label="Students" value={stats?.students ?? 0} />
        <Metric icon={<Save size={18} />} label="Submissions" value={stats?.submissions ?? 0} />
        <Metric icon={<CheckCircle2 size={18} />} label="Present rate" value={`${stats?.presentPercent ?? 0}%`} />
        <Metric icon={<BellRing size={18} />} label="Failed alerts" value={stats?.failedMessages ?? 0} />
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-title">
            <div>
              <h2>Presentees</h2>
              <p>{selectedPresenteeDate}</p>
            </div>
            <div className="segmented-control" aria-label="Presentee date filter">
              <button className={presenteeDay === 'today' ? 'active' : ''} onClick={() => setPresenteeDay('today')}>Today</button>
              <button className={presenteeDay === 'yesterday' ? 'active' : ''} onClick={() => setPresenteeDay('yesterday')}>Yesterday</button>
            </div>
          </div>
          <div className="presentee-grid">
            {filteredPresentees.map((item, index) => (
              <div className="activity-item" key={`${selectedPresenteeDate}-${item.rollNo}-${index}`}>
                <div className="avatar success">{item.rollNo}</div>
                <div>
                  <strong>{item.name}</strong>
                  <span>Present / {selectedSubmission.className}</span>
                </div>
              </div>
            ))}
            {!filteredPresentees.length && <div className="empty-state slim">No presentees found for {presenteeDay}.</div>}
          </div>
        </div>
        <div className="panel">
          <div className="panel-title">
            <div>
              <h2>Absentees</h2>
              <p>{selectedAbsenteeDate}</p>
            </div>
            <div className="segmented-control" aria-label="Absentee date filter">
              <button className={absenteeDay === 'today' ? 'active' : ''} onClick={() => setAbsenteeDay('today')}>Today</button>
              <button className={absenteeDay === 'yesterday' ? 'active' : ''} onClick={() => setAbsenteeDay('yesterday')}>Yesterday</button>
            </div>
          </div>
          <div className="activity-list">
            {filteredAbsentees.map((item, index) => (
              <div className="activity-item" key={`${item.date}-${item.rollNo}-${index}`}>
                <div className="avatar danger">{item.rollNo}</div>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.className} / {item.date}</span>
                </div>
              </div>
            ))}
            {!filteredAbsentees.length && <div className="empty-state slim">No absentees found for {absenteeDay}.</div>}
          </div>
        </div>
      </section>
    </main>
  )
}

function AttendanceView({ user, onToast }) {
  const defaultClass = classFromUser(user)
  const canManage = user.role === 'admin' || user.role === 'hod'
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (className) loadRegister()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [className, date])

  const presentCount = students.filter((student) => (marks[student._id] || 'P') === 'P').length
  const absentCount = students.length - presentCount
  const completion = students.length ? Math.round((Object.keys(marks).length / students.length) * 100) : 0

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

  const downloadSheet = async () => {
    try {
      const blob = await api.downloadAttendanceSheet({ className, date })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${className || 'class'}-${date}-attendance.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      onToast(err.message)
    }
  }

  return (
    <main className="page">
      <section className="hero-panel">
        <div>
          <h1>Attendance</h1>
          <p>Use the student list to mark present or absent. Submit once to lock the day and trigger parent alerts.</p>
        </div>
        <div className="hero-actions">
          <input placeholder="Class" value={className} onChange={(e) => setClassName(e.target.value)} disabled={!canManage} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button onClick={() => setAll('P')} disabled={locked || !students.length}>All P</button>
          <button onClick={() => setAll('A')} disabled={locked || !students.length}>All A</button>
          <button onClick={downloadSheet} disabled={!className}>
            <Download size={17} /> Download sheet
          </button>
          <button className="primary" onClick={submit} disabled={locked || loading || students.length === 0}>
            <Save size={17} /> {locked ? 'Locked' : 'Submit'}
          </button>
        </div>
      </section>

      <section className="stats-grid">
        <Metric icon={<Users size={18} />} label="Students" value={students.length} />
        <Metric icon={<CheckCircle2 size={18} />} label="Present" value={presentCount} />
        <Metric icon={<AlertCircle size={18} />} label="Absent" value={absentCount} />
        <Metric icon={<CalendarDays size={18} />} label="Marked" value={`${completion}%`} />
      </section>

      <section className="panel attendance-panel">
        <div className="panel-title">
          <div>
            <h2>Student List</h2>
            <p>{locked ? 'Attendance is locked for this date.' : 'Tap a status button to update each student.'}</p>
          </div>
          <span className={locked ? 'status-pill locked' : 'status-pill'}>{locked ? 'Locked' : 'Editable'}</span>
        </div>
        <div className="attendance-list">
          {students.map((student) => {
            const status = marks[student._id] || 'P'
            return (
              <div className="attendance-row" key={student._id}>
                <div className="avatar">{student.rollNo}</div>
                <div className="student-meta">
                  <strong>{student.name}</strong>
                  <span>{student.className} / Parent: {student.parentPhone}</span>
                </div>
                <div className="status-toggle">
                  <button disabled={locked} className={status === 'P' ? 'selected present' : ''} onClick={() => setMarks({ ...marks, [student._id]: 'P' })}>Present</button>
                  <button disabled={locked} className={status === 'A' ? 'selected absent' : ''} onClick={() => setMarks({ ...marks, [student._id]: 'A' })}>Absent</button>
                </div>
              </div>
            )
          })}
        </div>
        {!students.length && <div className="empty-state">No active students found for {className || 'this class'}.</div>}
      </section>
    </main>
  )
}

function HelpView() {
  return (
    <main className="page">
      <section className="hero-panel">
        <div>
          <h1>Help</h1>
          <p>Quick reference for using the Attendance Monitoring System across faculty, admin, and HOD roles.</p>
        </div>
      </section>

      <section className="help-grid">
        <HelpCard title="Dashboard" items={['Review student count, attendance rate, submissions, and failed alerts.', 'Use class filters to focus on one class.', 'Jump directly to attendance or student management.']} />
        <HelpCard title="Attendance" items={['Select class and date.', 'Mark students Present or Absent from the list.', 'Submit once to lock attendance for that date.', 'Use Download sheet to export the class attendance CSV.']} />
        <HelpCard title="Students" items={['Admins and HODs can create student records.', 'Search by name, roll number, phone, or class.', 'Keep parent WhatsApp numbers in international format.']} />
        <HelpCard title="Reports" items={['Admins and HODs can view summary reports.', 'Download CSV reports for submitted attendance history.', 'Review recent absentee records and failed WhatsApp alerts.']} />
      </section>
    </main>
  )
}

function HelpCard({ title, items }) {
  return (
    <section className="panel help-card">
      <h2>{title}</h2>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        <div className="section-heading">
          <h1>Student Management</h1>
          <p>Create and maintain active class registers.</p>
        </div>
        <form className="student-form" onSubmit={create}>
          <input placeholder="Roll number" value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} />
          <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Class e.g. CSE_1_A" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
          <input placeholder="Parent WhatsApp +919876543210" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} />
          <button className="primary"><Plus size={17} /> Add student</button>
        </form>
      </section>
      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>Students</h2>
            <p>{students.length} active records</p>
          </div>
        </div>
        <div className="search-row">
          <input placeholder="Class" value={query.className} onChange={(e) => setQuery({ ...query, className: e.target.value })} />
          <input placeholder="Search name, roll, phone" value={query.search} onChange={(e) => setQuery({ ...query, search: e.target.value })} />
          <button onClick={load}><Search size={17} /></button>
        </div>
        <StudentDirectory students={students} />
      </section>
    </main>
  )
}

function StudentDirectory({ students, compact = false }) {
  return (
    <div className={compact ? 'student-directory compact' : 'student-directory'}>
      {students.map((student) => (
        <div key={student._id} className="student-card">
          <div className="avatar">{student.rollNo}</div>
          <div>
            <strong>{student.name}</strong>
            <span>{student.className}</span>
          </div>
          <small>{student.parentPhone}</small>
        </div>
      ))}
      {!students.length && <div className="empty-state slim">No students found.</div>}
    </div>
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      <section className="hero-panel">
        <div>
          <h1>Admin Reports</h1>
          <p>Monitor attendance health, absentee trends, notification failures, and reports.</p>
        </div>
        <div className="hero-actions">
          <input placeholder="Filter class" value={className} onChange={(e) => setClassName(e.target.value)} />
          <button onClick={load}><Search size={17} /></button>
          <button className="primary" onClick={download}>
            <Download size={17} /> CSV
          </button>
        </div>
      </section>
      {stats && (
        <section className="stats-grid">
          <Metric icon={<Users size={18} />} label="Students" value={stats.students} />
          <Metric icon={<Save size={18} />} label="Submissions" value={stats.submissions} />
          <Metric icon={<CheckCircle2 size={18} />} label="Present %" value={`${stats.presentPercent}%`} />
          <Metric icon={<BellRing size={18} />} label="Failed WhatsApp" value={stats.failedMessages} />
        </section>
      )}
      <section className="panel">
        <h2>Absentee History</h2>
        <div className="list">
          {history.map((item, index) => (
            <div key={`${item.date}-${item.rollNo}-${index}`} className="list-row">
              <strong>{item.rollNo}</strong>
              <span>{item.name}</span>
              <small>{item.className} / {item.date}</small>
            </div>
          ))}
          {!history.length && <div className="empty-state slim">No absentee records found.</div>}
        </div>
      </section>
    </main>
  )
}

function Metric({ icon, label, value }) {
  return (
    <div className="metric">
      <span>{icon}{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default App
