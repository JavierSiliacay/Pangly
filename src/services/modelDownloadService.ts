// src/services/modelDownloadService.ts
// Internal service — handles AI setup download.
// NOTE: All user-facing strings use non-technical language per Pangly's UI copy policy.
// No model names, file formats, or library names are ever shown to the user.

import { AppState, AppStateStatus } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  showDownloadNotification,
  cancelDownloadNotification,
  requestNotificationPermission,
} from './downloadNotificationService';

// ─── Internal model config (never exposed to users) ────────────────────────

const HF_BASE = 'https://huggingface.co';

const MODELS = {
  agent: {
    url: `${HF_BASE}/Salesforce/xLAM-2-1b-fc-r-gguf/resolve/main/xLAM-2-1B-fc-r-Q4_K_M.gguf`,
    fileName: 'pangly_agent.gguf',       // Obfuscated on-disk name
    expectedSizeBytes: 986_048_192,     // ~986 MB
    displayName: 'Private AI Assistant',
    displayDesc: 'Preparing your personal life assistant...',
    sizeLabel: '986 MB',
  },
} as const;

type ModelKey = keyof typeof MODELS;

// ─── Download State ─────────────────────────────────────────────────────────

export type DownloadState =
  | 'not_downloaded'
  | 'downloading'
  | 'paused'
  | 'verifying'
  | 'ready'
  | 'error';

export interface ModelProgress {
  modelKey: ModelKey;
  state: DownloadState;
  progress: number;         // 0–1
  speedLabel: string;       // e.g. "3.2 MB/s"
  downloadedBytes: number;
  totalBytes: number;
  displayName: string;      // "Private AI Assistant" — no tech terms
  displayDesc: string;      // "Preparing your personal life assistant..."
  errorMessage?: string;    // User-friendly, no tech terms
}

export interface OverallProgress {
  phase: 1;                 // Single unified setup
  totalProgress: number;    // 0–1
  etaLabel: string;         // "~3 min remaining"
  models: Record<ModelKey, ModelProgress>;
}

// ─── Exponential backoff constants ──────────────────────────────────────────

const BACKOFF_DELAYS_MS = [5_000, 15_000, 30_000, 60_000];
const MAX_RETRIES = BACKOFF_DELAYS_MS.length;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getModelPath(key: ModelKey = 'agent'): string {
  return `${FileSystem.documentDirectory}${MODELS[key].fileName}`;
}

function formatSpeed(bytesPerSec: number, downloaded: number, total: number): string {
  const mbps = bytesPerSec / 1024 / 1024;
  const dlMb = downloaded / 1024 / 1024;
  const totalMb = total / 1024 / 1024;
  if (totalMb >= 1000) {
    const dlGb = dlMb / 1024;
    const totalGb = totalMb / 1024;
    return `${mbps.toFixed(1)} MB/s · ${dlGb.toFixed(2)} / ${totalGb.toFixed(2)} GB`;
  }
  return `${mbps.toFixed(1)} MB/s · ${dlMb.toFixed(0)} / ${totalMb.toFixed(0)} MB`;
}

function estimateEta(
  bytesPerSec: number,
  remaining: number
): string {
  if (bytesPerSec <= 0) return '';
  const secs = Math.ceil(remaining / bytesPerSec);
  if (secs < 60) return `~${secs}s remaining`;
  const mins = Math.ceil(secs / 60);
  return `~${mins} min remaining`;
}

// ─── Storage space check ─────────────────────────────────────────────────────

async function hasEnoughSpace(requiredBytes: number): Promise<boolean> {
  try {
    const info = await FileSystem.getFreeDiskStorageAsync();
    return info >= requiredBytes;
  } catch {
    return true; // Assume OK if check fails
  }
}

// ─── Core: download one model with resume + rate-limit retry ─────────────────

