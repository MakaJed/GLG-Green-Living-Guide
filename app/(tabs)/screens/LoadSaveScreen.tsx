import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  TitleScreen: undefined;
};

export default function LoadSaveScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <View>
        <ImageBackground
          source={require('../../../assets/images/backgrounds/title_screen.png')}
          style={styles.image_background}
        >
          <View style={styles.save_list}>
            <TouchableOpacity
              style={{ alignSelf: "flex-start" }}
              onPress={() => navigation.navigate('TitleScreen')}
            >
              <Text style={{ color: "white", fontSize: 40, marginVertical: 20 }}> 🡨 </Text>
            </TouchableOpacity>

            <Text style={[styles.button_text, { marginBottom: 10 }]}>LOAD SAVE</Text>

            <View style={styles.smaller_container}>
              <View style={{ marginTop: 20 }}>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.button_text}>Save #1</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.button_text}>Save #2</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  smaller_container: {
    width: 400,
    height: 700,
    backgroundColor: 'rgba(202, 202, 202, 0.85)',
    marginVertical: 20,
  },
  image_background: {
    width: 500,
    height: 1000,
  },
  save_list: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  button: {
    margin: 20,
    width: 300,
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: 'rgba(139, 139, 139, 0.85)',
    marginVertical: 20,
    opacity: 0.7,
  },
  button_text: {
    textAlign: "center",
    fontSize: 40,
    color: "white",
    fontFamily: "Pixelify Sans",
  },
});
