// mobile/src/ui/Header.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../../src/theme";

type Props = {
  title: string;
  onLogout?: () => void; // if provided, shows a small logout button
};

export function Header({ title, onLogout }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={{ width: 64 }} />{/* spacer to balance center title */}
      <Text style={styles.title}>{title}</Text>
      {onLogout ? (
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 64 }} /> // keep layout balanced if no button
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.bg,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logoutText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    fontSize: 12,
  },
});
