import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/layout';
import { technicalCalculatorService } from '../services/technical-calculator.service';
import { ElectricalCalculation, RefrigerationCalculation, HydraulicCalculation, UnitConversion, CalculationResult } from '../types';
import { theme, typography, spacing } from '../constants/theme';

type CalculatorTab = 'ELECTRICAL' | 'REFRIGERATION' | 'HYDRAULIC' | 'CONVERSION';

export default function TechnicalCalculatorScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CalculatorTab>('ELECTRICAL');
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Electrical state
  const [electricalType, setElectricalType] = useState<'POWER' | 'CURRENT' | 'VOLTAGE' | 'RESISTANCE'>('POWER');
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [power, setPower] = useState('');
  const [resistance, setResistance] = useState('');

  // Refrigeration state
  const [area, setArea] = useState('');
  const [height, setHeight] = useState('');
  const [people, setPeople] = useState('');
  const [equipment, setEquipment] = useState('');
  const [windows, setWindows] = useState('');

  const handleElectricalCalculation = () => {
    const calc: ElectricalCalculation = {
      type: electricalType,
      voltage: voltage ? parseFloat(voltage) : undefined,
      current: current ? parseFloat(current) : undefined,
      power: power ? parseFloat(power) : undefined,
      resistance: resistance ? parseFloat(resistance) : undefined,
    };

    const res = technicalCalculatorService.calculateElectrical(calc);
    setResult(res);
  };

  const handleRefrigerationCalculation = () => {
    const calc: RefrigerationCalculation = {
      type: 'BTU',
      area: area ? parseFloat(area) : undefined,
      height: height ? parseFloat(height) : undefined,
      people: people ? parseInt(people) : undefined,
      equipment: equipment ? parseInt(equipment) : undefined,
      windows: windows ? parseInt(windows) : undefined,
      insulationType: 'AVERAGE',
    };

    const res = technicalCalculatorService.calculateRefrigeration(calc);
    setResult(res);
  };

  const renderElectricalCalculator = () => (
    <View>
      <Text style={styles.sectionTitle}>Cálculo Elétrico</Text>
      
      <View style={styles.typeSelector}>
        {(['POWER', 'CURRENT', 'VOLTAGE', 'RESISTANCE'] as const).map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.typeButton, electricalType === type && styles.typeButtonActive]}
            onPress={() => setElectricalType(type)}
          >
            <Text style={[styles.typeButtonText, electricalType === type && styles.typeButtonTextActive]}>
              {type === 'POWER' ? 'Potência' : type === 'CURRENT' ? 'Corrente' : type === 'VOLTAGE' ? 'Tensão' : 'Resistência'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Tensão (V)</Text>
        <TextInput
          style={styles.input}
          placeholder="220"
          placeholderTextColor={theme.colors.textSecondary}
          value={voltage}
          onChangeText={setVoltage}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Corrente (A)</Text>
        <TextInput
          style={styles.input}
          placeholder="10"
          placeholderTextColor={theme.colors.textSecondary}
          value={current}
          onChangeText={setCurrent}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Potência (W)</Text>
        <TextInput
          style={styles.input}
          placeholder="2200"
          placeholderTextColor={theme.colors.textSecondary}
          value={power}
          onChangeText={setPower}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Resistência (Ω)</Text>
        <TextInput
          style={styles.input}
          placeholder="22"
          placeholderTextColor={theme.colors.textSecondary}
          value={resistance}
          onChangeText={setResistance}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.calculateButton} onPress={handleElectricalCalculation}>
        <Ionicons name="calculator" size={20} color={theme.colors.surface} />
        <Text style={styles.calculateButtonText}>Calcular</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRefrigerationCalculator = () => (
    <View>
      <Text style={styles.sectionTitle}>Cálculo de BTU</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Área (m²)</Text>
        <TextInput
          style={styles.input}
          placeholder="20"
          placeholderTextColor={theme.colors.textSecondary}
          value={area}
          onChangeText={setArea}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Pé-direito (m)</Text>
        <TextInput
          style={styles.input}
          placeholder="2.5"
          placeholderTextColor={theme.colors.textSecondary}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Pessoas</Text>
        <TextInput
          style={styles.input}
          placeholder="2"
          placeholderTextColor={theme.colors.textSecondary}
          value={people}
          onChangeText={setPeople}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Equipamentos Elétricos</Text>
        <TextInput
          style={styles.input}
          placeholder="3"
          placeholderTextColor={theme.colors.textSecondary}
          value={equipment}
          onChangeText={setEquipment}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Janelas</Text>
        <TextInput
          style={styles.input}
          placeholder="2"
          placeholderTextColor={theme.colors.textSecondary}
          value={windows}
          onChangeText={setWindows}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.calculateButton} onPress={handleRefrigerationCalculation}>
        <Ionicons name="calculator" size={20} color={theme.colors.surface} />
        <Text style={styles.calculateButtonText}>Calcular</Text>
      </TouchableOpacity>
    </View>
  );

  const renderResult = () => {
    if (!result) return null;

    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Ionicons name="checkmark-circle" size={32} color={theme.colors.success} />
          <Text style={styles.resultTitle}>Resultado</Text>
        </View>

        <View style={styles.resultValue}>
          <Text style={styles.resultNumber}>{result.value.toFixed(2)}</Text>
          <Text style={styles.resultUnit}>{result.unit}</Text>
        </View>

        {result.formula && (
          <View style={styles.resultFormula}>
            <Text style={styles.formulaLabel}>Fórmula:</Text>
            <Text style={styles.formulaText}>{result.formula}</Text>
          </View>
        )}

        {result.steps && result.steps.length > 0 && (
          <View style={styles.resultSteps}>
            <Text style={styles.stepsLabel}>Passos:</Text>
            {result.steps.map((step, index) => (
              <Text key={index} style={styles.stepText}>
                {index + 1}. {step}
              </Text>
            ))}
          </View>
        )}

        {result.warnings && result.warnings.length > 0 && (
          <View style={styles.warnings}>
            {result.warnings.map((warning, index) => (
              <View key={index} style={styles.warningItem}>
                <Ionicons name="warning" size={16} color={theme.colors.warning} />
                <Text style={styles.warningText}>{warning}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calculadora Técnica</Text>
        <TouchableOpacity onPress={() => setResult(null)}>
          <Ionicons name="refresh" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {([
          { key: 'ELECTRICAL', label: 'Elétrica', icon: 'flash' },
          { key: 'REFRIGERATION', label: 'Refrigeração', icon: 'snow' },
          { key: 'HYDRAULIC', label: 'Hidráulica', icon: 'water' },
          { key: 'CONVERSION', label: 'Conversão', icon: 'swap-horizontal' },
        ] as const).map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.key ? theme.colors.primary : theme.colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'ELECTRICAL' && renderElectricalCalculator()}
        {activeTab === 'REFRIGERATION' && renderRefrigerationCalculator()}

        {renderResult()}
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

  headerTitle: {
    ...typography.h3,
    color: theme.colors.text,
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 4,
  },

  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },

  tabText: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 10,
  },

  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },

  content: {
    padding: spacing.lg,
  },

  sectionTitle: {
    ...typography.h3,
    color: theme.colors.text,
    marginBottom: spacing.lg,
  },

  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  typeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  typeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  typeButtonText: {
    ...typography.caption,
    fontWeight: '600',
    color: theme.colors.text,
  },

  typeButtonTextActive: {
    color: theme.colors.surface,
  },

  inputGroup: {
    marginBottom: spacing.md,
  },

  inputLabel: {
    ...typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: spacing.xs,
  },

  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: theme.colors.text,
  },

  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },

  calculateButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: theme.colors.surface,
  },

  resultCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  resultTitle: {
    ...typography.h3,
    color: theme.colors.text,
  },

  resultValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.lg,
  },

  resultNumber: {
    ...typography.h1,
    fontWeight: '700',
    color: theme.colors.primary,
    fontSize: 48,
  },

  resultUnit: {
    ...typography.h3,
    color: theme.colors.textSecondary,
    marginLeft: spacing.sm,
  },

  resultFormula: {
    backgroundColor: theme.colors.background,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },

  formulaLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },

  formulaText: {
    ...typography.body,
    fontFamily: 'monospace',
    color: theme.colors.text,
  },

  resultSteps: {
    marginBottom: spacing.md,
  },

  stepsLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: spacing.sm,
  },

  stepText: {
    ...typography.caption,
    color: theme.colors.text,
    marginBottom: 4,
    paddingLeft: spacing.sm,
  },

  warnings: {
    gap: spacing.sm,
  },

  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: `${theme.colors.warning}10`,
    padding: spacing.sm,
    borderRadius: 8,
  },

  warningText: {
    ...typography.caption,
    color: theme.colors.warning,
    flex: 1,
  },
});
