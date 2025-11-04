import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/layout';
import { Button } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius, typography } from '../../constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="construct" size={64} color="#fff" />
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            Bem-vindo ao Gestão Fácil
          </Text>

          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Seu assistente completo para gerenciar clientes, equipamentos, ordens de serviço e muito mais.
          </Text>

          <View style={styles.featureList}>
            {[
              { icon: 'people', text: 'Cadastro de clientes e equipamentos' },
              { icon: 'clipboard', text: 'Ordens de serviço e orçamentos' },
              { icon: 'wallet', text: 'Controle financeiro completo' },
              { icon: 'cube', text: 'Gestão de estoque' },
              { icon: 'calendar', text: 'Manutenções preventivas' },
              { icon: 'color-palette', text: 'Temas personalizáveis' },
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: theme.colors.primaryLight }]}>
                  <Ionicons name={feature.icon as any} size={20} color="#fff" />
                </View>
                <Text style={[styles.featureText, { color: theme.colors.text }]}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Começar"
            onPress={() => router.push('/onboarding/segment-selection')}
            fullWidth
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
    justifyContent: 'center',
  },

  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },

  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },

  featureList: {
    gap: spacing.md,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  featureText: {
    flex: 1,
    ...typography.body,
  },

  footer: {
    padding: spacing.lg,
  },
});
