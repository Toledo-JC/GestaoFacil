import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../components/layout';
import { Button, Input } from '../components/ui';
import { useCollaborators } from '../hooks/useCollaborators';
import { Collaborator } from '../types';
import { theme, typography, spacing } from '../constants/theme';

type CollaboratorType = 'SOCIO' | 'FUNCIONARIO' | 'TERCEIRIZADO' | 'AUXILIAR';

const COLLABORATOR_TYPES: { value: CollaboratorType; label: string; commission: number }[] = [
  { value: 'SOCIO', label: 'Sócio', commission: 50 },
  { value: 'FUNCIONARIO', label: 'Funcionário', commission: 15 },
  { value: 'TERCEIRIZADO', label: 'Terceirizado', commission: 30 },
  { value: 'AUXILIAR', label: 'Auxiliar', commission: 10 },
];

export default function CollaboratorFormScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { collaborators, createCollaborator, updateCollaborator } = useCollaborators();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cpf: '',
    type: 'FUNCIONARIO' as CollaboratorType,
    commissionPercentage: 15,
    bank: '',
    agency: '',
    account: '',
    pixKey: '',
    specialty: '',
    notes: '',
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isEdit = !!params.id;

  useEffect(() => {
    if (params.id) {
      const collaborator = collaborators.find(c => c.id.toString() === params.id);
      if (collaborator) {
        setFormData({
          name: collaborator.name,
          phone: collaborator.phone || '',
          email: collaborator.email || '',
          cpf: collaborator.cpf || '',
          type: collaborator.type as CollaboratorType,
          commissionPercentage: collaborator.commissionPercentage,
          bank: collaborator.bankInfo?.bank || '',
          agency: collaborator.bankInfo?.agency || '',
          account: collaborator.bankInfo?.account || '',
          pixKey: collaborator.bankInfo?.pixKey || '',
          specialty: collaborator.specialty || '',
          notes: collaborator.notes || '',
          active: collaborator.active,
        });
      }
    }
  }, [params.id, collaborators]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTypeChange = (type: CollaboratorType) => {
    const typeConfig = COLLABORATOR_TYPES.find(t => t.value === type);
    setFormData({
      ...formData,
      type,
      commissionPercentage: typeConfig?.commission || 15,
    });
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);

      const collaboratorData: Partial<Collaborator> = {
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        cpf: formData.cpf || undefined,
        type: formData.type,
        commissionPercentage: formData.commissionPercentage,
        bankInfo: {
          bank: formData.bank,
          agency: formData.agency,
          account: formData.account,
          pixKey: formData.pixKey,
        },
        specialty: formData.specialty || undefined,
        notes: formData.notes || undefined,
        active: formData.active,
      };

      if (isEdit) {
        await updateCollaborator(Number(params.id), collaboratorData);
        Alert.alert('Sucesso', 'Colaborador atualizado com sucesso');
      } else {
        await createCollaborator(collaboratorData as Collaborator);
        Alert.alert('Sucesso', 'Colaborador cadastrado com sucesso');
      }

      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar colaborador');
      console.error('Error saving collaborator:', error);
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
          {isEdit ? 'Editar Colaborador' : 'Novo Colaborador'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Nome *</Text>
            <Input
              value={formData.name}
              onChangeText={text => setFormData({ ...formData, name: text })}
              placeholder="Nome completo"
              error={errors.name}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Telefone *</Text>
            <Input
              value={formData.phone}
              onChangeText={text => setFormData({ ...formData, phone: text })}
              placeholder="(00) 00000-0000"
              keyboardType="phone-pad"
              error={errors.phone}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <Input
              value={formData.email}
              onChangeText={text => setFormData({ ...formData, email: text })}
              placeholder="email@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>CPF</Text>
            <Input
              value={formData.cpf}
              onChangeText={text => setFormData({ ...formData, cpf: text })}
              placeholder="000.000.000-00"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Type and Commission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo e Comissão</Text>

          <View style={styles.typeGrid}>
            {COLLABORATOR_TYPES.map(type => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeCard,
                  formData.type === type.value && styles.typeCardActive,
                ]}
                onPress={() => handleTypeChange(type.value)}
              >
                <Text
                  style={[
                    styles.typeLabel,
                    formData.type === type.value && styles.typeLabelActive,
                  ]}
                >
                  {type.label}
                </Text>
                <Text
                  style={[
                    styles.typeCommission,
                    formData.type === type.value && styles.typeCommissionActive,
                  ]}
                >
                  {type.commission}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Percentual de Comissão</Text>
            <Input
              value={formData.commissionPercentage.toString()}
              onChangeText={text =>
                setFormData({ ...formData, commissionPercentage: Number(text) || 0 })
              }
              placeholder="15"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Bank Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Bancários</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Banco</Text>
            <Input
              value={formData.bank}
              onChangeText={text => setFormData({ ...formData, bank: text })}
              placeholder="Ex: Banco do Brasil"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Agência</Text>
              <Input
                value={formData.agency}
                onChangeText={text => setFormData({ ...formData, agency: text })}
                placeholder="0000"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.field, { flex: 1.5 }]}>
              <Text style={styles.label}>Conta</Text>
              <Input
                value={formData.account}
                onChangeText={text => setFormData({ ...formData, account: text })}
                placeholder="00000-0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Chave PIX</Text>
            <Input
              value={formData.pixKey}
              onChangeText={text => setFormData({ ...formData, pixKey: text })}
              placeholder="CPF, Email, Telefone ou Chave Aleatória"
            />
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Adicionais</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Especialidade</Text>
            <Input
              value={formData.specialty}
              onChangeText={text => setFormData({ ...formData, specialty: text })}
              placeholder="Ex: Refrigeração, Elétrica, etc"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              value={formData.notes}
              onChangeText={text => setFormData({ ...formData, notes: text })}
              placeholder="Informações adicionais"
              multiline
              numberOfLines={4}
              style={styles.textArea}
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <TouchableOpacity
            style={styles.activeToggle}
            onPress={() => setFormData({ ...formData, active: !formData.active })}
          >
            <Ionicons
              name={formData.active ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={formData.active ? theme.colors.success : theme.colors.textTertiary}
            />
            <Text style={styles.activeText}>Colaborador Ativo</Text>
          </TouchableOpacity>
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
          title={isEdit ? 'Salvar Alterações' : 'Cadastrar Colaborador'}
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

  section: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    ...typography.h4,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
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

  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
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

  typeCommission: {
    ...typography.h4,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    marginTop: spacing.xs,
  },

  typeCommissionActive: {
    color: theme.colors.primary,
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

  activeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },

  activeText: {
    ...typography.body,
    color: theme.colors.text,
    fontWeight: '600',
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
