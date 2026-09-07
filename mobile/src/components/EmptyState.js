import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../config/theme.js";

export const EmptyState = ({
  icon = "file-tray-outline",
  title = "No Data Found",
  message = "There are no records to display at this moment.",
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={36} color={theme.colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionBtn} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.actionBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginTop: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.navyCard,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  title: {
    fontSize: theme.typography.lg,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  message: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  actionBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    marginTop: 18,
    ...theme.shadows.sm,
  },
  actionBtnText: {
    color: theme.colors.white,
    fontSize: theme.typography.sm,
    fontWeight: "700",
  },
});
