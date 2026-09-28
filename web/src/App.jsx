import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";

import { ROLES } from "./config/roles.js";
import { Sidebar } from "./components/Sidebar/Sidebar.jsx";
import { Header } from "./components/Header/Header.jsx";
import { Footer } from "./components/Footer/Footer.jsx";
import { ScopeBanner } from "./components/ScopeBanner/ScopeBanner.jsx";
import { TabsNav } from "./components/TabsNav/TabsNav.jsx";
import { SiteDashboard } from "./components/SiteDashboard/SiteDashboard.jsx";
import { BranchExplorer } from "./components/BranchExplorer/BranchExplorer.jsx";
import { DepartmentComparison } from "./components/DepartmentComparison/DepartmentComparison.jsx";
import { SectionMatrix } from "./components/SectionMatrix/SectionMatrix.jsx";
import { FacultyLog } from "./components/FacultyLog/FacultyLog.jsx";
import { StudentDirectory } from "./components/StudentDirectory/StudentDirectory.jsx";
import { StudentModal } from "./components/StudentModal/StudentModal.jsx";
import { TrilingualNoticeModal } from "./components/TrilingualNoticeModal/TrilingualNoticeModal.jsx";
import { Toast } from "./components/Toast/Toast.jsx";

const getTodayDateStr = () => new Date().toISOString().slice(0, 10);

