import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../config/theme.js";
import { useAuth } from "../context/AuthContext.js";

const COLLEGE_LOGO = require("../assets/GKCE-LOGO.webp");

export const Header = ({ title, subtitle, rightAction, onClassPress, selectedClass }) => {
  const { user, role } = useAuth();

  const getRoleBadge = () => {
    switch (role?.toLowerCase()) {
      case "admin":
        return { label: "ADMIN", bg: "#4c1d95", text: "#c4b5fd" };
      case "hod":
        return { label: "HOD", bg: "#1e3a8a", text: "#93c5fd" };
      default:
        return { label: "TEACHER", bg: "#064e3b", text: "#6ee7b7" };
    }
  };

  const roleConfig = getRoleBadge();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoCircle}>
            <Image source={COLLEGE_LOGO} style={styles.logoImage} resizeMode="contain" />
          </View>
          <View>
            <Text style={styles.brandTitle}>GKCE AMS</Text>
            <Text style={styles.brandUser}>{user?.name || "Faculty Portal"}</Text>
          </View>
        </View>

        <View style={styles.rightGroup}>
          <View style={[styles.roleBadge, { backgroundColor: roleConfig.bg }]}>
            <Text style={[styles.roleText, { color: roleConfig.text }]}>{roleConfig.label}</Text>
          </View>

          {rightAction}
        </View>
      </View>

      {(title || selectedClass) && (
        <View style={styles.titleRow}>
          <View style={styles.titleWrap}>
            {title && <Text style={styles.pageTitle}>{title}</Text>}
            {subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
          </View>

          {selectedClass && onClassPress && (
            <TouchableOpacity style={styles.classChip} onPress={onClassPress} activeOpacity={0.7}>
              <Ionicons name="cube-outline" size={15} color={theme.colors.primaryLight} />
              <Text style={styles.classChipText}>{selectedClass}</Text>
              <Ionicons name="chevron-down" size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.navyCard,
    paddingTop: Platform.OS === "ios" ? 54 : 44,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.navyBorder,
    ...theme.shadows.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  brandTitle: {
    fontSize: theme.typography.sm,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  brandUser: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  titleRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  titleWrap: {
    flex: 1,
  },
  pageTitle: {
    fontSize: theme.typography.xl,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  pageSubtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  classChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  classChipText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sm,
    fontWeight: "700",
  },
});
