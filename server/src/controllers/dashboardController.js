import Student from "../models/Student.js";
import AttendanceSubmission from "../models/AttendanceSubmission.js";
import Teacher from "../models/Teacher.js";
import Hod from "../models/Hod.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getMonthlySheetBuffer } from "../services/excelService.js";

const getTodayString = () => new Date().toISOString().slice(0, 10);

/**
 * Helper to extract branch, year, section from className (e.g. "CSE_1_A")
 */
const parseClassName = (className = "") => {
  const parts = String(className).split("_");
  return {
    branch: parts[0] || "",
    year: parseInt(parts[1], 10) || 1,
    section: parts[2] || "A",
  };
};

/**
 * 1. Executive Overview KPIs
 * GET /api/dashboard/overview?department=ALL&date=YYYY-MM-DD
 */
export const getOverview = asyncHandler(async (req, res) => {
  const user = req.user;
  const targetDate = req.query.date || getTodayString();
  let department = req.query.department || "ALL";

  // If HOD, enforce their assigned department
  if (user.role === "hod" && user.department) {
    department = user.department;
  }

  // Student filter
  const studentFilter = { isActive: true };
  if (department !== "ALL") {
    studentFilter.className = new RegExp(`^${department}_`, "i");
  }

  // Submissions filter
  const todaySubmissionFilter = { date: targetDate };
  const allSubmissionsFilter = {};
  if (department !== "ALL") {
    todaySubmissionFilter.className = new RegExp(`^${department}_`, "i");
    allSubmissionsFilter.className = new RegExp(`^${department}_`, "i");
  }

  // Current month prefix (e.g. "2026-09")
  const currentMonthPrefix = targetDate.slice(0, 7);
  const monthlySubmissionFilter = {
    ...allSubmissionsFilter,
    date: new RegExp(`^${currentMonthPrefix}`),
  };

  const [
    totalStudents,
    distinctClasses,
    todaySubmissions,
    monthlySubmissions,
    allSubmissions,
  ] = await Promise.all([
    Student.countDocuments(studentFilter),
    Student.distinct("className", studentFilter),
    AttendanceSubmission.find(todaySubmissionFilter),
    AttendanceSubmission.find(monthlySubmissionFilter),
    AttendanceSubmission.find(allSubmissionsFilter).lean(),
  ]);

  // Today's attendance counts
  let todayPresentCount = 0;
  let todayAbsentCount = 0;
  todaySubmissions.forEach((sub) => {
    sub.entries.forEach((e) => {
      if (e.status === "P") todayPresentCount++;
      else if (e.status === "A") todayAbsentCount++;
    });
  });
  const todayTotal = todayPresentCount + todayAbsentCount;
  const todayAttendanceRate = todayTotal > 0 ? Math.round((todayPresentCount / todayTotal) * 1000) / 10 : 0;

  // Monthly average rate
  let monthPresent = 0;
  let monthTotal = 0;
  monthlySubmissions.forEach((sub) => {
    sub.entries.forEach((e) => {
      monthTotal++;
      if (e.status === "P") monthPresent++;
    });
  });
  const monthlyAverageRate = monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 1000) / 10 : todayAttendanceRate;

  // Compute Defaulters across all conducted submissions
  const studentAttendanceMap = {};
  allSubmissions.forEach((sub) => {
    sub.entries.forEach((e) => {
      const sId = String(e.student);
      if (!studentAttendanceMap[sId]) {
        studentAttendanceMap[sId] = { held: 0, attended: 0 };
      }
      studentAttendanceMap[sId].held++;
      if (e.status === "P") studentAttendanceMap[sId].attended++;
    });
  });

  let defaultersCount = 0;
  let criticalCount = 0;
  Object.values(studentAttendanceMap).forEach((st) => {
    if (st.held >= 3) {
      const pct = (st.attended / st.held) * 100;
      if (pct < 75) defaultersCount++;
      if (pct < 50) criticalCount++;
    }
  });

  // Submission compliance
  const totalClasses = distinctClasses.length || 1;
  const submittedCount = todaySubmissions.length;
  const pendingCount = Math.max(0, totalClasses - submittedCount);
  const complianceRate = totalClasses > 0 ? Math.round((submittedCount / totalClasses) * 1000) / 10 : 0;

  // Unique departments count
  const allDepartments = new Set(distinctClasses.map((c) => c.split("_")[0]));

  res.json({
    success: true,
    data: {
      kpi: {
        totalStudents,
        totalSections: distinctClasses.length,
        totalDepartments: allDepartments.size || 1,
        todayAttendanceRate,
        monthlyAverageRate,
        todayPresentCount,
        todayAbsentCount,
        defaultersCount,
        criticalCount,
      },
      submissionCompliance: {
        totalClasses,
        submittedCount,
        pendingCount,
        complianceRate,
      },
      date: targetDate,
      department,
    },
  });
});

