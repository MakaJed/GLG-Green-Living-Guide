import 'dart:math';
import 'package:flame/components.dart';
import 'package:flame/collisions.dart';
import 'package:glg_flutter/game/utils/constants.dart';
import 'dart:ui' show Rect;
import 'package:glg_flutter/game/components/boundary.dart';
import 'package:glg_flutter/game/utils/direction.dart';

enum NPCType { npc2, npc3, npc5, npc6, npc7, npc8 }

enum NPCState { walking, idle, leaving }

class NPC extends SpriteAnimationGroupComponent with HasGameRef, CollisionCallbacks {
  // NPC properties
  final NPCType type;
  NPCState state = NPCState.walking;
  PlayerDirection direction = PlayerDirection.down;
  
  // Animation map for different directions
  late final Map<String, SpriteAnimation> animations;
  
  // Movement and behavior
  double directionChangeTimer = 0;
  double trashDropTimer = 0;
  final Random random = Random();
  
  // Callback for trash spawning
  final Function(Vector2 position)? onDropTrash;
  
  // Collision shape
  late ShapeHitbox hitbox;
  
  NPC({
    required Vector2 position,
    required this.type,
    this.onDropTrash,
  }) : super(
          position: position,
          size: Vector2(GameConstants.tileSize, GameConstants.tileSize * (48/32)), // Adjust for sprite aspect ratio
          anchor: Anchor.center,
        );
  
  @override
  Future<void> onLoad() async {
    // Load sprite sheets based on NPC type
    final spriteBasePath = 'images/npc/${type.toString().split('.').last}';
    final upImage = await gameRef.images.load('$spriteBasePath/Up.png');
    final downImage = await gameRef.images.load('$spriteBasePath/Down.png');
    final leftImage = await gameRef.images.load('$spriteBasePath/Left.png');
    final rightImage = await gameRef.images.load('$spriteBasePath/Right.png');
    
    // Create animations for each direction
    animations = {
      'up_walking': SpriteAnimation.fromFrameData(
        upImage,
        SpriteAnimationData.sequenced(
          amount: GameConstants.frameCount,
          textureSize: Vector2(GameConstants.tileSize, GameConstants.tileSize * (48/32)),
          stepTime: 0.2,
        ),
      ),
      'down_walking': SpriteAnimation.fromFrameData(
        downImage,
        SpriteAnimationData.sequenced(
          amount: GameConstants.frameCount,
          textureSize: Vector2(GameConstants.tileSize, GameConstants.tileSize * (48/32)),
          stepTime: 0.2,
        ),
      ),
      'left_walking': SpriteAnimation.fromFrameData(
        leftImage,
        SpriteAnimationData.sequenced(
          amount: GameConstants.frameCount,
          textureSize: Vector2(GameConstants.tileSize, GameConstants.tileSize * (48/32)),
          stepTime: 0.2,
        ),
      ),
      'right_walking': SpriteAnimation.fromFrameData(
        rightImage,
        SpriteAnimationData.sequenced(
          amount: GameConstants.frameCount,
          textureSize: Vector2(GameConstants.tileSize, GameConstants.tileSize * (48/32)),
          stepTime: 0.2,
        ),
      ),
      // Standing animations (first frame of each direction)
      'up_idle': SpriteAnimation.fromFrameData(
        upImage,
        SpriteAnimationData.sequenced(
          amount: 1,
          textureSize: Vector2(GameConstants.tileSize, GameConstants.tileSize * (48/32)),
          stepTime: 0.2,
        ),
      ),
      'down_idle': SpriteAnimation.fromFrameData(
        downImage,
        SpriteAnimationData.sequenced(
          amount: 1,
          textureSize: Vector2(GameConstants.tileSize, GameConstants.tileSize * (48/32)),
          stepTime: 0.2,
        ),
      ),
      'left_idle': SpriteAnimation.fromFrameData(
        leftImage,
        SpriteAnimationData.sequenced(
          amount: 1,
          textureSize: Vector2(GameConstants.tileSize, GameConstants.tileSize * (48/32)),
          stepTime: 0.2,
        ),
      ),
      'right_idle': SpriteAnimation.fromFrameData(
        rightImage,
        SpriteAnimationData.sequenced(
          amount: 1,
          textureSize: Vector2(GameConstants.tileSize, GameConstants.tileSize * (48/32)),
          stepTime: 0.2,
        ),
      ),
    };
    
    // Set initial animation
    current = getAnimationKey();
    
    // Add hitbox for collision detection
    hitbox = RectangleHitbox(
      size: Vector2(GameConstants.tileSize * 0.8, GameConstants.tileSize * 0.8),
      position: Vector2(
        size.x * 0.1, 
        size.y - GameConstants.tileSize * 0.8 - size.y * 0.1
      ),
    );
    add(hitbox);
    
    // Initialize timers
    directionChangeTimer = random.nextDouble() * 3.0; // Random initial time
    trashDropTimer = 15.0 + random.nextDouble() * 30.0; // 15-45 seconds
    
    return super.onLoad();
  }
  
