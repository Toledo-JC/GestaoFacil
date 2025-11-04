import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../constants/theme';

interface ThemePreviewProps {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
}

export function ThemePreview({ colors }: ThemePreviewProps) {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Preview do Tema</Text>
      
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Exemplo de Card
        </Text>
        <Text style={[styles.cardText, { color: colors.textSecondary }]}>
          Este é um preview de como ficará seu aplicativo com as cores escolhidas.
        </Text>
        
        <View style={styles.buttonRow}>
          <View style={[styles.button, { backgroundColor: colors.primary }]}>
            <Text style={styles.buttonText}>Primária</Text>
          </View>
          
          <View style={[styles.button, { backgroundColor: colors.secondary }]}>
            <Text style={styles.buttonText}>Secundária</Text>
          </View>
        </View>
        
        <View style={[styles.iconRow, { borderTopColor: colors.accent }]}>
          <View style={styles.iconItem}>
            <View style={[styles.iconCircle, { backgroundColor: colors.accent }]}>
              <Ionicons name="home" size={20} color="#fff" />
            </View>
            <Text style={[styles.iconLabel, { color: colors.text }]}>Home</Text>
          </View>
          
          <View style={styles.iconItem}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="people" size={20} color="#fff" />
            </View>
            <Text style={[styles.iconLabel, { color: colors.text }]}>Clientes</Text>
          </View>
          
          <View style={styles.iconItem}>
            <View style={[styles.iconCircle, { backgroundColor: colors.secondary }]}>
              <Ionicons name="settings" size={20} color="#fff" />
            </View>
            <Text style={[styles.iconLabel, { color: colors.text }]}>Mais</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.md,
  },

  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },

  cardText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
  },

  iconItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