/**
 * 2. Department-wise Comparison
 * GET /api/dashboard/departments?date=YYYY-MM-DD
 */
export const getDepartmentStats = asyncHandler(async (req, res) => {
  const targetDate = req.query.date || getTodayString();
  const currentMonthPrefix = targetDate.slice(0, 7);

  const [students, hods, todaySubmissions, monthlySubmissions] = await Promise.all([
    Student.find({ isActive: true }).select("className"),
    Hod.find({ isActive: true }).select("name email department"),
    AttendanceSubmission.find({ date: targetDate }),
    AttendanceSubmission.find({ date: new RegExp(`^${currentMonthPrefix}`) }),
  ]);

  // Group students by branch
  const deptMap = {};
  students.forEach((st) => {
    const branch = st.className.split("_")[0] || "OTHER";
    if (!deptMap[branch]) {
      deptMap[branch] = {
        code: branch,
        studentsCount: 0,
        sections: new Set(),
      };
    }
    deptMap[branch].studentsCount++;
    deptMap[branch].sections.add(st.className);
  });

  // Compute stats per department
  const departments = Object.keys(deptMap).map((branch) => {
    const hod = hods.find((h) => h.department && h.department.toUpperCase() === branch.toUpperCase());
    const deptTodaySubs = todaySubmissions.filter((s) => s.className.startsWith(`${branch}_`));
    const deptMonthSubs = monthlySubmissions.filter((s) => s.className.startsWith(`${branch}_`));

    let tPresent = 0, tTotal = 0;
    deptTodaySubs.forEach((sub) => {
      sub.entries.forEach((e) => {
        tTotal++;
        if (e.status === "P") tPresent++;
      });
    });
    const todayRate = tTotal > 0 ? Math.round((tPresent / tTotal) * 1000) / 10 : 0;

    let mPresent = 0, mTotal = 0;
    deptMonthSubs.forEach((sub) => {
      sub.entries.forEach((e) => {
        mTotal++;
        if (e.status === "P") mPresent++;
      });
    });
    const monthlyRate = mTotal > 0 ? Math.round((mPresent / mTotal) * 1000) / 10 : todayRate;

    const totalSections = deptMap[branch].sections.size;
    const submittedSections = deptTodaySubs.length;
    const pendingSections = Math.max(0, totalSections - submittedSections);

    return {
      code: branch,
      name: branch === "CSE" ? "Computer Science & Engineering"
        : branch === "ECE" ? "Electronics & Communication Engineering"
        : branch === "EEE" ? "Electrical & Electronics Engineering"
        : branch === "MECH" ? "Mechanical Engineering"
        : branch === "CIVIL" ? "Civil Engineering"
        : `${branch} Department`,
      hodName: hod ? hod.name : "To be assigned",
      hodEmail: hod ? hod.email : "",
      totalStudents: deptMap[branch].studentsCount,
      totalSections,
      todayAttendanceRate: todayRate,
      monthlyAverageRate: monthlyRate,
      submittedSections,
      pendingSections,
    };
  });

  res.json({ success: true, departments });
});

/**
 * 3. Sections List & Today's Status
 * GET /api/dashboard/sections?department=ALL&year=1&date=YYYY-MM-DD
 */
