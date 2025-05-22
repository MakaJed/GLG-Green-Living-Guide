import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ExpBarProps {
  currentExp: number;
  expNeeded: number;
  level: number;
  label?: string;
}

export const ExpBar: React.FC<ExpBarProps> = ({ currentExp, expNeeded, level, label }) => {
  const percentage = (currentExp / expNeeded) * 100;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.barContainer}>
        <View style={[styles.bar, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.text}>{`Lv.${level}`}</Text>
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
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#9C27B0',
  },
  text: {
    width: 60,
    color: '#fff',
    fontSize: 14,
    textAlign: 'right',
    marginLeft: 10,
  },
}); 