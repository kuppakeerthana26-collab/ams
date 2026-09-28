import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLanguage } from "../context/LanguageContext.js";
import { theme } from "../config/theme.js";

export const AbsenceHistoryList = ({ absences = [], onClarify = null }) => {
  const { t, isTelugu } = useLanguage();

  if (!absences || absences.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t("absenceTitle")}</Text>
        </View>

        <View style={styles.emptyStateBox}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyTitle}>
            {isTelugu ? "100% రెగ్యులర్ హాజరు!" : "100% Regular Attendance!"}
          </Text>
          <Text style={styles.emptyDesc}>{t("noAbsences")}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t("absenceTitle")}</Text>
        <Text style={styles.subtitle}>{t("absenceSubtitle")}</Text>
      </View>

      <View style={styles.list}>
        {absences.map((abs, index) => {
          return (
            <View key={index} style={styles.absenceCard}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateIcon}>📅</Text>
                <Text style={styles.dateText}>{abs.date}</Text>
              </View>

              <View style={styles.detailsColumn}>
                <Text style={styles.className}>{abs.className}</Text>
                <Text style={styles.recordedBy}>
                  {t("markedBy")} <Text style={styles.teacherName}>{abs.recordedBy || "Class In-charge"}</Text>
                </Text>
              </View>

              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>
                  {isTelugu ? "రాలేదు" : "ABSENT"}
                </Text>
              </View>
            </View>
          );
        })}
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
    marginBottom: 14,
  },
  title: {
    fontSize: theme.typography.base,
    color: theme.colors.textPrimary,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  emptyStateBox: {
    backgroundColor: theme.colors.successBg,
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.successBorder,
    marginTop: 4,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    color: theme.colors.successText,
    fontSize: theme.typography.base,
    fontWeight: "900",
    marginBottom: 4,
  },
  emptyDesc: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  list: {
    gap: 10,
  },
  absenceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.bgSurface,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.dangerBorder,
    gap: 12,
  },
  dateBadge: {
    backgroundColor: theme.colors.dangerBg,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.dangerBorder,
  },
  dateIcon: {
    fontSize: 14,
    marginBottom: 2,
  },
  dateText: {
    color: theme.colors.dangerText,
    fontSize: 11,
    fontWeight: "800",
  },
  detailsColumn: {
    flex: 1,
  },
  className: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sm,
    fontWeight: "800",
  },
  recordedBy: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  teacherName: {
    color: theme.colors.textSecondary,
    fontWeight: "700",
  },
  statusBadge: {
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});