export const getSectionsList = asyncHandler(async (req, res) => {
  const targetDate = req.query.date || getTodayString();
  let { department = "ALL", year } = req.query;

  if (req.user.role === "hod" && req.user.department) {
    department = req.user.department;
  }

  const studentFilter = { isActive: true };
  if (department !== "ALL") {
    studentFilter.className = new RegExp(`^${department}_`, "i");
  }
  if (year) {
    studentFilter.className = new RegExp(`^[A-Z]+_${year}_`, "i");
  }

  const [students, teachers, todaySubmissions, monthlySubmissions] = await Promise.all([
    Student.find(studentFilter).select("className"),
    Teacher.find({ isActive: true }).select("name email assignedClass"),
    AttendanceSubmission.find({ date: targetDate }),
    AttendanceSubmission.find({ date: new RegExp(`^${targetDate.slice(0, 7)}`) }),
  ]);

  // Aggregate by section
  const sectionMap = {};
  students.forEach((st) => {
    const cName = st.className;
    if (!sectionMap[cName]) {
      const parsed = parseClassName(cName);
      sectionMap[cName] = {
        className: cName,
        branch: parsed.branch,
        year: parsed.year,
        section: parsed.section,
        enrolledCount: 0,
      };
    }
    sectionMap[cName].enrolledCount++;
  });

  const sections = Object.values(sectionMap).map((sec) => {
    // Find assigned teacher
    const faculty = teachers.find(
      (t) =>
        t.assignedClass &&
        t.assignedClass.branch === sec.branch &&
        t.assignedClass.year === sec.year &&
        t.assignedClass.section === sec.section,
    );

    // Today's submission
    const todaySub = todaySubmissions.find((s) => s.className === sec.className);
    const isSubmitted = !!todaySub;
    let presentCount = 0;
    let absentCount = 0;
    if (todaySub) {
      todaySub.entries.forEach((e) => {
        if (e.status === "P") presentCount++;
        else if (e.status === "A") absentCount++;
      });
    }
    const todayTotal = presentCount + absentCount;
    const attendanceRate = todayTotal > 0 ? Math.round((presentCount / todayTotal) * 1000) / 10 : 0;

    // Monthly average
    const monthSubs = monthlySubmissions.filter((s) => s.className === sec.className);
    let mPresent = 0, mTotal = 0;
    monthSubs.forEach((s) => {
      s.entries.forEach((e) => {
        mTotal++;
        if (e.status === "P") mPresent++;
      });
    });
    const monthlyAverage = mTotal > 0 ? Math.round((mPresent / mTotal) * 1000) / 10 : attendanceRate;

    return {
      className: sec.className,
      branch: sec.branch,
      year: sec.year,
      section: sec.section,
      enrolledCount: sec.enrolledCount,
      faculty: {
        name: faculty ? faculty.name : "Not Assigned",
        email: faculty ? faculty.email : "",
      },
      todayStatus: isSubmitted ? "SUBMITTED" : "PENDING",
      submittedAt: todaySub ? todaySub.createdAt : null,
      presentCount: isSubmitted ? presentCount : 0,
      absentCount: isSubmitted ? absentCount : 0,
      attendanceRate,
      monthlyAverage,
    };
  });

  res.json({ success: true, sections });
});

/**
 * 4. Section Details & Student Attendance Matrix
 * GET /api/dashboard/section-details/:className?date=YYYY-MM-DD
 */
export const getSectionDetails = asyncHandler(async (req, res) => {
  const { className } = req.params;
  const targetDate = req.query.date || getTodayString();
  const currentMonthPrefix = targetDate.slice(0, 7);

  const [students, teacher, todaySub, monthSubs] = await Promise.all([
    Student.find({ className, isActive: true }).sort({ rollNo: 1 }),
    Teacher.findOne({
      "assignedClass.branch": parseClassName(className).branch,
      "assignedClass.year": parseClassName(className).year,
      "assignedClass.section": parseClassName(className).section,
    }).select("name email"),
    AttendanceSubmission.findOne({ className, date: targetDate }),
    AttendanceSubmission.find({ className, date: new RegExp(`^${currentMonthPrefix}`) }),
  ]);

  if (!students.length) {
    const error = new Error(`Section ${className} has no active students.`);
    error.statusCode = 404;
    throw error;
  }

  // Compute student matrix
  const absentees = [];
  const studentsMatrix = students.map((st) => {
    const sId = String(st._id);

    // Compute month stats
    let totalHeld = 0;
    let presentCount = 0;
    let absentCount = 0;

    monthSubs.forEach((sub) => {
      const entry = sub.entries.find((e) => String(e.student) === sId || e.rollNo === st.rollNo);
      if (entry) {
        totalHeld++;
        if (entry.status === "P") presentCount++;
        else if (entry.status === "A") absentCount++;
      }
    });

    // Today's entry
    let todayStatus = "-";
    if (todaySub) {
      const todayEntry = todaySub.entries.find((e) => String(e.student) === sId || e.rollNo === st.rollNo);
      if (todayEntry) {
        todayStatus = todayEntry.status;
        if (todayStatus === "A") {
          absentees.push({
            rollNo: st.rollNo,
            name: st.name,
            parentPhone: st.parentPhone,
          });
        }
      }
    }

    const percentage = totalHeld > 0 ? Math.round((presentCount / totalHeld) * 1000) / 10 : 0;

    return {
      studentId: st._id,
      rollNo: st.rollNo,
      name: st.name,
      parentPhone: st.parentPhone,
      totalHeld,
      presentCount,
      absentCount,
      percentage,
      todayStatus,
    };
  });

  const todayPresent = todaySub ? todaySub.entries.filter((e) => e.status === "P").length : 0;
  const todayAbsent = todaySub ? todaySub.entries.filter((e) => e.status === "A").length : 0;

  res.json({
    success: true,
    section: {
      className,
      faculty: {
        name: teacher ? teacher.name : "Not Assigned",
        email: teacher ? teacher.email : "",
      },
      date: targetDate,
      totalStudents: students.length,
      todayPresent,
      todayAbsent,
      absentees,
      studentsMatrix,
    },
  });
});

