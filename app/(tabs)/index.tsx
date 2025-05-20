import React from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { screens, RootStackParamList } from './types';

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const Stack = createNativeStackNavigator();

type Screen = {
  name: keyof RootStackParamList;
  component: React.ComponentType<any>;
};

const typedScreens: Screen[] = screens;


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
        initialRouteName="TitleScreen"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animation: 'fade',
        }}
      >
        {typedScreens.map(({ name, component }) => (
          <Stack.Screen
            key={name}
            name={name}
            component={component}
          />
        ))}

      </Stack.Navigator>
  );
}
