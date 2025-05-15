import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Pressable,
  GestureResponderEvent,
  Platform,
  Alert,
} from 'react-native';
import { BattleSystem, BattleAction } from '../classes/BattleSystem';
import { Creature } from '../classes/battle';
import { TrashMonsterFactory } from '../classes/monsters';

// DiamondButton component from your code
interface DiamondButtonProps {
  label: string;
  onPress?: () => void;
  style?: any;
  disabled?: boolean;
}

const COMMAND_UI = require('../assets/ui/Command_UI.png');
const DIAMOND_SIZE = 110;

const DiamondButton: React.FC<DiamondButtonProps> = ({ label, onPress, style, disabled }) => {
  const handlePress = (e: GestureResponderEvent) => {
    if (disabled) return;
    const { locationX, locationY } = e.nativeEvent;
    const center = DIAMOND_SIZE / 2;
    if (Math.abs(locationX - center) + Math.abs(locationY - center) <= center) {
      onPress && onPress();
    }
  };

  return (
    <Pressable onPress={handlePress} style={style}>
      <ImageBackground 
        source={COMMAND_UI} 
        style={[
          styles.diamondBackground,
          disabled && styles.disabledDiamond
        ]}
      >
        <Text style={[styles.diamondText, disabled && styles.disabledText]}>
          {label}
        </Text>
      </ImageBackground>
    </Pressable>
  );
};

