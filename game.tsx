// game.tsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './app/(tabs)/types';

import collisions from './app/(tabs)/data/collisions';
import { rectangularCollision } from './app/(tabs)/data/util';
import { Boundary } from './classes/Boundary';
import { LitterEventManager, RenderableEntity } from './classes/LitterEventManager';
import { Creature } from './classes/battle';
import { NPC, TrashType, TRASH_TYPES } from './classes/NPC';

// constants
const TILE        = 48;
const PLAYER_H    = 68;
const SPEED       = 15;  // Increased from 30 to 45 for faster player movement
const FRAME_HOLD  = 3;   // Reduced from 4 to 3 for smoother animation at higher speed
const FRAME_COUNT = 2;
const COLS        = 70;
const ROWS        = Math.ceil(collisions.length / COLS);
const MAP_WIDTH   = COLS * TILE;
const MAP_HEIGHT  = ROWS * TILE;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// asset requires
const bgImg    = require('./assets/images/background/PelletTown.png');
const fgImg    = require('./assets/images/background/foregroundObjects.png');
const playerSheets = {
  up:    require('./assets/images/player/playerUp.png'),
  down:  require('./assets/images/player/playerDown.png'),
  left:  require('./assets/images/player/playerLeft.png'),
  right: require('./assets/images/player/playerRight.png'),
};

// Trash images
const trashImages = {
  can_trash: require('./assets/liter/can_trash.png'),
  paper_trash: require('./assets/liter/paper_trash.png'),
  organic_trash: require('./assets/liter/organic_trash.png'),
  plastic_trash: require('./assets/liter/plastic_trash.png'),
  glass_trash: require('./assets/liter/glass_trash.png'),
  electronic_trash: require('./assets/liter/electronic_trash.png')
};

// Monster images - using exact file names as keys
const monsterImages: { [key: string]: any } = {
  // Metal trash monsters
  'Cans-Truct': require('./assets/sprites/Trash_Monsters/Cans-Truct.png'),
  'Sarcan': require('./assets/sprites/Trash_Monsters/Sarcan.png'),
  
  // Paper trash monsters
  'Paper_Phantom': require('./assets/sprites/Trash_Monsters/Paper_Phantom.png'),
  
  // Food waste/organic trash monsters
  'Greeze_Glob': require('./assets/sprites/Trash_Monsters/Greeze_Glob.png'),
  'Egglut': require('./assets/sprites/Trash_Monsters/Egglut.png'),
  'Gloofuud': require('./assets/sprites/Trash_Monsters/Gloofuud.png'),
  'Rotato': require('./assets/sprites/Trash_Monsters/Rotato.png'),
  
  // Plastic trash monsters
  'Bottroll': require('./assets/sprites/Trash_Monsters/Bottroll.png'),
  'Crunchor': require('./assets/sprites/Trash_Monsters/Crunchor.png'),
  'Cupkwek': require('./assets/sprites/Trash_Monsters/Cupkwek.png'),
  'Sssstrawpent': require('./assets/sprites/Trash_Monsters/Sssstrawpent.png'),
  'Jellystic': require('./assets/sprites/Trash_Monsters/Jellystic.png'),
  
  // Glass trash monsters
  'Jar': require('./assets/sprites/Trash_Monsters/Jar.png'),
  'Shardlass': require('./assets/sprites/Trash_Monsters/Shardlass.png'),
  
  // Electronic trash monsters
  'Voltwing': require('./assets/sprites/Trash_Monsters/Voltwing.png'),
  'Phonii': require('./assets/sprites/Trash_Monsters/Phonii.png')
};

