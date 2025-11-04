import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProfessional } from '../hooks/useProfessional';
import { theme } from '../constants/theme';
import { typography, spacing } from '../constants/theme';

export default function IndexScreen() {
  const router = useRouter();
  const { professional, loading } = useProfessional();
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[IndexScreen] Mounted - loading:', loading, 'professional:', !!professional);
  }, [loading, professional]);

  // Tela de erro com opção de retry
  if (initError) {
    return (
      <View style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.error }]}>
          <Ionicons name="alert-circle" size={48} color="#fff" />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Erro ao inicializar</Text>
        <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
          {initError}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            setInitError(null);
            router.replace('/');
          }}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Tela de loading
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="construct" size={48} color="#fff" />
        </View>
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Inicializando Gestão Fácil...
        </Text>
      </View>
    );
  }

  // Redirecionar baseado no estado
  console.log('[IndexScreen] Redirecting to:', professional ? '/(tabs)' : '/onboarding/welcome');
  
  if (!professional) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    padding: spacing.lg,
  },

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  loader: {
    marginVertical: spacing.lg,
  },

  title: {
    ...typography.h2,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  loadingText: {
    ...typography.body,
    marginTop: spacing.md,
    textAlign: 'center',
  },

  errorText: {
    ...typography.body,
    marginBottom: spacing.xl,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },

  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },

  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
