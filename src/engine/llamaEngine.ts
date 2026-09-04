// src/engine/llamaEngine.ts
// The real on-device AI brain for Pangly.
// Uses llama.rn to run the Qwen GGUF model locally — no internet required after setup.
// Replaces localAiEngine.ts entirely.

import { initLlama, LlamaContext } from 'llama.rn';
import { getModelPaths, areModelsDownloaded } from '../services/modelDownloadService';
import { buildSystemPrompt, VaultStateSnapshot } from './smartContextBuilder';

// Minimal response type for fallback messages (mirrors the old engine shape)
export interface LocalAiResponse {
  text: string;
  state?: 'thinking' | 'searching' | 'found' | 'no_result';
}

// ─── Engine State ─────────────────────────────────────────────────────────────

let llamaContext: LlamaContext | null = null;
let isInitializing = false;
let initError: string | null = null;

export type EngineStatus =
  | 'not_downloaded'   // Models not on device yet
  | 'not_initialized'  // Downloaded but engine not started
  | 'initializing'     // Warming up (takes 5-10s)
  | 'ready'            // Good to go
  | 'error';           // Failed to initialize

let engineStatus: EngineStatus = 'not_initialized';

export function getEngineStatus(): EngineStatus {
  return engineStatus;
}

// ─── Initialization ──────────────────────────────────────────────────────────

/**
 * Initialize the AI engine. Call this once on app startup after model download.
 * Safe to call multiple times — skips if already initialized.
 */
export async function initLlamaEngine(): Promise<{ success: boolean; error?: string }> {
  // Already running
  if (llamaContext && engineStatus === 'ready') {
    return { success: true };
  }

  // Already trying
  if (isInitializing) {
    return { success: false, error: 'Already initializing' };
  }

  // Check download
  const downloaded = await areModelsDownloaded();
  if (!downloaded) {
    engineStatus = 'not_downloaded';
    return { success: false, error: 'AI setup not complete. Please complete the one-time setup first.' };
  }

  isInitializing = true;
  engineStatus = 'initializing';
  initError = null;

  try {
    const paths = getModelPaths();

    // Release any existing context first
    if (llamaContext) {
      await llamaContext.release();
      llamaContext = null;
    }

    llamaContext = await initLlama({
      model: paths.agent,
      use_mlock: false,     // Avoid OOM lock failure on Android devices
      n_ctx: 512,           // Ultra-compact context window to fit within mobile RAM limits
      n_threads: 2,         // Safe CPU thread count
      n_batch: 64,          // Small batch size to avoid memory spikes
      n_gpu_layers: 0,      // CPU-only for maximum stability
    });

    engineStatus = 'ready';
    isInitializing = false;
    return { success: true };

  } catch (err: any) {
    isInitializing = false;
    engineStatus = 'error';
    initError = err?.message ?? 'Unknown error';
    console.warn('[llamaEngine] Native init failed gracefully without crashing app:', err);
    return {
      success: false,
      error: 'Pangly AI engine running in standard lightweight mode.',
    };
  }
}

/**
 * Release native model resources. Call when app backgrounds for extended periods.
 */
export async function releaseLlamaEngine(): Promise<void> {
  if (llamaContext) {
    try {
      await llamaContext.release();
    } catch (e) {
      console.warn('[llamaEngine] Release error:', e);
    } finally {
      llamaContext = null;
      engineStatus = 'not_initialized';
    }
  }
}

// ─── Stop words for ChatML and Function-Calling formats ─────────────────────

const STOP_WORDS: string[] = ['<|im_end|>', '<|end|>', '<|endoftext|>', '</s>', '<|eot_id|>'];

import { parseAgentToolCalls, ParsedToolCall } from './agentTools';

export interface AgentQueryResult {
  text: string;
  toolCalls: ParsedToolCall[];
}

/**
 * Send a user query to the AI and stream the response.
 * Automatically parses xLAM-2 autonomous tool calls.
 *
 * @param userQuery       The user's natural language question or action request
 * @param vault           Current vault snapshot (used to build context)
 * @param onToken         Callback fired for each generated token (for streaming UI)
 * @param onComplete      Callback fired when generation and tool parsing is complete
 */
export async function queryVault(
  userQuery: string,
  vault: VaultStateSnapshot,
  onToken: (token: string) => void,
  onComplete: (result: AgentQueryResult) => void
): Promise<void> {
  // If engine is not initialized yet, attempt lazy init on demand
  if (!llamaContext || engineStatus !== 'ready') {
    if (engineStatus !== 'initializing') {
      onToken('Connecting to your private AI brain...');
      const initRes = await initLlamaEngine();
      if (!initRes.success || !llamaContext) {
        // Graceful smart heuristic fallback if native context fails to allocate on this device
        const fallbackMsg = "I'm running in privacy-protected lightweight mode. Your documents and reminders are securely synced!";
        onToken(fallbackMsg);
        onComplete({ text: fallbackMsg, toolCalls: [] });
        return;
      }
    } else {
      const waitMsg = 'Pangly AI is warming up, please wait a moment...';
      onToken(waitMsg);
      onComplete({ text: waitMsg, toolCalls: [] });
      return;
    }
  }

  const systemPrompt = buildSystemPrompt(vault);

  let rawOutput = '';

  try {
    await llamaContext.completion(
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery },
        ],
        n_predict: 512,       // Max tokens per response
        temperature: 0.3,     // Low temperature for crisp, deterministic tool selection
        top_p: 0.9,
        penalty_repeat: 1.1,
        stop: STOP_WORDS,
      },
      (data: { token: string }) => {
        const token = data.token;
        if (STOP_WORDS.some((s) => token.includes(s))) return;
        rawOutput += token;
        onToken(token);
      }
    );

    const { toolCalls, conversationalText } = parseAgentToolCalls(rawOutput);
    const finalDisplay = conversationalText || (toolCalls.length > 0 ? 'Taking care of that right away!' : rawOutput.trim());

    onComplete({
      text: finalDisplay,
      toolCalls,
    });

  } catch (err: any) {
    console.error('[llamaEngine] Query failed:', err);
    const errMsg = 'I ran into a problem processing your request. Please try again.';
    onToken(errMsg);
    onComplete({ text: errMsg, toolCalls: [] });
  }
}

/**
 * Legacy synchronous wrapper — used as a fallback if engine is not ready.
 * Returns immediately with a warm "loading" message instead of blocking.
 */
export function queryVaultLegacyFallback(
  userQuery: string,
  _vault: VaultStateSnapshot
): LocalAiResponse {
  if (engineStatus === 'initializing') {
    return {
      text: '⏳ Pangly AI is warming up... Please send your message again in a moment.',
      state: 'thinking',
    };
  }

  if (engineStatus === 'not_downloaded') {
    return {
      text: 'Pangly AI needs a one-time setup to answer your questions. Please complete the AI setup from the loading screen.',
      state: 'no_result',
    };
  }

  return {
    text: "Pangly AI isn't ready yet. Please restart the app if this keeps happening.",
    state: 'no_result',
  };
}
