import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./BranchExplorer.css";
import { AttendanceGraph } from "../AttendanceGraph/AttendanceGraph.jsx";

const BRANCHES = [
  { code: "CSE", name: "Computer Science & Engineering", icon: "fa-solid fa-laptop-code", color: "#2563eb" },
  { code: "ECE", name: "Electronics & Communication Engineering", icon: "fa-solid fa-microchip", color: "#7c3aed" },
  { code: "MECH", name: "Mechanical Engineering", icon: "fa-solid fa-gear", color: "#ea580c" },
  { code: "CIVIL", name: "Civil Engineering", icon: "fa-solid fa-building", color: "#059669" },
  { code: "EEE", name: "Electrical & Electronics Engineering", icon: "fa-solid fa-bolt", color: "#d97706" },
];

export const BranchExplorer = ({
  token,
  activeRole,
  selectedBranch = "CSE",
  onSelectBranch,
  selectedDate,
  onOpenNotice,
  onViewStudent,
  onNavigateTab,
}) => {
  const [currentBranch, setCurrentBranch] = useState(selectedBranch || "CSE");
  const [trendDays, setTrendDays] = useState(14);
  const [trendsData, setTrendsData] = useState(null);
  const [defaulters, setDefaulters] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Defaulters List
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL"); // ALL | CRITICAL | HIGH | WARNING

  // Synchronize when selectedBranch prop changes
  useEffect(() => {
    if (selectedBranch && selectedBranch !== "ALL") {
      setCurrentBranch(selectedBranch);
    }
  }, [selectedBranch]);

  // Lock branch if HOD
  const isHod = activeRole?.department && activeRole.department !== "ALL";
  const effectiveBranch = isHod ? activeRole.department : currentBranch;

  // Fetch branch-specific data
  const fetchBranchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      const [trendRes, defRes, secRes] = await Promise.all([
        fetch(`/api/dashboard/trends?department=${effectiveBranch}&days=${trendDays}`, { headers }),
        fetch(`/api/dashboard/defaulters?department=${effectiveBranch}&threshold=75`, { headers }),
        fetch(`/api/dashboard/sections?department=${effectiveBranch}&date=${selectedDate}`, { headers }),
      ]);

      if (trendRes.ok) {
        const tr = await trendRes.json();
        setTrendsData(tr);
      }
      if (defRes.ok) {
        const def = await defRes.json();
        setDefaulters(def.defaulters || []);
      }
      if (secRes.ok) {
        const sec = await secRes.json();
        setSections(sec.sections || []);
      }
    } catch (err) {
      console.error("Error fetching branch details:", err);
    } finally {
      setLoading(false);
    }
  }, [token, effectiveBranch, trendDays, selectedDate]);

  useEffect(() => {
    fetchBranchData();
  }, [fetchBranchData]);

  const handleBranchChange = (code) => {
    if (isHod) return; // locked for HOD
    setCurrentBranch(code);
    if (onSelectBranch) onSelectBranch(code);
  };

  const branchMeta = BRANCHES.find((b) => b.code === effectiveBranch) || BRANCHES[0];

  // Compute Branch Stats
  const totalStudents = useMemo(() => {
    return sections.reduce((acc, s) => acc + (s.totalStudents || 0), 0);
  }, [sections]);

  const submittedSectionsCount = useMemo(() => {
    return sections.filter((s) => s.isSubmitted).length;
  }, [sections]);

  const todayAvgRate = useMemo(() => {
    const sum = sections.reduce((acc, s) => acc + (s.attendanceRate || 0), 0);
    return sections.length > 0 ? (sum / sections.length).toFixed(1) : "0.0";
  }, [sections]);

  // Filtered Defaulters
  const filteredDefaulters = useMemo(() => {
    return defaulters.filter((d) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (d.name || "").toLowerCase().includes(q);
        const matchesRoll = (d.rollNo || "").toLowerCase().includes(q);
        const matchesPhone = (d.parentPhone || "").includes(q);
        if (!matchesName && !matchesRoll && !matchesPhone) return false;
      }
      // Year Filter
      if (yearFilter !== "ALL") {
        if (String(d.year) !== String(yearFilter)) return false;
      }
      // Severity Filter
      if (severityFilter !== "ALL") {
        if (severityFilter === "CRITICAL" && (d.percentage >= 50 || d.riskLevel !== "CRITICAL")) return false;
        if (severityFilter === "HIGH" && (d.percentage < 50 || d.percentage >= 65)) return false;
        if (severityFilter === "WARNING" && d.percentage < 65) return false;
      }
      return true;
    });
  }, [defaulters, searchQuery, yearFilter, severityFilter]);

  // Export CSV of Defaulters
  const exportDefaultersCSV = () => {
    if (!filteredDefaulters.length) return;
    const headers = ["Roll No", "Student Name", "Class", "Parent Phone", "Classes Held", "Attended", "Attendance %", "Days Needed for 75%", "Risk Level"];
    const rows = filteredDefaulters.map((s) => [
      `"${s.rollNo}"`,
      `"${s.name}"`,
      `"${s.className}"`,
      `"${s.parentPhone}"`,
      s.totalHeld,
      s.attended,
      `"${s.percentage}%"`,
      s.daysNeededFor75,
      `"${s.riskLevel}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GKCE_${effectiveBranch}_Defaulters_Below_75.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Official Word Document (.docx)
  const downloadDefaultersDocx = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/dashboard/export/docx?department=${effectiveBranch}&threshold=75`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to export Word document");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GKCE_${effectiveBranch}_Attendance_Shortage_Report.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Docx export error:", err);
    }
  };

  return (
    <div className="branch-explorer-container">
      {/* 1. Branch Selector Header */}
      <section className="branch-header-card">
        <div className="branch-header-top">
          <div className="branch-identity">
            <div className="branch-icon-badge" style={{ backgroundColor: `${branchMeta.color}15`, color: branchMeta.color }}>
              <i className={branchMeta.icon}></i>
            </div>
            <div>
              <div className="branch-badge-row">
                <span className="branch-code-badge" style={{ backgroundColor: branchMeta.color }}>
                  {effectiveBranch} DEPARTMENT
                </span>
                {isHod && <span className="hod-locked-badge"><i className="fa-solid fa-lock"></i> Assigned HOD View</span>}
              </div>
              <h2 className="branch-full-name">{branchMeta.name}</h2>
              <p className="branch-meta-subtitle">
                Academic attendance intelligence, turnout analytics, and under-75% shortage monitoring for {selectedDate}
              </p>
            </div>
          </div>

          {/* Branch Switching Pills (if Principal / Dean / Admin) */}
          {!isHod && (
            <div className="branch-picker-pills">
              {BRANCHES.map((b) => (
                <button
                  key={b.code}
                  className={`branch-pill-btn ${effectiveBranch === b.code ? "active" : ""}`}
                  onClick={() => handleBranchChange(b.code)}
                >
                  <i className={b.icon}></i>
                  <span>{b.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Branch Summary Metrics Strip */}
        <div className="branch-stats-strip">
          <div className="branch-stat-box">
            <span className="stat-label">Total Students</span>
            <strong className="stat-value">{totalStudents}</strong>
            <span className="stat-hint">Enrolled across {sections.length} sections</span>
          </div>

          <div className="branch-stat-box">
            <span className="stat-label">Today's Attendance</span>
            <strong className={`stat-value ${Number(todayAvgRate) >= 75 ? "text-good" : "text-low"}`}>
              {todayAvgRate}%
            </strong>
            <span className="stat-hint">
              {submittedSectionsCount}/{sections.length} sections submitted
            </span>
          </div>

          <div className="branch-stat-box highlight-danger">
            <span className="stat-label">
              <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444", marginRight: "4px" }}></i>
              Defaulters (&lt;75%)
            </span>
            <strong className="stat-value text-danger">{defaulters.length}</strong>
            <span className="stat-hint">Require condonation / parent alert</span>
          </div>

          <div className="branch-stat-box">
            <span className="stat-label">Critical Cases (&lt;50%)</span>
            <strong className="stat-value text-critical">
              {defaulters.filter((d) => d.percentage < 50).length}
            </strong>
            <span className="stat-hint">At risk of semester detention</span>
          </div>
        </div>
      </section>

      {/* 2. Dedicated Branch Attendance Graph */}
      <AttendanceGraph
        trendsData={trendsData}
        selectedDays={trendDays}
        onDaysChange={setTrendDays}
      />

      {/* 3. Class & Section Summary Quick Cards */}
      <section className="branch-sections-grid-section">
        <div className="section-title-row">
          <h3 className="section-title">
            <i className="fa-solid fa-chalkboard-user" style={{ color: "#2563eb", marginRight: "8px" }}></i>
            {effectiveBranch} Classes &amp; Sections Overview
          </h3>
          <span className="section-count-badge">{sections.length} Sections</span>
        </div>

        <div className="branch-sections-grid">
          {sections.map((sec) => {
            const isGood = sec.attendanceRate >= 75;
            const isMed = sec.attendanceRate >= 60 && sec.attendanceRate < 75;
            const rateColor = isGood ? "#059669" : isMed ? "#d97706" : "#dc2626";

            return (
              <div key={sec.className} className="section-mini-card">
                <div className="section-card-top">
                  <div>
                    <h4 className="sec-class-name">Year {sec.year} - Sec {sec.section}</h4>
                    <span className="sec-class-tag">{sec.className}</span>
                  </div>
                  <div className="sec-rate-badge" style={{ color: rateColor, backgroundColor: `${rateColor}15` }}>
                    {sec.attendanceRate}%
                  </div>
                </div>

                <div className="sec-progress-bar">
                  <div
                    className="sec-progress-fill"
                    style={{
                      width: `${Math.min(100, Math.max(6, sec.attendanceRate))}%`,
                      backgroundColor: rateColor,
                    }}
                  ></div>
                </div>

                <div className="sec-meta-row">
                  <span><strong>{sec.totalStudents}</strong> Students</span>
                  <span><strong>{sec.presentCount}</strong> Present</span>
                  <span><strong>{sec.absentCount}</strong> Absent</span>
                </div>

                <div className="sec-faculty-row">
                  <i className="fa-solid fa-user-tie"></i>
                  <span>{sec.teacherName || "Faculty In-Charge"}</span>
                  <span className={`sub-status-pill ${sec.isSubmitted ? "submitted" : "pending"}`}>
                    {sec.isSubmitted ? "Submitted" : "Pending"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Students Below 75% Attendance (Defaulter & Shortage Directory) */}
      <section className="defaulters-management-card">
        <div className="defaulters-card-header">
          <div>
            <div className="header-title-with-badge">
              <h3 className="card-title">
                <i className="fa-solid fa-user-xmark" style={{ color: "#ef4444", marginRight: "8px" }}></i>
                {effectiveBranch} Students Below 75% Attendance Threshold
              </h3>
              <span className="defaulters-counter-badge">
                {filteredDefaulters.length} Defaulters
              </span>
            </div>
            <p className="card-desc">
              Mandatory shortage roster with parent contact details, recovery requirements, and 1-click trilingual parent notices
            </p>
          </div>

          <div className="header-action-buttons">
            <button
              className="btn btn-primary btn-sm docx-download-btn"
              onClick={downloadDefaultersDocx}
              disabled={!filteredDefaulters.length}
              title="Download Official Shortage Report in Microsoft Word (.docx) Format"
            >
              <i className="fa-solid fa-file-word"></i> Download Official Report (.docx)
            </button>
            <button className="btn btn-outline btn-sm" onClick={exportDefaultersCSV} disabled={!filteredDefaulters.length}>
              <i className="fa-solid fa-file-csv"></i> Export CSV
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="defaulters-filter-toolbar">
          <div className="search-input-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search by student name, roll number, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          <div className="filter-select-group">
            {/* Year Filter */}
            <div className="filter-item">
              <label>Year:</label>
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                <option value="ALL">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="filter-item">
              <label>Shortage Severity:</label>
              <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                <option value="ALL">All Shortages (&lt;75%)</option>
                <option value="CRITICAL">Critical Detention (&lt;50%)</option>
                <option value="HIGH">High Shortage (50% - 64.9%)</option>
                <option value="WARNING">Condonation Risk (65% - 74.9%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Defaulters Table */}
        <div className="defaulters-table-container">
          {loading ? (
            <div className="table-loading-state">
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <span>Loading {effectiveBranch} attendance defaulters...</span>
            </div>
          ) : filteredDefaulters.length === 0 ? (
            <div className="table-empty-state">
              <div className="empty-check-icon">
                <i className="fa-solid fa-shield-heart"></i>
              </div>
              <h4>No Attendance Defaulters Found</h4>
              <p>All matching {effectiveBranch} students are meeting or exceeding the 75% attendance criteria!</p>
            </div>
          ) : (
            <table className="defaulters-table">
              <thead>
                <tr>
                  <th>STUDENT &amp; ROLL NO</th>
                  <th>CLASS / SECTION</th>
                  <th>ATTENDANCE %</th>
                  <th>CLASSES LOGGED</th>
                  <th>RECOVERY NEEDED</th>
                  <th>PARENT CONTACT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredDefaulters.map((st) => {
                  const isCrit = st.percentage < 50;
                  const isHigh = st.percentage >= 50 && st.percentage < 65;
                  const severityTag = isCrit ? "critical" : isHigh ? "high" : "warning";
                  const severityText = isCrit ? "Critical (<50%)" : isHigh ? "High Shortage" : "Warning Shortage";

                  return (
                    <tr key={st.studentId || st.rollNo}>
                      <td>
                        <div className="student-profile-cell">
                          <div className={`student-avatar ${severityTag}`}>
                            {st.name ? st.name.charAt(0) : "S"}
                          </div>
                          <div className="student-names">
                            <span className="student-name" onClick={() => onViewStudent && onViewStudent(st.studentId)}>
                              {st.name}
                            </span>
                            <span className="student-roll">{st.rollNo}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="class-badge">
                          Year {st.year} • Sec {st.section}
                        </span>
                        <span className="class-code">{st.className}</span>
                      </td>

                      <td>
                        <div className="rate-cell">
                          <span className={`rate-badge ${severityTag}`}>
                            {st.percentage}%
                          </span>
                          <span className={`severity-subtag ${severityTag}`}>
                            {severityText}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="classes-count-cell">
                          <span className="classes-attended">
                            <strong>{st.attended}</strong> / {st.totalHeld} Attended
                          </span>
                          <span className="classes-absent">
                            ({st.totalHeld - st.attended} Absent)
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="recovery-cell">
                          <span className="recovery-days">
                            <strong>+{st.daysNeededFor75}</strong> consecutive days
                          </span>
                          <span className="recovery-sub">to reach 75%</span>
                        </div>
                      </td>

                      <td>
                        <div className="parent-contact-cell">
                          <div className="phone-line">
                            <i className="fa-solid fa-phone" style={{ color: "#2563eb" }}></i>
                            <a href={`tel:${st.parentPhone}`} className="parent-phone-link">
                              {st.parentPhone || "No Phone"}
                            </a>
                          </div>
                          <span className="parent-label">Guardian / Parent</span>
                        </div>
                      </td>

                      <td>
                        <div className="action-buttons-cell">
                          {/* Trilingual Notice Trigger */}
                          <button
                            className="btn btn-warning-subtle btn-sm action-btn"
                            title="Send Trilingual WhatsApp / SMS Notice (English, Telugu, Hindi)"
                            onClick={() =>
                              onOpenNotice &&
                              onOpenNotice({
                                id: st.studentId,
                                name: st.name,
                                rollNo: st.rollNo,
                                className: st.className,
                                parentPhone: st.parentPhone,
                                attendanceRate: st.percentage,
                              })
                            }
                          >
                            <i className="fa-brands fa-whatsapp"></i>
                            <span>Send Notice</span>
                          </button>

                          {/* Profile Drilldown */}
                          <button
                            className="btn btn-outline btn-sm action-btn icon-only"
                            title="View Student 360 Profile"
                            onClick={() => onViewStudent && onViewStudent(st.studentId)}
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default BranchExplorer;
