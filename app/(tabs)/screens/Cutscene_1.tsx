import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    Animated,
    ImageSourcePropType,
    Easing,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Font from 'expo-font';

type RootStackParamList = {
    GameMainMap: undefined;
    TutorialScreen: undefined;
    Cutscene_1: undefined;
};

// Animation constants for sprite animations
const SPRITE_FRAME_DURATION = 100; // milliseconds per frame
const SPRITE_ANIMATION_STEPS = 4; // Number of animation frames
const FRAME_WIDTH = 64; // width of each frame for NPC, Rheeyu, Niku walking sprites
const FRAME_HEIGHT = 100;

// Standing sprite dimensions
const STANDING_SPRITE_WIDTH = 64; // width for standing sprites
const STANDING_SPRITE_HEIGHT = 100; // height for standing sprites

// Load fonts
const loadFonts = async () => {
    await Font.loadAsync({
        'Stardew Valley': require('../../../assets/fonts/Stardew_Valley.otf'),
    });
};

export default function Cutscene_1() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        loadFonts().then(() => {
            setFontsLoaded(true);
        });
    }, []);

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Cutscene_1'>>();

    // Dialog script
    const dialog = [
        { name: "NPC", message: "Hmph... whatever.", action: "npc_throws_trash", portrait: require('../../../assets/images/portraits/Dialog_Empty.png') },
        { name: "", message: "[NPC tosses trash on the ground]", action: "npc_walks_away", portrait: require('../../../assets/images/portraits/Dialog_Empty.png') },
        { name: "???", message: "Hey! You just threw your trash on the ground!", action: "rheeyu_enters", portrait: require('../../../assets/images/portraits/Dialog_Rheeyu_Sprite.png') },
        { name: "", message: "[You, the player, enter the scene.]", action: "player_enters", portrait: require('../../../assets/images/portraits/Dialog_Empty.png') },
        { name: "NPC", message: "...Oh great. Here comes Gardener Rheeyu...", action: "rheeyu_approaches", portrait: require('../../../assets/images/portraits/Dialog_Empty.png') },
        { name: "Rheeyu", message: "That's NOT how we treat our planet! Littering pollutes our environment and harms wildlife!", action: "rheeyu_stand", portrait: require('../../../assets/images/portraits/Dialog_Rheeyu_Sprite.png') },
        { name: "NPC", message: "Pfft, it's just one wrapper. Chill out.", action: "npc_stand", portrait: require('../../../assets/images/portraits/Dialog_Empty.png') },
        { name: "Rheeyu", message: "One wrapper today, a mountain tomorrow. Every piece counts.", action: "rheeyu_stand", portrait: require('../../../assets/images/portraits/Dialog_Rheeyu_Sprite.png') },
        { name: "???", message: "RAAAAGHHH!!!", action: "trash_forming", portrait: require('../../../assets/images/portraits/Dialog_Empty.png') },
        { name: "Trash Monster", message: "More trash... more power... Humans are careless... and I AM THE RESULT!", action: "trash_monster_appears", portrait: require('../../../assets/images/portraits/Dialog_Empty.png') },
        { name: "", message: "[Trash Monster fully spawns, towering and twitching.]", action: "", portrait: require('../../../assets/images/portraits/Dialog_Empty.png') },
        { name: "Rheeyu", message: "What?! A Trash Monster?!", action: "rheeyu_shocked", portrait: require('../../../assets/images/portraits/Dialog_Rheeyu_Sprite.png') },
        { name: "???", message: "!!!", action: "niku_enters", portrait: require('../../../assets/images/portraits/Dialog_Niku_Sprite.png') },
        { name: "???", message: "Rheeyu! What's going on?! I saw weird energy readings from here!", action: "niku_stand", portrait: require('../../../assets/images/portraits/Dialog_Niku_Sprite.png') },
        { name: "Rheeyu", message: "Niku! A careless litterbug tossed his trash, and it summoned this thing!", action: "rheeyu_stand", portrait: require('../../../assets/images/portraits/Dialog_Rheeyu_Sprite.png') },
        { name: "Rheeyu", message: "Do you have the Eco Buddies with you?", action: "rheeyu_to_niku", portrait: require('../../../assets/images/portraits/Dialog_Rheeyu_Sprite.png') },
        { name: "Niku", message: "Right here!", action: "niku_shows_device", portrait: require('../../../assets/images/portraits/Dialog_Niku_Sprite.png') },
        { name: "Rheeyu", message: "Perfect. Let's teach this trash heap a lesson, and show our new friend here how Eco Buddies work.", action: "both_turn_to_player", portrait: require('../../../assets/images/portraits/Dialog_Rheeyu_Sprite.png') },
        { name: "Niku", message: "Hey! You there! Want to help us? We'll show you how to use Eco Buddies.", action: "niku_smiles", portrait: require('../../../assets/images/portraits/Dialog_Niku_Sprite.png') },
        { name: "Rheeyu", message: "Eco Buddies are eco-friendly companions with special powers. Use them wisely to defeat trash monsters.", action: "tutorial_voiceover", portrait: require('../../../assets/images/portraits/Dialog_Rheeyu_Sprite.png') },
        { name: "Niku", message: "Each Eco Buddy has a unique skill! Recycle, reuse, or even reduce attacks! Let's test one out.", action: "tutorial_end", portrait: require('../../../assets/images/portraits/Dialog_Niku_Sprite.png') },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const introFadeAnim = useRef(new Animated.Value(1)).current;

    const [hasStarted, setHasStarted] = useState(false);
    const [showDialogue, setShowDialogue] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [bufferVisible, setBufferVisible] = useState(false);
    const [blackScreenVisible, setBlackScreenVisible] = useState(true);

    // Animated positions and opacity for characters
    const npcPosition = useRef(new Animated.Value(250)).current;
    const npcOpacity = useRef(new Animated.Value(1)).current;
    const rheeyuPosition = useRef(new Animated.Value(-100)).current;
    const nikuPosition = useRef(new Animated.Value(-100)).current;
    const playerPosition = useRef(new Animated.Value(600)).current;
    const trashOpacity = useRef(new Animated.Value(0)).current;
    const paperTrashOpacity = useRef(new Animated.Value(0)).current;
    const trashMonsterScale = useRef(new Animated.Value(0.2)).current;
    const trashMonsterOpacity = useRef(new Animated.Value(0)).current;
    const shakeAnimation = useRef(new Animated.Value(0)).current;

    // Sprite animation frame state
    const [spriteFrame, setSpriteFrame] = useState(0);
    const [animateNpc, setAnimateNpc] = useState(false);
    const [animateRheeyu, setAnimateRheeyu] = useState(false);
    const [animateNiku, setAnimateNiku] = useState(false);
    const [animatePlayer, setAnimatePlayer] = useState(false);

    // Character sprite sources state (default to standing sprites)
    const [npcSprite, setNpcSprite] = useState<ImageSourcePropType>(require('../../../assets/images/npc_sprite/RightNPCStand.png'));
    const [rheeyuSprite, setRheeyuSprite] = useState<ImageSourcePropType>(require('../../../assets/images/npc_sprite/RightRheeyuStand.png'));
    const [nikuSprite, setNikuSprite] = useState<ImageSourcePropType>(require('../../../assets/images/npc_sprite/RightNikuStand.png'));
    const [playerSprite, setPlayerSprite] = useState<ImageSourcePropType>(require('../../../assets/images/player_sprite/LeftPlayerStand.png'));

    const spriteAnimationTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (showDialogue) {
            if (animateNpc || animateRheeyu || animateNiku || animatePlayer) {
                spriteAnimationTimer.current = setInterval(() => {
                    setSpriteFrame(prev => (prev + 1) % SPRITE_ANIMATION_STEPS);
                }, SPRITE_FRAME_DURATION);
            } else {
                setSpriteFrame(0);
            }
        }
        return () => {
            if (spriteAnimationTimer.current) {
                clearInterval(spriteAnimationTimer.current);
            }
        };
    }, [showDialogue, animateNpc, animateRheeyu, animateNiku, animatePlayer]);

    const handleNpcWalkAway = () => {
        setNpcSprite(require('../../../assets/images/npc_sprite/RightNPC3.png'));
        setAnimateNpc(true);
        
        Animated.timing(npcPosition, {
            toValue: 350,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.linear,
        }).start();
        
        Animated.timing(npcOpacity, {
            toValue: 100,
            duration: 150,
            useNativeDriver: false,
        }).start();

        setTimeout(() => {
            setAnimateNpc(false);
            setNpcSprite(require('../../../assets/images/npc_sprite/LeftNPC3Stand.png'));
        }, 1000);
    };

    const handlePlayerEnter = () => {
        setPlayerSprite(require('../../../assets/images/player_sprite/LeftPlayer.png'));
        setAnimatePlayer(true);
        
        Animated.timing(playerPosition, {
            toValue: 450,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.linear,
        }).start();

        setTimeout(() => {
            setAnimatePlayer(false);
            setPlayerSprite(require('../../../assets/images/player_sprite/LeftPlayerStand.png'));
        }, 1000);
    };

    const handleRheeyuEnter = () => {
        setRheeyuSprite(require('../../../assets/images/npc_sprite/RightRheeyu.png'));
        setAnimateRheeyu(true);
        
        Animated.timing(rheeyuPosition, {
            toValue: 150,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.linear,
        }).start();

        setTimeout(() => {
            setAnimateRheeyu(false);
            setRheeyuSprite(require('../../../assets/images/npc_sprite/RightRheeyuStand.png'));
        }, 1000);
    };

    const handleNikuEnter = () => {
        setNikuSprite(require('../../../assets/images/npc_sprite/RightNiku.png'));
        setAnimateNiku(true);
        
        Animated.timing(nikuPosition, {
            toValue: 150,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.linear,
        }).start();

        setTimeout(() => {
            setAnimateNiku(false);
            setNikuSprite(require('../../../assets/images/npc_sprite/LeftNikuStand.png'));
        }, 1000);
    };

    useEffect(() => {
        if (!showDialogue) return;

        const currentAction = dialog[currentIndex].action;

        switch (currentAction) {
            case 'npc_throws_trash':
                setNpcSprite(require('../../../assets/images/npc_sprite/DownNPC3Stand.png'));
                setAnimateNpc(false);
                Animated.timing(paperTrashOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: false
                }).start();
                break;
            case 'npc_walks_away':
                handleNpcWalkAway();
                Animated.timing(paperTrashOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: false
                }).start();
                break;
            case 'player_enters':
                handlePlayerEnter();
                break;
            case 'rheeyu_enters':
                handleRheeyuEnter();
                break;
            case 'rheeyu_approaches':
                setNpcSprite(require('../../../assets/images/npc_sprite/LeftNPC3StandAngry.png'));
                setAnimateNpc(false);
                break;
            case 'rheeyu_stand':
                setRheeyuSprite(require('../../../assets/images/npc_sprite/RightRheeyuStand.png'));
                setNpcSprite(require('../../../assets/images/npc_sprite/LeftNPC3Stand.png'));
                setAnimateRheeyu(false);
                break;
            case 'npc_stand':
                setNpcSprite(require('../../../assets/images/npc_sprite/LeftNPC3Stand.png'));
                setAnimateNpc(false);
                break;
            case 'trash_forming':
                Animated.sequence([
                    Animated.timing(shakeAnimation, {
                        toValue: 10,
                        duration: 100,
                        useNativeDriver: false,
                    }),
                    Animated.timing(shakeAnimation, {
                        toValue: -10,
                        duration: 100,
                        useNativeDriver: false,
                    }),
                    Animated.timing(shakeAnimation, {
                        toValue: 10,
                        duration: 100,
                        useNativeDriver: false,
                    }),
                    Animated.timing(shakeAnimation, {
                        toValue: -10,
                        duration: 100,
                        useNativeDriver: false,
                    }),
                    Animated.timing(shakeAnimation, {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: false,
                    }),
                ]).start();
                Animated.timing(paperTrashOpacity, {
                    toValue: 100,
                    duration: 300,
                    useNativeDriver: false
                }).start();
                Animated.timing(trashMonsterOpacity, {
                    toValue: 0,
                    duration: 80,
                    useNativeDriver: false,
                }).start();
                Animated.timing(trashOpacity, {
                    toValue: 0,
                    duration: 10,
                    useNativeDriver: false,
                }).start();
                break;
            case 'trash_monster_appears':
                Animated.timing(paperTrashOpacity, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: false
                }).start();
                Animated.parallel([
                    Animated.timing(trashMonsterScale, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: false,
                    }),
                    Animated.timing(trashMonsterOpacity, {
                        toValue: 1,
                        duration: 120,
                        useNativeDriver: false,
                    }),
                ]).start();
                break;
            case 'niku_enters':
                handleNikuEnter();
                break;
            case 'niku_stand':
                setNikuSprite(require('../../../assets/images/npc_sprite/LeftNikuStand.png'));
                setAnimateNiku(false);
                break;
            case 'rheeyu_shocked':
                setRheeyuSprite(require('../../../assets/images/npc_sprite/RightRheeyuShocked.png'));
                setAnimateRheeyu(false);
                break;
            case 'rheeyu_to_niku':
                setNikuSprite(require('../../../assets/images/npc_sprite/LeftNikuStand.png'));
                setAnimateNiku(false);
                break;
            case 'niku_shows_device':
                setNikuSprite(require('../../../assets/images/npc_sprite/LeftNikuStand.png'));
                setAnimateNiku(false);
                break;
            case 'both_turn_to_player':
                setNikuSprite(require('../../../assets/images/npc_sprite/RightNikuStand.png'));
                setAnimateNiku(false);
                break;
            case 'niku_smiles':
                setNikuSprite(require('../../../assets/images/npc_sprite/RightNikuStand.png'));
                setAnimateNiku(false);
                break;
            case 'tutorial_voiceover':
                setAnimateRheeyu(false);
                break;
            case 'tutorial_end':
                setAnimateNiku(false);
                break;
            default:
                setNpcSprite(require('../../../assets/images/npc_sprite/LeftNPC3Stand.png'));
                setRheeyuSprite(require('../../../assets/images/npc_sprite/RightRheeyuStand.png'));
                setNikuSprite(require('../../../assets/images/npc_sprite/LeftNikuStand.png'));
                setPlayerSprite(require('../../../assets/images/player_sprite/LeftPlayerStand.png'));
                setAnimateNpc(false);
                setAnimateRheeyu(false);
                setAnimateNiku(false);
                setAnimatePlayer(false);
                break;
        }

    }, [currentIndex, showDialogue, dialog, navigation, npcOpacity, npcPosition, nikuPosition, rheeyuPosition, playerPosition, shakeAnimation, trashMonsterOpacity, trashMonsterScale, trashOpacity, paperTrashOpacity]);

    const getCurrentLineParts = () => dialog[currentIndex];

    const triggerFadeTransition = (callback?: () => void) => {
        setIsTransitioning(true);
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: false,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: false,
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
            navigation.navigate('GameMainMap');
        }
    };

    const handleIntroScreenPress = () => {
        if (hasStarted) return;

        setHasStarted(true);

        Animated.timing(introFadeAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
        }).start(() => {
            setBlackScreenVisible(false);
            setBufferVisible(true);
            setTimeout(() => {
                setBufferVisible(false);
                setShowDialogue(true);
            }, 2000);
        });
    };

    const renderSprites = () => {
        if (!showDialogue || bufferVisible) return null;

        const frameTranslateX = -spriteFrame * FRAME_WIDTH;

        return (
            <>
                {/* NPC Character */}
                <Animated.View
                    style={[
                        animateNpc ? styles.walkingCharacterContainer : styles.standingCharacterContainer,
                        {
                            left: -20,
                            transform: [{ translateX: npcPosition }],
                            opacity: npcOpacity,
                        },
                    ]}
                >
                    <Animated.Image
                        source={npcSprite}
                        style={[
                            animateNpc ? styles.walking_sprite : styles.standing_sprite,
                            animateNpc && {
                                transform: [{ translateX: frameTranslateX }],
                            },
                        ]}
                    />
                </Animated.View>

                {/* Player Character */}
                <Animated.View
                    style={[
                        animatePlayer ? styles.walkingCharacterContainer : styles.standingCharacterContainer,
                        {
                            left: -20,
                            transform: [{ translateX: playerPosition }],
                        },
                    ]}
                >
                    <Animated.Image
                        source={playerSprite}
                        style={[
                            animatePlayer ? styles.walking_sprite : styles.standing_sprite,
                            animatePlayer && {
                                transform: [{ translateX: frameTranslateX }],
                            },
                        ]}
                    />
                </Animated.View>

                {/* Paper Trash */}
                <Animated.Image
                    source={require('../../../assets/images/trash_sprite/paper_trash.png')}
                    style={[
                        styles.trashMonsterImage,
                        {
                            transform: [
                                { scale: 0.5 },
                                { translateX: shakeAnimation },
                            ],
                            opacity: paperTrashOpacity,
                            position: "absolute",
                            bottom: 250,
                            left: 230,
                            width: 110,
                            height: 100,
                        },
                    ]}
                />

                {/* Rheeyu Character */}
                <Animated.View
                    style={[
                        animateRheeyu ? styles.walkingCharacterContainer : styles.standingCharacterContainer,
                        {
                            left: -100,
                            transform: [{ translateX: rheeyuPosition }],
                        },
                    ]}
                >
                    <Animated.Image
                        source={rheeyuSprite}
                        style={[
                            animateRheeyu ? styles.walking_sprite : styles.standing_sprite,
                            animateRheeyu && {
                                transform: [{ translateX: frameTranslateX }],
                            },
                        ]}
                    />
                </Animated.View>

                {/* Niku Character */}
                <Animated.View
                    style={[
                        animateNiku ? styles.walkingCharacterContainer : styles.standingCharacterContainer,
                        {
                            left: -30,
                            transform: [{ translateX: nikuPosition }],
                        },
                    ]}
                >
                    <Animated.Image
                        source={nikuSprite}
                        style={[
                            animateNiku ? styles.walking_sprite : styles.standing_sprite,
                            animateNiku && {
                                transform: [{ translateX: frameTranslateX }],
                            },
                        ]}
                    />
                </Animated.View>

                {/* Trash Monster */}
                <Animated.Image
                    source={require('../../../assets/images/enemy_sprite/phantompaper.png')}
                    style={[
                        styles.trashMonsterImage,
                        {
                            transform: [
                                { scale: trashMonsterScale },
                                { translateX: shakeAnimation },
                            ],
                            opacity: trashMonsterOpacity,
                            position: "absolute",
                            bottom: 260,
                            left: 230,
                            width: 90,
                            height: 100,
                        },
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
                            transform: [{ translateX: shakeAnimation }],
                        },
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
                            <View style={styles.dialogueWrapper}>
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
                                            const { name, message, portrait } = getCurrentLineParts();
                                            return (
                                                <View>
                                                    
                                                <View style={styles.dialogueContainer}>
                                                    
                                                    <View style={styles.textContainer}>
                                                    {name !== "" && <Text style={styles.character_name}>{name}</Text>}
                                                        <Text style={styles.text_dialogue}>{message}</Text>
                                                    </View>
                                                </View>
                                                </View>
                                            );
                                        })()}
                                    </TouchableOpacity>
                                </ImageBackground>

                                {dialog[currentIndex].portrait && (
                                    <Image 
                                        source={dialog[currentIndex].portrait}
                                        style={styles.portraitBesideDialog}
                                    />
                                )}
                            </View>

                            {showClickHint && (
                                <Text style={styles.clickHint}>Press the dialog box to continue!</Text>
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
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        height: 1000,
        width: 500,
    },
    container_inner: {
        backgroundColor: 'lightgray',
        height: 1000,
        width: 500,
        alignItems: 'center',
    },
    walkingCharacterContainer: {
        position: 'absolute',
        bottom: 280,
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        overflow: 'hidden',
    },
    standingCharacterContainer: {
        position: 'absolute',
        bottom: 280,
        width: STANDING_SPRITE_WIDTH,
        height: STANDING_SPRITE_HEIGHT,
        overflow: 'hidden',
    },
    walking_sprite: {
        width: FRAME_WIDTH * SPRITE_ANIMATION_STEPS,
        height: FRAME_HEIGHT,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    standing_sprite: {
        width: STANDING_SPRITE_WIDTH,
        height: STANDING_SPRITE_HEIGHT,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    trashImage: {
        height: 40,
        width: 40,
        position: 'absolute',
        bottom: 260,
        left: 250,
        zIndex: 1,
    },
    trashMonsterImage: {
        height: 180,
        width: 180,
        position: 'absolute',
        bottom: 80,
        right: 150,
    },
    dialogueWrapper: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '100%',
        paddingHorizontal: 40,
    },
    backgroundimg_dialoguebox: {
        width: 395,
        height: 200,
        flex: 1,
        right: 40,
    },
    dialogueTouchableArea: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialogueContainer: {
        width: 300,
        height: 200,
        marginLeft: 50,
        marginBottom: 10,
        
    },
    textContainer: {
        flex: 1,
        position: 'relative',
        paddingTop: 30,
        
    },
    character_name: {
        fontFamily: 'PixelifySans-Bold',
        fontSize: 25,
        color:'rgba(89, 32, 3, 0.85)',
        marginLeft: 40,
        zIndex: 1,
    },
    text_dialogue: {
        fontFamily: 'Stardew Valley',
        color:'rgba(104, 37, 3, 0.85)',
        fontSize: 24,
        marginTop: 5,
        marginBottom: 10,
        marginLeft: 40,
    },
    portraitBesideDialog: {
        width: 165,
        height: 200,
        marginBottom: 0,
        left: 30,
    },
    clickHint: {
        position: 'absolute',
        bottom: 80,
        alignSelf: 'flex-start',
        marginLeft: 60,
        fontSize: 18,
        fontFamily: 'Stardew Valley',
        color: 'rgba(0, 0, 0, 0.61)',
        backgroundColor: 'rgba(188, 154, 124, 0.61)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        opacity: 0.5,
    },
});
