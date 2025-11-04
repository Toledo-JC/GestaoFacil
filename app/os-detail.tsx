import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../components/layout';
import { EmptyState } from '../components/ui';
import { useServiceOrders } from '../hooks/useServiceOrders';
import { useClients } from '../hooks/useClients';
import { useEquipments } from '../hooks/useEquipments';
import { theme, typography, spacing } from '../constants/theme';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#9E9E9E',
  BUDGET: '#2196F3',
  APPROVED: '#4CAF50',
  IN_PROGRESS: '#FF9800',
  WAITING_PARTS: '#FFC107',
  COMPLETED: '#4CAF50',
  CANCELLED: '#F44336',
};

export default function OSDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { serviceOrders, deleteServiceOrder } = useServiceOrders();
  const { clients } = useClients();
  const { equipments } = useEquipments();

  const os = serviceOrders.find(o => o.id.toString() === params.id);
  const client = os ? clients.find(c => c.id === os.clientId) : null;
  const equipment = os?.equipmentId ? equipments.find(e => e.id === os.equipmentId) : null;

  const handleEdit = () => {
    router.push(`/os-form?id=${params.id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir esta OS?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteServiceOrder(Number(params.id));
            router.back();
          },
        },
      ]
    );
  };

  const handleExecute = () => {
    router.push(`/os-execution?id=${params.id}`);
  };

  if (!os) {
    return (
      <EmptyState
        icon="document-text-outline"
        title="OS não encontrada"
        subtitle="Esta ordem de serviço pode ter sido removida"
      />
    );
  }

  const statusColor = STATUS_COLORS[os.status] || theme.colors.primary;

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.osNumber}>{os.osNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{os.status}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{os.title}</Text>

        {/* Client and Equipment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Serviço</Text>

          {client && (
            <TouchableOpacity
              style={styles.infoCard}
              onPress={() => router.push(`/client-detail?id=${client.id}`)}
            >
              <Ionicons name="person" size={20} color={theme.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Cliente</Text>
                <Text style={styles.infoValue}>{client.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}

          {equipment && (
            <TouchableOpacity
              style={styles.infoCard}
              onPress={() => router.push(`/equipment-detail?id=${equipment.id}`)}
            >
              <Ionicons name="hardware-chip" size={20} color={theme.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Equipamento</Text>
                <Text style={styles.infoValue}>
                  {equipment.type} - {equipment.brand} {equipment.model}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="build-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.infoLabel}>Tipo:</Text>
            <Text style={styles.infoValue}>{os.serviceType}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="flag-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.infoLabel}>Prioridade:</Text>
            <Text style={styles.infoValue}>{os.priority}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.infoLabel}>Criada em:</Text>
            <Text style={styles.infoValue}>
              {new Date(os.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>

          {os.estimatedCompletionDate && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.infoLabel}>Previsão:</Text>
              <Text style={styles.infoValue}>{os.estimatedCompletionDate}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {os.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.descriptionText}>{os.description}</Text>
          </View>
        )}

        {/* Notes */}
        {os.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.notesText}>{os.notes}</Text>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: theme.colors.primary }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>OS Criada</Text>
                <Text style={styles.timelineDate}>
                  {new Date(os.createdAt).toLocaleString('pt-BR')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}
        {os.status === 'APPROVED' || os.status === 'IN_PROGRESS' ? (
          <TouchableOpacity style={styles.executeButton} onPress={handleExecute}>
            <Ionicons name="play-circle" size={24} color="#fff" />
            <Text style={styles.executeText}>
              {os.status === 'APPROVED' ? 'Iniciar Execução' : 'Continuar Execução'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },

  backButton: {
    marginBottom: spacing.sm,
  },

  osNumber: {
    ...typography.h3,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '700',
  },

  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
  },

  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    padding: spacing.lg,
  },

  title: {
    ...typography.h2,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    ...typography.h4,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },

  infoLabel: {
    ...typography.body,
    color: theme.colors.textSecondary,
    width: 80,
  },

  infoValue: {
    ...typography.body,
    color: theme.colors.text,
    flex: 1,
    fontWeight: '600',
  },

  descriptionText: {
    ...typography.body,
    color: theme.colors.text,
    lineHeight: 22,
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
  },

  notesText: {
    ...typography.body,
    color: theme.colors.text,
    lineHeight: 22,
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
  },

  timeline: {
    paddingLeft: spacing.md,
  },

  timelineItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },

  timelineContent: {
    flex: 1,
    paddingBottom: spacing.md,
  },

  timelineTitle: {
    ...typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },

  timelineDate: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  executeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  executeText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '700',
  },
});
