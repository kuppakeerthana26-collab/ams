/* ==========================================================================
   GKCE AMS - Executive Leadership Portal (React Application)
   Light Theme Edition for Principals, Vice Principals/Deans, and HODs
   ========================================================================== */

const { useState, useEffect, useMemo, useCallback } = React;

// Role presets
const ROLES = {
  principal: {
    id: "principal",
    name: "Dr. V. Ravindra",
    title: "Principal & Head of Institution",
    roleTag: "CAMPUS HEAD",
    badgeClass: "principal",
    avatar: "P",
    email: "principal@college.edu",
    password: "PrincipalPass123!",
    department: "ALL",
    scopeLabel: "All Departments (CSE, ECE, MECH, CIVIL, EEE)",
  },
  dean: {
    id: "dean",
    name: "Dr. K. Sarojini",
    title: "Dean / Vice Principal (Academics)",
    roleTag: "ACADEMIC DEAN",
    badgeClass: "dean",
    avatar: "D",
    email: "dean@college.edu",
    password: "DeanPass123!",
    department: "ALL",
    scopeLabel: "Campus Academic Monitoring & Verification",
  },
  hod_cse: {
    id: "hod_cse",
    name: "Dr. K. Ramesh",
    title: "Head of Department (CSE)",
    roleTag: "HOD - CSE",
    badgeClass: "hod",
    avatar: "C",
    email: "hod.cse@college.edu",
    password: "HodPass123!",
    department: "CSE",
    scopeLabel: "Computer Science & Engineering Department",
  },
  hod_ece: {
    id: "hod_ece",
    name: "Dr. M. Sreenivasulu",
    title: "Head of Department (ECE)",
    roleTag: "HOD - ECE",
    badgeClass: "hod",
    avatar: "E",
    email: "hod.ece@college.edu",
    password: "HodPass123!",
    department: "ECE",
    scopeLabel: "Electronics & Communication Department",
  },
  admin: {
    id: "admin",
    name: "System Administrator",
    title: "AMS Lead Administrator",
    roleTag: "ADMINISTRATOR",
    badgeClass: "principal",
    avatar: "A",
    email: "admin@college.edu",
    password: "AdminPass123!",
    department: "ALL",
    scopeLabel: "Full System Audit & Management",
  },
};

const getTodayDateStr = () => new Date().toISOString().slice(0, 10);

