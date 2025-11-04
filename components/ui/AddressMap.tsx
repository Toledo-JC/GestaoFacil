import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
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
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua localização.');
        return;
      }

      setLoading(true);
      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude: lat, longitude: lng } = currentLocation.coords;
      setLocation({ latitude: lat, longitude: lng });
      onLocationChange?.(lat, lng);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Erro', 'Não foi possível obter a localização atual.');
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = () => {
    if (!location) return;

    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?q=${location.latitude},${location.longitude}`,
      android: `${scheme}${location.latitude},${location.longitude}`,
    });

    if (url) {
      Linking.openURL(url);
    }
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

  // Mobile - show actual map with MapView
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>Localização</Text>
      
      <View style={[styles.mapContainer, { borderColor: theme.colors.border }]}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={location} />
        </MapView>

        <TouchableOpacity
          style={[styles.openButton, { backgroundColor: theme.colors.primary }]}
          onPress={openInMaps}
        >
          <Ionicons name="navigate" size={20} color="#fff" />
          <Text style={styles.buttonText}>Abrir no Maps</Text>
        </TouchableOpacity>
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

  mapContainer: {
    height: 200,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },

  map: {
    flex: 1,
  },

  openButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
});
