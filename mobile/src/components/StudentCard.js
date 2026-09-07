import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../config/theme.js";

export const StudentCard = ({
  student,
  status, // "P" | "A" | undefined
  onToggleStatus,
  isLocked = false,
  isEditMode = false,
  onEditPress,
}) => {
  const isPresent = status === "P";
  const isAbsent = status === "A";

  const handleCallParent = () => {
    if (!student.parentPhone) return;
    const cleanPhone = student.parentPhone.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert("Error", `Cannot launch dialer for ${student.parentPhone}`);
    });
  };

  const handleSmsParent = () => {
    if (!student.parentPhone) return;
    const cleanPhone = student.parentPhone.replace(/[^0-9+]/g, "");
    const msg = `GKCE AMS Alert: Dear Parent, regarding student ${student.name} (${student.rollNo}).`;
    Linking.openURL(`sms:${cleanPhone}?body=${encodeURIComponent(msg)}`).catch(() => {
      Alert.alert("Error", `Cannot open SMS app for ${student.parentPhone}`);
    });
  };

  const handleWhatsappParent = () => {
    if (!student.parentPhone) return;
    const cleanPhone = student.parentPhone.replace(/[^0-9]/g, "");
    Linking.openURL(`https://wa.me/${cleanPhone}`).catch(() => {
      Alert.alert("Error", `Cannot open WhatsApp for ${student.parentPhone}`);
    });
  };

  return (
    <View
      style={[
        styles.card,
        isPresent && styles.cardPresent,
        isAbsent && styles.cardAbsent,
      ]}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.rollBadge,
            isPresent && styles.rollBadgePresent,
            isAbsent && styles.rollBadgeAbsent,
          ]}
        >
          <Text
            style={[
              styles.rollText,
              isPresent && styles.rollTextPresent,
              isAbsent && styles.rollTextAbsent,
            ]}
          >
            {student.rollNo}
          </Text>
        </View>

        <View style={styles.studentInfo}>
          <Text style={styles.studentName} numberOfLines={1}>
            {student.name}
          </Text>
          <View style={styles.metaRow}>
            {student.className ? (
              <View style={styles.classPill}>
                <Text style={styles.classPillText}>{student.className}</Text>
              </View>
            ) : null}

            {student.parentPhone ? (
              <TouchableOpacity onPress={handleCallParent} style={styles.phoneChip} activeOpacity={0.7}>
                <Ionicons name="call-outline" size={12} color={theme.colors.textSecondary} />
                <Text style={styles.phoneText}>{student.parentPhone}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        {isEditMode ? (
          <View style={styles.actionButtons}>
            {student.parentPhone ? (
              <>
                <TouchableOpacity
                  style={styles.iconActionBtn}
                  onPress={handleSmsParent}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="chatbox-outline" size={17} color="#60a5fa" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconActionBtn}
                  onPress={handleWhatsappParent}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="logo-whatsapp" size={18} color={theme.colors.present} />
                </TouchableOpacity>
              </>
            ) : null}
            <TouchableOpacity
              style={[styles.iconActionBtn, styles.editBtn]}
              onPress={() => onEditPress && onEditPress(student)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="create-outline" size={18} color={theme.colors.primaryLight} />
            </TouchableOpacity>
          </View>
        ) : isLocked ? (
          <View
            style={[
              styles.statusPill,
              isPresent ? styles.statusPillPresent : styles.statusPillAbsent,
            ]}
          >
            <Ionicons
              name={isPresent ? "checkmark-circle" : "close-circle"}
              size={14}
              color={isPresent ? theme.colors.present : theme.colors.absent}
            />
            <Text
              style={[
                styles.statusText,
                isPresent ? styles.statusTextPresent : styles.statusTextAbsent,
              ]}
            >
              {isPresent ? "PRESENT" : "ABSENT"}
            </Text>
          </View>
        ) : (
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                styles.toggleBtnPresent,
                isPresent && styles.toggleBtnPresentActive,
              ]}
              onPress={() => onToggleStatus && onToggleStatus(student._id, "P")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  styles.toggleBtnPresentText,
                  isPresent && styles.toggleBtnPresentTextActive,
                ]}
              >
                P
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                styles.toggleBtnAbsent,
                isAbsent && styles.toggleBtnAbsentActive,
              ]}
              onPress={() => onToggleStatus && onToggleStatus(student._id, "A")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  styles.toggleBtnAbsentText,
                  isAbsent && styles.toggleBtnAbsentTextActive,
                ]}
              >
                A
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    ...theme.shadows.sm,
  },
  cardPresent: {
    borderColor: "rgba(16, 185, 129, 0.3)",
    backgroundColor: "#10202e",
  },
  cardAbsent: {
    borderColor: "rgba(239, 68, 68, 0.35)",
    backgroundColor: "#261520",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
    gap: 12,
  },
  rollBadge: {
    minWidth: 42,
    height: 38,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rollBadgePresent: {
    backgroundColor: theme.colors.presentBg,
    borderColor: theme.colors.presentBorder,
  },
  rollBadgeAbsent: {
    backgroundColor: theme.colors.absentBg,
    borderColor: theme.colors.absentBorder,
  },
  rollText: {
    fontSize: theme.typography.sm,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  rollTextPresent: {
    color: theme.colors.present,
  },
  rollTextAbsent: {
    color: theme.colors.absent,
  },
  studentInfo: {
    flex: 1,
    gap: 4,
  },
  studentName: {
    fontSize: theme.typography.md,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  classPill: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  classPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  phoneChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  phoneText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  rightSection: {
    alignItems: "center",
    justifyContent: "center",
  },
  toggleGroup: {
    flexDirection: "row",
    backgroundColor: theme.colors.navy,
    borderRadius: theme.borderRadius.sm,
    padding: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  toggleBtn: {
    width: 38,
    height: 34,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBtnPresent: {
    backgroundColor: "transparent",
  },
  toggleBtnPresentActive: {
    backgroundColor: theme.colors.present,
  },
  toggleBtnAbsent: {
    backgroundColor: "transparent",
  },
  toggleBtnAbsentActive: {
    backgroundColor: theme.colors.absent,
  },
  toggleBtnText: {
    fontSize: theme.typography.md,
    fontWeight: "900",
  },
  toggleBtnPresentText: {
    color: theme.colors.textSecondary,
  },
  toggleBtnPresentTextActive: {
    color: theme.colors.white,
  },
  toggleBtnAbsentText: {
    color: theme.colors.textSecondary,
  },
  toggleBtnAbsentTextActive: {
    color: theme.colors.white,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    gap: 5,
  },
  statusPillPresent: {
    backgroundColor: theme.colors.presentBg,
  },
  statusPillAbsent: {
    backgroundColor: theme.colors.absentBg,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statusTextPresent: {
    color: theme.colors.present,
  },
  statusTextAbsent: {
    color: theme.colors.absent,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  editBtn: {
    backgroundColor: theme.colors.primaryGlow,
    borderColor: theme.colors.primaryLight,
  },
});
