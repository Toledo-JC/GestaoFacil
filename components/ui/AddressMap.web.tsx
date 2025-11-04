import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius, typography } from '../../constants/theme';

interface AddressMapProps {
  address: string;
  latitude?: number;
  longitude?: number;
  onLocationChange?: (latitude: number, longitude: number) => void;
  editable?: boolean;
}

export function AddressMap({
  address,
  latitude,
  longitude,
  onLocationChange,
  editable = false,
}: AddressMapProps) {
  const { theme } = useTheme();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
    latitude && longitude ? { latitude, longitude } : null
  );
  const [loading, setLoading] = useState(false);

  const geocodeAddress = async () => {
    if (!address.trim()) return;

    try {
      setLoading(true);
      const result = await Location.geocodeAsync(address);
      
      if (result.length > 0) {
        const { latitude: lat, longitude: lng } = result[0];
        setLocation({ latitude: lat, longitude: lng });
        onLocationChange?.(lat, lng);
      } else {
        Alert.alert('Localização não encontrada', 'Não foi possível encontrar o endereço no mapa.');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      Alert.alert('Erro', 'Não foi possível buscar a localização.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      // On web, use browser geolocation API
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setLocation({ latitude: lat, longitude: lng });
            onLocationChange?.(lat, lng);
            setLoading(false);
          },
          (error) => {
            console.error('Error getting location:', error);
            Alert.alert('Erro', 'Não foi possível obter a localização atual.');
            setLoading(false);
          }
        );
      } else {
        Alert.alert('Erro', 'Geolocalização não suportada neste navegador.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Erro', 'Não foi possível obter a localização atual.');
      setLoading(false);
    }
  };

  const openInMaps = () => {
    if (!location) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    Linking.openURL(url);
  };

  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Localização</Text>
        
        <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="location-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Nenhuma localização definida
          </Text>
          
          <View style={styles.buttons}>
            {address.trim() && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={geocodeAddress}
                disabled={loading}
              >
                <Ionicons name="search" size={20} color="#fff" />
                <Text style={styles.buttonText}>
                  {loading ? 'Buscando...' : 'Buscar no Mapa'}
                </Text>
              </TouchableOpacity>
            )}
            
            {editable && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.secondary }]}
                onPress={getCurrentLocation}
                disabled={loading}
              >
                <Ionicons name="navigate" size={20} color="#fff" />
                <Text style={styles.buttonText}>Usar Localização Atual</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Web - show address info with embedded Google Maps iframe
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>Localização</Text>
      
      <View style={[styles.webContainer, { 
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }]}>
        {/* Google Maps Embed */}
        <View style={styles.mapFrame}>
          <iframe
            width="100%"
            height="200"
            style={{ border: 0, borderRadius: '12px' }}
            loading="lazy"
            src={`https://www.google.com/maps/embed/v1/place?key=&q=${location.latitude},${location.longitude}&zoom=15`}
            title="Location Map"
          />
        </View>

        <View style={styles.webInfo}>
          <Ionicons name="location" size={24} color={theme.colors.primary} />
          <View style={styles.webText}>
            <Text style={[styles.webCoords, { color: theme.colors.text }]}>
              Lat: {location.latitude.toFixed(6)}
            </Text>
            <Text style={[styles.webCoords, { color: theme.colors.text }]}>
              Lng: {location.longitude.toFixed(6)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.linkButton, { backgroundColor: theme.colors.primary }]}
            onPress={openInMaps}
          >
            <Ionicons name="navigate" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },

  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },

  emptyState: {
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
  },

  emptyText: {
    ...typography.body,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },

  buttons: {
    gap: spacing.sm,
    width: '100%',
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },

  buttonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#fff',
  },

  webContainer: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },

  mapFrame: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },

  webInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  webText: {
    flex: 1,
  },

  webCoords: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },

  linkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
