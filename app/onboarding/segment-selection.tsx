import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/layout';
import { Button } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { SEGMENTS, Segment } from '../../types';
import { spacing, borderRadius, typography } from '../../constants/theme';

const SEGMENT_ICONS: Record<string, any> = {
  'Informática': 'laptop',
  'Eletrônica': 'hardware-chip',
  'Refrigeração': 'snow',
  'Elétrica': 'flash',
  'Hidráulica': 'water',
  'Automotivo': 'car',
  'Celulares': 'phone-portrait',
  'Eletrodomésticos': 'home',
  'Outro': 'ellipsis-horizontal',
};

export default function SegmentSelectionScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  const handleContinue = () => {
    if (selectedSegment) {
      router.push({
        pathname: '/onboarding/professional-setup',
        params: { segment: selectedSegment },
      });
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Escolha seu Segmento
          </Text>

          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Selecione a área principal da sua atuação. Isso ajudará a personalizar o app para suas necessidades.
          </Text>

          <View style={styles.segmentGrid}>
            {SEGMENTS.map((segment) => (
              <TouchableOpacity
                key={segment}
                style={[
                  styles.segmentCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: selectedSegment === segment
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                  selectedSegment === segment && styles.selectedCard,
                ]}
                onPress={() => setSelectedSegment(segment)}
              >
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: selectedSegment === segment
                        ? theme.colors.primary
                        : theme.colors.background,
                    },
                  ]}
                >
                  <Ionicons
                    name={SEGMENT_ICONS[segment]}
                    size={28}
                    color={selectedSegment === segment ? '#fff' : theme.colors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.segmentName,
                    {
                      color: selectedSegment === segment
                        ? theme.colors.primary
                        : theme.colors.text,
                    },
                  ]}
                >
                  {segment}
                </Text>
                {selectedSegment === segment && (
                  <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Continuar"
            onPress={handleContinue}
            disabled={!selectedSegment}
            fullWidth
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    padding: spacing.lg,
  },

  title: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },

  subtitle: {
    ...typography.body,
    marginBottom: spacing.xl,
  },

  segmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  segmentCard: {
    width: '47%',
    padding: spacing.lg,
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    position: 'relative',
  },

  selectedCard: {
    borderWidth: 2,
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  segmentName: {
    ...typography.bodySmall,
    fontWeight: '600',
    textAlign: 'center',
  },

  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  footer: {
    padding: spacing.lg,
  },
});
