import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { RouteProp } from '@react-navigation/native';
import { BattleUI } from '../../../components/BattleUI';
import { Creature, EcoType } from '../../../classes/battle';
import {
  RECYCLABLE_SKILLS,
  COMPOSTABLE_SKILLS,
  HAZARDOUS_SKILLS,
  TrashMonsterFactory,
} from '../../../classes/monsters';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
type Props = {
  navigation: NavigationProps;
  route: RouteProp<RootStackParamList, 'TutorialScreen'>;
};

const PIXEL_FONT = Platform.select({
  ios: 'Courier',
  android: 'monospace',
});

const pets = [
  {
    name: 'Owlleaf',
    image: require('../../../assets/images/pet_sprite/owlleaf.png'),
  },
  {
    name: 'Cubble',
    image: require('../../../assets/images/pet_sprite/cubble.png'),
  },
  {
    name: 'Meowmblebee',
    image: require('../../../assets/images/pet_sprite/meowmblebee.png'),
  },
];

const PET_BASE_STATS = {
  hp: 120,
  mp: 100,
  attack: 18,
  defense: 12,
  speed: 15,
  resistance: 12,
};

const PET_CONFIGURATIONS = {
  Owlleaf: {
    type: EcoType.COMPOSTABLE,
    skills: [
      COMPOSTABLE_SKILLS.compostBlast,
      COMPOSTABLE_SKILLS.organicWrap,
      RECYCLABLE_SKILLS.paperCut,
    ],
  },
  Cubble: {
    type: EcoType.RECYCLABLE,
    skills: [
      RECYCLABLE_SKILLS.plasticCrush,
      RECYCLABLE_SKILLS.paperCut,
      COMPOSTABLE_SKILLS.organicWrap,
    ],
  },
  Meowmblebee: {
    type: EcoType.HAZARDOUS,
    skills: [
      HAZARDOUS_SKILLS.toxicSpill,
      HAZARDOUS_SKILLS.chemicalBurn,
      RECYCLABLE_SKILLS.plasticCrush,
    ],
  },
};

export default function TutorialScreen({ route }: Props) {
  const onTutorialComplete = route.params?.onTutorialComplete ?? (() => {});
  const [step, setStep] = useState<'intro' | 'select' | 'battle' | 'done'>('intro');
  const [selected, setSelected] = useState<string | null>(null);

  // Use Paper_Phantom as the fixed enemy for the tutorial battle
  const enemy = TrashMonsterFactory.createPaperPhantom(1);

  const handleStartTutorial = () => setStep('select');

  const handleStartBattle = () => {
    if (selected) setStep('battle');
  };

  const handleBattleEnd = async (won: boolean) => {
    // When the tutorial battle ends, save the selected pet as the main pet
    if (selected) {
      try {
        const petName = selected;
        const config = PET_CONFIGURATIONS[petName as keyof typeof PET_CONFIGURATIONS];
        const playerPet = new Creature(petName, config.type, 1, PET_BASE_STATS, config.skills);
        
        // Import the PetStorageService
        const { saveMainPet } = require('../../../services/PetStorageService');
        
        // Save the pet as the main pet that will be used throughout the game
        await saveMainPet(playerPet);
        console.log(`Saved ${petName} as the main pet`);
      } catch (error) {
        console.error('Error saving main pet:', error);
      }
    }
    
    setStep('done');
    onTutorialComplete?.();
  };

  const renderIntro = () => (
    <>
      <Text style={styles.title}>WELCOME TO ECO BATTLE!</Text>
      <Text style={styles.description}>
        Choose your eco-pet and fight against trash monsters threatening our environment.
      </Text>
      <Text style={styles.description}>
        Each pet has special skills based on their eco-type. Let’s begin!
      </Text>
      <TouchableOpacity style={styles.startBtn} onPress={handleStartTutorial}>
        <Text style={styles.startText}>START</Text>
      </TouchableOpacity>
    </>
  );

  const renderPetSelection = () => (
    <>
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
        onPress={handleStartBattle}
        disabled={!selected}
      >
        <Text style={styles.startText}>
          {selected ? 'START TUTORIAL BATTLE' : 'SELECT A PET'}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderBattle = () => {
    const petName = selected!;
    const config = PET_CONFIGURATIONS[petName as keyof typeof PET_CONFIGURATIONS];
    const playerPet = new Creature(petName, config.type, 1, PET_BASE_STATS, config.skills);

    return (
      <BattleUI
        playerPet={playerPet}
        enemy={enemy}
        onBattleEnd={handleBattleEnd}
      />
    );
  };

  const renderDone = () => (
    <Text style={styles.title}>Tutorial Complete!</Text>
  );

  return (
    <View style={styles.container}>
      {step === 'intro' && renderIntro()}
      {step === 'select' && renderPetSelection()}
      {step === 'battle' && renderBattle()}
      {step === 'done' && renderDone()}
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
  disabledBtn: {
    backgroundColor: '#a5d6a7',
  },
});
