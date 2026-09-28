import React from "react";
import { View, StyleSheet, ActivityIndicator, Text, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "./src/config/theme.js";
import { LanguageProvider, useLanguage } from "./src/context/LanguageContext.js";
import { ParentAuthProvider, useParentAuth } from "./src/context/ParentAuthContext.js";
import { ParentAuthScreen } from "./src/screens/ParentAuthScreen.js";
import { ParentHomeScreen } from "./src/screens/ParentHomeScreen.js";

const MainNavigator = () => {
  const { isAuthenticated, isLoading } = useParentAuth();
  const { t, isTelugu } = useLanguage();

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashLogo}>
          <Image
            source={require("./assets/GKCE-LOGO.png")}
            style={styles.splashLogoImage}
            resizeMode="contain"
          />
        </View>
        <ActivityIndicator
          size="large"
          color={theme.colors.primaryLight}
          style={styles.splashSpinner}
        />
        <Text style={styles.splashTitle}>{t("appName")}</Text>
        <Text style={styles.splashText}>
          {isTelugu
            ? "సురక్షిత సమాచారం ధృవీకరించబడుతోంది..."
            : "Verifying secure device access..."}
        </Text>
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
    <LanguageProvider>
      <ParentAuthProvider>
        <StatusBar
          style="light"
          backgroundColor={theme.colors.bgCard}
          translucent={false}
        />
        <View style={styles.rootContainer}>
          <MainNavigator />
        </View>
      </ParentAuthProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: theme.colors.bgDark,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: theme.colors.bgDark,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  splashLogo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
    ...theme.shadows.lg,
  },
  splashLogoImage: {
    width: 64,
    height: 64,
  },
  splashSpinner: {
    marginTop: 10,
  },
  splashTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.lg,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  splashText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.xs,
    fontWeight: "600",
  },
});
