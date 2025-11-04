import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../components/layout';
import { NotificationBadge } from '../../components/notification';
import { useNotifications } from '../../hooks/useNotifications';
import { theme, typography, spacing } from '../../constants/theme';

export default function MoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();

  const menuSections = [
    {
      title: 'WhatsApp e Ferramentas',
      items: [
        { 
          key: 'send-whatsapp', 
          title: 'Enviar WhatsApp', 
          icon: 'logo-whatsapp', 
          route: '/send-whatsapp',
          color: '#25D366'
        },
        { 
          key: 'technical-calculator', 
          title: 'Calculadora Técnica', 
          icon: 'calculator-outline', 
          route: '/technical-calculator',
          color: '#3B82F6'
        },
        { 
          key: 'error-catalog', 
          title: 'Catálogo de Erros', 
          icon: 'bug-outline', 
          route: '/error-code-catalog',
          color: '#EF4444'
        },
      ],
    },
    {
      title: 'Busca e Relatórios',
      items: [
        { 
          key: 'global-search', 
          title: 'Busca Global', 
          icon: 'search-outline', 
          route: '/global-search',
          color: '#3B82F6'
        },
        { 
          key: 'special-reports', 
          title: 'Relatórios Especiais', 
          icon: 'analytics-outline', 
          route: '/special-reports',
          color: '#10B981'
        },
      ],
    },
    {
      title: 'Dados e Backup',
      items: [
        { 
          key: 'backup', 
          title: 'Backup e Restauração', 
          icon: 'cloud-upload-outline', 
          route: '/backup-settings',
          color: '#3B82F6'
        },
        { 
          key: 'export', 
          title: 'Exportar Dados', 
          icon: 'download-outline', 
          route: '/export-data',
          color: '#10B981'
        },
      ],
    },
    {
      title: 'Notificações',
      items: [
        { 
          key: 'notification-center', 
          title: 'Central de Notificações', 
          icon: 'notifications-outline', 
          route: '/notification-center',
          color: '#F59E0B',
          badge: unreadCount
        },
        { 
          key: 'notification-settings', 
          title: 'Configurar Notificações', 
          icon: 'settings-outline', 
          route: '/notification-settings',
          color: '#8B5CF6'
        },
      ],
    },
    {
      title: 'Personalização',
      items: [
        { 
          key: 'theme-editor', 
          title: 'Editor de Temas', 
          icon: 'brush-outline', 
          route: '/theme-editor',
          color: '#8B5CF6'
        },
        { 
          key: 'theme-presets', 
          title: 'Temas Pré-definidos', 
          icon: 'color-palette-outline', 
          route: '/theme-presets',
          color: '#EC4899'
        },
        { 
          key: 'theme-export', 
          title: 'Exportar/Importar Tema', 
          icon: 'swap-horizontal-outline', 
          route: '/theme-export',
          color: '#14B8A6'
        },
        { 
          key: 'accessibility', 
          title: 'Acessibilidade', 
          icon: 'accessibility-outline', 
          route: '/accessibility-settings',
          color: '#F59E0B'
        },
      ],
    },
    {
      title: 'Configurações',
      items: [
        { 
          key: 'notifications', 
          title: 'Notificações', 
          icon: 'notifications-outline', 
          route: '/notification-settings',
          color: '#F59E0B'
        },
        { 
          key: 'security', 
          title: 'Segurança', 
          icon: 'lock-closed-outline', 
          route: '/security-settings',
          color: '#EF4444'
        },
      ],
    },
    {
      title: 'Suporte',
      items: [
        { 
          key: 'help', 
          title: 'Central de Ajuda', 
          icon: 'help-circle-outline', 
          route: '/help',
          color: '#06B6D4'
        },
        { 
          key: 'about', 
          title: 'Sobre o App', 
          icon: 'information-circle-outline', 
          route: '/about',
          color: '#6B7280'
        },
      ],
    },
  ];

  const renderMenuItem = (item: typeof menuSections[0]['items'][0]) => (
    <TouchableOpacity
      key={item.key}
      style={styles.menuItem}
      onPress={() => router.push(item.route as any)}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <Text style={styles.menuTitle}>{item.title}</Text>
      {item.badge && item.badge > 0 ? (
        <NotificationBadge count={item.badge} />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
      )}
    </TouchableOpacity>
  );

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Mais</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {menuSections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map(renderMenuItem)}
          </View>
        ))}

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Gestão Fácil v1.0.0</Text>
          <Text style={styles.versionSubtext}>© 2025 - Todos os direitos reservados</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  headerTitle: {
    ...typography.h2,
    color: theme.colors.text,
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

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  menuTitle: {
    ...typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 1,
  },

  versionContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },

  versionText: {
    ...typography.caption,
    color: theme.colors.textTertiary,
    marginBottom: 4,
  },

  versionSubtext: {
    ...typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 11,
  },
});
