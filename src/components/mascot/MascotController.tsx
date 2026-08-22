// src/components/mascot/MascotController.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MascotMood } from '../../engine/mascotStateMachine';
import { VisemeType } from '../../engine/lipSyncEngine';
import { MascotRig } from './MascotRig';
import { MascotDialogueBox } from './MascotDialogueBox';

interface MascotControllerProps {
  mood?: MascotMood;
  dialogue?: string;
  speakerName?: string;
  size?: number;
  onDialogueComplete?: () => void;
  actions?: { label: string; primary?: boolean; onPress: () => void }[];
  onMascotPress?: () => void;
  showDialogue?: boolean;
}

export const MascotController: React.FC<MascotControllerProps> = ({
  mood = 'idle',
  dialogue,
  speakerName,
  size = 140,
  onDialogueComplete,
  actions = [],
  onMascotPress,
  showDialogue = true,
}) => {
  return (
    <View style={styles.container}>
      {/* 2D Character Mascot */}
      <View style={styles.mascotWrapper}>
        <MascotRig
          mood={mood}
          size={size}
          onPress={onMascotPress}
        />
      </View>

      {/* Dialogue Box (Independent typing animation) */}
      {showDialogue && dialogue ? (
        <View style={styles.dialogueWrapper}>
          <MascotDialogueBox
            dialogue={dialogue}
            speakerName={speakerName}
            onComplete={onDialogueComplete}
            actions={actions}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  mascotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  dialogueWrapper: {
    width: '100%',
  },
});
