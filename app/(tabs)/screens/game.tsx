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

const TILE   = 48;
const SPEED  = 2;
const HOLD   = 20;
const COLS   = 70;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// NPC and trash types
type TrashType = 'can' | 'organic' | 'paper' | 'plastic';
type MonsterType = 'canstruct' | 'greezeglob' | 'phantompaper' | 'jellstic';

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

// Temporarily use player sprites for NPCs
const npcSheets = playerSheets;

const trashImages = {
  can: require('../../../assets/images/trash_sprite/can_trash.png'),
  organic: require('../../../assets/images/trash_sprite/organic_trash.png'),
  paper: require('../../../assets/images/trash_sprite/paper_trash.png'),
  plastic: require('../../../assets/images/trash_sprite/plastic_trash.png'),
};

const monsterImages = {
  canstruct: require('../../../assets/images/enemy_sprite/canstruct.png'),
  greezeglob: require('../../../assets/images/enemy_sprite/greezeglob.png'),
  phantompaper: require('../../../assets/images/enemy_sprite/phantompaper.png'),
  jellstic: require('../../../assets/images/enemy_sprite/jellstic.png'),
};

const arrowUp = require('../../../assets/images/ui_controls/arrowpad_up.png');
const arrowLeft = require('../../../assets/images/ui_controls/arrowpad_left.png');
const arrowRight = require('../../../assets/images/ui_controls/arrowpad_right.png');
const arrowDown = require('../../../assets/images/ui_controls/arrowpad_down.png');
const mapArrowDown = require('../../../assets/images/ui_controls/map_arrow_down.png');

export default function Game() {
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
        };
        setNpcs(prev => [...prev, newNpc]);
      }
    }, 10000);

    return () => clearInterval(spawnInterval);
  }, [npcs.length, validSpawnPositions, currentMap]);

  // Separate NPC movement loop
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setNpcs(prev => prev.map(npc => {
        if (!npc.shouldLeave && Math.random() < 0.2) { // 20% chance to change direction
          const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
          npc.direction = directions[Math.floor(Math.random() * directions.length)];
        }

        let newPosition = { ...npc.position };
        const speed = npc.shouldLeave ? SPEED * 1.5 : SPEED;

        switch (npc.direction) {
          case 'up': newPosition.y -= speed; break;
          case 'down': newPosition.y += speed; break;
          case 'left': newPosition.x -= speed; break;
          case 'right': newPosition.x += speed; break;
        }

        const gridX = Math.floor(newPosition.x / TILE);
        const gridY = Math.floor(newPosition.y / TILE);

        let canMove = true;
        if (gridX < 0 || gridX >= COLS || gridY < 0 || gridY >= collisionsMap.length) {
          canMove = false;
        } else if (collisionsMap[gridY][gridX] === 1025) {
          canMove = false;
        }

        if (canMove) {
          npc.position = newPosition;
          npc.isMoving = true;
          npc.frameElapsed = (npc.frameElapsed + 1) % HOLD;
          if (npc.frameElapsed === 0) {
            npc.frameIndex = (npc.frameIndex + 1) % 4;
          }
        } else {
          // If blocked, change direction
          const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
          npc.direction = directions[Math.floor(Math.random() * directions.length)];
        }

        return npc;
      }));
    }, 50);

    return () => clearInterval(moveInterval);
  }, [collisionsMap]);

  // Game state checking loop (trash dropping and transformation)
  useEffect(() => {
    const gameStateInterval = setInterval(() => {
      const now = Date.now();

      // Check for trash drops
      setNpcs(prevNpcs => 
        prevNpcs
          .map(npc => {
            // Drop trash when dropTrashAt time is reached
            if (!npc.shouldLeave && now >= npc.dropTrashAt) {
              const trashTypes: TrashType[] = ['can', 'organic', 'paper', 'plastic'];
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

      // Check for transformations
      setTrash(prevTrash => 
        prevTrash.map(item => {
          if (!item.transformed && now >= item.transformAt) {
            console.log('Transforming trash:', item.type, 'at:', new Date(now).toISOString());
            return {
              ...item,
              transformed: true,
              despawnTime: now + 120000, // 2 minutes until despawn
              hasPlayerBeenNear: false
            };
          }
          return item;
        })
      );

      // Check for monster despawns
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
    }, 1000);

    return () => clearInterval(gameStateInterval);
  }, []);

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

  // Add temporary collision tiles for trash spawn points and active NPCs
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
    
    // Add trash spawn point collisions
    for (const item of trash) {
      collisions.push({
        position: item.spawnCollision,
        width: TILE,
        height: TILE,
      });
    }
    
    return collisions;
  }, [npcs, trash]);

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

  const navigation = useNavigation();
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
      if (!item.transformed) continue;
      const monsterScreenPos = {
        x: item.position.x + offset.x,
        y: item.position.y + offset.y
      };
      const distance = Math.sqrt(
        Math.pow(playerCenter.x - (monsterScreenPos.x + TILE/2), 2) +
          Math.pow(playerCenter.y - (monsterScreenPos.y + TILE/2), 2)
      );
      if (distance <= TILE * 1.5) {
        setPendingBattleMonster(item);
        setShowBattleModal(true);
        break;
      }
    }
  }, [trash, offset, showBattleModal, canShowBattleModal]);

  return (
    <View style={styles.container}>
      {/* Background */}
      <Image 
        source={currentMap === 'RouteJuan' ? bgImg : require('../../../assets/images/backgrounds/PelletTown.png')} 
        style={[styles.map, { left: offset.x, top: offset.y }]} 
      />

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
            source={!npc.isMoving ? npcSheets.stand : npcSheets[npc.direction]}
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
              ? monsterImages[`${item.type === 'can' ? 'canstruct' :
                              item.type === 'organic' ? 'greezeglob' :
                              item.type === 'paper' ? 'phantompaper' :
                              'jellstic'}` as MonsterType]
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

      {showBattleModal && pendingBattleMonster && (
        <Modal
          transparent={true}
          visible={showBattleModal}
          animationType="fade"
          onRequestClose={() => setShowBattleModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>A trash monster appeared! Battle?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setShowBattleModal(false);
                    setCanShowBattleModal(false);
                    setTimeout(() => setCanShowBattleModal(true), 3000); // 3 second cooldown
                    (navigation as any).navigate('BattleScreen', { monster: pendingBattleMonster });
                  }}
                >
                  <Text style={styles.modalButtonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setShowBattleModal(false);
                    setCanShowBattleModal(false);
                    setTimeout(() => setCanShowBattleModal(true), 3000); // 3 second cooldown
                  }}
                >
                  <Text style={styles.modalButtonText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

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
