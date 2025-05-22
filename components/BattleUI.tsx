import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { BattleSystem, BattleAction } from '../classes/BattleSystem';
import { Creature, Skill, EcoSkill } from '../classes/battle';
import { TrashMonsterFactory } from '../classes/monsters';
import { DiamondButton } from './DiamondButton';
import { BattleLog } from './BattleLog';
import { HealthBar } from './HealthBar';
import { ManaBar } from './ManaBar';
import { ExpBar } from './ExpBar';

interface BattleUIProps {
  playerPet: Creature;
  enemy?: Creature;
  onBattleEnd?: (won: boolean) => void;
  navigation?: any;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BATTLE_BG = require('../assets/ui/Battle_backgroundnew.png');
const DIAMOND_SIZE = 110;

// Import the monster image mapping
const monsterImages = {
  // Metal
  canstruct: require('../assets/sprites/Trash_Monsters/Cans-Truct.png'),
  sarcan: require('../assets/sprites/Trash_Monsters/Sarcan.png'),
  
  // Food Waste/Organic
  greeze_glob: require('../assets/sprites/Trash_Monsters/Greeze_Glob.png'),
  egglut: require('../assets/sprites/Trash_Monsters/Egglut.png'),
  gloofuud: require('../assets/sprites/Trash_Monsters/Gloofuud.png'),
  rotato: require('../assets/sprites/Trash_Monsters/Rotato.png'),
  
  // Paper
  paper_phantom: require('../assets/sprites/Trash_Monsters/Paper_Phantom.png'),
  
  // Plastic
  bottroll: require('../assets/sprites/Trash_Monsters/Bottroll.png'),
  crunchor: require('../assets/sprites/Trash_Monsters/Crunchor.png'),
  cupkwek: require('../assets/sprites/Trash_Monsters/Cupkwek.png'),
  sssstrawpent: require('../assets/sprites/Trash_Monsters/Sssstrawpent.png'),
  jellystic: require('../assets/sprites/Trash_Monsters/Jellystic.png'),
  
  // Glass
  jar: require('../assets/sprites/Trash_Monsters/Jar.png'),
  shardlass: require('../assets/sprites/Trash_Monsters/Shardlass.png'),
  
  // Electronic
  voltwing: require('../assets/sprites/Trash_Monsters/Voltwing.png'),
  phonii: require('../assets/sprites/Trash_Monsters/Phonii.png')
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
  // Map trash types to monster images
  switch (enemy.originalTrashType) {
    // Metal
    case 'metal':
      return Math.random() < 0.5 ? monsterImages.canstruct : monsterImages.sarcan;
    
    // Food Waste/Organic
    case 'food_waste':
    case 'organic':
      const organicMonsters = [
        monsterImages.greeze_glob,
        monsterImages.egglut,
        monsterImages.gloofuud,
        monsterImages.rotato
      ];
      return organicMonsters[Math.floor(Math.random() * organicMonsters.length)];
    
    // Paper
    case 'paper':
      return monsterImages.paper_phantom;
    
    // Plastic
    case 'plastic':
      const plasticMonsters = [
        monsterImages.bottroll,
        monsterImages.crunchor,
        monsterImages.cupkwek,
        monsterImages.sssstrawpent,
        monsterImages.jellystic
      ];
      return plasticMonsters[Math.floor(Math.random() * plasticMonsters.length)];
    
    // Glass
    case 'glass':
      return Math.random() < 0.5 ? monsterImages.jar : monsterImages.shardlass;
    
    // Electronic
    case 'electronic':
      return Math.random() < 0.5 ? monsterImages.voltwing : monsterImages.phonii;
    
    // Default fallback based on eco type
    default:
      switch (enemy.type) {
        case 'RECYCLABLE':
          return monsterImages.canstruct;
        case 'COMPOSTABLE':
          return monsterImages.greeze_glob;
        case 'HAZARDOUS':
          return monsterImages.voltwing;
        default:
          return monsterImages.canstruct;
      }
  }
};

// Helper function to get pet image
const getPetImage = (pet: Creature) => {
  if (pet.name === 'Owlleaf') {
    return petImages.Owlleaf;
  } else if (pet.name === 'Cubble') {
    return petImages.Cubble;
  } else if (pet.name === 'Meowmblebee') {
    return petImages.Meowmblebee;
  }
  
  // Default fallback
  return petImages.default;
};

// Example item inventory (stub, to be replaced with real inventory logic)
const defaultItems = [
  { name: 'Health Herb', effect: 'heal', value: 0.3, description: 'Restore 30% max HP' },
  { name: 'EP Booster', effect: 'ep', value: 50, description: 'Restore 50 EP' }
];

export const BattleUI: React.FC<BattleUIProps> = ({ playerPet, enemy: providedEnemy, onBattleEnd, navigation }) => {
  const [battleSystem, setBattleSystem] = useState<BattleSystem | null>(null);
  const [enemy, setEnemy] = useState<Creature | null>(null);
  const [enemyImage, setEnemyImage] = useState<any>(null); // Add state for cached enemy image
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [showSkillMenu, setShowSkillMenu] = useState(false);
  const [showItemMenu, setShowItemMenu] = useState(false);
  const [showPartyMenu, setShowPartyMenu] = useState(false); // Add party menu state
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [itemInventory, setItemInventory] = useState(defaultItems);
  const [isDefending, setIsDefending] = useState(false);
  const [playerFadeAnim] = useState(new Animated.Value(1));
  const [enemyFadeAnim] = useState(new Animated.Value(1));
  const [battleFadeAnim] = useState(new Animated.Value(0));
  const [isBattleOver, setIsBattleOver] = useState(false); // Add battle over state
  const [playerBlinkAnim] = useState(new Animated.Value(1));
  const [enemyBlinkAnim] = useState(new Animated.Value(1));
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // Helper: apply passive effects at the start of turn
  const applyPassives = (pet: Creature) => {
    if (pet.type === 'RECYCLABLE') {
      pet.currentMp = Math.min(pet.stats.mp, pet.currentMp + 15);
      setBattleLog((log) => [...log, `${pet.name}'s recyclable body generates +15 EP!`]);
    } else if (pet.type === 'COMPOSTABLE') {
      const heal = Math.floor(pet.stats.hp * 0.05);
      pet.currentHp = Math.min(pet.stats.hp, pet.currentHp + heal);
      setBattleLog((log) => [...log, `${pet.name}'s compostable body heals ${heal} HP!`]);
    } else if (pet.type === 'HAZARDOUS') {
      const dmg = 5;
      pet.currentHp = Math.max(0, pet.currentHp - dmg);
      setBattleLog((log) => [...log, `${pet.name}'s hazardous body deals +10% dmg but loses 5 HP!`]);
    }
  };

  // Initialize battle
  useEffect(() => {
    // Use the provided enemy or generate a random one if not provided
    let battleEnemy;
    
    if (providedEnemy) {
      battleEnemy = providedEnemy;
    } else {
      const randomLevel = Math.floor(Math.random() * 10) + 1; // Random level 1-10
      const monsterTypes = [
        // Metal
        TrashMonsterFactory.createCanstruct,
        TrashMonsterFactory.createSarcan,
        // Food Waste/Organic
        TrashMonsterFactory.createGreezeGlob,
        TrashMonsterFactory.createEgglut,
        TrashMonsterFactory.createGloofuud,
        TrashMonsterFactory.createRotato,
        // Paper
        TrashMonsterFactory.createPaperPhantom,
        // Plastic
        TrashMonsterFactory.createBottroll,
        TrashMonsterFactory.createCrunchor,
        TrashMonsterFactory.createCupkwek,
        TrashMonsterFactory.createSssstrawpent,
        TrashMonsterFactory.createJellystic,
        // Glass
        TrashMonsterFactory.createJar,
        TrashMonsterFactory.createShardlass,
        // Electronic
        TrashMonsterFactory.createVoltwing,
        TrashMonsterFactory.createPhonii
      ];
      const randomMonsterType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
      battleEnemy = randomMonsterType(randomLevel);
    }

    setEnemy(battleEnemy);
    // Cache the enemy image when battle starts
    setEnemyImage(getMonsterImage(battleEnemy));
    const battle = new BattleSystem(playerPet, battleEnemy);
    setBattleSystem(battle);
    setBattleLog([`A wild ${battleEnemy.name} (Level ${battleEnemy.level}) appeared!`]);
  }, [playerPet, providedEnemy]);

  // Add blink animation function
  const playBlinkAnimation = (isPlayer: boolean) => {
    const blinkAnim = isPlayer ? playerBlinkAnim : enemyBlinkAnim;
    return new Promise<void>((resolve) => {
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => resolve());
    });
  };

