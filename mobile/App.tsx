import React from "react";
import {
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ recommended SafeAreaView
import { useForm, Controller } from "react-hook-form";
import dayjs from "dayjs";
import { api } from "./src/lib/api"; // reads EXPO_PUBLIC_API_URL from mobile/.env

type FormValues = {
  sleepHours?: string;
  mood?: string;
  waterMl?: string;
  hotFlashCount?: string;
};

export default function App() {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      sleepHours: "",
      mood: "",
      waterMl: "",
      hotFlashCount: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const date = dayjs().format("YYYY-MM-DD");
      const payload = {
        metrics: {
          sleepHours: values.sleepHours ? Number(values.sleepHours) : undefined,
          mood: values.mood ? Number(values.mood) : undefined,
          waterMl: values.waterMl ? Number(values.waterMl) : undefined,
        },
        menopause: {
          hotFlashCount: values.hotFlashCount ? Number(values.hotFlashCount) : undefined,
        },
      };

      const res = await api.post(`/daily/${date}`, payload);
      if (res.data?.ok) {
        Alert.alert("Saved!", "Your entry was saved.");
        reset();
      } else {
        Alert.alert("Error", "Server did not return ok.");
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err?.message ?? "Something went wrong");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Balanced Life — Today</Text>

          <Text style={styles.label}>Sleep Hours</Text>
          <Controller
            control={control}
            name="sleepHours"
            render={({ field: { onChange, value } }) => (
              <TextInput
                keyboardType="decimal-pad"
                style={styles.input}
                placeholder="e.g., 7.5"
                value={value}
                onChangeText={onChange}
                returnKeyType="done"
              />
            )}
          />

          <Text style={styles.label}>Mood (1-5)</Text>
          <Controller
            control={control}
            name="mood"
            render={({ field: { onChange, value } }) => (
              <TextInput
                keyboardType="number-pad"
                style={styles.input}
                placeholder="1 to 5"
                value={value}
                onChangeText={onChange}
                returnKeyType="done"
              />
            )}
          />

          <Text style={styles.label}>Water (ml)</Text>
          <Controller
            control={control}
            name="waterMl"
            render={({ field: { onChange, value } }) => (
              <TextInput
                keyboardType="number-pad"
                style={styles.input}
                placeholder="e.g., 1800"
                value={value}
                onChangeText={onChange}
                returnKeyType="done"
              />
            )}
          />

          <Text style={styles.label}>Hot Flashes (count)</Text>
          <Controller
            control={control}
            name="hotFlashCount"
            render={({ field: { onChange, value } }) => (
              <TextInput
                keyboardType="number-pad"
                style={styles.input}
                placeholder="e.g., 2"
                value={value}
                onChangeText={onChange}
                returnKeyType="done"
              />
            )}
          />

          <Button title="Save Today" onPress={handleSubmit(onSubmit)} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, gap: 12 },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 8, textAlign: "center" },
  label: { fontSize: 16, fontWeight: "500", marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
});
