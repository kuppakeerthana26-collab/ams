import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { theme } from "../config/theme.js";
import { useLanguage } from "../context/LanguageContext.js";
import { useParentAuth } from "../context/ParentAuthContext.js";
import { parentApi } from "../services/parentApi.js";

// Components
import { ParentHeader } from "../components/ParentHeader.js";
import { ChildSelector } from "../components/ChildSelector.js";
import { TodayStatusCard } from "../components/TodayStatusCard.js";
import { AttendanceCard } from "../components/AttendanceCard.js";
import { WeeklyAttendanceStrip } from "../components/WeeklyAttendanceStrip.js";
import { MonthlyBreakdownCard } from "../components/MonthlyBreakdownCard.js";
import { AbsenceHistoryList } from "../components/AbsenceHistoryList.js";
import { ContactCard } from "../components/ContactCard.js";
import { CollegeHelplineCard } from "../components/CollegeHelplineCard.js";
import { DeviceSecurityNotice } from "../components/DeviceSecurityNotice.js";

export const ParentHomeScreen = () => {
  const { t, isTelugu } = useLanguage();
  const {
    parentToken,
    parentProfile,
    wards,
    selectedWard,
    selectWard,
    deviceId,
    logout,
  } = useParentAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [contactsData, setContactsData] = useState({});

  const fetchAttendance = useCallback(
    async (wardId) => {
      if (!wardId || !parentToken) return;
      try {
        const response = await parentApi.getWardAttendance(wardId, parentToken, deviceId);
        if (response.success) {
          setAttendanceData(response.attendance);
          setContactsData(response.contacts || {});
        }
      } catch (err) {
        console.error("[ParentHome] Fetch error:", err);
        Alert.alert(
          isTelugu ? "సమాచారం లోడ్ కాలేదు" : "Unable to load attendance",
          err.message
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [parentToken, deviceId, isTelugu]
  );

  useEffect(() => {
    if (selectedWard?.id) {
      setLoading(true);
      fetchAttendance(selectedWard.id);
    }
  }, [selectedWard, fetchAttendance]);

  const onRefresh = () => {
    setRefreshing(true);
    if (selectedWard?.id) {
      fetchAttendance(selectedWard.id);
    } else {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header with Branding & Language Switcher */}
      <ParentHeader onLogout={logout} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primaryLight}
            colors={[theme.colors.primaryLight]}
          />
        }
      >
        {/* Child Profile & Multi-Ward Selector */}
        <ChildSelector
          wards={wards}
          selectedWard={selectedWard}
          onSelectWard={selectWard}
          parentPhone={parentProfile?.phone || selectedWard?.parentPhone}
        />

        {/* Loading Indicator */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>{t("loadingData")}</Text>
          </View>
        ) : attendanceData ? (
          <View>
            {/* 1. Today's Attendance Status (Immediate Answer for Parents) */}
            <TodayStatusCard weeklyData={attendanceData.weeklyStrip || []} />

            {/* 2. Primary Attendance Score & Standing Card */}
            <AttendanceCard attendance={attendanceData} />

            {/* 3. Last 7 Days Weekly Trail */}
            <WeeklyAttendanceStrip weeklyData={attendanceData.weeklyStrip || []} />

            {/* 4. Monthly Performance Breakdown */}
            <MonthlyBreakdownCard monthlyData={attendanceData.monthlyBreakdown || []} />

            {/* 5. Absence History Record (Missed Classes) */}
            <AbsenceHistoryList absences={attendanceData.recentAbsences || []} />

            {/* 6. Direct Teacher & HOD Contact Card (Call/SMS/Email) */}
            <ContactCard contacts={contactsData} studentName={selectedWard?.name} />

            {/* 7. College Office Helpline */}
            <CollegeHelplineCard />

            {/* 8. Device Hardware Security Notice */}
            <DeviceSecurityNotice />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t("noRecordsFound")}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgDark,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sm,
    fontWeight: "600",
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.base,
    textAlign: "center",
    lineHeight: 22,
  },
});
