import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../config/theme.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { api, getApiBaseUrl } from "../services/api.js";
import { Header } from "../components/Header.js";
import { ClassPickerModal } from "../components/ClassPickerModal.js";
import { EmptyState } from "../components/EmptyState.js";

const getTodayString = () => new Date().toISOString().slice(0, 10);

const getDefaultClass = (user) => {
  if (user?.assignedClass?.branch && user?.assignedClass?.year && user?.assignedClass?.section) {
    return `${user.assignedClass.branch}_${user.assignedClass.year}_${user.assignedClass.section}`.replace(/\s+/g, "_");
  }
  return "CSE_1_A";
};

export const ReportsScreen = () => {
  const { token, user } = useAuth();
  const { info } = useToast();

  const [selectedClass, setSelectedClass] = useState(() => getDefaultClass(user));
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [sheetData, setSheetData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);

  const fetchSheetData = useCallback(
    async (isPullRefresh = false) => {
      if (!token || !selectedClass || !selectedDate) return;
      if (isPullRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const res = await api.sheet(token, {
          className: selectedClass,
          date: selectedDate,
        });

        if (res && res.success) {
          setSheetData(res);
        }
      } catch (err) {
        setSheetData(null);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, selectedClass, selectedDate],
  );

  useEffect(() => {
    fetchSheetData();
  }, [fetchSheetData]);

  const handleDownloadExcel = () => {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/attendance/download?className=${selectedClass}&date=${selectedDate}&token=${token}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Download Excel", `Open URL in browser: ${url}`);
    });
    info(`Downloading ${selectedClass} official Excel attendance register...`);
  };

  const handleDownloadCSV = () => {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/admin/reports/download?className=${selectedClass}&token=${token}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Download CSV", `Open URL in browser: ${url}`);
    });
    info(`Downloading ${selectedClass} CSV summary report...`);
  };

  const meta = sheetData?.meta || {};
  const headers = sheetData?.headers || { dates: [], days: [], summary: ["Total P", "Total A", "%"] };
  const students = sheetData?.students || [];

  return (
    <View style={styles.container}>
      <Header
        title="Attendance Registers"
        subtitle={`GKCE Official Registers • ${selectedClass}`}
        selectedClass={selectedClass}
        onClassPress={() => setShowClassModal(true)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchSheetData(true)}
            tintColor={theme.colors.primaryLight}
          />
        }
      >
        {/* Export Action Card */}
        <View style={styles.exportCard}>
          <View style={styles.exportBadgeRow}>
            <View style={styles.liveSyncBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveSyncText}>Official GKCE Register Format</Text>
            </View>
            <Text style={styles.monthBadgeText}>
              {meta.monthName || "September"} {meta.year || "2026"}
            </Text>
          </View>

          <Text style={styles.exportTitle}>Download Official Excel Registers</Text>
          <Text style={styles.exportSubtitle}>
            Formatted with College Banner, Department, Branch, Year, Section, daily records & summary formulas
          </Text>

          <View style={styles.exportBtnRow}>
            <TouchableOpacity
              style={[styles.exportBtn, styles.excelBtn]}
              onPress={handleDownloadExcel}
              activeOpacity={0.8}
            >
              <Ionicons name="document-text" size={22} color="#10b981" />
              <View style={styles.btnTextCol}>
                <Text style={styles.exportBtnTitle}>Download Excel Sheet</Text>
                <Text style={styles.exportBtnSub}>{selectedClass} (.xlsx)</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exportBtn, styles.csvBtn]}
              onPress={handleDownloadCSV}
              activeOpacity={0.8}
            >
              <Ionicons name="cloud-download" size={22} color="#3b82f6" />
              <View style={styles.btnTextCol}>
                <Text style={styles.exportBtnTitle}>Full Log CSV</Text>
                <Text style={styles.exportBtnSub}>{selectedClass} (.csv)</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Details Box */}
        {Boolean(meta.departmentName) && (
          <View style={styles.metaCard}>
            <View style={styles.metaHeader}>
              <Ionicons name="school-outline" size={18} color={theme.colors.primaryLight} />
              <Text style={styles.metaCollege}>{meta.collegeName || "Gokula Krishna College of Engineering"}</Text>
            </View>
            <Text style={styles.metaDept}>{meta.departmentName}</Text>

            <View style={styles.metaGrid}>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillLabel}>YEAR & SEC</Text>
                <Text style={styles.metaPillVal}>{meta.year || "Year 1"} • {meta.section || "Sec A"}</Text>
              </View>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillLabel}>CLASS CODE</Text>
                <Text style={styles.metaPillVal}>{selectedClass}</Text>
              </View>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillLabel}>REGISTER PERIOD</Text>
                <Text style={styles.metaPillVal}>{meta.monthName} {meta.year} ({meta.daysInMonth}d)</Text>
              </View>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillLabel}>ENROLLED</Text>
                <Text style={styles.metaPillVal}>{meta.totalStudents || students.length} Students</Text>
              </View>
            </View>
          </View>
        )}

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Worksheet Matrix Preview</Text>
            <Text style={styles.sectionSubtitle}>
              Live synchronized matrix from Excel register
            </Text>
          </View>

          <TouchableOpacity style={styles.refreshIconBtn} onPress={() => fetchSheetData()}>
            <Ionicons name="refresh" size={16} color={theme.colors.primaryLight} />
          </TouchableOpacity>
        </View>

        {/* Sheet Table / Rows */}
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.primaryLight} />
            <Text style={styles.loaderText}>Generating Excel register matrix...</Text>
          </View>
        ) : students.length === 0 ? (
          <EmptyState
            icon="grid-outline"
            title="No Students Found"
            message={`No student enrolled in ${selectedClass}. Add students to view and download the attendance register.`}
            actionLabel="Refresh Sheet"
            onAction={() => fetchSheetData()}
          />
        ) : (
          <View style={styles.tableCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                {/* Header Row: Day Numbers & Column Labels */}
                <View style={styles.tableHeaderRow}>
                  <View style={styles.colRoll}>
                    <Text style={styles.headerText}>Roll No</Text>
                  </View>
                  <View style={styles.colName}>
                    <Text style={styles.headerText}>Student Name</Text>
                  </View>

                  {/* Date Columns */}
                  {(headers.dates || []).map((dateNum, idx) => {
                    const dayName = headers.days?.[idx] || "";
                    const isSunday = dayName === "Sun";
                    return (
                      <View
                        key={`h-date-${idx}`}
                        style={[styles.colDay, isSunday && styles.colSundayHeader]}
                      >
                        <Text style={[styles.dayNumText, isSunday && styles.sundayText]}>{dateNum}</Text>
                        <Text style={[styles.dayNameText, isSunday && styles.sundayText]}>{dayName}</Text>
                      </View>
                    );
                  })}

                  {/* Summary Columns */}
                  <View style={styles.colSummary}>
                    <Text style={styles.headerText}>Total P</Text>
                  </View>
                  <View style={styles.colSummary}>
                    <Text style={styles.headerText}>Total A</Text>
                  </View>
                  <View style={styles.colSummaryPercent}>
                    <Text style={styles.headerText}>Attendance %</Text>
                  </View>
                </View>

                {/* Student Attendance Rows */}
                {students.map((student, sIdx) => {
                  const isEven = sIdx % 2 === 0;
                  return (
                    <View
                      key={`student-row-${student.rollNo}`}
                      style={[styles.studentRow, isEven && styles.studentRowEven]}
                    >
                      {/* Roll No */}
                      <View style={styles.colRoll}>
                        <Text style={styles.rollText}>{student.rollNo}</Text>
                      </View>

                      {/* Name */}
                      <View style={styles.colName}>
                        <Text style={styles.nameText} numberOfLines={1}>
                          {student.name}
                        </Text>
                      </View>

                      {/* Days Attendance */}
                      {(headers.dates || []).map((_, dIdx) => {
                        const day = dIdx + 1;
                        const status = student.attendance?.[day] || "";
                        const dayName = headers.days?.[dIdx] || "";
                        const isSunday = dayName === "Sun";

                        return (
                          <View
                            key={`st-${student.rollNo}-day-${day}`}
                            style={[
                              styles.colDay,
                              isSunday && styles.colSundayCell,
                              status === "P" && styles.cellPresent,
                              status === "A" && styles.cellAbsent,
                            ]}
                          >
                            {status === "P" ? (
                              <View style={styles.pBadge}>
                                <Text style={styles.pText}>P</Text>
                              </View>
                            ) : status === "A" ? (
                              <View style={styles.aBadge}>
                                <Text style={styles.aText}>A</Text>
                              </View>
                            ) : (
                              <Text style={[styles.emptyDayText, isSunday && styles.sundayDash]}>
                                {isSunday ? "•" : "-"}
                              </Text>
                            )}
                          </View>
                        );
                      })}

                      {/* Total P */}
                      <View style={[styles.colSummary, styles.summaryCellP]}>
                        <Text style={styles.summaryPText}>{student.totalP}</Text>
                      </View>

                      {/* Total A */}
                      <View style={[styles.colSummary, styles.summaryCellA]}>
                        <Text style={styles.summaryAText}>{student.totalA}</Text>
                      </View>

                      {/* Percentage */}
                      <View style={[styles.colSummaryPercent, styles.summaryCellPercent]}>
                        <Text style={styles.summaryPercentText}>{student.percentage}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Class Selector Modal */}
      <ClassPickerModal
        visible={showClassModal}
        currentClass={selectedClass}
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
    paddingBottom: 70,
  },
  exportCard: {
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  exportBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  liveSyncBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  liveSyncText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#34d399",
  },
  monthBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.primaryLight,
  },
  exportTitle: {
    fontSize: theme.typography.md,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  exportSubtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
    lineHeight: 16,
  },
  exportBtnRow: {
    flexDirection: "row",
    gap: 10,
  },
  exportBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.navy,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  excelBtn: {
    borderColor: "rgba(16, 185, 129, 0.4)",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  csvBtn: {
    borderColor: "rgba(59, 130, 246, 0.4)",
    backgroundColor: "rgba(59, 130, 246, 0.08)",
  },
  btnTextCol: {
    flex: 1,
  },
  exportBtnTitle: {
    fontSize: theme.typography.xs,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  exportBtnSub: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  metaCard: {
    backgroundColor: "#0d1b2a",
    borderRadius: theme.borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1e3a8a",
    marginBottom: 16,
  },
  metaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaCollege: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.primaryLight,
    letterSpacing: 0.3,
  },
  metaDept: {
    fontSize: 13,
    fontWeight: "800",
    color: "#f8fafc",
    marginTop: 2,
    marginBottom: 10,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaPill: {
    backgroundColor: "#1b263b",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2a3d66",
  },
  metaPillLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#94a3b8",
  },
  metaPillVal: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#e2e8f0",
    marginTop: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: theme.typography.md,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  refreshIconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.navyCard,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  loaderContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loaderText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sm,
  },
  tableCard: {
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    borderBottomWidth: 1,
    borderBottomColor: "#1e3a8a",
  },
  headerText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
  },
  colRoll: {
    width: 75,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.15)",
  },
  colName: {
    width: 140,
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.15)",
  },
  colDay: {
    width: 38,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(30, 41, 59, 0.4)",
  },
  colSundayHeader: {
    backgroundColor: "#1e293b",
  },
  colSundayCell: {
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  dayNumText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#ffffff",
  },
  dayNameText: {
    fontSize: 8,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
  },
  sundayText: {
    color: "#cbd5e1",
  },
  colSummary: {
    width: 65,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.15)",
    backgroundColor: "#1d4ed8",
  },
  colSummaryPercent: {
    width: 80,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#172554",
  },
  studentRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    backgroundColor: "#0f172a",
  },
  studentRowEven: {
    backgroundColor: "#131f37",
  },
  rollText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#f8fafc",
  },
  nameText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#e2e8f0",
  },
  pBadge: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  pText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#10b981",
  },
  aBadge: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  aText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#ef4444",
  },
  cellPresent: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  cellAbsent: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },
  emptyDayText: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "600",
  },
  sundayDash: {
    color: "#334155",
  },
  summaryCellP: {
    backgroundColor: "rgba(16, 185, 129, 0.06)",
  },
  summaryPText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#10b981",
  },
  summaryCellA: {
    backgroundColor: "rgba(239, 68, 68, 0.06)",
  },
  summaryAText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ef4444",
  },
  summaryCellPercent: {
    backgroundColor: "rgba(59, 130, 246, 0.06)",
  },
  summaryPercentText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#60a5fa",
  },
});
