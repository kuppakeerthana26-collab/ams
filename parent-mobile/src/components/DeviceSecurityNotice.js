import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { useLanguage } from "../context/LanguageContext.js";
import { theme } from "../config/theme.js";
import { parentApi } from "../services/parentApi.js";
import { getDeviceId, getSimulationMode, toggleSimulationMode } from "../services/deviceService.js";

export const DeviceSecurityNotice = () => {
  const { t, isTelugu } = useLanguage();
  const [showDevModal, setShowDevModal] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const [tempUrl, setTempUrl] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [isSimMode, setIsSimMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const url = await parentApi.getApiUrl();
    setApiUrl(url);
    setTempUrl(url);
    const id = await getDeviceId();
    setDeviceId(id);
    const sim = await getSimulationMode();
    setIsSimMode(sim);
  };

  const handleSaveUrl = async (newUrl) => {
    const target = newUrl !== undefined ? newUrl : tempUrl;
    const updated = await parentApi.setCustomApiUrl(target);
    setApiUrl(updated);
    setTempUrl(updated);
    setShowDevModal(false);
  };

  const handleToggleSim = async () => {
    const next = !isSimMode;
    await toggleSimulationMode(next);
    setIsSimMode(next);
    await loadSettings();
  };

  return (
    <View style={styles.container}>
      {/* Friendly Parent Reassurance */}
      <View style={styles.badgeRow}>
        <Text style={styles.lockIcon}>🛡️</Text>
        <View style={styles.textColumn}>
          <Text style={styles.badgeTitle}>{t("securityNoticeTitle")}</Text>
          <Text style={styles.badgeDesc}>{t("securityNoticeDesc")}</Text>
        </View>

        {/* Discreet Settings Trigger */}
        <TouchableOpacity
          style={styles.devTrigger}
          onPress={() => setShowDevModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.devTriggerIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Developer / Endpoint Modal */}
      <Modal visible={showDevModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>SERVER & CONNECTION SETTINGS</Text>
            <Text style={styles.modalSub}>Configure API Endpoint / Test Anti-Bypass</Text>

            <View style={styles.presetGroup}>
              <TouchableOpacity
                style={[
                  styles.presetBtn,
                  apiUrl.includes("192.168.137.110") && styles.presetBtnActive,
                ]}
                onPress={() => handleSaveUrl("http://192.168.137.110:3000")}
              >
                <Text style={styles.presetBtnText}>📶 Local Wi-Fi (192.168.137.110:3000)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.presetBtn,
                  apiUrl.includes("10.0.2.2") && styles.presetBtnActive,
                ]}
                onPress={() => handleSaveUrl("http://10.0.2.2:3000")}
              >
                <Text style={styles.presetBtnText}>💻 Android Emulator Host (10.0.2.2:3000)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.presetBtn,
                  apiUrl.includes("loca.lt") && styles.presetBtnActive,
                ]}
                onPress={() => handleSaveUrl("https://gkce-ams-parent.loca.lt")}
              >
                <Text style={styles.presetBtnText}>🔒 Cloud HTTPS (gkce-ams-parent.loca.lt)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Custom URL:</Text>
              <TextInput
                style={styles.input}
                value={tempUrl}
                onChangeText={setTempUrl}
                placeholder="http://192.168.x.x:3000"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="none"
              />
            </View>

            {/* Anti-Bypass Sim Toggle */}
            <TouchableOpacity
              style={[styles.simBtn, isSimMode && styles.simBtnActive]}
              onPress={handleToggleSim}
            >
              <Text style={styles.simBtnText}>
                {isSimMode
                  ? "⚠️ Spoofing Student Device (Sim Active)"
                  : "🧪 Test Anti-Bypass: Simulate Student Device"}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowDevModal(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSave}
                onPress={() => handleSaveUrl()}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    gap: 10,
  },
  lockIcon: {
    fontSize: 20,
  },
  textColumn: {
    flex: 1,
  },
  badgeTitle: {
    color: theme.colors.successText,
    fontSize: theme.typography.xs,
    fontWeight: "800",
  },
  badgeDesc: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  devTrigger: {
    padding: 6,
    opacity: 0.6,
  },
  devTriggerIcon: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sm,
    fontWeight: "900",
  },
  modalSub: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginBottom: 14,
  },
  presetGroup: {
    gap: 8,
    marginBottom: 14,
  },
  presetBtn: {
    backgroundColor: theme.colors.bgSurface,
    padding: 10,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  presetBtnActive: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primaryLight,
  },
  presetBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  inputWrapper: {
    marginBottom: 14,
  },
  inputLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.bgSurface,
    color: theme.colors.textPrimary,
    padding: 10,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    fontSize: 13,
  },
  simBtn: {
    backgroundColor: theme.colors.bgSurface,
    padding: 10,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    marginBottom: 16,
  },
  simBtnActive: {
    backgroundColor: theme.colors.dangerBg,
    borderColor: theme.colors.danger,
  },
  simBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalCancel: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: theme.colors.textMuted,
    fontWeight: "700",
  },
  modalSave: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.sm,
  },
  modalSaveText: {
    color: theme.colors.white,
    fontWeight: "800",
  },
});