function ExecutiveLeadershipApp() {
  const [activeRoleKey, setActiveRoleKey] = useState("principal");
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [activeTab, setActiveTab] = useState("departments"); // departments | sections | defaulters | faculty | directory
  
  // Data States
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [facultyStatus, setFacultyStatus] = useState([]);
  const [students, setStudents] = useState([]);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [defaulterFilter, setDefaulterFilter] = useState("all"); // all | critical | warning
  
  // Modal States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
  const [trilingualNoticeModal, setTrilingualNoticeModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const activeRole = ROLES[activeRoleKey] || ROLES.principal;

  // Show Toast
  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Authenticate with role credentials
  const authenticateRole = useCallback(async (roleKey) => {
    const roleInfo = ROLES[roleKey] || ROLES.principal;
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: roleInfo.email, password: roleInfo.password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        return data.token;
      } else {
        console.warn("Login fallback for role:", roleInfo.email);
        return null;
      }
    } catch (err) {
      console.error("Auth error:", err);
      return null;
    }
  }, []);

  // 2. Fetch Dashboard Data
  const fetchData = useCallback(async (authToken) => {
    const t = authToken || token;
    if (!t) return;
    setLoading(true);

    const deptParam = activeRole.department !== "ALL" ? activeRole.department : selectedDepartment;
    const headers = {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
    };

    try {
      const [ovRes, deptRes, secRes, defRes, facRes, stuRes] = await Promise.all([
        fetch(`/api/dashboard/overview?department=${deptParam}&date=${selectedDate}`, { headers }),
        fetch(`/api/dashboard/departments?date=${selectedDate}`, { headers }),
        fetch(`/api/dashboard/sections?department=${deptParam}&date=${selectedDate}`, { headers }),
        fetch(`/api/dashboard/defaulters?department=${deptParam}&threshold=75`, { headers }),
        fetch(`/api/dashboard/faculty-status?date=${selectedDate}`, { headers }),
        fetch(`/api/dashboard/students?department=${deptParam}`, { headers }),
      ]);

      if (ovRes.ok) {
        const ovData = await ovRes.json();
        setOverview(ovData.data);
      }
      if (deptRes.ok) {
        const dData = await deptRes.json();
        setDepartments(dData.departments || []);
      }
      if (secRes.ok) {
        const sData = await secRes.json();
        setSections(sData.sections || []);
      }
      if (defRes.ok) {
        const dfData = await defRes.json();
        setDefaulters(dfData.defaulters || []);
      }
      if (facRes.ok) {
        const fcData = await facRes.json();
        setFacultyStatus(fcData.facultyStatus || []);
      }
      if (stuRes.ok) {
        const stData = await stuRes.json();
        setStudents(stData.students || []);
      }
    } catch (err) {
      console.error("Fetch dashboard error:", err);
      showToast("Could not load latest attendance stats", "error");
    } finally {
      setLoading(false);
    }
  }, [token, activeRole.department, selectedDepartment, selectedDate]);

  // Initial authentication & data load
  useEffect(() => {
    authenticateRole(activeRoleKey).then((newToken) => {
      if (newToken) {
        fetchData(newToken);
      }
    });
  }, [activeRoleKey, authenticateRole]);

  // Refetch when date or department filter changes
  useEffect(() => {
    if (token) {
      fetchData(token);
    }
  }, [selectedDate, selectedDepartment, fetchData, token]);

  // Handle Role Change
  const handleRoleChange = (e) => {
    const newKey = e.target.value;
    setActiveRoleKey(newKey);
    const newRole = ROLES[newKey];
    if (newRole && newRole.department !== "ALL") {
      setSelectedDepartment(newRole.department);
    } else {
      setSelectedDepartment("ALL");
    }
    showToast(`Switched view to ${newRole.name} (${newRole.roleTag})`);
  };

  // Open Student Details Modal
  const openStudentModal = async (studentId) => {
    if (!token) return;
    setStudentDetailsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedStudent(data.student);
      }
    } catch (err) {
      console.error("Student profile error:", err);
    } finally {
      setStudentDetailsLoading(false);
    }
  };

  // Generate Trilingual Absence Notice
  const openTrilingualNotice = (student) => {
    const studentName = student.name;
    const rollNo = student.rollNo;
    const rate = student.attendanceRate !== undefined ? `${student.attendanceRate}%` : "Low";

    const notice = {
      student,
      english: `Dear Parent, GKCE Attendance Alert: Your ward ${studentName} (Roll No: ${rollNo}) has an attendance of ${rate}, which is below the mandatory 75% threshold. Please ensure regular attendance to avoid semester condonation / exam detention. Regards, Principal GKCE.`,
      telugu: `ప్రియమైన తల్లిదండ్రులకు, GKCE హాజరు హెచ్చరిక: మీ కుమార్తె/కుమారుడు ${studentName} (రోల్ నెం: ${rollNo}) ప్రస్తుత హాజరు ${rate} గా ఉంది. పరీక్షలకు అనుమతించబడటానికి 75% కనీస హాజరు తప్పనిసరి. దయచేసి శ్రద్ధ తీసుకోండి. - ప్రిన్సిపాల్, GKCE సుళ్ళూరుపేట.`,
      tamil: `அன்பான பெற்றோரே, GKCE வருகைப் பதிவு அறிவிப்பு: உங்கள் பிள்ளை ${studentName} (பதிவு எண்: ${rollNo}) வருகை விகிதம் ${rate} ஆக உள்ளது. தேர்வெழுத குறைந்தபட்சம் 75% வருகை கட்டாயம். வழக்கமான வருகையை உறுதிப்படுத்தவும். - முதல்வர், GKCE.`,
    };
    setTrilingualNoticeModal(notice);
  };

  // Export Excel
  const handleExportExcel = () => {
    const dept = activeRole.department !== "ALL" ? activeRole.department : selectedDepartment;
    const month = selectedDate.slice(0, 7);
    window.open(`/api/dashboard/export/excel?department=${dept}&month=${month}`, "_blank");
    showToast("Downloading GKCE Attendance Excel Sheet...");
  };

  // Filtered Defaulters
  const filteredDefaulters = useMemo(() => {
    return defaulters.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.className.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (defaulterFilter === "critical") return d.attendanceRate < 50;
      if (defaulterFilter === "warning") return d.attendanceRate >= 50 && d.attendanceRate < 75;
      return true;
    });
  }, [defaulters, searchQuery, defaulterFilter]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      return (
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.className.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [students, searchQuery]);

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 999,
            backgroundColor: toastMessage.type === "error" ? "#dc2626" : "#059669",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: "600",
            fontSize: "13px",
            animation: "scaleUp 0.2s ease-out",
          }}
        >
          <i className={toastMessage.type === "error" ? "fa-solid fa-circle-exclamation" : "fa-solid fa-circle-check"}></i>
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="top-header">
        <div className="header-inner">
          {/* Logo & Title */}
          <div className="brand-section">
            <div className="brand-logo-badge">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div className="brand-title-wrap">
              <div className="brand-title-row">
                <span className="brand-name">GKCE SULLURPETA</span>
                <span className="portal-badge">Executive Portal</span>
              </div>
              <span className="brand-subtitle">Principal • Dean • HOD Attendance Intelligence</span>
            </div>
          </div>

          {/* Header Controls */}
          <div className="header-actions">
            {/* Date Picker */}
            <div className="date-picker-box">
              <i className="fa-regular fa-calendar" style={{ color: "var(--primary)" }}></i>
              <input
                type="date"
                className="date-picker-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Role Switcher */}
            <div className="role-select-box">
              <select
                className="role-select"
                value={activeRoleKey}
                onChange={handleRoleChange}
              >
                <option value="principal">🎓 Dr. V. Ravindra (Principal)</option>
                <option value="dean">🏛️ Dr. K. Sarojini (Dean Academics)</option>
                <option value="hod_cse">💻 Dr. K. Ramesh (HOD - CSE)</option>
                <option value="hod_ece">📡 Dr. M. Sreenivasulu (HOD - ECE)</option>
                <option value="admin">⚙️ System Administrator</option>
              </select>
              <i className="fa-solid fa-chevron-down role-select-arrow"></i>
            </div>

            {/* Refresh Button */}
            <button
              className="btn btn-outline"
              onClick={() => fetchData()}
              title="Refresh Analytics"
            >
              <i className={`fa-solid fa-rotate ${loading ? "fa-spin" : ""}`}></i>
              <span>Refresh</span>
            </button>

            {/* Export Excel Button */}
            <button
              className="btn btn-primary"
              onClick={handleExportExcel}
              title="Download Excel Report"
            >
              <i className="fa-solid fa-file-excel"></i>
              <span>Export Sheet</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="main-content">
        {/* Scope & User Profile Banner */}
        <section className="scope-banner">
          <div className="scope-user-info">
            <div className="user-avatar-badge">
              {activeRole.avatar}
            </div>
            <div className="user-details">
              <div className="user-name-row">
                <span className="user-name">{activeRole.name}</span>
                <span className={`user-badge ${activeRole.badgeClass}`}>
                  {activeRole.roleTag}
                </span>
              </div>
              <span className="scope-description">
                Scope: {activeRole.scopeLabel}
              </span>
            </div>
          </div>

          {/* Department Filter (Only enabled for Principal, Dean, Admin) */}
          {activeRole.department === "ALL" && (
            <div className="scope-filter-group">
              <span className="filter-label">Filter Branch:</span>
              <select
                className="filter-select"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                <option value="CSE">CSE (Computer Science)</option>
                <option value="ECE">ECE (Electronics)</option>
                <option value="MECH">MECH (Mechanical)</option>
                <option value="CIVIL">CIVIL (Civil Engg)</option>
                <option value="EEE">EEE (Electrical)</option>
              </select>
            </div>
          )}
        </section>

        {/* Executive KPI Summary Cards */}
        <section className="kpi-grid">
          {/* Card 1: Today Attendance Rate */}
          <div className="kpi-card blue">
            <div className="kpi-header">
              <span className="kpi-title">Campus Attendance</span>
              <div className="kpi-icon-box blue">
                <i className="fa-solid fa-chart-pie"></i>
              </div>
            </div>
            <div className="kpi-main">
              <span className="kpi-value">
                {overview ? `${overview.kpi.todayAttendanceRate}%` : "--"}
              </span>
              <span
                className={`kpi-badge ${(overview?.kpi.todayAttendanceRate || 0) >= 75 ? "safe" : "warning"}`}
              >
                Target 75%+
              </span>
            </div>
            <div className="kpi-footer">
              <span>Monthly Average:</span>
              <strong>{overview ? `${overview.kpi.monthlyAverageRate}%` : "--"}</strong>
            </div>
          </div>

          {/* Card 2: Today Present vs Absent */}
          <div className="kpi-card emerald">
            <div className="kpi-header">
              <span className="kpi-title">Students Status Today</span>
              <div className="kpi-icon-box emerald">
                <i className="fa-solid fa-users"></i>
              </div>
            </div>
            <div className="kpi-main">
              <span className="kpi-value" style={{ color: "var(--success)" }}>
                {overview ? overview.kpi.todayPresentCount : 0}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>
                Present / {overview ? overview.kpi.todayAbsentCount : 0} Absent
              </span>
            </div>
            <div className="kpi-footer">
              <span>Total Enrolled:</span>
              <strong>{overview ? overview.kpi.totalStudents : 0} Students</strong>
            </div>
          </div>

          {/* Card 3: Defaulter Radar */}
          <div className="kpi-card red">
            <div className="kpi-header">
              <span className="kpi-title">Defaulter Radar (&lt;75%)</span>
              <div className="kpi-icon-box red">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
            </div>
            <div className="kpi-main">
              <span className="kpi-value" style={{ color: "var(--danger)" }}>
                {overview ? overview.kpi.defaultersCount : 0}
              </span>
              <span className="kpi-badge danger">
                {overview ? overview.kpi.criticalCount : 0} Critical (&lt;50%)
              </span>
            </div>
            <div className="kpi-footer">
              <span>Mandatory Condonation Risk</span>
              <strong>Action Required</strong>
            </div>
          </div>

          {/* Card 4: Submission Compliance */}
          <div className="kpi-card purple">
            <div className="kpi-header">
              <span className="kpi-title">Faculty Compliance</span>
              <div className="kpi-icon-box purple">
                <i className="fa-solid fa-clipboard-check"></i>
              </div>
            </div>
            <div className="kpi-main">
              <span className="kpi-value" style={{ color: "var(--purple)" }}>
                {overview ? `${overview.submissionCompliance.complianceRate}%` : "--"}
              </span>
              <span className="kpi-badge safe">
                {overview ? overview.submissionCompliance.submittedCount : 0} /{" "}
                {overview ? overview.submissionCompliance.totalClasses : 0} Submitted
              </span>
            </div>
            <div className="kpi-footer">
              <span>Pending Classes:</span>
              <strong style={{ color: overview?.submissionCompliance.pendingCount > 0 ? "var(--danger)" : "var(--success)" }}>
                {overview ? `${overview.submissionCompliance.pendingCount} Sections` : "--"}
              </strong>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <nav className="tabs-nav-bar">
          <button
            className={`tab-btn ${activeTab === "departments" ? "active" : ""}`}
            onClick={() => setActiveTab("departments")}
          >
            <i className="fa-solid fa-building-columns"></i>
            <span>Department Comparison</span>
            <span className="tab-badge">{departments.length}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === "sections" ? "active" : ""}`}
            onClick={() => setActiveTab("sections")}
          >
            <i className="fa-solid fa-chalkboard-user"></i>
            <span>Classes &amp; Sections</span>
            <span className="tab-badge">{sections.length}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === "defaulters" ? "active" : ""}`}
            onClick={() => setActiveTab("defaulters")}
          >
            <i className="fa-solid fa-triangle-exclamation" style={{ color: "var(--danger)" }}></i>
            <span>Defaulters Radar</span>
            <span className="tab-badge" style={{ backgroundColor: "var(--danger-light)", color: "var(--danger)" }}>
              {defaulters.length}
            </span>
          </button>

          <button
            className={`tab-btn ${activeTab === "faculty" ? "active" : ""}`}
            onClick={() => setActiveTab("faculty")}
          >
            <i className="fa-solid fa-user-check"></i>
            <span>Faculty Submission Log</span>
            <span className="tab-badge">{facultyStatus.length}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === "directory" ? "active" : ""}`}
            onClick={() => setActiveTab("directory")}
          >
            <i className="fa-solid fa-address-book"></i>
            <span>Student Lookup</span>
            <span className="tab-badge">{students.length}</span>
          </button>
        </nav>

        {/* TAB 1: Department Comparison */}
        {activeTab === "departments" && (
          <section className="content-card">
            <div className="content-card-header">
              <div className="card-title-group">
                <h2 className="card-title">
                  <i className="fa-solid fa-building-columns" style={{ color: "var(--primary)" }}></i>
                  Campus Department Performance Matrix
                </h2>
                <span className="card-subtitle">
                  Comparative attendance rates, enrolled strength, and daily submission compliance
                </span>
              </div>
            </div>

            <div className="departments-grid">
              {departments.map((dept) => {
                const isHigh = dept.todayAttendanceRate >= 75;
                const isMedium = dept.todayAttendanceRate >= 60 && dept.todayAttendanceRate < 75;
                const statusClass = isHigh ? "high" : isMedium ? "medium" : "low";
                const badgeColorClass = isHigh ? "safe" : isMedium ? "warning" : "danger";

                return (
                  <div key={dept.code} className="dept-card">
                    <div className="dept-card-top">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="dept-badge-icon">
                          {dept.code}
                        </div>
                        <div className="dept-title-box">
                          <span className="dept-title">{dept.name}</span>
                          <span className="dept-hod-name">
                            <i className="fa-solid fa-user-tie" style={{ marginRight: "4px" }}></i>
                            HOD: {dept.hodName}
                          </span>
                        </div>
                      </div>
                      <div className={`status-pill ${badgeColorClass}`}>
                        {dept.todayAttendanceRate}%
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px" }}>
                        <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Today's Rate</span>
                        <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>{dept.todayAttendanceRate}% (Monthly: {dept.monthlyAverageRate}%)</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className={`progress-bar ${statusClass}`}
                          style={{ width: `${Math.min(100, Math.max(8, dept.todayAttendanceRate))}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="dept-metrics-row">
                      <div className="dept-metric-item">
                        <span>Students</span>
                        <strong>{dept.totalStudents}</strong>
                      </div>
                      <div className="dept-metric-item">
                        <span>Sections</span>
                        <strong>{dept.totalSections}</strong>
                      </div>
                      <div className="dept-metric-item">
                        <span>Submitted</span>
                        <strong style={{ color: dept.pendingSections > 0 ? "var(--warning)" : "var(--success)" }}>
                          {dept.submittedSections}/{dept.totalSections}
                        </strong>
                      </div>
                    </div>

                    <button
                      className="btn btn-outline"
                      style={{ width: "100%", fontSize: "12px" }}
                      onClick={() => {
                        setSelectedDepartment(dept.code);
                        setActiveTab("sections");
                      }}
                    >
                      <i className="fa-solid fa-magnifying-glass"></i>
                      <span>Inspect {dept.code} Classes</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 2: Classes & Sections */}
        {activeTab === "sections" && (
          <section className="content-card">
            <div className="content-card-header">
              <div className="card-title-group">
                <h2 className="card-title">
                  <i className="fa-solid fa-chalkboard-user" style={{ color: "var(--primary)" }}></i>
                  Class-wise Attendance Registers ({selectedDate})
                </h2>
                <span className="card-subtitle">
                  Live submission state, faculty in-charge, and present/absent counts
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
                            No classes matched the selected department filter.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sections.map((sec) => (
                      <tr key={sec.className}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "var(--primary-light)",
                                color: "var(--primary)",
                                borderRadius: "6px",
                                fontWeight: "800",
                                fontSize: "12px",
                              }}
                            >
                              {sec.className}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: "600" }}>{sec.facultyName}</span>
                            <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                              {sec.facultyEmail || "Class In-Charge"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <strong>{sec.enrolledCount}</strong> Students
                        </td>
                        <td>
                          {sec.isSubmitted ? (
                            <span className="status-pill submitted">
                              <i className="fa-solid fa-check"></i> Submitted
                            </span>
                          ) : (
                            <span className="status-pill pending">
                              <i className="fa-solid fa-clock"></i> Pending
                            </span>
                          )}
                        </td>
                        <td>
                          {sec.isSubmitted ? (
                            <span>
                              <strong style={{ color: "var(--success)" }}>{sec.presentCount} P</strong> /{" "}
                              <strong style={{ color: "var(--danger)" }}>{sec.absentCount} A</strong>
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)" }}>Not marked yet</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <strong style={{ fontSize: "14px" }}>
                              {sec.isSubmitted ? `${sec.attendanceRate}%` : "--"}
                            </strong>
                            {sec.isSubmitted && (
                              <div
                                style={{
                                  width: "60px",
                                  height: "6px",
                                  backgroundColor: "var(--bg-surface-subtle)",
                                  borderRadius: "3px",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${sec.attendanceRate}%`,
                                    backgroundColor: sec.attendanceRate >= 75 ? "var(--success)" : "var(--danger)",
                                  }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline"
                            style={{ padding: "4px 10px", fontSize: "11.5px" }}
                            onClick={() => {
                              setSearchQuery(sec.className);
                              setActiveTab("directory");
                            }}
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
        )}

        {/* TAB 3: Defaulters Radar */}
        {activeTab === "defaulters" && (
          <section className="content-card">
            <div className="content-card-header">
              <div className="card-title-group">
                <h2 className="card-title">
                  <i className="fa-solid fa-triangle-exclamation" style={{ color: "var(--danger)" }}></i>
                  Attendance Defaulters Radar (&lt;75% Attendance)
                </h2>
                <span className="card-subtitle">
                  Identified at-risk students subject to condonation or examination detention
                </span>
              </div>

              <div className="card-actions-group">
                {/* Search */}
                <div className="search-input-wrap">
                  <i className="fa-solid fa-magnifying-glass search-icon"></i>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search name, roll no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter */}
                <select
                  className="filter-select"
                  value={defaulterFilter}
                  onChange={(e) => setDefaulterFilter(e.target.value)}
                >
                  <option value="all">All Defaulters (&lt;75%)</option>
                  <option value="critical">Critical Only (&lt;50%)</option>
                  <option value="warning">Moderate (50% - 74%)</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Classes Held</th>
                    <th>Attended</th>
                    <th>Attendance %</th>
                    <th>Risk Standing</th>
                    <th>Parent Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDefaulters.length === 0 ? (
                    <tr>
                      <td colSpan="9">
                        <div className="empty-state">
                          <div className="empty-icon-box" style={{ color: "var(--success)" }}>
                            <i className="fa-solid fa-shield-halved"></i>
                          </div>
                          <span className="empty-title">No Defaulters Found</span>
                          <span className="empty-subtitle">
                            All students have achieved healthy attendance above the 75% threshold!
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDefaulters.map((d) => {
                      const isCritical = d.attendanceRate < 50;
                      return (
                        <tr key={d._id || d.rollNo}>
                          <td>
                            <strong style={{ fontFamily: "monospace", fontSize: "13px", color: "var(--primary)" }}>
                              {d.rollNo}
                            </strong>
                          </td>
                          <td>
                            <span style={{ fontWeight: "700" }}>{d.name}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>
                              {d.className}
                            </span>
                          </td>
                          <td>{d.totalClasses}</td>
                          <td>
                            <strong style={{ color: "var(--success)" }}>{d.attendedClasses}</strong>
                          </td>
                          <td>
                            <strong
                              style={{
                                fontSize: "14px",
                                color: isCritical ? "var(--danger)" : "var(--warning)",
                              }}
                            >
                              {d.attendanceRate}%
                            </strong>
                          </td>
                          <td>
                            {isCritical ? (
                              <span className="status-pill critical">
                                <i className="fa-solid fa-skull-crossbones"></i> Critical (&lt;50%)
                              </span>
                            ) : (
                              <span className="status-pill warning">
                                <i className="fa-solid fa-triangle-exclamation"></i> Warning (50-74%)
                              </span>
                            )}
                          </td>
                          <td>
                            <a
                              href={`tel:${d.parentPhone}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                color: "var(--primary)",
                                fontWeight: "600",
                                fontSize: "12px",
                              }}
                            >
                              <i className="fa-solid fa-phone"></i>
                              {d.parentPhone || "Not set"}
                            </a>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                className="btn btn-outline"
                                style={{ padding: "4px 8px", fontSize: "11.5px" }}
                                onClick={() => openTrilingualNotice(d)}
                                title="Send Trilingual Notice to Parent"
                              >
                                <i className="fa-brands fa-whatsapp" style={{ color: "#25D366" }}></i> Alert Parent
                              </button>
                              <button
                                className="btn btn-outline"
                                style={{ padding: "4px 8px", fontSize: "11.5px" }}
                                onClick={() => openStudentModal(d._id)}
                                title="View Attendance History"
                              >
                                <i className="fa-solid fa-eye"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 4: Faculty Submission Log */}
        {activeTab === "faculty" && (
          <section className="content-card">
            <div className="content-card-header">
              <div className="card-title-group">
                <h2 className="card-title">
                  <i className="fa-solid fa-user-check" style={{ color: "var(--primary)" }}></i>
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
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: "var(--primary-light)",
                                color: "var(--primary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "700",
                                fontSize: "12px",
                              }}
                            >
                              {fac.name.charAt(0)}
                            </div>
                            <span style={{ fontWeight: "700" }}>{fac.name}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                            {fac.email}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: "3px 8px",
                              backgroundColor: "var(--bg-surface-subtle)",
                              borderRadius: "6px",
                              fontWeight: "700",
                              fontSize: "12px",
                            }}
                          >
                            {fac.assignedClass || "Unassigned"}
                          </span>
                        </td>
                        <td>
                          {fac.isSubmitted ? (
                            <span className="status-pill submitted">
                              <i className="fa-solid fa-circle-check"></i> Marked Today
                            </span>
                          ) : (
                            <span className="status-pill pending">
                              <i className="fa-solid fa-clock"></i> Pending
                            </span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                            {fac.submittedAt
                              ? new Date(fac.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : "--"}
                          </span>
                        </td>
                        <td>
                          {fac.isSubmitted ? (
                            <span style={{ color: "var(--text-secondary)", fontSize: "12px", fontWeight: "600" }}>
                              <i className="fa-solid fa-lock" style={{ color: "var(--warning)", marginRight: "4px" }}></i>
                              Locked
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                              <i className="fa-solid fa-lock-open" style={{ marginRight: "4px" }}></i>
                              Unlocked
                            </span>
                          )}
                        </td>
                        <td>
                          {!fac.isSubmitted && (
                            <button
                              className="btn btn-outline"
                              style={{ padding: "4px 10px", fontSize: "11.5px" }}
                              onClick={() => showToast(`Reminder sent to ${fac.name}`)}
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
        )}

        {/* TAB 5: Student Directory Lookup */}
        {activeTab === "directory" && (
          <section className="content-card">
            <div className="content-card-header">
              <div className="card-title-group">
                <h2 className="card-title">
                  <i className="fa-solid fa-address-book" style={{ color: "var(--primary)" }}></i>
                  Student Enrollment &amp; Attendance Directory
                </h2>
                <span className="card-subtitle">
                  Direct student lookup by Roll Number, Name, or Section
                </span>
              </div>

              <div className="card-actions-group">
                <div className="search-input-wrap" style={{ width: "260px" }}>
                  <i className="fa-solid fa-magnifying-glass search-icon"></i>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search Roll No (e.g. 24F81A0532)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="8">
                        <div className="empty-state">
                          <div className="empty-icon-box">
                            <i className="fa-solid fa-user-graduate"></i>
                          </div>
                          <span className="empty-title">No Students Found</span>
                          <span className="empty-subtitle">
                            No students matched your search query.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => (
                      <tr key={st._id || st.rollNo}>
                        <td>
                          <strong style={{ fontFamily: "monospace", fontSize: "13px", color: "var(--primary)" }}>
                            {st.rollNo}
                          </strong>
                        </td>
                        <td>
                          <span style={{ fontWeight: "700" }}>{st.name}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: "600", fontSize: "12px", color: "var(--text-secondary)" }}>
                            {st.className}
                          </span>
                        </td>
                        <td>{st.totalClasses || 0}</td>
                        <td>
                          <strong style={{ color: "var(--success)" }}>{st.attendedClasses || 0}</strong>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              (st.attendanceRate || 0) >= 75
                                ? "safe"
                                : (st.attendanceRate || 0) >= 50
                                ? "warning"
                                : "critical"
                            }`}
                          >
                            {st.attendanceRate !== undefined ? `${st.attendanceRate}%` : "0%"}
                          </span>
                        </td>
                        <td>
                          <a
                            href={`tel:${st.parentPhone}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              color: "var(--primary)",
                              fontWeight: "600",
                              fontSize: "12px",
                            }}
                          >
                            <i className="fa-solid fa-phone"></i>
                            {st.parentPhone || "Not configured"}
                          </a>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline"
                            style={{ padding: "4px 10px", fontSize: "11.5px" }}
                            onClick={() => openStudentModal(st._id)}
                          >
                            <i className="fa-solid fa-id-card"></i> View Profile
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* MODAL 1: Student Detailed Profile */}
      {selectedStudent && (
        <div className="modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                <i className="fa-solid fa-user-graduate" style={{ color: "var(--primary)" }}></i>
                Student Attendance Dossier
              </span>
              <button className="modal-close-btn" onClick={() => setSelectedStudent(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body">
              {/* Student Header Details */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "var(--bg-surface-subtle)",
                  padding: "16px",
                  borderRadius: "12px",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "18px", color: "var(--text-primary)" }}>
                    {selectedStudent.name}
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Roll No: <strong>{selectedStudent.rollNo}</strong> • Class: <strong>{selectedStudent.className}</strong>
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--primary)", marginTop: "4px", fontWeight: "600" }}>
                    <i className="fa-solid fa-phone" style={{ marginRight: "4px" }}></i>
                    Parent Phone: {selectedStudent.parentPhone || "None"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    className={`status-pill ${
                      (selectedStudent.attendanceRate || 0) >= 75 ? "safe" : "critical"
                    }`}
                    style={{ fontSize: "16px", padding: "6px 14px" }}
                  >
                    {selectedStudent.attendanceRate || 0}%
                  </div>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Overall Attendance
                  </span>
                </div>
              </div>

              {/* Attendance Breakdown Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <div style={{ padding: "12px", backgroundColor: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "10px", textAlign: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>TOTAL CONDUCTED</span>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary)" }}>
                    {selectedStudent.totalClasses || 0}
                  </div>
                </div>
                <div style={{ padding: "12px", backgroundColor: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "10px", textAlign: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>PRESENT</span>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--success)" }}>
                    {selectedStudent.attendedClasses || 0}
                  </div>
                </div>
                <div style={{ padding: "12px", backgroundColor: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "10px", textAlign: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>MISSED / ABSENT</span>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--danger)" }}>
                    {selectedStudent.absentClasses || 0}
                  </div>
                </div>
              </div>

              {/* Recent History */}
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "8px" }}>
                  Recent Attendance Entries
                </h4>
                {(!selectedStudent.history || selectedStudent.history.length === 0) ? (
                  <p style={{ fontSize: "12.5px", color: "var(--text-muted)", fontStyle: "italic" }}>
                    No historical attendance entries found for this student.
                  </p>
                ) : (
                  <div className="table-responsive" style={{ maxHeight: "200px" }}>
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudent.history.map((h, i) => (
                          <tr key={i}>
                            <td>{h.date}</td>
                            <td>
                              <span className={`status-pill ${h.status === "P" ? "safe" : "critical"}`}>
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
                onClick={() => openTrilingualNotice(selectedStudent)}
              >
                <i className="fa-brands fa-whatsapp" style={{ color: "#25D366" }}></i> Trilingual Notice
              </button>
              <button className="btn btn-primary" onClick={() => setSelectedStudent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Trilingual Notice Generator */}
      {trilingualNoticeModal && (
        <div className="modal-backdrop" onClick={() => setTrilingualNoticeModal(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                <i className="fa-brands fa-whatsapp" style={{ color: "#25D366" }}></i>
                Trilingual Parent Absence Notice
              </span>
              <button className="modal-close-btn" onClick={() => setTrilingualNoticeModal(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Pre-configured SMS &amp; WhatsApp message for{" "}
                <strong>{trilingualNoticeModal.student.name}</strong> (Roll: {trilingualNoticeModal.student.rollNo}):
              </p>

              {/* English */}
              <div style={{ backgroundColor: "var(--bg-surface-subtle)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <strong style={{ fontSize: "12px", color: "var(--primary)" }}>🇬🇧 English Message</strong>
                  <button
                    className="btn btn-outline"
                    style={{ padding: "2px 8px", fontSize: "11px" }}
                    onClick={() => {
                      navigator.clipboard.writeText(trilingualNoticeModal.english);
                      showToast("English notice copied!");
                    }}
                  >
                    Copy
                  </button>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-primary)" }}>{trilingualNoticeModal.english}</p>
              </div>

              {/* Telugu */}
              <div style={{ backgroundColor: "var(--bg-surface-subtle)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <strong style={{ fontSize: "12px", color: "var(--purple)" }}>🇮🇳 Telugu (తెలుగు) Message</strong>
                  <button
                    className="btn btn-outline"
                    style={{ padding: "2px 8px", fontSize: "11px" }}
                    onClick={() => {
                      navigator.clipboard.writeText(trilingualNoticeModal.telugu);
                      showToast("Telugu notice copied!");
                    }}
                  >
                    Copy
                  </button>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-primary)" }}>{trilingualNoticeModal.telugu}</p>
              </div>

              {/* Tamil */}
              <div style={{ backgroundColor: "var(--bg-surface-subtle)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <strong style={{ fontSize: "12px", color: "var(--info)" }}>🇮🇳 Tamil (தமிழ்) Message</strong>
                  <button
                    className="btn btn-outline"
                    style={{ padding: "2px 8px", fontSize: "11px" }}
                    onClick={() => {
                      navigator.clipboard.writeText(trilingualNoticeModal.tamil);
                      showToast("Tamil notice copied!");
                    }}
                  >
                    Copy
                  </button>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-primary)" }}>{trilingualNoticeModal.tamil}</p>
              </div>
            </div>

            <div className="modal-footer">
              <a
                className="btn btn-success"
                href={`https://wa.me/${(trilingualNoticeModal.student.parentPhone || "").replace(/\+/g, "")}?text=${encodeURIComponent(
                  trilingualNoticeModal.english + "\n\n" + trilingualNoticeModal.telugu + "\n\n" + trilingualNoticeModal.tamil
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <i className="fa-brands fa-whatsapp"></i> Open in WhatsApp
              </a>
              <button className="btn btn-primary" onClick={() => setTrilingualNoticeModal(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mount React Root
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<ExecutiveLeadershipApp />);
