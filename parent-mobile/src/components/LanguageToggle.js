import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLanguage } from "../context/LanguageContext.js";
import { theme } from "../config/theme.js";

export const LanguageToggle = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* English */}
      <TouchableOpacity
        style={[
          styles.pillButton,
          language === "en" ? styles.pillActive : null,
          compact && styles.pillCompact,
        ]}
        onPress={() => setLanguage("en")}
        activeOpacity={0.8}
      >
        <Text style={[styles.pillText, language === "en" ? styles.pillTextActive : null]}>
          EN
        </Text>
      </TouchableOpacity>

      {/* Telugu */}
      <TouchableOpacity
        style={[
          styles.pillButton,
          language === "te" ? styles.pillActive : null,
          compact && styles.pillCompact,
        ]}
        onPress={() => setLanguage("te")}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.pillText,
            styles.scriptText,
            language === "te" ? styles.pillTextActive : null,
          ]}
        >
          తెలుగు
        </Text>
      </TouchableOpacity>

      {/* Tamil */}
      <TouchableOpacity
        style={[
          styles.pillButton,
          language === "ta" ? styles.pillActive : null,
          compact && styles.pillCompact,
        ]}
        onPress={() => setLanguage("ta")}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.pillText,
            styles.scriptText,
            language === "ta" ? styles.pillTextActive : null,
          ]}
        >
          தமிழ்
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.borderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    alignItems: "center",
  },
  containerCompact: {
    padding: 2,
  },
  pillButton: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  pillCompact: {
    paddingVertical: 4,
    paddingHorizontal: 7,
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  pillText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  scriptText: {
    fontSize: 11,
    fontWeight: "800",
  },
  pillTextActive: {
    color: theme.colors.white,
    fontWeight: "800",
  },
});
