// mobile/src/ui/LabeledInput.tsx
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import { theme } from "../../src/theme";

type Props = {
  label: string;
  value?: string;
  onChangeText?: (t: string) => void;
} & TextInputProps;

export function LabeledInput({ label, value, onChangeText, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          focused && { borderColor: theme.colors.accent, shadowOpacity: 0.08, shadowRadius: 8 },
        ]}
        placeholderTextColor={theme.colors.subtle}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: theme.colors.card,
  },
});
