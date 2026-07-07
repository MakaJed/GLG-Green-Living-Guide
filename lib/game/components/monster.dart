import 'package:flame/components.dart';
import 'package:glg_flutter/game/utils/constants.dart';
import 'package:glg_flutter/models/monster_type.dart';

class Monster extends SpriteComponent with HasGameRef {
  // Monster properties
  final MonsterType type;
  
  // Timer for despawning
  double despawnTimer = 0;
  
  Monster({
    required Vector2 position,
    required this.type,
  }) : super(
          position: position,
          size: Vector2(GameConstants.tileSize, GameConstants.tileSize),
          anchor: Anchor.center,
        );
  
  @override
  Future<void> onLoad() async {
    // Load appropriate sprite based on monster type
    final monsterPath = 'images/monsters/${type.toString().split('.').last}.png';
    sprite = await gameRef.loadSprite(monsterPath);
    
    return super.onLoad();
  }
  
  @override
  void update(double dt) {
    super.update(dt);
    
    // Update despawn timer
    despawnTimer += dt;
    if (despawnTimer >= GameConstants.monsterDespawnTime) {
      removeFromParent();
    }
  }
}
