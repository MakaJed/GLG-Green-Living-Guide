import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text, Dimensions, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type Position = { x: number; y: number };
type Direction = 'up' | 'down' | 'left' | 'right';

const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 64;

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const PORTAL_POSITION = { x: 10, y: 300 };
const PORTAL_SIZE = 50;

const playerSprites = {
  up: [
    require('../../../assets/images/player_sprite/player_up1.png'),
    require('../../../assets/images/player_sprite/player_up2.png'),
    require('../../../assets/images/player_sprite/player_up3.png'),
    require('../../../assets/images/player_sprite/player_up4.png'),
  ],
  down: [
    require('../../../assets/images/player_sprite/player_down1.png'),
    require('../../../assets/images/player_sprite/player_down2.png'),
    require('../../../assets/images/player_sprite/player_down3.png'),
    require('../../../assets/images/player_sprite/player_down4.png'),
  ],
  left: [
    require('../../../assets/images/player_sprite/player_left1.png'),
    require('../../../assets/images/player_sprite/player_left2.png'),
    require('../../../assets/images/player_sprite/player_left3.png'),
    require('../../../assets/images/player_sprite/player_left4.png'),
  ],
  right: [
    require('../../../assets/images/player_sprite/player_right1.png'),
    require('../../../assets/images/player_sprite/player_right2.png'),
    require('../../../assets/images/player_sprite/player_right3.png'),
    require('../../../assets/images/player_sprite/player_right4.png'),
  ],
};

export default function GameScreen() {
  const [position, setPosition] = useState<Position>({ x: 100, y: 100 });
  const [direction, setDirection] = useState<Direction>('down');
  const [frameIndex, setFrameIndex] = useState<number>(0);
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [shouldNavigate, setShouldNavigate] = useState<boolean>(false);  // New state to trigger navigation outside render
  const navigation = useNavigation();

  const startWalkingAnimation = (dir: Direction) => {
    if (isWalking) return;
    setIsWalking(true);
    let step = 0;

    const interval = setInterval(() => {
      step++;
      setFrameIndex(prev => (prev + 1) % playerSprites[dir].length);
      if (step >= 6) {
        clearInterval(interval);
        setFrameIndex(0);
        setIsWalking(false);
      }
    }, 200);
  };

  const checkPortalCollision = (newPos: Position) => {
    const withinX = newPos.x < PORTAL_POSITION.x + PORTAL_SIZE &&
                    newPos.x + PLAYER_WIDTH > PORTAL_POSITION.x;
    const withinY = newPos.y < PORTAL_POSITION.y + PORTAL_SIZE &&
                    newPos.y + PLAYER_HEIGHT > PORTAL_POSITION.y;
    return withinX && withinY;
  };

  const movePlayer = (dx: number, dy: number, dir: Direction) => {
    setDirection(dir);
    startWalkingAnimation(dir);

    setPosition(prev => {
      const newX = Math.max(0, Math.min(prev.x + dx, SCREEN_WIDTH - PLAYER_WIDTH));
      const newY = Math.max(0, Math.min(prev.y + dy, SCREEN_HEIGHT - PLAYER_HEIGHT - 150));
      const newPos = { x: newX, y: newY };

      if (checkPortalCollision(newPos)) {
        setShouldNavigate(true);  // Set flag to trigger navigation outside render
      }

      return newPos;
    });
  };

  // UseEffect to trigger navigation after state update
  useEffect(() => {
    if (shouldNavigate) {
      navigation.navigate('TeleportScreen' as never);  // Navigate only after state has been updated
      setShouldNavigate(false);  // Reset the flag
    }
  }, [shouldNavigate, navigation]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.gameArea}>
        <ImageBackground
          source={require('../../../assets/images//backgrounds/background.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <Image
            source={playerSprites[direction][frameIndex]}
            style={[styles.player, { left: position.x, top: position.y, resizeMode: 'contain' }]}
          />
          <Image
            source={require('../../../assets/images/portal.png')}
            style={[styles.portal, { left: PORTAL_POSITION.x, top: PORTAL_POSITION.y }]}
          />
        </ImageBackground>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={() => movePlayer(0, -20, 'up')} style={styles.button}><Text>⬆️</Text></TouchableOpacity>
        <View style={styles.horizontal}>
          <TouchableOpacity onPress={() => movePlayer(-20, 0, 'left')} style={styles.button}><Text>⬅️</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => movePlayer(20, 0, 'right')} style={styles.button}><Text>➡️</Text></TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => movePlayer(0, 20, 'down')} style={styles.button}><Text>⬇️</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  player: {
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    position: 'absolute',
  },
  portal: {
    width: PORTAL_SIZE,
    height: PORTAL_SIZE,
    position: 'absolute',
  },
  controls: {
    backgroundColor: '#333333cc',
    paddingVertical: 15,
    paddingBottom: 30,
    alignItems: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 120,
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#fcbf49',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
});
