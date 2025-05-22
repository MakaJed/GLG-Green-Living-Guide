import React from 'react';
import { Pressable, Text, ImageBackground, StyleSheet, View } from 'react-native';

interface DiamondButtonProps {
  label: string;
  onPress?: () => void;
  style?: any;
  disabled?: boolean;
}

const COMMAND_UI = require('../assets/ui/Command_UI.png');
const DIAMOND_SIZE = 110;

export const DiamondButton: React.FC<DiamondButtonProps> = ({ label, onPress, style, disabled }) => {
  return (
    <View style={[styles.container, style]}>
      <Pressable 
        onPress={() => !disabled && onPress && onPress()}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
          disabled && styles.disabled
        ]}
        hitSlop={20}
      >
        <ImageBackground 
          source={COMMAND_UI} 
          style={styles.background}
          resizeMode="contain"
        >
          <Text style={[styles.text, disabled && styles.disabledText]}>
            {label}
          </Text>
        </ImageBackground>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: DIAMOND_SIZE,
    height: DIAMOND_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  background: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#888',
  },
}); 