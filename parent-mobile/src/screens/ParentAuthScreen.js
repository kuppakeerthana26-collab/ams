import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Image,
} from "react-native";
import { theme } from "../config/theme.js";
import { useParentAuth } from "../context/ParentAuthContext.js";
import { parentApi } from "../services/parentApi.js";
import { getDeviceId, getSimulationMode, toggleSimulationMode } from "../services/deviceService.js";

export const ParentAuthScreen = () => {
  const { loginWithOtp } = useParentAuth();

  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [phone, setPhone] = useState("+919876543210");
  const [otp, setOtp] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [wardsPreview, setWardsPreview] = useState([]);
  const [boundModel, setBoundModel] = useState(null);
  const [deviceId, setDeviceId] = useState("");
  const [isSimMode, setIsSimMode] = useState(false);

  // Server Endpoint Configuration State
  const [apiUrl, setApiUrl] = useState("https://gkce-ams-parent.loca.lt");
  const [showServerModal, setShowServerModal] = useState(false);
  const [tempUrl, setTempUrl] = useState("https://gkce-ams-parent.loca.lt");

  // Security Mismatch Alert Modal State
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityModalText, setSecurityModalText] = useState("");

  useEffect(() => {
    loadDeviceStatus();
    loadServerUrl();
  }, []);

  const loadServerUrl = async () => {
    const url = await parentApi.getApiUrl();
    setApiUrl(url);
    setTempUrl(url);
  };

  const handleSaveServerUrl = async (newUrl) => {
    const target = newUrl !== undefined ? newUrl : tempUrl;
    const updated = await parentApi.setCustomApiUrl(target);
    setApiUrl(updated);
    setTempUrl(updated);
    setShowServerModal(false);
    setErrorMessage("");
  };

  const loadDeviceStatus = async () => {
    const id = await getDeviceId();
    setDeviceId(id);
    const sim = await getSimulationMode();
    setIsSimMode(sim);
  };

  const handleToggleSim = async () => {
    const next = !isSimMode;
    await toggleSimulationMode(next);
    setIsSimMode(next);
    await loadDeviceStatus();
  };

  const handleRequestOtp = async () => {
    if (!phone || phone.trim().length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await parentApi.requestOtp(phone.trim());
      if (response.success) {
        setWardsPreview(response.wardsPreview || []);
        setBoundModel(response.boundModel);
        if (response.otpDemo) {
          setOtp(response.otpDemo);
        }
        setStep(2);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to request OTP. Please verify your phone number with the college.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length !== 6) {
      setErrorMessage("Please enter the 6-digit OTP sent to your phone");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await loginWithOtp({ phone: phone.trim(), otp: otp.trim() });
    } catch (err) {
      if (err.errorCode === "DEVICE_MISMATCH") {
        setSecurityModalText(err.message);
        setShowSecurityModal(true);
      } else {
        setErrorMessage(err.message || "Invalid OTP code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.brandContainer}>
          <Image
            source={require("../../assets/GKCE-LOGO.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>GKCE PARENT AMS</Text>
          <Text style={styles.appSubtitle}>Student Attendance & Academic Monitoring Portal</Text>
        </View>

        {/* Auth Card */}
        <View style={styles.card}>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 ? styles.stepDotActive : null]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, step === 2 ? styles.stepDotActive : null]} />
          </View>

          {step === 1 ? (
            /* STEP 1: Phone Number */
            <View>
              <Text style={styles.cardHeading}>Parent Login</Text>
              <Text style={styles.cardInstruction}>
                Enter the mobile number registered with the college administration to receive an instant verification code.
              </Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Registered Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+919876543210"
                  placeholderTextColor={theme.colors.textMuted}
                  value={phone}
                  onChangeText={(val) => {
                    setPhone(val);
                    setErrorMessage("");
                  }}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.primaryButton, loading ? styles.buttonDisabled : null]}
                onPress={handleRequestOtp}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Get Verification Code →</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* STEP 2: OTP Verification */
            <View>
              <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
                <Text style={styles.backButtonText}>← Change Number ({phone})</Text>
              </TouchableOpacity>

              <Text style={styles.cardHeading}>Enter Verification Code</Text>
              <Text style={styles.cardInstruction}>
                We sent a 6-digit verification code to <Text style={styles.boldText}>{phone}</Text>.
              </Text>

              {wardsPreview.length > 0 ? (
                <View style={styles.wardPreviewBox}>
                  <Text style={styles.wardPreviewTitle}>REGISTERED STUDENT(S):</Text>
                  {wardsPreview.map((w, idx) => (
                    <Text key={idx} style={styles.wardPreviewItem}>
                      • <Text style={styles.boldText}>{w.name}</Text> ({w.className} - Roll #{w.rollNo})
                    </Text>
                  ))}
                </View>
              ) : null}

              {boundModel ? (
                <View style={styles.deviceNoticeBox}>
                  <Text style={styles.deviceNoticeText}>
                    🔒 Account locked to: <Text style={styles.boldText}>{boundModel}</Text>
                  </Text>
                </View>
              ) : null}

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>6-Digit OTP</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="123456"
                  placeholderTextColor={theme.colors.textMuted}
                  value={otp}
                  onChangeText={(val) => {
                    setOtp(val);
                    setErrorMessage("");
                  }}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.primaryButton, loading ? styles.buttonDisabled : null]}
                onPress={handleVerifyOtp}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify & Access Portal</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoFillButton}
                onPress={() => setOtp("123456")}
                activeOpacity={0.7}
              >
                <Text style={styles.demoFillText}>Quick Fill Demo OTP (123456)</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Security Notice Footer */}
          <View style={styles.securityFooter}>
            <Text style={styles.securityFooterIcon}>🛡️</Text>
            <Text style={styles.securityFooterText}>
              Hardware Device Protected: This portal binds to your smartphone hardware to prevent students from logging in with your credentials.
            </Text>
          </View>
        </View>

        {/* Server Endpoint Configuration Banner */}
        <TouchableOpacity
          style={styles.serverSettingsCard}
          onPress={() => setShowServerModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.serverSettingsRow}>
            <Text style={styles.serverSettingsIcon}>🌐</Text>
            <View style={styles.serverSettingsDetails}>
              <Text style={styles.serverSettingsTitle}>Backend Server Connection</Text>
              <Text style={styles.serverSettingsUrl} numberOfLines={1}>
                {apiUrl}
              </Text>
            </View>
            <Text style={styles.serverSettingsAction}>Change ⚙️</Text>
          </View>
        </TouchableOpacity>

        {/* Testing / Demonstration Tool */}
        <View style={styles.simTestingBox}>
          <Text style={styles.simTestingTitle}>Security Demonstration Tool</Text>
          <Text style={styles.simTestingDesc}>
            Current Device ID: <Text style={styles.monoText}>{deviceId.slice(0, 18)}...</Text>
          </Text>
          <TouchableOpacity
            style={[styles.simToggleButton, isSimMode ? styles.simToggleActive : null]}
            onPress={handleToggleSim}
          >
            <Text style={styles.simToggleText}>
              {isSimMode
                ? "⚠️ Spoofing Student Device (Active) - Tap to Normal"
                : "🧪 Simulate Student Device (Test Anti-Bypass)"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Server Endpoint Configuration Modal */}
      <Modal visible={showServerModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>SERVER CONNECTION</Text>
            <Text style={styles.modalSubtitle}>Configure College Backend Endpoint</Text>

            <Text style={styles.serverInstruction}>
              Select a connection preset or enter your computer's server URL:
            </Text>

            <View style={styles.presetList}>
              <TouchableOpacity
                style={[
                  styles.presetItem,
                  apiUrl.includes("loca.lt") ? styles.presetItemActive : null,
                ]}
                onPress={() => handleSaveServerUrl("https://gkce-ams-parent.loca.lt")}
              >
                <Text style={styles.presetName}>🔒 Secure Cloud Tunnel (Recommended)</Text>
                <Text style={styles.presetDesc}>https://gkce-ams-parent.loca.lt (Resolves cleartext policy)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.presetItem,
                  apiUrl.includes("10.0.2.2") ? styles.presetItemActive : null,
                ]}
                onPress={() => handleSaveServerUrl("http://10.0.2.2:3000")}
              >
                <Text style={styles.presetName}>💻 Android Emulator Host</Text>
                <Text style={styles.presetDesc}>http://10.0.2.2:3000 (Local emulator)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.presetItem,
                  apiUrl.includes("172.29.58.78") ? styles.presetItemActive : null,
                ]}
                onPress={() => handleSaveServerUrl("http://172.29.58.78:3000")}
              >
                <Text style={styles.presetName}>📶 Local Wi-Fi (LAN)</Text>
                <Text style={styles.presetDesc}>http://172.29.58.78:3000</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputWrapper, { width: "100%" }]}>
              <Text style={styles.inputLabel}>Custom Server URL</Text>
              <TextInput
                style={styles.input}
                value={tempUrl}
                onChangeText={setTempUrl}
                placeholder="https://your-server.com"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowServerModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={() => handleSaveServerUrl()}
              >
                <Text style={styles.modalSaveText}>Save & Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Hardware Device Mismatch Alert Modal */}
      <Modal visible={showSecurityModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <Text style={styles.modalIcon}>🚫</Text>
            </View>
            <Text style={styles.modalTitle}>UNAUTHORIZED DEVICE</Text>
            <Text style={styles.modalSubtitle}>Hardware Device Binding Violation</Text>

            <View style={styles.modalMessageCard}>
              <Text style={styles.modalMessageText}>{securityModalText}</Text>
            </View>

            <Text style={styles.modalExplanation}>
              GKCE Security Policy: To ensure complete academic transparency, parent accounts are permanently bound to the parent's verified phone. Students cannot access attendance records on unauthorized devices.
            </Text>

            <TouchableOpacity
              style={styles.modalDismissButton}
              onPress={() => setShowSecurityModal(false)}
            >
              <Text style={styles.modalDismissText}>Dismiss Alert</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: theme.colors.navy,
  },
  scrollContainer: {
    padding: 20,
    justifyContent: "center",
    minHeight: "100%",
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoImage: {
    width: 72,
    height: 72,
    marginBottom: 12,
  },
  appTitle: {
    fontSize: theme.typography.xl,
    fontWeight: "900",
    color: theme.colors.textPrimary,
    letterSpacing: 1.5,
  },
  appSubtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  card: {
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    ...theme.shadows.lg,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.navyBorder,
  },
  stepDotActive: {
    backgroundColor: theme.colors.primaryLight,
    width: 20,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: theme.colors.navyBorder,
    marginHorizontal: 8,
  },
  cardHeading: {
    fontSize: theme.typography.lg,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  cardInstruction: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 18,
  },
  boldText: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: theme.colors.navySurface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
    color: theme.colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: theme.typography.base,
  },
  otpInput: {
    textAlign: "center",
    fontSize: theme.typography.xxl,
    fontWeight: "800",
    letterSpacing: 8,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
    ...theme.shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.base,
    fontWeight: "700",
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: theme.colors.primaryLight,
    fontSize: theme.typography.sm,
    fontWeight: "600",
  },
  wardPreviewBox: {
    backgroundColor: theme.colors.navySurface,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  wardPreviewTitle: {
    fontSize: 10,
    color: theme.colors.primaryLight,
    fontWeight: "800",
    marginBottom: 4,
  },
  wardPreviewItem: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  deviceNoticeBox: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    padding: 8,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 14,
  },
  deviceNoticeText: {
    color: theme.colors.success,
    fontSize: theme.typography.xs,
    fontWeight: "600",
    textAlign: "center",
  },
  demoFillButton: {
    marginTop: 12,
    alignItems: "center",
  },
  demoFillText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.xs,
    textDecorationLine: "underline",
  },
  errorContainer: {
    backgroundColor: theme.colors.dangerBg,
    borderRadius: theme.borderRadius.sm,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.xs,
    fontWeight: "600",
  },
  securityFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.navyBorder,
  },
  securityFooterIcon: {
    fontSize: 16,
  },
  securityFooterText: {
    flex: 1,
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 15,
  },
  simTestingBox: {
    marginTop: 20,
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  simTestingTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.xs,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  simTestingDesc: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginVertical: 4,
  },
  monoText: {
    color: theme.colors.primaryLight,
    fontFamily: "monospace",
  },
  simToggleButton: {
    backgroundColor: "rgba(37, 99, 235, 0.2)",
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    marginTop: 6,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  simToggleActive: {
    backgroundColor: theme.colors.dangerBg,
    borderColor: theme.colors.danger,
  },
  simToggleText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.xs,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.danger,
    ...theme.shadows.lg,
  },
  modalIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.dangerBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalIcon: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: theme.typography.lg,
    fontWeight: "900",
    color: theme.colors.danger,
    letterSpacing: 1,
  },
  modalSubtitle: {
    fontSize: theme.typography.xs,
    fontWeight: "700",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  modalMessageCard: {
    backgroundColor: theme.colors.dangerBg,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  modalMessageText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sm,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "600",
  },
  modalExplanation: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.xs,
    lineHeight: 17,
    textAlign: "center",
    marginBottom: 20,
  },
  modalDismissButton: {
    backgroundColor: theme.colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.md,
    width: "100%",
    alignItems: "center",
  },
  modalDismissText: {
    color: theme.colors.white,
    fontSize: theme.typography.base,
    fontWeight: "700",
  },
  serverSettingsCard: {
    marginTop: 14,
    backgroundColor: theme.colors.navyCard,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  serverSettingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  serverSettingsIcon: {
    fontSize: 18,
  },
  serverSettingsDetails: {
    flex: 1,
  },
  serverSettingsTitle: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  serverSettingsUrl: {
    color: theme.colors.primaryLight,
    fontSize: theme.typography.xs,
    fontFamily: "monospace",
    fontWeight: "600",
    marginTop: 2,
  },
  serverSettingsAction: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.xs,
    fontWeight: "600",
  },
  serverInstruction: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.xs,
    marginBottom: 12,
    textAlign: "center",
  },
  presetList: {
    gap: 8,
    width: "100%",
    marginBottom: 16,
  },
  presetItem: {
    backgroundColor: theme.colors.navySurface,
    padding: 10,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  presetItemActive: {
    borderColor: theme.colors.primaryLight,
    backgroundColor: "rgba(37, 99, 235, 0.15)",
  },
  presetName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.xs,
    fontWeight: "700",
  },
  presetDesc: {
    color: theme.colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 10,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: theme.colors.navySurface,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.navyBorder,
  },
  modalCancelText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.xs,
    fontWeight: "700",
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
  },
  modalSaveText: {
    color: theme.colors.white,
    fontSize: theme.typography.xs,
    fontWeight: "700",
  },
});