/**
 * 5. Student Directory with Attendance Standing
 * GET /api/dashboard/students?department=CSE&status=below75&search=Aarav&page=1&limit=20
 */
export const getStudentsDirectory = asyncHandler(async (req, res) => {
  const { department = "ALL", year, section, status = "all", search = "", page = 1, limit = 50 } = req.query;

  const query = { isActive: true };
  if (department !== "ALL") {
    query.className = new RegExp(`^${department}_`, "i");
  }
  if (year) {
    query.className = new RegExp(`^[A-Z]+_${year}_`, "i");
  }
  if (section) {
    query.className = new RegExp(`^[A-Z]+_[0-9]+_${section}$`, "i");
  }
  if (search.trim()) {
    const sRegex = new RegExp(search.trim(), "i");
    query.$or = [{ name: sRegex }, { rollNo: sRegex }, { parentPhone: sRegex }];
  }

  const [students, allSubmissions] = await Promise.all([
    Student.find(query).sort({ rollNo: 1 }).lean(),
    AttendanceSubmission.find().select("entries").lean(),
  ]);

  // Build attendance map
  const statsMap = {};
  allSubmissions.forEach((sub) => {
    sub.entries.forEach((e) => {
      const sId = String(e.student);
      if (!statsMap[sId]) statsMap[sId] = { conducted: 0, attended: 0 };
      statsMap[sId].conducted++;
      if (e.status === "P") statsMap[sId].attended++;
    });
  });

  // Attach percentages and status
  let processed = students.map((st) => {
    const sId = String(st._id);
    const stats = statsMap[sId] || { conducted: 0, attended: 0 };
    const percentage = stats.conducted > 0 ? Math.round((stats.attended / stats.conducted) * 1000) / 10 : 100;
    const parsed = parseClassName(st.className);

    let statusCategory = "GOOD";
    if (percentage < 65) statusCategory = "CRITICAL";
    else if (percentage < 75) statusCategory = "SHORTAGE";

    return {
      id: st._id,
      rollNo: st.rollNo,
      name: st.name,
      className: st.className,
      branch: parsed.branch,
      year: parsed.year,
      section: parsed.section,
      parentPhone: st.parentPhone,
      totalConducted: stats.conducted,
      totalAttended: stats.attended,
      percentage,
      statusCategory,
    };
  });

  // Filter by status category if requested
  if (status === "below75") {
    processed = processed.filter((st) => st.percentage < 75);
  } else if (status === "critical50") {
    processed = processed.filter((st) => st.percentage < 50);
  } else if (status === "good") {
    processed = processed.filter((st) => st.percentage >= 75);
  }

  // Pagination
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const paginated = processed.slice(skip, skip + parseInt(limit, 10));

  res.json({
    success: true,
    total: processed.length,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    students: paginated,
  });
});

/**
 * 6. Individual Student 360 Profile
 * GET /api/dashboard/student/:id
 */
