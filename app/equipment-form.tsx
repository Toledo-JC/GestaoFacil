import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../components/layout';
import { Button, Input } from '../components/ui';
import { useEquipments } from '../hooks/useEquipments';
import { useClients } from '../hooks/useClients';
import { Equipment } from '../types';
import { theme, typography, spacing } from '../constants/theme';

export default function EquipmentFormScreen() {
  const params = useLocalSearchParams<{ id?: string; clientId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { equipments, createEquipment, updateEquipment } = useEquipments();
  const { clients } = useClients();

  const [formData, setFormData] = useState({
    clientId: params.clientId ? Number(params.clientId) : 0,
    type: '',
    brand: '',
    model: '',
    serialNumber: '',
    installationDate: '',
    location: '',
    notes: '',
    technicalData: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isEdit = !!params.id;
  const client = clients.find(c => c.id === formData.clientId);

  useEffect(() => {
    if (params.id) {
      const equipment = equipments.find(e => e.id.toString() === params.id);
      if (equipment) {
        setFormData({
          clientId: equipment.clientId,
          type: equipment.type,
          brand: equipment.brand || '',
          model: equipment.model || '',
          serialNumber: equipment.serialNumber || '',
          installationDate: equipment.installationDate || '',
          location: equipment.location || '',
          notes: equipment.notes || '',
          technicalData: equipment.technicalData || {},
        });
      }
    }
  }, [params.id, equipments]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Cliente é obrigatório';
    }
    if (!formData.type.trim()) {
      newErrors.type = 'Tipo de equipamento é obrigatório';
    }
    if (!formData.brand.trim()) {
      newErrors.brand = 'Marca é obrigatória';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Modelo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);

      const equipmentData: Partial<Equipment> = {
        clientId: formData.clientId,
        type: formData.type,
        brand: formData.brand,
        model: formData.model,
        serialNumber: formData.serialNumber || undefined,
        installationDate: formData.installationDate || undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
        technicalData: formData.technicalData,
      };

      if (isEdit) {
        await updateEquipment(Number(params.id), equipmentData);
        Alert.alert('Sucesso', 'Equipamento atualizado com sucesso');
      } else {
        await createEquipment(equipmentData as Equipment);
        Alert.alert('Sucesso', 'Equipamento cadastrado com sucesso');
      }

      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar equipamento');
      console.error('Error saving equipment:', error);
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
        <Text style={styles.headerTitle}>
          {isEdit ? 'Editar Equipamento' : 'Novo Equipamento'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Client Info */}
        {client && (
          <View style={styles.clientInfo}>
            <Ionicons name="person" size={20} color={theme.colors.primary} />
            <Text style={styles.clientName}>{client.name}</Text>
          </View>
        )}

        {/* Equipment Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Tipo de Equipamento *</Text>
          <Input
            value={formData.type}
            onChangeText={text => setFormData({ ...formData, type: text })}
            placeholder="Ex: Ar Condicionado, Geladeira, etc"
            error={errors.type}
          />
        </View>

        {/* Brand */}
        <View style={styles.field}>
          <Text style={styles.label}>Marca *</Text>
          <Input
            value={formData.brand}
            onChangeText={text => setFormData({ ...formData, brand: text })}
            placeholder="Ex: Samsung, LG, etc"
            error={errors.brand}
          />
        </View>

        {/* Model */}
        <View style={styles.field}>
          <Text style={styles.label}>Modelo *</Text>
          <Input
            value={formData.model}
            onChangeText={text => setFormData({ ...formData, model: text })}
            placeholder="Ex: AR12000BTU"
            error={errors.model}
          />
        </View>

        {/* Serial Number */}
        <View style={styles.field}>
          <Text style={styles.label}>Número de Série</Text>
          <Input
            value={formData.serialNumber}
            onChangeText={text => setFormData({ ...formData, serialNumber: text })}
            placeholder="S/N do equipamento"
          />
        </View>

        {/* Installation Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Data de Instalação</Text>
          <Input
            value={formData.installationDate}
            onChangeText={text => setFormData({ ...formData, installationDate: text })}
            placeholder="dd/mm/aaaa"
          />
        </View>

        {/* Location */}
        <View style={styles.field}>
          <Text style={styles.label}>Localização</Text>
          <Input
            value={formData.location}
            onChangeText={text => setFormData({ ...formData, location: text })}
            placeholder="Ex: Sala principal, Quarto 1, etc"
          />
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            value={formData.notes}
            onChangeText={text => setFormData({ ...formData, notes: text })}
            placeholder="Informações adicionais sobre o equipamento"
            multiline
            numberOfLines={4}
            style={styles.textArea}
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            Os campos marcados com * são obrigatórios
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isEdit ? 'Salvar Alterações' : 'Cadastrar Equipamento'}
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

  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },

  clientName: {
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

  textArea: {
    ...typography.body,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: spacing.md,
    color: theme.colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
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
