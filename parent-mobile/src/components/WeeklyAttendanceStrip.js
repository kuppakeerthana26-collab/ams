import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLanguage } from "../context/LanguageContext.js";
import { theme } from "../config/theme.js";

export const WeeklyAttendanceStrip = ({ weeklyData = [] }) => {
  const { t, isTelugu } = useLanguage();

  if (!weeklyData || weeklyData.length === 0) return null;

  const dayTranslationMap = {
    Sun: isTelugu ? "ఆది" : "Sun",
    Mon: isTelugu ? "సోమ" : "Mon",
    Tue: isTelugu ? "మంగళ" : "Tue",
    Wed: isTelugu ? "బుధ" : "Wed",
    Thu: isTelugu ? "గురు" : "Thu",
    Fri: isTelugu ? "శుక్ర" : "Fri",
    Sat: isTelugu ? "శని" : "Sat",
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t("weeklyTitle")}</Text>
        <Text style={styles.subtitle}>{t("weeklySubtitle")}</Text>
      </View>

      <View style={styles.stripRow}>
        {weeklyData.map((day, idx) => {
          const isPresent = day.status === "P";
          const isAbsent = day.status === "A";
          const isHoliday = day.status === "Holiday" || day.status === "H";
          const isNoClass = !isPresent && !isAbsent && !isHoliday;

          let pillBg = theme.colors.bgSurface;
          let pillBorder = theme.colors.borderColor;
          let badgeBg = theme.colors.bgElevated;
          let badgeText = "—";
          let badgeTextColor = theme.colors.textMuted;

          if (isPresent) {
            pillBg = theme.colors.successBg;
            pillBorder = theme.colors.successBorder;
            badgeBg = theme.colors.success;
            badgeText = "✓";
            badgeTextColor = theme.colors.white;
          } else if (isAbsent) {
            pillBg = theme.colors.dangerBg;
            pillBorder = theme.colors.dangerBorder;
            badgeBg = theme.colors.danger;
            badgeText = "✗";
            badgeTextColor = theme.colors.white;
          } else if (isHoliday) {
            pillBg = theme.colors.warningBg;
            pillBorder = theme.colors.warningBorder;
            badgeBg = theme.colors.warning;
            badgeText = "★";
            badgeTextColor = theme.colors.bgDark;
          }

          const displayDay = dayTranslationMap[day.day] || day.day;

          return (
            <View
              key={day.date || idx}
              style={[
                styles.dayCard,
                { backgroundColor: pillBg, borderColor: pillBorder },
              ]}
            >
              <Text style={styles.dayName}>{displayDay}</Text>
              <Text style={styles.dayNumber}>{day.dayNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                <Text style={[styles.statusBadgeText, { color: badgeTextColor }]}>
                  {badgeText}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Clear Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
          <Text style={styles.legendText}>
            {isTelugu ? "✓ హాజరు (P)" : "✓ Present"}
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.danger }]} />
          <Text style={styles.legendText}>
            {isTelugu ? "✗ గైర్హాజరు (A)" : "✗ Absent"}
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
          <Text style={styles.legendText}>
            {isTelugu ? "★ సెలవు (H)" : "★ Holiday"}
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
  stripRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  dayCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  dayName: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  dayNumber: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.base,
    fontWeight: "900",
    marginBottom: 6,
  },
  statusBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "900",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderColor,
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
  legendText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
});
