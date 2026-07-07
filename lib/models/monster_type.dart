enum MonsterType {
  // Metal trash monsters
  canstruct,
  sarcan,
  
  // Paper trash monsters
  paperPhantom,
  
  // Food waste/organic trash monsters
  greezeGlob,
  egglut,
  gloofuud,
  rotato,
  
  // Plastic trash monsters
  bottroll,
  crunchor,
  cupkwek,
  sssstrawpent,
  jellystic,
  
  // Glass trash monsters
  jar,
  shardlass,
  
  // Electronic trash monsters
  voltwing,
  phonii,
}

extension MonsterTypeExtension on MonsterType {
  String get assetPath {
    switch (this) {
      case MonsterType.canstruct:
        return 'images/monsters/Cans-Truct.png';
      case MonsterType.sarcan:
        return 'images/monsters/Sarcan.png';
      case MonsterType.paperPhantom:
        return 'images/monsters/Paper_Phantom.png';
      case MonsterType.greezeGlob:
        return 'images/monsters/Greeze_Glob.png';
      case MonsterType.egglut:
        return 'images/monsters/Egglut.png';
      case MonsterType.gloofuud:
        return 'images/monsters/Gloofuud.png';
      case MonsterType.rotato:
        return 'images/monsters/Rotato.png';
      case MonsterType.bottroll:
        return 'images/monsters/Bottroll.png';
      case MonsterType.crunchor:
        return 'images/monsters/Crunchor.png';
      case MonsterType.cupkwek:
        return 'images/monsters/Cupkwek.png';
      case MonsterType.sssstrawpent:
        return 'images/monsters/Sssstrawpent.png';
      case MonsterType.jellystic:
        return 'images/monsters/Jellystic.png';
      case MonsterType.jar:
        return 'images/monsters/Jar.png';
      case MonsterType.shardlass:
        return 'images/monsters/Shardlass.png';
      case MonsterType.voltwing:
        return 'images/monsters/Voltwing.png';
      case MonsterType.phonii:
        return 'images/monsters/Phonii.png';
    }
  }
  
  String get displayName {
    switch (this) {
      case MonsterType.canstruct:
        return 'Cans-Truct';
      case MonsterType.sarcan:
        return 'Sarcan';
      case MonsterType.paperPhantom:
        return 'Paper Phantom';
      case MonsterType.greezeGlob:
        return 'Greeze Glob';
      case MonsterType.egglut:
        return 'Egglut';
      case MonsterType.gloofuud:
        return 'Gloofuud';
      case MonsterType.rotato:
        return 'Rotato';
      case MonsterType.bottroll:
        return 'Bottroll';
      case MonsterType.crunchor:
        return 'Crunchor';
      case MonsterType.cupkwek:
        return 'Cupkwek';
      case MonsterType.sssstrawpent:
        return 'Sssstrawpent';
      case MonsterType.jellystic:
        return 'Jellystic';
      case MonsterType.jar:
        return 'Jar';
      case MonsterType.shardlass:
        return 'Shardlass';
      case MonsterType.voltwing:
        return 'Voltwing';
      case MonsterType.phonii:
        return 'Phonii';
    }
  }
  
  String get ecoType {
    switch (this) {
      case MonsterType.canstruct:
      case MonsterType.sarcan:
        return 'Metal';
      case MonsterType.paperPhantom:
        return 'Paper';
      case MonsterType.greezeGlob:
      case MonsterType.egglut:
      case MonsterType.gloofuud:
      case MonsterType.rotato:
        return 'Organic';
      case MonsterType.bottroll:
      case MonsterType.crunchor:
      case MonsterType.cupkwek:
      case MonsterType.sssstrawpent:
      case MonsterType.jellystic:
        return 'Plastic';
      case MonsterType.jar:
      case MonsterType.shardlass:
        return 'Glass';
      case MonsterType.voltwing:
      case MonsterType.phonii:
        return 'Electronic';
    }
  }
}
