
import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export default function GradientCard({
  children,
  style,
  colors: gradientColors = [colors.gradientStart, colors.gradientEnd],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}: GradientCardProps) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradientColors}
        start={start}
        end={end}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: `0 8px 16px ${colors.primary}60`,
      },
    }),
  },
  gradient: {
    padding: 20,
  },
});
