import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../config/theme.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { api } from "../services/api.js";
import { sendBatchAbsenteeSms } from "../services/smsService.js";
import { Header } from "../components/Header.js";
import { StudentCard } from "../components/StudentCard.js";
import { ClassPickerModal } from "../components/ClassPickerModal.js";
import { SubmissionModal } from "../components/SubmissionModal.js";
import { EmptyState } from "../components/EmptyState.js";

const getTodayString = () => new Date().toISOString().slice(0, 10);

const getDefaultClass = (user) => {
  if (user?.assignedClass?.branch && user?.assignedClass?.year && user?.assignedClass?.section) {
    return `${user.assignedClass.branch}_${user.assignedClass.year}_${user.assignedClass.section}`.replace(/\s+/g, "_");
  }
  return "CSE_1_A";
};

export const AttendanceScreen = () => {
  const { token, user } = useAuth();
  const { success, error } = useToast();

  const [selectedClass, setSelectedClass] = useState(() => getDefaultClass(user));
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [students, setStudents] = useState([]);
  const [attendanceState, setAttendanceState] = useState({}); // { [studentId]: "P" | "A" }
  const [isLocked, setIsLocked] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showClassModal, setShowClassModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [smsReport, setSmsReport] = useState(null);

  // Fetch register data for the selected class & date
  const fetchRegister = useCallback(
    async (isPullRefresh = false) => {
      if (!token || !selectedClass) return;
      if (isPullRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const res = await api.register(token, {
          className: selectedClass,
          date: selectedDate,
        });

        if (res.success) {
          setStudents(res.students || []);
          setIsLocked(Boolean(res.locked));
          setSubmissionData(res.submission || null);

          // If locked, populate attendance from existing submission entries
          if (res.locked && res.submission?.entries) {
            const state = {};
            res.submission.entries.forEach((entry) => {
              const studentId = entry.student?._id || entry.student || entry.studentId;
              if (studentId) {
                state[studentId] = entry.status;
              }
            });
            // Also map by student rollNo / id if needed
            res.students.forEach((st) => {
              const matchedEntry = res.submission.entries.find(
                (e) => (e.student?._id || e.student) === st._id || e.rollNo === st.rollNo,
              );
              if (matchedEntry) {
                state[st._id] = matchedEntry.status;
              }
            });
            setAttendanceState(state);
          } else {
            // Default all students to "P" (Present) for quick mark workflow
            const initialState = {};
            (res.students || []).forEach((st) => {
              initialState[st._id] = "P";
            });
            setAttendanceState(initialState);
          }
        }
      } catch (err) {
        error(err.message || "Failed to load class register");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, selectedClass, selectedDate, error],
  );

  useEffect(() => {
    fetchRegister();
  }, [fetchRegister]);

  // Status toggle handler
  const handleToggleStatus = (studentId, newStatus) => {
    if (isLocked) return;
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: newStatus,
    }));
  };

  // Quick actions: Mark All Present / Absent / Invert
  const handleMarkAll = (status) => {
    if (isLocked) return;
    const nextState = {};
    students.forEach((st) => {
      nextState[st._id] = status;
    });
    setAttendanceState(nextState);
  };

  const handleInvert = () => {
    if (isLocked) return;
    const nextState = {};
    students.forEach((st) => {
      nextState[st._id] = (attendanceState[st._id] || "P") === "P" ? "A" : "P";
    });
    setAttendanceState(nextState);
  };

  // Date step helpers
  const handleStepDate = (days) => {
    const current = new Date(`${selectedDate}T00:00:00Z`);
    current.setUTCDate(current.getUTCDate() + days);
    setSelectedDate(current.toISOString().slice(0, 10));
  };

  // Submit attendance to backend and dispatch automatic SmsManager alerts
  const handleConfirmSubmit = async () => {
    if (!token || !selectedClass) return;
    setIsSubmitting(true);

    const entries = students.map((st) => ({
      studentId: st._id,
      status: attendanceState[st._id] || "P",
    }));

    try {
      const res = await api.submitAttendance(token, {
        className: selectedClass,
        date: selectedDate,
        entries,
      });

      if (res.success) {
        // Automatically send direct background SMS via SmsManager to absentee parents
        const absenteeList = res.absentees || students.filter((s) => attendanceState[s._id] === "A");
        if (absenteeList.length > 0) {
          const report = await sendBatchAbsenteeSms({
            absentees: absenteeList,
            date: selectedDate,
            className: selectedClass,
          });
          setSmsReport(report);
        }

        setSubmissionResult(res);
        setIsLocked(true);
        setSubmissionData(res.submission);
        success(`Attendance locked & SMS dispatched for ${selectedClass}!`);
      }
    } catch (err) {
      error(err.message || "Failed to submit attendance");
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter students by search term
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase().trim();
    return students.filter(
      (st) =>
        st.name?.toLowerCase().includes(q) ||
        st.rollNo?.toLowerCase().includes(q) ||
        st.parentPhone?.includes(q),
    );
  }, [students, searchQuery]);

  // Summary counts
  const totalCount = students.length;
  const presentCount = students.filter((st) => (attendanceState[st._id] || "P") === "P").length;
  const absentCount = students.filter((st) => attendanceState[st._id] === "A").length;
  const attendanceRate = totalCount ? Math.round((presentCount / totalCount) * 100) : 0;

  const isToday = selectedDate === getTodayString();

  return (
    <View style={styles.container}>
      <Header
        title="Attendance Register"
        subtitle={`Marking session • ${selectedDate}`}
        selectedClass={selectedClass}
        onClassPress={() => setShowClassModal(true)}
      />

      {/* Date Navigation Bar */}
      <View style={styles.dateBar}>
        <TouchableOpacity
          style={styles.dateNavBtn}
          onPress={() => handleStepDate(-1)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={18} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.dateCenter}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.primaryLight} />
          <Text style={styles.dateText}>{selectedDate}</Text>
          {isToday && <View style={styles.todayPill}><Text style={styles.todayPillText}>TODAY</Text></View>}
        </View>

        <TouchableOpacity
          style={[styles.dateNavBtn, isToday && styles.dateNavBtnDisabled]}
          onPress={() => handleStepDate(1)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color={isToday ? theme.colors.textMuted : theme.colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Locked Register Banner */}
      {isLocked && (
        <View style={styles.lockedBanner}>
          <Ionicons name="lock-closed" size={18} color={theme.colors.warning} />
          <View style={styles.lockedTextWrap}>
            <Text style={styles.lockedTitle}>Attendance Submitted & Locked</Text>
            <Text style={styles.lockedSubtitle}>
              {submissionData?.createdAt
                ? `Submitted on ${new Date(submissionData.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Worksheet updated in Excel register. Edits disabled."}
            </Text>
          </View>
        </View>
      )}

      {/* Live Metric Strip */}
      <View style={styles.metricsStrip}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{totalCount}</Text>
          <Text style={styles.metricLabel}>Total</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: theme.colors.present }]}>{presentCount}</Text>
          <Text style={styles.metricLabel}>Present</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: theme.colors.absent }]}>{absentCount}</Text>
          <Text style={styles.metricLabel}>Absent</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: theme.colors.primaryLight }]}>
            {attendanceRate}%
          </Text>
          <Text style={styles.metricLabel}>Rate</Text>
        </View>
      </View>

      {/* Controls Bar: Search & Quick Mark */}
      <View style={styles.controlsBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by roll no or name..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {!isLocked && (
          <View style={styles.quickActionRow}>
            <TouchableOpacity
              style={[styles.quickBtn, styles.quickBtnPresent]}
              onPress={() => handleMarkAll("P")}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-done" size={14} color={theme.colors.present} />
              <Text style={styles.quickBtnPresentText}>All P</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickBtn, styles.quickBtnAbsent]}
              onPress={() => handleMarkAll("A")}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={14} color={theme.colors.absent} />
              <Text style={styles.quickBtnAbsentText}>All A</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={handleInvert}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-horizontal" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.quickBtnText}>Invert</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Student Roll Call List */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primaryLight} />
          <Text style={styles.loaderText}>Loading class register...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchRegister(true)}
              tintColor={theme.colors.primaryLight}
            />
          }
          renderItem={({ item }) => (
            <StudentCard
              student={item}
              status={attendanceState[item._id] || "P"}
              onToggleStatus={handleToggleStatus}
              isLocked={isLocked}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title={searchQuery ? "No Students Match Search" : "No Students Found"}
              message={
                searchQuery
                  ? `No students found matching "${searchQuery}".`
                  : `No students enrolled in class ${selectedClass}. Use the Students tab to add students.`
              }
              actionLabel="Refresh"
              onAction={() => fetchRegister()}
            />
          }
        />
      )}

      {/* Bottom Floating Submit Button */}
      {!isLocked && totalCount > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => {
              setSubmissionResult(null);
              setShowConfirmModal(true);
            }}
            activeOpacity={0.85}
          >
            <View style={styles.submitBtnLeft}>
              <Ionicons name="checkmark-circle-outline" size={22} color={theme.colors.white} />
              <Text style={styles.submitBtnText}>Submit & Lock Register</Text>
            </View>
            <View style={styles.submitAbsentPill}>
              <Text style={styles.submitAbsentPillText}>
                {absentCount} {absentCount === 1 ? "Absent" : "Absentees"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Class Selection Modal */}
      <ClassPickerModal
        visible={showClassModal}
        currentClass={selectedClass}
        onSelectClass={setSelectedClass}
        onClose={() => setShowClassModal(false)}
      />

      {/* Submission Confirmation / Result Modal */}
      <SubmissionModal
        visible={showConfirmModal}
        className={selectedClass}
        date={selectedDate}
        students={students}
        attendanceState={attendanceState}
        isSubmitting={isSubmitting}
        submissionResult={submissionResult}
        smsReport={smsReport}
        onConfirm={handleConfirmSubmit}
        onClose={() => {
          setShowConfirmModal(false);
          setSubmissionResult(null);
          setSmsReport(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  dateBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.navyCard,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.navyBorder,
  },
  dateNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  dateNavBtnDisabled: {
    opacity: 0.3,
  },
  dateCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontSize: theme.typography.sm,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  todayPill: {
    backgroundColor: theme.colors.primaryGlow,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  todayPillText: {
    fontSize: 9,
    fontWeight: "800",
    color: theme.colors.primaryLight,
  },
  lockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.warningBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(245, 158, 11, 0.3)",
  },
  lockedTextWrap: {
    flex: 1,
  },
  lockedTitle: {
    fontSize: theme.typography.xs,
    fontWeight: "800",
    color: theme.colors.warning,
  },
  lockedSubtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  metricsStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: theme.colors.navyCard,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.navyBorder,
  },
  metricItem: {
    alignItems: "center",
  },
  metricValue: {
    fontSize: theme.typography.lg,
    fontWeight: "900",
    color: theme.colors.textPrimary,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.navyBorder,
  },
  controlsBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.xs,
    fontWeight: "600",
  },
  quickActionRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickBtnPresent: {
    backgroundColor: theme.colors.presentBg,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  quickBtnPresentText: {
    fontSize: theme.typography.xs,
    fontWeight: "800",
    color: theme.colors.present,
  },
  quickBtnAbsent: {
    backgroundColor: theme.colors.absentBg,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  quickBtnAbsentText: {
    fontSize: theme.typography.xs,
    fontWeight: "800",
    color: theme.colors.absent,
  },
  quickBtnText: {
    fontSize: theme.typography.xs,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 110,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loaderText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.navyCard,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.navyBorder,
    ...theme.shadows.lg,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 18,
    ...theme.shadows.md,
  },
  submitBtnLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  submitBtnText: {
    color: theme.colors.white,
    fontSize: theme.typography.md,
    fontWeight: "800",
  },
  submitAbsentPill: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  submitAbsentPillText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: "800",
  },
});
