export const theme = {
  colors: {
    // Primary Backgrounds & Surfaces
    bgDark: "#0B1120",
    bgCard: "#151F32",
    bgSurface: "#1E2C48",
    bgElevated: "#263554",
    borderColor: "#2B3D63",
    borderLight: "#3B4E7A",

    // Brand Colors (College Trust Blue)
    primary: "#2563EB",
    primaryLight: "#60A5FA",
    primaryDark: "#1D4ED8",
    primaryMuted: "rgba(37, 99, 235, 0.15)",

    // Attendance Status Colors (High contrast, vibrant)
    success: "#10B981",
    successDark: "#059669",
    successBg: "rgba(16, 185, 129, 0.16)",
    successBorder: "rgba(16, 185, 129, 0.4)",
    successText: "#34D399",

    warning: "#F59E0B",
    warningDark: "#D97706",
    warningBg: "rgba(245, 158, 11, 0.16)",
    warningBorder: "rgba(245, 158, 11, 0.4)",
    warningText: "#FBBF24",

    danger: "#EF4444",
    dangerDark: "#DC2626",
    dangerBg: "rgba(239, 68, 68, 0.16)",
    dangerBorder: "rgba(239, 68, 68, 0.4)",
    dangerText: "#F87171",

    info: "#38BDF8",
    infoBg: "rgba(56, 189, 248, 0.14)",

    // Neutral Text Colors (Optimized for readability)
    textPrimary: "#FFFFFF",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    textSubtle: "#64748B",
    white: "#FFFFFF",
    black: "#000000",

    // Interactive Action Colors
    callGreen: "#10B981",
    smsBlue: "#3B82F6",
    emailPurple: "#8B5CF6",
  },

  typography: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
    xxl: 28,
    hero: 36,
  },

  borderRadius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};
