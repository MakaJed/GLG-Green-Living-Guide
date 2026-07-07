class GameConstants {
  // Game view and dimensions
  static const double tileSize = 48.0;
  static const double playerHeight = 68.0;
  static const double viewportWidth = 800.0;
  static const double viewportHeight = 600.0;
  
  // Player movement
  static const double playerSpeed = 3.0;
  static const int frameHold = 3;
  static const int frameCount = 4;
  
  // Map structure
  static const int columns = 70;
  
  // NPC and trash spawn settings
  static const int maxNPCs = 5;
  static const int initialNPCCount = 3;
  static const double npcSpawnInterval = 10.0; // in seconds
  static const double npcSpeed = 1.5;
  static const double npcTrashDropChance = 0.01; // 1% chance per second
  
  // Trash settings
  static const int maxTrash = 8;
  static const double trashTransformTime = 30.0; // in seconds
  static const double monsterDespawnTime = 120.0; // in seconds
  static const double monsterTriggerDistance = tileSize * 1.5;
  static const double trashInteractionDistance = tileSize * 1.2; // Distance for trash interaction
  static const double disposalAnimationDuration = 1.0; // Animation duration in seconds
  // Removed previous comment as disposalAnimationDuration is now needed again
  
  // Battle cooldown
  static const double battleCooldown = 5.0; // in seconds
  
  // Interaction settings
  static const double interactionButtonSize = 60.0;
  static const double interactionCooldown = 0.5; // in seconds
  
  // Trash disposal bin types mapping
  static const Map<String, List<String>> disposalBinTypes = {
    'Recyclable': ['can', 'paper', 'plastic', 'glass'],
    'Compostable': ['organic'],
    'Electronic': ['electronic'],
  };
}
