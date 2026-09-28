import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useLanguage } from "../context/LanguageContext.js";
import { theme } from "../config/theme.js";

export const ChildSelector = ({
  wards = [],
  selectedWard = null,
  onSelectWard = () => {},
  parentPhone = "",
}) => {
  const { t, isTelugu } = useLanguage();

  if (!selectedWard) return null;

  return (
    <View style={styles.container}>
      {/* Multiple Children Switcher Tabs (If more than 1 student registered) */}
      {wards.length > 1 && (
        <View style={styles.switcherContainer}>
          <Text style={styles.switcherLabel}>
            {isTelugu ? "మీ పిల్లలను ఎంచుకోండి:" : "SELECT CHILD:"}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {wards.map((ward) => {
              const isSelected = selectedWard?.id === ward.id;
              return (
                <TouchableOpacity
                  key={ward.id}
                  style={[styles.tab, isSelected && styles.tabActive]}
                  onPress={() => onSelectWard(ward)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.tabAvatar,
                      isSelected && styles.tabAvatarActive,
                    ]}
                  >
                    <Text style={styles.tabAvatarText}>
                      {ward.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={[styles.tabText, isSelected && styles.tabTextActive]}
                    numberOfLines={1}
                  >
                    {ward.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Main Student Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {selectedWard.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.detailsColumn}>
          <View style={styles.nameRow}>
            <Text style={styles.studentName} numberOfLines={1}>
              {selectedWard.name}
            </Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>
                {isTelugu ? "✓ నమోదైన విద్యార్థి" : "✓ Enrolled"}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillLabel}>{t("rollNo")}:</Text>
              <Text style={styles.metaPillValue}>{selectedWard.rollNo}</Text>
            </View>

            <View style={styles.metaPill}>
              <Text style={styles.metaPillLabel}>{t("className")}:</Text>
              <Text style={styles.metaPillValue}>{selectedWard.className}</Text>
            </View>
          </View>

          {parentPhone ? (
            <Text style={styles.phoneText}>
              📱 {t("registeredPhone")}: <Text style={styles.phoneValue}>{parentPhone}</Text>
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  switcherContainer: {
    marginBottom: 10,
  },
  switcherLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  tabsRow: {
    flexDirection: "row",
    gap: 10,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.bgSurface,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    gap: 8,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryLight,
  },
  tabAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  tabAvatarActive: {
    backgroundColor: theme.colors.primaryDark,
  },
  tabAvatarText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "800",
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sm,
    fontWeight: "600",
  },
  tabTextActive: {
    color: theme.colors.white,
    fontWeight: "800",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.bgCard,
    padding: 16,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    gap: 14,
    ...theme.shadows.md,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.sm,
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 24,
    fontWeight: "900",
  },
  detailsColumn: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  studentName: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.md,
    fontWeight: "900",
  },
  verifiedBadge: {
    backgroundColor: theme.colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.successBorder,
  },
  verifiedText: {
    color: theme.colors.successText,
    fontSize: 10,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.bgSurface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  metaPillLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  metaPillValue: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "800",
  },
  phoneText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  phoneValue: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
});