interface BattleUIProps {
  playerPet: Creature;
  enemy?: Creature;
  onBattleEnd?: (won: boolean) => void;
  navigation?: any;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BATTLE_BG = require('../assets/ui/Battle_background.png');

// Import the monster image mapping
const monsterImages = {
  canstruct: require('../assets/sprites/Trash_Monsters/Cans-Truct.png'),
  paper_phantom: require('../assets/sprites/Trash_Monsters/Paper_Phantom.png'),
  greeze_glob: require('../assets/sprites/Trash_Monsters/Greeze_Glob.png')
};

// Import companion images
const petImages = {
  Owlleaf: require('../assets/sprites/Companions/Owlleaf.png'),
  Cubble: require('../assets/sprites/Companions/Cubble.png'),
  Meowmblebee: require('../assets/sprites/Companions/Meowmblebee.png'),
  default: require('../assets/sprites/Companions/Owlleaf.png') // Fallback
};

// Helper function to get monster image based on enemy type
const getMonsterImage = (enemy: Creature) => {
  console.log('Enemy type:', enemy.name, 'Original trash type:', enemy.originalTrashType);
  
  if (enemy.originalTrashType === 'can_trash') {
    return monsterImages.canstruct;
  } else if (enemy.originalTrashType === 'paper_trash') {
    return monsterImages.paper_phantom;
  } else if (enemy.originalTrashType === 'organic_trash') {
    return monsterImages.greeze_glob;
  }
  
  // Default fallback - use canstruct for recyclable types
  console.log('Using default monster image for:', enemy.name);
  return monsterImages.canstruct;
};

// Helper function to get pet image
const getPetImage = (pet: Creature) => {
  console.log('Pet name:', pet.name);
  
  if (pet.name === 'Owlleaf') {
    return petImages.Owlleaf;
  } else if (pet.name === 'Cubble') {
    return petImages.Cubble;
  } else if (pet.name === 'Meowmblebee') {
    return petImages.Meowmblebee;
  }
  
  // Default fallback
  console.log('Using default pet image for:', pet.name);
  return petImages.default;
};

export const BattleUI: React.FC<BattleUIProps> = ({ playerPet, enemy: providedEnemy, onBattleEnd, navigation }) => {
  const [battleSystem, setBattleSystem] = useState<BattleSystem | null>(null);
  const [enemy, setEnemy] = useState<Creature | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [showSkillMenu, setShowSkillMenu] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize battle
  useEffect(() => {
    // Use the provided enemy or generate a random one if not provided
    let battleEnemy;
    
    if (providedEnemy) {
      battleEnemy = providedEnemy;
    } else {
      battleEnemy = [
        TrashMonsterFactory.createCanstruct,
        TrashMonsterFactory.createPaperPhantom,
        TrashMonsterFactory.createGreezeGlob
      ][Math.floor(Math.random() * 3)](Math.max(1, Math.floor(playerPet.level * 0.8)));
    }

    setEnemy(battleEnemy);
    const battle = new BattleSystem(playerPet, battleEnemy);
    setBattleSystem(battle);
    setBattleLog([`A wild ${battleEnemy.name} appeared!`]);
  }, [playerPet, providedEnemy]);

  const executeAction = async (action: BattleAction) => {
    if (!battleSystem || !enemy || isProcessing) return;

    setIsProcessing(true);
    const newState = await battleSystem.executeAction(action);
    setBattleLog([...battleSystem.getBattleLog()]);
    setIsPlayerTurn(newState.isPlayerTurn);

    if (battleSystem.isGameOver()) {
      const winner = battleSystem.getWinner();
      const playerWon = winner === playerPet;
      
      setTimeout(() => {
        Alert.alert(
          playerWon ? 'Victory!' : 'Defeat!',
          playerWon 
            ? `You defeated the ${enemy.name}!` 
            : 'Your pet was defeated...',
          [{ text: 'OK', onPress: () => onBattleEnd?.(playerWon) }]
        );
      }, 1000);
    }

    setIsProcessing(false);

    // If it's enemy's turn, execute their action after a delay
    if (!newState.isPlayerTurn && !battleSystem.isGameOver()) {
      setTimeout(() => {
        const enemyAction: BattleAction = {
          type: enemy.currentMp >= 15 ? 'SKILL' : 'BASIC_ATTACK',
          skill: enemy.skills[Math.floor(Math.random() * enemy.skills.length)]
        };
        executeAction(enemyAction);
      }, 1500);
    }
  };

  const handleSkill = () => setShowSkillMenu(true);
  const handleRun = () => {
    Alert.alert(
      'Run Away?',
      'Are you sure you want to flee from battle?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: () => {
            setBattleLog([...battleLog, 'You ran away safely!']);
            setTimeout(() => onBattleEnd?.(false), 1000);
          }
        }
      ]
    );
  };

  if (!battleSystem || !enemy) return null;

  const renderHPBar = (creature: Creature) => {
    const hpPercentage = (creature.currentHp / creature.stats.hp) * 100;
    return (
      <View style={styles.hpBarContainer}>
        <Text style={styles.hpText}>{creature.name}</Text>
        <View style={styles.hpBarOuter}>
          <View 
            style={[
              styles.hpBarInner, 
              { width: `${hpPercentage}%` },
              hpPercentage < 20 ? styles.hpCritical : hpPercentage < 50 ? styles.hpWarning : styles.hpGood
            ]} 
          />
        </View>
        <Text style={styles.hpText}>{`${creature.currentHp}/${creature.stats.hp}`}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background with offset */}
      <ImageBackground source={BATTLE_BG} style={styles.background} />
      
      {/* UI content container - positioned above the background */}
      <View style={styles.contentContainer}>
        {/* Enemy Section */}
        <View style={styles.topHud}>
          {renderHPBar(enemy)}
          <Image source={getMonsterImage(enemy)} style={styles.enemyImg} />
        </View>

        {/* Player Pet Section */}
        <View style={styles.petSection}>
          <Image source={getPetImage(playerPet)} style={styles.petImg} />
          {renderHPBar(playerPet)}
        </View>

        {/* Battle Log */}
        <View style={styles.battleLog}>
          <Text style={styles.battleLogText}>
            {battleLog[battleLog.length - 1]}
          </Text>
        </View>

        {/* Command Menu */}
        {!showSkillMenu ? (
          <View style={styles.footer}>
            <View style={styles.diamondGrid}>
              <DiamondButton 
                label="DEFEND" 
                onPress={() => executeAction({ type: 'DEFEND' })}
                disabled={!isPlayerTurn || isProcessing}
                style={styles.diamondBtnTop} 
              />
              <View style={styles.diamondRow}>
                <DiamondButton 
                  label="SKILL" 
                  onPress={handleSkill}
                  disabled={!isPlayerTurn || isProcessing}
                  style={styles.diamondBtnLeft} 
                />
                <DiamondButton 
                  label="ATTACK" 
                  onPress={() => executeAction({ type: 'BASIC_ATTACK' })}
                  disabled={!isPlayerTurn || isProcessing}
                  style={styles.diamondBtnRight} 
                />
              </View>
              <DiamondButton 
                label="RUN" 
                onPress={handleRun}
                disabled={!isPlayerTurn || isProcessing}
                style={styles.diamondBtnBottom} 
              />
            </View>
          </View>
        ) : (
          <View style={styles.skillMenu}>
            {playerPet.skills.map((skill) => (
              <Pressable
                key={skill.name}
                style={[
                  styles.skillButton,
                  playerPet.currentMp < skill.mpCost && styles.disabledSkill
                ]}
                onPress={() => {
                  if (playerPet.currentMp >= skill.mpCost) {
                    setShowSkillMenu(false);
                    executeAction({ type: 'SKILL', skill });
                  }
                }}
                disabled={playerPet.currentMp < skill.mpCost || !isPlayerTurn || isProcessing}
              >
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillCost}>{`MP: ${skill.mpCost}`}</Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.backButton}
              onPress={() => setShowSkillMenu(false)}
            >
              <Text style={styles.backText}>BACK</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

const PIXEL_FONT = Platform.select({ ios: 'Courier', android: 'monospace' });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_W,
    height: SCREEN_H,
  },
  contentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  background: {
    position: 'absolute',
    width: SCREEN_W,
    height: SCREEN_H,
    resizeMode: 'cover',
    bottom: 0, // Background offset
  },
  topHud: {
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: 'flex-end',
  },
  hpBarContainer: {
    width: 160,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  hpBarOuter: {
    width: '100%',
    height: 10,
    backgroundColor: '#666',
    borderRadius: 5,
  },
  hpBarInner: {
    height: '100%',
    borderRadius: 5,
  },
  hpGood: { backgroundColor: '#4CAF50' },
  hpWarning: { backgroundColor: '#FFC107' },
  hpCritical: { backgroundColor: '#F44336' },
  hpText: {
    fontFamily: PIXEL_FONT,
    fontSize: 12,
    color: '#fff',
    marginBottom: 5,
  },
  enemyImg: {
    width: 120,
    height: 120,
    top: 210, 
    right: 40,
  },
  petSection: {
    marginHorizontal: 20,
    alignItems: 'flex-start',
  },
  petImg: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    top: 160, 
    left: 30,
  },
  battleLog: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    margin: 10,
  },
  battleLogText: {
    fontFamily: PIXEL_FONT,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  footer: {
    padding: 10,
  },
  diamondGrid: {
    alignItems: 'center',
  },
  diamondRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 240,
  },
  diamondBtnTop: { marginBottom: -45 },
  diamondBtnLeft: { marginRight: -45 },
  diamondBtnRight: { marginLeft: -45 },
  diamondBtnBottom: { marginTop: -45 },
  diamondBackground: {
    width: DIAMOND_SIZE,
    height: DIAMOND_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledDiamond: {
    opacity: 0.5,
  },
  diamondText: {
    fontFamily: PIXEL_FONT,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  disabledText: {
    color: '#999',
  },
  skillMenu: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  skillButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#2f855a',
    marginBottom: 10,
    borderRadius: 5,
  },
  disabledSkill: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  skillName: {
    fontFamily: PIXEL_FONT,
    color: '#fff',
    fontSize: 14,
  },
  skillCost: {
    fontFamily: PIXEL_FONT,
    color: '#90cdf4',
    fontSize: 14,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#4a5568',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  backText: {
    fontFamily: PIXEL_FONT,
    color: '#fff',
    fontSize: 14,
  },
}); 