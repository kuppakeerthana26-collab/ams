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
import { useLanguage } from "../context/LanguageContext.js";
import { useParentAuth } from "../context/ParentAuthContext.js";
import { parentApi } from "../services/parentApi.js";
import { getDeviceId, getSimulationMode, toggleSimulationMode } from "../services/deviceService.js";
import { LanguageToggle } from "../components/LanguageToggle.js";

export const ParentAuthScreen = () => {
  const { t, isTelugu } = useLanguage();
  const { login } = useParentAuth();

  const [username, setUsername] = useState("25F8A0521");
  const [phone, setPhone] = useState("+918019797340");
  const [password, setPassword] = useState("Parent@123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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

  const handleLogin = async () => {
    if (!phone || phone.trim().length < 10) {
      setErrorMessage(t("invalidPhone"));
      return;
    }

    if (!password || !password.trim()) {
      setErrorMessage(t("invalidPassword"));
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await login({
        username: username.trim(),
        phone: phone.trim(),
        password: password.trim(),
      });
    } catch (err) {
      if (err.errorCode === "DEVICE_MISMATCH") {
        setSecurityModalText(err.message);
        setShowSecurityModal(true);
      } else {
        setErrorMessage(
          err.message ||
          (isTelugu
            ? "లాగిన్ విఫలమైంది. దయచేసి వివరాలు సరిచూసుకోండి."
            : "Login failed. Please check your credentials.")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fillJailabdin = () => {
    setUsername("25F8A0521");
    setPhone("+918019797340");
    setPassword("Parent@123");
    setErrorMessage("");
  };

  const fillKeerthana = () => {
    setUsername("24F81A0532");
    setPhone("+917013996678");
    setPassword("Parent@123");
    setErrorMessage("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Bar with Language Selector */}
        <View style={styles.topBar}>
          <View style={styles.collegeBadge}>
            <Text style={styles.collegeBadgeText}>GKCE • SULLURPETA</Text>
          </View>
          <LanguageToggle />
        </View>

        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../assets/GKCE-LOGO.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appTitle}>{t("appName")}</Text>
          <Text style={styles.appSubtitle}>{t("appSubtitle")}</Text>
        </View>

        {/* Main Login Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>{t("loginTitle")}</Text>
          <Text style={styles.cardInstruction}>{t("loginSubtitle")}</Text>

          {/* 1. Username / Student Roll No */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{t("usernameLabel")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("usernamePlaceholder")}
              placeholderTextColor={theme.colors.textMuted}
              value={username}
              onChangeText={(val) => {
                setUsername(val);
                setErrorMessage("");
              }}
              autoCapitalize="characters"
            />
          </View>

          {/* 2. Registered Mobile Number */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{t("phoneLabel")}</Text>
            <View style={styles.phoneInputRow}>
              <View style={styles.countryCodeBox}>
                <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="9876500001"
                placeholderTextColor={theme.colors.textMuted}
                value={phone.replace(/^\+91/, "")}
                onChangeText={(val) => {
                  const clean = val.replace(/[^0-9]/g, "");
                  setPhone(clean ? `+91${clean}` : "");
                  setErrorMessage("");
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* 3. Password */}
          <View style={styles.inputWrapper}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.inputLabel}>{t("passwordLabel")}</Text>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Text style={styles.showHideText}>
                  {showPassword ? `🙈 ${t("hidePassword")}` : `👁️ ${t("showPassword")}`}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder={t("passwordPlaceholder")}
              placeholderTextColor={theme.colors.textMuted}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                setErrorMessage("");
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>

          {/* Default Password Hint */}
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              💡 <Text style={styles.boldText}>{t("defaultPasswordHint")}</Text>
            </Text>
          </View>

          {/* Error Message Container */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Login Action Button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={theme.colors.white} />
                <Text style={styles.primaryButtonText}>{t("loggingIn")}</Text>
              </View>
            ) : (
              <Text style={styles.primaryButtonText}>🚀 {t("loginBtn")}</Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Fill Helpers */}
          <View style={styles.demoButtonsRow}>
            <TouchableOpacity
              style={styles.demoFillButton}
              onPress={fillJailabdin}
              activeOpacity={0.7}
            >
              <Text style={styles.demoFillText}>⚡ SK Jailabdin (8019797340)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoFillButton}
              onPress={fillKeerthana}
              activeOpacity={0.7}
            >
              <Text style={styles.demoFillText}>⚡ K. Keerthana (7013996678)</Text>
            </TouchableOpacity>
          </View>

          {/* Security Notice Footer */}
          <View style={styles.securityFooter}>
            <Text style={styles.securityIcon}>🛡️</Text>
            <Text style={styles.securityText}>{t("securityNoticeDesc")}</Text>
          </View>
        </View>

        {/* Discreet Server Connection Bar */}
        <TouchableOpacity
          style={styles.serverSettingsRow}
          onPress={() => setShowServerModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.serverIcon}>🌐</Text>
          <Text style={styles.serverText} numberOfLines={1}>
            Server: {apiUrl}
          </Text>
          <Text style={styles.serverAction}>⚙️</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Server Endpoint Configuration Modal */}
      <Modal visible={showServerModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>SERVER CONNECTION SETTINGS</Text>
            <Text style={styles.modalSubtitle}>Configure API host endpoint</Text>

            <View style={styles.presetList}>
              <TouchableOpacity
                style={[
                  styles.presetItem,
                  apiUrl.includes("192.168.137.110") && styles.presetItemActive,
                ]}
                onPress={() => handleSaveServerUrl("http://192.168.137.110:3000")}
              >
                <Text style={styles.presetName}>📶 Local Wi-Fi (192.168.137.110:3000)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.presetItem,
                  apiUrl.includes("10.0.2.2") && styles.presetItemActive,
                ]}
                onPress={() => handleSaveServerUrl("http://10.0.2.2:3000")}
              >
                <Text style={styles.presetName}>💻 Android Emulator (10.0.2.2:3000)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.presetItem,
                  apiUrl.includes("loca.lt") && styles.presetItemActive,
                ]}
                onPress={() => handleSaveServerUrl("https://gkce-ams-parent.loca.lt")}
              >
                <Text style={styles.presetName}>🔒 HTTPS Tunnel (gkce-ams-parent.loca.lt)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Custom Server URL</Text>
              <TextInput
                style={styles.input}
                value={tempUrl}
                onChangeText={setTempUrl}
                placeholder="http://192.168.x.x:3000"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="none"
              />
            </View>

            {/* Anti-Bypass Testing Switch */}
            <TouchableOpacity
              style={[styles.simBtn, isSimMode && styles.simBtnActive]}
              onPress={handleToggleSim}
            >
              <Text style={styles.simBtnText}>
                {isSimMode
                  ? "⚠️ Spoofing Student Device (Active)"
                  : "🧪 Test Anti-Bypass (Simulate Student Device)"}
              </Text>
            </TouchableOpacity>

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
            <View style={styles.securityIconBox}>
              <Text style={styles.bigAlertIcon}>🚫</Text>
            </View>
            <Text style={styles.securityAlertTitle}>
              {t("unauthorizedDeviceTitle")}
            </Text>
            <Text style={styles.securityAlertSub}>
              {t("unauthorizedDeviceSubtitle")}
            </Text>

            <View style={styles.alertMessageBox}>
              <Text style={styles.alertMessageText}>
                {securityModalText ||
                  (isTelugu
                    ? "ఈ ఖాతా ఇప్పటికే తల్లిదండ్రుల నమోదైన ఫోన్‌కు లాక్ చేయబడింది."
                    : "This account is bound to your registered phone.")}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.alertDismissBtn}
              onPress={() => setShowSecurityModal(false)}
            >
              <Text style={styles.alertDismissBtnText}>
                {t("unauthorizedDeviceDismiss")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgDark,
  },
  scrollContainer: {
    padding: 20,
    justifyContent: "center",
    minHeight: "100%",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: Platform.OS === "ios" ? 20 : 10,
  },
  collegeBadge: {
    backgroundColor: theme.colors.bgSurface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  collegeBadgeText: {
    color: theme.colors.primaryLight,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
    ...theme.shadows.md,
  },
  logoImage: {
    width: 54,
    height: 54,
  },
  appTitle: {
    fontSize: theme.typography.xl,
    fontWeight: "900",
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  appSubtitle: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    ...theme.shadows.lg,
  },
  cardHeading: {
    fontSize: theme.typography.lg,
    fontWeight: "900",
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  cardInstruction: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 18,
  },
  boldText: {
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  inputWrapper: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  showHideText: {
    color: theme.colors.primaryLight,
    fontSize: 12,
    fontWeight: "700",
  },
  phoneInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  countryCodeBox: {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  countryCodeText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.base,
    fontWeight: "800",
  },
  phoneInput: {
    flex: 1,
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    color: theme.colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: theme.typography.base,
    fontWeight: "700",
  },
  input: {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    color: theme.colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: theme.typography.base,
  },
  hintBox: {
    backgroundColor: "rgba(37, 99, 235, 0.08)",
    padding: 10,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    marginBottom: 14,
  },
  hintText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    ...theme.shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.base,
    fontWeight: "900",
  },
  demoButtonsRow: {
    marginTop: 12,
    gap: 8,
    alignItems: "center",
  },
  demoFillButton: {
    paddingVertical: 4,
    alignItems: "center",
  },
  demoFillText: {
    color: theme.colors.primaryLight,
    fontSize: 11,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.dangerBg,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.dangerBorder,
    gap: 8,
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    flex: 1,
    color: theme.colors.dangerText,
    fontSize: theme.typography.xs,
    fontWeight: "700",
    lineHeight: 16,
  },
  securityFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderColor,
  },
  securityIcon: {
    fontSize: 16,
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 15,
  },
  serverSettingsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.bgCard,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.md,
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    gap: 8,
  },
  serverIcon: {
    fontSize: 14,
  },
  serverText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  serverAction: {
    fontSize: 14,
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
  modalSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginBottom: 14,
  },
  presetList: {
    gap: 8,
    marginBottom: 14,
  },
  presetItem: {
    backgroundColor: theme.colors.bgSurface,
    padding: 10,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  presetItemActive: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primaryLight,
  },
  presetName: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
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
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  modalCancelText: {
    color: theme.colors.textMuted,
    fontWeight: "700",
  },
  modalSaveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: theme.borderRadius.sm,
  },
  modalSaveText: {
    color: theme.colors.white,
    fontWeight: "800",
  },
  securityIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.dangerBg,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  bigAlertIcon: {
    fontSize: 30,
  },
  securityAlertTitle: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.md,
    fontWeight: "900",
    textAlign: "center",
  },
  securityAlertSub: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
    textTransform: "uppercase",
  },
  alertMessageBox: {
    backgroundColor: theme.colors.dangerBg,
    padding: 14,
    borderRadius: theme.borderRadius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.dangerBorder,
  },
  alertMessageText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.xs,
    lineHeight: 18,
    textAlign: "center",
  },
  alertDismissBtn: {
    backgroundColor: theme.colors.danger,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  alertDismissBtnText: {
    color: theme.colors.white,
    fontSize: theme.typography.sm,
    fontWeight: "800",
  },
});
