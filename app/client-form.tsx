import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useClients } from '../hooks/useClients';
import { useTheme } from '../hooks/useTheme';
import { Screen } from '../components/layout';
import { Input, Button, AddressMap } from '../components/ui';
import { validateCPF, validateCNPJ, validateEmail, validatePhone } from '../utils/validation';
import { formatCPF, formatCNPJ, formatPhone, formatCEP } from '../utils/format';
import { fetchAddressByCEP } from '../services/cep.service';
import { spacing, borderRadius, typography } from '../constants/theme';

export default function ClientFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { createClient, updateClient, clients } = useClients();
  const { theme } = useTheme();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = Boolean(params.id);

  useEffect(() => {
    if (isEditing && params.id) {
      const client = clients.find(c => c.id === Number(params.id));
      if (client) {
        setName(client.name);
        setPhone(client.phone || '');
        setEmail(client.email || '');
        setDocument(client.document || '');
        setNotes(client.notes || '');
        // Parse address if stored as JSON
        if (client.address) {
          try {
            const addr = JSON.parse(client.address);
            setCep(addr.cep || '');
            setStreet(addr.street || '');
            setNumber(addr.number || '');
            setComplement(addr.complement || '');
            setNeighborhood(addr.neighborhood || '');
            setCity(addr.city || '');
            setState(addr.state || '');
          } catch {
            // If address is plain string, keep it simple
            setStreet(client.address);
          }
        }
        setLatitude(client.latitude);
        setLongitude(client.longitude);
      }
    }
  }, [isEditing, params.id]);

  const handleCEPLookup = async (cepValue: string) => {
    const formatted = formatCEP(cepValue);
    setCep(formatted);

    const cleaned = cepValue.replace(/\D/g, '');
    if (cleaned.length === 8) {
      setLoadingCEP(true);
      const addressData = await fetchAddressByCEP(cleaned);
      setLoadingCEP(false);

      if (addressData) {
        setStreet(addressData.street);
        setNeighborhood(addressData.neighborhood);
        setCity(addressData.city);
        setState(addressData.state);
      } else {
        Alert.alert('CEP não encontrado', 'Não foi possível encontrar o endereço para este CEP.');
      }
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setPhone(formatted);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleDocumentChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.length <= 11 ? formatCPF(value) : formatCNPJ(value);
    setDocument(formatted);
    if (errors.document) {
      setErrors(prev => ({ ...prev, document: '' }));
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (phone && !validatePhone(phone)) {
      newErrors.phone = 'Telefone inválido';
    }

    if (email && !validateEmail(email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (document) {
      const cleaned = document.replace(/\D/g, '');
      if (cleaned.length === 11 && !validateCPF(document)) {
        newErrors.document = 'CPF inválido';
      } else if (cleaned.length === 14 && !validateCNPJ(document)) {
        newErrors.document = 'CNPJ inválido';
      } else if (cleaned.length !== 11 && cleaned.length !== 14) {
        newErrors.document = 'Documento inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const addressData = {
        cep: cep.trim(),
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
      };

      const hasAddress = Object.values(addressData).some(v => v);
      const addressString = hasAddress ? JSON.stringify(addressData) : undefined;

      const clientData = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        document: document.trim() || undefined,
        address: addressString,
        latitude,
        longitude,
        notes: notes.trim() || undefined,
      };

      if (isEditing && params.id) {
        await updateClient(Number(params.id), clientData);
        Alert.alert('Sucesso', 'Cliente atualizado com sucesso!');
      } else {
        await createClient(clientData);
        Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!');
      }

      router.back();
    } catch (error) {
      console.error('Error saving client:', error);
      Alert.alert('Erro', 'Não foi possível salvar o cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isEditing ? 'Editar Cliente' : 'Novo Cliente',
          headerBackTitle: 'Voltar',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            {/* Basic Information */}
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Informações Básicas
              </Text>

              <Input
                label="Nome *"
                placeholder="Nome completo do cliente"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                error={errors.name}
              />

              <Input
                label="Telefone"
                placeholder="(00) 00000-0000"
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                error={errors.phone}
              />

              <Input
                label="E-mail"
                placeholder="cliente@email.com"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Input
                label="CPF/CNPJ"
                placeholder="000.000.000-00"
                value={document}
                onChangeText={handleDocumentChange}
                keyboardType="number-pad"
                error={errors.document}
              />
            </View>

            {/* Address */}
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Endereço
              </Text>

              <Input
                label="CEP"
                placeholder="00000-000"
                value={cep}
                onChangeText={handleCEPLookup}
                keyboardType="number-pad"
                maxLength={9}
                rightIcon={
                  loadingCEP ? (
                    <Ionicons name="sync" size={20} color={theme.colors.primary} />
                  ) : undefined
                }
              />

              <Input
                label="Rua/Avenida"
                placeholder="Nome da rua"
                value={street}
                onChangeText={setStreet}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Número"
                    placeholder="123"
                    value={number}
                    onChangeText={setNumber}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ flex: 2, marginLeft: spacing.sm }}>
                  <Input
                    label="Complemento"
                    placeholder="Apto, sala, bloco..."
                    value={complement}
                    onChangeText={setComplement}
                  />
                </View>
              </View>

              <Input
                label="Bairro"
                placeholder="Nome do bairro"
                value={neighborhood}
                onChangeText={setNeighborhood}
              />

              <View style={styles.row}>
                <View style={{ flex: 2 }}>
                  <Input
                    label="Cidade"
                    placeholder="Nome da cidade"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Input
                    label="Estado"
                    placeholder="UF"
                    value={state}
                    onChangeText={setState}
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            </View>

            {/* Map */}
            {street && city && (
              <AddressMap
                address={`${street}, ${number}, ${city}, ${state}`}
                latitude={latitude}
                longitude={longitude}
                onLocationChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
                editable
              />
            )}

            {/* Notes */}
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Input
                label="Observações"
                placeholder="Informações adicionais sobre o cliente..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                style={styles.textArea}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title={isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              onPress={handleSubmit}
              loading={loading}
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
    gap: spacing.md,
  },

  section: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },

  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },

  row: {
    flexDirection: 'row',
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  footer: {
    padding: spacing.lg,
  },
});
