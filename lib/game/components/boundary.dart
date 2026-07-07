import 'package:flame/components.dart';
import 'package:flame/collisions.dart';
import 'package:flutter/material.dart';
import 'dart:ui' show Rect;
import 'package:glg_flutter/game/utils/constants.dart';

class Boundary extends PositionComponent with HasGameRef, CollisionCallbacks {
  // Hitbox for collision detection
  late ShapeHitbox hitbox;
  
  // Whether to show the boundary visually (for debugging)
  final bool isVisible;
  
  Boundary({
    required Vector2 position,
    Vector2? size,
    this.isVisible = false,
  }) : super(
         position: position,
         size: size ?? Vector2(GameConstants.tileSize, GameConstants.tileSize),
       );
  
  @override
  Future<void> onLoad() async {
    // Create hitbox for collision detection
    hitbox = RectangleHitbox(size: size);
    add(hitbox);
    
    return super.onLoad();
  }
  
  @override
  void render(Canvas canvas) {
    super.render(canvas);
    
    // Only render boundary when debugging
    if (isVisible) {
      canvas.drawRect(
        Rect.fromLTWH(0, 0, size.x, size.y),
        Paint()
          ..color = Colors.red.withOpacity(0.3)
          ..style = PaintingStyle.fill,
      );
      
      // Draw outline
      canvas.drawRect(
        Rect.fromLTWH(0, 0, size.x, size.y),
        Paint()
          ..color = Colors.red
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2,
      );
    }
  }
}
