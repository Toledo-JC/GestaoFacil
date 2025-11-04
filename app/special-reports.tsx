import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/layout';
import { theme, typography, spacing } from '../constants/theme';

export default function SpecialReportsScreen() {
  const router = useRouter();

  const reports = [
    {
      id: 'client-analysis',
      title: 'Análise de Clientes',
      description: 'Clientes mais lucrativos, frequência, ticket médio e riscos',
      icon: 'people',
      color: theme.colors.primary,
      route: '/client-analysis',
    },
    {
      id: 'operational-efficiency',
      title: 'Eficiência Operacional',
      description: 'Tempo médio, custos, produtividade e margem de lucro',
      icon: 'speedometer',
      color: '#10B981',
      route: '/operational-efficiency',
    },
    {
      id: 'seasonality',
      title: 'Sazonalidade',
      description: 'Tendências, melhores épocas e previsão de demanda',
      icon: 'trending-up',
      color: '#F59E0B',
      route: '/seasonality-report',
    },
  ];

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatórios Especiais</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Análises Avançadas</Text>
          <Text style={styles.introText}>
            Gere relatórios detalhados para insights estratégicos do seu negócio
          </Text>
        </View>

        {reports.map(report => (
          <TouchableOpacity
            key={report.id}
            style={styles.reportCard}
            onPress={() => router.push(report.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.reportIcon, { backgroundColor: `${report.color}20` }]}>
              <Ionicons name={report.icon as any} size={32} color={report.color} />
            </View>

            <View style={styles.reportContent}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportDescription}>{report.description}</Text>
            </View>

            <Ionicons name="chevron-forward" size={24} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        ))}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={theme.colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Sobre os Relatórios:</Text>
            <Text style={styles.infoText}>
              • Análises baseadas em dados históricos{'\n'}
              • Exportação em PDF/Excel disponível{'\n'}
              • Atualizados em tempo real{'\n'}
              • Gráficos e visualizações interativas
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  backButton: {
    padding: 4,
  },

  headerTitle: {
    ...typography.h3,
    color: theme.colors.text,
  },

  content: {
    padding: spacing.lg,
  },

  intro: {
    marginBottom: spacing.xl,
  },

  introTitle: {
    ...typography.h3,
    color: theme.colors.text,
    marginBottom: spacing.sm,
  },

  introText: {
    ...typography.body,
    color: theme.colors.textSecondary,
  },

  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  reportIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  reportContent: {
    flex: 1,
  },

  reportTitle: {
    ...typography.h4,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },

  reportDescription: {
    ...typography.caption,
    color: theme.colors.textSecondary,
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${theme.colors.info}10`,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: theme.colors.info,
    marginBottom: 4,
  },

  infoText: {
    ...typography.caption,
    color: theme.colors.info,
    lineHeight: 18,
  },
});
