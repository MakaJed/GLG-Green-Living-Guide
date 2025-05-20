import { NativeStackNavigationOptions, NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import GameScreen from './screens/GameScreen';
import TeleportScreen from './screens/TeleportScreen';
import TitleScreen from './screens/TitleScreen';
import LoadSaveScreen from './screens/LoadSaveScreen';
import Cutscene_1 from './screens/Cutscene_1';
import Game from './screens/game';
import TutorialScreen from './screens/TutorialScreen';
import PetSelectionScreen from './screens/PetSelectionScreen';
import BattleScreen from './screens/BattleScreen';

type Screen = {
  name: keyof RootStackParamList;
  component: React.ComponentType<any>;
  options?: NativeStackNavigationOptions;
};
// ✅ Root stack type
export type RootStackParamList = {
  TitleScreen: undefined;
  Cutscene_1: undefined;
  LoadSaveScreen: undefined;
  GameScreen: undefined;
  GameMainMap: undefined;
  TeleportScreen: undefined;
  TutorialScreen: { onTutorialComplete: () => void };
  Home: undefined;
  PetSelection: { enemy?: string };
  Battle: { pet: string; enemy?: string };
};

// ✅ Screens array for use in index.tsx
export const screens: Screen[] = [
  { name: 'TitleScreen', component: TitleScreen },
  { name: 'Cutscene_1', component: Cutscene_1},
  { name: 'LoadSaveScreen', component: LoadSaveScreen },
  { name: 'GameScreen', component: GameScreen },
  { name: 'GameMainMap', component: Game },
  { name: 'TeleportScreen', component: TeleportScreen },
  { name: 'TutorialScreen', component: TutorialScreen },
  { name: 'Home', component: Game },
  {
    name: 'PetSelection',
    component: PetSelectionScreen,
    options: {
      headerShown: true,
      title: 'Choose Your Pet',
      headerBackVisible: false,
    },
  },
  {
    name: 'Battle',
    component: BattleScreen,
    options: {
      headerShown: true,
      title: 'Battle!',
      headerBackVisible: false,
    },
  },
] as const;

// ✅ Navigation prop helpers
export type NavigationProp<T extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, T>;

export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
