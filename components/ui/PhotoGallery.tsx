import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius, typography } from '../../constants/theme';

interface PhotoGalleryProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  editable?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function PhotoGallery({
  photos,
  onChange,
  maxPhotos = 10,
  editable = true,
}: PhotoGalleryProps) {
  const { theme } = useTheme();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxPhotos - photos.length,
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map(asset => asset.uri);
        onChange([...photos, ...newPhotos].slice(0, maxPhotos));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para usar a câmera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        onChange([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  const removePhoto = (index: number) => {
    Alert.alert(
      'Remover foto',
      'Tem certeza que deseja remover esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            const newPhotos = photos.filter((_, i) => i !== index);
            onChange(newPhotos);
          },
        },
      ]
    );
  };

  const showAddOptions = () => {
    Alert.alert(
      'Adicionar foto',
      'Escolha uma opção',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galeria', onPress: pickImage },
        { text: 'Câmera', onPress: takePhoto },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        Fotos ({photos.length}/{maxPhotos})
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gallery}
      >
        {photos.map((photo, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.photoContainer, { borderColor: theme.colors.border }]}
            onPress={() => setSelectedPhoto(photo)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: photo }}
              style={styles.photo}
              contentFit="cover"
            />
            {editable && (
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
                onPress={() => removePhoto(index)}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}

        {editable && photos.length < maxPhotos && (
          <TouchableOpacity
            style={[styles.addButton, { borderColor: theme.colors.primary }]}
            onPress={showAddOptions}
          >
            <Ionicons name="camera-outline" size={32} color={theme.colors.primary} />
            <Text style={[styles.addText, { color: theme.colors.primary }]}>
              Adicionar
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Photo Viewer Modal */}
      <Modal
        visible={selectedPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedPhoto(null)}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPhoto(null)}
            >
              <Ionicons name="close-circle" size={40} color="#fff" />
            </TouchableOpacity>

            {selectedPhoto && (
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.fullImage}
                contentFit="contain"
              />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
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

  gallery: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },

  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },

  photo: {
    width: '100%',
    height: '100%',
  },

  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButton: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addText: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },

  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
