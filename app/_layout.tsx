import React from 'react';
import { Stack } from 'expo-router';
import { ErrorBoundary } from '../components/ui';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AppLockProvider } from '../contexts/AppLockContext';
import { ProfessionalProvider } from '../contexts/ProfessionalContext';
import { ClientProvider } from '../contexts/ClientContext';
import { EquipmentProvider } from '../contexts/EquipmentContext';
import { CollaboratorProvider } from '../contexts/CollaboratorContext';
import { BudgetProvider } from '../contexts/BudgetContext';
import { ServiceOrderProvider } from '../contexts/ServiceOrderContext';
import { FinancialProvider } from '../contexts/FinancialContext';
import { InventoryProvider } from '../contexts/InventoryContext';
import { PreventiveMaintenanceProvider } from '../contexts/PreventiveMaintenanceContext';
import { DashboardProvider } from '../contexts/DashboardContext';
import { BackupProvider } from '../contexts/BackupContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { SearchProvider } from '../contexts/SearchContext';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
      <AppLockProvider>
        <ProfessionalProvider>
          <DashboardProvider>
            <BackupProvider>
              <NotificationProvider>
                <SearchProvider>
                  <ClientProvider>
                    <EquipmentProvider>
                      <CollaboratorProvider>
                        <BudgetProvider>
                          <ServiceOrderProvider>
                            <FinancialProvider>
                              <InventoryProvider>
                                <PreventiveMaintenanceProvider>
                                  <Stack screenOptions={{ headerShown: false }}>
                                    <Stack.Screen name="index" />
                                    <Stack.Screen name="onboarding" />
                                    <Stack.Screen name="(tabs)" />
                                    <Stack.Screen name="client-form" options={{ presentation: 'modal' }} />
                                    <Stack.Screen name="client-detail" />
                                    <Stack.Screen name="equipment-form" options={{ presentation: 'modal' }} />
                                    <Stack.Screen name="equipment-detail" />
                                    <Stack.Screen name="collaborator-form" options={{ presentation: 'modal' }} />
                                    <Stack.Screen name="collaborator-detail" />
                                    <Stack.Screen name="commissions-report" />
                                    <Stack.Screen name="budget-form" options={{ presentation: 'modal' }} />
                                    <Stack.Screen name="budget-detail" />
                                    <Stack.Screen name="os-form" options={{ presentation: 'modal' }} />
                                    <Stack.Screen name="os-detail" />
                                    <Stack.Screen name="os-execution" />
                                    <Stack.Screen name="financial-dashboard" />
                                    <Stack.Screen name="accounts-receivable" />
                                    <Stack.Screen name="accounts-payable" />
                                    <Stack.Screen name="bank-accounts" />
                                    <Stack.Screen name="financial-reports" />
                                    <Stack.Screen name="backup-settings" />
                                    <Stack.Screen name="backup-create" options={{ presentation: 'modal' }} />
                                    <Stack.Screen name="backup-history" />
                                    <Stack.Screen name="restore" options={{ presentation: 'modal' }} />
                                    <Stack.Screen name="theme-editor" options={{ presentation: 'modal' }} />
                                    <Stack.Screen name="theme-presets" />
                                    <Stack.Screen name="theme-export" />
                                    <Stack.Screen name="accessibility-settings" />
                                    <Stack.Screen name="notification-center" />
                                    <Stack.Screen name="notification-settings" />
                                    <Stack.Screen name="global-search" />
                                    <Stack.Screen name="saved-searches" />
                                    <Stack.Screen name="special-reports" />
                                    <Stack.Screen name="client-analysis" />
                                    <Stack.Screen name="operational-efficiency" />
                                    <Stack.Screen name="seasonality-report" />
                                    <Stack.Screen name="send-whatsapp" options={{ presentation: 'modal' }} />
                                    <Stack.Screen name="technical-calculator" />
                                    <Stack.Screen name="error-code-catalog" />
                                  </Stack>
                                </PreventiveMaintenanceProvider>
                              </InventoryProvider>
                            </FinancialProvider>
                          </ServiceOrderProvider>
                        </BudgetProvider>
                      </CollaboratorProvider>
                    </EquipmentProvider>
                  </ClientProvider>
                </SearchProvider>
              </NotificationProvider>
            </BackupProvider>
          </DashboardProvider>
        </ProfessionalProvider>
      </AppLockProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}
