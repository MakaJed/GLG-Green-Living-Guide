import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
  ImageBackground,
} from 'react-native';

type Position = { x: number; y: number };
type Direction = 'up' | 'down' | 'left' | 'right';

const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 64;

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const playerSprites = {
  up: [
    require('../../assets/images/player_sprite/player_up1.png'),
    require('../../assets/images/player_sprite/player_up2.png'),
    require('../../assets/images/player_sprite/player_up3.png'),
    require('../../assets/images/player_sprite/player_up4.png'),
  ],
  down: [
    require('../../assets/images/player_sprite/player_down1.png'),
    require('../../assets/images/player_sprite/player_down2.png'),
    require('../../assets/images/player_sprite/player_down3.png'),
    require('../../assets/images/player_sprite/player_down4.png'),
  ],
  left: [
    require('../../assets/images/player_sprite/player_left1.png'),
    require('../../assets/images/player_sprite/player_left2.png'),
    require('../../assets/images/player_sprite/player_left3.png'),
    require('../../assets/images/player_sprite/player_left4.png'),
  ],
  right: [
    require('../../assets/images/player_sprite/player_right1.png'),
    require('../../assets/images/player_sprite/player_right2.png'),
    require('../../assets/images/player_sprite/player_right3.png'),
    require('../../assets/images/player_sprite/player_right4.png'),
  ],
};

export default function App() {
  const [position, setPosition] = useState<Position>({ x: 100, y: 100 });
  const [direction, setDirection] = useState<Direction>('down');
  const [frameIndex, setFrameIndex] = useState<number>(0);
  const [isWalking, setIsWalking] = useState<boolean>(false);

  const startWalkingAnimation = (dir: Direction) => {
    if (isWalking) return; // prevent overlapping animations
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

  const movePlayer = (dx: number, dy: number, dir: Direction) => {
    setDirection(dir);
    startWalkingAnimation(dir);

    setPosition(prev => ({
      x: Math.max(0, Math.min(prev.x + dx, SCREEN_WIDTH - PLAYER_WIDTH)),
      y: Math.max(0, Math.min(prev.y + dy, SCREEN_HEIGHT - PLAYER_HEIGHT - 120)),      
    }));
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.container}
        resizeMode="cover"
      >
      <Image
        source={playerSprites[direction][frameIndex]}
        style={[
          styles.player,
          {
            left: position.x,
            top: position.y,
            resizeMode: 'contain',
          },
        ]}
      />
      </ImageBackground>

      <View style={styles.controls}>
        <TouchableOpacity onPress={() => movePlayer(0, -10, 'up')} style={styles.button}><Text>⬆️</Text></TouchableOpacity>
        <View style={styles.horizontal}>
          <TouchableOpacity onPress={() => movePlayer(-10, 0, 'left')} style={styles.button}><Text>⬅️</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => movePlayer(10, 0, 'right')} style={styles.button}><Text>➡️</Text></TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => movePlayer(0, 10, 'down')} style={styles.button}><Text>⬇️</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  player: {
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'absolute',
    bottom: 0,
    width: '100%',
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
