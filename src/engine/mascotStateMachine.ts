// src/engine/mascotStateMachine.ts

export type MascotMood =
  | 'idle'
  | 'welcome'
  | 'waving'
  | 'talking'
  | 'waiting'
  | 'thinking'
  | 'success'
  | 'celebrate'
  | 'concerned'
  | 'confused'
  | 'sleeping'
  | 'shield_guard';

export interface MascotAnimationParams { //arayko
  breathingRate: number;      // Seconds per breathing cycle
  breathingAmplitude: number; // Vertical translation px
  eyeBlinkInterval: number;   // Milliseconds between blinks
  headTiltAngle: number;      // Degrees
  earWiggle: boolean;
  orbGlowIntensity: number;   // 0.0 to 1.0
  orbRotationSpeed: number;   // Seconds per full spin
  armPose: 'rest' | 'wave' | 'hold_orb' | 'scratch_chin' | 'shield_curled' | 'cheer';
}

export const MOOD_CONFIGS: Record<MascotMood, MascotAnimationParams> = {
  idle: {
    breathingRate: 2.4,
    breathingAmplitude: 3,
    eyeBlinkInterval: 3400,
    headTiltAngle: 0,
    earWiggle: false,
    orbGlowIntensity: 0.6,
    orbRotationSpeed: 6.0,
    armPose: 'hold_orb',
  },
  welcome: {
    breathingRate: 1.8,
    breathingAmplitude: 5,
    eyeBlinkInterval: 2800,
    headTiltAngle: -6,
    earWiggle: true,
    orbGlowIntensity: 0.9,
    orbRotationSpeed: 3.5,
    armPose: 'wave',
  },
  waving: {
    breathingRate: 1.8,
    breathingAmplitude: 5,
    eyeBlinkInterval: 2800,
    headTiltAngle: -6,
    earWiggle: true,
    orbGlowIntensity: 0.9,
    orbRotationSpeed: 3.5,
    armPose: 'wave',
  },
  celebrate: {
    breathingRate: 1.2,
    breathingAmplitude: 8,
    eyeBlinkInterval: 2000,
    headTiltAngle: 0,
    earWiggle: true,
    orbGlowIntensity: 1.0,
    orbRotationSpeed: 2.0,
    armPose: 'cheer',
  },
  talking: {
    breathingRate: 1.6,
    breathingAmplitude: 4,
    eyeBlinkInterval: 3000,
    headTiltAngle: 3,
    earWiggle: true,
    orbGlowIntensity: 0.85,
    orbRotationSpeed: 4.0,
    armPose: 'hold_orb',
  },
  waiting: {
    breathingRate: 2.8,
    breathingAmplitude: 2,
    eyeBlinkInterval: 4000,
    headTiltAngle: 8,
    earWiggle: false,
    orbGlowIntensity: 0.5,
    orbRotationSpeed: 8.0,
    armPose: 'hold_orb',
  },
  thinking: {
    breathingRate: 1.4,
    breathingAmplitude: 2,
    eyeBlinkInterval: 5000,
    headTiltAngle: 12,
    earWiggle: false,
    orbGlowIntensity: 1.0,
    orbRotationSpeed: 1.2,
    armPose: 'scratch_chin',
  },
  success: {
    breathingRate: 1.2,
    breathingAmplitude: 8,
    eyeBlinkInterval: 2000,
    headTiltAngle: 0,
    earWiggle: true,
    orbGlowIntensity: 1.0,
    orbRotationSpeed: 2.0,
    armPose: 'cheer',
  },
  concerned: {
    breathingRate: 2.0,
    breathingAmplitude: 2,
    eyeBlinkInterval: 2500,
    headTiltAngle: -10,
    earWiggle: false,
    orbGlowIntensity: 0.4,
    orbRotationSpeed: 10.0,
    armPose: 'scratch_chin',
  },
  confused: {
    breathingRate: 2.2,
    breathingAmplitude: 3,
    eyeBlinkInterval: 2200,
    headTiltAngle: 15,
    earWiggle: true,
    orbGlowIntensity: 0.5,
    orbRotationSpeed: 8.0,
    armPose: 'scratch_chin',
  },
  sleeping: {
    breathingRate: 3.6,
    breathingAmplitude: 1.5,
    eyeBlinkInterval: 999999, // Eyes closed
    headTiltAngle: 5,
    earWiggle: false,
    orbGlowIntensity: 0.2,
    orbRotationSpeed: 14.0,
    armPose: 'shield_curled',
  },
  shield_guard: {
    breathingRate: 1.5,
    breathingAmplitude: 1,
    eyeBlinkInterval: 999999,
    headTiltAngle: 0,
    earWiggle: false,
    orbGlowIntensity: 0.95,
    orbRotationSpeed: 2.5,
    armPose: 'shield_curled',
  },
};
