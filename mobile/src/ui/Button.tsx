// mobile/src/ui/Button.tsx
import React from "react";
import { TouchableOpacity, Text, ViewStyle, StyleSheet } from "react-native";
import { theme } from "../../src/theme";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  style?: ViewStyle;
  disabled?: boolean;
};

export function Button({ title, onPress, variant = "primary", style, disabled }: Props) {
  const isPrimary = variant === "primary";
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.outline,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={isPrimary ? styles.primaryText : styles.outlineText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow,
  },
  primary: {
    backgroundColor: theme.colors.accent,
  },
  outline: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  primaryText: {
    color: theme.colors.accentText,
    fontWeight: "700",
    fontSize: 16,
  },
  outlineText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});
