<p align="center">
  <img src="assets/icon.png" width="140" height="140" alt="Pangly App Icon" style="border-radius: 28px;" />
</p>

<h1 align="center">Pangly</h1>

<p align="center">
  <b>100% On-Device Private Second Brain & Encrypted Personal Vault</b>
</p>

<p align="center">
  <i>Store it. • Ask it. • Own it.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-10B981?style=for-the-badge&logo=android" alt="Platforms" />
  <img src="https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-SDK%2054-000000?style=for-the-badge&logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Privacy-100%25%20On--Device-10B981?style=for-the-badge&logo=lock" alt="Privacy" />
</p>

---

## 📖 Overview

**Pangly** is an encrypted, privacy-first personal vault paired with an intelligent on-device natural language query engine.

Instead of scattering driver's license photos across messaging apps, saving passwords in unencrypted notes, or uploading sensitive personal documents to third-party cloud servers, **Pangly keeps all data strictly isolated on your physical device**.

Ask **Pangly** questions in plain language—such as *"When is my next vehicle oil change?"* or *"Show my passport photo"*—and receive instant, verified answers and high-resolution document images in seconds.

<p align="center">
  <img src="assets/pangolin/pangly_loading.gif" width="220" alt="Pangly Loading Mascot" />
</p>

---

## Key Features

### 1. "Ask Pangly" On-Device Query Engine
* **Natural Language Processing**: Query saved records, renewal dates, account credentials, and vehicle logs conversationally.
* **Instant Photo & Document Lookup**: Retrieve high-resolution photos of ID cards and documents alongside structured text fields.
* **Sensitive Data Shielding**: Sensitive fields (passwords, PINs, license numbers) remain concealed behind phone-native biometric authentication (Face ID / Touch ID / Fingerprint).

### 2. Modular Personal Vault
* **Documents & IDs**: Store driver's licenses, passports, health insurance cards, and memberships with automated expiry countdowns.
* **Credentials & Passwords**: Offline password manager with category filtering, secure random password generator, and one-tap clipboard copy.
* **Vehicle Logbook**: Track mileage, maintenance history, and calculate upcoming service intervals.
* **Private Notes**: Encrypted scratchpad for sensitive notes and emergency information.
* **Automated Reminders**: Built-in scheduler for document renewals and vehicle maintenance deadlines.

### 3. Local Security Architecture
* **Zero Cloud Dependence**: No external servers, no tracking endpoints, and no cloud backups.
* **Hardware-Backed Biometrics**: Direct integration with system-level biometric authentication APIs.
* **Isolated File Sandbox**: Document photos are stored in app-isolated directories, completely hidden from the public device photo gallery.
* **Master Recovery Phrase**: Offline recovery key format for independent vault restoration.

---

## Tech Stack

* **Core Framework**: React Native (0.81.5) with Expo (SDK 54)
* **Language**: TypeScript (Strict Mode)
* **State & Persistence**: React Context API with encrypted local storage
* **Authentication**: expo-local-authentication (Hardware Biometrics)
* **Storage & Media**: expo-image-picker, expo-file-system
* **Vector Icons & UI**: Lucide Icons, React Native Native Animated Driver

---

## Getting Started

### Prerequisites
* Node.js (v18 or higher)
* npm or yarn
* Expo Go app on an iOS / Android device (or Android Studio emulator)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/JavierSiliacay/Pangly.git
   cd Pangly
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start -c
   ```

4. **Run on a device / emulator**:
   * **Android Emulator / Device**: Press `a` in the terminal.
   * **iOS Simulator**: Press `i` in the terminal.
   * **Physical Phone**: Scan the terminal QR code using the Expo Go application.

---

## Project Structure

```
Pangly/
├── assets/                  # Icons, splash screens, and mascot assets
│   ├── icon.png             # Master 1024x1024 transparent app icon
│   └── pangolin/            # Animation frames and character assets
├── src/
│   ├── components/          # Reusable UI components and modals
│   │   ├── PanglyLoadingScreen.tsx
│   │   ├── BiometricAuthModal.tsx
│   │   └── mascot/          # Mascot animation and character rigs
│   ├── context/             # Global VaultContext and local storage handlers
│   ├── engine/              # On-device natural language query engine
│   ├── screens/             # Core application screens
│   │   ├── AskPangly/       # AI Assistant interface
│   │   ├── Documents/       # Document and ID vault
│   │   ├── Credentials/     # Password manager
│   │   ├── Vehicles/        # Vehicle and maintenance logs
│   │   ├── Notes/           # Encrypted notes
│   │   ├── Reminders/       # Expiry and service alerts
│   │   ├── Onboarding/      # 4-Phase interactive onboarding
│   │   └── Settings/        # Biometric and export preferences
│   ├── services/            # Sandbox storage and device auth services
│   └── theme/               # Dark emerald luxury design system
├── app.json                 # Expo application manifest
├── package.json
└── tsconfig.json
```

---

## Privacy Policy & Philosophy

1. **No Account Requirement**: No email addresses, phone numbers, or account registrations.
2. **Zero Telemetry**: No tracking SDKs, third-party analytics, or crash-reporting servers.
3. **Local Encryption**: All parsing, rendering, and persistence occur strictly on the local client device.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
