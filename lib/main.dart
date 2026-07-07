import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:glg_flutter/screens/game_screen.dart';
import 'package:glg_flutter/screens/battle_screen.dart';
import 'package:glg_flutter/screens/pet_selection_screen.dart';
import 'package:glg_flutter/models/monster_type.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // Force fullscreen mode
  await SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GLG - Green Little Game',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.green,
        visualDensity: VisualDensity.adaptivePlatformDensity,
        useMaterial3: true,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const GameScreen(),
        '/battle': (context) => const BattleScreen(),
        '/pet_selection': (context) => const PetSelectionScreen(),
      },
      onGenerateRoute: (settings) {
        if (settings.name == '/battle') {
          final args = settings.arguments as Map<String, dynamic>;
          return MaterialPageRoute(
            builder: (context) => BattleScreen(
              pet: args['pet'],
              enemy: args['enemy'],
              isTutorial: args['isTutorial'] ?? false,
            ),
          );
        } else if (settings.name == '/pet_selection') {
          final args = settings.arguments as Map<String, dynamic>?;
          return MaterialPageRoute(
            builder: (context) => PetSelectionScreen(
              enemy: args?['enemy'],
            ),
          );
        }
        return null;
      },
    );
  }
}
