// App.tsx

import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { VaultProvider, useVault } from './src/context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from './src/theme/colors';

// Global Components
import { BottomTabBar } from './src/components/BottomTabBar';
import { BiometricAuthModal } from './src/components/BiometricAuthModal';
import { ClipboardToast } from './src/components/ClipboardToast';
import { ScannerModal } from './src/components/ScannerModal';
import { UniversalAddModal } from './src/components/UniversalAddModal';

import { PanglyLoadingScreen } from './src/components/PanglyLoadingScreen';
import { MascotTourModal } from './src/components/mascot/MascotTourModal';

// Screens
import { InteractiveOnboarding } from './src/screens/Onboarding/InteractiveOnboarding';
import { OnboardingFlow } from './src/screens/Onboarding/OnboardingFlow';
import { VaultUnlockScreen } from './src/screens/Onboarding/VaultUnlockScreen';
import { HomeScreen } from './src/screens/Home/HomeScreen';
import { AskPanglyScreen } from './src/screens/AskPangly/AskPanglyScreen';
import { VaultHubScreen, VaultSegment } from './src/screens/Vault/VaultHubScreen';
import { RemindersScreen } from './src/screens/Reminders/RemindersScreen';
import { GlobalSearchScreen } from './src/screens/Search/GlobalSearchScreen';
import { SettingsScreen } from './src/screens/Settings/SettingsScreen';

// Sub-Modals triggered from Universal Add
import { AddDocumentModal } from './src/screens/Documents/AddDocumentModal';
import { AddCredentialModal } from './src/screens/Credentials/AddCredentialModal';
import { AddVehicleModal } from './src/screens/Vehicles/AddVehicleModal';
import { AddMaintenanceModal } from './src/screens/Vehicles/AddMaintenanceModal';
import { NoteEditorModal } from './src/screens/Notes/NoteEditorModal';
import { AddReminderModal } from './src/screens/Reminders/AddReminderModal';

const MainAppContent: React.FC = () => {
  const { settings, activeTab, setActiveTab, setUniversalAddOpen, vehicles } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  // App Initial Boot Loading State
  const [isBootLoading, setIsBootLoading] = useState(true);

  // Fast add sub-modals
  const [addDocModal, setAddDocModal] = useState(false);
  const [addCredModal, setAddCredModal] = useState(false);
  const [addVehicleModal, setAddVehicleModal] = useState(false);
  const [addMaintModal, setAddMaintModal] = useState(false);
  const [addNoteModal, setAddNoteModal] = useState(false);
  const [addReminderModal, setAddReminderModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);

  const handleUniversalActionSelect = (actionId: string) => {
    switch (actionId) {
      case 'add_doc':
        setAddDocModal(true);
        break;
      case 'add_cred':
        setAddCredModal(true);
        break;
      case 'add_vehicle':
        setAddVehicleModal(true);
        break;
      case 'add_maint':
        setAddMaintModal(true);
        break;
      case 'add_note':
        setAddNoteModal(true);
        break;
      case 'add_reminder':
        setAddReminderModal(true);
        break;
      case 'add_profile':
        setActiveTab('vault');
        break;
    }
  };

  // 0. Initial App Launch Loading Screen
  if (isBootLoading) {
    return <PanglyLoadingScreen onFinish={() => setIsBootLoading(false)} />;
  }

  // 1. First-Time Onboarding (Interactive Mascot Setup)
  if (!settings.hasCompletedOnboarding) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
        <StatusBar barStyle={settings.theme === 'light' ? 'dark-content' : 'light-content'} />
        <InteractiveOnboarding onComplete={() => setShowTourModal(true)} />
      </SafeAreaView>
    );
  }

  // 2. Vault Locked Screen
  if (settings.isVaultLocked) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
        <StatusBar barStyle={settings.theme === 'light' ? 'dark-content' : 'light-content'} />
        <VaultUnlockScreen />
      </SafeAreaView>
    );
  }

  // Determine Vault segment if navigated directly to child domain
  const isVaultTab = ['vault', 'documents', 'credentials', 'vehicles', 'notes', 'profile'].includes(activeTab);
  const initialSegment: VaultSegment =
    activeTab === 'credentials'
      ? 'credentials'
      : activeTab === 'vehicles'
      ? 'vehicles'
      : activeTab === 'notes'
      ? 'notes'
      : activeTab === 'profile'
      ? 'profile'
      : 'documents';

  // 3. Main Unlocked Vault Navigation
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={settings.theme === 'light' ? 'dark-content' : 'light-content'} />

      {/* Screen Router */}
      <View style={styles.screenContainer}>
        {activeTab === 'home' && (
          <HomeScreen
            onOpenUniversalAdd={() => setUniversalAddOpen(true)}
          />
        )}
        {isVaultTab && <VaultHubScreen initialSegment={initialSegment} />}
        {activeTab === 'ask_ai' && <AskPanglyScreen />}
        {activeTab === 'reminders' && <RemindersScreen />}
        {activeTab === 'search' && <GlobalSearchScreen onBack={() => setActiveTab('home')} />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Bottom Navigation Bar */}
      <BottomTabBar />

      {/* Global Modals & Overlays */}
      <BiometricAuthModal />
      <ClipboardToast />
      <ScannerModal />
      <UniversalAddModal onSelectAction={handleUniversalActionSelect} />

      {/* Fast Add Sub-Modals */}
      <AddDocumentModal visible={addDocModal} onClose={() => setAddDocModal(false)} />
      <AddCredentialModal visible={addCredModal} onClose={() => setAddCredModal(false)} />
      <AddVehicleModal visible={addVehicleModal} onClose={() => setAddVehicleModal(false)} />
      <AddMaintenanceModal
        vehicleId={vehicles[0]?.id || 'veh-1'}
        vehicleName={vehicles[0] ? `${vehicles[0].make} ${vehicles[0].model}` : 'My Vehicle'}
        currentMileage={vehicles[0]?.mileage || 0}
        visible={addMaintModal}
        onClose={() => setAddMaintModal(false)}
      />
      <NoteEditorModal note={null} visible={addNoteModal} onClose={() => setAddNoteModal(false)} />
      <AddReminderModal visible={addReminderModal} onClose={() => setAddReminderModal(false)} />

      {/* Interactive Mascot Tour Walkthrough */}
      <MascotTourModal visible={showTourModal} onClose={() => setShowTourModal(false)} />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <VaultProvider>
        <MainAppContent />
      </VaultProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});
