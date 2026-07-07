import 'package:flutter/material.dart';
import 'package:flame/game.dart';
import 'package:glg_flutter/game/glg_game.dart';
import 'package:glg_flutter/game/utils/constants.dart';
import 'package:flutter/services.dart';
import 'package:glg_flutter/game/components/trash.dart';

class GameScreen extends StatefulWidget {
  const GameScreen({Key? key}) : super(key: key);

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  late GLGGame game;
  bool showControls = true;
  bool showTeleportModal = false;
  bool showDisposalUI = false;
  String targetMap = 'PelletTown';
  Trash? currentTrash;

  @override
  void initState() {
    super.initState();
    
    // Initialize the game
    game = GLGGame(
      onBattleStart: (monsterType) {
        // Navigate to battle screen
        Navigator.of(context).pushNamed(
          '/battle',
          arguments: {
            'pet': 'Owlleaf', // Default pet
            'enemy': monsterType,
            'isTutorial': false,
          },
        ).then((_) {
          // When returning from battle, resume the game
          game.endBattle();
        });
      },
      onTrashInteraction: (show, trash) {
        setState(() {
          showDisposalUI = show;
          currentTrash = trash;
          
          // Check if this is a message to display after disposal
          if (trash != null && !show) {
            // Show a Pokemon-style message for successful/failed disposal
            // This would ideally be implemented as a popup message box
            // For now, just print to console
            if (trash.state == TrashState.disposed) {
              print("Successfully disposed the trash!");
            } else {
              print("The trash wasn't disposed correctly!");
            }
          }
        });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Game canvas
          GameWidget(game: game),
          
          // On-screen controls (optional for mobile)
          if (showControls) _buildControls(),
          
          // Trash disposal UI
          if (showDisposalUI) _buildDisposalUI(),
          
          // Teleport modal
          if (showTeleportModal) _buildTeleportModal(),
        ],
      ),
    );
  }
  
  Widget _buildControls() {
    return Positioned(
      bottom: 20,
      left: 0,
      right: 0,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Column(
            children: [
              // Up button
              _buildControlButton(
                icon: Icons.arrow_upward,
                onPressed: () => game.keysPressed[LogicalKeyboardKey.arrowUp.keyId.toString()] = true,
                onReleased: () => game.keysPressed[LogicalKeyboardKey.arrowUp.keyId.toString()] = false,
              ),
              Row(
                children: [
                  // Left button
                  _buildControlButton(
                    icon: Icons.arrow_back,
                    onPressed: () => game.keysPressed[LogicalKeyboardKey.arrowLeft.keyId.toString()] = true,
                    onReleased: () => game.keysPressed[LogicalKeyboardKey.arrowLeft.keyId.toString()] = false,
                  ),
                  // Down button
                  _buildControlButton(
                    icon: Icons.arrow_downward,
                    onPressed: () => game.keysPressed[LogicalKeyboardKey.arrowDown.keyId.toString()] = true,
                    onReleased: () => game.keysPressed[LogicalKeyboardKey.arrowDown.keyId.toString()] = false,
                  ),
                  // Right button
                  _buildControlButton(
                    icon: Icons.arrow_forward,
                    onPressed: () => game.keysPressed[LogicalKeyboardKey.arrowRight.keyId.toString()] = true,
                    onReleased: () => game.keysPressed[LogicalKeyboardKey.arrowRight.keyId.toString()] = false,
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildControlButton({
    required IconData icon,
    required VoidCallback onPressed,
    required VoidCallback onReleased,
  }) {
    return GestureDetector(
      onTapDown: (_) => onPressed(),
      onTapUp: (_) => onReleased(),
      onTapCancel: onReleased,
      child: Container(
        width: 60,
        height: 60,
        margin: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.7),
          borderRadius: BorderRadius.circular(15),
        ),
        child: Icon(icon, size: 30),
      ),
    );
  }
  
  // Build the trash disposal UI - Pokemon style
  Widget _buildDisposalUI() {
    return Positioned(
      bottom: 20,
      left: 0,
      right: 0,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
          border: Border.all(
            color: Colors.black,
            width: 3,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.5),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Pokemon-style prompt text
            Container(
              padding: const EdgeInsets.all(10),
              margin: const EdgeInsets.only(bottom: 10),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.05),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: Colors.black,
                  width: 2,
                ),
              ),
              child: const Text(
                'What will you do with the trash?',
                style: TextStyle(
                  color: Colors.black,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Pokemon',
                ),
                textAlign: TextAlign.center,
              ),
            ),
            
            // Pokemon-style action buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildPokemonStyleButton(
                  label: 'Recyclable',
                  description: 'Can, Paper, Plastic, Glass',
                  color: const Color(0xFF3498DB),
                  onTap: () => game.disposeTrash('Recyclable'),
                ),
                _buildPokemonStyleButton(
                  label: 'Compostable',
                  description: 'Organic Waste',
                  color: const Color(0xFF2ECC71),
                  onTap: () => game.disposeTrash('Compostable'),
                ),
                _buildPokemonStyleButton(
                  label: 'Electronic',
                  description: 'E-Waste',
                  color: const Color(0xFFE67E22),
                  onTap: () => game.disposeTrash('Electronic'),
                ),
              ],
            ),
            
            // Run away option - like in Pokemon battles
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: InkWell(
                onTap: () {
                  setState(() {
                    showDisposalUI = false;
                  });
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 15),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.black, width: 2),
                  ),
                  child: const Text(
                    'Run Away',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  // Build a Pokemon-style action button
  Widget _buildPokemonStyleButton({
    required String label,
    required String description,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: 100,
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.2),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: color,
            width: 2,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                color: color.withOpacity(0.8),
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              description,
              style: TextStyle(
                color: Colors.black.withOpacity(0.7),
                fontSize: 10,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildTeleportModal() {
    return Container(
      color: Colors.black.withOpacity(0.7),
      child: Center(
        child: Container(
          padding: const EdgeInsets.all(20),
          width: 300,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(15),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Would you like to travel to $targetMap?',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 18),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: () {
                      // Teleport to the target map
                      game.currentMap = targetMap;
                      setState(() {
                        showTeleportModal = false;
                        targetMap = game.currentMap == 'PelletTown' ? 'RouteJuan' : 'PelletTown';
                      });
                    },
                    child: const Text('Yes'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      setState(() {
                        showTeleportModal = false;
                      });
                    },
                    child: const Text('No'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// We now use the real LogicalKeyboardKey from flutter/services.dart
