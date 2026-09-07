export const theme = {
  colors: {
    // Primary brand colors
    primary: "#2563eb",         // Royal blue
    primaryDark: "#1d4ed8",
    primaryLight: "#3b82f6",
    primaryGlow: "rgba(37, 99, 235, 0.15)",

    // Neutral palette
    navy: "#0b1120",            // Deep background
    navyCard: "#131c31",        // Card background dark
    navyBorder: "#1e293b",      // Card border
    navyHover: "#1e293b",
    
    // Light accents
    background: "#0f172a",      // Main screen background
    surface: "#1e293b",         // Elevated surface
    surfaceLight: "#334155",
    
    // Status colors
    present: "#10b981",         // Emerald green
    presentBg: "rgba(16, 185, 129, 0.15)",
    presentBorder: "#059669",
    
    absent: "#ef4444",          // Crimson red
    absentBg: "rgba(239, 68, 68, 0.15)",
    absentBorder: "#dc2626",
    
    warning: "#f59e0b",         // Amber
    warningBg: "rgba(245, 158, 11, 0.15)",
    
    info: "#06b6d4",            // Cyan
    infoBg: "rgba(6, 182, 212, 0.15)",
    
    // Text colors
    textPrimary: "#f8fafc",     // Clean white/off-white
    textSecondary: "#94a3b8",   // Muted slate
    textMuted: "#64748b",       // Darker slate
    textInverse: "#0f172a",
    
    // UI elements
    border: "#334155",
    card: "#1e293b",
    white: "#ffffff",
    black: "#000000",
  },
  
  typography: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    title: 28,
  },
  
  borderRadius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 26,
    full: 9999,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
  },
  
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};