async function downloadModel(
  key: ModelKey,
  onProgress: (p: ModelProgress) => void,
  signal: { cancelled: boolean }
): Promise<boolean> {
  const model = MODELS[key];
  const destPath = getModelPath(key);
  const resumeKey = `@pangly_resume_${key}`;

  const report = (
    state: DownloadState,
    progress = 0,
    downloadedBytes = 0,
    speedLabel = '',
    errorMessage?: string
  ) =>
    onProgress({
      modelKey: key,
      state,
      progress,
      downloadedBytes,
      totalBytes: model.expectedSizeBytes,
      speedLabel,
      displayName: model.displayName,
      displayDesc: model.displayDesc,
      errorMessage,
    });

  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    if (signal.cancelled) return false;

    // 1. Re-read the file size from disk before EACH attempt
    const existingInfo = await FileSystem.getInfoAsync(destPath);
    const existingSize = existingInfo.exists ? existingInfo.size ?? 0 : 0;

    // 2. Check if already complete
    if (existingInfo.exists && existingSize >= model.expectedSizeBytes * 0.98) {
      report('ready', 1, model.expectedSizeBytes, '');
      await AsyncStorage.removeItem(resumeKey);
      return true;
    }

    // 3. Storage check
    const spaceNeeded = model.expectedSizeBytes - existingSize;
    const hasSpace = await hasEnoughSpace(spaceNeeded);
    if (!hasSpace) {
      report(
        'error',
        0,
        0,
        '',
        'Not enough storage space. Please free up some space and try again.'
      );
      return false;
    }

    try {
      report('downloading', existingSize / model.expectedSizeBytes, existingSize, 'Starting...');

      let totalDownloaded = existingSize;
      let lastBytes = existingSize;
      let lastTime = Date.now();
      let lastProgressUpdate = Date.now();

      // 4. Try loading resume data
      const savedResumeData = await AsyncStorage.getItem(resumeKey);
      let parsedResumeData: any = null;
      if (savedResumeData && existingSize > 0) {
        try {
          parsedResumeData = JSON.parse(savedResumeData);
        } catch {
          // invalid resume data, start fresh
        }
      }

      // If no valid resume data, ensure we delete partial corrupted file
      if (!parsedResumeData && existingSize > 0) {
        await FileSystem.deleteAsync(destPath, { idempotent: true });
        totalDownloaded = 0;
        lastBytes = 0;
      }

      let activeDownloadResumable: FileSystem.DownloadResumable | null = null;

      const appStateSubscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          if (activeDownloadResumable) {
            try {
              const savableData = activeDownloadResumable.savable();
              await AsyncStorage.setItem(resumeKey, JSON.stringify(savableData));
            } catch (e) {
              // ignore
            }
          }
        }
      });

      const downloadResumable = FileSystem.createDownloadResumable(
        model.url,
        destPath,
        {
          cache: false,
        },
        (downloadProgress) => {
          if (signal.cancelled) {
            downloadResumable.pauseAsync().catch(() => {});
            return;
          }

          const { totalBytesWritten } = downloadProgress;
          totalDownloaded = totalBytesWritten;
          
          const now = Date.now();
          if (now - lastProgressUpdate > 500) {
            const elapsed = (now - lastTime) / 1000;
            const bytesDelta = totalDownloaded - lastBytes;
            const speedBps = elapsed > 0 ? bytesDelta / elapsed : 0;
            const progress = Math.min(totalDownloaded / model.expectedSizeBytes, 0.99);

            report(
              'downloading',
              progress,
              totalDownloaded,
              formatSpeed(speedBps, totalDownloaded, model.expectedSizeBytes)
            );

            // Save resume data periodically
            AsyncStorage.setItem(resumeKey, JSON.stringify(downloadResumable.savable())).catch(() => {});

            lastProgressUpdate = now;
            lastBytes = totalDownloaded;
            lastTime = now;
          }
        },
        parsedResumeData?.resumeData
      );

      activeDownloadResumable = downloadResumable;

      let result: FileSystem.FileSystemDownloadResult | undefined;
      try {
        result = parsedResumeData && parsedResumeData.resumeData
          ? await downloadResumable.resumeAsync()
          : await downloadResumable.downloadAsync();
      } finally {
        appStateSubscription.remove();
        activeDownloadResumable = null;
      }

      if (!result) {
        throw new Error('Download returned no result');
      }

      // Verify file size
      const finalInfo = await FileSystem.getInfoAsync(destPath);
      const finalSize = finalInfo.exists ? finalInfo.size ?? 0 : 0;

      if (finalSize < model.expectedSizeBytes * 0.98) {
        throw new Error(`File incomplete: ${finalSize} / ${model.expectedSizeBytes} bytes`);
      }

      report('verifying', 0.99, finalSize, 'Almost there, verifying setup...');
      await new Promise((r) => setTimeout(r, 800));

      await AsyncStorage.removeItem(resumeKey);
      report('ready', 1, finalSize, '');
      return true;

    } catch (err: any) {
      const msg = err?.message ?? '';

      const isRateLimited =
        msg.includes('429') ||
        msg.includes('Too Many Requests') ||
        msg.toLowerCase().includes('rate');

      if (isRateLimited && attempt < MAX_RETRIES) {
        const delaySec = BACKOFF_DELAYS_MS[attempt] / 1000;
        attempt++;

        let countdown = delaySec;
        while (countdown > 0 && !signal.cancelled) {
          const currentInfo = await FileSystem.getInfoAsync(destPath);
          const currentSize = currentInfo.exists ? currentInfo.size ?? 0 : 0;
          
          report(
            'downloading',
            currentSize / model.expectedSizeBytes,
            currentSize,
            `⏳ Preparing download, please wait... Retrying in ${Math.ceil(countdown)}s`
          );
          await new Promise((r) => setTimeout(r, 1000));
          countdown--;
        }
        continue;
      }
      
      if (attempt < MAX_RETRIES) {
        attempt++;
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }

      report(
        'error',
        0,
        0,
        '',
        'Setup couldn\'t complete. Check your connection and try again.'
      );
      return false;
    }
  }

  report(
    'error',
    0,
    0,
    '',
    'Setup couldn\'t complete. Check your connection and try again.'
  );
  return false;
}

