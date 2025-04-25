import React from 'react-native';
import { View, Text, Image, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';

export default function TitleScreen() {

    return (
        <View style={styles.container}>
            <View style={[{}]}>
                <ImageBackground
                    source={require('../../../assets/images/backgrounds/title_screen.png')}
                    style={styles.image_background}
                >
                <View style={styles.button_area}>
                        <Text style={[styles.button_text, {margin: 20}]}>Load Save</Text>
                    <View style={styles.smaller_container}>
                        <View style={[{marginTop: 20}]}>
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
        alignSelf: "center",
        backgroundColor: 'rgba(139, 139, 139, 0.85)',
        marginVertical: 20,
    },
    button_text: {
        textAlign: "center",
        fontSize: 40,
        color: "white",
        fontFamily: "Pixelify Sans"
    }

});