import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../config/theme.js";

export const WeeklyAttendanceStrip = ({ weeklyData = [] }) => {
  if (!weeklyData.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Weekly Attendance Trail</Text>
        <Text style={styles.subtitle}>Last 7 Days</Text>
      </View>

      <View style={styles.stripRow}>
        {weeklyData.map((day, idx) => {
          const isPresent = day.status === "P";
          const isAbsent = day.status === "A";
          const isHoliday = day.status === "Holiday";
          const isNoClass = day.status === "Not Conducted";

          let pillBg = theme.colors.navySurface;
          let pillBorder = theme.colors.navyBorder;
          let textStatusColor = theme.colors.textMuted;
          let statusLabel = "-";

          if (isPresent) {
            pillBg = theme.colors.successBg;
            pillBorder = theme.colors.success;
            textStatusColor = theme.colors.success;
            statusLabel = "P";
          } else if (isAbsent) {
            pillBg = theme.colors.dangerBg;
            pillBorder = theme.colors.danger;
            textStatusColor = theme.colors.danger;
            statusLabel = "A";
          } else if (isHoliday) {
            pillBg = theme.colors.warningBg;
            pillBorder = theme.colors.warning;
            textStatusColor = theme.colors.warning;
            statusLabel = "H";
          } else if (isNoClass) {
            statusLabel = "—";
          }

          return (
            <View key={day.date || idx} style={[styles.dayCard, { borderColor: pillBorder, backgroundColor: pillBg }]}>
              <Text style={styles.dayName}>{day.day}</Text>
              <Text style={styles.dayNumber}>{day.dayNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: isPresent ? theme.colors.success : isAbsent ? theme.colors.danger : theme.colors.navySurface }]}>
                <Text style={styles.statusText}>{statusLabel}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
          <Text style={styles.legendLabel}>Present (P)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.danger }]} />
          <Text style={styles.legendLabel}>Absent (A)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
          <Text style={styles.legendLabel}>Holiday (H)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    ...theme.shadows.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.base,
    fontWeight: "700",
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.xs,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  stripRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  dayCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  dayName: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.xs,
    fontWeight: "600",
    marginBottom: 2,
  },
  dayNumber: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.md,
    fontWeight: "800",
    marginBottom: 6,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    color: theme.colors.white,
    fontSize: theme.typography.xs,
    fontWeight: "900",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.navyBorder,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.xs,
    fontWeight: "500",
  },
});
