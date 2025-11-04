import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../components/layout';
import { LoadingState, EmptyState } from '../components/ui';
import { useClients } from '../hooks/useClients';
import { useEquipments } from '../hooks/useEquipments';
import { useServiceOrders } from '../hooks/useServiceOrders';
import { theme, typography, spacing } from '../constants/theme';
import { formatPhone } from '../utils/format';

type TabType = 'info' | 'equipments' | 'orders' | 'documents';

export default function ClientDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { clients, deleteClient } = useClients();
  const { equipments } = useEquipments();
  const { serviceOrders } = useServiceOrders();
  
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [loading, setLoading] = useState(true);

  const client = clients.find(c => c.id.toString() === params.id);
  const clientEquipments = equipments.filter(e => e.clientId.toString() === params.id);
  const clientOrders = serviceOrders.filter(o => o.clientId.toString() === params.id);

  useEffect(() => {
    if (client) {
      setLoading(false);
    }
  }, [client]);

  const handleEdit = () => {
    router.push(`/client-form?id=${params.id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o cliente ${client?.name}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteClient(Number(params.id));
            router.back();
          },
        },
      ]
    );
  };

  const handleNewOS = () => {
    router.push(`/os-form?clientId=${params.id}`);
  };

  const handleWhatsApp = () => {
    if (client?.phone) {
      const phoneNumber = client.phone.replace(/\D/g, '');
      Linking.openURL(`whatsapp://send?phone=55${phoneNumber}`);
    }
  };

  const handleCall = () => {
    if (client?.phone) {
      Linking.openURL(`tel:${client.phone}`);
    }
  };

  if (loading) {
    return <LoadingState message="Carregando cliente..." />;
  }

  if (!client) {
    return (
      <EmptyState
        icon="person-outline"
        title="Cliente não encontrado"
        subtitle="Este cliente pode ter sido removido"
      />
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações de Contato</Text>
              
              {client.phone && (
                <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
                  <Ionicons name="call-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Telefone:</Text>
                  <Text style={styles.infoValue}>{formatPhone(client.phone)}</Text>
                </TouchableOpacity>
              )}

              {client.email && (
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{client.email}</Text>
                </View>
              )}

              {client.documentNumber && (
                <View style={styles.infoRow}>
                  <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{client.documentType === 'CPF' ? 'CPF' : 'CNPJ'}:</Text>
                  <Text style={styles.infoValue}>{client.documentNumber}</Text>
                </View>
              )}
            </View>

            {client.address && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Endereço</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoValue}>{client.address.street}, {client.address.number}</Text>
                    {client.address.complement && (
                      <Text style={styles.infoValue}>{client.address.complement}</Text>
                    )}
                    <Text style={styles.infoValue}>
                      {client.address.neighborhood} - {client.address.city}/{client.address.state}
                    </Text>
                    <Text style={styles.infoValue}>CEP: {client.address.zipCode}</Text>
                  </View>
                </View>
              </View>
            )}

            {client.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Observações</Text>
                <Text style={styles.notesText}>{client.notes}</Text>
              </View>
            )}
          </View>
        );

      case 'equipments':
        return (
          <View style={styles.tabContent}>
            {clientEquipments.length === 0 ? (
              <EmptyState
                icon="hardware-chip-outline"
                title="Nenhum equipamento cadastrado"
                subtitle="Adicione equipamentos para este cliente"
              />
            ) : (
              clientEquipments.map(equipment => (
                <TouchableOpacity
                  key={equipment.id}
                  style={styles.equipmentCard}
                  onPress={() => router.push(`/equipment-detail?id=${equipment.id}`)}
                >
                  <View style={styles.equipmentHeader}>
                    <Ionicons name="hardware-chip" size={24} color={theme.colors.primary} />
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <Text style={styles.equipmentType}>{equipment.type}</Text>
                      <Text style={styles.equipmentModel}>{equipment.brand} {equipment.model}</Text>
                      {equipment.serialNumber && (
                        <Text style={styles.equipmentSerial}>S/N: {equipment.serialNumber}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                  </View>
                </TouchableOpacity>
              ))
            )}
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push(`/equipment-form?clientId=${params.id}`)}
            >
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Adicionar Equipamento</Text>
            </TouchableOpacity>
          </View>
        );

      case 'orders':
        return (
          <View style={styles.tabContent}>
            {clientOrders.length === 0 ? (
              <EmptyState
                icon="document-text-outline"
                title="Nenhuma OS encontrada"
                subtitle="Crie a primeira ordem de serviço"
              />
            ) : (
              clientOrders.map(order => (
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
        );

      case 'documents':
        return (
          <View style={styles.tabContent}>
            <EmptyState
              icon="folder-outline"
              title="Nenhum documento"
              subtitle="Funcionalidade em desenvolvimento"
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>{client.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName}>{client.name}</Text>
            {client.isFavorite && (
              <View style={styles.favoriteTag}>
                <Ionicons name="star" size={14} color={theme.colors.accent} />
                <Text style={styles.favoriteText}>Favorito</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton} onPress={handleNewOS}>
          <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.quickActionText}>Nova OS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton} onPress={handleCall}>
          <Ionicons name="call-outline" size={24} color={theme.colors.secondary} />
          <Text style={styles.quickActionText}>Ligar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton} onPress={handleWhatsApp}>
          <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          <Text style={styles.quickActionText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.tabActive]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
            Informações
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'equipments' && styles.tabActive]}
          onPress={() => setActiveTab('equipments')}
        >
          <Text style={[styles.tabText, activeTab === 'equipments' && styles.tabTextActive]}>
            Equipamentos ({clientEquipments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
            OSs ({clientOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderTabContent()}
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

  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  avatarText: {
    ...typography.h2,
    color: '#fff',
  },

  headerName: {
    ...typography.h3,
    color: theme.colors.text,
    fontWeight: '700',
  },

  favoriteTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },

  favoriteText: {
    ...typography.caption,
    color: theme.colors.accent,
    fontWeight: '600',
  },

  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quickActions: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },

  quickActionText: {
    ...typography.caption,
    color: theme.colors.text,
    fontWeight: '600',
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  tabActive: {
    borderBottomColor: theme.colors.primary,
  },

  tabText: {
    ...typography.body,
    color: theme.colors.textSecondary,
  },

  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },

  content: {
    flex: 1,
  },

  tabContent: {
    padding: spacing.lg,
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
  },

  notesText: {
    ...typography.body,
    color: theme.colors.text,
    lineHeight: 22,
  },

  equipmentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  equipmentType: {
    ...typography.h4,
    color: theme.colors.text,
    fontWeight: '700',
  },

  equipmentModel: {
    ...typography.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  equipmentSerial: {
    ...typography.caption,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  addButtonText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '700',
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
});
