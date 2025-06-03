import React, { useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, PanResponder, Animated, Dimensions, TouchableOpacity } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Bin positions (horizontal, bottom)
const bins = [
  {
    color: 'green',
    label: 'Compostable',
    type: 'organic',
    x: SCREEN_WIDTH * 0.2,
    y: SCREEN_HEIGHT * 0.7,
    image: require('../../../assets/images/bins/green_bin.png'),
  },
  {
    color: 'blue',
    label: 'Recyclable',
    type: 'recyclable', // paper, plastic, glass, metal
    x: SCREEN_WIDTH * 0.5,
    y: SCREEN_HEIGHT * 0.7,
    image: require('../../../assets/images/bins/blue_bin.png'),
  },
  {
    color: 'red',
    label: 'Hazardous',
    type: 'hazardous', // electronic
    x: SCREEN_WIDTH * 0.8,
    y: SCREEN_HEIGHT * 0.7,
    image: require('../../../assets/images/bins/red_bin.png'),
  },
];

// Map trash types to correct bin color
const trashToBin = {
  organic: 'green',  // Compostable
  paper: 'blue',     // Recyclable
  plastic: 'blue',   // Recyclable
  glass: 'blue',     // Recyclable
  metal: 'blue',     // Recyclable (formerly 'can')
  electronic: 'red', // Hazardous
};

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'MiniGameScreen'>;

// Experience points earned for correct sorting
const XP_REWARD = 25;

export default function MiniGameScreen(props: Props) {
  const { route, navigation } = props;
  // route.params.trashType is expected
  // Select trash image and name based on type
  const trashImages = {
    metal: require('../../../assets/images/trash_sprite/can_trash.png'),
    organic: require('../../../assets/images/trash_sprite/organic_trash.png'),
    paper: require('../../../assets/images/trash_sprite/paper_trash.png'),
    plastic: require('../../../assets/images/trash_sprite/plastic_trash.png'),
    glass: require('../../../assets/liter/glass_trash.png'),
    electronic: require('../../../assets/liter/electronic_trash.png'),
  };
  
  // User-friendly names for each trash type
  const trashNames = {
    metal: 'Metal',
    organic: 'Organic',
    paper: 'Paper',
    plastic: 'Plastic',
    glass: 'Glass',
    electronic: 'Electronic',
  };
  type TrashType = keyof typeof trashImages;
  const validTrashType = (type: string): type is TrashType => type in trashImages;
  const trashType: TrashType = validTrashType(route?.params?.trashType) ? route.params.trashType : 'plastic';
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH / 2 - 48, y: SCREEN_HEIGHT * 0.3 })).current;
  const [dragging, setDragging] = useState(false);

  // Image dimensions for better positioning
  const TRASH_SIZE = 96;
  const TRASH_CENTER = TRASH_SIZE / 2;
  
  // PanResponder for drag
  const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setDragging(true);
      // Store the initial position of the trash for more accurate dragging
      pan.extractOffset();
    },
    onPanResponderMove: Animated.event([
      null,
      { dx: pan.x, dy: pan.y },
    ], { useNativeDriver: false }),
    onPanResponderRelease: (e, gesture) => {
      setDragging(false);
      
      // Calculate the center position of the trash item
      const trashCenterX = gesture.moveX;
      const trashCenterY = gesture.moveY;
      
      let found = false;
      for (const bin of bins) {
        // More accurate bin hit detection with improved distance calculation
        const distanceX = Math.abs(trashCenterX - bin.x);
        const distanceY = Math.abs(trashCenterY - bin.y);
        
        // Check if the trash is dropped on the correct bin
        // Adjusted bin size for better hit detection
        if (
          distanceX < 70 && // Wider hit area for horizontal detection
          distanceY < 90 && // Taller hit area for vertical detection
          trashToBin[trashType as keyof typeof trashToBin] === bin.color
        ) {
          setSuccess(true);
          setXpEarned(XP_REWARD);
          // Add XP to the pet
          addExperienceToPet(XP_REWARD);
          found = true;
          break;
        }
      }
      if (!found) {
        // Clear any previous error state
        setError(false);
        
        // Return to the original starting position
        Animated.spring(pan, {
          toValue: { x: SCREEN_WIDTH / 2 - 48, y: SCREEN_HEIGHT * 0.3 },
          friction: 7,     // Higher friction for less bounce
          tension: 80,     // Higher tension for quicker return
          useNativeDriver: false,
        }).start(() => {
          // Show error feedback after animation completes
          setError(true);
          // Auto-clear error message after 1.5 seconds
          setTimeout(() => {
            setError(false);
          }, 1500);
        });
      }
    },
  });

  // Function to add experience to the current pet
  const addExperienceToPet = async (amount: number) => {
    try {
      // Get current pet data
      const petDataStr = await AsyncStorage.getItem('currentPet');
      if (petDataStr) {
        const petData = JSON.parse(petDataStr);
        // Add experience
        petData.experience = (petData.experience || 0) + amount;
        // Check for level up logic can be added here
        
        // Save updated pet data
        await AsyncStorage.setItem('currentPet', JSON.stringify(petData));
        console.log(`Added ${amount} XP to pet. Total XP: ${petData.experience}`);
      }
    } catch (error) {
      console.error('Error updating pet experience:', error);
    }
  };

  const handleContinue = () => {
    setSuccess(false);
    navigation.goBack(); // Return to game or next step
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sort the Trash!</Text>
      <Text style={styles.subtitle}>Drag the trash to the correct bin</Text>
      {success && (
        <View style={styles.feedbackBox}>
          <Text style={styles.successText}>Correct! 🎉</Text>
          <Text style={styles.xpText}>+{xpEarned} XP for your pet!</Text>
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
      {error && !success && (
        <View style={styles.feedbackBox}>
          <Text style={styles.errorText}>Try Again!</Text>
        </View>
      )}
      {/* Bins */}
      {bins.map((bin, idx) => (
        <View key={bin.color} style={[styles.bin, { left: bin.x - 40, top: bin.y }]}> 
          <Image source={bin.image} style={styles.binImg} />
          <Text style={{ color: bin.color, fontWeight: 'bold', textAlign: 'center' }}>{bin.label}</Text>
        </View>
      ))}
      {/* Draggable trash */}
      {!success && (
        <Animated.View
          style={[styles.trash, { 
            transform: pan.getTranslateTransform(), 
            zIndex: dragging ? 10 : 1, // Higher zIndex when dragging for better visibility
          }]}
          {...responder.panHandlers}
        >
          <Image source={trashImages[trashType]} style={styles.trashImg} />
          <Text style={styles.trashName}>{trashNames[trashType]}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f6ea',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 40,
    color: '#1b5e20',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
  },
  bin: {
    position: 'absolute',
    width: 80,
    height: 120,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  binImg: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  trash: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  trashImg: {
    width: 96,
    height: 96,
    resizeMode: 'contain',
  },
  trashName: {
    position: 'absolute',
    bottom: -20,
    width: 96,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 4,
    padding: 2,
  },
  feedbackBox: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.15,
    left: SCREEN_WIDTH * 0.2,
    right: SCREEN_WIDTH * 0.2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    zIndex: 10,
    elevation: 4,
  },
  successText: {
    fontSize: 22,
    color: '#1b5e20',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  xpText: {
    fontSize: 18,
    color: '#ff9800',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 20,
    color: '#b71c1c',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  continueBtn: {
    backgroundColor: '#388e3c',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
});
