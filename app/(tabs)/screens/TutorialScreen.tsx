import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { RouteProp } from '@react-navigation/native';


type TutorialScreenRouteProp = RouteProp<RootStackParamList, 'Tutorial'>;

type Props = {
    route: TutorialScreenRouteProp;
    navigation: NativeStackScreenProps<RootStackParamList, 'Tutorial'>['navigation'];
};

const PIXEL_FONT = Platform.select({
  ios: 'Courier',
  android: 'monospace',
});

export default function TutorialScreen({ navigation, route }: Props) {
    const { onTutorialComplete } = route.params;

    const finishTutorial = () => {
      if (onTutorialComplete) {
        onTutorialComplete(); // Notify Cutscene to resume dialog
      }

      navigation.navigate('PetSelection', {
        enemy: 'canstruct',
      });
    };


    const handleContinue = () => {
        navigation.navigate('PetSelection', {
        enemy: 'canstruct', // You can change this dynamically or randomly if needed
        });
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WELCOME TO ECO BATTLE!</Text>
      <Text style={styles.description}>
        Choose your eco-pet and fight against trash monsters threatening our environment.
        Each pet has special skills based on their eco-type: Compostable, Recyclable, or Hazardous.
      </Text>
      <Text style={styles.description}>
        Use strategy to win battles, learn about waste classification, and help save the planet!
      </Text>

      <TouchableOpacity style={styles.startBtn} onPress={finishTutorial}>
        <Text style={styles.startText}>START</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontFamily: PIXEL_FONT,
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#2e7d32',
  },
  description: {
    fontFamily: PIXEL_FONT,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    color: '#388e3c',
  },
  startBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 30,
  },
  startText: {
    fontFamily: PIXEL_FONT,
    color: '#fff',
    fontSize: 16,
  },
});
