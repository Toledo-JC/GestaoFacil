import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../components/layout';
import { EmptyState } from '../components/ui';
import { useCollaborators } from '../hooks/useCollaborators';
import { useServiceOrders } from '../hooks/useServiceOrders';
import { theme, typography, spacing } from '../constants/theme';
import { formatCurrency, formatPhone } from '../utils/format';

export default function CollaboratorDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { collaborators, deleteCollaborator } = useCollaborators();
  const { serviceOrders } = useServiceOrders();

  const collaborator = collaborators.find(c => c.id.toString() === params.id);
  const collaboratorOrders = serviceOrders.filter(o =>
    o.collaborators?.some(collab => collab.toString() === params.id)
  );

  const handleEdit = () => {
    router.push(`/collaborator-form?id=${params.id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o colaborador ${collaborator?.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteCollaborator(Number(params.id));
            router.back();
          },
        },
      ]
    );
  };

  if (!collaborator) {
    return (
      <EmptyState
        icon="person-outline"
        title="Colaborador não encontrado"
        subtitle="Este colaborador pode ter sido removido"
      />
    );
  }

  // Mock commission data
  const totalCommissions = 2450.0;
  const pendingCommissions = 850.0;
  const paidCommissions = 1600.0;

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{collaborator.name}</Text>
          <Text style={styles.headerSubtitle}>{collaborator.type}</Text>
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
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: collaborator.active ? theme.colors.success : theme.colors.error },
            ]}
          >
            <Text style={styles.statusText}>
              {collaborator.active ? 'ATIVO' : 'INATIVO'}
            </Text>
          </View>
        </View>

        {/* Commission Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo de Comissões</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                {formatCurrency(totalCommissions)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pendente</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.accent }]}>
                {formatCurrency(pendingCommissions)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pago</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                {formatCurrency(paidCommissions)}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações de Contato</Text>

          {collaborator.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.infoLabel}>Telefone:</Text>
              <Text style={styles.infoValue}>{formatPhone(collaborator.phone)}</Text>
            </View>
          )}

          {collaborator.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{collaborator.email}</Text>
            </View>
          )}

          {collaborator.cpf && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.infoLabel}>CPF:</Text>
              <Text style={styles.infoValue}>{collaborator.cpf}</Text>
            </View>
          )}
        </View>

        {/* Work Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Profissionais</Text>

          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.infoLabel}>Tipo:</Text>
            <Text style={styles.infoValue}>{collaborator.type}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.infoLabel}>Comissão:</Text>
            <Text style={styles.infoValue}>{collaborator.commissionPercentage}%</Text>
          </View>

          {collaborator.specialty && (
            <View style={styles.infoRow}>
              <Ionicons name="star-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.infoLabel}>Especialidade:</Text>
              <Text style={styles.infoValue}>{collaborator.specialty}</Text>
            </View>
          )}
        </View>

        {/* Bank Info */}
        {collaborator.bankInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados Bancários</Text>

            {collaborator.bankInfo.bank && (
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.infoLabel}>Banco:</Text>
                <Text style={styles.infoValue}>{collaborator.bankInfo.bank}</Text>
              </View>
            )}

            {collaborator.bankInfo.agency && (
              <View style={styles.infoRow}>
                <Ionicons name="code-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.infoLabel}>Agência:</Text>
                <Text style={styles.infoValue}>{collaborator.bankInfo.agency}</Text>
              </View>
            )}

            {collaborator.bankInfo.account && (
              <View style={styles.infoRow}>
                <Ionicons name="card-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.infoLabel}>Conta:</Text>
                <Text style={styles.infoValue}>{collaborator.bankInfo.account}</Text>
              </View>
            )}

            {collaborator.bankInfo.pixKey && (
              <View style={styles.infoRow}>
                <Ionicons name="qr-code-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.infoLabel}>Chave PIX:</Text>
                <Text style={styles.infoValue}>{collaborator.bankInfo.pixKey}</Text>
              </View>
            )}
          </View>
        )}

        {/* Notes */}
        {collaborator.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.notesText}>{collaborator.notes}</Text>
          </View>
        )}

        {/* OS History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Histórico de OSs</Text>
            <Text style={styles.countBadge}>{collaboratorOrders.length}</Text>
          </View>

          {collaboratorOrders.length === 0 ? (
            <EmptyState
              icon="clipboard-outline"
              title="Nenhuma OS registrada"
              subtitle="Este colaborador ainda não participou de OSs"
            />
          ) : (
            collaboratorOrders.map(order => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => router.push(`/os-detail?id=${order.id}`)}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNumber}>{order.osNumber}</Text>
                  <View style={[styles.orderStatus, { backgroundColor: `${theme.colors.primary}20` }]}>
                    <Text style={[styles.orderStatusText, { color: theme.colors.primary }]}>
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

        {/* Performance Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Estatísticas de Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              <Text style={styles.statValue}>{collaboratorOrders.length}</Text>
              <Text style={styles.statLabel}>OSs Realizadas</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={24} color={theme.colors.accent} />
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Avaliação</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trending-up" size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>95%</Text>
              <Text style={styles.statLabel}>Taxa de Sucesso</Text>
            </View>
          </View>
        </View>
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

  statusContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },

  statusText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '700',
  },

  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  summaryTitle: {
    ...typography.h4,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  summaryItem: {
    alignItems: 'center',
  },

  summaryLabel: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: spacing.xs,
  },

  summaryValue: {
    ...typography.h3,
    fontWeight: '700',
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
    marginBottom: spacing.md,
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
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },

  infoLabel: {
    ...typography.body,
    color: theme.colors.textSecondary,
    width: 100,
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

  orderStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },

  orderStatusText: {
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

  statsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
  },

  statsTitle: {
    ...typography.h4,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },

  statValue: {
    ...typography.h3,
    color: theme.colors.text,
    fontWeight: '700',
  },

  statLabel: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
