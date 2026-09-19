import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../config/theme.js";

export const AttendanceCard = ({ attendance = {} }) => {
  const percentage = attendance.percentage !== undefined ? attendance.percentage : 100;
  const isEligible = percentage >= 75;
  const isShortage = percentage >= 65 && percentage < 75;
  const isCritical = percentage < 65;

  let accentColor = theme.colors.success;
  let bgAccent = theme.colors.successBg;
  let badgeText = "EXAM ELIGIBLE";

  if (isShortage) {
    accentColor = theme.colors.warning;
    bgAccent = theme.colors.warningBg;
    badgeText = "SHORTAGE WARNING";
  } else if (isCritical) {
    accentColor = theme.colors.danger;
    bgAccent = theme.colors.dangerBg;
    badgeText = "CRITICAL SHORTAGE";
  }

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.heroGaugeContainer}>
          <View style={[styles.circleOuter, { borderColor: accentColor }]}>
            <Text style={[styles.percentageText, { color: accentColor }]}>
              {percentage}%
            </Text>
            <Text style={styles.percentageLabel}>Overall</Text>
          </View>
        </View>

        <View style={styles.statusColumn}>
          <View style={[styles.statusBadge, { backgroundColor: bgAccent, borderColor: accentColor }]}>
            <Text style={[styles.statusBadgeText, { color: accentColor }]}>{badgeText}</Text>
          </View>

          <Text style={styles.statusDescription}>
            {attendance.statusMessage ||
              (isEligible
                ? "Attendance is above mandatory 75% threshold required by University guidelines."
                : `Shortage detected! Student must attend ${attendance.classesNeededFor75 || 0} classes to reach 75%.`)}
          </Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{attendance.totalClasses || 0}</Text>
          <Text style={styles.statLabel}>Total Classes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.success }]}>
            {attendance.classesAttended || 0}
          </Text>
          <Text style={styles.statLabel}>Attended</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.danger }]}>
            {attendance.classesAbsent || 0}
          </Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    ...theme.shadows.lg,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  heroGaugeContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  circleOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.navySurface,
  },
  percentageText: {
    fontSize: theme.typography.xxl,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  percentageLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: -2,
  },
  statusColumn: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: theme.typography.xs,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statusDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sm,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.navyBorder,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.navyBorder,
  },
  statNumber: {
    fontSize: theme.typography.xl,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    fontWeight: "600",
    marginTop: 4,
  },
});
