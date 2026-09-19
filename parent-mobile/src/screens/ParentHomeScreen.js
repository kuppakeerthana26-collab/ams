import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { theme } from "../config/theme.js";
import { useParentAuth } from "../context/ParentAuthContext.js";
import { parentApi } from "../services/parentApi.js";
import { AttendanceCard } from "../components/AttendanceCard.js";
import { WeeklyAttendanceStrip } from "../components/WeeklyAttendanceStrip.js";
import { ContactCard } from "../components/ContactCard.js";
import { DeviceLockBanner } from "../components/DeviceLockBanner.js";

export const ParentHomeScreen = () => {
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
        Alert.alert("Unable to load attendance", err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [parentToken, deviceId]
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

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out of the parent portal?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: logout },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top App Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.collegeName}>GKCE COLLEGE</Text>
          <Text style={styles.portalTag}>Parent Portal • Attendance Monitor</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primaryLight}
            colors={[theme.colors.primaryLight]}
          />
        }
      >
        {/* Ward Selector (if parent has multiple children) */}
        {wards.length > 1 ? (
          <View style={styles.wardSelectorContainer}>
            <Text style={styles.wardSelectorLabel}>SELECT WARD:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wardTabs}>
              {wards.map((ward) => {
                const isSelected = selectedWard?.id === ward.id;
                return (
                  <TouchableOpacity
                    key={ward.id}
                    style={[styles.wardTab, isSelected ? styles.wardTabActive : null]}
                    onPress={() => selectWard(ward)}
                  >
                    <Text style={[styles.wardTabText, isSelected ? styles.wardTabTextActive : null]}>
                      {ward.name} ({ward.className})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* Active Ward Profile Card */}
        {selectedWard ? (
          <View style={styles.wardInfoCard}>
            <View style={styles.wardAvatar}>
              <Text style={styles.wardAvatarText}>
                {selectedWard.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.wardDetails}>
              <Text style={styles.wardName}>{selectedWard.name}</Text>
              <Text style={styles.wardMeta}>
                Class: <Text style={styles.whiteText}>{selectedWard.className}</Text> • Roll No:{" "}
                <Text style={styles.whiteText}>{selectedWard.rollNo}</Text>
              </Text>
              <Text style={styles.wardPhone}>
                Registered Parent: {parentProfile?.phone || selectedWard.parentPhone}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Loading Spinner */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primaryLight} />
            <Text style={styles.loadingText}>Retrieving attendance records...</Text>
          </View>
        ) : attendanceData ? (
          <View>
            {/* Primary Attendance Metric Card */}
            <AttendanceCard attendance={attendanceData} />

            {/* 7-Day Weekly Attendance Strip */}
            <WeeklyAttendanceStrip weeklyData={attendanceData.weeklyStrip || []} />

            {/* Monthly Attendance Breakdown */}
            {attendanceData.monthlyBreakdown && attendanceData.monthlyBreakdown.length > 0 ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Monthly Attendance Performance</Text>
                <View style={styles.monthlyList}>
                  {attendanceData.monthlyBreakdown.map((m, idx) => (
                    <View key={idx} style={styles.monthlyItem}>
                      <View>
                        <Text style={styles.monthlyMonth}>{m.month} {m.year}</Text>
                        <Text style={styles.monthlySub}>
                          {m.attended} attended / {m.total} conducted
                        </Text>
                      </View>
                      <View style={styles.monthlyRight}>
                        <Text
                          style={[
                            styles.monthlyPercent,
                            {
                              color:
                                m.percent >= 75
                                  ? theme.colors.success
                                  : m.percent >= 65
                                  ? theme.colors.warning
                                  : theme.colors.danger,
                            },
                          ]}
                        >
                          {m.percent}%
                        </Text>
                        <Text style={styles.monthlyAbsentText}>
                          {m.absent} classes absent
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Recent Absences Log */}
            {attendanceData.recentAbsences && attendanceData.recentAbsences.length > 0 ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Recorded Absence History</Text>
                <Text style={styles.sectionDesc}>Dates when your ward was marked absent:</Text>
                <View style={styles.absenceList}>
                  {attendanceData.recentAbsences.map((abs, idx) => (
                    <View key={idx} style={styles.absenceItem}>
                      <View style={styles.absenceBadge}>
                        <Text style={styles.absenceDate}>{abs.date}</Text>
                      </View>
                      <View style={styles.absenceDetails}>
                        <Text style={styles.absenceClass}>{abs.className}</Text>
                        <Text style={styles.absenceTeacher}>Recorded by: {abs.recordedBy}</Text>
                      </View>
                      <Text style={styles.absenceStatus}>ABSENT</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Academic Contacts (Teacher & HOD) */}
            <ContactCard contacts={contactsData} studentName={selectedWard?.name} />

            {/* Hardware Binding Security Banner */}
            <DeviceLockBanner />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No attendance records found for this student.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.navy,
  },
  header: {
    backgroundColor: theme.colors.navyCard,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.navyBorder,
  },
  headerLeft: {
    flex: 1,
  },
  collegeName: {
    color: theme.colors.primaryLight,
    fontSize: theme.typography.sm,
    fontWeight: "900",
    letterSpacing: 1,
  },
  portalTag: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.base,
    fontWeight: "800",
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: theme.colors.navySurface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  logoutText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.xs,
    fontWeight: "700",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  wardSelectorContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  wardSelectorLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  wardTabs: {
    flexDirection: "row",
    gap: 8,
  },
  wardTab: {
    backgroundColor: theme.colors.navySurface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  wardTabActive: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryLight,
  },
  wardTabText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.xs,
    fontWeight: "600",
  },
  wardTabTextActive: {
    color: theme.colors.white,
    fontWeight: "800",
  },
  wardInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.navyCard,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    gap: 14,
  },
  wardAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  wardAvatarText: {
    color: theme.colors.white,
    fontSize: theme.typography.xl,
    fontWeight: "900",
  },
  wardDetails: {
    flex: 1,
  },
  wardName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.md,
    fontWeight: "800",
  },
  wardMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.xs,
    marginTop: 2,
  },
  wardPhone: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  whiteText: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sm,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.base,
  },
  sectionCard: {
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    ...theme.shadows.md,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.base,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionDesc: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.xs,
    marginBottom: 12,
  },
  monthlyList: {
    gap: 8,
    marginTop: 8,
  },
  monthlyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.navySurface,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  monthlyMonth: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sm,
    fontWeight: "700",
  },
  monthlySub: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.xs,
    marginTop: 2,
  },
  monthlyRight: {
    alignItems: "flex-end",
  },
  monthlyPercent: {
    fontSize: theme.typography.md,
    fontWeight: "800",
  },
  monthlyAbsentText: {
    fontSize: 11,
    color: theme.colors.danger,
    marginTop: 2,
  },
  absenceList: {
    gap: 8,
  },
  absenceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.navySurface,
    padding: 10,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    gap: 10,
  },
  absenceBadge: {
    backgroundColor: theme.colors.dangerBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  absenceDate: {
    color: theme.colors.danger,
    fontSize: theme.typography.xs,
    fontWeight: "700",
  },
  absenceDetails: {
    flex: 1,
  },
  absenceClass: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.xs,
    fontWeight: "700",
  },
  absenceTeacher: {
    color: theme.colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  absenceStatus: {
    color: theme.colors.danger,
    fontSize: theme.typography.xs,
    fontWeight: "900",
  },
});
