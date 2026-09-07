import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../config/theme.js";

export const Toast = ({ toast, onDismiss }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [toast]);

  const getIconAndBg = () => {
    switch (toast.type) {
      case "success":
        return {
          icon: "checkmark-circle",
          color: theme.colors.present,
          bg: "#064e3b",
          border: theme.colors.present,
        };
      case "error":
        return {
          icon: "alert-circle",
          color: theme.colors.absent,
          bg: "#7f1d1d",
          border: theme.colors.absent,
        };
      case "warning":
        return {
          icon: "warning",
          color: theme.colors.warning,
          bg: "#78350f",
          border: theme.colors.warning,
        };
      case "info":
      default:
        return {
          icon: "information-circle",
          color: theme.colors.primaryLight,
          bg: "#1e3a8a",
          border: theme.colors.primaryLight,
        };
    }
  };

  const styleConfig = getIconAndBg();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: styleConfig.bg,
          borderColor: styleConfig.border,
        },
      ]}
    >
      <Ionicons name={styleConfig.icon} size={22} color={styleConfig.color} style={styles.icon} />
      <Text style={styles.message} numberOfLines={3}>
        {toast.message}
      </Text>
      <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 36,
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    ...theme.shadows.lg,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sm,
    fontWeight: "600",
    lineHeight: 18,
  },
  dismissBtn: {
    marginLeft: 10,
    padding: 2,
  },
});
