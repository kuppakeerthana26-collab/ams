import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLanguage } from "../context/LanguageContext.js";
import { theme } from "../config/theme.js";

export const TodayStatusCard = ({ weeklyData = [] }) => {
  const { t, isTelugu } = useLanguage();

  // Find today's entry (the last item in weeklyData is today)
  const todayEntry = weeklyData && weeklyData.length > 0 ? weeklyData[weeklyData.length - 1] : null;

  let statusType = "IN_PROGRESS"; // "PRESENT", "ABSENT", "HOLIDAY", "IN_PROGRESS"
  if (todayEntry) {
    if (todayEntry.status === "P") {
      statusType = "PRESENT";
    } else if (todayEntry.status === "A") {
      statusType = "ABSENT";
    } else if (todayEntry.status === "Holiday" || todayEntry.status === "H") {
      statusType = "HOLIDAY";
    }
  }

  // Format today's date in friendly readable string
  const todayDateObj = new Date();
  const dayNum = todayDateObj.getDate();
  const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthNamesTe = ["జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్", "జూలై", "ఆగస్టు", "సెప్టెంబర్", "అక్టోబర్", "నవంబర్", "డిసెంబర్"];
  const formattedDate = isTelugu
    ? `${dayNum} ${monthNamesTe[todayDateObj.getMonth()]} ${todayDateObj.getFullYear()}`
    : `${dayNum} ${monthNamesEn[todayDateObj.getMonth()]} ${todayDateObj.getFullYear()}`;

  let config = {
    title: t("inProgressToday"),
    desc: t("inProgressTodayDesc"),
    icon: "⏳",
    bgColor: theme.colors.infoBg,
    borderColor: theme.colors.info,
    textColor: theme.colors.info,
    statusBadge: isTelugu ? "రికార్డు అవుతోంది" : "In Progress",
  };

  if (statusType === "PRESENT") {
    config = {
      title: t("presentToday"),
      desc: t("presentTodayDesc"),
      icon: "✅",
      bgColor: theme.colors.successBg,
      borderColor: theme.colors.successBorder,
      textColor: theme.colors.successText,
      statusBadge: isTelugu ? "హాజరయ్యారు" : "Present",
    };
  } else if (statusType === "ABSENT") {
    config = {
      title: t("absentToday"),
      desc: t("absentTodayDesc"),
      icon: "❌",
      bgColor: theme.colors.dangerBg,
      borderColor: theme.colors.dangerBorder,
      textColor: theme.colors.dangerText,
      statusBadge: isTelugu ? "గైర్హాజరు" : "Absent",
    };
  } else if (statusType === "HOLIDAY") {
    config = {
      title: t("holidayToday"),
      desc: t("holidayTodayDesc"),
      icon: "🌴",
      bgColor: theme.colors.warningBg,
      borderColor: theme.colors.warningBorder,
      textColor: theme.colors.warningText,
      statusBadge: isTelugu ? "సెలవు" : "Holiday",
    };
  }

  return (
    <View style={[styles.card, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}>
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionHeading}>{t("todayStatusTitle")}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: config.textColor }]}>
          <Text style={styles.badgeText}>{config.statusBadge}</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        <Text style={styles.statusIcon}>{config.icon}</Text>
        <View style={styles.textColumn}>
          <Text style={[styles.statusTitle, { color: config.textColor }]}>{config.title}</Text>
          <Text style={styles.statusDesc}>{config.desc}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1.5,
    ...theme.shadows.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  sectionHeading: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textPrimary,
    fontWeight: "700",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  badgeText: {
    color: theme.colors.bgDark,
    fontSize: theme.typography.xs,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  statusIcon: {
    fontSize: 34,
  },
  textColumn: {
    flex: 1,
  },
  statusTitle: {
    fontSize: theme.typography.md,
    fontWeight: "900",
    marginBottom: 2,
  },
  statusDesc: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    lineHeight: 19,
  },
});
