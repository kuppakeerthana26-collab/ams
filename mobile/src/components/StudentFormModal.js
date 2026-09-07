import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../config/theme.js";

const PHONE_REGEX = /^\+?[1-9]\d{9,14}$/;

export const StudentFormModal = ({
  visible,
  initialStudent = null,
  defaultClassName = "",
  isSaving = false,
  onSave,
  onClose,
}) => {
  const [rollNo, setRollNo] = useState("");
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialStudent) {
      setRollNo(initialStudent.rollNo || "");
      setName(initialStudent.name || "");
      setClassName(initialStudent.className || defaultClassName || "");
      setParentPhone(initialStudent.parentPhone || "");
    } else {
      setRollNo("");
      setName("");
      setClassName(defaultClassName || "CSE_1_A");
      setParentPhone("+91");
    }
    setErrors({});
  }, [initialStudent, defaultClassName, visible]);

  const validate = () => {
    const errs = {};
    if (!rollNo.trim()) errs.rollNo = "Roll number is required";
    if (!name.trim()) errs.name = "Student full name is required";
    if (!className.trim()) errs.className = "Class name is required";
    if (!parentPhone.trim()) {
      errs.parentPhone = "Parent phone number is required";
    } else if (!PHONE_REGEX.test(parentPhone.trim())) {
      errs.parentPhone = "Format: +919876543210 (international format)";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      rollNo: rollNo.trim().toUpperCase(),
      name: name.trim(),
      className: className.trim().replace(/\s+/g, "_"),
      parentPhone: parentPhone.trim(),
    });
  };

  const isEdit = Boolean(initialStudent);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {isEdit ? "Edit Student Record" : "Add New Student"}
              </Text>
              <Text style={styles.modalSubtitle}>
                {isEdit ? `Updating ${initialStudent?.name}` : "Enrolling student into database"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Roll Number */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>ROLL NUMBER / ID</Text>
              <TextInput
                style={[styles.input, errors.rollNo && styles.inputError]}
                placeholder="e.g. 101 or 21CSE01"
                placeholderTextColor={theme.colors.textMuted}
                value={rollNo}
                onChangeText={setRollNo}
                autoCapitalize="characters"
              />
              {errors.rollNo ? <Text style={styles.errorText}>{errors.rollNo}</Text> : null}
            </View>

            {/* Student Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="e.g. John Doe"
                placeholderTextColor={theme.colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            {/* Class Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>CLASS (BRANCH_YEAR_SECTION)</Text>
              <TextInput
                style={[styles.input, errors.className && styles.inputError]}
                placeholder="e.g. CSE_1_A"
                placeholderTextColor={theme.colors.textMuted}
                value={className}
                onChangeText={setClassName}
                autoCapitalize="characters"
              />
              {errors.className ? <Text style={styles.errorText}>{errors.className}</Text> : null}
            </View>

            {/* Parent Phone Number */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>PARENT WHATSAPP / PHONE</Text>
                <Text style={styles.hintLabel}>Must include country code</Text>
              </View>
              <TextInput
                style={[styles.input, errors.parentPhone && styles.inputError]}
                placeholder="e.g. +919876543210"
                placeholderTextColor={theme.colors.textMuted}
                value={parentPhone}
                onChangeText={setParentPhone}
                keyboardType="phone-pad"
              />
              {errors.parentPhone ? (
                <Text style={styles.errorText}>{errors.parentPhone}</Text>
              ) : (
                <Text style={styles.helperText}>
                  Absence alerts will be automatically sent via WhatsApp to this number.
                </Text>
              )}
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, isSaving && styles.btnDisabled]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={18} color={theme.colors.white} />
                  <Text style={styles.saveBtnText}>
                    {isEdit ? "Update Student" : "Save & Enroll"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.navyCard,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.navyBorder,
  },
  modalTitle: {
    fontSize: theme.typography.lg,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  body: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  hintLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  input: {
    backgroundColor: theme.colors.navy,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: 13,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.md,
    fontWeight: "600",
  },
  inputError: {
    borderColor: theme.colors.absent,
    backgroundColor: "rgba(239, 68, 68, 0.06)",
  },
  errorText: {
    fontSize: theme.typography.xs,
    color: theme.colors.absent,
    marginTop: 4,
    fontWeight: "600",
  },
  helperText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.navyBorder,
  },
  saveBtn: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...theme.shadows.md,
  },
  saveBtnText: {
    color: theme.colors.white,
    fontSize: theme.typography.md,
    fontWeight: "800",
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
