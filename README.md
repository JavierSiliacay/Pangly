<p align="center">
  <img src="assets/icon.png" width="140" height="140" alt="Pangly App Icon" style="border-radius: 28px;" />
</p>

<h1 align="center">Pangly</h1>

<p align="center">
  <b>Your 100% On-Device Private Second Brain & Encrypted Personal Vault</b>
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

**Pangly** is an encrypted, privacy-first personal vault with an intelligent on-device AI assistant. 

Instead of scattering your driver's license photos in messaging apps, storing passwords in unencrypted notes, or uploading sensitive personal documents to third-party clouds, **Pangly keeps everything strictly on your phone**.

Ask **Pangly** anything in natural language—from *"When is my next vehicle oil change?"* to *"Show my passport photo"*—and receive instant, verified answers in seconds.

<p align="center">
  <img src="assets/pangolin/pangly_loading.gif" width="220" alt="Pangly Animated Mascot" />
</p>

---

## ✨ Key Features

### 🦔 1. "Ask Pangly" On-Device AI Assistant
* **Natural Language Queries**: Talk to Pangly naturally to look up saved records, expiry dates, account logins, and vehicle details.
* **Instant Photo & Document Retrieval**: Ask for an ID and immediately see the saved photo preview alongside the extracted data.
* **Sensitive Data Shielding**: Critical fields (passwords, PINs, SSNs) remain masked until unlocked with phone biometrics (Face ID / Fingerprint).

### 🗄️ 2. Smart Modular Vault
* 🪪 **Documents & IDs**: Store driver's licenses, passports, health cards, and membership badges with automatic expiry countdowns.
* 🔑 **Passwords & Logins**: An encrypted offline password manager with instant search, category filtering, and one-tap clipboard copy.
* 🚗 **Vehicle Logbook**: Track mileage, maintenance records, and calculate upcoming service intervals.
* 📝 **Private Notes**: Encrypted scratchpad for sensitive ideas, emergency codes, and records.
* ⏰ **Automated Reminders**: Built-in notification scheduler for document renewals and vehicle maintenance.

### 🛡️ 3. Absolute Privacy & Local Security
* **Zero Cloud Dependence**: No external servers, no tracking, and no analytics.
* **Hardware-Backed Biometrics**: Native integration with Face ID and Fingerprint sensors.
* **Private Image Sandbox**: Document photos are kept in app-isolated storage and never exposed to the public phone gallery.
* **Master Recovery Phrase**: Offline recovery key format for independent vault restoration.

---

## 🛠️ Tech Stack

* **Framework**: [React Native](https://reactnative.dev/) (v0.81.5) & [Expo](https://expo.dev/) (SDK 54)
* **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
* **State & Storage**: React Context API with encrypted `@react-native-async-storage/async-storage`
* **Security & Auth**: `expo-local-authentication` (Hardware Biometrics)
* **Camera & Files**: `expo-image-picker`, `expo-file-system`
* **Icons & Animation**: [Lucide Icons](https://lucide.dev/), React Native Native Animated Driver

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* [Expo Go](https://expo.dev/go) app on your iOS / Android device (or Android Studio emulator)

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

4. **Run on your device**:
   * **Android Emulator / Device**: Press `a` in the terminal.
   * **iOS Simulator**: Press `i` in the terminal.
   * **Physical Phone**: Scan the QR code using the **Expo Go** app.

---

## 📁 Project Structure

```
Pangly/
├── assets/                  # Icons, splash screens & animated mascot assets
│   ├── icon.png             # Master 1024x1024 transparent app icon
│   └── pangolin/            # Animated GIF frames & character poses
├── src/
│   ├── components/          # Reusable UI components & modals
│   │   ├── PanglyLoadingScreen.tsx
│   │   ├── BiometricAuthModal.tsx
│   │   └── mascot/          # Mascot animation & NPC rigs
│   ├── context/             # Global VaultContext & storage persistence
│   ├── engine/              # Local natural language parsing engine
│   ├── screens/             # Core application screens
│   │   ├── AskPangly/       # Conversational AI Assistant
│   │   ├── Documents/       # Document & ID vault
│   │   ├── Credentials/     # Password manager
│   │   ├── Vehicles/        # Vehicle & maintenance logbook
│   │   ├── Notes/           # Encrypted notes
│   │   ├── Reminders/       # Renewal & service alerts
│   │   ├── Onboarding/      # 4-Phase interactive onboarding
│   │   └── Settings/        # Security, biometric & export preferences
│   ├── services/            # Storage sandbox & device auth services
│   └── theme/               # Dark emerald luxury design tokens
├── app.json                 # Expo application manifest
├── package.json
└── tsconfig.json
```

---

## 🔒 Privacy Manifesto

Pangly was built on the core belief that your most personal information should belong exclusively to you.

1. **No Accounts Required**: No email signup, phone verification, or passwords sent over the internet.
2. **No Analytics**: Zero telemetry, tracking SDKs, or background analytics.
3. **Your Data Stays on Your Device**: All encryption, parsing, and storage happens 100% locally.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<p align="center">
  <sub>Built with 💚 for total digital privacy.</sub>
</p>
