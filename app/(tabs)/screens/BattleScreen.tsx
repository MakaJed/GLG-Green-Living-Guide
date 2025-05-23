import React, { useEffect } from 'react';
import { View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { RouteProp } from '@react-navigation/native';
import { BattleUI } from '../../../components/BattleUI';
import { Creature, EcoType } from '../../../classes/battle';
import { RECYCLABLE_SKILLS, COMPOSTABLE_SKILLS, HAZARDOUS_SKILLS, TrashMonsterFactory } from '../../../classes/monsters';


type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Battle'>;
  route: RouteProp<RootStackParamList, 'Battle'>;
};

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
  // Safely extract pet name from params with fallback to default
  const petName = route.params?.pet || 'Owlleaf';
  
  // Debug logging
  useEffect(() => {
    console.log('BattleScreen received params:', route.params);
    console.log('Pet:', petName, 'Enemy:', route.params?.enemy);
  }, [route.params, petName]);
  
  // Safely get pet configuration with fallback to default (Owlleaf)
  const petConfig = PET_CONFIGURATIONS[petName as keyof typeof PET_CONFIGURATIONS] || PET_CONFIGURATIONS.Owlleaf;
  
  // Create player pet with the configuration
  const playerPet = new Creature(
    petName,
    petConfig.type,
    1,
    PET_BASE_STATS,
    petConfig.skills
  );

  // Safely handle the enemy parameter
  const enemyType = route.params.enemy || '';
  
  // Map all possible monster types to their factory functions
  const monsterMap: Record<string, () => Creature> = {
    // Metal-based monsters
    'canstruct': () => TrashMonsterFactory.createCanstruct(1),
    'sarcan': () => TrashMonsterFactory.createSarcan(1),
    'crunchor': () => TrashMonsterFactory.createCrunchor(1),
    
    // Paper-based monsters
    'phantompaper': () => TrashMonsterFactory.createPaperPhantom(1),
    'paper_phantom': () => TrashMonsterFactory.createPaperPhantom(1),
    
    // Food/Organic-based monsters
    'greezeglob': () => TrashMonsterFactory.createGreezeGlob(1),
    'greeze_glob': () => TrashMonsterFactory.createGreezeGlob(1),
    'gloofuud': () => TrashMonsterFactory.createGloofuud(1),
    'egglut': () => TrashMonsterFactory.createEgglut(1),
    'rotato': () => TrashMonsterFactory.createRotato(1),
    
    // Plastic-based monsters
    'jellstic': () => TrashMonsterFactory.createJellystic(1),
    'bottroll': () => TrashMonsterFactory.createBottroll(1),
    'cupkwek': () => TrashMonsterFactory.createCupkwek(1),
    'sssstrawpent': () => TrashMonsterFactory.createSssstrawpent(1),
    
    // Glass-based monsters
    'shardlass': () => TrashMonsterFactory.createShardlass(1),
    'jar': () => TrashMonsterFactory.createJar(1),
    
    // Electronic-based monsters
    'phonii': () => TrashMonsterFactory.createPhonii(1),
    'voltwing': () => TrashMonsterFactory.createVoltwing(1)
  };
  
  // Create the enemy based on the type, or use a random one if the type is not found
  let enemy;
  if (typeof enemyType === 'string' && monsterMap[enemyType.toLowerCase()]) {
    enemy = monsterMap[enemyType.toLowerCase()]();
  } else {
    // Random enemy if type not found or not specified
    const enemyFactories = Object.values(monsterMap);
    const randomEnemy = enemyFactories[Math.floor(Math.random() * enemyFactories.length)];
    enemy = randomEnemy();
  }

  const handleBattleEnd = (won: boolean) => {
    // Go back to the previous screen instead of creating a new screen
    // This ensures we return to the exact same game instance
    navigation.goBack();
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