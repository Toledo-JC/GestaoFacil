import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { hexToRgb, hexToHsv, rgbToHex, hsvToHex, RGB, HSV } from '../../utils/colors';
import { theme, typography, spacing } from '../../constants/theme';

type ColorMode = 'HEX' | 'RGB' | 'HSV';

interface ColorPickerAdvancedProps {
  color: string;
  onColorChange: (color: string) => void;
  label?: string;
}

export function ColorPickerAdvanced({ color, onColorChange, label }: ColorPickerAdvancedProps) {
  const [mode, setMode] = useState<ColorMode>('HSV');
  const [hexValue, setHexValue] = useState(color);
  const [rgbValue, setRgbValue] = useState<RGB>(hexToRgb(color));
  const [hsvValue, setHsvValue] = useState<HSV>(hexToHsv(color));

  useEffect(() => {
    setHexValue(color);
    setRgbValue(hexToRgb(color));
    setHsvValue(hexToHsv(color));
  }, [color]);

  const handleHexChange = (value: string) => {
    const hex = value.startsWith('#') ? value : `#${value}`;
    setHexValue(hex);
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      onColorChange(hex);
    }
  };

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgbValue, [channel]: value };
    setRgbValue(newRgb);
    const hex = rgbToHex(newRgb);
    onColorChange(hex);
  };

  const handleHsvChange = (channel: 'h' | 's' | 'v', value: number) => {
    const newHsv = { ...hsvValue, [channel]: value };
    setHsvValue(newHsv);
    const hex = hsvToHex(newHsv);
    onColorChange(hex);
  };

  const modes: ColorMode[] = ['HEX', 'RGB', 'HSV'];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Color Preview */}
      <View style={styles.preview}>
        <View style={[styles.colorBox, { backgroundColor: color }]} />
        <Text style={styles.colorValue}>{color.toUpperCase()}</Text>
      </View>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        {modes.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeButton, mode === m && styles.modeButtonActive]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.modeButtonText, mode === m && styles.modeButtonTextActive]}>
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Color Inputs */}
      <View style={styles.inputs}>
        {mode === 'HEX' && (
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>HEX:</Text>
            <TextInput
              style={styles.input}
              value={hexValue}
              onChangeText={handleHexChange}
              maxLength={7}
              autoCapitalize="characters"
              placeholder="#000000"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>
        )}

        {mode === 'RGB' && (
          <>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>R</Text>
                <Text style={styles.sliderValue}>{Math.round(rgbValue.r)}</Text>
              </View>
              <Slider
                style={styles.slider}
                value={rgbValue.r}
                onValueChange={(val) => handleRgbChange('r', val)}
                minimumValue={0}
                maximumValue={255}
                step={1}
                minimumTrackTintColor="#EF4444"
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor="#EF4444"
              />
            </View>

            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>G</Text>
                <Text style={styles.sliderValue}>{Math.round(rgbValue.g)}</Text>
              </View>
              <Slider
                style={styles.slider}
                value={rgbValue.g}
                onValueChange={(val) => handleRgbChange('g', val)}
                minimumValue={0}
                maximumValue={255}
                step={1}
                minimumTrackTintColor="#10B981"
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor="#10B981"
              />
            </View>

            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>B</Text>
                <Text style={styles.sliderValue}>{Math.round(rgbValue.b)}</Text>
              </View>
              <Slider
                style={styles.slider}
                value={rgbValue.b}
                onValueChange={(val) => handleRgbChange('b', val)}
                minimumValue={0}
                maximumValue={255}
                step={1}
                minimumTrackTintColor="#3B82F6"
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor="#3B82F6"
              />
            </View>
          </>
        )}

        {mode === 'HSV' && (
          <>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Matiz (H)</Text>
                <Text style={styles.sliderValue}>{Math.round(hsvValue.h)}°</Text>
              </View>
              <Slider
                style={styles.slider}
                value={hsvValue.h}
                onValueChange={(val) => handleHsvChange('h', val)}
                minimumValue={0}
                maximumValue={360}
                step={1}
                minimumTrackTintColor={color}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={color}
              />
            </View>

            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Saturação (S)</Text>
                <Text style={styles.sliderValue}>{Math.round(hsvValue.s)}%</Text>
              </View>
              <Slider
                style={styles.slider}
                value={hsvValue.s}
                onValueChange={(val) => handleHsvChange('s', val)}
                minimumValue={0}
                maximumValue={100}
                step={1}
                minimumTrackTintColor={color}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={color}
              />
            </View>

            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Valor (V)</Text>
                <Text style={styles.sliderValue}>{Math.round(hsvValue.v)}%</Text>
              </View>
              <Slider
                style={styles.slider}
                value={hsvValue.v}
                onValueChange={(val) => handleHsvChange('v', val)}
                minimumValue={0}
                maximumValue={100}
                step={1}
                minimumTrackTintColor={color}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={color}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  label: {
    ...typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: spacing.sm,
  },

  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  colorBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },

  colorValue: {
    ...typography.h4,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'monospace',
  },

  modeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  modeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },

  modeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  modeButtonText: {
    ...typography.caption,
    fontWeight: '600',
    color: theme.colors.text,
  },

  modeButtonTextActive: {
    color: theme.colors.surface,
  },

  inputs: {
    gap: spacing.sm,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  inputLabel: {
    ...typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    width: 50,
  },

  input: {
    flex: 1,
    ...typography.body,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    fontFamily: 'monospace',
  },

  sliderContainer: {
    marginBottom: spacing.sm,
  },

  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  sliderLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: theme.colors.text,
  },

  sliderValue: {
    ...typography.caption,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },

  slider: {
    width: '100%',
    height: 40,
  },
});
