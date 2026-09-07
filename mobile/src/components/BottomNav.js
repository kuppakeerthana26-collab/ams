import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../config/theme.js";
import { useAuth } from "../context/AuthContext.js";

export const BottomNav = ({ activeTab, onTabChange }) => {
  const { role } = useAuth();
  const isAdminOrHod = role === "admin" || role === "hod";

  const tabs = [
    { id: "attendance", label: "Attendance", icon: "clipboard", iconOutline: "clipboard-outline" },
    { id: "students", label: "Students", icon: "people", iconOutline: "people-outline" },
    { id: "reports", label: "Registers", icon: "document-text", iconOutline: "document-text-outline" },
    ...(isAdminOrHod
      ? [
          { id: "dashboard", label: "Dashboard", icon: "stats-chart", iconOutline: "stats-chart-outline" },
        ]
      : []),
    { id: "settings", label: "Settings", icon: "settings", iconOutline: "settings-outline" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, isActive && styles.activeTabButton]}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
              <Ionicons
                name={isActive ? tab.icon : tab.iconOutline}
                size={22}
                color={isActive ? theme.colors.primaryLight : theme.colors.textMuted}
              />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: theme.colors.navyCard,
    borderTopWidth: 1,
    borderTopColor: theme.colors.navyBorder,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    paddingHorizontal: 12,
    justifyContent: "space-around",
    ...theme.shadows.lg,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  activeTabButton: {},
  iconWrapper: {
    width: 42,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  activeIconWrapper: {
    backgroundColor: theme.colors.primaryGlow,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  activeTabLabel: {
    color: theme.colors.primaryLight,
    fontWeight: "800",
  },
});
