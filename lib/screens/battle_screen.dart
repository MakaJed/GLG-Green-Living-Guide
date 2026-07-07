import 'package:flutter/material.dart';
import 'package:glg_flutter/models/monster_type.dart';

class BattleScreen extends StatefulWidget {
  final String? pet;
  final String? enemy;
  final bool isTutorial;

  const BattleScreen({
    Key? key,
    this.pet,
    this.enemy,
    this.isTutorial = false,
  }) : super(key: key);

  @override
  State<BattleScreen> createState() => _BattleScreenState();
}

class _BattleScreenState extends State<BattleScreen> {
  // Battle state
  bool isPlayerTurn = true;
  int turnCount = 0;
  List<String> battleLog = [];
  
  // Health and energy points
  int playerHP = 100;
  int playerMaxHP = 100;
  int playerEP = 50;
  int playerMaxEP = 50;
  
  int enemyHP = 100;
  int enemyMaxHP = 100;
  
  // Battle actions
  List<Map<String, dynamic>> availableSkills = [
    {'name': 'Basic Attack', 'damage': 15, 'cost': 0, 'description': 'A basic attack that deals moderate damage.'},
    {'name': 'Eco Restore', 'damage': 0, 'cost': 10, 'description': 'Restore 30 HP using eco-friendly energy.'},
    {'name': 'Recycle Blast', 'damage': 25, 'cost': 20, 'description': 'Attack using recycled materials.'},
    {'name': 'Compost Bomb', 'damage': 35, 'cost': 30, 'description': 'Throw a powerful composted projectile.'},
  ];

