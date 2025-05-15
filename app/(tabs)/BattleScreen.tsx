import React, { useEffect } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { BattleUI } from '../../components/BattleUI';
import { Creature, EcoType } from '../../classes/battle';
import { RECYCLABLE_SKILLS, COMPOSTABLE_SKILLS, HAZARDOUS_SKILLS, TrashMonsterFactory } from '../../classes/monsters';

type Props = NativeStackScreenProps<RootStackParamList, 'Battle'>;

// Define pet stats and skills
const PET_BASE_STATS = {
  hp: 120,
  mp: 100,
  attack: 18,
  defense: 12,
  speed: 15,
  resistance: 12
};

const PET_CONFIGURATIONS = {
  Owlleaf: {
    type: EcoType.COMPOSTABLE,
    skills: [
      COMPOSTABLE_SKILLS.compostBlast,
      COMPOSTABLE_SKILLS.organicWrap,
      RECYCLABLE_SKILLS.paperCut
    ]
  },
  Cubble: {
    type: EcoType.RECYCLABLE,
    skills: [
      RECYCLABLE_SKILLS.plasticCrush,
      RECYCLABLE_SKILLS.paperCut,
      COMPOSTABLE_SKILLS.organicWrap
    ]
  },
  Meowmblebee: {
    type: EcoType.HAZARDOUS,
    skills: [
      HAZARDOUS_SKILLS.toxicSpill,
      HAZARDOUS_SKILLS.chemicalBurn,
      RECYCLABLE_SKILLS.plasticCrush
    ]
  }
};

export default function BattleScreen({ route, navigation }: Props) {
  const { pet: petName } = route.params;
  const petConfig = PET_CONFIGURATIONS[petName as keyof typeof PET_CONFIGURATIONS];
  
  // Debug logging
  useEffect(() => {
    console.log('BattleScreen received params:', route.params);
    console.log('Pet:', petName, 'Enemy:', route.params.enemy);
  }, [route.params, petName]);

  const playerPet = new Creature(
    petName,
    petConfig.type,
    1,
    PET_BASE_STATS,
    petConfig.skills
  );

  // Create enemy monster based on enemy type in params, or random if not specified
  let enemy;
  if (route.params.enemy === 'canstruct') {
    enemy = TrashMonsterFactory.createCanstruct(1);
  } else if (route.params.enemy === 'paper_phantom') {
    enemy = TrashMonsterFactory.createPaperPhantom(1);
  } else if (route.params.enemy === 'greeze_glob') {
    enemy = TrashMonsterFactory.createGreezeGlob(1);
  } else {
    // Random enemy
    const enemies = [
      () => TrashMonsterFactory.createCanstruct(1),
      () => TrashMonsterFactory.createPaperPhantom(1),
      () => TrashMonsterFactory.createGreezeGlob(1)
    ];
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    enemy = randomEnemy();
  }

  const handleBattleEnd = (won: boolean) => {
    // Return to home screen when battle is over
    navigation.navigate('Home');
  };

  return (
    <View style={{ flex: 1 }}>
      <BattleUI
        playerPet={playerPet}
        enemy={enemy}
        onBattleEnd={handleBattleEnd}
        navigation={navigation}
      />
    </View>
  );
} 