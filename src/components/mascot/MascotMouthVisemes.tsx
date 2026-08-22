// src/components/mascot/MascotMouthVisemes.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Ellipse } from 'react-native-svg';
import { VisemeType } from '../../engine/lipSyncEngine';

interface MascotMouthVisemesProps {
  viseme: VisemeType;
  width?: number;
  height?: number;
  themeColor?: string;
}

export const MascotMouthVisemes: React.FC<MascotMouthVisemesProps> = ({
  viseme,
  width = 24,
  height = 16,
  themeColor = '#292524',
}) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 24 16">
        {viseme === 'REST' && (
          <Path
            d="M 6 8 Q 12 11 18 8"
            fill="none"
            stroke={themeColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}

        {viseme === 'AA_AH' && (
          <Path
            d="M 5 6 Q 12 4 19 6 Q 19 13 12 14 Q 5 13 5 6 Z"
            fill="#C2410C"
            stroke={themeColor}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}

        {viseme === 'EE_EH' && (
          <Path
            d="M 4 8 Q 12 6 20 8 Q 18 12 12 12 Q 6 12 4 8 Z"
            fill="#C2410C"
            stroke={themeColor}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}

        {viseme === 'OH_OO' && (
          <Ellipse
            cx="12"
            cy="8"
            rx="4.5"
            ry="5.5"
            fill="#C2410C"
            stroke={themeColor}
            strokeWidth="2"
          />
        )}

        {viseme === 'SMILE' && (
          <Path
            d="M 4 6 Q 12 14 20 6"
            fill="none"
            stroke={themeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {viseme === 'SURPRISED' && (
          <Ellipse
            cx="12"
            cy="9"
            rx="6"
            ry="6"
            fill="#C2410C"
            stroke={themeColor}
            strokeWidth="2"
          />
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
