import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "./src/config/theme.js";
import { AuthProvider, useAuth } from "./src/context/AuthContext.js";
import { ToastProvider } from "./src/context/ToastContext.js";
import { AuthScreen } from "./src/screens/AuthScreen.js";
import { AttendanceScreen } from "./src/screens/AttendanceScreen.js";
import { StudentsScreen } from "./src/screens/StudentsScreen.js";
import { DashboardScreen } from "./src/screens/DashboardScreen.js";
import { ReportsScreen } from "./src/screens/ReportsScreen.js";
import { SettingsScreen } from "./src/screens/SettingsScreen.js";
import { BottomNav } from "./src/components/BottomNav.js";

const MainNavigator = () => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const [activeTab, setActiveTab] = useState("attendance");

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashLogo}>
          <Text style={styles.splashLogoText}>GKCE</Text>
        </View>
        <ActivityIndicator size="large" color={theme.colors.primaryLight} style={styles.splashSpinner} />
        <Text style={styles.splashText}>Initializing GKCE AMS...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case "attendance":
        return <AttendanceScreen />;
      case "students":
        return <StudentsScreen />;
      case "dashboard":
        return <DashboardScreen />;
      case "reports":
        return <ReportsScreen />;
      case "settings":
        return <SettingsScreen />;
      default:
        return <AttendanceScreen />;
    }
  };

  return (
    <View style={styles.rootContainer}>
      <View style={styles.screenWrapper}>{renderActiveScreen()}</View>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <StatusBar style="light" backgroundColor={theme.colors.navyCard} translucent={false} />
        <MainNavigator />
      </ToastProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screenWrapper: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: theme.colors.navy,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  splashLogo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.lg,
  },
  splashLogoText: {
    fontSize: 28,
    fontWeight: "900",
    color: theme.colors.white,
    letterSpacing: 1,
  },
  splashSpinner: {
    marginTop: 8,
  },
  splashText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sm,
    fontWeight: "600",
  },
});
