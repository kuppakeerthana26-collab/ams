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
import logoUrl from './assets/logo.png'

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

function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isWarning = false }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className={isWarning ? "modal-icon warning" : "modal-icon"}>
            <AlertCircle size={20} />
          </div>
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          {message}
        </div>
        <div className="modal-actions">
          <button onClick={onCancel}>{cancelText}</button>
          <button className={isWarning ? "primary danger" : "primary"} style={isWarning ? { background: '#b42318', borderColor: '#b42318' } : {}} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(getSavedUser)
  const [view, setView] = useState('dashboard')
  const [toast, setToast] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [confirmModal, setConfirmModal] = useState(null)

  const handleConfirmModal = () => {
    if (confirmModal && confirmModal.onConfirm) {
      confirmModal.onConfirm();
    }
    setConfirmModal(null);
  };

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 4000)
  }

  const logout = () => {
    setConfirmModal({
      title: 'Logout',
      message: 'Are you sure you want to log out of your session?',
      confirmText: 'Log Out',
      isWarning: true,
      onConfirm: () => {
        clearUserSession()
        setUser(null)
      }
    })
  }

  const canManage = user?.role === 'admin' || user?.role === 'hod'

  const navigate = (nextView) => {
    setView(nextView)
    setSidebarOpen(false)
  }

  if (!user) {
    return (
      <>
        <AuthScreen onAuth={(data) => { saveUserSession(data); setUser(data.user) }} setConfirmModal={setConfirmModal} />
        {confirmModal && (
          <ConfirmationModal
            isOpen={true}
            title={confirmModal.title}
            message={confirmModal.message}
            confirmText={confirmModal.confirmText}
            cancelText={confirmModal.cancelText}
            isWarning={confirmModal.isWarning}
            onConfirm={handleConfirmModal}
            onCancel={() => setConfirmModal(null)}
          />
        )}
      </>
    )
  }

  return (
    <div className="app-shell">
      <aside className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand-block">
          <div className="brand-icon" style={{ padding: 0, overflow: 'hidden' }}>
            <img src={logoUrl} alt="GKCE CSE Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <strong>GKCE CSE</strong>
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
        {view === 'attendance' && <AttendanceView user={user} onToast={showToast} setConfirmModal={setConfirmModal} />}
        {view === 'students' && <StudentsView onToast={showToast} />}
        {view === 'admin' && <AdminView />}
        {view === 'help' && <HelpView />}
      </div>
      {confirmModal && (
        <ConfirmationModal
          isOpen={true}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          isWarning={confirmModal.isWarning}
          onConfirm={handleConfirmModal}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  )
}

function AuthScreen({ onAuth, setConfirmModal }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = (event) => {
    event.preventDefault()
    if (!form.email || !form.password) return
    setConfirmModal({
      title: 'GKCE CSE Login',
      message: `Are you sure you want to log in as ${form.email}?`,
      confirmText: 'Log In',
      onConfirm: async () => {
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
    })
  }

  return (
    <main className="auth-layout">
      <section className="auth-hero">
        <div className="brand-lockup">
          <div className="brand-icon large" style={{ padding: 0, overflow: 'hidden' }}>
            <img src={logoUrl} alt="GKCE CSE Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
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
        <div className="brand-mark" style={{ padding: 0, overflow: 'hidden' }}>
          <img src={logoUrl} alt="GKCE CSE Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
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
  const [className, setClassName] = useState('CSE_3_A')
  const [stats, setStats] = useState(null)
  const [absentees, setAbsentees] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [absenteeDay, setAbsenteeDay] = useState('today')
  const [presenteeDay, setPresenteeDay] = useState('today')
  const [dateFilters] = useState(dashboardDates)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
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
    } finally {
      setLoading(false)
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
          <span style={{ padding: '8px 16px', background: '#eef2f6', color: '#334155', borderRadius: '6px', fontWeight: '600', fontSize: '14px', border: '1px solid #cbd5e1' }}>Class: CSE 3A</span>
          <button onClick={load} disabled={loading}><Search size={17} /> Refresh</button>
          <button className="primary" onClick={() => onNavigate('attendance')}><Save size={17} /> Mark attendance</button>
        </div>
      </section>

      {loading ? (
        <>
          <section className="stats-grid">
            <div className="metric"><div className="skeleton skeleton-text" style={{ width: '40%' }} /><div className="skeleton" style={{ height: '32px', width: '60%', marginTop: '8px' }} /></div>
            <div className="metric"><div className="skeleton skeleton-text" style={{ width: '40%' }} /><div className="skeleton" style={{ height: '32px', width: '60%', marginTop: '8px' }} /></div>
            <div className="metric"><div className="skeleton skeleton-text" style={{ width: '40%' }} /><div className="skeleton" style={{ height: '32px', width: '60%', marginTop: '8px' }} /></div>
            <div className="metric"><div className="skeleton skeleton-text" style={{ width: '40%' }} /><div className="skeleton" style={{ height: '32px', width: '60%', marginTop: '8px' }} /></div>
          </section>
          <section className="dashboard-grid">
            <div className="panel">
              <div className="panel-title">
                <h2>Presentees</h2>
              </div>
              <div className="presentee-grid">
                {[1, 2, 3, 4].map((i) => (
                  <div className="activity-item" key={i}>
                    <div className="skeleton skeleton-avatar" style={{ width: '60px', height: '46px' }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton skeleton-title" style={{ width: '50%', height: '16px', marginBottom: '4px' }} />
                      <div className="skeleton skeleton-text" style={{ width: '70%', height: '12px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="panel-title">
                <h2>Absentees</h2>
              </div>
              <div className="activity-list">
                {[1, 2, 3, 4].map((i) => (
                  <div className="activity-item" key={i}>
                    <div className="skeleton skeleton-avatar" style={{ width: '60px', height: '46px' }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton skeleton-title" style={{ width: '50%', height: '16px', marginBottom: '4px' }} />
                      <div className="skeleton skeleton-text" style={{ width: '70%', height: '12px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
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
        </>
      )}
    </main>
  )
}

function AttendanceView({ user, onToast, setConfirmModal }) {
  const defaultClass = classFromUser(user)
  const canManage = user.role === 'admin' || user.role === 'hod'
  const [className, setClassName] = useState('CSE_3_A')
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

  const submit = () => {
    setConfirmModal({
      title: 'Submit Attendance',
      message: `Are you sure you want to submit and lock attendance for date ${date}? This will lock editing and send notifications to parents of absent students.`,
      confirmText: 'Submit & Lock',
      onConfirm: async () => {
        const entries = students.map((student) => ({ studentId: student._id, status: marks[student._id] || 'P' }))
        try {
          const data = await api.submitAttendance({ className, date, entries })
          setLocked(true)
          onToast(`Submitted. ${data.absentees.length} absentee notifications processed.`)
        } catch (err) {
          onToast(err.message)
        }
      }
    })
  }

  const downloadSheet = () => {
    setConfirmModal({
      title: 'Download Register',
      message: `Do you want to download the monthly CSV attendance register for class ${className}?`,
      confirmText: 'Download',
      onConfirm: async () => {
        try {
          const blob = await api.downloadAttendanceSheet({ className, date })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
          const d = new Date(`${date}T00:00:00.000Z`)
          const monthName = months[d.getUTCMonth()]
          const year = d.getUTCFullYear()
          link.download = `${className || 'class'}-${monthName}-${year}-attendance.csv`
          link.click()
          URL.revokeObjectURL(url)
        } catch (err) {
          onToast(err.message)
        }
      }
    })
  }

  return (
    <main className="page">
      <section className="hero-panel">
        <div>
          <h1>Attendance</h1>
          <p>Use the student list to mark present or absent. Submit once to lock the day and trigger parent alerts.</p>
        </div>
        <div className="hero-actions">
          <span style={{ padding: '8px 16px', background: '#eef2f6', color: '#334155', borderRadius: '6px', fontWeight: '600', fontSize: '14px', border: '1px solid #cbd5e1' }}>Class: CSE 3A</span>
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
          {loading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div className="attendance-row" key={i}>
                <div className="skeleton skeleton-avatar" style={{ width: '60px', height: '46px' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-title" style={{ width: '30%', height: '16px', marginBottom: '4px' }} />
                  <div className="skeleton skeleton-text" style={{ width: '50%', height: '12px' }} />
                </div>
                <div className="status-toggle">
                  <div className="skeleton" style={{ width: '80px', height: '34px', borderRadius: '6px' }} />
                  <div className="skeleton" style={{ width: '80px', height: '34px', borderRadius: '6px' }} />
                </div>
              </div>
            ))
          ) : (
            students.map((student) => {
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
            })
          )}
        </div>
        {!loading && !students.length && <div className="empty-state">No active students found for {className || 'this class'}.</div>}
      </section>
    </main>
  )
}

function HelpView() {
  return (
    <main className="page">
      <section className="hero-panel">
        <div>
          <h1>Info & Help</h1>
          <p>Quick guide for utilizing the system and learning about our technical community.</p>
        </div>
      </section>

      <div className="info-section">
        {/* About Us Banner */}
        <section className="info-banner">
          <div className="info-banner-logo">
            <img src={logoUrl} alt="GKCE CSE Logo" />
          </div>
          <div className="info-banner-text">
            <h2>Gokula Krishna College of Engineering</h2>
            <p>
              Department of Computer Science & Engineering (CSE). Sullurpet, Andhra Pradesh.
              Providing qualitative technical education and fostering computer engineering excellence.
            </p>
          </div>
        </section>

        {/* Technical Club Section */}
        <section className="club-card">
          <span className="club-motto">CODE • SOLVE • EVOLVE</span>
          <h2>GKCE CSE Code Club</h2>
          <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '15px', margin: '8px 0 0' }}>
            The official Technical Code Club of the CSE Department at Gokula Krishna College of Engineering is a platform
            dedicated to nurturing software developer skills, competitive programming, and web technology.
            We organize regular coding contests, workshops, project showcases, and peer-to-peer mentoring groups to
            enable students to transition from learning syntax to solving actual real-world challenges.
          </p>
          <div className="club-features">
            <div className="club-feature-item"> Coding Contests</div>
            <div className="club-feature-item"> Web App Workshops</div>
            <div className="club-feature-item"> Peer-to-Peer Mentoring</div>
            <div className="club-feature-item"> Hackathons & Projects</div>
          </div>
        </section>

        {/* User Manual Section */}
        <section className="panel" style={{ marginTop: '12px' }}>
          <h2 style={{ marginBottom: '18px' }}>User Manual & Documentation</h2>
          <section className="help-grid">
            <HelpCard title="Dashboard" items={['Review student count, attendance rate, submissions, and failed alerts.', 'Use class filters to focus on one class.', 'Jump directly to attendance or student management.']} />
            <HelpCard title="Attendance" items={['Select class and date.', 'Mark students Present or Absent from the list.', 'Submit once to lock attendance for that date.', 'Use Download sheet to export the class attendance CSV.']} />
            <HelpCard title="Students" items={['Admins and HODs can create student records.', 'Search by name, roll number, phone, or class.', 'Keep parent WhatsApp numbers in international format.']} />
            <HelpCard title="Reports" items={['Admins and HODs can view summary reports.', 'Download CSV reports for submitted attendance history.', 'Review recent absentee records and failed WhatsApp alerts.']} />
          </section>
        </section>
      </div>
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
  const [query, setQuery] = useState({ className: 'CSE_3_A', search: '' })
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({ rollNo: '', name: '', className: 'CSE_3_A', parentPhone: '' })
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.students(query)
      setStudents(data.students)
    } catch (err) {
      onToast(err.message)
    } finally {
      setLoading(false)
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
          <input placeholder="Class e.g. CSE_1_A" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} style={{ display: 'none' }} />
          <input placeholder="Parent WhatsApp +919876543210" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} />
          <button className="primary" disabled={loading}><Plus size={17} /> Add student</button>
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
          <input placeholder="Class" value={query.className} onChange={(e) => setQuery({ ...query, className: e.target.value })} style={{ display: 'none' }} />
          <input placeholder="Search name, roll, phone" value={query.search} onChange={(e) => setQuery({ ...query, search: e.target.value })} />
          <button onClick={load} disabled={loading}><Search size={17} /></button>
        </div>
        <StudentDirectory students={students} loading={loading} />
      </section>
    </main>
  )
}

function StudentDirectory({ students, compact = false, loading = false }) {
  if (loading) {
    return (
      <div className={compact ? 'student-directory compact' : 'student-directory'}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="student-card">
            <div className="skeleton skeleton-avatar" style={{ width: '60px', height: '46px' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-title" style={{ width: '50%', height: '16px', marginBottom: '4px' }} />
              <div className="skeleton skeleton-text" style={{ width: '70%', height: '12px' }} />
            </div>
            <div className="skeleton" style={{ width: '100px', height: '14px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    )
  }

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
  const [className, setClassName] = useState('CSE_3_A')
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [statsData, historyData] = await Promise.all([
        api.statistics(className ? { className } : {}),
        api.absentees(className ? { className } : {}),
      ])
      setStats(statsData.stats)
      setHistory(historyData.history)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
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
          <span style={{ padding: '8px 16px', background: '#eef2f6', color: '#334155', borderRadius: '6px', fontWeight: '600', fontSize: '14px', border: '1px solid #cbd5e1' }}>Class: CSE 3A</span>
          <button onClick={load} disabled={loading}><Search size={17} /></button>
          <button className="primary" onClick={download} disabled={loading}>
            <Download size={17} /> CSV
          </button>
        </div>
      </section>
      {loading ? (
        <>
          <section className="stats-grid">
            <div className="metric"><div className="skeleton skeleton-text" style={{ width: '40%' }} /><div className="skeleton" style={{ height: '32px', width: '60%', marginTop: '8px' }} /></div>
            <div className="metric"><div className="skeleton skeleton-text" style={{ width: '40%' }} /><div className="skeleton" style={{ height: '32px', width: '60%', marginTop: '8px' }} /></div>
            <div className="metric"><div className="skeleton skeleton-text" style={{ width: '40%' }} /><div className="skeleton" style={{ height: '32px', width: '60%', marginTop: '8px' }} /></div>
            <div className="metric"><div className="skeleton skeleton-text" style={{ width: '40%' }} /><div className="skeleton" style={{ height: '32px', width: '60%', marginTop: '8px' }} /></div>
          </section>
          <section className="panel">
            <h2>Absentee History</h2>
            <div className="list">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="list-row" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div className="skeleton" style={{ width: '30px', height: '18px' }} />
                  <div className="skeleton" style={{ width: '150px', height: '18px', flex: 1 }} />
                  <div className="skeleton" style={{ width: '100px', height: '14px' }} />
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
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
        </>
      )}
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
