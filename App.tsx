import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PetSelectionScreen from './app/(tabs)/PetSelectionScreen';
import BattleScreen from './app/(tabs)/BattleScreen';
import { RootStackParamList } from './app/types';
import Game from './game';
import { LogBox } from 'react-native';

// Ignore specific navigation warnings that may occur during development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
<<<<<<< HEAD
          headerShown: false,
=======
>>>>>>> c536d63f11bf8dd0bfe36629a21601cdc7751e22
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          gestureEnabled: false, // Disable swipe gestures between screens
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={Game}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PetSelection" 
          component={PetSelectionScreen}
          options={{ 
            title: 'Choose Your Pet',
            // Disable going back to game until battle is complete
            headerBackVisible: false
          }}
        />
        <Stack.Screen 
          name="Battle" 
          component={BattleScreen}
          options={{ 
            title: 'Battle!',
            // Disable going back during battle
            headerBackVisible: false 
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 