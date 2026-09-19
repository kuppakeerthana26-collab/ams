import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import { theme } from "../config/theme.js";

export const ContactCard = ({ contacts = {}, studentName = "Student" }) => {
  const teacher = contacts.faculty || { name: "Class Teacher", email: "faculty@college.edu" };
  const hod = contacts.hod || { name: "Department HOD", email: "hod@college.edu", department: "Department" };

  const handleEmailTeacher = () => {
    if (!teacher.email) {
      Alert.alert("Contact Unavailable", "Teacher email address is not configured yet.");
      return;
    }
    const subject = encodeURIComponent(`GKCE Attendance Inquiry regarding ${studentName}`);
    const body = encodeURIComponent(`Dear ${teacher.name},\n\nI am contacting you regarding the attendance of my ward ${studentName}.\n\nRegards,\nParent`);
    Linking.openURL(`mailto:${teacher.email}?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert("Email App Not Found", `Please email: ${teacher.email}`);
    });
  };

  const handleEmailHod = () => {
    if (!hod.email) {
      Alert.alert("Contact Unavailable", "HOD email address is not configured yet.");
      return;
    }
    const subject = encodeURIComponent(`GKCE Attendance Escalation - ${studentName}`);
    const body = encodeURIComponent(`Respected HOD (${hod.department || ""}),\n\nI am writing regarding attendance for my ward ${studentName}.\n\nRegards,\nParent`);
    Linking.openURL(`mailto:${hod.email}?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert("Email App Not Found", `Please email: ${hod.email}`);
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Academic Contacts</Text>
      <Text style={styles.sectionDesc}>Connect directly with your ward's mentors regarding attendance:</Text>

      <View style={styles.contactsGrid}>
        {/* Class Teacher Contact */}
        <View style={styles.contactItem}>
          <View style={styles.contactInfo}>
            <Text style={styles.roleLabel}>CLASS TEACHER</Text>
            <Text style={styles.contactName} numberOfLines={1}>
              {teacher.name}
            </Text>
            <Text style={styles.contactEmail} numberOfLines={1}>
              {teacher.email || "Contact via portal"}
            </Text>
          </View>
          <TouchableOpacity style={styles.contactButton} onPress={handleEmailTeacher} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Email</Text>
          </TouchableOpacity>
        </View>

        {/* HOD Contact */}
        <View style={styles.contactItem}>
          <View style={styles.contactInfo}>
            <Text style={styles.roleLabel}>HEAD OF DEPARTMENT ({hod.department || "DEPT"})</Text>
            <Text style={styles.contactName} numberOfLines={1}>
              {hod.name}
            </Text>
            <Text style={styles.contactEmail} numberOfLines={1}>
              {hod.email || "Contact via HOD office"}
            </Text>
          </View>
          <TouchableOpacity style={[styles.contactButton, styles.hodButton]} onPress={handleEmailHod} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Email HOD</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
    marginBottom: 14,
  },
  contactsGrid: {
    gap: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.navySurface,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  contactInfo: {
    flex: 1,
    marginRight: 10,
  },
  roleLabel: {
    fontSize: 10,
    color: theme.colors.primaryLight,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  contactName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sm,
    fontWeight: "700",
  },
  contactEmail: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.xs,
    marginTop: 2,
  },
  contactButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
  },
  hodButton: {
    backgroundColor: theme.colors.navyBorder,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.typography.xs,
    fontWeight: "700",
  },
});