// Helper function to get monster sprite based on trash type
const getMonsterSpriteForTrash = (trashType: string) => {
  // Metal trash
  if (trashType.includes('can') || trashType.includes('metal')) {
    return Math.random() < 0.5 ? 'Cans-Truct' : 'Sarcan';
  }
  
  // Paper trash
  if (trashType.includes('paper')) {
    return 'Paper_Phantom';
  }
  
  // Food waste/organic trash
  if (trashType.includes('organic') || trashType.includes('food')) {
    const organicMonsters = ['Greeze_Glob', 'Egglut', 'Gloofuud', 'Rotato'];
    return organicMonsters[Math.floor(Math.random() * organicMonsters.length)];
  }
  
  // Plastic trash
  if (trashType.includes('plastic')) {
    const plasticMonsters = ['Bottroll', 'Crunchor', 'Cupkwek', 'Sssstrawpent', 'Jellystic'];
    return plasticMonsters[Math.floor(Math.random() * plasticMonsters.length)];
  }
  
  // Glass trash
  if (trashType.includes('glass')) {
    return Math.random() < 0.5 ? 'Jar' : 'Shardlass';
  }
  
  // Electronic trash
  if (trashType.includes('electronic')) {
    return Math.random() < 0.5 ? 'Voltwing' : 'Phonii';
  }
  
  return 'Cans-Truct'; // Default fallback
};

type GameProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Game({ navigation }: GameProps) {
  // build collision grid once
  const grid = useMemo(() => {
    const g: number[][] = [];
    for (let i = 0; i < collisions.length; i += COLS) {
      g.push(collisions.slice(i, i + COLS));
    }
    return g;
  }, []);

  // instantiate boundaries once
  const boundaries = useMemo(() => {
    const list: Boundary[] = [];
    grid.forEach((row, y) =>
      row.forEach((cell, x) => {
        if (cell === 1025) {
          list.push(new Boundary({ x: x * TILE, y: y * TILE }));
        }
      })
    );
    return list;
  }, [grid]);

  // map offset state/ref
  const offsetRef = useRef({
    x: SCREEN_W / 2 - MAP_WIDTH / 2,
    y: SCREEN_H / 2 - MAP_HEIGHT / 2,
  });
  const [offset, setOffset] = useState(offsetRef.current);

  // input & direction
  const dir  = useRef<'up'|'down'|'left'|'right'>('down');
  const keys = useRef({ w: false, a: false, s: false, d: false });

  // animation frame
  const frame = useRef({ idx: 0, hold: 0 });
  
  // Add litter event manager and entities states
  const litterManager = useRef<LitterEventManager | null>(null);
  const [entities, setEntities] = useState<RenderableEntity[]>([]);
  const lastUpdateTime = useRef(Date.now());
  const playerPosition = useRef({ x: 0, y: 0 });
  
  // Add battle state tracking
  const [inBattle, setInBattle] = useState(false);
  const lastBattleTime = useRef(0);
  const BATTLE_COOLDOWN = 2000; // 2 seconds cooldown between battles

  // Initialize custom trash types for NPCs
  useEffect(() => {
    // Override the default trash types with proper sprites
    TRASH_TYPES.PLASTIC_BOTTLE = {
      type: TRASH_TYPES.PLASTIC_BOTTLE.type,
      sprite: 'can_trash',
      description: 'A discarded can'
    };
    
    TRASH_TYPES.PAPER_CUP = {
      type: TRASH_TYPES.PAPER_CUP.type,
      sprite: 'paper_trash',
      description: 'Discarded paper'
    };
    
    TRASH_TYPES.FOOD_WASTE = {
      type: TRASH_TYPES.FOOD_WASTE.type,
      sprite: 'organic_trash',
      description: 'Organic waste'
    };
  }, []);

  // Initialize litter event manager and NPCs
  useEffect(() => {
    // Create litter manager
    litterManager.current = new LitterEventManager(
      boundaries,
      MAP_WIDTH,
      MAP_HEIGHT,
      TILE
    );
    
    // Spawn NPCs with appropriate litter chance and speed
    // Use 0.01 (1%) chance per second for littering, and speed of 2
    litterManager.current.spawnInitialNPCs(5, 0.01, 2);
    
    // Update interval for litter manager
    const updateInterval = setInterval(() => {
      if (!litterManager.current || inBattle) return;
      
      const now = Date.now();
      const deltaTime = (now - lastUpdateTime.current) / 1000;
      lastUpdateTime.current = now;
      
      // Update litter manager
      litterManager.current.update(deltaTime);
      
      // Get entities to render
      const renderables = litterManager.current.getRenderableEntities();
      setEntities(renderables);
      
      // Check for battle trigger, but only if not in battle and cooldown has passed
      if (!inBattle && now - lastBattleTime.current > BATTLE_COOLDOWN) {
        const absolutePlayerPos = {
          x: SCREEN_W / 2 - TILE / 2 - offsetRef.current.x,
          y: SCREEN_H / 2 - PLAYER_H / 2 - offsetRef.current.y
        };
        playerPosition.current = absolutePlayerPos;
        
        const monsterEncounter = litterManager.current.checkBattleTrigger(absolutePlayerPos);
        if (monsterEncounter) {
          // Immediately set in battle to prevent further checks
          setInBattle(true);
          lastBattleTime.current = now;
          
          // Immediately remove the monster to prevent repeated collisions
          litterManager.current.removeMonster(monsterEncounter.name);
          
          // Determine monster type based on original trash type
          let enemyType = monsterEncounter.name; // Use the monster's name as the type
          
          // Map trash sprites to monster types
          switch (monsterEncounter.originalTrashType) {
            // Paper trash monsters
            case 'paper':
              enemyType = 'Paper_Phantom';
              break;
              
            // Plastic trash monsters
            case 'plastic':
              const plasticMonsters = ['Bottroll', 'Crunchor', 'Cupkwek', 'Sssstrawpent', 'Jellystic'];
              enemyType = monsterEncounter.name;
              break;
              
            // Food waste/organic trash monsters
            case 'food_waste':
              const organicMonsters = ['Greeze_Glob', 'Egglut', 'Gloofuud', 'Rotato'];
              enemyType = monsterEncounter.name;
              break;
              
            // Metal trash monsters
            case 'metal':
              const metalMonsters = ['Cans-Truct', 'Sarcan'];
              enemyType = monsterEncounter.name;
              break;
              
            // Glass trash monsters
            case 'glass':
              const glassMonsters = ['Jar', 'Shardlass'];
              enemyType = monsterEncounter.name;
              break;
              
            // Electronic trash monsters
            case 'electronic':
              const electronicMonsters = ['Voltwing', 'Phonii'];
              enemyType = monsterEncounter.name;
              break;
              
            default:
              enemyType = 'Cans-Truct'; // Default fallback
          }
          
          // Show battle prompt
          Alert.alert(
            "Monster Encountered!",
            `You encountered a ${monsterEncounter.name}!`,
            [
              { 
                text: "Battle", 
                onPress: () => {
                  // Navigate directly to battle screen with the monster data
                  if (navigation) {
                    try {
                      // First go to pet selection which will then lead to battle
                      navigation.navigate('PetSelection', { enemy: enemyType });
                      console.log('Navigated to PetSelection with enemy:', enemyType);
                    } catch (error) {
                      console.error('Navigation failed:', error);
                      setInBattle(false);
                    }
                  } else {
                    console.warn("Navigation object is missing");
                    setInBattle(false);  // Reset battle state if navigation fails
                  }
                } 
              },
              {
                text: "Run Away",
                onPress: () => {
                  // Reset battle state
                  setInBattle(false);
                }
              }
            ],
            { cancelable: false }  // Prevent dismissing by tapping outside
          );
        }
      }
    }, 1000 / 30); // 30 FPS for updates
    
    return () => clearInterval(updateInterval);
  }, [boundaries, navigation, inBattle]);

  // main loop
  useEffect(() => {
    let raf: number;
    const loop = () => {
      // Don't allow movement during battle
      if (inBattle) {
        raf = requestAnimationFrame(loop);
        return;
      }
      
      // 1) movement deltas
      let dx = 0, dy = 0;
      if (keys.current.w) { dy = SPEED; dir.current = 'up'; }
      if (keys.current.a) { dx = SPEED; dir.current = 'left'; }
      if (keys.current.s) { dy = -SPEED; dir.current = 'down'; }
      if (keys.current.d) { dx = -SPEED; dir.current = 'right'; }

      // 2) compute next offset
      const nextX = Math.round(offsetRef.current.x + dx);
      const nextY = Math.round(offsetRef.current.y + dy);
      const next = { x: nextX, y: nextY };

      // 3) collision check
      const playerRect = {
        position: {
          x: SCREEN_W / 2 - TILE / 2,
          y: SCREEN_H / 2 - PLAYER_H / 2,
        },
        width:  TILE,
        height: PLAYER_H,
      };
      const hit = boundaries.some(b =>
        rectangularCollision({
          rectangle1: playerRect,
          rectangle2: {
            position: { x: b.position.x + next.x, y: b.position.y + next.y },
            width:  Boundary.width,
            height: Boundary.height,
          },
        })
      );

      // 4) apply if no hit
      if (!hit) {
        offsetRef.current = next;
        setOffset(next);
      }

      // 5) walk-cycle animation
      const moving = dx !== 0 || dy !== 0;
      if (moving) {
        frame.current.hold++;
        if (frame.current.hold >= FRAME_HOLD) {
          frame.current.idx = (frame.current.idx + 1) % FRAME_COUNT;
          frame.current.hold = 0;
        }
      } else {
        frame.current.idx = 0;
        frame.current.hold = 0;
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [boundaries, inBattle]);

  // Handle navigation focus events to reset battle state
  useEffect(() => {
    // Reset battle state when returning to this screen
    const unsubscribe = navigation?.addListener?.('focus', () => {
      setInBattle(false);
    });

    return unsubscribe;
  }, [navigation]);

  // input handlers
  const handle = (k: 'w'|'a'|'s'|'d', down: boolean) => {
    keys.current[k] = down;
  };

  // unpack for render
  const { x: offX, y: offY } = offset;
  const curDir   = dir.current;
  const curFrame = frame.current.idx;

  // Helper function to render appropriate entity sprite
  const renderEntityImage = (entity: RenderableEntity) => {
    // For NPCs - use player sprites
    if (entity.sprite.includes('player_')) {
      // Extract direction from sprite name
      let direction: 'up' | 'down' | 'left' | 'right' = 'down'; // default
      if (entity.sprite.includes('_up')) direction = 'up';
      else if (entity.sprite.includes('_left')) direction = 'left';
      else if (entity.sprite.includes('_right')) direction = 'right';
      else if (entity.sprite.includes('_down')) direction = 'down';
      
      // Use the animationFrame directly from the entity
      // This matches how player animation works
      const frameToUse = entity.animationFrame || 0;
      
      return (
        <View style={{
          width: TILE,
          height: PLAYER_H,
          overflow: 'hidden',
        }}>
          <Image
            source={playerSheets[direction]}
            style={{
              width: TILE * FRAME_COUNT,
              height: PLAYER_H,
              transform: [{ translateX: -frameToUse * TILE }],
            }}
          />
        </View>
      );
    }
    
    // For trash items
    if (entity.sprite.includes('can_trash')) {
      return <Image source={trashImages.can_trash} style={styles.entityImage} />;
    }
    if (entity.sprite.includes('paper_trash')) {
      return <Image source={trashImages.paper_trash} style={styles.entityImage} />;
    }
    if (entity.sprite.includes('organic_trash')) {
      return <Image source={trashImages.organic_trash} style={styles.entityImage} />;
    }
    
    // For monsters
    if (entity.sprite.includes('monster')) {
      const monsterType = getMonsterSpriteForTrash(entity.originalType || 'can_trash');
      return <Image source={monsterImages[monsterType]} style={styles.entityImage} />;
    }
    
    // Fallback colored box
    return (
      <View 
        style={[
          styles.entityBox,
          entity.sprite.includes('monster') && { backgroundColor: 'red' },
          entity.sprite.includes('trash') && { backgroundColor: 'brown' },
          !entity.sprite.includes('monster') && !entity.sprite.includes('trash') && { backgroundColor: 'blue' },
        ]} 
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* 1) background (pixel‐perfect) */}
      <Image
        source={bgImg}
        style={[
          styles.map,
          { left: Math.round(offX), top: Math.round(offY) },
        ]}
        resizeMode="cover"
        resizeMethod="resize"
      />

      {/* NPCs and Entities */}
      {entities.map((entity, index) => {
        // Determine if this is an NPC (using player sprites)
        const isNPC = entity.sprite.includes('player_');
        
        return (
          <View
            testID={`entity-${index}`} // Using testID instead of key as a prop
            style={{
              position: 'absolute',
              left: Math.round(entity.position.x + offX),
              top: Math.round(entity.position.y + offY),
              width: isNPC ? undefined : TILE, // Don't set width for NPCs, it's handled in renderEntityImage
              height: isNPC ? PLAYER_H : TILE,
              opacity: entity.opacity ?? 1,
              transform: entity.scale ? [{ scale: entity.scale }] : [],
              zIndex: entity.zIndex ?? 1,
            }}
          >
            {renderEntityImage(entity)}
          </View>
        );
      })}

      {/* 2) player */}
      <View style={styles.player}>
        <Image
          source={playerSheets[curDir]}
          style={{
            width: TILE * FRAME_COUNT,
            height: PLAYER_H,
            transform: [{ translateX: -curFrame * TILE }],
          }}
        />
      </View>

      {/* 3) full‐map foreground on top (pixel‐perfect) */}
      <Image
        source={fgImg}
        style={[
          styles.map,
          { left: Math.round(offX), top: Math.round(offY) },
        ]}
        resizeMode="cover"
        resizeMethod="resize"
      />

      {/* 4) on‐screen controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPressIn={() => handle('w', true)}
          onPressOut={() => handle('w', false)}
          style={styles.btn}
        >
          <Text>Up</Text>
        </TouchableOpacity>
        <View style={styles.row}>
          <TouchableOpacity
            onPressIn={() => handle('a', true)}
            onPressOut={() => handle('a', false)}
            style={styles.btn}
          >
            <Text>Left</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPressIn={() => handle('s', true)}
            onPressOut={() => handle('s', false)}
            style={styles.btn}
          >
            <Text>Down</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPressIn={() => handle('d', true)}
            onPressOut={() => handle('d', false)}
            style={styles.btn}
          >
            <Text>Right</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Debug button for testing battle */}
      <TouchableOpacity
        style={styles.debugBtn}
        onPress={() => {
          if (navigation) {
            setInBattle(true);
            lastBattleTime.current = Date.now();
            console.log('Debug button pressed, attempting navigation');
            console.log('Navigation object exists:', !!navigation);
            console.log('Navigation methods:', Object.keys(navigation));
            try {
              navigation.navigate('PetSelection', {});
              console.log('Navigation attempt completed');
            } catch (error) {
              console.error('Navigation failed with error:', error);
            }
            setTimeout(() => setInBattle(false), 500);
          } else {
            console.warn('Navigation object is missing or undefined');
            Alert.alert("Debug", "Navigation not available");
          }
        }}
      >
        <Text style={styles.debugText}>Test Battle</Text>
      </TouchableOpacity>
      
      {/* Additional debug button with more info */}
      <TouchableOpacity
        style={[styles.debugBtn, { top: 70 }]}
        onPress={() => {
          console.log('Additional debug button pressed');
          console.log('navigation prop type:', typeof navigation);
          console.log('navigation prop:', navigation);
          
          if (navigation && typeof navigation.navigate === 'function') {
            try {
              Alert.alert(
                "Navigation Test",
                "Attempt navigation to PetSelection?",
                [
                  { 
                    text: "Cancel", 
                    style: "cancel" 
                  },
                  { 
                    text: "Navigate", 
                    onPress: () => {
                      console.log('User confirmed navigation');
                      navigation.navigate('PetSelection', {});
                    } 
                  }
                ]
              );
            } catch (error) {
              console.error('Navigation alert failed:', error);
            }
          } else {
            Alert.alert("Error", "Navigation is not available or not a function");
          }
        }}
      >
        <Text style={styles.debugText}>Debug Nav</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  map: {
    position: 'absolute',
    width:  MAP_WIDTH,
    height: MAP_HEIGHT,
  },
  player: {
    position: 'absolute',
    left:   SCREEN_W / 2 - TILE / 2,
    top:    SCREEN_H / 2 - PLAYER_H / 2,
    width:  TILE,
    height: PLAYER_H,
    overflow: 'hidden',
    zIndex: 5, // Higher zIndex to be above NPCs but below controls
  },
  entityImage: {
    width: TILE,
    height: TILE,
    resizeMode: 'contain',
  },
  entityBox: {
    width: TILE,
    height: TILE,
    borderRadius: 5,
  },
  controls: {
    position:    'absolute',
    bottom:      20,
    width:       '100%',
    alignItems: 'center',
    zIndex: 10, // Controls should be on top
  },
  row: { flexDirection: 'row', marginVertical: 5 },
  btn: {
    backgroundColor: 'white',
    padding:         12,
    marginHorizontal:10,
    borderRadius:     4,
  },
  debugBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    zIndex: 15,
  },
  debugText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