// ─── Public API ──────────────────────────────────────────────────────────────

let cancelSignal = { cancelled: false };

/**
 * Check whether Pangly's AI assistant is already downloaded on device.
 */
export async function areModelsDownloaded(): Promise<boolean> {
  const path = getModelPath('agent');
  const info = await FileSystem.getInfoAsync(path);
  const size = info.exists ? info.size ?? 0 : 0;
  return size >= MODELS.agent.expectedSizeBytes * 0.98;
}

/**
 * Returns local file path for the AI agent component.
 */
export function getModelPaths(): { agent: string } {
  return {
    agent: getModelPath('agent'),
  };
}

/**
 * Downloads the on-device AI assistant component.
 * Fires onProgress with user-friendly status updates.
 */
export async function downloadModels(
  onProgress: (overall: OverallProgress) => void
): Promise<boolean> {
  await requestNotificationPermission();
  cancelSignal = { cancelled: false };

  const state: Record<ModelKey, ModelProgress> = {
    agent: {
      modelKey: 'agent',
      state: 'not_downloaded',
      progress: 0,
      downloadedBytes: 0,
      totalBytes: MODELS.agent.expectedSizeBytes,
      speedLabel: '',
      displayName: MODELS.agent.displayName,
      displayDesc: MODELS.agent.displayDesc,
    },
  };

  let lastNotificationTime = 0;

  const emit = () => {
    const activeModel = state.agent;
    const speedBps = parseFloat(activeModel.speedLabel.split(' ')[0]) * 1024 * 1024 || 0;
    const remaining = MODELS.agent.expectedSizeBytes * (1 - activeModel.progress);
    const etaLabel = estimateEta(speedBps, remaining);

    onProgress({
      phase: 1,
      totalProgress: activeModel.progress,
      etaLabel,
      models: { ...state },
    });

    const now = Date.now();
    if (now - lastNotificationTime > 2000 && activeModel.state === 'downloading') {
      const mbText = activeModel.speedLabel.split('·')[1]?.trim() || '';
      if (mbText) {
        showDownloadNotification(1, mbText, etaLabel);
        lastNotificationTime = now;
      }
    }
  };

  const agentOk = await downloadModel(
    'agent',
    (p) => {
      state.agent = p;
      emit();
    },
    cancelSignal
  );

  cancelDownloadNotification();
  return agentOk;
}

/**
 * Cancel an in-progress download.
 */
export function cancelDownload(): void {
  cancelSignal.cancelled = true;
  cancelDownloadNotification();
}

/**
 * Delete all downloaded AI components (for reset / storage reclaim).
 */
export async function deleteModels(): Promise<void> {
  cancelSignal.cancelled = true;
  for (const key of Object.keys(MODELS) as ModelKey[]) {
    const path = getModelPath(key);
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) {
      await FileSystem.deleteAsync(path, { idempotent: true });
    }
  }
}
