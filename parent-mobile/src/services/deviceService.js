import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const STORAGE_KEY_HWID = "@gkce_parent_device_hwid";
const STORAGE_KEY_MODEL = "@gkce_parent_device_model";
const STORAGE_KEY_SIM_MODE = "@gkce_parent_sim_mode"; // "normal" | "student_attack"

/**
 * Generate a unique hardware signature
 */
const generateHardwareId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";
  for (let i = 0; i < 16; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const prefix = Platform.OS === "android" ? "HW_AND_" : "HW_IOS_";
  return `${prefix}${randomPart}`;
};

/**
 * Returns the permanent hardware device ID bound to this physical phone
 */
export const getDeviceId = async () => {
  try {
    // Check if simulation mode is active (for testing student attack vs legitimate parent)
    const simMode = await AsyncStorage.getItem(STORAGE_KEY_SIM_MODE);
    if (simMode === "student_attack") {
      return "DEV_STUDENT_UNAUTHORIZED_DEVICE_X99";
    }

    let deviceId = await AsyncStorage.getItem(STORAGE_KEY_HWID);
    if (!deviceId) {
      deviceId = generateHardwareId();
      await AsyncStorage.setItem(STORAGE_KEY_HWID, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error("[DeviceService] Error reading device ID:", error);
    return "HW_FALLBACK_DEFAULT";
  }
};

/**
 * Returns the device model name (e.g. "Parent Android Phone")
 */
export const getDeviceModel = async () => {
  try {
    const simMode = await AsyncStorage.getItem(STORAGE_KEY_SIM_MODE);
    if (simMode === "student_attack") {
      return "Student Device (Unauthorized)";
    }

    let model = await AsyncStorage.getItem(STORAGE_KEY_MODEL);
    if (!model) {
      model = `Parent Device (${Platform.OS === "android" ? "Android" : "iOS"})`;
      await AsyncStorage.setItem(STORAGE_KEY_MODEL, model);
    }
    return model;
  } catch {
    return "Parent Smartphone";
  }
};

/**
 * Testing Helper: Toggle simulated student bypass attack mode
 */
export const toggleSimulationMode = async (enableStudentAttack) => {
  if (enableStudentAttack) {
    await AsyncStorage.setItem(STORAGE_KEY_SIM_MODE, "student_attack");
  } else {
    await AsyncStorage.removeItem(STORAGE_KEY_SIM_MODE);
  }
};

export const getSimulationMode = async () => {
  const mode = await AsyncStorage.getItem(STORAGE_KEY_SIM_MODE);
  return mode === "student_attack";
};
