import React from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import dayjs from "dayjs";
import { api } from "./src/lib/api"; // uses EXPO_PUBLIC_API_URL from mobile/.env

type FormValues = {
  sleepHours?: string;
  mood?: string;
  waterMl?: string;
  hotFlashCount?: string;
  nightSweats?: boolean;
  drynessLevel?: string;   // we'll convert to number
  glycineMg?: string;      // we'll convert to number
  magnesiumMg?: string;    // we'll convert to number
  collagen?: boolean;
  omega3?: boolean;
};

export default function App() {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      sleepHours: "",
      mood: "",
      waterMl: "",
      hotFlashCount: "",
      nightSweats: false,
      drynessLevel: "",
      glycineMg: "",
      magnesiumMg: "",
      collagen: false,
      omega3: false,
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
          nightSweats: values.nightSweats ?? undefined,
          drynessLevel: values.drynessLevel !== "" ? Number(values.drynessLevel) : undefined,
        },
        supplements: {
          glycineMg: values.glycineMg !== "" ? Number(values.glycineMg) : undefined,
          magnesiumMg: values.magnesiumMg !== "" ? Number(values.magnesiumMg) : undefined,
          collagen: values.collagen ?? undefined,
          omega3: values.omega3 ?? undefined,
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

          <Text style={styles.label}>Mood (1–5)</Text>
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

          <Text style={styles.label}>Night Sweats</Text>
          <Controller
            control={control}
            name="nightSweats"
            render={({ field: { onChange, value } }) => (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Switch value={!!value} onValueChange={onChange} />
                <Text>{value ? "Yes" : "No"}</Text>
              </View>
            )}
          />

          <Text style={styles.label}>Dryness Level (0–5)</Text>
          <Controller
            control={control}
            name="drynessLevel"
            render={({ field: { onChange, value } }) => (
              <TextInput
                keyboardType="number-pad"
                style={styles.input}
                placeholder="0 to 5"
                value={value}
                onChangeText={onChange}
                returnKeyType="done"
              />
            )}
          />

          <Text style={styles.subtitle}>Supplements</Text>

          <Text style={styles.label}>Glycine (mg)</Text>
          <Controller
            control={control}
            name="glycineMg"
            render={({ field: { onChange, value } }) => (
              <TextInput
                keyboardType="number-pad"
                style={styles.input}
                placeholder="e.g., 3000"
                value={value}
                onChangeText={onChange}
                returnKeyType="done"
              />
            )}
          />

          <Text style={styles.label}>Magnesium (mg)</Text>
          <Controller
            control={control}
            name="magnesiumMg"
            render={({ field: { onChange, value } }) => (
              <TextInput
                keyboardType="number-pad"
                style={styles.input}
                placeholder="e.g., 200"
                value={value}
                onChangeText={onChange}
                returnKeyType="done"
              />
            )}
          />

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
            <Text style={styles.label}>Collagen</Text>
            <Controller
              control={control}
              name="collagen"
              render={({ field: { onChange, value } }) => (
                <Switch value={!!value} onValueChange={onChange} />
              )}
            />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
            <Text style={styles.label}>Omega-3</Text>
            <Controller
              control={control}
              name="omega3"
              render={({ field: { onChange, value } }) => (
                <Switch value={!!value} onValueChange={onChange} />
              )}
            />
          </View>

          <Button title="Save Today" onPress={handleSubmit(onSubmit)} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, gap: 12 },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 18, fontWeight: "600", marginTop: 16, marginBottom: 4 },
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
