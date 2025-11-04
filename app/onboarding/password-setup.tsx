import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '../../components/layout';
import { Button, Input } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { useAppLock } from '../../hooks/useAppLock';
import { useProfessional } from '../../hooks/useProfessional';
import { spacing, typography } from '../../constants/theme';

export default function PasswordSetupScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { enableLock } = useAppLock();
  const { createProfessional } = useProfessional();
  const params = useLocalSearchParams<{
    segment: string;
    name: string;
    businessName: string;
    phone: string;
    email: string;
    address: string;
  }>();

  const [enablePassword, setEnablePassword] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ pin?: string; confirmPin?: string }>({});

  const validatePin = (): boolean => {
    const newErrors: { pin?: string; confirmPin?: string } = {};

    if (enablePassword) {
      if (!pin || pin.length < 4) {
        newErrors.pin = 'A senha deve ter pelo menos 4 dígitos';
      }
      if (pin !== confirmPin) {
        newErrors.confirmPin = 'As senhas não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFinish = async () => {
    if (enablePassword && !validatePin()) {
      return;
    }

    setLoading(true);
    try {
      // Create professional profile
      await createProfessional({
        name: params.name,
        businessName: params.businessName || undefined,
        segment: params.segment,
        phone: params.phone || undefined,
        email: params.email || undefined,
        address: params.address || undefined,
      });

      // Setup password if enabled
      if (enablePassword && pin) {
        await enableLock(pin, false);
      }

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing setup:', error);
      Alert.alert('Erro', 'Não foi possível concluir a configuração. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await createProfessional({
        name: params.name,
        businessName: params.businessName || undefined,
        segment: params.segment,
        phone: params.phone || undefined,
        email: params.email || undefined,
        address: params.address || undefined,
      });

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing setup:', error);
      Alert.alert('Erro', 'Não foi possível concluir a configuração. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Segurança do App
          </Text>

          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Proteja seus dados com uma senha de acesso (opcional)
          </Text>

          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.passwordToggle}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                  Habilitar Senha
                </Text>
                <Text style={[styles.toggleHint, { color: theme.colors.textSecondary }]}>
                  Exigir senha ao abrir o aplicativo
                </Text>
              </View>
              <Switch
                value={enablePassword}
                onValueChange={setEnablePassword}
                trackColor={{ false: '#d1d5db', true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>

            {enablePassword && (
              <View style={styles.passwordFields}>
                <Input
                  label="Senha (mínimo 4 dígitos)"
                  placeholder="Digite sua senha"
                  value={pin}
                  onChangeText={(text) => {
                    setPin(text);
                    setErrors({});
                  }}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={6}
                  error={errors.pin}
                />

                <Input
                  label="Confirme a Senha"
                  placeholder="Digite novamente"
                  value={confirmPin}
                  onChangeText={(text) => {
                    setConfirmPin(text);
                    setErrors({});
                  }}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={6}
                  error={errors.confirmPin}
                />
              </View>
            )}
          </View>

          <View style={[styles.infoBox, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              💡 Você poderá alterar essas configurações a qualquer momento nas configurações do app.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Pular"
            onPress={handleSkip}
            variant="secondary"
            fullWidth
            loading={loading}
          />
          <Button
            title="Finalizar Configuração"
            onPress={handleFinish}
            fullWidth
            loading={loading}
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

  section: {
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },

  passwordToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  toggleLabel: {
    ...typography.h3,
    marginBottom: 4,
  },

  toggleHint: {
    ...typography.bodySmall,
  },

  passwordFields: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },

  infoBox: {
    padding: spacing.lg,
    borderRadius: 12,
  },

  infoText: {
    ...typography.bodySmall,
    lineHeight: 20,
  },

  footer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
});
