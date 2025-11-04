import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../components/layout';
import { Button, Input } from '../components/ui';
import { useClients } from '../hooks/useClients';
import { useEquipments } from '../hooks/useEquipments';
import { useServiceOrders } from '../hooks/useServiceOrders';
import { ServiceOrder } from '../types';
import { theme, typography, spacing } from '../constants/theme';

type ServiceType = 'PREVENTIVA' | 'CORRETIVA' | 'INSTALACAO' | 'LIMPEZA';
type Priority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

const SERVICE_TYPES: { value: ServiceType; label: string; icon: string }[] = [
  { value: 'PREVENTIVA', label: 'Preventiva', icon: 'calendar-outline' },
  { value: 'CORRETIVA', label: 'Corretiva', icon: 'build-outline' },
  { value: 'INSTALACAO', label: 'Instalação', icon: 'construct-outline' },
  { value: 'LIMPEZA', label: 'Limpeza', icon: 'sparkles-outline' },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'BAIXA', label: 'Baixa', color: '#4CAF50' },
  { value: 'MEDIA', label: 'Média', color: '#2196F3' },
  { value: 'ALTA', label: 'Alta', color: '#FF9800' },
  { value: 'URGENTE', label: 'Urgente', color: '#F44336' },
];

export default function OSFormScreen() {
  const params = useLocalSearchParams<{ clientId?: string; equipmentId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { clients } = useClients();
  const { equipments } = useEquipments();
  const { createServiceOrder } = useServiceOrders();

  const [formData, setFormData] = useState({
    clientId: params.clientId ? Number(params.clientId) : 0,
    equipmentId: params.equipmentId ? Number(params.equipmentId) : undefined,
    serviceType: 'CORRETIVA' as ServiceType,
    priority: 'MEDIA' as Priority,
    title: '',
    description: '',
    estimatedDate: '',
    notes: '',
  });

  const [saving, setSaving] = useState(false);

  const client = clients.find(c => c.id === formData.clientId);
  const equipment = formData.equipmentId
    ? equipments.find(e => e.id === formData.equipmentId)
    : undefined;

  const handleSave = async () => {
    if (!formData.clientId) {
      Alert.alert('Erro', 'Selecione um cliente');
      return;
    }

    if (!formData.title.trim()) {
      Alert.alert('Erro', 'Digite um título para a OS');
      return;
    }

    try {
      setSaving(true);

      const osData: Partial<ServiceOrder> = {
        clientId: formData.clientId,
        equipmentId: formData.equipmentId,
        osNumber: `OS${Date.now()}`,
        title: formData.title,
        description: formData.description || undefined,
        status: 'DRAFT',
        priority: formData.priority,
        serviceType: formData.serviceType,
        estimatedCompletionDate: formData.estimatedDate || undefined,
        notes: formData.notes || undefined,
        createdAt: new Date().toISOString(),
      };

      await createServiceOrder(osData as ServiceOrder);
      Alert.alert('Sucesso', 'OS criada com sucesso');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar OS');
      console.error('Error creating OS:', error);
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
        <Text style={styles.headerTitle}>Nova Ordem de Serviço</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Client Info */}
        {client && (
          <View style={styles.selectedCard}>
            <Ionicons name="person" size={20} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedLabel}>Cliente</Text>
              <Text style={styles.selectedValue}>{client.name}</Text>
            </View>
          </View>
        )}

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

        {/* Service Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Serviço</Text>
          <View style={styles.typeGrid}>
            {SERVICE_TYPES.map(type => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeCard,
                  formData.serviceType === type.value && styles.typeCardActive,
                ]}
                onPress={() => setFormData({ ...formData, serviceType: type.value })}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={
                    formData.serviceType === type.value
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.typeLabel,
                    formData.serviceType === type.value && styles.typeLabelActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prioridade</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map(priority => (
              <TouchableOpacity
                key={priority.value}
                style={[
                  styles.priorityButton,
                  formData.priority === priority.value && {
                    backgroundColor: priority.color,
                    borderColor: priority.color,
                  },
                ]}
                onPress={() => setFormData({ ...formData, priority: priority.value })}
              >
                <Text
                  style={[
                    styles.priorityText,
                    formData.priority === priority.value && { color: '#fff' },
                  ]}
                >
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Título *</Text>
          <Input
            value={formData.title}
            onChangeText={text => setFormData({ ...formData, title: text })}
            placeholder="Ex: Manutenção preventiva ar condicionado"
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Descrição do Problema/Serviço</Text>
          <Input
            value={formData.description}
            onChangeText={text => setFormData({ ...formData, description: text })}
            placeholder="Descreva o problema ou serviço a ser realizado"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Estimated Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Previsão de Conclusão</Text>
          <Input
            value={formData.estimatedDate}
            onChangeText={text => setFormData({ ...formData, estimatedDate: text })}
            placeholder="dd/mm/aaaa"
          />
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Observações</Text>
          <Input
            value={formData.notes}
            onChangeText={text => setFormData({ ...formData, notes: text })}
            placeholder="Informações adicionais"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            A OS será criada com status RASCUNHO e poderá ser editada posteriormente
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Criar Ordem de Serviço" onPress={handleSave} loading={saving} fullWidth />
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
    marginBottom: spacing.md,
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

  priorityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  priorityButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },

  priorityText: {
    ...typography.body,
    color: theme.colors.text,
    fontWeight: '600',
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

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  infoText: {
    ...typography.caption,
    color: theme.colors.primary,
    flex: 1,
  },

  footer: {
    padding: spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
