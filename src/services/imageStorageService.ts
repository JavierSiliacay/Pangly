// src/services/imageStorageService.ts

import * as ImagePicker from 'expo-image-picker';
import { Paths, Directory, File } from 'expo-file-system';

const vaultDir = new Directory(Paths.document, 'vault_images');

// Ensure private sandboxed folder exists
function ensureDirExists() {
  if (!vaultDir.exists) {
    vaultDir.create();
  }
}

/**
 * Capture a photo with the device camera and store it privately inside Pangly's sandbox.
 * (Will NOT appear in public gallery or file folders).
 */
export async function captureDocumentPhoto(): Promise<{ uri: string } | null> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    ensureDirExists();
    const sourceUri = result.assets[0].uri;
    const fileName = `doc_${Date.now()}.jpg`;
    const targetFile = new File(vaultDir, fileName);

    const sourceFile = new File(sourceUri);
    sourceFile.copy(targetFile);

    return { uri: targetFile.uri };
  } catch (error) {
    console.error('Failed to capture document photo:', error);
    return null;
  }
}

/**
 * Import an image from the photo library and copy it into Pangly's private sandbox.
 */
export async function pickDocumentFromLibrary(): Promise<{ uri: string } | null> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    ensureDirExists();
    const sourceUri = result.assets[0].uri;
    const fileName = `doc_${Date.now()}.jpg`;
    const targetFile = new File(vaultDir, fileName);

    const sourceFile = new File(sourceUri);
    sourceFile.copy(targetFile);

    return { uri: targetFile.uri };
  } catch (error) {
    console.error('Failed to pick document photo:', error);
    return null;
  }
}

/**
 * Delete a private sandboxed document photo when a document is deleted.
 */
export async function deleteDocumentPhoto(uri: string): Promise<void> {
  try {
    if (uri) {
      const file = new File(uri);
      if (file.exists) {
        file.delete();
      }
    }
  } catch (error) {
    console.error('Failed to delete document photo:', error);
  }
}
