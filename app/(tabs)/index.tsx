import React from 'react';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator, Platform } from 'react-native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

import GameScreen from './screens/GameScreen';
import TeleportScreen from './screens/TeleportScreen';
import TitleScreen from './screens/TitleScreen';
import LoadSaveScreen from './screens/LoadSaveScreen';
import Cutscene_1 from './screens/Cutscene_1';
import GameMainMap from './screens/game';

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    'PixelifySans-Regular': require('../../assets/fonts/PixelifySans-Regular.ttf'),
    'PixelifySans-Bold': require('../../assets/fonts/PixelifySans-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: false,
          cardStyleInterpolator:
            Platform.OS === 'ios'
              ? CardStyleInterpolators.forHorizontalIOS
              : CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      >
        <Stack.Screen name="TitleScreen" component={TitleScreen} />
        <Stack.Screen name="Cutscene_1" component={Cutscene_1} />
        <Stack.Screen name="LoadSaveScreen" component={LoadSaveScreen} />
        <Stack.Screen name="GameScreen" component={GameScreen} />
        <Stack.Screen name='GameMainMap' component={GameMainMap} />
        <Stack.Screen name="TeleportScreen" component={TeleportScreen} />
      </Stack.Navigator>
  );
}
