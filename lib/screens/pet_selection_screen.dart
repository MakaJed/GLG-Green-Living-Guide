import 'package:flutter/material.dart';
import 'package:glg_flutter/models/monster_type.dart';

class PetSelectionScreen extends StatelessWidget {
  final String? enemy;

  const PetSelectionScreen({Key? key, this.enemy}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Choose Your Eco Buddy'),
        backgroundColor: Colors.green,
      ),
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage('assets/images/background/pet_select_bg.png'),
            fit: BoxFit.cover,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Title and instruction
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    const Text(
                      'Choose Your Eco Buddy to Battle',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        shadows: [
                          Shadow(
                            blurRadius: 3.0,
                            color: Colors.black,
                            offset: Offset(1.0, 1.0),
                          ),
                        ],
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 10),
                    if (enemy != null)
                      Text(
                        'You\'re facing a ${_getMonsterDisplayName(enemy!)}',
                        style: const TextStyle(
                          fontSize: 18,
                          color: Colors.white,
                          shadows: [
                            Shadow(
                              blurRadius: 3.0,
                              color: Colors.black,
                              offset: Offset(1.0, 1.0),
                            ),
                          ],
                        ),
                        textAlign: TextAlign.center,
                      ),
                  ],
                ),
              ),
              
              // Pet selection grid
              Expanded(
                child: GridView.count(
                  crossAxisCount: 2,
                  padding: const EdgeInsets.all(16),
                  childAspectRatio: 0.8,
                  children: [
                    _buildPetCard(
                      context,
                      name: 'Owlleaf',
                      type: 'Recyclable',
                      description: 'A wise owl with the power of plants. Strong against organic waste.',
                      imagePath: 'assets/images/pets/owlleaf.png',
                      color: Colors.green,
                    ),
                    _buildPetCard(
                      context,
                      name: 'Aquafin',
                      type: 'Compostable',
                      description: 'A water spirit that purifies pollution. Effective against plastic.',
                      imagePath: 'assets/images/pets/aquafin.png',
                      color: Colors.blue,
                    ),
                    _buildPetCard(
                      context,
                      name: 'Sparkplug',
                      type: 'Electronic',
                      description: 'An electric companion that recycles energy. Good against metal.',
                      imagePath: 'assets/images/pets/sparkplug.png',
                      color: Colors.amber,
                    ),
                    _buildPetCard(
                      context,
                      name: 'Geostone',
                      type: 'Hazardous',
                      description: 'A rock creature that neutralizes hazards. Strong against glass.',
                      imagePath: 'assets/images/pets/geostone.png',
                      color: Colors.brown,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildPetCard(
    BuildContext context, {
    required String name,
    required String type,
    required String description,
    required String imagePath,
    required Color color,
  }) {
    return Card(
      elevation: 5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      child: InkWell(
        onTap: () {
          // Navigate to battle screen with selected pet
          Navigator.of(context).pushReplacementNamed(
            '/battle',
            arguments: {
              'pet': name,
              'enemy': enemy,
              'isTutorial': false,
            },
          );
        },
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(15),
            gradient: LinearGradient(
              colors: [Colors.white, color.withOpacity(0.3)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                name,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  type,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.asset(
                    imagePath,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: Colors.grey.shade200,
                        child: const Center(
                          child: Icon(Icons.error, size: 40),
                        ),
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                description,
                style: const TextStyle(fontSize: 12),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  String _getMonsterDisplayName(String enemyType) {
    try {
      final monsterType = MonsterType.values.firstWhere(
        (e) => e.toString().split('.').last.toLowerCase() == enemyType.toLowerCase(),
        orElse: () => MonsterType.canstruct,
      );
      return monsterType.displayName;
    } catch (e) {
      return enemyType;
    }
  }
}
