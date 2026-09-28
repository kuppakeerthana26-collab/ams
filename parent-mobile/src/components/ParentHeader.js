import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { useLanguage } from "../context/LanguageContext.js";
import { LanguageToggle } from "./LanguageToggle.js";
import { theme } from "../config/theme.js";

export const ParentHeader = ({ onLogout = () => {} }) => {
  const { t, isTelugu } = useLanguage();

  const handleLogoutPress = () => {
    Alert.alert(
      t("logoutConfirmTitle"),
      t("logoutConfirmMessage"),
      [
        { text: t("cancel"), style: "cancel" },
        { text: t("logout"), style: "destructive", onPress: onLogout },
      ]
    );
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftRow}>
        <Image
          source={require("../../assets/GKCE-LOGO.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.titleColumn}>
          <Text style={styles.collegeName}>{t("collegeShort")}</Text>
          <Text style={styles.portalTag}>{t("portalTag")}</Text>
        </View>
      </View>

      <View style={styles.rightActions}>
        <LanguageToggle compact={true} />

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogoutPress}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>{t("logout")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.bgCard,
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
    ...theme.shadows.sm,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  logo: {
    width: 36,
    height: 36,
  },
  titleColumn: {
    justifyContent: "center",
  },
  collegeName: {
    color: theme.colors.primaryLight,
    fontSize: theme.typography.sm,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  portalTag: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "700",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.bgSurface,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    gap: 4,
  },
  logoutIcon: {
    fontSize: 12,
  },
  logoutText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
});
