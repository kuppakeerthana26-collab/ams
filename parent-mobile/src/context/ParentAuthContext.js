import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parentApi } from "../services/parentApi.js";
import { getDeviceId, getDeviceModel } from "../services/deviceService.js";

const ParentAuthContext = createContext(null);

const STORAGE_KEYS = {
  TOKEN: "@gkce_parent_token",
  PROFILE: "@gkce_parent_profile",
  WARDS: "@gkce_parent_wards",
  SELECTED_WARD_ID: "@gkce_parent_selected_ward_id",
};

export const ParentAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [parentToken, setParentToken] = useState(null);
  const [parentProfile, setParentProfile] = useState(null);
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [deviceId, setDeviceId] = useState("");

  // Initialize hardware device ID and saved session on startup
  useEffect(() => {
    const initialize = async () => {
      try {
        const hwId = await getDeviceId();
        setDeviceId(hwId);

        const savedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        const savedProfile = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
        const savedWards = await AsyncStorage.getItem(STORAGE_KEYS.WARDS);
        const savedWardId = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_WARD_ID);

        if (savedToken && savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          const parsedWards = savedWards ? JSON.parse(savedWards) : [];

          setParentToken(savedToken);
          setParentProfile(parsedProfile);
          setWards(parsedWards);

          const active = parsedWards.find((w) => w.id === savedWardId) || parsedWards[0] || null;
          setSelectedWard(active);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("[ParentAuth] Session restoration failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const loginWithOtp = async ({ phone, otp }) => {
    const hwId = await getDeviceId();
    const model = await getDeviceModel();

    const response = await parentApi.verifyOtpAndBind({
      phone,
      otp,
      deviceId: hwId,
      deviceModel: model,
    });

    if (response.success && response.token) {
      setParentToken(response.token);
      setParentProfile(response.parent);
      setWards(response.wards || []);
      setDeviceId(hwId);

      const firstWard = (response.wards && response.wards[0]) || null;
      setSelectedWard(firstWard);
      setIsAuthenticated(true);

      // Persist to storage
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(response.parent));
      await AsyncStorage.setItem(STORAGE_KEYS.WARDS, JSON.stringify(response.wards || []));
      if (firstWard) {
        await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_WARD_ID, firstWard.id);
      }

      return response;
    }

    throw new Error(response.message || "Login failed");
  };

  const selectWard = async (ward) => {
    setSelectedWard(ward);
    if (ward?.id) {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_WARD_ID, ward.id);
    }
  };

  const refreshWards = async () => {
    if (!parentToken) return;
    try {
      const hwId = await getDeviceId();
      const response = await parentApi.getWards(parentToken, hwId);
      if (response.success && response.wards) {
        setWards(response.wards);
        await AsyncStorage.setItem(STORAGE_KEYS.WARDS, JSON.stringify(response.wards));
        // Keep selected ward valid
        if (selectedWard) {
          const updated = response.wards.find((w) => w.id === selectedWard.id);
          if (updated) setSelectedWard(updated);
        }
      }
    } catch (err) {
      console.error("[ParentAuth] Refresh wards error:", err);
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setParentToken(null);
    setParentProfile(null);
    setWards([]);
    setSelectedWard(null);

    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.PROFILE,
      STORAGE_KEYS.WARDS,
      STORAGE_KEYS.SELECTED_WARD_ID,
    ]);
  };

  return (
    <ParentAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        parentToken,
        parentProfile,
        wards,
        selectedWard,
        deviceId,
        selectWard,
        loginWithOtp,
        refreshWards,
        logout,
      }}
    >
      {children}
    </ParentAuthContext.Provider>
  );
};

export const useParentAuth = () => {
  const context = useContext(ParentAuthContext);
  if (!context) {
    throw new Error("useParentAuth must be used within a ParentAuthProvider");
  }
  return context;
};