  void updateBehavior(double dt, List<Boundary> boundaries) {
    // Update timers
    directionChangeTimer -= dt;
    trashDropTimer -= dt;
    
    // Change direction randomly
    if (directionChangeTimer <= 0 && state != NPCState.leaving) {
      changeDirection();
      directionChangeTimer = 2.0 + random.nextDouble() * 3.0; // 2-5 seconds
    }
    
    // Check if it's time to drop trash
    if (trashDropTimer <= 0 && state == NPCState.walking) {
      if (onDropTrash != null) {
        onDropTrash!(position);
      }
      // After dropping trash, NPC leaves
      state = NPCState.leaving;
      // Choose a random exit direction
      final directions = [PlayerDirection.up, PlayerDirection.down, PlayerDirection.left, PlayerDirection.right];
      direction = directions[random.nextInt(directions.length)];
    }
    
    // Move the NPC
    if (state != NPCState.idle) {
      move(dt, boundaries);
    }
    
    // Update animation
    current = getAnimationKey();
  }
  
  void move(double dt, List<Boundary> boundaries) {
    // Calculate movement speed
    double speed = GameConstants.npcSpeed;
    if (state == NPCState.leaving) {
      speed *= 1.5; // Move faster when leaving
    }
    
    // Calculate next position
    final Vector2 nextPosition = position.clone();
    switch (direction) {
      case PlayerDirection.up:
        nextPosition.y -= speed;
        break;
      case PlayerDirection.down:
        nextPosition.y += speed;
        break;
      case PlayerDirection.left:
        nextPosition.x -= speed;
        break;
      case PlayerDirection.right:
        nextPosition.x += speed;
        break;
    }
    
    // Check for boundary collisions
    bool canMove = true;
    for (final boundary in boundaries) {
      if (checkCollision(nextPosition, boundary)) {
        canMove = false;
        break;
      }
    }
    
    // Move if no collision
    if (canMove) {
      position = nextPosition;
    } else {
      // If blocked, change direction
      changeDirection();
    }
    
    // Check if NPC is off-screen (for leaving state)
    if (state == NPCState.leaving) {
      final mapWidth = GameConstants.columns * GameConstants.tileSize;
      final mapHeight = 1000; // Arbitrary map height, adjust as needed
      
      if (position.x < -50 || position.x > mapWidth + 50 ||
          position.y < -50 || position.y > mapHeight + 50) {
        removeFromParent();
      }
    }
  }
  
  bool checkCollision(Vector2 nextPosition, Boundary boundary) {
    // Simple AABB collision check
    final npcRect = Rect.fromLTWH(
      nextPosition.x - size.x / 2,
      nextPosition.y - size.y / 2,
      size.x * 0.8,
      size.y * 0.8,
    );
    
    final boundaryRect = Rect.fromLTWH(
      boundary.position.x,
      boundary.position.y,
      boundary.size.x,
      boundary.size.y,
    );
    
    return npcRect.overlaps(boundaryRect);
  }
  
  void changeDirection() {
    final directions = [PlayerDirection.up, PlayerDirection.down, PlayerDirection.left, PlayerDirection.right];
    // Remove current direction to avoid choosing the same one
    directions.remove(direction);
    direction = directions[random.nextInt(directions.length)];
  }
  
  String getAnimationKey() {
    final dirString = direction.toString().split('.').last;
    final stateString = state == NPCState.walking || state == NPCState.leaving ? 'walking' : 'idle';
    return '${dirString}_$stateString';
  }
}
