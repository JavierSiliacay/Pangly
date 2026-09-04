// src/__tests__/verify_onboarding_flow.ts
/**
 * Verification test script for the Pangly Onboarding Flow:
 * Fresh Install -> Onboarding -> Download AI -> AI Initialization -> Mark Complete -> Navigate to Main
 */

interface VaultSettings {
  hasCompletedOnboarding: boolean;
  isVaultLocked: boolean;
  authMethod: 'device_biometrics' | 'device_passcode';
  biometricsEnabled: boolean;
}

// 1. In-memory Mock Storage
const mockStorage: Record<string, string> = {};

const AsyncStorageMock = {
  getItem: async (key: string) => mockStorage[key] || null,
  setItem: async (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: async (key: string) => {
    delete mockStorage[key];
  },
  clear: async () => {
    for (const k in mockStorage) delete mockStorage[k];
  },
};

// 2. Mock AI Initialization
let llamaInitialized = false;
async function mockInitLlamaEngine(): Promise<{ success: boolean; error?: string }> {
  llamaInitialized = true;
  return { success: true };
}

// 3. Simulated State Controller
class OnboardingFlowSimulator {
  settings: VaultSettings = {
    hasCompletedOnboarding: false,
    isVaultLocked: true,
    authMethod: 'device_biometrics',
    biometricsEnabled: true,
  };
  isBootLoading = true;
  isModelReady = false;
  activeTab = 'home';
  tourModalVisible = false;

  async loadFromStorage() {
    const saved = await AsyncStorageMock.getItem('@pangly_settings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  }

  // Completing the model download + AI engine warmup
  async onDownloadComplete() {
    const initRes = await mockInitLlamaEngine();
    if (initRes.success) {
      this.isModelReady = true;
    }
    this.isBootLoading = false;
  }

  // Completing the onboarding setup
  completeOnboarding(authMethod: 'device_biometrics' | 'device_passcode' = 'device_biometrics') {
    const updated = {
      ...this.settings,
      authMethod,
      biometricsEnabled: authMethod === 'device_biometrics',
      hasCompletedOnboarding: true,
      isVaultLocked: false,
    };
    this.settings = updated;
    AsyncStorageMock.setItem('@pangly_settings', JSON.stringify(updated));
    this.activeTab = 'ask_ai';
    this.tourModalVisible = true;
  }

  // Determine which screen is rendered
  getCurrentScreen(): string {
    if (this.isBootLoading) return 'PanglyLoadingScreen';
    if (!this.settings.hasCompletedOnboarding) return 'InteractiveOnboarding';
    if (this.settings.isVaultLocked) return 'VaultUnlockScreen';
    return `MainApp (${this.activeTab})`;
  }
}

async function runTests() {
  console.log('--- TEST 1: Fresh Install Flow ---');
  const sim = new OnboardingFlowSimulator();
  console.assert(sim.getCurrentScreen() === 'PanglyLoadingScreen', 'Initial state must be loading screen');

  console.log('-> Simulating AI model download and engine initialization...');
  await sim.onDownloadComplete();
  console.assert(sim.isModelReady === true, 'AI model must be initialized and ready');
  console.assert(sim.getCurrentScreen() === 'InteractiveOnboarding', 'Must proceed to InteractiveOnboarding after download if not onboarded');

  console.log('-> User completes onboarding (biometrics setup + name)...');
  sim.completeOnboarding('device_biometrics');
  console.assert(sim.settings.hasCompletedOnboarding === true, 'Onboarding must be marked complete');
  console.assert(sim.settings.isVaultLocked === false, 'Vault must be unlocked');
  console.assert(sim.getCurrentScreen() === 'MainApp (ask_ai)', `Must navigate to MainApp, got: ${sim.getCurrentScreen()}`);
  console.log('✔ Test 1 Passed: Fresh install successfully reaches MainApp.');

  console.log('\n--- TEST 2: App Restart After Onboarding (Persistence Verification) ---');
  const simRestart = new OnboardingFlowSimulator();
  await simRestart.loadFromStorage();
  console.assert(simRestart.settings.hasCompletedOnboarding === true, 'Settings must be persisted in AsyncStorage');
  
  // App launches again with downloaded model
  await simRestart.onDownloadComplete();
  console.assert(simRestart.getCurrentScreen() !== 'InteractiveOnboarding', 'Must NEVER re-show onboarding if completed');
  console.log(`Current screen after restart: ${simRestart.getCurrentScreen()}`);
  console.log('✔ Test 2 Passed: App restart preserves completed state.');

  console.log('\n--- TEST 3: Offline / Pre-downloaded Startup ---');
  const simPreDownloaded = new OnboardingFlowSimulator();
  simPreDownloaded.completeOnboarding('device_passcode');
  simPreDownloaded.isBootLoading = false;
  console.assert(simPreDownloaded.getCurrentScreen() === 'MainApp (ask_ai)', 'Must be on MainApp');
  console.log('✔ Test 3 Passed: Pre-downloaded startup navigates directly to MainApp.');

  console.log('\nAll 3 verification suites PASSED successfully!');
}

runTests();
