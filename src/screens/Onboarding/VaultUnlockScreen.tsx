// src/screens/Onboarding/VaultUnlockScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { Fingerprint, ScanFace, Smartphone, ShieldCheck } from 'lucide-react-native';
import { MascotRig } from '../../components/mascot/MascotRig';
import { checkDeviceAuthCapabilities, DeviceAuthCapabilities } from '../../services/deviceAuthService';

export const VaultUnlockScreen: React.FC = () => {
  const { unlockVaultWithDevice, settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [deviceCaps, setDeviceCaps] = useState<DeviceAuthCapabilities | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      checkDeviceAuthCapabilities().then((caps) => {
        if (!isMounted) return;
        setDeviceCaps(caps);
      }).catch(() => {});
      handleDeviceUnlock();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleDeviceUnlock = async () => {
    setIsAuthenticating(true);
    setAuthError('');
    const success = await unlockVaultWithDevice('Unlock your Pangly private space');
    setIsAuthenticating(false);
    if (!success) {
      setAuthError('Authentication required to unlock your private space.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Mascot & Lock Status */}
      <View style={styles.topSection}>
        <View style={styles.mascotContainer}>
          <MascotRig mood="shield_guard" size={130} />
        </View>
        <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>Pangly is Locked</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Protected by your phone's security
        </Text>
      </View>

      {/* Main Action Section */}
      <View style={styles.authSection}>
        {authError ? (
          <Text style={[styles.authErrorMsg, { color: theme.danger }]}>{authError}</Text>
        ) : null}

        {/* Big Device Unlock Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleDeviceUnlock}
          disabled={isAuthenticating}
          style={[styles.bigUnlockBtn, { backgroundColor: theme.primary }]}
        >
          {isAuthenticating ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <>
              {deviceCaps?.supportsFaceRecognition ? (
                <ScanFace size={22} color="#000000" />
              ) : deviceCaps?.supportsFingerprint ? (
                <Fingerprint size={22} color="#000000" />
              ) : (
                <Smartphone size={22} color="#000000" />
              )}
              <Text style={styles.bigUnlockText}>
                Unlock with {deviceCaps?.primaryLabel || 'Phone Security'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Privacy Reassurance */}
      <View style={styles.bottomSection}>
        <ShieldCheck size={14} color={theme.textMuted} />
        <Text style={[styles.privacyNote, { color: theme.textMuted }]}>
          100% on-device • No passwords sent to any server
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 48,
    alignItems: 'center',
  },
  topSection: {
    alignItems: 'center',
    marginTop: 30,
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  authSection: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  authErrorMsg: {
    fontSize: 13,
    textAlign: 'center',
  },
  bigUnlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    height: 54,
    borderRadius: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bigUnlockText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  privacyNote: {
    fontSize: 12,
  },
});
