
import { StyleSheet } from 'react-native';

// Premium Finance App Color Palette - Sophisticated dark theme with vibrant orange accents
export const colors = {
  // Dark theme (primary)
  background: '#0A0E1A', // Deep navy black
  backgroundSecondary: '#111827', // Slightly lighter navy
  card: '#1A1F2E', // Dark card background
  cardElevated: '#1F2937', // Elevated card
  
  // Text colors
  text: '#FFFFFF', // Pure white for primary text
  textSecondary: '#9CA3AF', // Muted gray for secondary text
  textTertiary: '#6B7280', // Even more muted for tertiary
  
  // Brand colors - Vibrant orange accent
  primary: '#FF6B35', // Vibrant orange
  primaryLight: '#FF8C61', // Lighter orange
  primaryDark: '#E85A2A', // Darker orange
  
  // Accent colors
  accent: '#FFB800', // Gold accent
  accentBlue: '#3B82F6', // Trust blue
  accentPurple: '#8B5CF6', // Premium purple
  accentGreen: '#10B981', // Success green
  
  // Gradients
  gradientStart: '#FF6B35',
  gradientEnd: '#FFB800',
  
  // Status colors
  success: '#10B981',
  warning: '#FFB800',
  danger: '#EF4444',
  info: '#3B82F6',
  
  // Severity colors
  severityLow: '#10B981',
  severityMedium: '#FFB800',
  severityHigh: '#EF4444',
  
  // UI elements
  border: '#2D3748',
  borderLight: '#374151',
  divider: '#1F2937',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Glass effect
  glass: 'rgba(26, 31, 46, 0.8)',
  glassBorder: 'rgba(255, 107, 53, 0.2)',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardElevated: {
    backgroundColor: colors.cardElevated,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  gradientButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
