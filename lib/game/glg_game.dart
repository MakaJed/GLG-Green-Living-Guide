import 'dart:math';
import 'package:flame/game.dart';
import 'package:flame/components.dart';
import 'package:flame/events.dart';
import 'package:flame/extensions.dart';
import 'package:flame/input.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:glg_flutter/game/components/player.dart';
import 'package:glg_flutter/game/components/boundary.dart';
import 'package:glg_flutter/game/components/npc.dart';
import 'package:glg_flutter/game/components/trash.dart';
import 'package:glg_flutter/game/components/monster.dart';
import 'package:glg_flutter/game/utils/constants.dart';
import 'package:glg_flutter/game/utils/collisions.dart';
import 'package:glg_flutter/models/trash_type.dart';
import 'package:glg_flutter/models/monster_type.dart';
import 'package:glg_flutter/game/utils/direction.dart';

class GLGGame extends FlameGame with KeyboardEvents, TapDetector, HasCollisionDetection {
  // Game components
  late Player player;
  late CameraComponent camera;
  late World gameWorld;
  
  // Game state
  bool isInBattle = false;
  String currentMap = 'RouteJuan';
  bool showTrashDisposalUI = false;
  
  // Collections for game objects
  final List<Boundary> boundaries = [];
  final List<NPC> npcs = [];
  final List<Trash> trashItems = [];
  final List<Monster> monsters = [];
  
  // Callback for navigation to battle screen
  Function(String monsterType)? onBattleStart;
  
  // Callback for UI updates
  Function(bool show, Trash? trash)? onTrashInteraction;
  
  // Random for various randomizations
  final Random random = Random();
  
  // Movement control flags
  final Map<int, bool> keysPressed = {};
  
  // Timer for NPC spawning
  double npcSpawnTimer = 0;
  
  GLGGame({
    this.onBattleStart,
    this.onTrashInteraction,
  });
  
  @override
  Future<void> onLoad() async {
    // Load game world
    gameWorld = World();
    add(gameWorld);
    
    // Create and add camera
    camera = CameraComponent.withFixedResolution(
      world: gameWorld,
      width: GameConstants.viewportWidth, 
      height: GameConstants.viewportHeight,
    );
    add(camera);
    
    // Load map boundaries from the collisions data
    await loadMapBoundaries();
    
    // Create player with trash interaction callback
    player = Player(
      onTrashInteraction: (trash) {
        // Update UI when player is near/far from trash
        showTrashDisposalUI = player.canInteractWithTrash();
        if (onTrashInteraction != null) {
          onTrashInteraction!(showTrashDisposalUI, trash);
        }
      },
    );
    gameWorld.add(player);
    
    // Set camera to follow player
    camera.follow(player);
    
    // Initial NPCs
    spawnInitialNPCs();
    
    return super.onLoad();
  }
  
  @override
  void update(double dt) {
    if (isInBattle) return;
    
    // Update player movement based on key presses
    updatePlayerMovement();
    
    // Update NPCs
    updateNPCs(dt);
    
    // Update trash items
    updateTrashItems(dt);
    
    // Check for NPC spawning
    npcSpawnTimer += dt;
    if (npcSpawnTimer >= GameConstants.npcSpawnInterval && npcs.length < GameConstants.maxNPCs) {
      spawnNPC();
      npcSpawnTimer = 0;
    }
    
    super.update(dt);
  }
  
  void updatePlayerMovement() {
    double dx = 0;
    double dy = 0;
    
    // Check for WASD and arrow keys
    if (keysPressed[LogicalKeyboardKey.arrowUp.keyId] ?? false || keysPressed[LogicalKeyboardKey.keyW.keyId] ?? false) {
      dy -= GameConstants.playerSpeed;
      player.direction = PlayerDirection.up;
    }
    if (keysPressed[LogicalKeyboardKey.arrowDown.keyId] ?? false || keysPressed[LogicalKeyboardKey.keyS.keyId] ?? false) {
      dy += GameConstants.playerSpeed;
      player.direction = PlayerDirection.down;
    }
    if (keysPressed[LogicalKeyboardKey.arrowLeft.keyId] ?? false || keysPressed[LogicalKeyboardKey.keyA.keyId] ?? false) {
      dx -= GameConstants.playerSpeed;
      player.direction = PlayerDirection.left;
    }
    if (keysPressed[LogicalKeyboardKey.arrowRight.keyId] ?? false || keysPressed[LogicalKeyboardKey.keyD.keyId] ?? false) {
      dx += GameConstants.playerSpeed;
      player.direction = PlayerDirection.right;
    }
    
    if (dx != 0 || dy != 0) {
      player.move(dx, dy);
    } else {
      player.idle();
    }
  }
  
