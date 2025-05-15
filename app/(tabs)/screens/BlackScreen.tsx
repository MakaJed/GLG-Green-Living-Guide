import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Game: undefined;
  Teleport: undefined;
  Black: { target: 'Game' | 'Teleport' };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'Black'>;

const BlackScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { target } = route.params;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate(target); // ✅ safe now: only 'Game' or 'Teleport'
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation, target]);

  return <View style={styles.container} />;
};

export default BlackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
