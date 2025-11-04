import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../components/layout';
import { LoadingState, EmptyState } from '../components/ui';
import { useEquipments } from '../hooks/useEquipments';
import { useClients } from '../hooks/useClients';
import { useServiceOrders } from '../hooks/useServiceOrders';
import { theme, typography, spacing } from '../constants/theme';

export default function EquipmentDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { equipments, deleteEquipment } = useEquipments();
  const { clients } = useClients();
  const { serviceOrders } = useServiceOrders();

  const equipment = equipments.find(e => e.id.toString() === params.id);
  const client = equipment ? clients.find(c => c.id === equipment.clientId) : null;
  const equipmentOrders = serviceOrders.filter(o => o.equipmentId?.toString() === params.id);

  const handleEdit = () => {
    router.push(`/equipment-form?id=${params.id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este equipamento? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteEquipment(Number(params.id));
            router.back();
          },
        },
      ]
    );
  };

  const handleNewOS = () => {
    router.push(`/os-form?clientId=${equipment?.clientId}&equipmentId=${params.id}`);
  };

  if (!equipment) {
    return (
      <EmptyState
        icon="hardware-chip-outline"
        title="Equipamento não encontrado"
        subtitle="Este equipamento pode ter sido removido"
      />
    );
  }

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{equipment.type}</Text>
          <Text style={styles.headerSubtitle}>{equipment.brand} {equipment.model}</Text>
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
        {/* Client Info */}
        {client && (
          <TouchableOpacity
            style={styles.clientCard}
            onPress={() => router.push(`/client-detail?id=${client.id}`)}
          >
            <Ionicons name="person" size={24} color={theme.colors.primary} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.clientLabel}>Cliente</Text>
              <Text style={styles.clientName}>{client.name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* Equipment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Equipamento</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo:</Text>
            <Text style={styles.infoValue}>{equipment.type}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Marca:</Text>
            <Text style={styles.infoValue}>{equipment.brand}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Modelo:</Text>
            <Text style={styles.infoValue}>{equipment.model}</Text>
          </View>

          {equipment.serialNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Número de Série:</Text>
              <Text style={styles.infoValue}>{equipment.serialNumber}</Text>
            </View>
          )}

          {equipment.installationDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data de Instalação:</Text>
              <Text style={styles.infoValue}>{equipment.installationDate}</Text>
            </View>
          )}

          {equipment.location && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Localização:</Text>
              <Text style={styles.infoValue}>{equipment.location}</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {equipment.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.notesText}>{equipment.notes}</Text>
          </View>
        )}

        {/* Maintenance History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Histórico de Manutenções</Text>
            <Text style={styles.countBadge}>{equipmentOrders.length}</Text>
          </View>

          {equipmentOrders.length === 0 ? (
            <EmptyState
              icon="clipboard-outline"
              title="Nenhuma manutenção registrada"
              subtitle="Crie a primeira OS para este equipamento"
            />
          ) : (
            equipmentOrders.map(order => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => router.push(`/os-detail?id=${order.id}`)}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNumber}>{order.osNumber}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${theme.colors.primary}20` }]}>
                    <Text style={[styles.statusText, { color: theme.colors.primary }]}>
                      {order.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.orderTitle}>{order.title}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <TouchableOpacity style={styles.newOSButton} onPress={handleNewOS}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.newOSText}>Nova Ordem de Serviço</Text>
        </TouchableOpacity>
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

  headerTitle: {
    ...typography.h3,
    color: theme.colors.text,
    fontWeight: '700',
  },

  headerSubtitle: {
    ...typography.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
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

  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  clientLabel: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  clientName: {
    ...typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginTop: 2,
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  sectionTitle: {
    ...typography.h4,
    color: theme.colors.text,
    fontWeight: '700',
  },

  countBadge: {
    ...typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },

  infoRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  infoLabel: {
    ...typography.body,
    color: theme.colors.textSecondary,
    width: 140,
  },

  infoValue: {
    ...typography.body,
    color: theme.colors.text,
    flex: 1,
    fontWeight: '600',
  },

  notesText: {
    ...typography.body,
    color: theme.colors.text,
    lineHeight: 22,
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
  },

  orderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  orderNumber: {
    ...typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
  },

  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  orderTitle: {
    ...typography.h4,
    color: theme.colors.text,
    marginBottom: spacing.xs,
  },

  orderDate: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  newOSButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  newOSText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '700',
  },
});
