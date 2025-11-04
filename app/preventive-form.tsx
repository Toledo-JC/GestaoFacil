import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../components/layout';
import { Button, Input } from '../components/ui';
import { useEquipments } from '../hooks/useEquipments';
import { theme, typography, spacing } from '../constants/theme';

type Periodicity = 'DIAS' | 'MESES' | 'HORAS' | 'KM';

const PERIODICITY_TYPES: { value: Periodicity; label: string; icon: string }[] = [
  { value: 'DIAS', label: 'Dias', icon: 'calendar-outline' },
  { value: 'MESES', label: 'Meses', icon: 'calendar' },
  { value: 'HORAS', label: 'Horas', icon: 'time-outline' },
  { value: 'KM', label: 'Km/Ciclos', icon: 'speedometer-outline' },
];

const ALERT_OPTIONS = [
  { value: 15, label: '15 dias antes' },
  { value: 7, label: '7 dias antes' },
  { value: 3, label: '3 dias antes' },
  { value: 1, label: '1 dia antes' },
];

export default function PreventiveFormScreen() {
  const params = useLocalSearchParams<{ equipmentId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { equipments } = useEquipments();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    equipmentId: params.equipmentId ? Number(params.equipmentId) : 0,
    periodicity: 'MESES' as Periodicity,
    value: 1,
    alerts: [7, 3, 1],
    description: '',
  });

  const equipment = formData.equipmentId
    ? equipments.find(e => e.id === formData.equipmentId)
    : undefined;

  const toggleAlert = (days: number) => {
    if (formData.alerts.includes(days)) {
      setFormData({
        ...formData,
        alerts: formData.alerts.filter(d => d !== days),
      });
    } else {
      setFormData({
        ...formData,
        alerts: [...formData.alerts, days].sort((a, b) => b - a),
      });
    }
  };

  const handleSave = async () => {
    if (!formData.equipmentId) {
      Alert.alert('Erro', 'Selecione um equipamento');
      return;
    }

    if (formData.value <= 0) {
      Alert.alert('Erro', 'O valor da periodicidade deve ser maior que zero');
      return;
    }

    try {
      setSaving(true);
      // TODO: Implement save logic
      Alert.alert('Sucesso', 'Manutenção preventiva criada com sucesso');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar manutenção preventiva');
      console.error('Error saving preventive maintenance:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Preventiva</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Equipment Info */}
        {equipment && (
          <View style={styles.selectedCard}>
            <Ionicons name="hardware-chip" size={20} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedLabel}>Equipamento</Text>
              <Text style={styles.selectedValue}>
                {equipment.type} - {equipment.brand} {equipment.model}
              </Text>
            </View>
          </View>
        )}

        {/* Periodicity Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Periodicidade</Text>
          <View style={styles.typeGrid}>
            {PERIODICITY_TYPES.map(type => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeCard,
                  formData.periodicity === type.value && styles.typeCardActive,
                ]}
                onPress={() => setFormData({ ...formData, periodicity: type.value })}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={
                    formData.periodicity === type.value
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.typeLabel,
                    formData.periodicity === type.value && styles.typeLabelActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Periodicity Value */}
        <View style={styles.field}>
          <Text style={styles.label}>Intervalo *</Text>
          <View style={styles.valueInput}>
            <Input
              value={formData.value.toString()}
              onChangeText={text => setFormData({ ...formData, value: Number(text) || 0 })}
              placeholder="1"
              keyboardType="numeric"
            />
            <Text style={styles.valueUnit}>
              {formData.periodicity === 'DIAS' && 'dias'}
              {formData.periodicity === 'MESES' && 'meses'}
              {formData.periodicity === 'HORAS' && 'horas'}
              {formData.periodicity === 'KM' && 'km/ciclos'}
            </Text>
          </View>
        </View>

        {/* Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas de Vencimento</Text>
          <Text style={styles.sectionSubtitle}>
            Selecione quando deseja ser notificado antes do vencimento
          </Text>
          <View style={styles.alertGrid}>
            {ALERT_OPTIONS.map(alert => (
              <TouchableOpacity
                key={alert.value}
                style={[
                  styles.alertCard,
                  formData.alerts.includes(alert.value) && styles.alertCardActive,
                ]}
                onPress={() => toggleAlert(alert.value)}
              >
                <Ionicons
                  name={
                    formData.alerts.includes(alert.value)
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={24}
                  color={
                    formData.alerts.includes(alert.value)
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.alertLabel,
                    formData.alerts.includes(alert.value) && styles.alertLabelActive,
                  ]}
                >
                  {alert.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Descrição</Text>
          <Input
            value={formData.description}
            onChangeText={text => setFormData({ ...formData, description: text })}
            placeholder="Descreva o que deve ser feito nesta manutenção"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            A próxima data de manutenção será calculada automaticamente com base na
            periodicidade configurada. Você receberá notificações nos prazos selecionados.
          </Text>
        </View>

        {/* Preview */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Resumo</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Periodicidade:</Text>
            <Text style={styles.previewValue}>
              A cada {formData.value}{' '}
              {formData.periodicity === 'DIAS' && 'dia(s)'}
              {formData.periodicity === 'MESES' && 'mês(es)'}
              {formData.periodicity === 'HORAS' && 'hora(s)'}
              {formData.periodicity === 'KM' && 'km/ciclo(s)'}
            </Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Alertas:</Text>
            <Text style={styles.previewValue}>
              {formData.alerts.length > 0
                ? formData.alerts.map(a => `${a} dia(s)`).join(', ')
                : 'Nenhum alerta selecionado'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Criar Manutenção Preventiva"
          onPress={handleSave}
          loading={saving}
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  backButton: {
    padding: spacing.xs,
  },

  headerTitle: {
    ...typography.h3,
    color: theme.colors.text,
    fontWeight: '700',
  },

  content: {
    padding: spacing.lg,
  },

  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },

  selectedLabel: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  selectedValue: {
    ...typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginTop: 2,
  },

  section: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    ...typography.h4,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  sectionSubtitle: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: spacing.md,
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  typeCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },

  typeCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },

  typeLabel: {
    ...typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },

  typeLabelActive: {
    color: theme.colors.primary,
  },

  field: {
    marginBottom: spacing.lg,
  },

  label: {
    ...typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },

  valueInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  valueUnit: {
    ...typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },

  alertGrid: {
    gap: spacing.sm,
  },

  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },

  alertCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },

  alertLabel: {
    ...typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },

  alertLabelActive: {
    color: theme.colors.primary,
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${theme.colors.primary}10`,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  infoText: {
    ...typography.caption,
    color: theme.colors.primary,
    flex: 1,
    lineHeight: 18,
  },

  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  previewTitle: {
    ...typography.h4,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },

  previewRow: {
    marginBottom: spacing.sm,
  },

  previewLabel: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: spacing.xs,
  },

  previewValue: {
    ...typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },

  footer: {
    padding: spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