  @override
  KeyEventResult onKeyEvent(
    KeyEvent event,
    Set<LogicalKeyboardKey> keysPressed,
  ) {
    // Update key press states
    final isKeyDown = event is KeyDownEvent;
    
    if (event.logicalKey == LogicalKeyboardKey.arrowUp || event.logicalKey == LogicalKeyboardKey.keyW) {
      this.keysPressed[LogicalKeyboardKey.arrowUp.keyId] = isKeyDown;
      this.keysPressed[LogicalKeyboardKey.keyW.keyId] = isKeyDown;
    } else if (event.logicalKey == LogicalKeyboardKey.arrowDown || event.logicalKey == LogicalKeyboardKey.keyS) {
      this.keysPressed[LogicalKeyboardKey.arrowDown.keyId] = isKeyDown;
      this.keysPressed[LogicalKeyboardKey.keyS.keyId] = isKeyDown;
    } else if (event.logicalKey == LogicalKeyboardKey.arrowLeft || event.logicalKey == LogicalKeyboardKey.keyA) {
      this.keysPressed[LogicalKeyboardKey.arrowLeft.keyId] = isKeyDown;
      this.keysPressed[LogicalKeyboardKey.keyA.keyId] = isKeyDown;
    } else if (event.logicalKey == LogicalKeyboardKey.arrowRight || event.logicalKey == LogicalKeyboardKey.keyD) {
      this.keysPressed[LogicalKeyboardKey.arrowRight.keyId] = isKeyDown;
      this.keysPressed[LogicalKeyboardKey.keyD.keyId] = isKeyDown;
    }
    
    return KeyEventResult.handled;
  }
  
  // Map loading
  Future<void> loadMapBoundaries() async {
    // Clear existing boundaries
    for (final boundary in boundaries) {
      boundary.removeFromParent();
    }
    boundaries.clear();
    
    // Load the collision data from utils/collisions.dart
    final collisionsMap = CollisionsData.getCollisionsMap();
    
    // Create boundary components from collision data
    for (int y = 0; y < collisionsMap.length; y++) {
      for (int x = 0; x < collisionsMap[y].length; x++) {
        if (collisionsMap[y][x] == 1025) {
          final boundary = Boundary(
            position: Vector2(x * GameConstants.tileSize, y * GameConstants.tileSize),
            size: Vector2(GameConstants.tileSize, GameConstants.tileSize),
          );
          boundaries.add(boundary);
          gameWorld.add(boundary);
        }
      }
    }
  }
  
  // NPC management
  void spawnInitialNPCs() {
    for (int i = 0; i < GameConstants.initialNPCCount; i++) {
      spawnNPC();
    }
  }
  
  void spawnNPC() {
    // Find a valid spawn position
    final validPositions = findValidSpawnPositions();
    if (validPositions.isEmpty) return;
    
    final spawnPosition = validPositions[random.nextInt(validPositions.length)];
    
    // Available NPC types
    final availableNpcTypes = NPCType.values;
    final randomNpcType = availableNpcTypes[random.nextInt(availableNpcTypes.length)];
    
    // Create the NPC
    final npc = NPC(
      position: spawnPosition,
      type: randomNpcType,
      onDropTrash: (position) => spawnTrash(position),
    );
    
    npcs.add(npc);
    gameWorld.add(npc);
  }
  
  List<Vector2> findValidSpawnPositions() {
    final positions = <Vector2>[];
    final margin = 2; // Keep NPCs away from boundaries
    
    // Calculate visible map boundaries (simplified for this example)
    final mapWidth = CollisionsData.columns * GameConstants.tileSize;
    final mapHeight = (CollisionsData.collisions.length / CollisionsData.columns).ceil() * GameConstants.tileSize;
    
    // Sample some random positions and check if they're valid
    for (int i = 0; i < 100; i++) {
      final x = random.nextDouble() * mapWidth;
      final y = random.nextDouble() * mapHeight;
      final position = Vector2(x, y);
      
      // Check if this position collides with any boundaries
      bool isValid = true;
      for (final boundary in boundaries) {
        if (boundary.position.distanceTo(position) < GameConstants.tileSize * margin) {
          isValid = false;
          break;
        }
      }
      
      if (isValid) {
        positions.add(position);
      }
    }
    
    return positions;
  }
  
  void updateNPCs(double dt) {
    for (final npc in npcs) {
      npc.updateBehavior(dt, boundaries);
    }
  }
  
