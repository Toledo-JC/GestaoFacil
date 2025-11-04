import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ColorPalette } from '../../types';
import { spacing, borderRadius } from '../../constants/theme';

interface PaletteSelectorProps {
  palettes: ColorPalette[];
  selectedPaletteId?: string;
  onSelectPalette: (palette: ColorPalette) => void;
  themeColors: any;
}

export function PaletteSelector({
  palettes,
  selectedPaletteId,
  onSelectPalette,
  themeColors,
}: PaletteSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: themeColors.text }]}>
        Paletas Pré-definidas
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.paletteList}>
          {palettes.map((palette) => (
            <TouchableOpacity
              key={palette.id}
              style={[
                styles.paletteCard,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                },
                selectedPaletteId === palette.id && styles.selectedPalette,
              ]}
              onPress={() => onSelectPalette(palette)}
            >
              <View style={styles.colorRow}>
                <View
                  style={[styles.colorBox, { backgroundColor: palette.primary }]}
                />
                <View
                  style={[styles.colorBox, { backgroundColor: palette.secondary }]}
                />
                <View
                  style={[styles.colorBox, { backgroundColor: palette.accent }]}
                />
              </View>
              
              <Text
                style={[styles.paletteName, { color: themeColors.text }]}
                numberOfLines={1}
              >
                {palette.name}
              </Text>
              
              {selectedPaletteId === palette.id && (
                <View style={[styles.checkmark, { backgroundColor: themeColors.primary }]}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.md,
  },

  paletteList: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingRight: spacing.lg,
  },

  paletteCard: {
    width: 120,
    padding: spacing.md,
    borderWidth: 2,
    borderRadius: borderRadius.md,
    position: 'relative',
  },

  selectedPalette: {
    borderColor: '#3b82f6',
    borderWidth: 2,
  },

  colorRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },

  colorBox: {
    flex: 1,
    height: 32,
    borderRadius: borderRadius.sm,
  },

  paletteName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  checkmark: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
