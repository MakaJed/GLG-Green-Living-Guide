import React, { useState, useRef, useEffect } from 'react';
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
    GameMainMap: undefined;
    TutorialBattle: undefined;
};

// Animation constants for sprite animations
const SPRITE_FRAME_DURATION = 200; // milliseconds per frame
const SPRITE_ANIMATION_STEPS = 4; // Number of animation frames

export default function Cutscene_1() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // New dialog based on the provided script
      const dialog = [
        { name: "NPC", message: "Hmph... whatever.", action: "npc_throws_trash" },
        { name: "", message: "*tosses trash on the ground*", action: "npc_walks_away" },
        { name: "???", message: "Hey! You just threw your trash on the ground!", action: "rheeyu_enters" },
        { name: "NPC", message: "...Oh great. Here comes Gardener Rheeyu...", action: "rheeyu_approaches" },
        { name: "Rheeyu", message: "That's NOT how we treat our planet! Littering pollutes our environment and harms wildlife!", action: "" },
        { name: "NPC", message: "Pfft, it's just one wrapper. Chill out.", action: "" },
        { name: "Rheeyu", message: "One wrapper today, a mountain tomorrow. Every piece counts.", action: "" },
        { name: "???", message: "RAAAAGHHH!!!", action: "trash_forming" },
        { name: "Trash Monster", message: "More trash... more power... Humans are careless... and I AM THE RESULT!", action: "trash_monster_appears" },
        { name: "", message: "Trash Monster fully spawns, towering and twitching.", action: "" },
        { name: "Rheeyu", message: "What?! A Trash Monster?!", action: "" },
        { name: "???", message: "!!!", action: "niku_enters" },
        { name: "???", message: "Rheeyu! What's going on?! I saw weird energy readings from here!", action: "" },
        { name: "Rheeyu", message: "Niku! A careless litterbug tossed his trash, and it summoned this thing!", action: "" },
        { name: "Rheeyu", message: "Do you have the Eco Buddies with you?", action: "rheeyu_to_niku" },
        { name: "Niku", message: "Right here!", action: "niku_shows_device" },
        { name: "Rheeyu", message: "Perfect. Let's teach this trash heap a lesson, and show our new friend here how Eco Buddies work.", action: "both_turn_to_player" },
        { name: "Niku", message: "Hey! You there! Want to help us? We'll show you how to use Eco Buddies.", action: "niku_smiles" },
        { name: "", message: "[Tutorial Begins: The game pauses slightly to give control to the player.]", action: "tutorial_begins" },
        { name: "Rheeyu", message: "Eco Buddies are eco-friendly companions with special powers. Use them wisely to defeat trash monsters.", action: "tutorial_voiceover" },
        { name: "Niku", message: "Each Eco Buddy has a unique skill! Recycle, reuse, or even reduce attacks! Let's test one out.", action: "tutorial_end" },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const introFadeAnim = useRef(new Animated.Value(1)).current;

    // Animation states
    const [hasStarted, setHasStarted] = useState(false);
    const [showDialogue, setShowDialogue] = useState(false);
    const [blackScreenVisible, setBlackScreenVisible] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [bufferVisible, setBufferVisible] = useState(false);
    
    // Sprite position and animation states
    const npcPosition = useRef(new Animated.Value(250)).current;
    const npcOpacity = useRef(new Animated.Value(1)).current;
    const rheeyuPosition = useRef(new Animated.Value(-100)).current;
    const nikuPosition = useRef(new Animated.Value(-100)).current;
    const trashOpacity = useRef(new Animated.Value(0)).current;
    const trashMonsterScale = useRef(new Animated.Value(0.2)).current;
    const trashMonsterOpacity = useRef(new Animated.Value(0)).current;
    const shakeAnimation = useRef(new Animated.Value(0)).current;
    
    // Sprite animation frame state
    const [spriteFrame, setSpriteFrame] = useState(0);
    const spriteAnimationTimer = useRef<NodeJS.Timeout | null>(null);

    // Start sprite animation cycle
    useEffect(() => {
        if (showDialogue) {
            spriteAnimationTimer.current = setInterval(() => {
                setSpriteFrame(prev => (prev + 1) % SPRITE_ANIMATION_STEPS);
            }, SPRITE_FRAME_DURATION);
        }
        
        return () => {
            if (spriteAnimationTimer.current) {
                clearInterval(spriteAnimationTimer.current);
            }
        };
    }, [showDialogue]);

    // Execute action animations based on dialog cues
    useEffect(() => {
        if (!showDialogue) return;
        
        const currentAction = dialog[currentIndex].action;
        
        switch (currentAction) {
            case 'npc_throws_trash':
                // NPC present in starting position
                break;
                
            case 'npc_walks_away':
                Animated.timing(npcPosition, {
                    toValue: 400,
                    duration: 2000,
                    useNativeDriver: true
                }).start();
                Animated.timing(npcOpacity, {
                    toValue: 100,
                    duration: 1500,
                    useNativeDriver: true
                }).start();
                Animated.timing(trashOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true
                }).start();
                break;
                
            case 'rheeyu_enters':
                Animated.timing(rheeyuPosition, {
                    toValue: 150,
                    duration: 800,
                    useNativeDriver: true
                }).start();
                break;
                
            case 'trash_forming':
                // Create shake animation
                Animated.sequence([
                    Animated.timing(shakeAnimation, {
                        toValue: 10,
                        duration: 100,
                        useNativeDriver: true
                    }),
                    Animated.timing(shakeAnimation, {
                        toValue: -10,
                        duration: 100,
                        useNativeDriver: true
                    }),
                    Animated.timing(shakeAnimation, {
                        toValue: 10,
                        duration: 100,
                        useNativeDriver: true
                    }),
                    Animated.timing(shakeAnimation, {
                        toValue: -10,
                        duration: 100,
                        useNativeDriver: true
                    }),
                    Animated.timing(shakeAnimation, {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: true
                    })
                ]).start();
                // Start fading in the trash monster at the trash position
                Animated.timing(trashMonsterOpacity, {
                    toValue: 0.5,
                    duration: 80,
                    useNativeDriver: true
                }).start();
                Animated.timing(trashOpacity, {
                    toValue: 0,
                    duration: 10,
                    useNativeDriver: true
                }).start();
                break;
                
            case 'trash_monster_appears':
                Animated.parallel([
                    Animated.timing(trashMonsterScale, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true
                    }),
                    Animated.timing(trashMonsterOpacity, {
                        toValue: 1,
                        duration: 120,
                        useNativeDriver: true
                    })
                ]).start();
                break;
                
            case 'niku_enters':
                Animated.timing(nikuPosition, {
                    toValue: 150,
                    duration: 800,
                    useNativeDriver: true
                }).start();
                break;
                
            case 'tutorial_end':
                // Set a timer to navigate to the tutorial battle after this dialog
                setTimeout(() => {
                    navigation.navigate('TutorialBattle');
                }, 2000);
                break;
                
            default:
                // No specific animation for this dialog
                break;
        }
    }, [currentIndex, showDialogue]);

    const getCurrentLineParts = () => {
        return dialog[currentIndex];
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

        if (currentIndex < dialog.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            navigation.navigate('TutorialBattle');
        }
    };

    const handleIntroScreenPress = () => {
        if (hasStarted) return;

        setHasStarted(true);

        Animated.timing(introFadeAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
        }).start(() => {
            setBlackScreenVisible(false);
            setBufferVisible(true);
            setTimeout(() => {
                setBufferVisible(false);
                setShowDialogue(true);
            }, 2000);
        });
    };

    // Render character sprites based on the current dialog
    const renderSprites = () => {
        if (!showDialogue || bufferVisible) return null;

        // Get the current sprite frame for animation
        const frameOffset = spriteFrame * 32; // Assuming 32px is the width of each frame
        
        return (
            <>
                {/* NPC Character */}
                <Animated.Image 
                    source={require('../../../assets/images/player_sprite/player_down1.png')} 
                    style={[
                        styles.image_sprite,
                        {
                            transform: [
                                { translateX: npcPosition },
                                { translateY: 0 }
                            ],
                            opacity: npcOpacity,
                            left: -20,
                            width: 44,
                            height: 68,
                        }
                    ]}
                />
                
                {/* Trash on the ground */}
                <Animated.Image 
                    source={require('../../../assets/images/enemy_sprite/trashmonster1.png')} 
                    style={[
                        styles.trashImage,
                        { opacity: trashOpacity }
                    ]}
                />
                
                {/* Rheeyu Character */}
                <Animated.Image 
                    source={require('../../../assets/images/player_sprite/player_down1.png')} 
                    style={[
                        styles.image_sprite,
                        {
                            transform: [
                                { translateX: rheeyuPosition }
                            ],
                            left: -100,
                            width: 44,
                            height: 68,
                        }
                    ]}
                />
                
                {/* Niku Character */}
                <Animated.Image 
                    source={require('../../../assets/images/player_sprite/player_down1.png')} 
                    style={[
                        styles.image_sprite,
                        {
                            transform: [
                                { translateX: nikuPosition }
                            ],
                            left: -30,
                            width: 44,
                            height: 68,
                        }
                    ]}
                />
                
                {/* Trash Monster */}
                <Animated.Image 
                    source={require('../../../assets/images/enemy_sprite/phantompaper.png')}
                    style={[
                        styles.trashMonsterImage,
                        {
                            transform: [
                                { scale: trashMonsterScale },
                                { translateX: shakeAnimation }
                            ],
                            position: "absolute",
                            bottom: 260,
                            left: 250,
                            width: 44,
                            height: 48,
                            opacity: trashMonsterOpacity
                        }
                    ]}
                />
            </>
        );
    };

    const showClickHint = currentIndex === 0;

    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                <Animated.View 
                    style={[
                        styles.container_inner,
                        {
                            transform: [{ translateX: shakeAnimation }]
                        }
                    ]}
                >
                    <ImageBackground
                        source={require('../../../assets/images/cutscene1/pellet_town_1.png')}
                        style={{ width: 500, height: 1000 }}
                    >
                        {renderSprites()}
                    </ImageBackground>

                    {showDialogue && (
                        <>
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

                            {showClickHint && (
                                <Text style={styles.clickHint}>Click the dialog box!</Text>
                            )}
                        </>
                    )}

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

                    <Animated.View
                        style={[styles.blackOverlay, { opacity: fadeAnim }]}
                        pointerEvents={isTransitioning ? 'auto' : 'none'}
                    />
                </Animated.View>
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
    trashImage: {
        height: 40,
        width: 40,
        position: "absolute",
        bottom: 260,
        left: 250,
        zIndex: 1
    },
    trashMonsterImage: {
        height: 180,
        width: 180,
        position: "absolute",
        bottom: 80,
        right: 150,
    },
    backgroundimg_dialoguebox: {
        width: 395,
        height: 200,
        margin: 40,
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
        fontSize: 23,
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
        fontSize: 18,
        marginHorizontal: 50,
        marginTop: 25,
        marginBottom: 10,
    },
    clickHint: {
        position: 'absolute',
        bottom: 80,
        alignSelf: 'center',
        fontSize: 18,
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        fontFamily: 'PixelifySans-Bold',
        zIndex: 11,
        opacity: 0.30,
    }
});