import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLanguage } from "../context/LanguageContext.js";
import { theme } from "../config/theme.js";

export const MonthlyBreakdownCard = ({ monthlyData = [] }) => {
  const { t, isTelugu } = useLanguage();

  if (!monthlyData || monthlyData.length === 0) return null;

  const monthMap = {
    January: isTelugu ? "జనవరి" : "January",
    February: isTelugu ? "ఫిబ్రవరి" : "February",
    March: isTelugu ? "మార్చి" : "March",
    April: isTelugu ? "ఏప్రిల్" : "April",
    May: isTelugu ? "మే" : "May",
    June: isTelugu ? "జూన్" : "June",
    July: isTelugu ? "జూలై" : "July",
    August: isTelugu ? "ఆగస్టు" : "August",
    September: isTelugu ? "సెప్టెంబర్" : "September",
    October: isTelugu ? "అక్టోబర్" : "October",
    November: isTelugu ? "నవంబర్" : "November",
    December: isTelugu ? "డిసెంబర్" : "December",
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t("monthlyTitle")}</Text>
        <Text style={styles.subtitle}>{t("monthlySubtitle")}</Text>
      </View>

      <View style={styles.list}>
        {monthlyData.map((item, index) => {
          const displayMonth = monthMap[item.month] || item.month;
          const pct = item.percent || 0;
          const isGood = pct >= 75;
          const isMid = pct >= 65 && pct < 75;

          const barColor = isGood
            ? theme.colors.success
            : isMid
            ? theme.colors.warning
            : theme.colors.danger;

          return (
            <View key={index} style={styles.monthItem}>
              <View style={styles.monthHeader}>
                <View>
                  <Text style={styles.monthName}>
                    {displayMonth} {item.year}
                  </Text>
                  <Text style={styles.subText}>
                    {t("attendedOutOf", {
                      attended: item.attended,
                      total: item.total,
                    })}
                  </Text>
                </View>

                <View style={styles.percentContainer}>
                  <Text style={[styles.percentNumber, { color: barColor }]}>
                    {pct}%
                  </Text>
                  {item.absent > 0 && (
                    <Text style={styles.absentBadge}>
                      {t("absentCount", { count: item.absent })}
                    </Text>
                  )}
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, pct)}%`, backgroundColor: barColor },
                  ]}
                />
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
  list: {
    gap: 12,
  },
  monthItem: {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  monthName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sm,
    fontWeight: "800",
  },
  subText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  percentContainer: {
    alignItems: "flex-end",
  },
  percentNumber: {
    fontSize: theme.typography.md,
    fontWeight: "900",
  },
  absentBadge: {
    color: theme.colors.dangerText,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
});
