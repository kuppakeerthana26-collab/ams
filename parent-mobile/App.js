import React from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "./src/config/theme.js";
import { ParentAuthProvider, useParentAuth } from "./src/context/ParentAuthContext.js";
import { ParentAuthScreen } from "./src/screens/ParentAuthScreen.js";
import { ParentHomeScreen } from "./src/screens/ParentHomeScreen.js";

const MainNavigator = () => {
  const { isAuthenticated, isLoading } = useParentAuth();

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashLogo}>
          <Text style={styles.splashLogoText}>GKCE</Text>
        </View>
        <ActivityIndicator size="large" color={theme.colors.primaryLight} style={styles.splashSpinner} />
        <Text style={styles.splashTitle}>GKCE PARENT AMS</Text>
        <Text style={styles.splashText}>Verifying Device Hardware Signature...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <ParentAuthScreen />;
  }

  return <ParentHomeScreen />;
};

export default function App() {
  return (
    <ParentAuthProvider>
      <StatusBar style="light" backgroundColor={theme.colors.navyCard} translucent={false} />
      <View style={styles.rootContainer}>
        <MainNavigator />
      </View>
    </ParentAuthProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: theme.colors.navy,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: theme.colors.navy,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  splashLogo: {
    width: 84,
    height: 84,
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
    letterSpacing: 1.5,
  },
  splashSpinner: {
    marginTop: 10,
  },
  splashTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.base,
    fontWeight: "800",
    letterSpacing: 1,
  },
  splashText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.xs,
    fontWeight: "600",
  },
});
