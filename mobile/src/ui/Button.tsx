// mobile/src/ui/Button.tsx
import React from "react";
import { TouchableOpacity, Text, ViewStyle, StyleSheet, TextStyle } from "react-native";
import { theme } from "../../src/theme";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  style?: ViewStyle;
  disabled?: boolean;

  // NEW
  size?: "sm" | "md";
  textStyle?: TextStyle;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  style,
  disabled,
  size = "md",            // NEW (default same as before)
  textStyle,              // NEW
}: Props) {
  const isPrimary = variant === "primary";
  const fontSize = size === "sm" ? 13 : 16;            // NEW
  const padY = size === "sm" ? 8 : 12;                 // NEW
  const padX = size === "sm" ? 10 : 16;                // NEW

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        { paddingVertical: padY, paddingHorizontal: padX },  // NEW
        isPrimary ? styles.primary : styles.outline,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        numberOfLines={1}                                 // prevent wrapping
        style={[
          isPrimary ? styles.primaryText : styles.outlineText,
          { fontSize },                                   // NEW
          textStyle,                                      // NEW (optional override)
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
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
