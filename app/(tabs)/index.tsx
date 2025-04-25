import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { Platform } from 'react-native';
import GameScreen from './screens/GameScreen';
import TeleportScreen from './screens/TeleportScreen';
import TitleScreen from './screens/TitleScreen';
import LoadSaveScreen from './screens/LoadSaveScreen'

const Stack = createStackNavigator();

const App = () => {
  return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: false,
          cardStyleInterpolator: Platform.OS === 'ios'
            ? CardStyleInterpolators.forHorizontalIOS
            : CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      >
        <Stack.Screen name="LoadSaveScreen" component={LoadSaveScreen} />
        <Stack.Screen name="TitleScreen" component={TitleScreen} />
        <Stack.Screen name="GameScreen" component={GameScreen} />
        <Stack.Screen name="TeleportScreen" component={TeleportScreen} />
      </Stack.Navigator>
  );
};

export default App;
