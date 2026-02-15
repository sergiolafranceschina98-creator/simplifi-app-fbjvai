
import { StyleSheet } from 'react-native';

// AI Terms Simplifier Color Palette - Professional legal/security theme
export const colors = {
  // Light mode
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  primary: '#3B82F6', // Trust blue
  secondary: '#8B5CF6', // Analysis purple
  accent: '#10B981', // Success green
  highlight: '#F59E0B', // Warning amber
  danger: '#EF4444', // Risk red
  border: '#E5E7EB',
  
  // Dark mode
  darkBackground: '#0F172A',
  darkCard: '#1E293B',
  darkText: '#F1F5F9',
  darkTextSecondary: '#94A3B8',
  darkBorder: '#334155',
  
  // Severity colors
  severityLow: '#10B981',
  severityMedium: '#F59E0B',
  severityHigh: '#EF4444',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
