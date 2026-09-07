import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../config/theme.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { Header } from "../components/Header.js";
import { api } from "../services/api.js";

export const SettingsScreen = () => {
  const { user, role, serverUrl, updateServerUrl, logout, refreshUser } = useAuth();
  const { success, error, info } = useToast();

  const [customUrl, setCustomUrl] = useState(serverUrl || "http://10.0.2.2:3000");
  const [isTesting, setIsTesting] = useState(false);
  const [pingResult, setPingResult] = useState(null);

  const handleTestPing = async () => {
    setIsTesting(true);
    setPingResult(null);
    try {
      const res = await api.checkHealth(customUrl);
      if (res.success) {
        setPingResult({ ok: true, latency: res.latency });
        success(`Server responded in ${res.latency}ms`);
      } else {
        setPingResult({ ok: false, error: res.error });
        error(`Ping failed: ${res.error}`);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveUrl = async () => {
    try {
      await updateServerUrl(customUrl);
      success("Server endpoint updated successfully");
    } catch (err) {
      error("Failed to update server URL");
    }
  };

  const handleLogoutConfirm = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of GKCE AMS?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          info("Signed out successfully");
        },
      },
    ]);
  };

  const getRoleLabel = () => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "System Administrator";
      case "hod":
        return `Head of Department (${user?.department || "Dept"})`;
      default:
        return "Faculty Teacher";
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Settings & Profile" subtitle="Account and system configuration" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(user?.name || "U")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || "Faculty Member"}</Text>
            <Text style={styles.profileEmail}>{user?.email || "faculty@college.edu"}</Text>
            <View style={styles.roleChip}>
              <Ionicons name="shield-checkmark" size={12} color={theme.colors.primaryLight} />
              <Text style={styles.roleChipText}>{getRoleLabel()}</Text>
            </View>
          </View>
        </View>

        {/* Assigned Details Card */}
        {user?.assignedClass && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Assigned Class</Text>
            <Text style={styles.cardSubtitle}>Your default class for attendance recording</Text>
            <View style={styles.classDetailRow}>
              <View style={styles.classDetailBox}>
                <Text style={styles.classDetailVal}>{user.assignedClass.branch || "CSE"}</Text>
                <Text style={styles.classDetailLbl}>Branch</Text>
              </View>
              <View style={styles.classDetailBox}>
                <Text style={styles.classDetailVal}>Year {user.assignedClass.year || 1}</Text>
                <Text style={styles.classDetailLbl}>Year</Text>
              </View>
              <View style={styles.classDetailBox}>
                <Text style={styles.classDetailVal}>Section {user.assignedClass.section || "A"}</Text>
                <Text style={styles.classDetailLbl}>Section</Text>
              </View>
            </View>
          </View>
        )}

        {/* Server Endpoint Config Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>API Server Endpoint</Text>
          <Text style={styles.cardSubtitle}>
            Backend Express URL. For physical devices, enter your computer's LAN IP.
          </Text>

          <TextInput
            style={styles.input}
            value={customUrl}
            onChangeText={setCustomUrl}
            placeholder="http://10.0.2.2:3000"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Quick Presets */}
          <View style={styles.presetRow}>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => setCustomUrl("http://10.0.2.2:3000")}
            >
              <Text style={styles.presetText}>Android (10.0.2.2)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => setCustomUrl("http://localhost:3000")}
            >
              <Text style={styles.presetText}>Localhost</Text>
            </TouchableOpacity>
          </View>

          {pingResult && (
            <View
              style={[
                styles.pingBox,
                pingResult.ok ? styles.pingSuccess : styles.pingFail,
              ]}
            >
              <Ionicons
                name={pingResult.ok ? "checkmark-circle" : "close-circle"}
                size={16}
                color={pingResult.ok ? theme.colors.present : theme.colors.absent}
              />
              <Text
                style={[
                  styles.pingText,
                  { color: pingResult.ok ? theme.colors.present : theme.colors.absent },
                ]}
              >
                {pingResult.ok ? `Online • ${pingResult.latency}ms latency` : `Offline • ${pingResult.error}`}
              </Text>
            </View>
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleTestPing}
              disabled={isTesting}
            >
              {isTesting ? (
                <ActivityIndicator size="small" color={theme.colors.primaryLight} />
              ) : (
                <>
                  <Ionicons name="flash-outline" size={16} color={theme.colors.primaryLight} />
                  <Text style={styles.testBtnText}>Test Ping</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUrl}>
              <Ionicons name="save-outline" size={16} color={theme.colors.white} />
              <Text style={styles.saveBtnText}>Save URL</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* System & Features Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>System Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0 (Production Release)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>WhatsApp Engine</Text>
            <Text style={styles.infoValue}>Meta Cloud API (Official)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Attendance Storage</Text>
            <Text style={styles.infoValue}>Excel XLSX + MongoDB Audit</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogoutConfirm} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.absent} />
          <Text style={styles.logoutBtnText}>Sign Out from Account</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 60,
    gap: 16,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    gap: 16,
    ...theme.shadows.md,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.sm,
  },
  avatarText: {
    fontSize: theme.typography.xl,
    fontWeight: "900",
    color: theme.colors.white,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: theme.typography.lg,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  profileEmail: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 4,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.primaryLight,
  },
  card: {
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    ...theme.shadows.sm,
  },
  cardTitle: {
    fontSize: theme.typography.md,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  classDetailRow: {
    flexDirection: "row",
    gap: 10,
  },
  classDetailBox: {
    flex: 1,
    backgroundColor: theme.colors.navy,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  classDetailVal: {
    fontSize: theme.typography.md,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  classDetailLbl: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: "700",
    marginTop: 2,
  },
  input: {
    backgroundColor: theme.colors.navy,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sm,
    fontWeight: "600",
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  presetChip: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: "center",
  },
  presetText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: "700",
  },
  pingBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    gap: 8,
  },
  pingSuccess: {
    backgroundColor: theme.colors.presentBg,
  },
  pingFail: {
    backgroundColor: theme.colors.absentBg,
  },
  pingText: {
    fontSize: theme.typography.xs,
    fontWeight: "700",
    flex: 1,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  testBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  testBtnText: {
    color: theme.colors.primaryLight,
    fontSize: theme.typography.sm,
    fontWeight: "700",
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
    gap: 6,
  },
  saveBtnText: {
    color: theme.colors.white,
    fontSize: theme.typography.sm,
    fontWeight: "800",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.navyBorder,
  },
  infoLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.typography.xs,
    color: theme.colors.textPrimary,
    fontWeight: "700",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.absentBg,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.absentBorder,
    marginTop: 8,
  },
  logoutBtnText: {
    color: theme.colors.absent,
    fontSize: theme.typography.sm,
    fontWeight: "800",
  },
});