  // Trash management
  void spawnTrash(Vector2 position) {
    if (trashItems.length >= GameConstants.maxTrash) return;
    
    // Available trash types
    final trashTypes = TrashType.values;
    final randomTrashType = trashTypes[random.nextInt(trashTypes.length)];
    
    final trash = Trash(
      position: position,
      type: randomTrashType,
      onTransform: (trash) => transformTrashToMonster(trash),
      onDispose: (trash, isCorrect, binType) => handleTrashDisposal(trash, isCorrect, binType),
    );
    
    trashItems.add(trash);
    gameWorld.add(trash);
  }
  
  // Handle feedback when trash is disposed - Pokemon style
  void handleTrashDisposal(Trash trash, bool isCorrect, String binType) {
    // Delay removal to allow for animation
    final animationTime = isCorrect ? 0.7 : 0.5; // Longer for successful "capture"
    
    // Remove trash from tracked items after animation completes
    Future.delayed(Duration(milliseconds: (animationTime * 1000).toInt()), () {
      trashItems.remove(trash);
      
      // Show message dialog like in Pokemon when you catch or fail to catch
      if (onTrashInteraction != null) {
        // Pass a special message in the third parameter (utilizing the trash parameter for now)
        final message = isCorrect 
            ? "Properly disposed the ${trash.type.toString().split('.').last} trash!"
            : "Wrong bin! The trash escaped!";
            
        // First hide the disposal UI
        onTrashInteraction!(false, null);
        
        // Then show message temporarily (implement this in game_screen.dart)
        onTrashInteraction!(false, Trash(
          position: Vector2.zero(),
          type: trash.type,
          onDispose: (_, __, ___) {},
          // Using the sprite name field to pass a message to the UI
        )..state = isCorrect ? TrashState.disposed : TrashState.normal);
      }
    });
    
    // Update UI state since trash is no longer interactable
    showTrashDisposalUI = false;
    if (onTrashInteraction != null) {
      onTrashInteraction!(false, null);
    }
  }
  
  // Method to handle player interaction with trash
  bool disposeTrash(String binType) {
    if (player.canInteractWithTrash()) {
      final result = player.interactWithTrash(binType);
      
      // Update UI
      showTrashDisposalUI = false;
      if (onTrashInteraction != null) {
        onTrashInteraction!(false, null);
      }
      
      return result;
    }
    return false;
  }
  
  void updateTrashItems(double dt) {
    // Copy the list to avoid modification during iteration
    final items = List<Trash>.from(trashItems);
    for (final trash in items) {
      trash.update(dt);
      
      // Check if player is near the trash and it's transformed
      if (trash.isTransformed && player.position.distanceTo(trash.position) < GameConstants.monsterTriggerDistance) {
        startBattle(trash.monsterType!);
        trash.removeFromParent();
        trashItems.remove(trash);
      }
    }
  }
  
  void transformTrashToMonster(Trash trash) {
    // Map trash type to monster type
    final monsterType = mapTrashToMonsterType(trash.type);
    trash.transformType(monsterType);
  }
  
  MonsterType mapTrashToMonsterType(TrashType trashType) {
    switch (trashType) {
      case TrashType.can:
        return random.nextBool() ? MonsterType.canstruct : MonsterType.sarcan;
      case TrashType.organic:
        final organicMonsters = [
          MonsterType.greezeGlob,
          MonsterType.egglut,
          MonsterType.gloofuud,
          MonsterType.rotato
        ];
        return organicMonsters[random.nextInt(organicMonsters.length)];
      case TrashType.paper:
        return MonsterType.paperPhantom;
      case TrashType.plastic:
        final plasticMonsters = [
          MonsterType.bottroll,
          MonsterType.crunchor,
          MonsterType.cupkwek,
          MonsterType.sssstrawpent,
          MonsterType.jellystic
        ];
        return plasticMonsters[random.nextInt(plasticMonsters.length)];
      case TrashType.glass:
        return random.nextBool() ? MonsterType.jar : MonsterType.shardlass;
      case TrashType.electronic:
        return random.nextBool() ? MonsterType.voltwing : MonsterType.phonii;
      default:
        return MonsterType.canstruct; // Default fallback
    }
  }
  
  // Battle system
  void startBattle(MonsterType monsterType) {
    if (isInBattle) return;
    
    isInBattle = true;
    
    // Call the navigation callback to show battle screen
    if (onBattleStart != null) {
      onBattleStart!(monsterType.toString());
    }
  }
  
  void endBattle() {
    isInBattle = false;
  }
}
