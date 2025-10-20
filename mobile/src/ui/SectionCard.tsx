// mobile/src/ui/SectionCard.tsx
import React, { ReactNode } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { theme } from "../../src/theme";

type Props = {
  title?: string;
  children: ReactNode;
  style?: ViewStyle;
};

export function SectionCard({ title, children, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 14,
    ...theme.shadow,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
});
