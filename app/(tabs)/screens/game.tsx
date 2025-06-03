// Game.tsx
import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Modal,
} from 'react-native';
import collisions from '../../../app/(tabs)/data/collisions';
import { rectangularCollision } from '../../../app/(tabs)/data/util';
import { Boundary } from '../../../classes/Boundary';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Guidebook from '../../../components/Guidebook';

// Import the actual RootStackParamList from the app's types
import { RootStackParamList } from '../types';

// Define the navigation prop type
type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GameMainMap'>;

const TILE   = 48;
const SPEED  = 10;
const HOLD   = 10;
const COLS   = 70;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// NPC and trash types
type TrashType = 'can' | 'organic' | 'paper' | 'plastic' | 'glass' | 'electronic';
type MonsterType = 'canstruct' | 'greezeglob' | 'phantompaper' | 'jellstic' | 'bottroll' | 'crunchor' | 'cupkwek' | 'egglut' | 'gloofuud' | 'jar' | 'phonii' | 'rotato' | 'sarcan' | 'shardlass' | 'sssstrawpent' | 'voltwing';

// Define valid NPC types based on available assets
type NPCType = 'npc2' | 'npc3' | 'npc5' | 'npc6' | 'npc7' | 'npc8';

interface NPC {
  id: number;
  position: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  frameIndex: number;
  frameElapsed: number;
  lastThrow: number;
  dropTrashAt: number;
  shouldLeave: boolean;
  exitDirection: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  spawnTime: number;
  opacity: number;
  leaveStartTime: number;
  type: NPCType; // Add NPC type to determine which sprite to use
}

interface Trash {
  id: number;
  type: TrashType;
  position: { x: number; y: number };
  transformed: boolean;
  transformAt: number;
  spawnTime: number;
  spriteVariant: number;
  despawnTime: number;
  hasPlayerBeenNear: boolean;
  spawnCollision: { x: number; y: number };
  monsterType?: MonsterType; // The monster type when transformed
}

// Sprite assets
const bgImg = require('../../../assets/images//backgrounds/RouteJuan.png');
const playerSheets = {
  up:    require('../../../assets/images/player_sprite/UpPlayer.png'),
  down:  require('../../../assets/images/player_sprite/DownPlayer.png'),
  left:  require('../../../assets/images/player_sprite/LeftPlayer.png'),
  right: require('../../../assets/images/player_sprite/RightPlayer.png'),
  stand: require('../../../assets/images/player_sprite/LeftPlayerStand.png'),
};

// Use only NPC sprites from the new npc folder with correct file paths
const npcSheets = {
  // NPC2
  npc2: {
    up: require('../../../assets/images/new npc/NPC2/NPC2Up.png'),
    down: require('../../../assets/images/new npc/NPC2/NPC2Down.png'),
    left: require('../../../assets/images/new npc/NPC2/NPC2Left.png'),
    right: require('../../../assets/images/new npc/NPC2/NPC2Right.png'),
    stand: require('../../../assets/images/new npc/NPC2/NPC2Right.png'),
  },
  // NPC3
  npc3: {
    up: require('../../../assets/images/new npc/NPC3/NPC3Up.png'),
    down: require('../../../assets/images/new npc/NPC3/NPC3Down.png'),
    left: require('../../../assets/images/new npc/NPC3/NPC3Left.png'),
    right: require('../../../assets/images/new npc/NPC3/NPC3Right.png'),
    stand: require('../../../assets/images/new npc/NPC3/NPC3Right.png'),
  },
  // NPC5
  npc5: {
    up: require('../../../assets/images/new npc/NPC5/UpNPC5.png'),
    down: require('../../../assets/images/new npc/NPC5/DownNPC5.png'),
    left: require('../../../assets/images/new npc/NPC5/LeftNPC5.png'),
    right: require('../../../assets/images/new npc/NPC5/RightNPC5.png'),
    stand: require('../../../assets/images/new npc/NPC5/RightNPC5.png'),
  },
  // NPC6
  npc6: {
    up: require('../../../assets/images/new npc/NPC6/UpNPC6.png'),
    down: require('../../../assets/images/new npc/NPC6/DownNPC6.png'),
    left: require('../../../assets/images/new npc/NPC6/LeftNPC6.png'),
    right: require('../../../assets/images/new npc/NPC6/RightNPC6.png'),
    stand: require('../../../assets/images/new npc/NPC6/RightNPC6.png'),
  },
  // NPC7
  npc7: {
    up: require('../../../assets/images/new npc/NPC7/UpNPC7.png'),
    down: require('../../../assets/images/new npc/NPC7/DownNPC7.png'),
    left: require('../../../assets/images/new npc/NPC7/LeftNPC7.png'),
    right: require('../../../assets/images/new npc/NPC7/NPC7Right.png'),
    stand: require('../../../assets/images/new npc/NPC7/NPC7Right.png'),
  },
  // NPC8
  npc8: {
    up: require('../../../assets/images/new npc/NPC8/nnpcUp.png'),
    down: require('../../../assets/images/new npc/NPC8/nnpcDown.png'),
    left: require('../../../assets/images/new npc/NPC8/nnpcLeft.png'),
    right: require('../../../assets/images/new npc/NPC8/nnpcRight.png'),
    stand: require('../../../assets/images/new npc/NPC8/nnpcRight.png'),
  }
};

