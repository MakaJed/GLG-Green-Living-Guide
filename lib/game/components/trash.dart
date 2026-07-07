import 'package:flame/components.dart';
import 'package:flame/collisions.dart';
import 'package:flame/effects.dart';
import 'package:flame/particles.dart';
import 'dart:math' show Random;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:glg_flutter/game/utils/constants.dart';
import 'package:glg_flutter/models/trash_type.dart';
import 'package:glg_flutter/models/monster_type.dart';

enum TrashState {
  normal,     // Fresh trash
  transforming, // Starting to transform
  transformed,  // Transformed into a monster
  disposing,   // Being disposed
  disposed     // Successfully disposed
}

class Trash extends SpriteComponent with HasGameRef, CollisionCallbacks {
  // Trash properties
  final TrashType type;
  TrashState state = TrashState.normal;
  MonsterType? monsterType;
  bool isInteractable = true;
  bool isHighlighted = false;
  final _random = Random();
  
  // Getter for random access
  Random get random => _random;
  
  // Visual components
  late ShapeHitbox hitbox;
  SpriteComponent? indicatorSprite;
  TextComponent? timerText;
  
  // Timers
  double transformTimer = GameConstants.trashTransformTime;
  double despawnTimer = 0;
  double disposalAnimationTimer = 0;
  double transformProgress = 0;
  
  // Callbacks
  final Function(Trash trash)? onTransform;
  final Function(Trash trash, bool isCorrect, String binType)? onDispose;
  
  Trash({
    required Vector2 position,
    required this.type,
    this.onTransform,
    this.onDispose,
  }) : super(
          position: position,
          size: Vector2(GameConstants.tileSize, GameConstants.tileSize),
          anchor: Anchor.center,
        );
  
  @override
  Future<void> onLoad() async {
    // Load appropriate sprite based on trash type
    final trashPath = 'images/trash/${type.toString().split('.').last}.png';
    sprite = await gameRef.loadSprite(trashPath);
    
    // Add interactive hitbox
    hitbox = CircleHitbox(
      radius: GameConstants.tileSize * 0.4,
      position: size / 2,
      anchor: Anchor.center,
    );
    add(hitbox);
    
    // Add timer text that shows remaining time before transformation
    timerText = TextComponent(
      text: "${transformTimer.toInt()}s",
      textRenderer: TextPaint(
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.bold,
          shadows: [
            Shadow(
              color: Colors.black,
              offset: Offset(1, 1),
              blurRadius: 1,
            ),
          ],
        ),
      ),
      position: Vector2(size.x / 2, -10),
      anchor: Anchor.center,
    );
    add(timerText!);
    
    // Add interaction indicator (initially invisible)
    indicatorSprite = SpriteComponent(
      sprite: await gameRef.loadSprite('images/ui/interact_indicator.png'),
      size: Vector2(GameConstants.tileSize * 0.5, GameConstants.tileSize * 0.5),
      position: Vector2(size.x / 2, -GameConstants.tileSize * 0.5),
      anchor: Anchor.center,
      alpha: 0,
    );
    add(indicatorSprite!);
    
