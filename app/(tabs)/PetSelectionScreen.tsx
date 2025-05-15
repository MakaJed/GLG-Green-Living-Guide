import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { RouteProp } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PetSelection'>;
  route: RouteProp<RootStackParamList, 'PetSelection'>;
};

const pets = [
  {
    name: 'Owlleaf',
    image: require('../../assets/sprites/Companions/Owlleaf.png'),
  },
  {
    name: 'Cubble',
    image: require('../../assets/sprites/Companions/Cubble.png'),
  },
  {
    name: 'Meowmblebee',
    image: require('../../assets/sprites/Companions/Meowmblebee.png'),
  },
];

export default function PetSelectionScreen({ navigation, route }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const enemy = route.params?.enemy;
  
  // Debug log to check if enemy is received correctly
  useEffect(() => {
    console.log('PetSelectionScreen received enemy:', enemy);
  }, [enemy]);

  const handleStart = () => {
    if (selected) {
      console.log('Navigating to Battle with pet:', selected, 'and enemy:', enemy);
      navigation.navigate('Battle', { 
        pet: selected,
        enemy: enemy
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CHOOSE YOUR PET</Text>

      <View style={styles.row}>
        {pets.map((p) => (
          <TouchableOpacity
            key={p.name}
            style={[
              styles.petCard,
              selected === p.name && styles.selectedCard,
            ]}
            onPress={() => setSelected(p.name)}
          >
            <Image source={p.image} style={styles.petImage} />
            <Text style={styles.petName}>{p.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.startBtn, !selected && styles.disabledBtn]}
        onPress={handleStart}
        disabled={!selected}
      >
        <Text style={styles.startText}>
          {selected ? 'START BATTLE' : 'SELECT A PET'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const PIXEL_FONT = Platform.select({
  ios: 'Courier',
  android: 'monospace',
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c9f5d1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontFamily: PIXEL_FONT,
    fontSize: 18,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  petCard: {
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#205c3b',
    padding: 10,
    borderRadius: 8,
  },
  selectedCard: {
    backgroundColor: 'rgba(32,92,59,0.2)',
  },
  petImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  petName: {
    fontFamily: PIXEL_FONT,
    marginTop: 5,
  },
  startBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  disabledBtn: {
    backgroundColor: '#a5d6a7',
  },
  startText: {
    fontFamily: PIXEL_FONT,
    color: '#fff',
  },
}); 