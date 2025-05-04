import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    GameScreen: undefined;
};

export default function Cutscene_1() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const dialog_ProfJed_v1 = [
        { name: "???", message: "..!" },
        { name: "Prof. Jed", message: "Welcome, Eco-Adventurer! I'm Prof. Jed, and you've arrived at a critical time." },
        { name: "Prof. Jed", message: "Pollution threatens our beautiful world... but with the right knowledge, and a little help — we can fight back!" },
        { name: "Prof. Jed", message: "This is your first day as a GLG Trainer." },
        { name: "Prof. Jed", message: "Get ready for your adventure!" },
        { name: "Prof. Jed", message: "..." }
    ];

    const dialog_ProfJed_v2 = [
        { name: "Prof. Jed", message: "These Trash Monsters were born from careless waste. But don't lose hope, we have ways to fight back!" }
    ];

    const dialog_Rheeyu = [
        { name: "???", message: "..!" },
        { name: "Rheeyu", message: "Hiya! I'm Gardener Rheeyu. Nature's on your side!" },
        { name: "Rheeyu", message: "With the power of recycling, composting, and proper disposal, we can defeat these monsters!" }
    ];

    const dialog_Niku = [
        { name: "???", message: "Hey there!" },
        { name: "Niku", message: "I'm Pet Ranger Niku! You'll choose a loyal eco-companion to battle beside you." },
        { name: "Niku", message: "Together, you'll grow stronger and protect our Earth!" }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [dialogueSet, setDialogueSet] = useState(1);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const introFadeAnim = useRef(new Animated.Value(1)).current;

    const [hasStarted, setHasStarted] = useState(false);
    const [showDialogue, setShowDialogue] = useState(false);
    const [blackScreenVisible, setBlackScreenVisible] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [bufferVisible, setBufferVisible] = useState(false);

    const getCurrentDialogues = () => {
        switch (dialogueSet) {
            case 1: return dialog_ProfJed_v1;
            case 2: return dialog_ProfJed_v2;
            case 3: return dialog_Rheeyu;
            case 4: return dialog_Niku;
            default: return [];
        }
    };

    const getCurrentLineParts = () => {
        const currentDialogues = getCurrentDialogues();
        return currentDialogues[currentIndex];
    };

    const renderCharacterSprite = () => {
        // Only render the sprite when dialogue is shown and buffer phase is complete
        if (!showDialogue || bufferVisible) return null;
    
        if (dialogueSet === 1 || dialogueSet === 2) {
            return <Image source={require('../../../assets/images/portraits/ProfJed_Sprite.png')} style={styles.image_sprite} />;
        } else if (dialogueSet === 3) {
            return <Image source={require('../../../assets/images/portraits/Rheeyu_Sprite.png')} style={styles.image_sprite} />;
        } else if (dialogueSet === 4) {
            return <Image source={require('../../../assets/images/portraits/Niku_Sprite.png')} style={styles.image_sprite} />;
        } else {
            return null;
        }
    };
       
    const triggerFadeTransition = (callback?: () => void) => {
        setIsTransitioning(true);
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsTransitioning(false);
            if (callback) callback();
        });
    };

    const handleNextDialogue = () => {
        if (isTransitioning || !showDialogue) return;

        const currentDialogues = getCurrentDialogues();
        if (currentIndex < currentDialogues.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            if (dialogueSet === 1) {
                triggerFadeTransition(() => {
                    setDialogueSet(2);
                    setCurrentIndex(0);
                });
            } else if (dialogueSet === 2) {
                setDialogueSet(3);
                setCurrentIndex(0);
            } else if (dialogueSet === 3) {
                setDialogueSet(4);
                setCurrentIndex(0);
            } else {
                navigation.navigate('GameScreen');
            }
        }
    };

    const handleIntroScreenPress = () => {
        if (hasStarted) return;
    
        setHasStarted(true);
    
        // Fade out the intro screen
        Animated.timing(introFadeAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
        }).start(() => {
            setBlackScreenVisible(false);
    
            // Show background only for 2 seconds (buffer phase)
            setBufferVisible(true);
            setTimeout(() => {
                setBufferVisible(false);  // End buffer phase
                setShowDialogue(true);    // Show dialogue box and character sprite simultaneously
            }, 2000);
        });
    };    

    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                <View style={styles.container_inner}>
                    <ImageBackground
                        source={require('../../../assets/images/cutscene1/pellet_town_1.png')}
                        style={{ width: 500, height: 1000 }}
                    >
                        {renderCharacterSprite()}
                    </ImageBackground>

                    {showDialogue && (
                        <ImageBackground
                            source={require('../../../assets/images/DialogueBox.png')}
                            style={styles.backgroundimg_dialoguebox}
                        >
                            <TouchableOpacity
                                onPress={handleNextDialogue}
                                activeOpacity={0.7}
                                style={styles.dialogueTouchableArea}
                            >
                                {(() => {
                                    const { name, message } = getCurrentLineParts();
                                    return (
                                        <>
                                            {name !== "" && <Text style={styles.character_name}>{name}</Text>}
                                            <Text style={styles.text_dialogue}>{message}</Text>
                                        </>
                                    );
                                })()}
                            </TouchableOpacity>
                        </ImageBackground>
                    )}

                    {/* Black intro screen */}
                    {blackScreenVisible && (
                        <Animated.View
                            style={[styles.blackOverlay, { opacity: introFadeAnim }]}
                            pointerEvents="auto"
                        >
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                activeOpacity={1}
                                onPress={handleIntroScreenPress}
                            >
                                <Text style={styles.blackScreenText}>Tap to start your adventure!</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {/* Removed the standalone tapToStart text that was redundant */}
                    
                    {/* Transition fade between dialogue sets */}
                    <Animated.View
                        style={[styles.blackOverlay, { opacity: fadeAnim }]}
                        pointerEvents={isTransitioning ? 'auto' : 'none'}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    blackOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
        zIndex: 10,
    },
    blackScreenText: {
        color: 'white',
        fontSize: 24,
        fontFamily: 'PixelifySans-Bold',
        textAlign: 'center',
        position: 'absolute',
        top: '50%',
        width: '100%',
        marginTop: -12,
    },
    container: {
        flex: 1,
        alignItems: "center",
        alignContent: "center",
        alignSelf: "center",
        height: 1000,
        width: 500
    },
    container_inner: {
        backgroundColor: "lightgray",
        height: 1000,
        width: 500,
        alignItems: "center"
    },
    image_sprite: {
        height: 250,
        width: 250,
        position: "absolute",
        bottom: 0,
        marginBottom: 280
    },
    backgroundimg_dialoguebox: {
        width: 475,
        height: 250,
        margin: 50,
        position: "absolute",
        bottom: 0,
        alignItems: "center",
        justifyContent: "flex-start",
    },
    dialogueTouchableArea: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    character_name: {
        fontFamily: "PixelifySans-Bold",
        fontSize: 30,
        marginBottom: 5,
        marginHorizontal: 50,
        marginTop: 30,
        textAlign: "left",
        alignSelf: "flex-start",
        top: 0,
        position: "absolute"
    },
    text_dialogue: {
        textAlign: "left",
        fontFamily: "Pixelify Sans",
        justifyContent: "flex-start",
        alignSelf: "flex-start",
        fontSize: 25,
        marginHorizontal: 50,
        marginTop: 25,
        marginBottom: 10,
    }
});