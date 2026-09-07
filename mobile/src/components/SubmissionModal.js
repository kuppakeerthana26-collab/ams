import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../config/theme.js";

export const SubmissionModal = ({
  visible,
  className,
  date,
  students = [],
  attendanceState = {},
  isSubmitting = false,
  submissionResult,
  smsReport,
  onConfirm,
  onClose,
}) => {
  const total = students.length;
  const presentCount = students.filter((s) => (attendanceState[s._id] || "P") === "P").length;
  const absentStudents = students.filter((s) => attendanceState[s._id] === "A");
  const absentCount = absentStudents.length;
  const presentPercent = total ? Math.round((presentCount / total) * 100) : 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {submissionResult ? (
            // Success result screen
            <View style={styles.content}>
              <View style={[styles.statusIconCircle, { backgroundColor: theme.colors.presentBg }]}>
                <Ionicons name="checkmark-circle" size={44} color={theme.colors.present} />
              </View>

              <Text style={styles.title}>Attendance Recorded!</Text>
              <Text style={styles.subtitle}>
                Class {className} attendance for {date} was successfully committed and locked in the Excel register.
              </Text>

              <View style={styles.resultStatsRow}>
                <View style={styles.resultStatBox}>
                  <Text style={styles.resultStatValue}>{presentCount}</Text>
                  <Text style={styles.resultStatLabel}>PRESENT</Text>
                </View>
                <View style={styles.resultStatBox}>
                  <Text style={[styles.resultStatValue, { color: theme.colors.absent }]}>
                    {absentCount}
                  </Text>
                  <Text style={styles.resultStatLabel}>ABSENT</Text>
                </View>
                <View style={styles.resultStatBox}>
                  <Text style={[styles.resultStatValue, { color: theme.colors.primaryLight }]}>
                    {presentPercent}%
                  </Text>
                  <Text style={styles.resultStatLabel}>RATE</Text>
                </View>
              </View>

              {absentCount > 0 && (
                <View style={styles.smsNotice}>
                  <View style={styles.smsNoticeHeader}>
                    <Ionicons name="chatbox-ellipses" size={20} color="#10b981" />
                    <Text style={styles.smsNoticeTitle}>Automated Parent SMS (SmsManager)</Text>
                  </View>
                  <Text style={styles.smsNoticeText}>
                    Direct background SMS alerts dispatched automatically to {smsReport?.sent ?? absentCount} absentee parent phone numbers.
                  </Text>
                  {smsReport?.results && smsReport.results.length > 0 && (
                    <View style={styles.smsDetailsList}>
                      {smsReport.results.slice(0, 3).map((r, i) => (
                        <View key={i} style={styles.smsDetailRow}>
                          <Text style={styles.smsDetailName}>{r.name} ({r.rollNo})</Text>
                          <Text style={styles.smsDetailStatus}>✓ Sent to {r.phone}</Text>
                        </View>
                      ))}
                      {smsReport.results.length > 3 && (
                        <Text style={styles.smsMoreText}>+{smsReport.results.length - 3} more parents notified</Text>
                      )}
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
                <Ionicons name="checkmark-done-circle" size={22} color={theme.colors.white} />
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Confirmation Screen
            <View style={styles.content}>
              <View style={[styles.statusIconCircle, { backgroundColor: theme.colors.primaryGlow }]}>
                <Ionicons name="shield-checkmark" size={38} color={theme.colors.primaryLight} />
              </View>

              <Text style={styles.title}>Submit Attendance?</Text>
              <Text style={styles.subtitle}>
                Submitting will record to Excel and trigger automated SmsManager parent alerts.
              </Text>

              <View style={styles.statsSummary}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{total}</Text>
                  <Text style={styles.summaryLabel}>Total</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: theme.colors.present }]}>
                    {presentCount}
                  </Text>
                  <Text style={styles.summaryLabel}>Present</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: theme.colors.absent }]}>
                    {absentCount}
                  </Text>
                  <Text style={styles.summaryLabel}>Absent</Text>
                </View>
              </View>

              {absentCount > 0 ? (
                <View style={styles.absenteesContainer}>
                  <View style={styles.absenteesHeader}>
                    <Ionicons name="alert-circle" size={16} color={theme.colors.absent} />
                    <Text style={styles.absenteesTitle}>
                      Absentees ({absentCount}) — Automatic SMS Delivery
                    </Text>
                  </View>

                  <ScrollView style={styles.absenteesList} showsVerticalScrollIndicator={false}>
                    {absentStudents.map((st) => (
                      <View key={st._id} style={styles.absenteeRow}>
                        <Text style={styles.absenteeRoll}>{st.rollNo}</Text>
                        <Text style={styles.absenteeName} numberOfLines={1}>
                          {st.name}
                        </Text>
                        <Text style={styles.absenteePhone}>{st.parentPhone || "No Phone"}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <View style={styles.perfectBanner}>
                  <Ionicons name="sparkles" size={18} color={theme.colors.present} />
                  <Text style={styles.perfectText}>100% Attendance today! No absentee SMS needed.</Text>
                </View>
              )}

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.btn, styles.cancelBtn]}
                  onPress={onClose}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.confirmBtn, isSubmitting && styles.btnDisabled]}
                  onPress={onConfirm}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                  ) : (
                    <>
                      <Ionicons name="paper-plane" size={18} color={theme.colors.white} />
                      <Text style={styles.confirmBtnText}>Submit</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.lg,
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    overflow: "hidden",
    ...theme.shadows.lg,
  },
  content: {
    padding: 22,
    alignItems: "center",
  },
  statusIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: theme.typography.xl,
    fontWeight: "900",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  statsSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: theme.colors.navy,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: theme.typography.xl,
    fontWeight: "900",
    color: theme.colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.navyBorder,
  },
  absenteesContainer: {
    width: "100%",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    maxHeight: 160,
  },
  absenteesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  absenteesTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.absent,
    letterSpacing: 0.3,
  },
  absenteesList: {
    maxHeight: 110,
  },
  absenteeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(239, 68, 68, 0.1)",
    gap: 8,
  },
  absenteeRoll: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    width: 32,
  },
  absenteeName: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  absenteePhone: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  perfectBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.presentBg,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    width: "100%",
    marginTop: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  perfectText: {
    fontSize: theme.typography.xs,
    color: theme.colors.present,
    fontWeight: "700",
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    marginTop: 20,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  cancelBtn: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelBtnText: {
    color: theme.colors.textSecondary,
    fontWeight: "700",
    fontSize: theme.typography.sm,
  },
  confirmBtn: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.md,
  },
  confirmBtnText: {
    color: theme.colors.white,
    fontWeight: "800",
    fontSize: theme.typography.sm,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  resultStatsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 16,
  },
  resultStatBox: {
    flex: 1,
    backgroundColor: theme.colors.navy,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  resultStatValue: {
    fontSize: theme.typography.xl,
    fontWeight: "900",
    color: theme.colors.present,
  },
  resultStatLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  smsNotice: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    padding: 12,
    borderRadius: theme.borderRadius.sm,
    width: "100%",
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
  },
  smsNoticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  smsNoticeTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#34d399",
  },
  smsNoticeText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  smsDetailsList: {
    marginTop: 8,
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(16, 185, 129, 0.2)",
    paddingTop: 6,
  },
  smsDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  smsDetailName: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#e2e8f0",
  },
  smsDetailStatus: {
    fontSize: 10,
    fontWeight: "700",
    color: "#10b981",
  },
  smsMoreText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontStyle: "italic",
    marginTop: 2,
  },
  doneBtn: {
    width: "100%",
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    ...theme.shadows.md,
  },
  doneBtnText: {
    color: theme.colors.white,
    fontWeight: "800",
    fontSize: theme.typography.md,
    letterSpacing: 0.3,
  },
});
