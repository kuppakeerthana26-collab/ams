# GKCE AMS Mobile (React Native + Expo)

Production-ready Expo React Native client for the GKCE Attendance Monitoring System backend.

## Features & Screens

- 🔐 **Authentication & Session Manager (`AuthScreen.js`)**:
  - Secure JWT authentication with persistent session via AsyncStorage.
  - Dynamic API Base URL configuration & latency ping tester (`checkHealth`).
  - Pre-fill credentials helper for Admin, Teacher, and HOD roles.

- 📋 **Attendance Register (`AttendanceScreen.js`)**:
  - Auto-loads assigned class for faculty (e.g. `CSE_1_A`) or lets user pick Branch, Year, Section.
  - Date navigator with today indicator.
  - Live metric counters: Total Students, Present Count, Absent Count, Attendance Rate %.
  - 1-tap fast roll call: "All Present", "All Absent", "Invert Selection".
  - Interactive Present (`[P]`) / Absent (`[A]`) student cards with WhatsApp dialer link.
  - Search filter by student name, roll number, or phone.
  - Attendance lock detection: displays locked badge when attendance has already been submitted for the day.
  - Submission confirmation modal with absentee preview and Meta WhatsApp alert summary.

- 👥 **Student Directory (`StudentsScreen.js`)**:
  - Class-wise student listing and global search.
  - Direct call (`tel:`) and WhatsApp (`wa.me`) links for parent communications.
  - Admin & HOD capabilities: Add new student modal (`POST /api/students`) and edit modal (`PUT /api/students/:id`) with phone format validation.

- 📊 **Admin Analytics Dashboard (`DashboardScreen.js`)**:
  - Metric cards: Enrolled Students, Total Submissions, Overall Present %, Absences Count.
  - WhatsApp failure badge alert.
  - Recent Submissions Feed: Class, date, present/absent totals, and attendance percentage.
  - Absentee Activity Log: Comprehensive chronological log of student absences.
  - Class filter dropdown.

- 📑 **Registers & Excel Sheet Inspector (`ReportsScreen.js`)**:
  - Live matrix table viewer reading server-side Excel attendance worksheet cells (`GET /api/admin/sheet`).
  - One-tap download buttons for Monthly Excel (`.xlsx`) and CSV summary reports.

- ⚙️ **Settings & Profile (`SettingsScreen.js`)**:
  - Faculty profile, role badge, assigned department/class summary.
  - API endpoint configurator with live ping tester.
  - Secure account sign-out.

## Project Structure

```txt
mobile/
├── App.js                          # Root App component, Theme, Auth & Toast Providers, Screen Navigation
├── app.json                        # Expo app configuration
├── package.json                    # Dependencies & scripts
└── src/
    ├── config/
    │   └── theme.js                # Design system tokens (navy/emerald/royal blue dark theme)
    ├── services/
    │   ├── api.js                  # Dynamic API client with baseUrl persistence & health check
    │   └── session.js              # AsyncStorage session & server URL persistence
    ├── context/
    │   ├── AuthContext.js          # Auth state, login, auto-login, logout, active user & role
    │   └── ToastContext.js         # In-app toast banner provider (success, warning, error, info)
    ├── components/
    │   ├── Header.js               # Top header bar with title, class badge, user avatar
    │   ├── BottomNav.js            # Bottom navigation bar with role-aware tabs
    │   ├── StatCard.js             # Analytics metric cards with icons and accent gradients
    │   ├── StudentCard.js          # Student attendance row with interactive P/A pill toggle
    │   ├── ClassPickerModal.js     # Class selector modal (Branch, Year, Section, custom classes)
    │   ├── SubmissionModal.js      # Confirmation modal with absentee summary & WhatsApp info
    │   ├── StudentFormModal.js     # Add/Edit student modal with international phone validation
    │   ├── Toast.js                # Animated in-app notification component
    │   └── EmptyState.js           # Reusable empty & error state with retry actions
    └── screens/
        ├── AuthScreen.js           # Login screen with demo-role helper & Server URL tester
        ├── AttendanceScreen.js     # Main attendance register & fast roll-call
        ├── StudentsScreen.js       # Student directory & management
        ├── DashboardScreen.js      # Admin/HOD statistics & recent logs
        ├── ReportsScreen.js        # Register sheet inspector & download links
        └── SettingsScreen.js       # Profile details & server settings
```

## How to Run

1. Make sure the backend server is running:
   ```bash
   cd ../server
   npm run dev
   ```

2. Start the Expo mobile app:
   ```powershell
   cd mobile
   npm install
   npx expo start
   ```

3. Press:
   - `a` to open in Android Emulator
   - `i` to open in iOS Simulator (macOS)
   - `w` to open in Web Browser
   - Or scan the QR code with the **Expo Go** app on your physical mobile device (ensure your phone is connected to the same Wi-Fi and configure the server URL to your computer's LAN IP e.g. `http://192.168.x.x:3000`).
