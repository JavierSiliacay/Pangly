// src/components/BottomTabBar.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVault } from '../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../theme/colors';
import {
  Home,
  FolderLock,
  Bell,
  SlidersHorizontal,
} from 'lucide-react-native';

const MASCOT_EMBLEM = require('../../assets/pangolin/mascot_emblem.jpg');

export const BottomTabBar: React.FC = () => {
  const { activeTab, setActiveTab, settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;
  const insets = useSafeAreaInsets();

  // Dynamic bottom padding: handles iOS home bar gesture area vs Android 3-button bar flush alignment
  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 6 : 8);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'vault', label: 'Vault', icon: FolderLock },
    { id: 'ask_ai', label: 'Ask Pangly', isCenter: true },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.borderSubtle,
          paddingBottom: bottomInset,
        },
      ]}
    >
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive =
          activeTab === tab.id ||
          (tab.id === 'vault' && ['documents', 'credentials', 'vehicles', 'notes', 'profile'].includes(activeTab));

        if (tab.isCenter) {
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.85}
              style={styles.centerTabWrapper}
              onPress={() => setActiveTab('ask_ai')}
            >
              <View
                style={[
                  styles.centerEmblemContainer,
                  {
                    borderColor: isActive ? theme.primary : theme.border,
                    shadowColor: isActive ? theme.primary : '#000000',
                  },
                ]}
              >
                <Image
                  source={MASCOT_EMBLEM}
                  style={styles.centerEmblemImage}
                  resizeMode="cover"
                />
              </View>
              <Text
                style={[
                  styles.centerLabel,
                  {
                    color: isActive ? theme.primary : theme.textSecondary,
                    fontWeight: isActive ? '800' : '600',
                  },
                ]}
              >
                Ask Pangly
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.7}
            style={styles.tabButton}
            onPress={() => setActiveTab(tab.id)}
          >
            <View style={styles.iconContainer}>
              {IconComponent && (
                <IconComponent
                  size={22}
                  color={isActive ? theme.primary : theme.textMuted}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
              )}
              {isActive && (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: theme.primary },
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? theme.primary : theme.textMuted,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 6,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minHeight: 44,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 24,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -3,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  centerTabWrapper: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -4,
    minHeight: 44,
  },
  centerEmblemContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 5,
    backgroundColor: '#0F172A',
  },
  centerEmblemImage: {
    width: '100%',
    height: '100%',
  },
  centerLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
