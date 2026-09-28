import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import { useLanguage } from "../context/LanguageContext.js";
import { theme } from "../config/theme.js";

export const ContactCard = ({ contacts = {}, studentName = "Student" }) => {
  const { t, isTelugu, isTamil } = useLanguage();

  const teacher = contacts.faculty || {
    name: isTamil ? "வகுப்பு ஆசிரியர்" : isTelugu ? "క్లాస్ టీచర్" : "Class Teacher",
    email: "faculty@gkcesp.ac.in",
    phone: "+919848022338",
  };

  const hod = contacts.hod || {
    name: isTamil ? "துறைத் தலைவர் (HOD)" : isTelugu ? "డిపార్ట్‌మెంట్ హెడ్" : "Department HOD",
    email: "hod@gkcesp.ac.in",
    phone: "+919848033449",
    department: "Engineering",
  };

  const handleCall = (phoneNumber, personName) => {
    const number = phoneNumber || "+918623243126";
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert(
        isTamil ? "அழைக்க முடியவில்லை" : isTelugu ? "కాల్ చేయలేకపోయాము" : "Cannot make call",
        `Phone: ${number}`
      );
    });
  };

  const handleSms = (phoneNumber, personName) => {
    const number = phoneNumber || "+918623243126";

    // Trilingual SMS Message Template
    const smsText = isTamil
      ? `வணக்கம் ${personName} அவர்களே,\nஎன் பிள்ளை (${studentName}) வருகை நிலவரம் பற்றி அறிய தொடர்பு கொள்கிறேன்.\n- GKCE பெற்றோர்`
      : isTelugu
      ? `నమస్కారం ${personName} గారు,\nనా బిడ్డ (${studentName}) హాజరు గురించి వివరాలు తెలుసుకోవడానికి సంప్రదిస్తున్నాను.\n- GKCE తల్లిదండ్రులు`
      : `Dear ${personName},\nI am contacting you regarding the attendance of my ward ${studentName}.\n- GKCE Parent`;

    const body = encodeURIComponent(smsText);

    Linking.openURL(`sms:${number}?body=${body}`).catch(() => {
      Alert.alert(
        isTamil ? "குறுஞ்செய்தி திறக்கப்படவில்லை" : isTelugu ? "ఎస్ఎంఎస్ తెరవబడలేదు" : "Cannot open SMS",
        `Phone: ${number}`
      );
    });
  };

  const handleEmail = (emailAddress, personName) => {
    if (!emailAddress) {
      Alert.alert(
        isTamil ? "மின்னஞ்சல் கிடைக்கவில்லை" : isTelugu ? "ఈమెయిల్ అందుబాటులో లేదు" : "Email Unavailable",
        isTamil ? "கல்லூரி அலுவலகத்தை தொடர்பு கொள்ளவும்." : isTelugu ? "కాలేజీ ఆఫీస్‌ను సంప్రదించండి" : "Please contact college office."
      );
      return;
    }

    const subject = encodeURIComponent(`GKCE Parent Query: Attendance of ${studentName}`);

    // Trilingual Email Message Template
    const emailBody = isTamil
      ? `மதிப்பிற்குரிய ${personName} அவர்களுக்கு,\n\nஎன் பிள்ளை ${studentName} வருகை நிலவரம் குறித்து விளக்கம் பெற விரும்புகிறேன்.\n\nநன்றி,\nபெற்றோர்`
      : isTelugu
      ? `గౌరవనీయులైన ${personName} గారికి,\n\nనా బిడ్డ ${studentName} హాజరు గురించి వివరాలు తెలుసుకోవాలనుకుంటున్నాను.\n\nధన్యవాదాలు,\nతల్లిదండ్రులు`
      : `Dear ${personName},\n\nI am contacting you regarding the attendance records for my ward ${studentName}.\n\nThank you,\nParent`;

    const body = encodeURIComponent(emailBody);

    Linking.openURL(`mailto:${emailAddress}?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert("Email App", `Please write to: ${emailAddress}`);
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t("contactsTitle")}</Text>
        <Text style={styles.subtitle}>{t("contactsSubtitle")}</Text>
      </View>

      <View style={styles.contactsList}>
        {/* Class Teacher */}
        <View style={styles.contactItem}>
          <View style={styles.contactHeader}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{t("classTeacher")}</Text>
            </View>
            <Text style={styles.contactName}>{teacher.name}</Text>
            <Text style={styles.contactEmail}>{teacher.email || "faculty@gkcesp.ac.in"}</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.callBtn]}
              onPress={() => handleCall(teacher.phone, teacher.name)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionText}>{t("callTeacher")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.smsBtn]}
              onPress={() => handleSms(teacher.phone, teacher.name)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>{t("smsTeacher")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.emailBtn]}
              onPress={() => handleEmail(teacher.email, teacher.name)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>✉️</Text>
              <Text style={styles.actionText}>{t("emailTeacher")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Head of Department (HOD) */}
        <View style={styles.contactItem}>
          <View style={styles.contactHeader}>
            <View style={[styles.roleBadge, styles.hodRoleBadge]}>
              <Text style={styles.roleBadgeText}>
                {t("hod")} ({hod.department || "DEPT"})
              </Text>
            </View>
            <Text style={styles.contactName}>{hod.name}</Text>
            <Text style={styles.contactEmail}>{hod.email || "hod@gkcesp.ac.in"}</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.callBtn]}
              onPress={() => handleCall(hod.phone, hod.name)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionText}>{t("callTeacher")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.emailBtn]}
              onPress={() => handleEmail(hod.email, hod.name)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>✉️</Text>
              <Text style={styles.actionText}>{t("emailTeacher")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.xl,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    ...theme.shadows.md,
  },
  headerRow: {
    marginBottom: 14,
  },
  title: {
    fontSize: theme.typography.base,
    color: theme.colors.textPrimary,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  contactsList: {
    gap: 12,
  },
  contactItem: {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  contactHeader: {
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: theme.colors.primaryMuted,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.xs,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  hodRoleBadge: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    borderColor: "#A78BFA",
  },
  roleBadgeText: {
    color: theme.colors.primaryLight,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  contactName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.base,
    fontWeight: "800",
  },
  contactEmail: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    gap: 6,
  },
  callBtn: {
    backgroundColor: theme.colors.callGreen,
  },
  smsBtn: {
    backgroundColor: theme.colors.smsBlue,
  },
  emailBtn: {
    backgroundColor: theme.colors.emailPurple,
  },
  actionIcon: {
    fontSize: 14,
  },
  actionText: {
    color: theme.colors.white,
    fontSize: theme.typography.xs,
    fontWeight: "800",
  },
});
