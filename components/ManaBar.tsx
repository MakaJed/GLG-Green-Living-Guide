import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ManaBarProps {
  currentMp: number;
  maxMp: number;
  label?: string;
}

export const ManaBar: React.FC<ManaBarProps> = ({ currentMp, maxMp, label }) => {
  const percentage = (currentMp / maxMp) * 100;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.barContainer}>
        <View style={[styles.bar, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.text}>{`${currentMp}/${maxMp}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  label: {
    width: 80,
    color: '#fff',
    fontSize: 14,
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  text: {
    width: 60,
    color: '#fff',
    fontSize: 14,
    textAlign: 'right',
    marginLeft: 10,
  },
}); 