const trashImages = {
  can: require('../../../assets/images/trash_sprite/can_trash.png'),
  organic: require('../../../assets/images/trash_sprite/organic_trash.png'),
  paper: require('../../../assets/images/trash_sprite/paper_trash.png'),
  plastic: require('../../../assets/images/trash_sprite/plastic_trash.png'),
  glass: require('../../../assets/liter/glass_trash.png'),
  electronic: require('../../../assets/liter/electronic_trash.png'),
};

const monsterImages = {
  // Use the actual sprite assets from the Trash_Monsters folder
  canstruct: require('../../../assets/sprites/Trash_Monsters/Cans-Truct.png'),
  greezeglob: require('../../../assets/sprites/Trash_Monsters/Greeze_Glob.png'),
  phantompaper: require('../../../assets/sprites/Trash_Monsters/Paper_Phantom.png'),
  jellstic: require('../../../assets/sprites/Trash_Monsters/Jellystic.png'),
  // Add all other available monsters
  bottroll: require('../../../assets/sprites/Trash_Monsters/Bottroll.png'),
  crunchor: require('../../../assets/sprites/Trash_Monsters/Crunchor.png'),
  cupkwek: require('../../../assets/sprites/Trash_Monsters/Cupkwek.png'),
  egglut: require('../../../assets/sprites/Trash_Monsters/Egglut.png'),
  gloofuud: require('../../../assets/sprites/Trash_Monsters/Gloofuud.png'),
  jar: require('../../../assets/sprites/Trash_Monsters/Jar.png'),
  phonii: require('../../../assets/sprites/Trash_Monsters/Phonii.png'),
  rotato: require('../../../assets/sprites/Trash_Monsters/Rotato.png'),
  sarcan: require('../../../assets/sprites/Trash_Monsters/Sarcan.png'),
  shardlass: require('../../../assets/sprites/Trash_Monsters/Shardlass.png'),
  sssstrawpent: require('../../../assets/sprites/Trash_Monsters/Sssstrawpent.png'),
  voltwing: require('../../../assets/sprites/Trash_Monsters/Voltwing.png')
};

const arrowUp = require('../../../assets/images/ui_controls/arrowpad_up.png');
const arrowLeft = require('../../../assets/images/ui_controls/arrowpad_left.png');
const arrowRight = require('../../../assets/images/ui_controls/arrowpad_right.png');
const arrowDown = require('../../../assets/images/ui_controls/arrowpad_down.png');
const mapArrowDown = require('../../../assets/images/ui_controls/map_arrow_down.png');

