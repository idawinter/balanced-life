import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
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
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { saveUserId, getUserId, clearUserId } from "./src/lib/session";
import { theme } from "./src/theme";
import { Button as FancyButton } from "./src/ui/Button";
import { LabeledInput } from "./src/ui/LabeledInput";
import { SectionCard } from "./src/ui/SectionCard";
import { Header } from "./src/ui/Header";
import { EmptyState } from "./src/ui/EmptyState";
import { LoginHero } from "./src/ui/LoginHero";
import { ActivityIndicator } from "react-native";
import { Linking } from "react-native";

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
  const { control, handleSubmit, reset, setValue } = useForm<FormValues>({
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

  const [view, setView] = useState<"today" | "history" | "paste">("today");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const [chartMetric, setChartMetric] = useState<"sleep" | "mood">("sleep");

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [saving, setSaving] = useState(false);

  const [quickText, setQuickText] = useState<string>("");

  const apiBase = process.env.EXPO_PUBLIC_API_URL ?? "(unknown)";

  const screenWidth = Dimensions.get("window").width - 40; // padding margins
  const points = [...history].reverse(); // oldest -> newest for left-to-right chart
  const labels = points.map((it) => dayjs(it.date).format("MM/DD"));
  const sleepData = points.map((it) => it?.metrics?.sleepHours ?? 0);
  const moodData = points.map((it) => it?.metrics?.mood ?? 0);
  const series = chartMetric === "sleep" ? sleepData : moodData; // (we'll use this next)

  useEffect(() => {
    (async () => {
      const id = await getUserId();
      setUserId(id);
      setAuthLoading(false);
    })();
  }, []);  

  useEffect(() => {
    if (view !== "history") return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const to = dayjs().format("YYYY-MM-DD");
        const from = dayjs().subtract(13, "day").format("YYYY-MM-DD"); // last 14 days

        const res = await api.get(`/daily?from=${from}&to=${to}`);
        if (res.data?.ok && Array.isArray(res.data.data)) {
          const sorted = [...res.data.data].sort((a, b) =>
            a.date < b.date ? 1 : a.date > b.date ? -1 : 0
          );
          setHistory(sorted);
        } else {
          setError("Server did not return a valid list.");
        }
        
      } catch (e: any) {
        setError(e?.message ?? "Failed to fetch history.");
      } finally {
        setLoading(false);
        setSaving(false);
      }
    };

    fetchHistory();
  }, [view]);

  const onSubmit = async (values: FormValues) => {
    try {
      setSaving(true);
  
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
        setLastSavedAt(dayjs().format("h:mm A"));
        Alert.alert("Saved!", "Your entry was saved.");
        reset();
      } else {
        Alert.alert("Error", "Server did not return ok.");
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err?.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  };  

  const handleLogin = async () => {
    try {
      if (!email.includes("@")) {
        Alert.alert("Invalid email", "Please enter a valid email address.");
        return;
      }
      // Call the server to create/find the user
      const res = await api.post("/auth/login", { email: email.trim().toLowerCase() });
      if (res.data?.ok && res.data?.userId) {
        await saveUserId(res.data.userId);
        setUserId(res.data.userId);
      } else {
        Alert.alert("Login failed", "Could not log in.");
      }
    } catch (e: any) {
      Alert.alert("Login error", e?.message ?? "Something went wrong.");
    }
  };  

  const handleLogout = async () => {
    await clearUserId();
    setUserId(null);
  };

  // --- Quick Paste parser ---
  const parseAndFillFromQuickText = () => {
    const raw = (quickText || "").trim();
    if (!raw) {
      Alert.alert("Nothing to parse", "Paste some text first.");
      return;
    }

    const text = raw.toLowerCase();
    const updates: Partial<FormValues> = {};
    const summary: string[] = [];

    // Sleep: supports "7h 30m", "7.5h", "7.5 hours", "sleep 7 hours 30 minutes"
    {
      // 7h 30m or 7 hours 30 min
      const m1 = text.match(/sleep.*?(\d+(?:\.\d+)?)\s*h(?:ours?)?(?:\s*(\d+)\s*m(?:in(?:utes?)?)?)?/i)
              || text.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?(?:\s*(\d+)\s*m)/i);
      // 7.5h or 7.5 hours (decimal)
      const m2 = text.match(/sleep.*?(\d+(?:\.\d+)?)\s*h(?:ours?)?\b/i)
              || text.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?\b/i);

      let sleepHours: number | undefined;
      if (m1) {
        const h = parseFloat(m1[1]);
        const mins = m1[2] ? parseFloat(m1[2]) : 0;
        if (!Number.isNaN(h)) sleepHours = h + (Number.isNaN(mins) ? 0 : mins / 60);
      } else if (m2) {
        const h = parseFloat(m2[1]);
        if (!Number.isNaN(h)) sleepHours = h;
      }
      if (sleepHours !== undefined) {
        updates.sleepHours = String(+sleepHours.toFixed(2));
        summary.push(`Sleep ${updates.sleepHours}h`);
      }
    }

    // Mood: "mood 4" (1–5)
    {
      const m = text.match(/mood[^0-9]*([1-5])\b/);
      if (m) {
        updates.mood = m[1];
        summary.push(`Mood ${updates.mood}`);
      }
    }

    // Water: "1800 ml", "1.8L", "water 2 L"
    {
      const m = text.match(/(\d+(?:\.\d+)?)\s*(ml|mL|l|L)\b/);
      if (m) {
        const val = parseFloat(m[1]);
        const unit = m[2].toLowerCase();
        if (!Number.isNaN(val)) {
          const ml = unit === "l" ? Math.round(val * 1000) : Math.round(val);
          updates.waterMl = String(ml);
          summary.push(`Water ${updates.waterMl} ml`);
        }
      }
    }

    // Hot flashes: "hot flashes 2" or "hf 2"
    {
      const m = text.match(/(hot\s*flashes?|hf)[^0-9]*?(\d+)/);
      if (m) {
        updates.hotFlashCount = String(parseInt(m[2], 10));
        summary.push(`Hot flashes ${updates.hotFlashCount}`);
      }
    }

    // Night sweats: "night sweats yes/no/true/false"
    {
      const m = text.match(/night\s*sweats?[^a-zA-Z0-9]*(yes|no|true|false)/);
      if (m) {
        const v = m[1];
        const bool = v === "yes" || v === "true";
        updates.nightSweats = bool;
        summary.push(`Night sweats ${bool ? "Yes" : "No"}`);
      }
    }

    // Dryness: "dryness 0–5"
    {
      const m = text.match(/dryness[^0-9]*([0-5])\b/);
      if (m) {
        updates.drynessLevel = m[1];
        summary.push(`Dryness ${updates.drynessLevel}`);
      }
    }

    // Apply to form
    let applied = 0;
    if (updates.sleepHours !== undefined) { setValue("sleepHours", updates.sleepHours); applied++; }
    if (updates.mood !== undefined) { setValue("mood", updates.mood); applied++; }
    if (updates.waterMl !== undefined) { setValue("waterMl", updates.waterMl); applied++; }
    if (updates.hotFlashCount !== undefined) { setValue("hotFlashCount", updates.hotFlashCount); applied++; }
    if (updates.nightSweats !== undefined) { setValue("nightSweats", updates.nightSweats); applied++; }
    if (updates.drynessLevel !== undefined) { setValue("drynessLevel", updates.drynessLevel); applied++; }

    if (applied > 0) {
      Alert.alert("Parsed!", summary.join("\n"));
      setView("today"); // jump back so they can review/Save
    } else {
      Alert.alert("Nothing recognized", "Couldn’t find any numbers I know how to use.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: 40 }]}
          keyboardShouldPersistTaps="handled"
        >
 
 {authLoading ? (
          // 1) While we check AsyncStorage for a saved userId
          <View style={{ paddingTop: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 12, opacity: 0.7 }}>Checking session…</Text>
          </View>
        ) : !userId ? (
          // 2) No user yet → show Login (hero + card)
          <>
            <View style={{ height: 16 }} />

            <LoginHero
              title="Balanced Life"
              tagline="Track menopause symptoms and daily habits — see patterns that help you feel better."
            />

            <SectionCard title="Sign in to continue">
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <FancyButton title="Continue" onPress={handleLogin} />
            </SectionCard>
          </>
        ) : (
          // 3) Logged in → show app UI
          <>
            {/* Top toggle */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleItem}>
                <FancyButton
                  title="Today"
                  size="sm"
                  variant={view === "today" ? "primary" : "outline"}
                  onPress={() => setView("today")}
                />
              </View>

              <View style={styles.toggleItem}>
                <FancyButton
                  title="History"
                  size="sm"
                  variant={view === "history" ? "primary" : "outline"}
                  onPress={() => setView("history")}
                />
              </View>

              <View style={styles.toggleItem}>
                <FancyButton
                  title="Paste"
                  size="sm"
                  variant={view === "paste" ? "primary" : "outline"}
                  onPress={() => setView("paste")}
                />
              </View>
            </View>

            <SectionCard title="Oura">
              <Text style={styles.label}>
                Connect Oura to import your recent sleep automatically.
              </Text>
              <FancyButton
                title="Connect Oura"
                onPress={() => {
                  if (!userId) return;
                  Linking.openURL(`${process.env.EXPO_PUBLIC_API_URL}/oura/connect?userId=${userId}`);
                }}
              />
            </SectionCard>

            {/* TODAY / HISTORY / PASTE */}
            {view === "today" ? (
              <>
                <SectionCard title="Basics">
                  <Controller
                    control={control}
                    name="sleepHours"
                    render={({ field: { onChange, value } }) => (
                      <LabeledInput
                        label="Sleep Hours"
                        keyboardType="decimal-pad"
                        placeholder="e.g., 7.5"
                        value={value}
                        onChangeText={onChange}
                        returnKeyType="done"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="mood"
                    render={({ field: { onChange, value } }) => (
                      <LabeledInput
                        label="Mood (1–5)"
                        keyboardType="number-pad"
                        placeholder="1 to 5"
                        value={value}
                        onChangeText={onChange}
                        returnKeyType="done"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="waterMl"
                    render={({ field: { onChange, value } }) => (
                      <LabeledInput
                        label="Water (ml)"
                        keyboardType="number-pad"
                        placeholder="e.g., 1800"
                        value={value}
                        onChangeText={onChange}
                        returnKeyType="done"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="hotFlashCount"
                    render={({ field: { onChange, value } }) => (
                      <LabeledInput
                        label="Hot Flashes (count)"
                        keyboardType="number-pad"
                        placeholder="e.g., 2"
                        value={value}
                        onChangeText={onChange}
                        returnKeyType="done"
                      />
                    )}
                  />

                  {/* Night sweats toggle */}
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

                  <Controller
                    control={control}
                    name="drynessLevel"
                    render={({ field: { onChange, value } }) => (
                      <LabeledInput
                        label="Dryness Level (0–5)"
                        keyboardType="number-pad"
                        placeholder="0 to 5"
                        value={value}
                        onChangeText={onChange}
                        returnKeyType="done"
                      />
                    )}
                  />
                </SectionCard>

                <SectionCard title="Supplements">
                  <Controller
                    control={control}
                    name="glycineMg"
                    render={({ field: { onChange, value } }) => (
                      <LabeledInput
                        label="Glycine (mg)"
                        keyboardType="number-pad"
                        placeholder="e.g., 3000"
                        value={value}
                        onChangeText={onChange}
                        returnKeyType="done"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="magnesiumMg"
                    render={({ field: { onChange, value } }) => (
                      <LabeledInput
                        label="Magnesium (mg)"
                        keyboardType="number-pad"
                        placeholder="e.g., 200"
                        value={value}
                        onChangeText={onChange}
                        returnKeyType="done"
                      />
                    )}
                  />

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Text style={styles.label}>Collagen</Text>
                    <Controller
                      control={control}
                      name="collagen"
                      render={({ field: { onChange, value } }) => (
                        <Switch value={!!value} onValueChange={onChange} />
                      )}
                    />
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Text style={styles.label}>Omega-3</Text>
                    <Controller
                      control={control}
                      name="omega3"
                      render={({ field: { onChange, value } }) => (
                        <Switch value={!!value} onValueChange={onChange} />
                      )}
                    />
                  </View>

                  <View style={styles.hr} />

                  <FancyButton title="Save Today" onPress={handleSubmit(onSubmit)} />
                  {lastSavedAt && (
                    <Text style={{ textAlign: "center", marginTop: 8 }}>
                      Saved at {lastSavedAt}
                    </Text>
                  )}
                </SectionCard>
              </>
            ) : view === "history" ? (
              <>
                {!loading && !error && history.length > 0 && (
                  <SectionCard title={chartMetric === "sleep" ? "Sleep Hours (last 14 days)" : "Mood (last 14 days)"}>
                    <View style={{ flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 8 }}>
                      <FancyButton
                        title="Sleep"
                        variant={chartMetric === "sleep" ? "primary" : "outline"}
                        onPress={() => setChartMetric("sleep")}
                      />
                      <FancyButton
                        title="Mood"
                        variant={chartMetric === "mood" ? "primary" : "outline"}
                        onPress={() => setChartMetric("mood")}
                      />
                    </View>

                    <LineChart
                      data={{ labels, datasets: [{ data: series }] }}
                      width={screenWidth}
                      height={200}
                      chartConfig={{
                        backgroundColor: "#ffffff",
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        decimalPlaces: chartMetric === "sleep" ? 1 : 0,
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        propsForDots: { r: "3" },
                      }}
                      withInnerLines
                      withOuterLines
                      bezier
                      style={{ alignSelf: "center", borderRadius: 8 }}
                    />
                  </SectionCard>
                )}

                {loading && <Text>Loading…</Text>}
                {error && <Text style={{ color: "red" }}>{error}</Text>}

                {!loading && !error && history.length === 0 && (
                  <EmptyState
                    title="Nothing to chart yet"
                    message="Add your first daily entry on the Today tab and your trends will appear here."
                  />
                )}

                <View style={styles.hr} />

                {!loading &&
                  !error &&
                  history.map((item: any) => (
                    <View key={item._id ?? item.date} style={styles.card}>
                      <Text style={{ fontWeight: "600" }}>{item.date}</Text>
                      <Text>Sleep: {item.metrics?.sleepHours ?? "-"}</Text>
                      <Text>Mood: {item.metrics?.mood ?? "-"}</Text>
                      <Text>Water: {item.metrics?.waterMl ?? "-"}</Text>
                      <Text>Hot flashes: {item.menopause?.hotFlashCount ?? "-"}</Text>
                      <Text>Night sweats: {item.menopause?.nightSweats ? "Yes" : "No"}</Text>
                      <Text>Dryness: {item.menopause?.drynessLevel ?? "-"}</Text>
                    </View>
                  ))}
              </>
            ) : (
              // NEW: Quick Paste
              <SectionCard title="Quick Paste (beta)">
                <Text style={styles.label}>
                  Paste Oura (or notes) text below. We’ll try to parse the numbers and fill the Today form.
                </Text>

                <TextInput
                  style={[styles.input, { height: 140, textAlignVertical: "top" }]}
                  multiline
                  placeholder="e.g. Sleep 7h 30m, Mood 4, Water 1.8L, Hot flashes 2, Night sweats yes, Dryness 2"
                  value={quickText}
                  onChangeText={setQuickText}
                />

                <View style={{ height: 8 }} />
                <FancyButton
                  title="Parse & Fill Form"
                  onPress={parseAndFillFromQuickText}
                />
              </SectionCard>
            )}

            {/* Logout button — always visible when logged in */}
            <View style={{ marginTop: 16 }}>
              <FancyButton title="Log out" variant="outline" onPress={handleLogout} />
            </View>
          </>
        )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 30, gap: 12 },
  title: { 
    fontSize: 28,            // a little larger
    fontWeight: "700", 
    marginBottom: 12, 
    textAlign: "center",
    color: theme.colors.textPrimary,
  },
  subtitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginTop: 16, 
    marginBottom: 6,
    color: theme.colors.textPrimary,
  },
  label: { 
    fontSize: 15, 
    fontWeight: "500", 
    marginTop: 8,
    color: theme.colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.card,
  },
  card: {
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.card,
    ...theme.shadow,
  },
  hr: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
    opacity: 0.6,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 16,  // keeps away from screen edges
    marginTop: 8,
    marginBottom: 16,
  },
  toggleItem: {
    flex: 1,                // each button gets equal width
  },  
});
