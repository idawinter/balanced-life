// mobile/src/ui/LoginHero.tsx
import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../src/theme";

type Props = {
  title?: string;
  tagline?: string;
};

export function LoginHero({
  title = "Balanced Life",
  tagline = "Track menopause symptoms and daily habits — see patterns that help you feel better.",
}: Props) {
  return (
    <View style={styles.wrap}>
      <ImageBackground
        source={require("../../assets/login-bg.jpg")}
        style={styles.bg}
        imageStyle={styles.bgImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.55)"]}
          style={styles.gradient}
        />
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.tagline}>{tagline}</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    ...theme.shadow,
  },
  bg: {
    height: 260,
    width: "100%",
    justifyContent: "flex-end",
  },
  bgImage: {
    transform: [{ scale: 1.02 }], // subtle crop
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  textBlock: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.92)",
    lineHeight: 20,
  },
});