  // Add fainting animation function
  const playFaintAnimation = (isPlayer: boolean) => {
    const fadeAnim = isPlayer ? playerFadeAnim : enemyFadeAnim;
    return new Promise<void>((resolve) => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => resolve());
    });
  };

  // Add battle end fade function
  const playBattleEndFade = (callback: () => void) => {
    Animated.timing(battleFadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(callback);
  };

  // Update useEffect to handle enemy turns
  useEffect(() => {
    if (!isPlayerTurn && !isProcessing && battleSystem && !isBattleOver) {
      const handleEnemyTurn = async () => {
        setIsProcessing(true);
        try {
          // Wait a bit before enemy attacks
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Execute enemy's basic attack
          const logs = battleSystem.executeAction({ type: 'BASIC_ATTACK' });
          setBattleLog(logs);
          
          // Play blink animation for player
          await playBlinkAnimation(true);
          
          // Check if battle is over after enemy attack
          if (battleSystem.isGameOver()) {
            const winner = battleSystem.getWinner();
            const isVictory = winner === playerPet;
            setIsBattleOver(true);
            
            // Play fainting animation for the defeated creature
            await playFaintAnimation(!isVictory); // true for player defeat, false for enemy defeat
            
            // Show appropriate dialog
            if (isVictory) {
              Alert.alert(
                "Victory!",
                `You defeated the enemy!`,
                [{ text: "Continue", onPress: () => playBattleEndFade(() => {
                  setIsProcessing(false);
                  onBattleEnd && onBattleEnd(true);
                })}]
              );
            } else {
              Alert.alert(
                "Defeat",
                "Your pet has been defeated!",
                [{ text: "Continue", onPress: () => playBattleEndFade(() => {
                  setIsProcessing(false);
                  onBattleEnd && onBattleEnd(false);
                })}]
              );
            }
          } else {
            // If battle continues, switch back to player's turn
            setIsPlayerTurn(true);
          }
        } catch (error) {
          console.error('Error during enemy turn:', error);
          setBattleLog(prev => [...prev, 'Error during enemy turn']);
        } finally {
          setIsProcessing(false);
        }
      };

      handleEnemyTurn();
    }
  }, [isPlayerTurn, isProcessing, battleSystem, isBattleOver]);

  // Main action executor
  const executeAction = async (action: BattleAction) => {
    if (isProcessing || !isPlayerTurn || !battleSystem || isBattleOver) return;
    setIsProcessing(true);

    try {
      // Check if pet needs to rest (out of MP)
      if (playerPet.currentMp <= 0 && action.type !== 'REST') {
        setBattleLog(prev => [...prev, `${playerPet.name} is out of EP and needs to rest!`]);
        const logs = battleSystem.executeAction({ type: 'REST' });
        setBattleLog(logs);
        setIsPlayerTurn(false);
        setIsProcessing(false);
        return;
      }

      const logs = battleSystem.executeAction(action);
      setBattleLog(logs);

      // Play blink animation for the target
      if (action.type === 'BASIC_ATTACK' || action.type === 'SKILL') {
        await playBlinkAnimation(false); // Enemy blinks when hit
      }

      setIsPlayerTurn(false);

      // Check if battle is over
      if (battleSystem.isGameOver()) {
        const winner = battleSystem.getWinner();
        const isVictory = winner === playerPet;
        setIsBattleOver(true);
        
        // Play fainting animation for the defeated creature
        await playFaintAnimation(!isVictory);
        
        // Get the last log entry to check for level up
        const lastLog = logs[logs.length - 1];
        const levelUpMatch = lastLog.match(/grew to level (\d+)/);
        const expGain = Math.floor(50 * (enemy?.level || 1));
        
        if (isVictory) {
          // Check for level up and skill learning
          if (levelUpMatch) {
            const newLevel = parseInt(levelUpMatch[1]);
            if (newLevel === 5 || newLevel === 10) {
              // Show skill learning dialog first
              Alert.alert(
                "New Skill Learned!",
                "Your pet has learned a new skill!",
                [
                  {
                    text: "Continue",
                    onPress: () => {
                      // Then show victory dialog
                      Alert.alert(
                        "Victory!",
                        `You defeated the enemy!\nGained ${expGain} EXP`,
                        [{ text: "Continue", onPress: () => playBattleEndFade(() => {
                          setIsProcessing(false);
                          onBattleEnd && onBattleEnd(true);
                        })}]
                      );
                    }
                  }
                ]
              );
            } else {
              // Just show victory dialog
              Alert.alert(
                "Victory!",
                `You defeated the enemy!\nGained ${expGain} EXP`,
                [{ text: "Continue", onPress: () => playBattleEndFade(() => {
                  setIsProcessing(false);
                  onBattleEnd && onBattleEnd(true);
                })}]
              );
            }
          } else {
            // Just show victory dialog
            Alert.alert(
              "Victory!",
              `You defeated the enemy!\nGained ${expGain} EXP`,
              [{ text: "Continue", onPress: () => playBattleEndFade(() => {
                setIsProcessing(false);
                onBattleEnd && onBattleEnd(true);
              })}]
            );
          }
        } else {
          Alert.alert(
            "Defeat",
            "Your pet has been defeated!",
            [{ text: "Continue", onPress: () => playBattleEndFade(() => {
              setIsProcessing(false);
              onBattleEnd && onBattleEnd(false);
            })}]
          );
        }
      }
    } catch (error) {
      console.error('Error executing action:', error);
      setBattleLog(prev => [...prev, 'Error executing action']);
    } finally {
      setIsProcessing(false);
    }
  };

  // Use item handler
  const handleUseItem = (item: any) => {
    if (!isPlayerTurn || isProcessing || isBattleOver) return;
    setIsProcessing(true);
    
    let log = '';
    if (item.effect === 'heal') {
      const heal = Math.floor(playerPet.stats.hp * item.value);
      playerPet.currentHp = Math.min(playerPet.stats.hp, playerPet.currentHp + heal);
      log = `${playerPet.name} healed ${heal} HP!`;
    } else if (item.effect === 'ep') {
      playerPet.currentMp = Math.min(playerPet.stats.mp, playerPet.currentMp + item.value);
      log = `${playerPet.name} restored ${item.value} EP!`;
    } else if (item.effect === 'antidote') {
      // Stub: implement status
      log = `${playerPet.name} is cured of poison!`;
    } else if (item.effect === 'eco') {
      // Remove eco gauge updates
      // setEcoGauge((g) => Math.min(100, g + Math.floor(100 * item.value)));
      log = `${playerPet.name}'s Eco-Mode gauge increased by ${Math.floor(100 * item.value)}%!`;
    }
    setBattleLog((prev) => [...prev, log]);
    setIsPlayerTurn(false);
    setIsProcessing(false);
  };

  // Run handler
  const handleRun = () => {
    if (!isPlayerTurn || isProcessing || isBattleOver) return;
    setIsProcessing(true);
    const success = Math.random() < 0.5;
    if (success) {
      setBattleLog((prev) => [...prev, `${playerPet.name} escaped successfully!`]);
      setIsBattleOver(true);
      onBattleEnd && onBattleEnd(false);
    } else {
      setBattleLog((prev) => [...prev, `${playerPet.name} failed to escape!`]);
      setIsPlayerTurn(false);
    }
    setIsProcessing(false);
  };

  // Update handleSkillPress to use EcoSkill
  const handleSkillPress = (skill: EcoSkill) => {
    if (isProcessing || !isPlayerTurn || isBattleOver) return;
    executeAction({ type: 'SKILL', skill });
  };

  // Update handleBasicAttackPress
  const handleBasicAttackPress = () => {
    if (isProcessing || !isPlayerTurn || isBattleOver) return;
    executeAction({ type: 'BASIC_ATTACK' });
  };

  // Update handleDefendPress
  const handleDefendPress = () => {
    if (isProcessing || !isPlayerTurn || isBattleOver) return;
    executeAction({ type: 'DEFEND' });
  };

  // Update menu handlers to manage overlay state
  const handleOpenSkillMenu = () => {
    setIsOverlayOpen(true);
    setShowSkillMenu(true);
  };

  const handleOpenItemMenu = () => {
    setIsOverlayOpen(true);
    setShowItemMenu(true);
  };

  const handleOpenPartyMenu = () => {
    setIsOverlayOpen(true);
    setShowPartyMenu(true);
  };

  const handleSwitchPet = (targetPet: Creature) => {
    if (!isPlayerTurn || isProcessing || isBattleOver || targetPet === battleSystem?.getState().playerPet) return;
    
    setIsProcessing(true);
    const logs = battleSystem?.executeAction({ type: 'SWITCH_PET', targetPet }) || [];
    setBattleLog(logs);
    setIsPlayerTurn(false);
    setIsProcessing(false);
    setShowPartyMenu(false);
    setIsOverlayOpen(false);
  };

  const handleCloseMenu = () => {
    setIsOverlayOpen(false);
    setShowSkillMenu(false);
    setShowItemMenu(false);
    setShowPartyMenu(false);
  };

  if (!battleSystem || !enemy) return null;

  const renderHPBar = (creature: Creature) => {
    const hpPercentage = (creature.currentHp / creature.stats.hp) * 100;
    const mpPercentage = (creature.currentMp / creature.stats.mp) * 100;
    const expPercentage = (creature.exp / creature.getExpNeeded()) * 100;
    
    return (
      <View style={styles.hpBarContainer}>
        <View style={styles.nameLevelContainer}>
          <Text style={styles.hpText}>{creature.name}</Text>
          <Text style={styles.levelText}>Lv.{creature.level}</Text>
        </View>
        <View style={styles.barContainer}>
          <Text style={styles.barLabel}>HP</Text>
          <View style={styles.hpBarOuter}>
            <View 
              style={[
                styles.hpBarInner, 
                { width: `${hpPercentage}%` },
                hpPercentage < 20 ? styles.hpCritical : hpPercentage < 50 ? styles.hpWarning : styles.hpGood
              ]} 
            />
          </View>
          <Text style={styles.barValue}>{`${creature.currentHp}/${creature.stats.hp}`}</Text>
        </View>
        <View style={styles.barContainer}>
          <Text style={styles.barLabel}>MP</Text>
          <View style={styles.mpBarOuter}>
            <View 
              style={[
                styles.mpBarInner, 
                { width: `${mpPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.barValue}>{`${creature.currentMp}/${creature.stats.mp}`}</Text>
        </View>
        {creature === playerPet && (
          <View style={styles.barContainer}>
            <Text style={styles.barLabel}>EXP</Text>
            <View style={styles.expBarOuter}>
              <View 
                style={[
                  styles.expBarInner, 
                  { width: `${expPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.barValue}>{`${creature.exp}/${creature.getExpNeeded()}`}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <ImageBackground source={BATTLE_BG} style={styles.background} />

      {/* Enemy HP Bar */}
      <View style={styles.enemyHpBar} pointerEvents="none">
        {renderHPBar(enemy)}
      </View>
      {/* Enemy Image with Blink Animation */}
      <View pointerEvents="none">
        <Animated.Image 
          source={enemyImage}
          style={[
            styles.enemyImg,
            { opacity: enemyBlinkAnim }
          ]} 
        />
      </View>

      {/* Pet Image with Blink Animation */}
      <Animated.View 
        style={[styles.petContainer, { opacity: playerBlinkAnim }]} 
        pointerEvents="none"
      >
        <Image source={getPetImage(playerPet)} style={styles.petImg} />
      </Animated.View>
      {/* Pet HP Bar */}
      <View style={styles.petHpBar} pointerEvents="none">
        {renderHPBar(playerPet)}
      </View>

      {/* Command UI Bar */}
      <View style={styles.commandUi}>
        {/* Party button */}
        <Pressable
          style={[styles.commandButton, styles.partyButton]}
          onPress={handleOpenPartyMenu}
          disabled={!isPlayerTurn || isProcessing || isBattleOver || isOverlayOpen}
        >
          <Text style={styles.commandButtonText}>Party</Text>
        </Pressable>
        {/* Diamond Buttons */}
        <View style={styles.diamondButtonsContainer}>
          <DiamondButton
            label="SKILL"
            onPress={handleOpenSkillMenu}
            style={styles.skillDiamond}
            disabled={!isPlayerTurn || isProcessing || isBattleOver || isOverlayOpen}
          />
          <DiamondButton
            label="DEFEND"
            onPress={() => executeAction({ type: 'DEFEND' })}
            style={styles.defendDiamond}
            disabled={!isPlayerTurn || isProcessing || isBattleOver || isOverlayOpen}
          />
          <DiamondButton
            label="ITEM"
            onPress={handleOpenItemMenu}
            style={styles.itemDiamond}
            disabled={!isPlayerTurn || isProcessing || isBattleOver || isOverlayOpen}
          />
          <DiamondButton
            label="RUN"
            onPress={handleRun}
            style={styles.runDiamond}
            disabled={!isPlayerTurn || isProcessing || isBattleOver || isOverlayOpen}
          />
        </View>
      </View>

      {/* Battle Log */}
      <View style={styles.battleLog} pointerEvents="none">
        <Text style={styles.battleLogText}>
          {battleLog[battleLog.length - 1]}
        </Text>
      </View>

      {/* Skill/Item Menus */}
      {showSkillMenu && (
        <View style={styles.skillMenu} pointerEvents="box-none">
          {/* Basic Attack at the top */}
          <Pressable
            style={styles.skillButton}
            onPress={() => {
              handleCloseMenu();
              executeAction({ type: 'BASIC_ATTACK' });
            }}
            disabled={!isPlayerTurn || isProcessing}
          >
            <Text style={styles.skillName}>Basic Attack</Text>
            <Text style={styles.skillCost}>EP: 0</Text>
          </Pressable>
          {playerPet.skills.map((skill, idx) => (
            <Pressable
              key={skill.name}
              style={[
                styles.skillButton,
                playerPet.currentMp < skill.mpCost && styles.disabledSkill
              ]}
              onPress={() => {
                if (playerPet.currentMp >= skill.mpCost) {
                  handleCloseMenu();
                  executeAction({ type: 'SKILL', skill });
                }
              }}
              disabled={playerPet.currentMp < skill.mpCost || !isPlayerTurn || isProcessing}
            >
              <Text style={styles.skillName}>{skill.name}</Text>
              <Text style={styles.skillCost}>{`EP: ${skill.mpCost}`}</Text>
            </Pressable>
          ))}
          <Pressable
            style={styles.backButton}
            onPress={handleCloseMenu}
          >
            <Text style={styles.backText}>BACK</Text>
          </Pressable>
        </View>
      )}
      {showItemMenu && (
        <View style={styles.skillMenu} pointerEvents="box-none">
          {itemInventory.map((item, idx) => (
            <Pressable
              key={item.name}
              style={styles.skillButton}
              onPress={() => {
                handleCloseMenu();
                handleUseItem(item);
              }}
              disabled={!isPlayerTurn || isProcessing}
            >
              <Text style={styles.skillName}>{item.name}</Text>
              <Text style={styles.skillCost}>{item.description}</Text>
            </Pressable>
          ))}
          <Pressable
            style={styles.backButton}
            onPress={handleCloseMenu}
          >
            <Text style={styles.backText}>BACK</Text>
          </Pressable>
        </View>
      )}

      {/* Party Menu */}
      {showPartyMenu && (
        <View style={styles.skillMenu} pointerEvents="box-none">
          {battleSystem?.getParty().map((pet) => (
            <Pressable
              key={pet.name}
              style={[
                styles.skillButton,
                pet === battleSystem.getState().playerPet && styles.disabledSkill,
                pet.isDefeated() && styles.disabledSkill
              ]}
              onPress={() => handleSwitchPet(pet)}
              disabled={pet === battleSystem.getState().playerPet || pet.isDefeated() || !isPlayerTurn || isProcessing}
            >
              <View style={styles.petInfo}>
                <Text style={styles.skillName}>{pet.name}</Text>
                <Text style={styles.petStats}>Lv.{pet.level} HP:{pet.currentHp}/{pet.stats.hp}</Text>
              </View>
              <Text style={styles.skillCost}>{pet.type}</Text>
            </Pressable>
          ))}
          <Pressable
            style={styles.backButton}
            onPress={handleCloseMenu}
          >
            <Text style={styles.backText}>BACK</Text>
          </Pressable>
        </View>
      )}

      {/* Battle End Fade Overlay */}
      <Animated.View 
        style={[
          styles.battleFadeOverlay,
          { opacity: battleFadeAnim }
        ]} 
        pointerEvents="none"
      />
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
  background: {
    position: 'absolute',
    width: SCREEN_W,
    height: SCREEN_H,
    resizeMode: 'contain',
    bottom: 0,
  },
  // Absolute positions for battle elements
  enemyHpBar: {
    position: 'absolute',
    top: 200,
    left: 10,
    width: 170,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    zIndex: 2,
  },
  enemyImg: {
    position: 'absolute',
    top: 330,
    left: 240,
    width: 100,
    height: 100,
    resizeMode: 'contain',
    zIndex: 2,
  },
  petContainer: {
    position: 'absolute',
    top: 442,
    left: 60,
    width: 100,
    height: 100,
    zIndex: 2,
  },
  petImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  petHpBar: {
    position: 'absolute',
    top: 470,
    left: 240,
    width: 170,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    zIndex: 2,
  },
  // Command UI bar at the bottom
  commandUi: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: SCREEN_W,
    height: 300,
    backgroundColor: 'rgba(211,211,211,0.08)',
    zIndex: 3,
  },
  // Party button
  commandButton: {
    position: 'absolute',
    width: 100,
    height: 50,
    backgroundColor: '#4cc7a8',
    borderWidth: 3,
    borderColor: 'gold',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    textAlign: 'center',
    shadowColor: '#888',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    zIndex: 4,
  },
  partyButton: {
    top: 10,
    left: 10,
  },
  commandButtonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: PIXEL_FONT,
    fontSize: 16,
  },
  // Diamond buttons (absolute positions)
  diamondButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillDiamond: {
    position: 'absolute',
    top: 10,
    left: SCREEN_W / 2 - DIAMOND_SIZE / 2,
  },
  defendDiamond: {
    position: 'absolute',
    top: 100,
    left: SCREEN_W / 2 - DIAMOND_SIZE - 20,
  },
  itemDiamond: {
    position: 'absolute',
    top: 100,
    left: SCREEN_W / 2 + 20,
  },
  runDiamond: {
    position: 'absolute',
    top: 190,
    left: SCREEN_W / 2 - DIAMOND_SIZE / 2,
  },
  diamondText: {
    fontWeight: 'bold',
    color: 'white',
    fontFamily: PIXEL_FONT,
    fontSize: 16,
    textAlign: 'center',
  },
  // ... keep other styles as needed ...
  battleLog: {
    position: 'absolute',
    top: 565,
    left: 20,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    zIndex: 10,
  },
  battleLogText: {
    fontFamily: PIXEL_FONT,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  // ... keep other styles as needed ...
  hpBarContainer: {
    width: 160,
    padding: 10,
    backgroundColor: 'rgba(58, 80, 50, 0.5)',
    borderRadius: 8,
  },
  nameLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  hpText: {
    fontFamily: PIXEL_FONT,
    fontSize: 12,
    color: '#fff',
  },
  levelText: {
    fontFamily: PIXEL_FONT,
    fontSize: 12,
    color: '#FFD700',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  barLabel: {
    fontFamily: PIXEL_FONT,
    fontSize: 10,
    color: '#fff',
    width: 25,
  },
  barValue: {
    fontFamily: PIXEL_FONT,
    fontSize: 10,
    color: '#fff',
    marginLeft: 4,
  },
  hpBarOuter: {
    flex: 1,
    height: 8,
    backgroundColor: '#666',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  mpBarOuter: {
    flex: 1,
    height: 8,
    backgroundColor: '#666',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  hpBarInner: {
    height: '100%',
    borderRadius: 4,
  },
  mpBarInner: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  hpGood: { backgroundColor: '#4CAF50' },
  hpWarning: { backgroundColor: '#FFC107' },
  hpCritical: { backgroundColor: '#F44336' },
  skillMenu: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    overflow: 'scroll',
    zIndex: 10,
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
  diamondBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  disabledDiamond: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  battleFadeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 100,
  },
  expBarOuter: {
    flex: 1,
    height: 8,
    backgroundColor: '#666',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  expBarInner: {
    height: '100%',
    backgroundColor: '#9C27B0', // Purple color for EXP
    borderRadius: 4,
  },
  petInfo: {
    flex: 1,
  },
  petStats: {
    fontFamily: PIXEL_FONT,
    color: '#90cdf4',
    fontSize: 12,
  },
}); 