function Game() {
  // Get the properly typed navigation for battle navigation
  const navigation = useNavigation<GameScreenNavigationProp>();
  // Build a 2D grid of collisions once
  const collisionsMap = useMemo(() => {
    const grid: number[][] = [];
    for (let i = 0; i < collisions.length; i += COLS) {
      grid.push(collisions.slice(i, i + COLS));
    }
    return grid;
  }, []);

  // Compute initial center offset once
  const initialOffset = useMemo(() => ({
    x: SCREEN_WIDTH  / 2 - (COLS * TILE) / 2,
    y: SCREEN_HEIGHT / 2 - (collisionsMap.length * TILE) / 2,
  }), [collisionsMap.length]);

  // Live offset in ref (for the loop), but state for rendering
  const offsetRef = useRef({ ...initialOffset });
  const [offset, setOffset] = useState({ ...initialOffset });
  const [currentMap, setCurrentMap] = useState('RouteJuan');
  const [showTeleportModal, setShowTeleportModal] = useState(false);
  const [canShowModal, setCanShowModal] = useState(true);

  // NPC and trash state
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [trash, setTrash] = useState<Trash[]>([]);
  const nextId = useRef(0);

  // Instantiate boundaries once
  const boundaries = useMemo(() => {
    const bs: Boundary[] = [];
    collisionsMap.forEach((row, y) =>
      row.forEach((cell, x) => {
        if (cell === 1025) {
          bs.push(new Boundary({ x: x * TILE, y: y * TILE }));
        }
      })
    );
    return bs;
  }, [collisionsMap]);

  // Find valid spawn positions (not colliding with boundaries)
  const validSpawnPositions = useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    const margin = 2; // Keep NPCs away from boundaries

    // Calculate visible map boundaries
    const mapWidth = COLS * TILE;
    const mapHeight = collisionsMap.length * TILE;
    const minX = -initialOffset.x;
    const maxX = SCREEN_WIDTH - initialOffset.x;
    const minY = -initialOffset.y;
    const maxY = SCREEN_HEIGHT - initialOffset.y;

    collisionsMap.forEach((row, y) => {
      row.forEach((cell, x) => {
        const posX = x * TILE;
        const posY = y * TILE;

        // Check if position is within visible map area
        if (posX >= minX && posX <= maxX && posY >= minY && posY <= maxY) {
          // Check if this is a valid spawn position
          if (cell === 0) {
            // Check surrounding cells to ensure NPC won't be trapped
            let isValid = true;
            for (let dy = -margin; dy <= margin; dy++) {
              for (let dx = -margin; dx <= margin; dx++) {
                const ny = y + dy;
                const nx = x + dx;
                if (ny < 0 || ny >= collisionsMap.length || nx < 0 || nx >= COLS) {
                  isValid = false;
                  break;
                }
                if (collisionsMap[ny][nx] === 1025) {
                  isValid = false;
                  break;
                }
              }
            }
            if (isValid) {
              positions.push({ x: posX, y: posY });
            }
          }
        }
      });
    });
    return positions;
  }, [collisionsMap, initialOffset, SCREEN_WIDTH, SCREEN_HEIGHT]);

  const handleTeleport = () => {
    setCurrentMap(currentMap === 'PelletTown' ? 'RouteJuan' : 'PelletTown');
    // Reset position for new map
    offsetRef.current = { ...initialOffset };
    setOffset({ ...initialOffset });
    // Clear existing NPCs and trash when changing maps
    setNpcs([]);
    setTrash([]);
    setShowTeleportModal(false);
  };

  // Spawn NPCs periodically
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (npcs.length < 3 && validSpawnPositions.length > 0) {
        const spawnPosition = validSpawnPositions[Math.floor(Math.random() * validSpawnPositions.length)];
        const now = Date.now();
        
        // Available NPC types from the new npc folder
        const availableNpcTypes: NPCType[] = ['npc2', 'npc3', 'npc5', 'npc6', 'npc7', 'npc8'];
        
        // Select a random NPC type
        const randomNpcType = availableNpcTypes[Math.floor(Math.random() * availableNpcTypes.length)];
        
        const newNpc: NPC = {
          id: nextId.current++,
          position: spawnPosition,
          direction: 'down',
          frameIndex: 0,
          frameElapsed: 0,
          lastThrow: now,
          dropTrashAt: now + Math.random() * 30000 + 15000, // Random time between 15-45 seconds
          shouldLeave: false,
          exitDirection: 'down',
          isMoving: true,
          spawnTime: now,
          opacity: 1,
          leaveStartTime: 0,
          type: randomNpcType, // Assign the random NPC type
        };
        setNpcs(prev => [...prev, newNpc]);
      }
    }, 10000);

    return () => clearInterval(spawnInterval);
  }, [npcs.length, validSpawnPositions, currentMap]);

  // Helper function to check if a position is walkable
  const isPositionWalkable = (x: number, y: number): boolean => {
    const gridX = Math.floor(x / TILE);
    const gridY = Math.floor(y / TILE);
    
    // Check if position is within map bounds
    if (gridX < 0 || gridX >= COLS || gridY < 0 || gridY >= collisionsMap.length) {
      return false;
    }
    
    // Check if position is a collision tile (1025)
    if (collisionsMap[gridY][gridX] === 1025) {
      return false;
    }
    
    return true;
  };

  // Separate NPC movement loop
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setNpcs(prev => prev.map(npc => {
        // 20% chance to change direction when not leaving
        if (!npc.shouldLeave && Math.random() < 0.2) {
          const allDirections: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right'];
          const directions = allDirections.filter(dir => dir !== npc.direction) as Array<'up' | 'down' | 'left' | 'right'>;
          npc.direction = directions[Math.floor(Math.random() * directions.length)];
        }

        const speed = npc.shouldLeave ? SPEED * 1.5 : SPEED;
        let newPosition = { ...npc.position };

        // Calculate potential new position
        switch (npc.direction) {
          case 'up': newPosition.y -= speed; break;
          case 'down': newPosition.y += speed; break;
          case 'left': newPosition.x -= speed; break;
          case 'right': newPosition.x += speed; break;
        }

        // Check multiple points for better collision detection
        const npcWidth = TILE * 0.8; // Use 80% of tile size for collision
        const npcHeight = TILE * 0.8;
        
        // Check four corners and center of the NPC
        const checkPoints = [
          { x: newPosition.x + npcWidth/2, y: newPosition.y + npcHeight/2 }, // center
          { x: newPosition.x + 2, y: newPosition.y + 2 }, // top-left
          { x: newPosition.x + npcWidth - 2, y: newPosition.y + 2 }, // top-right
          { x: newPosition.x + 2, y: newPosition.y + npcHeight - 2 }, // bottom-left
          { x: newPosition.x + npcWidth - 2, y: newPosition.y + npcHeight - 2 }, // bottom-right
        ];

        // Check if all points are walkable
        let canMove = checkPoints.every(point => 
          isPositionWalkable(point.x, point.y) && 
          isPositionWalkable(point.x, point.y + npcHeight - 1) &&
          isPositionWalkable(point.x + npcWidth - 1, point.y) &&
          isPositionWalkable(point.x + npcWidth - 1, point.y + npcHeight - 1)
        );

        if (canMove) {
          // Move the NPC
          npc.position = newPosition;
          npc.isMoving = true;
          npc.frameElapsed = (npc.frameElapsed + 1) % HOLD;
          if (npc.frameElapsed === 0) {
            npc.frameIndex = (npc.frameIndex + 1) % 4;
          }
        } else {
          // If blocked, try to find a new direction
          npc.isMoving = false;
          const allDirections: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right'];
          const directions = allDirections.filter(dir => dir !== npc.direction) as Array<'up' | 'down' | 'left' | 'right'>;
          
          // Try to find a walkable direction
          let newDirection: 'up' | 'down' | 'left' | 'right' | null = null;
          for (const dir of directions) {
            const testPos = { ...npc.position };
            switch (dir) {
              case 'up': testPos.y -= speed; break;
              case 'down': testPos.y += speed; break;
              case 'left': testPos.x -= speed; break;
              case 'right': testPos.x += speed; break;
            }
            
            const testPoints = [
              { x: testPos.x + npcWidth/2, y: testPos.y + npcHeight/2 },
              { x: testPos.x + 2, y: testPos.y + 2 },
              { x: testPos.x + npcWidth - 2, y: testPos.y + 2 },
              { x: testPos.x + 2, y: testPos.y + npcHeight - 2 },
              { x: testPos.x + npcWidth - 2, y: testPos.y + npcHeight - 2 },
            ];
            
            const canMoveInDir = testPoints.every(point => 
              isPositionWalkable(point.x, point.y) && 
              isPositionWalkable(point.x, point.y + npcHeight - 1) &&
              isPositionWalkable(point.x + npcWidth - 1, point.y) &&
              isPositionWalkable(point.x + npcWidth - 1, point.y + npcHeight - 1)
            );
            
            if (canMoveInDir) {
              newDirection = dir;
              break;
            }
          }
          
          // If no valid direction found, choose a random one
          npc.direction = newDirection || directions[Math.floor(Math.random() * directions.length)];
        }

        return npc;
      }));
    }, 50);

    return () => clearInterval(moveInterval);
  }, [collisionsMap]);

  // Track if player is currently in battle to prevent spawning during battle
  const [isInBattle, setIsInBattle] = useState(false);
  
  // Listen for navigation events to detect battle state
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // When returning to this screen, we're no longer in battle
      setIsInBattle(false);
      console.log('Returned from battle, resuming normal game state');
    });
    
    return unsubscribe;
  }, [navigation]);
  
  // Game state checking loop (trash dropping and transformation)
  useEffect(() => {
    // Don't run the interval if player is in battle
    if (isInBattle) return;
    
    const gameStateInterval = setInterval(() => {
      const now = Date.now();

      // Check for trash drops - only if not in battle
      if (!isInBattle) {
        // Handle NPC trash dropping
        setNpcs(prevNpcs => 
          prevNpcs
            .map(npc => {
              // Drop trash when dropTrashAt time is reached, but only if we have less than 5 trash items
              if (!npc.shouldLeave && now >= npc.dropTrashAt) {
                // Check if we already have 5 or more trash items
                if (trash.length >= 5) {
                  // Don't drop more trash, just make the NPC leave
                  npc.shouldLeave = true;
                  npc.exitDirection = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as 'up' | 'down' | 'left' | 'right';
                  npc.leaveStartTime = now;
                  return npc;
                }
                
                const trashTypes: TrashType[] = ['can', 'organic', 'paper', 'plastic', 'glass', 'electronic'];
                const newTrash: Trash = {
                  id: nextId.current++,
                  type: trashTypes[Math.floor(Math.random() * trashTypes.length)],
                  position: { ...npc.position },
                  transformed: false,
                  transformAt: now + 30000, // 30 seconds to transform
                  spawnTime: now,
                  spriteVariant: Math.floor(Math.random() * 4),
                  despawnTime: 0,
                  hasPlayerBeenNear: false,
                  spawnCollision: { x: npc.position.x, y: npc.position.y }
                };

                setTrash(prev => [...prev, newTrash]);
                console.log('Trash dropped:', newTrash.type, 'Will transform at:', new Date(newTrash.transformAt).toISOString());
                return null; // Remove NPC after dropping trash
              }
              return npc;
            })
            .filter((npc): npc is NPC => npc !== null)
        );
      
        // Check for trash transformations
        setTrash(prevTrash => 
          prevTrash.map(item => {
            if (!item.transformed && now >= item.transformAt) {
              console.log('Transforming trash:', item.type, 'at:', new Date(now).toISOString());
              
              // Map trash types to appropriate monster types
              let monsterType: MonsterType;
              
              // Map each trash type to appropriate monster types
              switch(item.type) {
                case 'can':
                  // Can trash transforms into metal-based monsters
                  monsterType = ['canstruct', 'sarcan', 'crunchor'][Math.floor(Math.random() * 3)] as MonsterType;
                  break;
                case 'organic':
                  // Organic trash transforms into food/organic-based monsters
                  monsterType = ['greezeglob', 'gloofuud', 'egglut', 'rotato'][Math.floor(Math.random() * 4)] as MonsterType;
                  break;
                case 'paper':
                  // Paper trash transforms into paper-based monsters
                  monsterType = ['phantompaper'][Math.floor(Math.random() * 1)] as MonsterType;
                  break;
                case 'plastic':
                  // Plastic trash transforms into plastic-based monsters
                  monsterType = ['jellstic', 'bottroll', 'cupkwek', 'sssstrawpent'][Math.floor(Math.random() * 4)] as MonsterType;
                  break;
                case 'glass':
                  // Glass trash transforms into glass-based monsters
                  monsterType = ['shardlass', 'jar'][Math.floor(Math.random() * 2)] as MonsterType;
                  break;
                case 'electronic':
                  // Electronic trash transforms into electronic-based monsters
                  monsterType = ['phonii', 'voltwing'][Math.floor(Math.random() * 2)] as MonsterType;
                  break;
                default:
                  // Fallback to a random monster if type is unknown
                  const allMonsters: MonsterType[] = [
                    'canstruct', 'greezeglob', 'phantompaper', 'jellstic', 'bottroll', 'crunchor',
                    'cupkwek', 'egglut', 'gloofuud', 'jar', 'phonii', 'rotato', 'sarcan',
                    'shardlass', 'sssstrawpent', 'voltwing'
                  ];
                  monsterType = allMonsters[Math.floor(Math.random() * allMonsters.length)];
              }
              
              return {
                ...item,
                transformed: true,
                monsterType, // Store the monster type for battle
                despawnTime: now + 120000, // 2 minutes until despawn
                hasPlayerBeenNear: false
              };
            }
            return item;
          })
        );

        // Check for monster despawns and battle initiation
        setTrash(prevTrash => 
          prevTrash
            .map(item => {
              if (item.transformed) {
                const playerCenter = {
                  x: SCREEN_WIDTH / 2,
                  y: SCREEN_HEIGHT / 2
                };
                
                const monsterScreenPos = {
                  x: item.position.x + offset.x,
                  y: item.position.y + offset.y
                };

                const distance = Math.sqrt(
                  Math.pow(playerCenter.x - (monsterScreenPos.x + TILE/2), 2) +
                  Math.pow(playerCenter.y - (monsterScreenPos.y + TILE/2), 2)
                );

                if (distance <= TILE * 1.5) {
                  item.hasPlayerBeenNear = true;
                  
                  // Initiate battle with the monster
                  if (item.transformed && item.monsterType && !isInBattle) {
                    console.log('Starting battle with monster:', item.monsterType);
                    
                    // Set battle state to prevent multiple battles and monster spawning
                    setIsInBattle(true);
                    
                    // Determine if this is a tutorial battle (first 3 battles in the game)
                    const isTutorial = item.position.x < 1000 && item.position.y < 1000;
                    
                    // Navigate to the battle screen with the correct parameters
                    navigation.navigate('Battle', { 
                      pet: 'Owlleaf', // Default player pet (must match a key in PET_CONFIGURATIONS)
                      enemy: item.monsterType,
                      isTutorial: isTutorial // Mark tutorial battles explicitly
                    });
                    
                    // Remove this monster after battle initiation
                    return null;
                  }
                  
                  return item;
                }

                if (now >= item.despawnTime && !item.hasPlayerBeenNear) {
                  console.log('Monster despawning:', item.type);
                  return null;
                }
              }
              return item;
            })
            .filter((item): item is Trash => item !== null)
        );
      }
    }, 1000);

    return () => clearInterval(gameStateInterval);
  }, [isInBattle, trash.length, offset, navigation]);

  // Create teleport tile with map-specific coordinates
  const teleportTile = useMemo(() => ({
    position: currentMap === 'RouteJuan' 
      ? { x: 775, y: 1000 }
      : { x: 2450, y: 750 },
    width: currentMap === 'RouteJuan' ? 48 : 190,
    height: currentMap === 'RouteJuan' ? 144 : 80
  }), [currentMap]);

  const [dir, setDir] = useState<'up'|'down'|'left'|'right'>('down');
  const keys = useRef({ w: false, a: false, s: false, d: false });

  // Sprite animation state
  const [frameIndex,   setFrameIndex]   = useState(0);
  const [frameElapsed, setFrameElapsed] = useState(0);

  const handleDeclineTeleport = () => {
    setShowTeleportModal(false);
    setCanShowModal(false);
    // Re-enable modal after 2 seconds
    setTimeout(() => {
      setCanShowModal(true);
    }, 3000);
  };

  // Add temporary collision tiles for active NPCs only (not trash)
  const activeCollisions = useMemo(() => {
    const collisions = [];
    
    // Add NPC collisions
    for (const npc of npcs) {
      collisions.push({
        position: npc.position,
        width: TILE,
        height: TILE,
      });
    }
    
    // No longer add trash collisions - players can walk through trash sprites
    // This allows players to walk past/through trash items on the map
    
    return collisions;
  }, [npcs]);

  // Update main game loop collision checks
  useEffect(() => {
    let anim: number;

    const loop = () => {
      // 1) Determine movement deltas
      let dx = 0, dy = 0;
      if (keys.current.w) { dy = SPEED; setDir('up'); }
      if (keys.current.a) { dx = SPEED; setDir('left'); }
      if (keys.current.s) { dy = -SPEED; setDir('down'); }
      if (keys.current.d) { dx = -SPEED; setDir('right'); }

      // 2) Compute next offset & snap to integers
      let nextX = offsetRef.current.x + dx;
      let nextY = offsetRef.current.y + dy;
      nextX = Math.round(nextX);
      nextY = Math.round(nextY);
      const next = { x: nextX, y: nextY };

      // 3) Collision check
      const playerRect = {
        position: {
          x: SCREEN_WIDTH / 2 - TILE / 2,
          y: SCREEN_HEIGHT / 2 - TILE / 2,
        },
        width: TILE,
        height: TILE,
      };

      // Check teleport collision
      const teleportRect = {
        position: {
          x: teleportTile.position.x + next.x,
          y: teleportTile.position.y + next.y
        },
        width: teleportTile.width,
        height: teleportTile.height
      };

      if (rectangularCollision({ rectangle1: playerRect, rectangle2: teleportRect }) && canShowModal) {
        setShowTeleportModal(true);
      }

      let hit = false;
      
      // Check permanent boundaries
      for (const b of boundaries) {
        const br = {
          position: { x: b.position.x + next.x, y: b.position.y + next.y },
          width: b.width,
          height: b.height,
        };
        if (rectangularCollision({ rectangle1: playerRect, rectangle2: br })) {
          hit = true;
          break;
        }
      }

      // Check all active collisions (NPCs and trash spawn points) - only blocks movement
      if (!hit) {
        for (const collision of activeCollisions) {
          const cr = {
            position: { x: collision.position.x + next.x, y: collision.position.y + next.y },
            width: collision.width,
            height: collision.height,
          };
          if (rectangularCollision({ rectangle1: playerRect, rectangle2: cr })) {
            hit = true;
            break;
          }
        }
      }

      // 4) Apply offset if no collision
      if (!hit) {
        offsetRef.current = next;
        setOffset(next);
      }

      // 5) Advance walk‐cycle frames
      const moving = dx !== 0 || dy !== 0;
      if (moving) {
        setFrameElapsed(e => {
          const n = e + 1;
          if (n >= HOLD) {
            setFrameIndex(i => (i + 1) % 4);
            return 0;
          }
          return n;
        });
      } else {
        setFrameIndex(0);
        setFrameElapsed(0);
      }

      anim = requestAnimationFrame(loop);
    };

    anim = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(anim);
  }, [boundaries, initialOffset, teleportTile, canShowModal, activeCollisions]);

  // Touch controls
  const handle = (k: 'w'|'a'|'s'|'d', down: boolean) => {
    keys.current[k] = down;
  };

  // Already declared at the top of the component
  // const navigation = useNavigation<GameScreenNavigationProp>();
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [pendingBattleMonster, setPendingBattleMonster] = useState<Trash | null>(null);
  const [canShowBattleModal, setCanShowBattleModal] = useState(true); // Cooldown flag

  // Battle prompt logic
  useEffect(() => {
    if (showBattleModal || !canShowBattleModal) return;
    const playerCenter = {
      x: SCREEN_WIDTH / 2,
      y: SCREEN_HEIGHT / 2
    };
    for (const item of trash) {
      if (!item.transformed || !item.monsterType) continue;
      const monsterScreenPos = {
        x: item.position.x + offset.x,
        y: item.position.y + offset.y
      };
      const distance = Math.sqrt(
        Math.pow(playerCenter.x - (monsterScreenPos.x + TILE/2), 2) +
          Math.pow(playerCenter.y - (monsterScreenPos.y + TILE/2), 2)
      );
      if (distance <= TILE * 1.5) {
        // Navigate directly to battle screen with the correct parameters
        console.log('Starting battle with monster:', item.monsterType);
        navigation.navigate('Battle', { 
          pet: 'compostable', // Default player pet
          enemy: item.monsterType
        });
        
        // Remove the monster after battle initiation
        setTrash(prev => prev.filter(t => t.id !== item.id));
        
        // Set cooldown to prevent immediate battles
        setCanShowBattleModal(false);
        setTimeout(() => {
          setCanShowBattleModal(true);
        }, 5000); // 5 second cooldown
        
        break;
      }
    }
  }, [trash, offset, showBattleModal, canShowBattleModal, navigation]);

  // Define styles first to avoid using before declaration
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    map:       { position: 'absolute', width: COLS * TILE, height: Math.ceil(collisions.length / COLS) * TILE },
    player:    {
      position: 'absolute',
      left: SCREEN_WIDTH  / 2 - TILE / 2,
      top:  SCREEN_HEIGHT / 2 - TILE / 2,
      width: TILE,
      height: TILE * (48/32),
      overflow: 'hidden',
      zIndex: 10,
    },
    controls: {
      position: 'absolute',
      bottom: 20,
      width: '100%',
      alignItems: 'center',
      zIndex: 100,
    },
    row:      { flexDirection: 'row', marginVertical: 5 },
    arrowBtn: {
      backgroundColor: 'rgba(88, 183, 194, 0.7)',
      padding: 12,
      marginHorizontal: 2,
      borderRadius: 10,
      height: 80,
      width: 80,
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowImg: {
      width: 75,
      height: 75,
      resizeMode: 'contain',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    modalText: {
      fontSize: 18,
      marginBottom: 20,
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    modalButton: {
      backgroundColor: '#4CAF50',
      padding: 10,
      borderRadius: 5,
      width: 100,
      alignItems: 'center',
    },
    modalButtonText: {
      color: 'white',
      fontSize: 16,
    },
    npc: {
      position: 'absolute',
      overflow: 'hidden',
      zIndex: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    trash: {
      position: 'absolute',
      width: TILE,
      height: TILE,
      zIndex: 4,
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
    },
    trashImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
  });
  
  return (
    <View style={styles.container}>
      {/* Background */}
      <Image 
        source={currentMap === 'RouteJuan' ? bgImg : require('../../../assets/images/backgrounds/PelletTown.png')} 
        style={[styles.map, { left: offset.x, top: offset.y }]} 
      />

      {/* Guidebook */}
      <Guidebook currentScreen="GameMainMap" />

      {/* Teleport tile */}
      <View
        style={{
          position: 'absolute',
          left: teleportTile.position.x + offset.x,
          top: teleportTile.position.y + offset.y,
          width: teleportTile.width,
          height: teleportTile.height,
          backgroundColor: 'rgba(245, 45, 45, 0.0)', // 'rgba(127, 199, 85, 0.3)'
        }}
      />

      {/* Map arrow down */}
      <View
        style={{
          position: 'absolute',
          left: teleportTile.position.x + offset.x,
          top: teleportTile.position.y + offset.y,
          width: teleportTile.width,
          height: teleportTile.height,
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none', // So it doesn't block touches
        }}
        pointerEvents="none"
      >
        <Image
          source={mapArrowDown}
          style={{
            width: TILE * 1.5,
            height: TILE * 1.5,
            resizeMode: 'contain',
            opacity: 0.85,
          }}
        />
      </View>

      {/* Collision debug rectangles */}
      {boundaries.map((b, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: b.position.x + offset.x,
            top:  b.position.y + offset.y,
            width:  b.width,
            height: b.height,
            borderWidth: 1,
            borderColor: 'rgba(255,0,0,0.0)',
          }}
        />
      ))}

      {/* NPCs */}
      {npcs.map(npc => (
        <View
          key={npc.id}
          style={[
            styles.npc,
            {
              left: npc.position.x + offset.x,
              top: npc.position.y + offset.y - TILE * (48/32 - 1),
              width: TILE,
              height: TILE * (48/32),
              opacity: npc.opacity,
              overflow: 'hidden',
            },
          ]}
        >
          <Image
            source={npcSheets[npc.type][npc.isMoving ? npc.direction : 'stand']}
            style={{
              position: 'absolute',
              left: !npc.isMoving ? 0 : -npc.frameIndex * TILE,
              width: !npc.isMoving ? TILE : TILE * 4,
              height: TILE * (48/32),
            }}
          />
        </View>
      ))}

      {/* Trash and Monsters */}
      {trash.map(item => (
        <View
          key={item.id}
          style={[
            styles.trash,
            {
              left: item.position.x + offset.x,
              top: item.position.y + offset.y,
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
            },
          ]}
        >
          <Image
            source={item.transformed 
              ? monsterImages[item.monsterType || 'canstruct'] // Use the assigned monster type
              : trashImages[item.type]}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'contain',
            }}
          />
        </View>
      ))}

      {/* Player sprite (cropped) */}
      <View style={styles.player}>
        <Image
          source={playerSheets[dir]}
          style={{
            width: TILE * 4,
            height: TILE * (48/32), // Scale height proportionally based on original 34x48 dimensions
            transform: [
              { translateX: -frameIndex * TILE },
              // Center the up/down sprites by shifting them left 7 pixels
              { translateX: (dir === 'up' || dir === 'down') ? 0 : 0 }
            ],
          }}
        />
      </View>

      {/* On‐screen Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPressIn={() => handle('w', true)} onPressOut={() => handle('w', false)} style={styles.arrowBtn}>
          <Image source={arrowUp} style={styles.arrowImg} />
        </TouchableOpacity>
        <View style={styles.row}>
          <TouchableOpacity onPressIn={() => handle('a', true)} onPressOut={() => handle('a', false)} style={styles.arrowBtn}>
            <Image source={arrowLeft} style={styles.arrowImg} />
          </TouchableOpacity>
          <TouchableOpacity onPressIn={() => handle('s', true)} onPressOut={() => handle('s', false)} style={styles.arrowBtn}>
            <Image source={arrowDown} style={styles.arrowImg} />
          </TouchableOpacity>
          <TouchableOpacity onPressIn={() => handle('d', true)} onPressOut={() => handle('d', false)} style={styles.arrowBtn}>
            <Image source={arrowRight} style={styles.arrowImg} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Teleport Modal */}
      <Modal
        transparent={true}
        visible={showTeleportModal}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {currentMap === 'PelletTown' 
                ? 'Would you like to travel to Route Juan?' 
                : 'Would you like to travel to Pellet Town?'}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleTeleport}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleDeclineTeleport}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Battle is now initiated directly in the useEffect, no need for a modal */}
    </View>
  );
};

export default Game;
