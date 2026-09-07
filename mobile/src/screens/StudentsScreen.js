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
import { Header } from "../components/Header.js";
import { StudentCard } from "../components/StudentCard.js";
import { StudentFormModal } from "../components/StudentFormModal.js";
import { ClassPickerModal } from "../components/ClassPickerModal.js";
import { EmptyState } from "../components/EmptyState.js";

export const StudentsScreen = () => {
  const { token, role, user } = useAuth();
  const { success, error } = useToast();
  const isAdmin = role === "admin";
  const isHod = role === "hod";

  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);

  const fetchStudents = useCallback(
    async (isPullRefresh = false) => {
      if (!token) return;
      if (isPullRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const params = {};
        if (selectedClass) params.className = selectedClass;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const res = await api.students(token, params);
        if (res.success) {
          setStudents(res.students || []);
        }
      } catch (err) {
        error(err.message || "Failed to fetch student directory");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, selectedClass, searchQuery, error],
  );

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSaveStudent = async (studentData) => {
    setIsSaving(true);
    try {
      if (editingStudent) {
        const res = await api.updateStudent(token, editingStudent._id, studentData);
        if (res.success) {
          success(`Updated ${studentData.name}`);
          setShowFormModal(false);
          setEditingStudent(null);
          fetchStudents();
        }
      } else {
        const res = await api.createStudent(token, studentData);
        if (res.success) {
          success(`Added ${studentData.name} to ${studentData.className}`);
          setShowFormModal(false);
          fetchStudents();
        }
      }
    } catch (err) {
      error(err.message || "Failed to save student record");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setShowFormModal(true);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Student Directory"
        subtitle={`${students.length} active students registered`}
        selectedClass={selectedClass || "All Classes"}
        onClassPress={() => setShowClassModal(true)}
      />

      {/* Filter & Search Bar */}
      <View style={styles.controlsBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, roll no, or parent phone..."
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

        {selectedClass ? (
          <View style={styles.filterChipRow}>
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>Filtered: {selectedClass}</Text>
              <TouchableOpacity onPress={() => setSelectedClass("")}>
                <Ionicons name="close-circle" size={14} color={theme.colors.primaryLight} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>

      {/* Student List */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primaryLight} />
          <Text style={styles.loaderText}>Loading student records...</Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchStudents(true)}
              tintColor={theme.colors.primaryLight}
            />
          }
          renderItem={({ item }) => (
            <StudentCard
              student={item}
              isEditMode={isAdmin || isHod}
              onEditPress={handleOpenEdit}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="school-outline"
              title="No Students Found"
              message={
                searchQuery
                  ? `No matching students for "${searchQuery}".`
                  : selectedClass
                  ? `No students found in class ${selectedClass}.`
                  : "No students registered yet in the system."
              }
              actionLabel={isAdmin ? "+ Add First Student" : "Refresh"}
              onAction={isAdmin ? handleOpenAdd : () => fetchStudents()}
            />
          }
        />
      )}

      {/* Admin Add Student Floating Action Button */}
      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={handleOpenAdd} activeOpacity={0.85}>
          <Ionicons name="person-add" size={20} color={theme.colors.white} />
          <Text style={styles.fabText}>Add Student</Text>
        </TouchableOpacity>
      )}

      {/* Class Selector Modal */}
      <ClassPickerModal
        visible={showClassModal}
        currentClass={selectedClass || "CSE_1_A"}
        onSelectClass={setSelectedClass}
        onClose={() => setShowClassModal(false)}
      />

      {/* Student Form Modal (Add / Edit) */}
      <StudentFormModal
        visible={showFormModal}
        initialStudent={editingStudent}
        defaultClassName={selectedClass || "CSE_1_A"}
        isSaving={isSaving}
        onSave={handleSaveStudent}
        onClose={() => {
          setShowFormModal(false);
          setEditingStudent(null);
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
  controlsBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sm,
    fontWeight: "600",
  },
  filterChipRow: {
    flexDirection: "row",
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primaryGlow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
    gap: 6,
  },
  activeFilterText: {
    fontSize: theme.typography.xs,
    color: theme.colors.primaryLight,
    fontWeight: "700",
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
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: theme.borderRadius.full,
    gap: 8,
    ...theme.shadows.lg,
  },
  fabText: {
    color: theme.colors.white,
    fontSize: theme.typography.sm,
    fontWeight: "800",
  },
});
