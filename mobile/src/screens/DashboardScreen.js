import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../config/theme.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { api } from "../services/api.js";
import { Header } from "../components/Header.js";
import { StatCard } from "../components/StatCard.js";
import { ClassPickerModal } from "../components/ClassPickerModal.js";
import { EmptyState } from "../components/EmptyState.js";

export const DashboardScreen = () => {
  const { token, role } = useAuth();
  const { error } = useToast();

  const [selectedClass, setSelectedClass] = useState("");
  const [stats, setStats] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [absentees, setAbsentees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("submissions"); // "submissions" | "absentees"

  const fetchDashboardData = useCallback(
    async (isPullRefresh = false) => {
      if (!token) return;
      if (isPullRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const params = selectedClass ? { className: selectedClass } : {};

        const [statsRes, absenteesRes] = await Promise.all([
          api.statistics(token, params),
          api.absentees(token, params),
        ]);

        if (statsRes.success) {
          setStats(statsRes.stats || {});
          setRecentSubmissions(statsRes.recentSubmissions || []);
        }

        if (absenteesRes.success) {
          setAbsentees(absenteesRes.history || []);
        }
      } catch (err) {
        error(err.message || "Failed to load dashboard analytics");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, selectedClass, error],
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <View style={styles.container}>
      <Header
        title="Admin Analytics"
        subtitle="Live attendance performance & audit log"
        selectedClass={selectedClass || "All Classes"}
        onClassPress={() => setShowClassModal(true)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchDashboardData(true)}
            tintColor={theme.colors.primaryLight}
          />
        }
      >
        {/* Class Filter Bar */}
        {selectedClass ? (
          <View style={styles.filterBar}>
            <Text style={styles.filterLabel}>Viewing analytics for: {selectedClass}</Text>
            <TouchableOpacity onPress={() => setSelectedClass("")}>
              <Text style={styles.clearFilterText}>Reset to All</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {isLoading && !stats ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.primaryLight} />
            <Text style={styles.loaderText}>Calculating metrics...</Text>
          </View>
        ) : (
          <>
            {/* Stat Cards Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StatCard
                  title="Enrolled Students"
                  value={stats?.students ?? 0}
                  icon="people"
                  color={theme.colors.primaryLight}
                />
                <StatCard
                  title="Submissions"
                  value={stats?.submissions ?? 0}
                  icon="checkbox"
                  color="#8b5cf6"
                />
              </View>

              <View style={styles.statsRow}>
                <StatCard
                  title="Present Rate"
                  value={`${stats?.presentPercent ?? 0}%`}
                  icon="trending-up"
                  color={theme.colors.present}
                  badge="Target 75%+"
                />
                <StatCard
                  title="Total Absences"
                  value={stats?.totalAbsent ?? 0}
                  icon="person-remove"
                  color={theme.colors.absent}
                />
              </View>

              {stats?.failedMessages > 0 && (
                <View style={styles.failedAlertCard}>
                  <Ionicons name="warning" size={20} color={theme.colors.warning} />
                  <View style={styles.failedAlertTextWrap}>
                    <Text style={styles.failedAlertTitle}>
                      {stats.failedMessages} WhatsApp Messages Pending/Failed
                    </Text>
                    <Text style={styles.failedAlertSubtitle}>
                      Background retry worker will re-attempt delivery.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Sub-tabs: Recent Submissions vs Absentee History */}
            <View style={styles.tabSwitch}>
              <TouchableOpacity
                style={[styles.tabBtn, activeSubTab === "submissions" && styles.tabBtnActive]}
                onPress={() => setActiveSubTab("submissions")}
              >
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={activeSubTab === "submissions" ? theme.colors.primaryLight : theme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    activeSubTab === "submissions" && styles.tabBtnTextActive,
                  ]}
                >
                  Recent Submissions ({recentSubmissions.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeSubTab === "absentees" && styles.tabBtnActive]}
                onPress={() => setActiveSubTab("absentees")}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={activeSubTab === "absentees" ? theme.colors.absent : theme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    activeSubTab === "absentees" && styles.tabBtnTextActive,
                  ]}
                >
                  Absentee Log ({absentees.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submissions Feed */}
            {activeSubTab === "submissions" ? (
              <View style={styles.feedContainer}>
                {recentSubmissions.length === 0 ? (
                  <EmptyState
                    icon="calendar-outline"
                    title="No Submissions Yet"
                    message="No attendance sessions have been submitted for this selection."
                  />
                ) : (
                  recentSubmissions.map((sub) => {
                    const present = sub.entries.filter((e) => e.status === "P").length;
                    const absent = sub.entries.filter((e) => e.status === "A").length;
                    const rate = sub.entries.length
                      ? Math.round((present / sub.entries.length) * 100)
                      : 0;

                    return (
                      <View key={sub._id} style={styles.submissionCard}>
                        <View style={styles.submissionTop}>
                          <View style={styles.submissionClassBadge}>
                            <Ionicons name="school" size={13} color={theme.colors.primaryLight} />
                            <Text style={styles.submissionClassText}>{sub.className}</Text>
                          </View>
                          <Text style={styles.submissionDate}>{sub.date}</Text>
                        </View>

                        <View style={styles.submissionStats}>
                          <View style={styles.subStat}>
                            <Text style={styles.subStatLabel}>Marked</Text>
                            <Text style={styles.subStatValue}>{sub.entries.length}</Text>
                          </View>
                          <View style={styles.subStat}>
                            <Text style={styles.subStatLabel}>Present</Text>
                            <Text style={[styles.subStatValue, { color: theme.colors.present }]}>
                              {present}
                            </Text>
                          </View>
                          <View style={styles.subStat}>
                            <Text style={styles.subStatLabel}>Absent</Text>
                            <Text style={[styles.subStatValue, { color: theme.colors.absent }]}>
                              {absent}
                            </Text>
                          </View>
                          <View style={styles.subStat}>
                            <Text style={styles.subStatLabel}>Rate</Text>
                            <Text style={[styles.subStatValue, { color: theme.colors.primaryLight }]}>
                              {rate}%
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            ) : (
              /* Absentees Log */
              <View style={styles.feedContainer}>
                {absentees.length === 0 ? (
                  <EmptyState
                    icon="checkmark-done-circle-outline"
                    title="No Absences Logged"
                    message="Great attendance record! No absentees found for this selection."
                  />
                ) : (
                  absentees.map((item, idx) => (
                    <View key={`${item.date}-${item.rollNo}-${idx}`} style={styles.absenteeLogCard}>
                      <View style={styles.absenteeLogLeft}>
                        <View style={styles.absentRollBox}>
                          <Text style={styles.absentRollText}>{item.rollNo}</Text>
                        </View>
                        <View>
                          <Text style={styles.absentName}>{item.name}</Text>
                          <Text style={styles.absentMeta}>
                            {item.className} • {item.date}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.absentStatusBadge}>
                        <Text style={styles.absentStatusText}>ABSENT</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Class Selector Modal */}
      <ClassPickerModal
        visible={showClassModal}
        currentClass={selectedClass || "CSE_1_A"}
        onSelectClass={setSelectedClass}
        onClose={() => setShowClassModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.primaryGlow,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  filterLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.primaryLight,
    fontWeight: "700",
  },
  clearFilterText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textPrimary,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  loaderText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sm,
  },
  statsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  failedAlertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.warningBg,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  failedAlertTextWrap: {
    flex: 1,
  },
  failedAlertTitle: {
    fontSize: theme.typography.xs,
    fontWeight: "800",
    color: theme.colors.warning,
  },
  failedAlertSubtitle: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  tabSwitch: {
    flexDirection: "row",
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.sm,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 6,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: theme.colors.surface,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textMuted,
  },
  tabBtnTextActive: {
    color: theme.colors.textPrimary,
  },
  feedContainer: {
    gap: 10,
  },
  submissionCard: {
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    gap: 10,
    ...theme.shadows.sm,
  },
  submissionTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  submissionClassBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  submissionClassText: {
    fontSize: theme.typography.xs,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  submissionDate: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  submissionStats: {
    flexDirection: "row",
    backgroundColor: theme.colors.navy,
    borderRadius: theme.borderRadius.xs,
    padding: 10,
    justifyContent: "space-around",
  },
  subStat: {
    alignItems: "center",
  },
  subStatLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
  },
  subStatValue: {
    fontSize: theme.typography.sm,
    fontWeight: "900",
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  absenteeLogCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  absenteeLogLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  absentRollBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: theme.colors.absentBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.absentBorder,
  },
  absentRollText: {
    fontSize: 11,
    fontWeight: "900",
    color: theme.colors.absent,
  },
  absentName: {
    fontSize: theme.typography.sm,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  absentMeta: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  absentStatusBadge: {
    backgroundColor: theme.colors.absentBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.absentBorder,
  },
  absentStatusText: {
    fontSize: 9,
    fontWeight: "900",
    color: theme.colors.absent,
    letterSpacing: 0.5,
  },
});
