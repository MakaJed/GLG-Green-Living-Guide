import 'package:flame/components.dart';
import 'package:flame/collisions.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:glg_flutter/game/utils/constants.dart';
import 'package:glg_flutter/game/components/boundary.dart';
import 'package:glg_flutter/game/components/trash.dart';
import 'package:glg_flutter/game/utils/direction.dart';

class Player extends SpriteAnimationGroupComponent with HasGameRef, CollisionCallbacks {
  // Movement properties
  PlayerDirection direction = PlayerDirection.down;
  bool isMoving = false;
  
  // Interaction properties
  Trash? nearbyTrash;
  double interactionCooldown = 0;
  bool canInteract = true;
  
  // Animation map for different directions
  late final Map<PlayerDirection, SpriteAnimation> animations;
  
  // Collision shapes
  late ShapeHitbox hitbox;
  late CircleHitbox interactionRadius;
  
  // Callbacks
  Function(Trash trash)? onTrashInteraction;
  
  Player({this.onTrashInteraction}) 
      : super(
          size: Vector2(
            GameConstants.tileSize, 
            GameConstants.playerHeight
          ),
          anchor: Anchor.center,
        );
  
  @override
  Future<void> onLoad() async {
    // Load sprite sheets for each direction
    final upImage = await gameRef.images.load('images/player/playerUp.png');
    final downImage = await gameRef.images.load('images/player/playerDown.png');
    final leftImage = await gameRef.images.load('images/player/playerLeft.png');
    final rightImage = await gameRef.images.load('images/player/playerRight.png');
    
    // Create animations for each direction
    animations = {
      PlayerDirection.up: SpriteAnimation.fromFrameData(
        upImage,
        SpriteAnimationData.sequenced(
          amount: GameConstants.frameCount,
          textureSize: Vector2(GameConstants.tileSize, GameConstants.playerHeight),
          stepTime: 0.1,
        ),
      ),
      PlayerDirection.down: SpriteAnimation.fromFrameData(
        downImage,
        SpriteAnimationData.sequenced(
          amount: GameConstants.frameCount,
          textureSize: Vector2(GameConstants.tileSize, GameConstants.playerHeight),
          stepTime: 0.1,
        ),
      ),
      PlayerDirection.left: SpriteAnimation.fromFrameData(
        leftImage,
        SpriteAnimationData.sequenced(
          amount: GameConstants.frameCount,
          textureSize: Vector2(GameConstants.tileSize, GameConstants.playerHeight),
          stepTime: 0.1,
        ),
      ),
      PlayerDirection.right: SpriteAnimation.fromFrameData(
        rightImage,
        SpriteAnimationData.sequenced(
          amount: GameConstants.frameCount,
          textureSize: Vector2(GameConstants.tileSize, GameConstants.playerHeight),
          stepTime: 0.1,
        ),
      ),
    };
    
    // Set initial animation
    current = PlayerDirection.down;
    
    // Add hitbox for collision detection
    hitbox = RectangleHitbox(
      size: Vector2(GameConstants.tileSize * 0.8, GameConstants.tileSize * 0.8),
      position: Vector2(
        size.x * 0.1, 
        size.y - GameConstants.tileSize * 0.8 - size.y * 0.1
      ),
    );
    add(hitbox);
    
    // Add larger interaction radius hitbox
    interactionRadius = CircleHitbox(
      radius: GameConstants.trashInteractionDistance,
      isSolid: false,
      collisionType: CollisionType.passive,
    );
    add(interactionRadius);
    
    return super.onLoad();
  }
  
  @override
  void update(double dt) {
    // Update animation speed based on movement
    if (isMoving) {
      if (animation?.stepTime != 0.1) {
        animation?.stepTime = 0.1;
      }
    } else {
      // Slower animation when idle
      if (animation?.stepTime != 0.5) {
        animation?.stepTime = 0.5;
      }
    }
    
    // Update interaction cooldown
    if (!canInteract) {
      interactionCooldown -= dt;
      if (interactionCooldown <= 0) {
        canInteract = true;
        interactionCooldown = 0;
      }
    }
    
    super.update(dt);
  }
  
  void move(double dx, double dy) {
    // Save current position
    final oldPosition = position.clone();
    
    // Try to move
    position.add(Vector2(dx, dy));
    
    // Update animation state
    isMoving = true;
    current = direction;
  }
  
  void idle() {
    isMoving = false;
  }
  
  @override
  void onCollision(Set<Vector2> intersectionPoints, PositionComponent other) {
    super.onCollision(intersectionPoints, other);
    
    if (other is Boundary) {
      // If colliding with a boundary, reset position
      final pushVector = intersectionPoints.first - position;
      position.sub(pushVector);
    }
  }
  
  @override
  void onCollisionStart(
    Set<Vector2> intersectionPoints,
    PositionComponent other,
  ) {
    super.onCollisionStart(intersectionPoints, other);
    
    // Check if player's interaction radius overlaps with trash
    if (other is Trash && other.isInteractable && !other.isTransformed) {
      // Set this trash as the one we're near
      nearbyTrash = other;
      other.highlight(true);
      
      // Provide haptic feedback
      HapticFeedback.selectionClick();
      
      // Notify game about this interaction possibility
      if (onTrashInteraction != null) {
        onTrashInteraction!(other);
      }
    }
  }
  
  @override
  void onCollisionEnd(PositionComponent other) {
    super.onCollisionEnd(other);
    
    // When moving away from trash, clear the interaction
    if (other is Trash && other == nearbyTrash) {
      other.highlight(false);
      
      // Only clear if this is the same trash we're tracking
      if (nearbyTrash == other) {
        nearbyTrash = null;
        
        // Notify game that we're no longer near trash
        if (onTrashInteraction != null) {
          onTrashInteraction!(other);
        }
      }
    }
  }
  
  // Handle interaction with nearby trash
  bool interactWithTrash(String binType) {
    if (nearbyTrash != null && canInteract) {
      // Set cooldown
      canInteract = false;
      interactionCooldown = GameConstants.interactionCooldown;
      
      // Dispose the trash
      nearbyTrash!.dispose(binType);
      
      // Clear reference after interaction
      final trash = nearbyTrash;
      nearbyTrash = null;
      
      return true;
    }
    return false;
  }
  
  // Check if player can interact with nearby trash
  bool canInteractWithTrash() {
    return nearbyTrash != null && canInteract && nearbyTrash!.isInteractable && !nearbyTrash!.isTransformed;
  }
}