export const getStudentProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const student = await Student.findById(id);

  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }

  // Find all attendance records containing this student
  const submissions = await AttendanceSubmission.find({
    "entries.student": student._id,
  })
    .sort({ date: -1 })
    .populate("teacher", "name email")
    .lean();

  let totalClasses = 0;
  let classesAttended = 0;
  const monthlyMap = {};
  const recentAbsences = [];

  submissions.forEach((sub) => {
    const entry = sub.entries.find((e) => String(e.student) === String(student._id));
    if (entry) {
      totalClasses++;
      if (entry.status === "P") classesAttended++;
      else {
        recentAbsences.push({
          date: sub.date,
          className: sub.className,
          recordedBy: sub.teacher ? sub.teacher.name : "Faculty",
          smsStatus: "sent",
        });
      }

      // Group by month
      const monthKey = `${sub.year}-${String(sub.month).padStart(2, "0")}`;
      if (!monthlyMap[monthKey]) {
        const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthlyMap[monthKey] = {
          month: monthNames[sub.month] || `Month ${sub.month}`,
          year: sub.year,
          total: 0,
          attended: 0,
        };
      }
      monthlyMap[monthKey].total++;
      if (entry.status === "P") monthlyMap[monthKey].attended++;
    }
  });

  const percentage = totalClasses > 0 ? Math.round((classesAttended / totalClasses) * 1000) / 10 : 0;
  const monthlyBreakdown = Object.values(monthlyMap).map((m) => ({
    ...m,
    percent: m.total > 0 ? Math.round((m.attended / m.total) * 1000) / 10 : 0,
  }));

  const parsed = parseClassName(student.className);

  res.json({
    success: true,
    student: {
      id: student._id,
      name: student.name,
      rollNo: student.rollNo,
      className: student.className,
      branch: parsed.branch,
      year: parsed.year,
      section: parsed.section,
      parentPhone: student.parentPhone,
      overallStats: {
        totalClasses,
        classesAttended,
        classesAbsent: totalClasses - classesAttended,
        percentage,
        status: percentage >= 75 ? "GOOD" : percentage >= 65 ? "SHORTAGE" : "CRITICAL",
      },
      monthlyBreakdown,
      recentAbsences: recentAbsences.slice(0, 20),
    },
  });
});

/**
 * 7. Low Attendance Defaulters List
 * GET /api/dashboard/defaulters?threshold=75&department=ALL
 */
export const getDefaulters = asyncHandler(async (req, res) => {
  const threshold = parseFloat(req.query.threshold) || 75;
  let { department = "ALL", year, section } = req.query;

  if (req.user.role === "hod" && req.user.department) {
    department = req.user.department;
  }

  const query = { isActive: true };
  if (department !== "ALL") query.className = new RegExp(`^${department}_`, "i");
  if (year) query.className = new RegExp(`^[A-Z]+_${year}_`, "i");
  if (section) query.className = new RegExp(`^[A-Z]+_[0-9]+_${section}$`, "i");

  const [students, allSubmissions] = await Promise.all([
    Student.find(query).lean(),
    AttendanceSubmission.find().select("entries").lean(),
  ]);

  const statsMap = {};
  allSubmissions.forEach((sub) => {
    sub.entries.forEach((e) => {
      const sId = String(e.student);
      if (!statsMap[sId]) statsMap[sId] = { held: 0, attended: 0 };
      statsMap[sId].held++;
      if (e.status === "P") statsMap[sId].attended++;
    });
  });

  const defaulters = [];
  students.forEach((st) => {
    const sId = String(st._id);
    const stats = statsMap[sId] || { held: 0, attended: 0 };
    if (stats.held >= 3) {
      const pct = Math.round((stats.attended / stats.held) * 1000) / 10;
      if (pct < threshold) {
        // Formula: x = ceil((0.75 * N - P) / 0.25) = ceil(3N - 4P)
        const daysNeeded = Math.max(0, Math.ceil((threshold / 100 * stats.held - stats.attended) / (1 - threshold / 100)));
        const parsed = parseClassName(st.className);

        defaulters.push({
          studentId: st._id,
          rollNo: st.rollNo,
          name: st.name,
          className: st.className,
          branch: parsed.branch,
          year: parsed.year,
          section: parsed.section,
          parentPhone: st.parentPhone,
          totalHeld: stats.held,
          attended: stats.attended,
          percentage: pct,
          daysNeededFor75: daysNeeded,
          riskLevel: pct < 50 ? "CRITICAL" : pct < 65 ? "HIGH" : "WARNING",
        });
      }
    }
  });

  defaulters.sort((a, b) => a.percentage - b.percentage);

  res.json({
    success: true,
    threshold,
    totalDefaulters: defaulters.length,
    defaulters,
  });
});

/**
 * 8. Faculty Compliance Tracker
 * GET /api/dashboard/faculty-status?date=YYYY-MM-DD&department=ALL
 */
