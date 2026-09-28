import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLanguage } from "../context/LanguageContext.js";
import { theme } from "../config/theme.js";

export const AttendanceCard = ({ attendance = {} }) => {
  const { t, isTelugu } = useLanguage();

  const percentage =
    attendance.percentage !== undefined ? attendance.percentage : 100;
  const isEligible = percentage >= 75;
  const isShortage = percentage >= 65 && percentage < 75;
  const isCritical = percentage < 65;

  let accentColor = theme.colors.success;
  let bgAccent = theme.colors.successBg;
  let borderAccent = theme.colors.successBorder;
  let standingTitle = t("standingGood");
  let standingDesc = t("statusGoodMessage");

  if (isShortage) {
    accentColor = theme.colors.warning;
    bgAccent = theme.colors.warningBg;
    borderAccent = theme.colors.warningBorder;
    standingTitle = t("standingWarning");
    standingDesc = t("statusWarningMessage", {
      count: attendance.classesNeededFor75 || 1,
    });
  } else if (isCritical) {
    accentColor = theme.colors.danger;
    bgAccent = theme.colors.dangerBg;
    borderAccent = theme.colors.dangerBorder;
    standingTitle = t("standingCritical");
    standingDesc = t("statusCriticalMessage", {
      count: attendance.classesNeededFor75 || 5,
    });
  }

  return (
    <View style={styles.card}>
      {/* Title */}
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>{t("attendanceOverview")}</Text>
        <View
          style={[
            styles.standingBadge,
            { backgroundColor: bgAccent, borderColor: borderAccent },
          ]}
        >
          <Text style={[styles.standingBadgeText, { color: accentColor }]}>
            {standingTitle}
          </Text>
        </View>
      </View>

      {/* Main Gauge & Explanation */}
      <View style={styles.gaugeRow}>
        <View style={[styles.circleOuter, { borderColor: accentColor }]}>
          <Text style={[styles.percentageText, { color: accentColor }]}>
            {percentage}%
          </Text>
          <Text style={styles.percentageLabel}>
            {isTelugu ? "హాజరు" : "Attendance"}
          </Text>
        </View>

        <View style={styles.explanationBox}>
          <Text style={styles.explanationText}>{standingDesc}</Text>
          {percentage >= 75 ? (
            <View style={styles.safeTag}>
              <Text style={styles.safeTagText}>
                {isTelugu ? "👍 యూనివర్సిటీ నిబంధనల ప్రకారం సురక్షితం" : "👍 University Exam Eligible"}
              </Text>
            </View>
          ) : (
            <View style={styles.warningTag}>
              <Text style={styles.warningTagText}>
                {isTelugu ? "⚠️ హాజరు పెంచుకోవాల్సి ఉంటుంది" : "⚠️ Attendance Improvement Needed"}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 3 Clear Metric Tiles */}
      <View style={styles.metricsContainer}>
        {/* Total Classes */}
        <View style={styles.metricTile}>
          <Text style={styles.metricNumber}>{attendance.totalClasses || 0}</Text>
          <Text style={styles.metricLabel}>{t("totalClasses")}</Text>
        </View>

        {/* Classes Attended */}
        <View style={[styles.metricTile, styles.metricTileAttended]}>
          <Text style={[styles.metricNumber, { color: theme.colors.successText }]}>
            {attendance.classesAttended || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.colors.successText }]}>
            ✓ {t("attendedClasses")}
          </Text>
        </View>

        {/* Classes Missed */}
        <View style={[styles.metricTile, styles.metricTileMissed]}>
          <Text style={[styles.metricNumber, { color: theme.colors.dangerText }]}>
            {attendance.classesAbsent || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.colors.dangerText }]}>
            ✗ {t("absentClasses")}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.xl,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    ...theme.shadows.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  cardTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.textPrimary,
    fontWeight: "900",
  },
  standingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  standingBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  gaugeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
  },
  circleOuter: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 5,
    backgroundColor: theme.colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.sm,
  },
  percentageText: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  percentageLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 2,
  },
  explanationBox: {
    flex: 1,
    gap: 8,
  },
  explanationText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  safeTag: {
    backgroundColor: theme.colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    alignSelf: "flex-start",
  },
  safeTagText: {
    color: theme.colors.successText,
    fontSize: 11,
    fontWeight: "700",
  },
  warningTag: {
    backgroundColor: theme.colors.warningBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    alignSelf: "flex-start",
  },
  warningTagText: {
    color: theme.colors.warningText,
    fontSize: 11,
    fontWeight: "700",
  },
  metricsContainer: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderColor,
  },
  metricTile: {
    flex: 1,
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  metricTileAttended: {
    backgroundColor: theme.colors.successBg,
    borderColor: theme.colors.successBorder,
  },
  metricTileMissed: {
    backgroundColor: theme.colors.dangerBg,
    borderColor: theme.colors.dangerBorder,
  },
  metricNumber: {
    fontSize: theme.typography.xl,
    fontWeight: "900",
    color: theme.colors.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },
});
