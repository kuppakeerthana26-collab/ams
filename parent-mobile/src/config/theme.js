export const theme = {
  colors: {
    navy: "#090e17",
    navyCard: "#111a2e",
    navySurface: "#1a2642",
    navyBorder: "#243456",
    
    primary: "#2563eb",
    primaryLight: "#3b82f6",
    primaryDark: "#1d4ed8",
    primaryGradient: ["#1d4ed8", "#3b82f6"],

    // Attendance Status Colors
    success: "#10b981",
    successDark: "#059669",
    successLight: "#d1fae5",
    successBg: "rgba(16, 185, 129, 0.12)",

    warning: "#f59e0b",
    warningDark: "#d97706",
    warningLight: "#fef3c7",
    warningBg: "rgba(245, 158, 11, 0.12)",

    danger: "#ef4444",
    dangerDark: "#dc2626",
    dangerLight: "#fee2e2",
    dangerBg: "rgba(239, 68, 68, 0.12)",

    neutral: "#64748b",
    neutralLight: "#f1f5f9",
    neutralBg: "rgba(100, 116, 139, 0.1)",

    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    white: "#ffffff",
    black: "#000000",
  },
  typography: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 19,
    xl: 22,
    xxl: 26,
    hero: 34,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};
