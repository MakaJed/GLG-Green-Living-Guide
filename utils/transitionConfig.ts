import { CardStyleInterpolators } from '@react-navigation/stack';
import { Platform } from 'react-native';

export const createTransitionConfig = () => {
  return {
    cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid, // fade for both platforms
  };
};
