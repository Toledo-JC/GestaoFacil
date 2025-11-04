import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '../../components/layout';
import { Button, Input } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { spacing, typography } from '../../constants/theme';

export default function ProfessionalSetupScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { segment } = useLocalSearchParams<{ segment: string }>();

  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleContinue = () => {
    if (!name.trim()) {
      setErrors({ name: 'Nome é obrigatório' });
      return;
    }

    router.push({
      pathname: '/onboarding/theme-customization',
      params: {
        segment,
        name: name.trim(),
        businessName: businessName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      },
    });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Seus Dados Profissionais
            </Text>

            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Configure seu perfil profissional. Esses dados aparecerão em orçamentos e documentos.
            </Text>

            <View style={styles.form}>
              <Input
                label="Nome Completo *"
                placeholder="Seu nome completo"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setErrors({});
                }}
                error={errors.name}
              />

              <Input
                label="Nome do Negócio"
                placeholder="Nome da sua empresa (opcional)"
                value={businessName}
                onChangeText={setBusinessName}
              />

              <Input
                label="Telefone"
                placeholder="(00) 00000-0000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <Input
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Endereço"
                placeholder="Rua, número, bairro, cidade"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                style={styles.textArea}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Continuar"
              onPress={handleContinue}
              fullWidth
            />
          </View>
        </View>
      </KeyboardAvoidingView>
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

  form: {
    gap: spacing.md,
  },

  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  footer: {
    padding: spacing.lg,
  },
});