export const getFacultyCompliance = asyncHandler(async (req, res) => {
  const targetDate = req.query.date || getTodayString();
  let { department = "ALL" } = req.query;

  if (req.user.role === "hod" && req.user.department) {
    department = req.user.department;
  }

  const studentFilter = { isActive: true };
  if (department !== "ALL") studentFilter.className = new RegExp(`^${department}_`, "i");

  const [distinctClasses, teachers, submissions] = await Promise.all([
    Student.distinct("className", studentFilter),
    Teacher.find({ isActive: true }).select("name email assignedClass"),
    AttendanceSubmission.find({ date: targetDate }),
  ]);

  const facultyList = distinctClasses.map((cName) => {
    const parsed = parseClassName(cName);
    const teacher = teachers.find(
      (t) =>
        t.assignedClass &&
        t.assignedClass.branch === parsed.branch &&
        t.assignedClass.year === parsed.year &&
        t.assignedClass.section === parsed.section,
    );

    const sub = submissions.find((s) => s.className === cName);
    let presentRate = null;
    if (sub) {
      const p = sub.entries.filter((e) => e.status === "P").length;
      const total = sub.entries.length;
      presentRate = total > 0 ? Math.round((p / total) * 1000) / 10 : 0;
    }

    return {
      className: cName,
      branch: parsed.branch,
      year: parsed.year,
      section: parsed.section,
      facultyName: teacher ? teacher.name : "Not Assigned",
      facultyEmail: teacher ? teacher.email : "",
      status: sub ? "SUBMITTED" : "PENDING",
      submissionTime: sub ? new Date(sub.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null,
      presentRate,
    };
  });

  const submitted = facultyList.filter((f) => f.status === "SUBMITTED").length;

  res.json({
    success: true,
    date: targetDate,
    summary: {
      totalClasses: facultyList.length,
      submitted,
      pending: facultyList.length - submitted,
    },
    facultyList,
  });
});

/**
 * 9. Time-Series Trends for Charts
 * GET /api/dashboard/trends?days=14&department=ALL
 */
export const getAttendanceTrends = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 14;
  let { department = "ALL" } = req.query;

  if (req.user.role === "hod" && req.user.department) {
    department = req.user.department;
  }

  // Generate date list backwards from today
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const filter = { date: { $in: dates } };
  if (department !== "ALL") filter.className = new RegExp(`^${department}_`, "i");

  const submissions = await AttendanceSubmission.find(filter).lean();

  const dayMap = {};
  dates.forEach((d) => {
    dayMap[d] = { present: 0, total: 0 };
  });

  submissions.forEach((sub) => {
    if (dayMap[sub.date]) {
      sub.entries.forEach((e) => {
        dayMap[sub.date].total++;
        if (e.status === "P") dayMap[sub.date].present++;
      });
    }
  });

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeekStats = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [] };

  const trend = dates.map((dStr) => {
    const dObj = new Date(dStr);
    const dayName = dayNames[dObj.getDay()];
    const stat = dayMap[dStr];
    const absent = Math.max(0, stat.total - stat.present);
    const attendanceRate = stat.total > 0 ? Math.round((stat.present / stat.total) * 1000) / 10 : 0;

    if (dayOfWeekStats[dayName] && stat.total > 0) {
      dayOfWeekStats[dayName].push(attendanceRate);
    }

    return {
      date: dStr,
      day: dayName,
      attendanceRate,
      present: stat.present,
      absent,
    };
  });

  const dayOfWeekDistribution = {};
  Object.entries(dayOfWeekStats).forEach(([day, rates]) => {
    dayOfWeekDistribution[day] = rates.length > 0 ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 10) / 10 : 85.0;
  });

  res.json({
    success: true,
    days,
    trend,
    dayOfWeekDistribution,
  });
});

/**
 * 10. Consolidated Excel Export
 * GET /api/dashboard/export/excel?className=CSE_1_A&date=YYYY-MM-DD
 */
export const exportExcel = asyncHandler(async (req, res) => {
  const { className = "CSE_1_A", date = getTodayString() } = req.query;

  const buffer = await getMonthlySheetBuffer({ className, date });
  if (!buffer) {
    const error = new Error(`Unable to generate Excel sheet for ${className}`);
    error.statusCode = 404;
    throw error;
  }

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=GKCE_${className}_Register.xlsx`);
  res.send(buffer);
});
