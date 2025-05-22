import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface BattleLogProps {
  messages: string[];
}

export const BattleLog: React.FC<BattleLogProps> = ({ messages }) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {messages.map((message, index) => (
          <Text key={index} style={styles.message}>
            {message}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 10,
    margin: 10,
  },
  scrollView: {
    flex: 1,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
}); 