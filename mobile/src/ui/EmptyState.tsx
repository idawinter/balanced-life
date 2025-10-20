// mobile/src/ui/EmptyState.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SectionCard } from "./SectionCard";
import { theme } from "../../src/theme";

type Props = {
  title?: string;
  message?: string;
};

export function EmptyState({
  title = "No entries yet",
  message = "Your last 14 days will appear here once you save a few daily logs.",
}: Props) {
  return (
    <SectionCard>
      <View style={styles.wrap}>
        <View style={styles.emojiBubble}>
          <Text style={styles.emoji}>🌱</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.msg}>{message}</Text>
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 8 },
  emojiBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow,
  },
  emoji: { fontSize: 28 },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  msg: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
