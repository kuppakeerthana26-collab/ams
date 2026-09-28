import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import { useLanguage } from "../context/LanguageContext.js";
import { theme } from "../config/theme.js";

export const CollegeHelplineCard = () => {
  const { t, isTelugu } = useLanguage();

  const handleCallOffice = () => {
    Linking.openURL("tel:+918623243126").catch(() => {
      Alert.alert(
        isTelugu ? "కాల్ చేయలేకపోయాము" : "Call Failed",
        "Phone: +91 86232 43126"
      );
    });
  };

  const handleEmailOffice = () => {
    Linking.openURL("mailto:principal@gkcesp.ac.in").catch(() => {
      Alert.alert("Email", "Email: principal@gkcesp.ac.in");
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.contentRow}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🏛️</Text>
        </View>

        <View style={styles.detailsColumn}>
          <Text style={styles.collegeName}>{t("collegeName")}</Text>
          <Text style={styles.addressText}>
            {isTelugu
              ? "NVR నగర్, సుళ్ళూరుపేట, తిరుపతి జిల్లా, ఆం.ప్ర. 524121"
              : "NVR Nagar, Sullurpeta, Tirupati Dist, AP - 524121"}
          </Text>
          <Text style={styles.helplinePhone}>📞 +91 86232 43126 / 243127</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.callOfficeBtn}
          onPress={handleCallOffice}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>📞 {t("callCollege")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emailOfficeBtn}
          onPress={handleEmailOffice}
          activeOpacity={0.8}
        >
          <Text style={styles.btnTextSecondary}>✉️ {isTelugu ? "ఈమెయిల్" : "Email"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  contentRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 22,
  },
  detailsColumn: {
    flex: 1,
  },
  collegeName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sm,
    fontWeight: "800",
  },
  addressText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  helplinePhone: {
    color: theme.colors.primaryLight,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  callOfficeBtn: {
    flex: 1.2,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  emailOfficeBtn: {
    flex: 1,
    backgroundColor: theme.colors.bgElevated,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  btnText: {
    color: theme.colors.white,
    fontSize: theme.typography.xs,
    fontWeight: "800",
  },
  btnTextSecondary: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.xs,
    fontWeight: "700",
  },
});