export function App() {
  const [activeRoleKey, setActiveRoleKey] = useState("principal");
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [activeTab, setActiveTab] = useState("site_dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data States
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [facultyStatus, setFacultyStatus] = useState([]);
  const [students, setStudents] = useState([]);
  const [trendsData, setTrendsData] = useState(null);
  const [trendDays, setTrendDays] = useState(14);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Feedback
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [trilingualNoticeModal, setTrilingualNoticeModal] = useState(null);
  const [toast, setToast] = useState(null);

  const activeRole = ROLES[activeRoleKey] || ROLES.principal;

  // Show Toast helper
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
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
      }
      return null;
    } catch (err) {
      console.error("Auth error:", err);
      return null;
    }
  }, []);

  // 2. Fetch Dashboard Data
  const fetchData = useCallback(
    async (authToken) => {
      const t = authToken || token;
      if (!t) return;
      setLoading(true);

      const deptParam = activeRole.department !== "ALL" ? activeRole.department : selectedDepartment;
      const headers = {
        Authorization: `Bearer ${t}`,
        "Content-Type": "application/json",
      };

      try {
        const [ovRes, deptRes, secRes, facRes, stuRes, trendRes] = await Promise.all([
          fetch(`/api/dashboard/overview?department=${deptParam}&date=${selectedDate}`, { headers }),
          fetch(`/api/dashboard/departments?date=${selectedDate}`, { headers }),
          fetch(`/api/dashboard/sections?department=${deptParam}&date=${selectedDate}`, { headers }),
          fetch(`/api/dashboard/faculty-status?date=${selectedDate}`, { headers }),
          fetch(`/api/dashboard/students?department=${deptParam}`, { headers }),
          fetch(`/api/dashboard/trends?department=${deptParam}&days=${trendDays}`, { headers }),
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
        if (facRes.ok) {
          const fcData = await facRes.json();
          setFacultyStatus(fcData.facultyStatus || fcData.facultyList || []);
        }
        if (stuRes.ok) {
          const stData = await stuRes.json();
          setStudents(stData.students || []);
        }
        if (trendRes && trendRes.ok) {
          const trData = await trendRes.json();
          setTrendsData(trData);
        }
      } catch (err) {
        console.error("Fetch dashboard error:", err);
        showToast("Could not load latest attendance stats", "error");
      } finally {
        setLoading(false);
      }
    },
    [token, activeRole.department, selectedDepartment, selectedDate, trendDays],
  );

  // Initial authentication & data load
  useEffect(() => {
    authenticateRole(activeRoleKey).then((newToken) => {
      if (newToken) {
        fetchData(newToken);
      }
    });
  }, [activeRoleKey, authenticateRole, fetchData]);

  // Refetch when date, department, or trend days filter changes
  useEffect(() => {
    if (token) {
      fetchData(token);
    }
  }, [selectedDate, selectedDepartment, trendDays, fetchData, token]);

  // Handle Role Change with instant token renewal & fetch
  const handleRoleChange = async (e) => {
    const newKey = e.target.value;
    setActiveRoleKey(newKey);
    const newRole = ROLES[newKey] || ROLES.principal;
    if (newRole && newRole.department !== "ALL") {
      setSelectedDepartment(newRole.department);
    } else {
      setSelectedDepartment("ALL");
    }
    const newToken = await authenticateRole(newKey);
    if (newToken) {
      await fetchData(newToken);
    }
    showToast(`Switched view to ${newRole.name} (${newRole.roleTag})`);
  };

  // Open Student Details Modal
  const openStudentModal = async (studentId) => {
    if (!token) return;
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

  // Copy notice text to clipboard
  const handleCopyNotice = (text, lang) => {
    navigator.clipboard.writeText(text);
    showToast(`${lang} notice copied to clipboard!`);
  };

  // Export Excel
  const handleExportExcel = () => {
    const dept = activeRole.department !== "ALL" ? activeRole.department : selectedDepartment;
    const month = selectedDate.slice(0, 7);
    window.open(`/api/dashboard/export/excel?department=${dept}&month=${month}`, "_blank");
    showToast("Downloading GKCE Attendance Excel Sheet...");
  };

  // Export Word Document (.docx) for HODs & Deans
  const handleExportDocx = async (targetDept) => {
    if (!token) return;
    const dept = targetDept || (activeRole.department !== "ALL" ? activeRole.department : selectedDepartment);
    try {
      showToast(`Generating Official Attendance Shortage Report (.docx) for ${dept}...`);
      const res = await fetch(`/api/dashboard/export/docx?department=${dept}&threshold=75`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to export Word document");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GKCE_${dept}_Attendance_Shortage_Report.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast(`Official Word Report for ${dept} downloaded successfully!`);
    } catch (err) {
      console.error("Docx export error:", err);
      showToast("Error generating Word document", "error");
    }
  };

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
    <div className="app-layout">
      {/* Toast Feedback */}
      <Toast toast={toast} />

      {/* White Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeRole={activeRole}
        overview={overview}
        departmentsCount={departments.length}
        sectionsCount={sections.length}
        facultyCount={facultyStatus.length}
        studentsCount={students.length}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className="app-main-area">
        {/* Header */}
        <Header
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          activeRoleKey={activeRoleKey}
          onRoleChange={handleRoleChange}
          onRefresh={() => fetchData()}
          onExportExcel={handleExportExcel}
          onExportDocx={() => handleExportDocx()}
          loading={loading}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Main Content */}
        <main className="main-content">
          {/* Scope Banner */}
          <ScopeBanner
            activeRole={activeRole}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
          />

          {/* Tab Navigation Pill Bar */}
          <TabsNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            departmentsCount={departments.length}
            sectionsCount={sections.length}
            facultyCount={facultyStatus.length}
            studentsCount={students.length}
          />

          {/* Tab 0: Site Dashboard (Main Executive View) */}
          {activeTab === "site_dashboard" && (
            <SiteDashboard
              activeRole={activeRole}
              selectedDate={selectedDate}
              overview={overview}
              departments={departments}
              sections={sections}
              facultyStatus={facultyStatus}
              trendsData={trendsData}
              selectedDays={trendDays}
              onDaysChange={setTrendDays}
              onNavigateTab={setActiveTab}
              onSendReminder={(facName) => showToast(`Reminder sent to ${facName}`)}
              onExportExcel={handleExportExcel}
              onExportDocx={() => handleExportDocx()}
              onViewStudent={openStudentModal}
            />
          )}

          {/* Tab 1: Dedicated Branch Intelligence */}
          {activeTab === "branches" && (
            <BranchExplorer
              token={token}
              activeRole={activeRole}
              selectedBranch={selectedDepartment !== "ALL" ? selectedDepartment : "CSE"}
              onSelectBranch={setSelectedDepartment}
              selectedDate={selectedDate}
              onOpenNotice={openTrilingualNotice}
              onViewStudent={openStudentModal}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* Tab 2: Department Comparison */}
          {activeTab === "departments" && (
            <DepartmentComparison
              departments={departments}
              onInspectDept={(deptCode) => {
                setSelectedDepartment(deptCode);
                setActiveTab("branches");
              }}
            />
          )}

          {/* Tab 2: Classes & Sections Matrix */}
          {activeTab === "sections" && (
            <SectionMatrix
              sections={sections}
              selectedDate={selectedDate}
              onViewRoster={(className) => {
                setSearchQuery(className);
                setActiveTab("directory");
              }}
            />
          )}

          {/* Tab 3: Faculty Submission Log */}
          {activeTab === "faculty" && (
            <FacultyLog
              facultyStatus={facultyStatus}
              selectedDate={selectedDate}
              onSendReminder={(facName) => showToast(`Reminder sent to ${facName}`)}
            />
          )}

          {/* Tab 4: Student Directory Lookup */}
          {activeTab === "directory" && (
            <StudentDirectory
              students={filteredStudents}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onViewStudent={openStudentModal}
            />
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Modals */}
      <StudentModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onOpenNotice={openTrilingualNotice}
      />

      <TrilingualNoticeModal
        noticeData={trilingualNoticeModal}
        onClose={() => setTrilingualNoticeModal(null)}
        onCopyNotice={handleCopyNotice}
      />
    </div>
  );
}

export default App;
