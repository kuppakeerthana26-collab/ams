import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { theme } from "../config/theme.js";
import { getDeviceId, getSimulationMode, toggleSimulationMode } from "../services/deviceService.js";

export const DeviceLockBanner = ({ onSimulateToggle }) => {
  const [deviceId, setDeviceId] = useState("Loading...");
  const [isAttackMode, setIsAttackMode] = useState(false);

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    const id = await getDeviceId();
    setDeviceId(id);
    const sim = await getSimulationMode();
    setIsAttackMode(sim);
  };

  const handleToggleSim = async () => {
    const nextMode = !isAttackMode;
    await toggleSimulationMode(nextMode);
    setIsAttackMode(nextMode);
    await loadInfo();

    if (nextMode) {
      Alert.alert(
        "Student Attack Mode Active",
        "Your device ID has been spoofed to 'DEV_STUDENT_UNAUTHORIZED_DEVICE_X99'. If you log out and attempt login, the backend will reject with 403 Device Mismatch!",
        [{ text: "Understood" }]
      );
    } else {
      Alert.alert("Normal Mode Restored", "Your legitimate Parent Hardware ID has been restored.");
    }

    if (onSimulateToggle) onSimulateToggle(nextMode);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.iconBadge}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Hardware Device Binding Active</Text>
          <Text style={styles.subtitle}>
            Bound HWID: <Text style={styles.hwidText}>{deviceId.slice(0, 16)}...</Text>
          </Text>
        </View>
      </View>

      <Text style={styles.infoText}>
        Student accounts cannot access this parent portal. Only this verified physical smartphone is authorized.
      </Text>

      <TouchableOpacity
        style={[styles.simButton, isAttackMode ? styles.simButtonActive : null]}
        onPress={handleToggleSim}
        activeOpacity={0.8}
      >
        <Text style={styles.simButtonText}>
          {isAttackMode ? "⚠️ Simulating Student Device (Active) - Click to Reset" : "🧪 Test Security: Simulate Student Device"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.navySurface,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  lockIcon: {
    fontSize: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sm,
    fontWeight: "700",
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.xs,
  },
  hwidText: {
    color: theme.colors.primaryLight,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.xs,
    lineHeight: 16,
    marginBottom: 10,
  },
  simButton: {
    backgroundColor: "rgba(37, 99, 235, 0.15)",
    borderColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  simButtonActive: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderColor: theme.colors.danger,
  },
  simButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.xs,
    fontWeight: "700",
  },
});
