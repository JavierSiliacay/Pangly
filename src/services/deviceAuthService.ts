// src/services/deviceAuthService.ts

import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export interface DeviceAuthCapabilities {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportsFingerprint: boolean;
  supportsFaceRecognition: boolean;
  supportsIris: boolean;
  supportsDevicePasscode: boolean;
  methods: ('fingerprint' | 'facial_recognition' | 'iris' | 'device_passcode')[];
  primaryLabel: string;
}

/**
 * Detect available hardware authentication methods on the user's device
 */
export async function checkDeviceAuthCapabilities(): Promise<DeviceAuthCapabilities> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    const supportsFingerprint = supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
    const supportsFaceRecognition = supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    const supportsIris = supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS);

    const methods: ('fingerprint' | 'facial_recognition' | 'iris' | 'device_passcode')[] = [];
    if (supportsFingerprint) methods.push('fingerprint');
    if (supportsFaceRecognition) methods.push('facial_recognition');
    if (supportsIris) methods.push('iris');
    methods.push('device_passcode'); // OS device lockscreen fallback is standard

    let primaryLabel = 'Device PIN / Passcode';
    if (supportsFaceRecognition) primaryLabel = Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
    else if (supportsFingerprint) primaryLabel = Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';

    return {
      hasHardware,
      isEnrolled,
      supportsFingerprint,
      supportsFaceRecognition,
      supportsIris,
      supportsDevicePasscode: true,
      methods,
      primaryLabel,
    };
  } catch (e) {
    console.log('Error querying device auth capabilities:', e);
    return {
      hasHardware: false,
      isEnrolled: false,
      supportsFingerprint: false,
      supportsFaceRecognition: false,
      supportsIris: false,
      supportsDevicePasscode: true,
      methods: ['device_passcode'],
      primaryLabel: 'Device PIN / Passcode',
    };
  }
}

/**
 * Trigger the platform's official system authentication prompt
 * (Android BiometricPrompt / Keyguard, iOS FaceID / TouchID / Passcode)
 */
export async function authenticateWithDevice(options?: {
  promptMessage?: string;
  cancelLabel?: string;
  fallbackLabel?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: options?.promptMessage || 'Unlock your Pangly Vault',
      cancelLabel: options?.cancelLabel || 'Cancel',
      fallbackLabel: options?.fallbackLabel || 'Use Device PIN / Passcode',
      disableDeviceFallback: false, // Allows OS PIN/Passcode fallback
    });

    if (result.success) {
      return { success: true };
    }

    return {
      success: false,
      error: result.error || 'Authentication cancelled',
    };
  } catch (e: any) {
    console.log('Device auth error:', e);
    return {
      success: false,
      error: e?.message || 'Authentication error',
    };
  }
}
