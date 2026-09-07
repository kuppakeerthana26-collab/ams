import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../config/theme.js";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { api } from "../services/api.js";

const COLLEGE_LOGO = require("../assets/GKCE-LOGO.webp");

export const AuthScreen = () => {
  const { login, serverUrl, updateServerUrl, isLoading } = useAuth();
  const { success, error, info } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Server URL settings modal
  const [showServerModal, setShowServerModal] = useState(false);
  const [customUrl, setCustomUrl] = useState(serverUrl || "http://10.0.2.2:3000");
  const [isTestingUrl, setIsTestingUrl] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      error("Please enter your email and password");
      return;
    }

    try {
      const res = await login(email.trim(), password);
      if (res && res.success) {
        success(`Welcome back, ${res.user.name}!`);
      }
    } catch (err) {
      error(err.message || "Failed to log in");
    }
  };

  const handleQuickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    info("Credentials filled. Press Login to proceed.");
  };

  const handleTestConnection = async () => {
    setIsTestingUrl(true);
    setTestResult(null);
    try {
      const res = await api.checkHealth(customUrl);
      if (res.success) {
        setTestResult({ ok: true, latency: res.latency });
        success(`Connected to server (${res.latency}ms)`);
      } else {
        setTestResult({ ok: false, error: res.error || "Connection failed" });
        error("Cannot reach server at this URL");
      }
    } finally {
      setIsTestingUrl(false);
    }
  };

  const handleSaveServerUrl = async () => {
    await updateServerUrl(customUrl);
    setShowServerModal(false);
    success("Server URL updated");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Top Branding */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <Image source={COLLEGE_LOGO} style={styles.authLogoImage} resizeMode="contain" />
          </View>
          <Text style={styles.appName}>GKCE AMS</Text>
          <Text style={styles.appTagline}>
            Gokula Krishna College of Engineering — Attendance Monitoring System
          </Text>
        </View>

        {/* Auth Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Faculty & Staff Sign In</Text>
          <Text style={styles.cardSubtitle}>
            Access class attendance registers and student records
          </Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="teacher@college.edu"
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color={theme.colors.white} />
                <Text style={styles.loginBtnText}>Sign In to GKCE AMS</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Quick Demo Credentials */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>QUICK FILL CREDENTIALS</Text>
            <View style={styles.demoRow}>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => handleQuickFill("admin@college.edu", "AdminPass123!")}
              >
                <Text style={styles.demoChipText}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => handleQuickFill("cse.teacher1@college.edu", "TeacherPass123!")}
              >
                <Text style={styles.demoChipText}>CSE Teacher</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => handleQuickFill("hod.cse@college.edu", "HodPass123!")}
              >
                <Text style={styles.demoChipText}>HOD</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Server Endpoint Bar */}
        <TouchableOpacity
          style={styles.serverBar}
          onPress={() => {
            setCustomUrl(serverUrl || "http://10.0.2.2:3000");
            setShowServerModal(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="server-outline" size={16} color={theme.colors.primaryLight} />
          <Text style={styles.serverText} numberOfLines={1}>
            API: {serverUrl || "http://10.0.2.2:3000"}
          </Text>
          <Ionicons name="settings-outline" size={14} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Server Config Modal */}
      <Modal visible={showServerModal} transparent animationType="slide" onRequestClose={() => setShowServerModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Backend Server URL</Text>
              <TouchableOpacity onPress={() => setShowServerModal(false)}>
                <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalHint}>
                Specify your Node.js API address. Use your local Wi-Fi IP (e.g. http://192.168.1.5:3000) when testing on physical mobile devices.
              </Text>

              <TextInput
                style={styles.serverInput}
                placeholder="http://10.0.2.2:3000"
                placeholderTextColor={theme.colors.textMuted}
                value={customUrl}
                onChangeText={setCustomUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* Quick Presets */}
              <View style={styles.presetRow}>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => setCustomUrl("http://10.0.2.2:3000")}
                >
                  <Text style={styles.presetChipText}>Android Emulator</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => setCustomUrl("http://localhost:3000")}
                >
                  <Text style={styles.presetChipText}>Localhost:3000</Text>
                </TouchableOpacity>
              </View>

              {/* Test Result Indicator */}
              {testResult && (
                <View
                  style={[
                    styles.testResultBox,
                    testResult.ok ? styles.testResultSuccess : styles.testResultFail,
                  ]}
                >
                  <Ionicons
                    name={testResult.ok ? "checkmark-circle" : "close-circle"}
                    size={18}
                    color={testResult.ok ? theme.colors.present : theme.colors.absent}
                  />
                  <Text
                    style={[
                      styles.testResultText,
                      { color: testResult.ok ? theme.colors.present : theme.colors.absent },
                    ]}
                  >
                    {testResult.ok
                      ? `Server Reachable (${testResult.latency}ms)`
                      : `Error: ${testResult.error}`}
                  </Text>
                </View>
              )}

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.testBtn}
                  onPress={handleTestConnection}
                  disabled={isTestingUrl}
                >
                  {isTestingUrl ? (
                    <ActivityIndicator size="small" color={theme.colors.primaryLight} />
                  ) : (
                    <>
                      <Ionicons name="flash-outline" size={16} color={theme.colors.primaryLight} />
                      <Text style={styles.testBtnText}>Test Ping</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveServerBtn} onPress={handleSaveServerUrl}>
                  <Text style={styles.saveServerBtnText}>Save URL</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    padding: 6,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden",
    ...theme.shadows.md,
  },
  authLogoImage: {
    width: "100%",
    height: "100%",
  },
  appName: {
    fontSize: theme.typography.xxl,
    fontWeight: "900",
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 280,
    lineHeight: 18,
  },
  card: {
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    ...theme.shadows.lg,
  },
  cardTitle: {
    fontSize: theme.typography.lg,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.textMuted,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.navy,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.md,
    fontWeight: "600",
  },
  eyeBtn: {
    padding: 6,
  },
  loginBtn: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 8,
    ...theme.shadows.md,
  },
  loginBtnText: {
    color: theme.colors.white,
    fontSize: theme.typography.md,
    fontWeight: "800",
  },
  btnDisabled: {
    opacity: 0.7,
  },
  demoSection: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: theme.colors.navyBorder,
  },
  demoTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  demoRow: {
    flexDirection: "row",
    gap: 8,
  },
  demoChip: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.xs,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  demoChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  serverBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.navyCard,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.sm,
    marginTop: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  serverText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    maxWidth: 240,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.lg,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: theme.typography.lg,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  modalBody: {
    gap: 12,
  },
  modalHint: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  serverInput: {
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
  },
  presetChip: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  presetChipText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: "700",
  },
  testResultBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 6,
    gap: 8,
  },
  testResultSuccess: {
    backgroundColor: theme.colors.presentBg,
  },
  testResultFail: {
    backgroundColor: theme.colors.absentBg,
  },
  testResultText: {
    fontSize: theme.typography.xs,
    fontWeight: "700",
    flex: 1,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
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
    fontWeight: "700",
    fontSize: theme.typography.sm,
  },
  saveServerBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  saveServerBtnText: {
    color: theme.colors.white,
    fontWeight: "800",
    fontSize: theme.typography.sm,
  },
});
