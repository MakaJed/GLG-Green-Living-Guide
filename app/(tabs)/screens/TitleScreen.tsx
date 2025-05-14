import React from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  LoadSaveScreen: undefined;
  Cutscene_1: undefined;
};
export default function TitleScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
            <View style={[{}]}>
                <ImageBackground
                    source={require('../../../assets/images/backgrounds/title_screen.png')}
                    style={styles.image_background}
                >
                <ImageBackground
                    source={require('../../../assets/images/title_logo.png')}
                    style={[styles.image, {alignSelf: "center", marginTop: 50}]}
                >
                </ImageBackground>
                <View style={styles.button_area}>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Cutscene_1')}>
                        <Text style={styles.button_text}>Start Game</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoadSaveScreen')}>
                        <Text style={styles.button_text}>Load Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.button_text}>Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.button_text}>Exit</Text>
                    </TouchableOpacity>
                </View>
                </ImageBackground>
            </View>
        </View>
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center"
    },
    image: {
        width: 300,
        height: 300
    },
    image_background: {
        width: 500,
        height: 1000,
    },
    button_area: {
        verticalAlign: "middle",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 50
    },
    button: {
        margin: 20,
        width: 300,
        verticalAlign: "middle",
        justifyContent: "center",
        
    },
    button_text: {
        textAlign: "center",
        fontSize: 40,
        color: "white",
        fontFamily: "Pixelify Sans"
    }

});