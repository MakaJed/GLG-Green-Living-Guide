enum TrashType {
  can,
  organic,
  paper,
  plastic,
  glass,
  electronic,
}

extension TrashTypeExtension on TrashType {
  String get assetPath {
    switch (this) {
      case TrashType.can:
        return 'images/trash/can_trash.png';
      case TrashType.organic:
        return 'images/trash/organic_trash.png';
      case TrashType.paper:
        return 'images/trash/paper_trash.png';
      case TrashType.plastic:
        return 'images/trash/plastic_trash.png';
      case TrashType.glass:
        return 'images/trash/glass_trash.png';
      case TrashType.electronic:
        return 'images/trash/electronic_trash.png';
    }
  }
  
  String get description {
    switch (this) {
      case TrashType.can:
        return 'A discarded metal can';
      case TrashType.organic:
        return 'Food waste that could be composted';
      case TrashType.paper:
        return 'Paper that should be recycled';
      case TrashType.plastic:
        return 'Plastic waste that pollutes the environment';
      case TrashType.glass:
        return 'Glass waste that should be recycled';
      case TrashType.electronic:
        return 'Electronic waste that requires special disposal';
    }
  }
}