  @override
  void initState() {
    super.initState();
    
    // Initialize battle
    battleLog.add('Battle started!');
    
    // Set up enemy based on type
    if (widget.enemy != null) {
      try {
        final enemyType = MonsterType.values.firstWhere(
          (e) => e.toString().split('.').last.toLowerCase() == widget.enemy!.toLowerCase(),
          orElse: () => MonsterType.canstruct,
        );
        
        // Adjust enemy stats based on type
        switch (enemyType) {
          case MonsterType.canstruct:
          case MonsterType.sarcan:
            enemyHP = enemyMaxHP = 120;
            break;
          case MonsterType.paperPhantom:
            enemyHP = enemyMaxHP = 90;
            break;
          case MonsterType.greezeGlob:
          case MonsterType.egglut:
          case MonsterType.gloofuud:
          case MonsterType.rotato:
            enemyHP = enemyMaxHP = 110;
            break;
          case MonsterType.bottroll:
          case MonsterType.crunchor:
          case MonsterType.cupkwek:
          case MonsterType.sssstrawpent:
          case MonsterType.jellystic:
            enemyHP = enemyMaxHP = 100;
            break;
          case MonsterType.jar:
          case MonsterType.shardlass:
            enemyHP = enemyMaxHP = 130;
            break;
          case MonsterType.voltwing:
          case MonsterType.phonii:
            enemyHP = enemyMaxHP = 110;
            break;
        }
        
        battleLog.add('A wild ${enemyType.displayName} appeared!');
      } catch (e) {
        battleLog.add('A wild monster appeared!');
      }
    } else {
      battleLog.add('A wild monster appeared!');
    }
    
    // Add tutorial message if needed
    if (widget.isTutorial) {
      battleLog.add('Welcome to your first battle! Use your skills to defeat the trash monster.');
      battleLog.add('Each skill uses Energy Points (EP). Choose wisely!');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage('assets/images/background/battle_bg.png'),
            fit: BoxFit.cover,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Battle scene
              Expanded(
                flex: 3,
                child: _buildBattleScene(),
              ),
              
              // Battle log
              Container(
                height: 100,
                margin: const EdgeInsets.all(10),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: ListView.builder(
                  reverse: true,
                  itemCount: battleLog.length,
                  itemBuilder: (context, index) {
                    return Text(
                      battleLog[battleLog.length - 1 - index],
                      style: const TextStyle(fontSize: 14),
                    );
                  },
                ),
              ),
              
              // Action buttons
              Expanded(
                flex: 2,
                child: Container(
                  margin: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.8),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: isPlayerTurn
                      ? _buildActionButtons()
                      : const Center(
                          child: Text(
                            "Enemy's turn...",
                            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildBattleScene() {
    return Stack(
      children: [
        // Player and enemy
        Column(
          children: [
            // Enemy section
            Expanded(
              child: Row(
                children: [
                  // Enemy info
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.enemy?.toUpperCase() ?? 'MONSTER',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
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
                          ),
                          const SizedBox(height: 5),
                          _buildHealthBar(enemyHP, enemyMaxHP, Colors.red),
                        ],
                      ),
                    ),
                  ),
                  
                  // Enemy sprite
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      child: Image.asset(
                        'assets/images/monsters/${widget.enemy ?? 'canstruct'}.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            // Player section
            Expanded(
              child: Row(
                children: [
                  // Player sprite
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      child: Image.asset(
                        'assets/images/player/playerLeft.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                  
                  // Player info
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.pet?.toUpperCase() ?? 'PLAYER',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
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
                          ),
                          const SizedBox(height: 5),
                          _buildHealthBar(playerHP, playerMaxHP, Colors.green),
                          const SizedBox(height: 5),
                          _buildEnergyBar(playerEP, playerMaxEP, Colors.blue),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
  
  Widget _buildHealthBar(int current, int max, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text(
              'HP: ',
              style: TextStyle(
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
            ),
            Text(
              '$current / $max',
              style: const TextStyle(
                color: Colors.white,
                shadows: [
                  Shadow(
                    blurRadius: 3.0,
                    color: Colors.black,
                    offset: Offset(1.0, 1.0),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Container(
          width: double.infinity,
          height: 15,
          decoration: BoxDecoration(
            color: Colors.grey.shade700,
            borderRadius: BorderRadius.circular(10),
          ),
          child: FractionallySizedBox(
            widthFactor: current / max,
            alignment: Alignment.centerLeft,
            child: Container(
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildEnergyBar(int current, int max, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text(
              'EP: ',
              style: TextStyle(
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
            ),
            Text(
              '$current / $max',
              style: const TextStyle(
                color: Colors.white,
                shadows: [
                  Shadow(
                    blurRadius: 3.0,
                    color: Colors.black,
                    offset: Offset(1.0, 1.0),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Container(
          width: double.infinity,
          height: 15,
          decoration: BoxDecoration(
            color: Colors.grey.shade700,
            borderRadius: BorderRadius.circular(10),
          ),
          child: FractionallySizedBox(
            widthFactor: current / max,
            alignment: Alignment.centerLeft,
            child: Container(
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildActionButtons() {
    return Column(
      children: [
        Expanded(
          child: GridView.count(
            crossAxisCount: 2,
            padding: const EdgeInsets.all(10),
            children: availableSkills.map((skill) {
              final bool isDisabled = skill['cost'] > playerEP;
              
              return GestureDetector(
                onTap: isDisabled
                    ? null
                    : () => _executePlayerAction(skill),
                child: Card(
                  color: isDisabled
                      ? Colors.grey.shade300
                      : Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          skill['name'],
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: isDisabled ? Colors.grey : Colors.black,
                          ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          skill['cost'] == 0
                              ? 'No EP Cost'
                              : 'EP Cost: ${skill["cost"]}',
                          style: TextStyle(
                            fontSize: 12,
                            color: isDisabled ? Colors.grey : Colors.blue,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          skill['damage'] == 0
                              ? 'Healing'
                              : 'Damage: ${skill["damage"]}',
                          style: TextStyle(
                            fontSize: 12,
                            color: isDisabled
                                ? Colors.grey
                                : (skill['damage'] == 0
                                    ? Colors.green
                                    : Colors.red),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ElevatedButton(
                onPressed: () {
                  // Exit battle
                  Navigator.of(context).pop();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Flee'),
              ),
            ],
          ),
        ),
      ],
    );
  }
  
  void _executePlayerAction(Map<String, dynamic> skill) {
    if (!isPlayerTurn) return;
    
    setState(() {
      // Deduct EP cost
      playerEP = playerEP - (skill['cost'] as int);
      
      // Execute skill
      if (skill['damage'] == 0) {
        // Healing skill
        final healAmount = 30;
        playerHP = (playerHP + healAmount).clamp(0, playerMaxHP);
        battleLog.add('${widget.pet} used ${skill["name"]} and healed $healAmount HP!');
      } else {
        // Damage skill
        final damage = skill['damage'];
        enemyHP = (enemyHP - damage.toInt()).clamp(0, enemyMaxHP);
        battleLog.add('${widget.pet} used ${skill["name"]} for $damage damage!');
        
        // Check if enemy is defeated
        if (enemyHP <= 0) {
          battleLog.add('The wild ${widget.enemy} was defeated!');
          battleLog.add('You gained 100 XP!');
          
          // Add a slight delay before returning to the game
          Future.delayed(const Duration(seconds: 2), () {
            Navigator.of(context).pop();
          });
          return;
        }
      }
      
      // Switch to enemy turn
      isPlayerTurn = false;
      
      // Execute enemy turn after delay
      Future.delayed(const Duration(seconds: 1), () {
        _executeEnemyTurn();
      });
    });
  }
  
  void _executeEnemyTurn() {
    setState(() {
      // Simple enemy AI - just attack
      final damage = 10 + (turnCount ~/ 2).clamp(0, 15); // Increases over time
      playerHP = (playerHP - damage).clamp(0, playerMaxHP);
      battleLog.add('The wild ${widget.enemy} attacked for $damage damage!');
      
      // Check if player is defeated
      if (playerHP <= 0) {
        battleLog.add('${widget.pet} was defeated!');
        
        // Add a slight delay before returning to the game
        Future.delayed(const Duration(seconds: 2), () {
          Navigator.of(context).pop();
        });
        return;
      }
      
      // Restore some EP
      playerEP = (playerEP + 5).clamp(0, playerMaxEP);
      
      // Switch back to player turn
      isPlayerTurn = true;
      turnCount++;
    });
  }
}