    return super.onLoad();
  }
  
  @override
  void update(double dt) {
    super.update(dt);
    
    switch (state) {
      case TrashState.normal:
        // Update transform timer
        transformTimer -= dt;
        transformProgress = 1 - (transformTimer / GameConstants.trashTransformTime);
        
        // Update timer text
        if (timerText != null) {
          timerText!.text = "${transformTimer.toInt()}s";
          
          // Make text red when close to transformation
          if (transformTimer <= 10) {
            timerText!.textRenderer = TextPaint(
              style: TextStyle(
                color: Colors.red.shade200,
                fontSize: 12,
                fontWeight: FontWeight.bold,
                shadows: const [
                  Shadow(
                    color: Colors.black,
                    offset: Offset(1, 1),
                    blurRadius: 1,
                  ),
                ],
              ),
            );
          }
        }
        
        // Start visual transformation effects when getting close
        if (transformTimer <= 10 && state != TrashState.transforming) {
          state = TrashState.transforming;
          
          // Add pulsing effect
          add(
            ScaleEffect.by(
              Vector2.all(1.2),
              EffectController(
                duration: 0.5,
                reverseDuration: 0.5,
                infinite: true,
                curve: Curves.easeInOut,
              ),
            ),
          );
          
          // Add slight rotation effect
          add(
            RotateEffect.by(
              0.05,
              EffectController(
                duration: 0.3,
                reverseDuration: 0.3,
                infinite: true,
                curve: Curves.easeInOut,
              ),
            ),
          );
          
          // Make indicator pulse more intensely
          if (isHighlighted && indicatorSprite != null) {
            indicatorSprite!.add(
              ScaleEffect.by(
                Vector2.all(1.3),
                EffectController(
                  duration: 0.3,
                  reverseDuration: 0.3,
                  infinite: true,
                  curve: Curves.easeInOut,
                ),
              ),
            );
          }
        }
        
        // Check if it's time to transform
        if (transformTimer <= 0) {
          if (onTransform != null) {
            onTransform!(this);
          }
        }
        break;
        
      case TrashState.transforming:
        // Continue updating timer
        transformTimer -= dt;
        if (transformTimer <= 0) {
          if (onTransform != null) {
            onTransform!(this);
          }
        }
        break;
        
      case TrashState.transformed:
        // After transformation, start despawn timer
        despawnTimer += dt;
        if (despawnTimer >= GameConstants.monsterDespawnTime) {
          removeFromParent();
        }
        break;
        
      case TrashState.disposing:
        // Animation for disposal
        disposalAnimationTimer += dt;
        if (disposalAnimationTimer >= GameConstants.disposalAnimationDuration) {
          state = TrashState.disposed;
          removeFromParent();
        }
        break;
        
      case TrashState.disposed:
        // Already handled by removing from parent
        break;
    }
    
    // Update indicator visibility based on highlight state
    if (indicatorSprite != null) {
      if (isHighlighted && state != TrashState.transformed && state != TrashState.disposed) {
        indicatorSprite!.alpha = 1;
      } else {
        indicatorSprite!.alpha = 0;
      }
    }
  }
  
  // Call this when the trash transforms into a monster
  void transformMonster(MonsterType type) {
    state = TrashState.transformed;
    monsterType = type;
    despawnTimer = 0;
    
    // Remove timer text and indicator
    timerText?.removeFromParent();
    indicatorSprite?.removeFromParent();
    
    // Clear effects
    removeAllEffects();
    
    // Load monster sprite
    gameRef.loadSprite('images/monsters/${type.toString().split('.').last}.png').then((monsterSprite) {
      sprite = monsterSprite;
    });
  }
  
  // Highlight this trash for interaction
  void highlight(bool value) {
    isHighlighted = value;
    
    if (value && indicatorSprite != null && (state == TrashState.normal || state == TrashState.transforming)) {
      // Show indicator with a fade in effect
      indicatorSprite!.alpha = 1;
      indicatorSprite!.add(
        ScaleEffect.by(
          Vector2.all(1.2),
          EffectController(
            duration: 0.3,
            reverseDuration: 0.3,
            infinite: true,
            curve: Curves.easeInOut,
          ),
        ),
      );
      
      // Add slight bounce effect to the trash
      add(
        MoveByEffect(
          Vector2(0, -5),
          EffectController(
            duration: 0.2,
            reverseDuration: 0.2,
            infinite: true,
            curve: Curves.easeInOut,
          ),
        ),
      );
    } else if (!value) {
      // Hide indicator and remove effects
      if (indicatorSprite != null) {
        indicatorSprite!.alpha = 0;
        indicatorSprite!.removeAll(indicatorSprite!.children.whereType<Effect>());
      }
      
      removeAllEffects();
    }
  }
  
  // Helper method to remove effects
  void removeAllEffects() {
    removeAll(children.whereType<Effect>());
  }
  
  // Start the disposal animation - Pokemon style
  void dispose(String binType) {
    if (state == TrashState.transformed || state == TrashState.disposed) {
      return;
    }
    
    // Determine if this is the correct bin for this trash type
    bool isCorrectBin = false;
    for (final entry in GameConstants.disposalBinTypes.entries) {
      if (entry.key.toLowerCase() == binType.toLowerCase() && 
          entry.value.contains(type.toString().split('.').last)) {
        isCorrectBin = true;
        break;
      }
    }
    
    // Set to disposing state
    state = TrashState.disposing;
    isInteractable = false;
    
    // Add disposal animation effects
    removeAllEffects();
    
    // Pokemon-style capture animation
    if (isCorrectBin) {
      // Success animation - like Pokemon being caught
      // First bounce
      add(
        SequenceEffect.sequential(
          [
            ScaleEffect.by(
              Vector2.all(1.3),
              EffectController(duration: 0.1),
            ),
            ScaleEffect.by(
              Vector2.all(0.8),
              EffectController(duration: 0.1),
            ),
            ScaleEffect.by(
              Vector2.all(0.4),
              EffectController(duration: 0.2),
            ),
            OpacityEffect.fadeOut(
              EffectController(duration: 0.1),
            ),
          ],
        ),
      );
      
      // Add "sparkle" particles - like successful Pokemon capture
      final particleComponent = ParticleSystemComponent(
        particle: Particle.generate(
          count: 15,
          lifespan: 0.7,
          generator: (i) => AcceleratedParticle(
            acceleration: Vector2(0, 15),
            speed: Vector2(
              (_random.nextDouble() - 0.5) * 80,
              _random.nextDouble() * -60,
            ),
            position: size / 2,
            child: ComposedParticle(
              children: [
                CircleParticle(
                  radius: 2 + _random.nextDouble() * 3,
                  paint: Paint()..color = Colors.yellow.withOpacity(0.7),
                ),
                CircleParticle(
                  radius: 1 + _random.nextDouble() * 2,
                  paint: Paint()..color = Colors.white.withOpacity(0.9),
                ),
              ],
            ),
          ),
        ),
      );
      add(particleComponent);
      
      // Haptic feedback like catching a Pokemon
      HapticFeedback.mediumImpact();
      Future.delayed(const Duration(milliseconds: 100), () {
        HapticFeedback.lightImpact();
      });
    } else {
      // Failure animation - like Pokemon escaping
      add(
        SequenceEffect.sequential(
          [
            MoveByEffect(
              Vector2(-5, 0),
              EffectController(duration: 0.05),
            ),
            MoveByEffect(
              Vector2(10, 0),
              EffectController(duration: 0.1),
            ),
            MoveByEffect(
              Vector2(-10, 0),
              EffectController(duration: 0.1),
            ),
            MoveByEffect(
              Vector2(5, 0),
              EffectController(duration: 0.05),
            ),
            OpacityEffect.fadeOut(
              EffectController(duration: 0.2),
            ),
          ],
        ),
      );
      
      // Add "smoke" particles - like failed Pokemon capture
      final particleComponent = ParticleSystemComponent(
        particle: Particle.generate(
          count: 10,
          lifespan: 0.5,
          generator: (i) => AcceleratedParticle(
            acceleration: Vector2(0, -10),
            speed: Vector2(
              (_random.nextDouble() - 0.5) * 50,
              _random.nextDouble() * -30,
            ),
            position: size / 2,
            child: CircleParticle(
              radius: 3 + _random.nextDouble() * 5,
              paint: Paint()..color = Colors.grey.withOpacity(0.5),
            ),
          ),
        ),
      );
      add(particleComponent);
      
      // Haptic feedback like Pokemon escaping
      HapticFeedback.heavyImpact();
    }
    
    // Call the onDispose callback
    if (onDispose != null) {
      onDispose!(this, isCorrectBin, binType);
    }
  }
  
  // Getter and setter for transformed state to maintain compatibility with existing code
  bool get isTransformed => state == TrashState.transformed;
  set isTransformed(bool value) {
    if (value) {
      state = TrashState.transformed;
    } else {
      state = TrashState.normal;
    }
  }
}
