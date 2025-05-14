// Game.tsx
import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import collisions from '../../../app/(tabs)/data/collisions';
import { rectangularCollision } from '../../../app/(tabs)/data/util';
import { Boundary } from '../../../classes/Boundary';

const TILE   = 48;
const SPEED  = 15;
const HOLD   = 1;
const COLS   = 70;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const bgImg = require('../../../assets/images//backgrounds/PelletTown.png');
const fgImg = require('../../../assets/images//backgrounds/foregroundObjects.png');
const playerSheets = {
  up:    require('../../../assets/images/player_sprite/playerUp.png'),
  down:  require('../../../assets/images/player_sprite/playerDown.png'),
  left:  require('../../../assets/images/player_sprite/playerLeft.png'),
  right: require('../../../assets/images/player_sprite/playerRight.png'),
};

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

  const [dir, setDir] = useState<'up'|'down'|'left'|'right'>('down');
  const keys = useRef({ w: false, a: false, s: false, d: false });

  // Sprite animation state
  const [frameIndex,   setFrameIndex]   = useState(0);
  const [frameElapsed, setFrameElapsed] = useState(0);

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

  // Main game loop: starts once, never re-runs on offset changes
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
      let hit = false;
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
  }, [boundaries]);

  // Touch controls
  const handle = (k: 'w'|'a'|'s'|'d', down: boolean) => {
    keys.current[k] = down;
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <Image source={bgImg} style={[styles.map, { left: offset.x, top: offset.y }]} />

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
            borderColor: 'rgba(255,0,0,0.3)',
          }}
        />
      ))}

      {/* Player sprite (cropped) */}
      <View style={styles.player}>
        <Image
          source={playerSheets[dir]}
          style={{
            width: TILE * 4,
            height: TILE,
            transform: [{ translateX: -frameIndex * TILE }],
          }}
        />
      </View>

      {/* Foreground */}
      <Image source={fgImg} style={[styles.map, { left: offset.x, top: offset.y }]} />

      {/* On‐screen Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPressIn={() => handle('w', true)} onPressOut={() => handle('w', false)} style={styles.btn}>
          <Text>Up</Text>
        </TouchableOpacity>
        <View style={styles.row}>
          <TouchableOpacity onPressIn={() => handle('a', true)} onPressOut={() => handle('a', false)} style={styles.btn}>
            <Text>Left</Text>
          </TouchableOpacity>
          <TouchableOpacity onPressIn={() => handle('s', true)} onPressOut={() => handle('s', false)} style={styles.btn}>
            <Text>Down</Text>
          </TouchableOpacity>
          <TouchableOpacity onPressIn={() => handle('d', true)} onPressOut={() => handle('d', false)} style={styles.btn}>
            <Text>Right</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    width: TILE, height: TILE,
    overflow: 'hidden', zIndex: 10,
  },
  controls: { position: 'absolute', bottom: 20, width: '100%', alignItems: 'center' },
  row:      { flexDirection: 'row', marginVertical: 5 },
  btn:      { backgroundColor: 'white', padding: 12, marginHorizontal: 10, borderRadius: 4 },
});
