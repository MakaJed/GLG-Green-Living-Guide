import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HealthBarProps {
  currentHp: number;
  maxHp: number;
  label?: string;
}

export const HealthBar: React.FC<HealthBarProps> = ({ currentHp, maxHp, label }) => {
  const percentage = (currentHp / maxHp) * 100;
  const barColor = percentage > 50 ? '#4CAF50' : percentage > 25 ? '#FFC107' : '#F44336';

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.barContainer}>
        <View style={[styles.bar, { width: `${percentage}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.text}>{`${currentHp}/${maxHp}`}</Text>
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
  },
  text: {
    width: 60,
    color: '#fff',
    fontSize: 14,
    textAlign: 'right',
    marginLeft: 10,
  },
}); 