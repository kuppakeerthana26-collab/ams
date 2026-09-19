import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

# Define Palette
C_NAVY_DARK = colors.HexColor("#0F172A")
C_NAVY_CARD = colors.HexColor("#1E293B")
C_PRIMARY = colors.HexColor("#2563EB")
C_PRIMARY_LIGHT = colors.HexColor("#3B82F6")
C_ACCENT_GREEN = colors.HexColor("#10B981")
C_ACCENT_RED = colors.HexColor("#EF4444")
C_ACCENT_AMBER = colors.HexColor("#F59E0B")
C_BG_LIGHT = colors.HexColor("#F8FAFC")
C_BORDER = colors.HexColor("#CBD5E1")
C_TEXT_DARK = colors.HexColor("#1E293B")
C_TEXT_MUTED = colors.HexColor("#64748B")
C_CODE_BG = colors.HexColor("#0F172A")
C_CODE_TEXT = colors.HexColor("#38BDF8")

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        # Top subtle bar
        self.setFillColor(C_PRIMARY)
        self.rect(0, 836, 595.27, 6, fill=1, stroke=0)

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(C_TEXT_MUTED)
            self.drawString(40, 820, "GKCE AMS — Executive Dashboard API Specification (Dean, Principal & HOD)")
            self.setFont("Helvetica", 8)
            self.drawRightString(555, 820, "v1.0 | REST API")
            self.setStrokeColor(C_BORDER)
            self.setLineWidth(0.5)
            self.line(40, 814, 555, 814)

        # Footer
        self.setStrokeColor(C_BORDER)
        self.setLineWidth(0.5)
        self.line(40, 42, 555, 42)

        self.setFont("Helvetica", 8)
        self.setFillColor(C_TEXT_MUTED)
        self.drawString(40, 30, "Gokula Krishna College of Engineering (GKCE) — Attendance Management System")
        self.drawRightString(555, 30, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CoverTitle',
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=C_NAVY_DARK,
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=C_PRIMARY,
        spaceAfter=14
    )
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=20,
        textColor=C_NAVY_DARK,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=C_PRIMARY,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'Body_Custom',
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=C_TEXT_DARK,
        spaceAfter=6
    )
    body_bold = ParagraphStyle(
        'BodyBold_Custom',
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=14,
        textColor=C_TEXT_DARK,
        spaceAfter=6
    )
    code_block = ParagraphStyle(
        'CodeBlock',
        fontName='Courier',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#E2E8F0"),
        backColor=C_CODE_BG,
        borderColor=C_NAVY_DARK,
        borderWidth=1,
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=8,
        borderRadius=4
    )
    badge_get = ParagraphStyle('BadgeGET', fontName='Helvetica-Bold', fontSize=8, textColor=colors.HexColor("#065F46"))
    badge_post = ParagraphStyle('BadgePOST', fontName='Helvetica-Bold', fontSize=8, textColor=colors.HexColor("#1E40AF"))
    th_style = ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=colors.white)
    td_style = ParagraphStyle('TD', fontName='Helvetica', fontSize=8, leading=11, textColor=C_TEXT_DARK)
    td_bold = ParagraphStyle('TDBold', fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=C_TEXT_DARK)
    td_code = ParagraphStyle('TDCode', fontName='Courier', fontSize=7.5, leading=10, textColor=C_PRIMARY)

    elements = []

    # ================= COVER BANNER =================
    elements.append(Spacer(1, 10))
    banner_data = [
        [
            Paragraph("<b>GOKULA KRISHNA COLLEGE OF ENGINEERING (GKCE)</b>", ParagraphStyle('B1', fontName='Helvetica-Bold', fontSize=13, textColor=colors.white, alignment=1)),
        ],
        [
            Paragraph("ATTENDANCE MANAGEMENT SYSTEM — REST API SPECIFICATION", ParagraphStyle('B2', fontName='Helvetica-Bold', fontSize=9, textColor=colors.HexColor("#93C5FD"), alignment=1)),
        ]
    ]
    t_banner = Table(banner_data, colWidths=[515])
    t_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_NAVY_DARK),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,0), 12),
        ('BOTTOMPADDING', (0,0), (-1,0), 3),
        ('TOPPADDING', (0,1), (-1,1), 2),
        ('BOTTOMPADDING', (0,1), (-1,1), 12),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
    ]))
    elements.append(t_banner)
    elements.append(Spacer(1, 16))

    elements.append(Paragraph("Dean, Principal & HOD Executive Dashboard API", title_style))
    elements.append(Paragraph("Complete Technical Integration Guide & Data Contracts for React Web Developers", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=C_PRIMARY, spaceBefore=2, spaceAfter=14))

    # Meta box
    meta_data = [
        [
            Paragraph("<b>Document Version:</b> 1.0 (Production)", td_style),
            Paragraph("<b>Target Base URL:</b> http://172.29.58.78:3000", td_style),
        ],
        [
            Paragraph("<b>Release Date:</b> September 2026", td_style),
            Paragraph("<b>Auth Protocol:</b> JWT Bearer Token (Header: Authorization)", td_style),
        ],
        [
            Paragraph("<b>Target Audience:</b> Frontend React Engineer", td_style),
            Paragraph("<b>Access Roles:</b> dean, principal, hod, admin", td_style)
        ]
    ]
    t_meta = Table(meta_data, colWidths=[250, 265])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    elements.append(t_meta)
    elements.append(Spacer(1, 16))

    # ================= 1. ARCHITECTURE OVERVIEW =================
    elements.append(Paragraph("1. System Architecture & Authentication", h1_style))
    elements.append(Paragraph(
        "This API enables the GKCE Management Web Portal (accessible by <b>Dean Ma'am, Principal Sir, and Department HODs</b>) "
        "to monitor real-time class attendance, individual student percentage records, section-by-section progress, "
        "faculty attendance submission compliance, and defaulters with attendance &lt; 75%.",
        body_style
    ))
    elements.append(Paragraph(
        "<b>Authentication Scheme:</b> All requests to <code>/api/dashboard/*</code> must pass a valid JSON Web Token in the HTTP Authorization header:<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<code>Authorization: Bearer &lt;JWT_TOKEN&gt;</code>",
        body_style
    ))

    # Role Scope Table
    role_table_data = [
        [Paragraph("Role", th_style), Paragraph("Dashboard Scope & Permissions", th_style), Paragraph("Permitted Routes", th_style)],
        [
            Paragraph("<b>dean</b>", td_bold),
            Paragraph("Full college-wide visibility across all 5 departments (CSE, ECE, EEE, MECH, CIVIL), all sections, all students, and executive analytics.", td_style),
            Paragraph("All dashboard & export endpoints", td_style)
        ],
        [
            Paragraph("<b>principal</b>", td_bold),
            Paragraph("Executive access identical to Dean; can inspect institutional trends, college attendance rates, and download consolidated registers.", td_style),
            Paragraph("All dashboard & export endpoints", td_style)
        ],
        [
            Paragraph("<b>hod</b>", td_bold),
            Paragraph("Departmental jurisdiction; default queries scoped to assigned department (e.g. CSE). Can view department sections, students, and faculty.", td_style),
            Paragraph("All dashboard endpoints (filtered to dept)", td_style)
        ],
        [
            Paragraph("<b>admin</b>", td_bold),
            Paragraph("System management, student registration, role assignment, and master audit.", td_style),
            Paragraph("All endpoints", td_style)
        ]
    ]
    t_role = Table(role_table_data, colWidths=[65, 300, 150])
    t_role.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NAVY_DARK),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_LIGHT]),
    ]))
    elements.append(t_role)
    elements.append(Spacer(1, 14))

    # ================= 2. ENDPOINTS QUICK REFERENCE =================
    elements.append(Paragraph("2. Complete Endpoints Quick Reference", h1_style))
    
    endpoints_ref = [
        [Paragraph("Method", th_style), Paragraph("Endpoint Route", th_style), Paragraph("Primary Purpose", th_style), Paragraph("Access", th_style)],
        [Paragraph("POST", badge_post), Paragraph("<code>/api/auth/login</code>", td_code), Paragraph("Authenticate Dean, Principal, HOD, Teacher", td_style), Paragraph("Public", td_style)],
        [Paragraph("GET", badge_get), Paragraph("<code>/api/auth/me</code>", td_code), Paragraph("Get current authenticated user profile & role", td_style), Paragraph("Auth", td_style)],
        [Paragraph("GET", badge_get), Paragraph("<code>/api/dashboard/overview</code>", td_code), Paragraph("College/Dept KPI counters, attendance rate, submissions", td_style), Paragraph("Executive", td_style)],
        [Paragraph("GET", badge_get), Paragraph("<code>/api/dashboard/departments</code>", td_code), Paragraph("Branch-wise comparison (CSE, ECE, EEE, etc.)", td_style), Paragraph("Dean/Princ/Admin", td_style)],
        [Paragraph("GET", badge_get), Paragraph("<code>/api/dashboard/sections</code>", td_code), Paragraph("Sections list, faculty in charge, today's status", td_style), Paragraph("Executive", td_style)],
        [Paragraph("GET", badge_get), Paragraph("<code>/api/dashboard/section-details/:class</code>", td_code), Paragraph("Single section matrix: students, present/absent roll numbers", td_style), Paragraph("Executive", td_style)],
        [Paragraph("GET", badge_get), Paragraph("<code>/api/dashboard/students</code>", td_code), Paragraph("Student directory with attendance %, search & filters", td_style), Paragraph("Executive", td_style)],
        [Paragraph("GET", badge_get), Paragraph("<code>/api/dashboard/student/:id</code>", td_code), Paragraph("360° student profile: monthly logs, parent phone, absences", td_style), Paragraph("Executive", td_style)],
        [Paragraph("GET", badge_get), Paragraph("<code>/api/dashboard/defaulters</code>", td_code), Paragraph("Low attendance list (&lt; 75%) with shortage calculation", td_style), Paragraph("Executive", td_style)],
        [Paragraph("GET", badge_get), Paragraph("<code>/api/dashboard/faculty-status</code>", td_code), Paragraph("Faculty compliance: submitted vs pending classes today", td_style), Paragraph("Executive", td_style)],
        [Paragraph("GET", badge_get), Paragraph("<code>/api/dashboard/trends</code>", td_code), Paragraph("Time-series analytics for Recharts graphs (7d/30d/month)", td_style), Paragraph("Executive", td_style)],
        [Paragraph("GET", badge_get), Paragraph("<code>/api/dashboard/export/excel</code>", td_code), Paragraph("Download official multi-tier Excel register (.xlsx)", td_style), Paragraph("Executive", td_style)],
    ]
    t_ref = Table(endpoints_ref, colWidths=[45, 175, 225, 70])
    t_ref.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NAVY_DARK),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_LIGHT]),
    ]))
    elements.append(t_ref)
    elements.append(Spacer(1, 14))

    # ================= 3. DETAILED ENDPOINT SPECS =================
    elements.append(PageBreak())
    elements.append(Paragraph("3. Detailed Endpoint Specifications & Payloads", h1_style))
    elements.append(Paragraph("The following contracts contain exact JSON keys and types designed for seamless state mapping in React.", body_style))

    # --- ENDPOINT 1 & 2: AUTH ---
    elements.append(Paragraph("3.1 Authentication: Login & Profile", h2_style))
    elements.append(Paragraph("<b>POST</b> <code>/api/auth/login</code>", body_bold))
    elements.append(Paragraph("Authenticates faculty or administration. Returns a Bearer JWT valid for 7 days.", body_style))
    
    req_login = """// Request Body (JSON)
{
  "email": "dean@college.edu",       // or principal@college.edu, hod.cse@college.edu
  "password": "DeanPass123!"
}"""
    elements.append(Paragraph(req_login.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_block))

    res_login = """// Response (200 OK)
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66da9123f8b1c4e901a1bc30",
    "name": "Dr. Sarah Dean",
    "email": "dean@college.edu",
    "role": "dean",                   // "dean" | "principal" | "hod" | "admin" | "teacher"
    "department": "ALL"               // or "CSE", "ECE", etc.
  }
}"""
    elements.append(Paragraph(res_login.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_block))
    elements.append(Spacer(1, 10))

    # --- ENDPOINT 3: OVERVIEW ---
    elements.append(Paragraph("3.2 Executive KPI Overview", h2_style))
    elements.append(Paragraph("<b>GET</b> <code>/api/dashboard/overview?department=ALL&date=2026-09-19</code>", body_bold))
    elements.append(Paragraph("Generates top-level cards for Total Enrolled Students, Today's Attendance %, Sections Breakdown, and Pending Submissions.", body_style))
    
    res_overview = """// Response (200 OK)
{
  "success": true,
  "data": {
    "kpi": {
      "totalStudents": 420,
      "totalSections": 12,
      "totalDepartments": 5,
      "todayAttendanceRate": 88.5,       // Overall college percentage today
      "monthlyAverageRate": 84.2,        // Average across the current month
      "todayPresentCount": 372,
      "todayAbsentCount": 48,
      "defaultersCount": 18,             // Students below 75%
      "criticalCount": 4                 // Students below 50%
    },
    "submissionCompliance": {
      "totalClasses": 12,
      "submittedCount": 10,
      "pendingCount": 2,
      "complianceRate": 83.3             // 10/12 submitted
    },
    "date": "2026-09-19",
    "department": "ALL"
  }
}"""
    elements.append(Paragraph(res_overview.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_block))
    elements.append(Spacer(1, 10))

    # --- ENDPOINT 4: DEPARTMENTS ---
    elements.append(PageBreak())
    elements.append(Paragraph("3.3 Department-wise Comparative Breakdown", h2_style))
    elements.append(Paragraph("<b>GET</b> <code>/api/dashboard/departments?date=2026-09-19</code>", body_bold))
    elements.append(Paragraph("Provides Dean and Principal with a side-by-side performance table of all branches.", body_style))
    
    res_dept = """// Response (200 OK)
{
  "success": true,
  "departments": [
    {
      "code": "CSE",
      "name": "Computer Science & Engineering",
      "hodName": "Dr. K. Ramesh",
      "hodEmail": "hod.cse@college.edu",
      "totalStudents": 180,
      "totalSections": 4,
      "todayAttendanceRate": 92.4,
      "monthlyAverageRate": 89.1,
      "submittedSections": 4,
      "pendingSections": 0,
      "defaultersCount": 5
    },
    {
      "code": "ECE",
      "name": "Electronics & Communication Engineering",
      "hodName": "Dr. V. Lakshmi",
      "hodEmail": "hod.ece@college.edu",
      "totalStudents": 120,
      "totalSections": 3,
      "todayAttendanceRate": 86.0,
      "monthlyAverageRate": 82.5,
      "submittedSections": 2,
      "pendingSections": 1,
      "defaultersCount": 8
    }
  ]
}"""
    elements.append(Paragraph(res_dept.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_block))
    elements.append(Spacer(1, 10))

    # --- ENDPOINT 5: SECTIONS ---
    elements.append(Paragraph("3.4 Sections List & Submission Status", h2_style))
    elements.append(Paragraph("<b>GET</b> <code>/api/dashboard/sections?department=CSE&year=1&date=2026-09-19</code>", body_bold))
    elements.append(Paragraph("Lists all class sections with assigned faculty in-charge, today's submission status, and attendance percentages.", body_style))
    
    res_sec = """// Response (200 OK)
{
  "success": true,
  "sections": [
    {
      "className": "CSE_1_A",
      "branch": "CSE",
      "year": 1,
      "section": "A",
      "enrolledCount": 45,
      "faculty": {
        "name": "Prof. Ananya Rao",
        "email": "cse.teacher1@college.edu"
      },
      "todayStatus": "SUBMITTED",        // "SUBMITTED" or "PENDING"
      "submittedAt": "2026-09-19T09:45:00.000Z",
      "presentCount": 41,
      "absentCount": 4,
      "attendanceRate": 91.1,
      "monthlyAverage": 87.8
    }
  ]
}"""
    elements.append(Paragraph(res_sec.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_block))
    elements.append(Spacer(1, 10))

    # --- ENDPOINT 6: SECTION DETAILS ---
    elements.append(PageBreak())
    elements.append(Paragraph("3.5 Section Details & Student Attendance Matrix", h2_style))
    elements.append(Paragraph("<b>GET</b> <code>/api/dashboard/section-details/CSE_1_A?date=2026-09-19</code>", body_bold))
    elements.append(Paragraph("Fetches the full class register matrix, day entries, and today's marked absentees with parent phone numbers.", body_style))

    res_sec_det = """// Response (200 OK)
{
  "success": true,
  "section": {
    "className": "CSE_1_A",
    "faculty": { "name": "Prof. Ananya Rao", "email": "cse.teacher1@college.edu" },
    "date": "2026-09-19",
    "totalStudents": 45,
    "todayPresent": 41,
    "todayAbsent": 4,
    "absentees": [
      { "rollNo": "103", "name": "Rohan Verma", "parentPhone": "+919876543213" },
      { "rollNo": "107", "name": "Neha Sharma", "parentPhone": "+919876543217" }
    ],
    "studentsMatrix": [
      {
        "studentId": "66da9123f8b1c4e901a1bc40",
        "rollNo": "101",
        "name": "Aarav Sharma",
        "parentPhone": "+919876543210",
        "totalHeld": 22,
        "presentCount": 20,
        "absentCount": 2,
        "percentage": 90.9,
        "todayStatus": "P"              // "P" or "A"
      }
    ]
  }
}"""
    elements.append(Paragraph(res_sec_det.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_block))
    elements.append(Spacer(1, 10))

    # --- ENDPOINT 7: STUDENTS DIRECTORY ---
    elements.append(Paragraph("3.6 Student Directory with Real-time Percentage", h2_style))
    elements.append(Paragraph("<b>GET</b> <code>/api/dashboard/students?department=CSE&status=below75&search=Aarav&page=1&limit=20</code>", body_bold))
    elements.append(Paragraph("Filterable and searchable student list across the institution with computed attendance standing.", body_style))

    res_stud = """// Response (200 OK)
{
  "success": true,
  "total": 1,
  "page": 1,
  "limit": 20,
  "students": [
    {
      "id": "66da9123f8b1c4e901a1bc40",
      "rollNo": "101",
      "name": "Aarav Sharma",
      "className": "CSE_1_A",
      "branch": "CSE",
      "year": 1,
      "section": "A",
      "parentPhone": "+919876543210",
      "totalConducted": 24,
      "totalAttended": 22,
      "percentage": 91.7,
      "statusCategory": "GOOD"           // "GOOD" (>=75%) | "SHORTAGE" (65-74%) | "CRITICAL" (<65%)
    }
  ]
}"""
    elements.append(Paragraph(res_stud.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_block))
    elements.append(Spacer(1, 10))

    # --- ENDPOINT 8: STUDENT 360 PROFILE ---
    elements.append(PageBreak())
    elements.append(Paragraph("3.7 Individual Student 360° Profile", h2_style))
    elements.append(Paragraph("<b>GET</b> <code>/api/dashboard/student/:id</code>", body_bold))
    elements.append(Paragraph("Complete history for student counseling, parent meetings, and attendance shortage reviews.", body_style))

    res_stud_prof = """// Response (200 OK)
{
  "success": true,
  "student": {
    "id": "66da9123f8b1c4e901a1bc40",
    "name": "Aarav Sharma",
    "rollNo": "101",
    "className": "CSE_1_A",
    "parentPhone": "+919876543210",
    "overallStats": {
      "totalClasses": 45,
      "classesAttended": 40,
      "classesAbsent": 5,
      "percentage": 88.9,
      "status": "GOOD"
    },
    "monthlyBreakdown": [
      { "month": "August", "year": 2026, "total": 22, "attended": 20, "percent": 90.9 },
      { "month": "September", "year": 2026, "total": 23, "attended": 20, "percent": 87.0 }
    ],
    "recentAbsences": [
      { "date": "2026-09-15", "recordedBy": "Prof. Ananya Rao", "smsStatus": "sent" }
    ]
  }
}"""
    elements.append(Paragraph(res_stud_prof.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_block))
    elements.append(Spacer(1, 10))

    # --- ENDPOINT 9: DEFAULTERS ---
    elements.append(Paragraph("3.8 Low Attendance & Defaulters Alert List", h2_style))
    elements.append(Paragraph("<b>GET</b> <code>/api/dashboard/defaulters?threshold=75&department=ALL</code>", body_bold))
    elements.append(Paragraph("Lists all students below mandatory attendance threshold with calculated shortage days needed to recover.", body_style))

    res_def = """// Response (200 OK)
{
  "success": true,
  "threshold": 75,
  "totalDefaulters": 18,
  "defaulters": [
    {
      "studentId": "66da9123f8b1c4e901a1bc43",
      "rollNo": "104",
      "name": "Vikram Singh",
      "className": "CSE_1_A",
      "branch": "CSE",
      "parentPhone": "+919876543214",
      "totalHeld": 30,
      "attended": 18,
      "percentage": 60.0,
      "daysNeededFor75": 18,             // Consecutive attended classes needed to hit 75%
      "riskLevel": "CRITICAL"            // "WARNING" (65-74%) or "CRITICAL" (<65%)
    }
  ]
}"""
    elements.append(Paragraph(res_def.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_block))
    elements.append(Spacer(1, 10))

    # --- ENDPOINT 10: FACULTY COMPLIANCE ---
    elements.append(PageBreak())
    elements.append(Paragraph("3.9 Faculty Submission Compliance Tracker", h2_style))
    elements.append(Paragraph("<b>GET</b> <code>/api/dashboard/faculty-status?date=2026-09-19&department=ALL</code>", body_bold))
    elements.append(Paragraph("Empowers Dean and HODs to verify punctuality of attendance submission across all periods and classes.", body_style))

    res_fac = """// Response (200 OK)
{
  "success": true,
  "date": "2026-09-19",
  "summary": { "totalClasses": 12, "submitted": 10, "pending": 2 },
  "facultyList": [
    {
      "className": "CSE_1_A",
      "facultyName": "Prof. Ananya Rao",
      "facultyEmail": "cse.teacher1@college.edu",
      "status": "SUBMITTED",
      "submissionTime": "09:42 AM",
      "presentRate": 91.1
    },
    {
      "className": "ECE_2_B",
      "facultyName": "Prof. Rajesh Kumar",
      "facultyEmail": "ece.teacher2@college.edu",
      "status": "PENDING",
      "submissionTime": null,
      "presentRate": null
    }
  ]
}"""
    elements.append(Paragraph(res_fac.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_block))
    elements.append(Spacer(1, 10))

    # --- ENDPOINT 11: TRENDS & CHARTS ---
    elements.append(Paragraph("3.10 Time-Series Analytics (Charts & Graphs)", h2_style))
    elements.append(Paragraph("<b>GET</b> <code>/api/dashboard/trends?days=14&department=ALL</code>", body_bold))
    elements.append(Paragraph("Returns structured data ready to pass directly into <b>Recharts</b> <code>&lt;LineChart&gt;</code> or <code>&lt;BarChart&gt;</code>.", body_style))

    res_trends = """// Response (200 OK)
{
  "success": true,
  "days": 14,
  "trend": [
    { "date": "2026-09-08", "day": "Tue", "attendanceRate": 89.2, "present": 375, "absent": 45 },
    { "date": "2026-09-09", "day": "Wed", "attendanceRate": 91.4, "present": 384, "absent": 36 },
    { "date": "2026-09-10", "day": "Thu", "attendanceRate": 87.0, "present": 365, "absent": 55 }
  ],
  "dayOfWeekDistribution": {
    "Mon": 86.4, "Tue": 90.1, "Wed": 91.2, "Thu": 88.5, "Fri": 84.1, "Sat": 82.0
  }
}"""
    elements.append(Paragraph(res_trends.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_block))
    elements.append(Spacer(1, 10))

    # ================= 4. FRONTEND INTEGRATION GUIDE =================
    elements.append(PageBreak())
    elements.append(Paragraph("4. Frontend Integration Guide for React Developer", h1_style))
    elements.append(Paragraph(
        "To build a responsive, modern executive portal for Dean Ma'am and HODs, "
        "follow these best practices:",
        body_style
    ))

    fe_tips_data = [
        [Paragraph("Aspect", th_style), Paragraph("Recommended Practice & Library", th_style)],
        [
            Paragraph("<b>Data Fetching</b>", td_bold),
            Paragraph("Use <b>Axios</b> with a configured Axios instance (<code>baseURL: http://172.29.58.78:3000</code>) and request interceptor attaching <code>Authorization: Bearer ${localStorage.getItem('token')}</code>.", td_style)
        ],
        [
            Paragraph("<b>Charts & Graphs</b>", td_bold),
            Paragraph("Use <b>Recharts</b> (<code>&lt;ResponsiveContainer&gt;</code>, <code>&lt;LineChart&gt;</code>, <code>&lt;BarChart&gt;</code>). Data from <code>/api/dashboard/trends</code> feeds directly into the <code>data</code> prop without manual transformation.", td_style)
        ],
        [
            Paragraph("<b>UI Components</b>", td_bold),
            Paragraph("<b>Tailwind CSS / Lucide React</b>: Create 4 core page views: <br/>"
                      "1. <b>Executive Overview</b> (Cards, Charts, Department grid)<br/>"
                      "2. <b>Section Matrix</b> (Class selector, student matrix table)<br/>"
                      "3. <b>Defaulters Console</b> (Table with badge tags &lt;75% and quick parent call links)<br/>"
                      "4. <b>Faculty Compliance</b> (Live checklist of who has and hasn't submitted today).", td_style)
        ],
        [
            Paragraph("<b>Role Routing</b>", td_bold),
            Paragraph("If <code>user.role === 'hod'</code>, pre-select and lock the Department dropdown to their assigned department (<code>user.department</code>). If <code>'dean'</code> or <code>'principal'</code>, enable the full college dropdown filter.", td_style)
        ]
    ]
    t_fe = Table(fe_tips_data, colWidths=[120, 395])
    t_fe.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NAVY_DARK),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_LIGHT]),
    ]))
    elements.append(t_fe)
    elements.append(Spacer(1, 14))

    # Standard Error Responses
    elements.append(Paragraph("5. Standard Error Responses", h2_style))
    err_snippet = """// 401 Unauthorized (Missing or Invalid Token)
{ "success": false, "message": "Authentication token is required" }

// 403 Forbidden (Role mismatch)
{ "success": false, "message": "You do not have permission for this action" }

// 404 Not Found
{ "success": false, "message": "Student or section not found" }"""
    elements.append(Paragraph(err_snippet.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_block))

    # Build Document
    doc.build(elements, canvasmaker=NumberedCanvas)
    print(f"PDF Successfully Generated: {filename}")

if __name__ == "__main__":
    output_path = os.path.join(os.getcwd(), "GKCE_AMS_Dean_HOD_Dashboard_API_Documentation.pdf")
    build_pdf(output_path)
