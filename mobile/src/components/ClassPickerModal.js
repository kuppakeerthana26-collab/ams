import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../config/theme.js";

const BRANCHES = ["CSE", "ECE", "MECH", "IT", "EEE", "CIVIL", "AIDS", "AIML"];
const YEARS = [1, 2, 3, 4];
const SECTIONS = ["A", "B", "C", "D"];

export const ClassPickerModal = ({ visible, currentClass, onSelectClass, onClose }) => {
  // Parse current class if possible (e.g. "CSE_1_A")
  const parts = (currentClass || "CSE_1_A").split("_");
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES.includes(parts[0]) ? parts[0] : "CSE");
  const [selectedYear, setSelectedYear] = useState(parseInt(parts[1], 10) || 1);
  const [selectedSection, setSelectedSection] = useState(parts[2] || "A");
  const [customInput, setCustomInput] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleApply = () => {
    if (isCustomMode && customInput.trim()) {
      const formatted = customInput.trim().replace(/\s+/g, "_");
      onSelectClass(formatted);
    } else {
      const formatted = `${selectedBranch}_${selectedYear}_${selectedSection}`;
      onSelectClass(formatted);
    }
    onClose();
  };

  const previewClass = isCustomMode
    ? customInput.trim().replace(/\s+/g, "_") || "..."
    : `${selectedBranch}_${selectedYear}_${selectedSection}`;

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
              <Text style={styles.modalTitle}>Select Class</Text>
              <Text style={styles.modalSubtitle}>Target class for attendance & records</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Mode Switcher */}
            <View style={styles.modeSwitch}>
              <TouchableOpacity
                style={[styles.modeTab, !isCustomMode && styles.modeTabActive]}
                onPress={() => setIsCustomMode(false)}
              >
                <Text style={[styles.modeTabText, !isCustomMode && styles.modeTabTextActive]}>
                  Standard Class
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeTab, isCustomMode && styles.modeTabActive]}
                onPress={() => setIsCustomMode(true)}
              >
                <Text style={[styles.modeTabText, isCustomMode && styles.modeTabTextActive]}>
                  Custom Name
                </Text>
              </TouchableOpacity>
            </View>

            {!isCustomMode ? (
              <View style={styles.standardSelectors}>
                {/* Branch Selection */}
                <Text style={styles.sectionLabel}>DEPARTMENT / BRANCH</Text>
                <View style={styles.chipGrid}>
                  {BRANCHES.map((b) => (
                    <TouchableOpacity
                      key={b}
                      style={[styles.chip, selectedBranch === b && styles.chipActive]}
                      onPress={() => setSelectedBranch(b)}
                    >
                      <Text style={[styles.chipText, selectedBranch === b && styles.chipTextActive]}>
                        {b}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Year Selection */}
                <Text style={styles.sectionLabel}>ACADEMIC YEAR</Text>
                <View style={styles.chipRow}>
                  {YEARS.map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.chip, styles.chipFlex, selectedYear === y && styles.chipActive]}
                      onPress={() => setSelectedYear(y)}
                    >
                      <Text style={[styles.chipText, selectedYear === y && styles.chipTextActive]}>
                        Year {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Section Selection */}
                <Text style={styles.sectionLabel}>SECTION</Text>
                <View style={styles.chipRow}>
                  {SECTIONS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.chip, styles.chipFlex, selectedSection === s && styles.chipActive]}
                      onPress={() => setSelectedSection(s)}
                    >
                      <Text style={[styles.chipText, selectedSection === s && styles.chipTextActive]}>
                        Sec {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.customContainer}>
                <Text style={styles.sectionLabel}>CLASS IDENTIFIER</Text>
                <TextInput
                  style={styles.customInput}
                  placeholder="e.g. CSE_1_A or MBA_FIN_1"
                  placeholderTextColor={theme.colors.textMuted}
                  value={customInput}
                  onChangeText={setCustomInput}
                  autoCapitalize="characters"
                />
                <Text style={styles.hintText}>
                  Use standard uppercase alphanumeric format with underscores.
                </Text>
              </View>
            )}

            {/* Preview Box */}
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>SELECTED CLASS</Text>
              <Text style={styles.previewValue}>{previewClass}</Text>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.8}>
              <Ionicons name="checkmark-sharp" size={18} color={theme.colors.white} />
              <Text style={styles.applyBtnText}>Apply Class</Text>
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
    maxHeight: "85%",
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
  modeSwitch: {
    flexDirection: "row",
    backgroundColor: theme.colors.navy,
    borderRadius: theme.borderRadius.sm,
    padding: 4,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  modeTabActive: {
    backgroundColor: theme.colors.surface,
  },
  modeTabText: {
    fontSize: theme.typography.xs,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  modeTabTextActive: {
    color: theme.colors.primaryLight,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.textMuted,
    marginBottom: 8,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  chipFlex: {
    flex: 1,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryLight,
  },
  chipText: {
    fontSize: theme.typography.sm,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.white,
  },
  customContainer: {
    paddingVertical: 8,
  },
  customInput: {
    backgroundColor: theme.colors.navy,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: 14,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.md,
    fontWeight: "700",
  },
  hintText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    marginTop: 6,
  },
  previewBox: {
    backgroundColor: theme.colors.navy,
    borderRadius: theme.borderRadius.sm,
    padding: 14,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    alignItems: "center",
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.primaryLight,
    letterSpacing: 0.8,
  },
  previewValue: {
    fontSize: theme.typography.xl,
    fontWeight: "900",
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.navyBorder,
  },
  applyBtn: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...theme.shadows.md,
  },
  applyBtnText: {
    color: theme.colors.white,
    fontSize: theme.typography.md,
    fontWeight: "800",
  },
});
