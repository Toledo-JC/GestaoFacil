import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, typography, spacing } from '../../constants/theme';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to analytics service
    // analyticsService.logError(error, errorInfo);
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.reset);
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Ionicons name="warning" size={80} color={theme.colors.error} />
            
            <Text style={styles.title}>Ops! Algo deu errado</Text>
            
            <Text style={styles.message}>
              Não se preocupe, seus dados estão seguros. Tente reiniciar o aplicativo.
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Detalhes do erro (dev):</Text>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.button} onPress={this.reset}>
              <Ionicons name="refresh" size={20} color={theme.colors.surface} />
              <Text style={styles.buttonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },

  content: {
    alignItems: 'center',
    maxWidth: 400,
  },

  title: {
    ...typography.h2,
    color: theme.colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  message: {
    ...typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  errorDetails: {
    width: '100%',
    maxHeight: 200,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  errorTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: theme.colors.error,
    marginBottom: spacing.sm,
  },

  errorText: {
    ...typography.caption,
    fontFamily: 'monospace',
    color: theme.colors.textSecondary,
    marginBottom: spacing.xs,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },

  buttonText: {
    ...typography.body,
    fontWeight: '700',
    color: theme.colors.surface,
  },
});
