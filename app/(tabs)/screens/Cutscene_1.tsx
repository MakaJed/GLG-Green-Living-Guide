import React, { ImageBackground } from 'react-native';
import { View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';

export default function Cutscene_1() {
    return (
        <View style={styles.container}>
            <View style={[{flex: 1}]}>
                <Text style={styles.text_title}>This is a sample text of the 1st cutscene</Text>
                    <View style={[styles.container_inner, {}]}>
                        <View style={[]}>

                        </View>
                        <ImageBackground
                            source={require('../../../assets/images/DialogueBox.png')}
                            style={[styles.backgroundimg_dialoguebox]}
                        >
                            <Text style={styles.text_dialogue}>Sample Dialogue Text blablabla</Text>
                        </ImageBackground>
                    </View>
            </View>

            <View style={[{alignSelf: "flex-end", flex: 1, marginBottom: 100, justifyContent: "flex-end"}]}>
                <TouchableOpacity style={styles.button_next}>

                        <Text style={styles.button_next_text}>NEXT</Text>
                    
                </TouchableOpacity>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        alignContent: "center",
        alignSelf: "center",
        marginTop: 30
    },
    container_inner: {
        position: "relative",
        marginVertical: 20,
        backgroundColor: "lightgray",
        justifyContent: "flex-end",
        height: 700,
        width: 500
    },
    backgroundimg_dialoguebox: {
        flex: 1,
        width: 400,
        height: 215,
    },
    text_title: {
        fontSize: 20,
        fontFamily: "Pixelify Sans"
    },
    button_next: {
        justifyContent: "center",
        backgroundColor: "gray",
        width: 100,
        height: 50
    },
    button_next_text: {
        textAlign: "center",
        fontFamily: "Pixelify Sans",
        fontSize: 30
    },
    text_dialogue: {
        textAlign: "center",
        fontFamily: "Pixelify Sans",
        fontSize: 30,
        marginVertical: 20
    }
})