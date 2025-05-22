import { NPC, TrashType } from './NPC';
import { Position, Bounds } from '../types';
import { TrashMonsterFactory } from './monsters';
import { Creature, EcoType } from './battle';
import { NPCSpawner } from './NPCSpawner';
import { Boundary } from './Boundary';

export interface LitterEvent {
  npcId: string;
  position: Position;
  trashType: TrashType;
  timestamp: number;
  transformationProgress: number; // 0-1 for transformation animation
  littered: boolean; // Track if the litter has been placed
}

export interface RenderableEntity {
  position: Position;
  sprite: string;
  opacity?: number;
  scale?: number;
  rotation?: number;
  zIndex?: number; // For rendering order
  animationFrame?: number;
  originalType?: string;
}

export class LitterEventManager {
  private npcs: Map<string, NPC> = new Map();
  private activeMonsters: Map<string, Creature> = new Map();
  private events: LitterEvent[] = [];
  private activeTrash: Map<string, {position: Position, trashType: TrashType}> = new Map();
  private readonly MAX_MONSTERS = 5;
  private readonly TRANSFORM_DELAY = 2000; // 2 seconds
  private readonly SPAWN_RADIUS = 50; // pixels
  private readonly MAX_ACTIVE_TRASH = 15; // Maximum number of trash items on screen
  
  private npcSpawner: NPCSpawner;

  constructor(
    boundaries: Boundary[],
    mapWidth: number,
    mapHeight: number,
    tileSize: number = 48
  ) {
    // Create NPC spawner
    this.npcSpawner = new NPCSpawner(boundaries, mapWidth, mapHeight, tileSize);
  }

  // Spawn a specified number of NPCs
  spawnInitialNPCs(count: number, litterChance: number = 0.005, moveSpeed: number = 2) {
    const newNPCs = this.npcSpawner.spawnNPCs(count, litterChance, moveSpeed);
    
    // Add NPCs and set their collision checker
    newNPCs.forEach(npc => {
      // Set collision checker function from the spawner
      npc.setCollisionChecker((npc, nextPosition) => {
        return this.npcSpawner.checkNPCCollision(npc, nextPosition);
      });
      
      this.addNPC(npc);
    });
    
    return newNPCs;
  }

  addNPC(npc: NPC) {
    this.npcs.set(npc.id, npc);
  }

  removeNPC(npcId: string) {
    this.npcs.delete(npcId);
  }

  update(deltaTime: number) {
    // Update NPCs and check for new litter events
    this.npcs.forEach(npc => {
      const { didLitter, trashType } = npc.update(deltaTime);
      if (didLitter && trashType) {
        this.createLitterEvent(npc, trashType);
      }
    });

    // Process pending transformations
    this.processTransformations();

    // Update transformation progress
    const now = Date.now();
    this.events.forEach(event => {
      const elapsed = now - event.timestamp;
      event.transformationProgress = Math.min(1, elapsed / this.TRANSFORM_DELAY);
      
      // Place litter on ground at the start of transformation
      if (!event.littered && event.transformationProgress > 0.1) {
        this.placeTrashOnGround(event);
        event.littered = true;
      }
    });
  }

  private placeTrashOnGround(event: LitterEvent) {
    // Skip if at maximum trash
    if (this.activeTrash.size >= this.MAX_ACTIVE_TRASH) {
      // Replace oldest trash if at limit
      const oldestTrashId = Array.from(this.activeTrash.keys())[0];
      if (oldestTrashId) {
        this.activeTrash.delete(oldestTrashId);
      }
    }

    // Add trash to the ground
    const trashId = `trash_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.activeTrash.set(trashId, {
      position: { ...event.position },
      trashType: event.trashType
    });
  }

  private createLitterEvent(npc: NPC, trashType: TrashType) {
    if (this.activeMonsters.size >= this.MAX_MONSTERS) {
      return; // Don't create new events if at monster cap
    }

    const event: LitterEvent = {
      npcId: npc.id,
      position: { ...npc.position },
      trashType,
      timestamp: Date.now(),
      transformationProgress: 0,
      littered: false
    };

    this.events.push(event);
    npc.startTransformation();
  }

  private processTransformations() {
    const now = Date.now();
    const pendingEvents = this.events.filter(
      event => now - event.timestamp >= this.TRANSFORM_DELAY
    );

    pendingEvents.forEach(event => {
      // Remove the NPC
      this.npcs.delete(event.npcId);

      // Create a monster based on trash type
      const monster = this.createMonsterFromTrash(event);
      this.activeMonsters.set(monster.name, monster);

      // Remove the processed event
      this.events = this.events.filter(e => e.npcId !== event.npcId);
      
      // Replace the transformed NPC
      this.replaceTransformedNPC();
    });
  }

  private createMonsterFromTrash(event: LitterEvent): Creature {
    // Add some randomization to spawn position
    const spawnPosition = {
      x: event.position.x + (Math.random() - 0.5) * this.SPAWN_RADIUS,
      y: event.position.y + (Math.random() - 0.5) * this.SPAWN_RADIUS
    };

    // Create appropriate monster based on trash type with weighted level distribution
    // This creates a more natural distribution where lower levels are more common
    // but higher level monsters can still appear occasionally
    let level: number;
    const randomValue = Math.random();
    
    if (randomValue < 0.5) {
      // 50% chance for levels 1-5
      level = Math.floor(Math.random() * 5) + 1;
    } else if (randomValue < 0.8) {
      // 30% chance for levels 6-10
      level = Math.floor(Math.random() * 5) + 6;
    } else if (randomValue < 0.95) {
      // 15% chance for levels 11-14
      level = Math.floor(Math.random() * 4) + 11;
    } else {
      // 5% chance for level 15 (rare boss-like encounter)
      level = 15;
    }
    let monster;
    const trashSprite = event.trashType.sprite;
    
    // Map trash type to appropriate monster
    switch (trashSprite) {
      case 'metal':
        monster = Math.random() < 0.5 ? 
          TrashMonsterFactory.createCanstruct(level) : 
          TrashMonsterFactory.createSarcan(level);
        break;
      case 'food_waste':
        const foodWasteMonsters = [
          TrashMonsterFactory.createGreezeGlob,
          TrashMonsterFactory.createEgglut,
          TrashMonsterFactory.createGloofuud,
          TrashMonsterFactory.createRotato
        ];
        monster = foodWasteMonsters[Math.floor(Math.random() * foodWasteMonsters.length)](level);
        break;
      case 'paper':
        monster = TrashMonsterFactory.createPaperPhantom(level);
        break;
      case 'plastic':
        const plasticMonsters = [
          TrashMonsterFactory.createBottroll,
          TrashMonsterFactory.createCrunchor,
          TrashMonsterFactory.createCupkwek,
          TrashMonsterFactory.createSssstrawpent,
          TrashMonsterFactory.createJellystic
        ];
        monster = plasticMonsters[Math.floor(Math.random() * plasticMonsters.length)](level);
        break;
      case 'glass':
        monster = Math.random() < 0.5 ? 
          TrashMonsterFactory.createJar(level) : 
          TrashMonsterFactory.createShardlass(level);
        break;
      case 'electronic':
        monster = Math.random() < 0.5 ? 
          TrashMonsterFactory.createVoltwing(level) : 
          TrashMonsterFactory.createPhonii(level);
        break;
      default:
        // Default fallback based on eco type
        switch (event.trashType.type) {
          case EcoType.RECYCLABLE:
            monster = TrashMonsterFactory.createCanstruct(level);
            break;
          case EcoType.COMPOSTABLE:
            monster = TrashMonsterFactory.createGreezeGlob(level);
            break;
          case EcoType.HAZARDOUS:
            monster = TrashMonsterFactory.createVoltwing(level);
            break;
          default:
            monster = TrashMonsterFactory.createCanstruct(level);
        }
    }
    
    // Set the monster's position
    monster.position = spawnPosition;
    // Set original trash type if not already set
    if (!monster.originalTrashType) {
      monster.originalTrashType = event.trashType.sprite;
    }
    return monster;
  }

  // Get all entities that need to be rendered
  getRenderableEntities(): RenderableEntity[] {
    const entities: RenderableEntity[] = [];

    // Add trash on ground
    this.activeTrash.forEach(trash => {
      entities.push({
        position: trash.position,
        sprite: trash.trashType.sprite,
        zIndex: 1
      });
    });

    // Add NPCs
    this.npcs.forEach(npc => {
      if (npc.isCurrentlyLittering()) {
        // Littering animation
        const litterProgress = npc.getLitterProgress();
        const currentLitter = npc.getCurrentLitter();
        
        // Add NPC in littering pose
        entities.push({
          position: npc.position,
          sprite: npc.getSprite(),
          animationFrame: npc.animationFrame,
          zIndex: 3
        });
        
        // Show trash being dropped
        if (currentLitter) {
          // Calculate trash position relative to NPC
          const litterOffset = {
            x: npc.position.x + 10,
            y: npc.position.y - 5 + (20 * litterProgress) // Move down as littering progresses
          };
          
          entities.push({
            position: litterOffset,
            sprite: currentLitter.sprite,
            originalType: currentLitter.sprite,
            opacity: litterProgress,
            scale: 0.5 + (litterProgress * 0.5),
            rotation: litterProgress * 180,
            zIndex: 2
          });
        }
      } else if (!npc.isCurrentlyTransforming()) {
        // Normal NPC
        entities.push({
          position: npc.position,
          sprite: npc.getSprite(),
          animationFrame: npc.animationFrame,
          zIndex: 3
        });
      }
    });

    // Add transforming NPCs and their trash
    this.events.forEach(event => {
      const npc = this.npcs.get(event.npcId);
      if (npc) {
        // NPC fading out
        entities.push({
          position: npc.position,
          sprite: npc.getSprite(),
          animationFrame: npc.animationFrame,
          opacity: 1 - event.transformationProgress,
          scale: 1 + event.transformationProgress * 0.2,
          rotation: event.transformationProgress * 360,
          zIndex: 4
        });

        // Transformation effects - use existing asset like fireball
        entities.push({
          position: {
            x: npc.position.x - 15,
            y: npc.position.y - 15
          },
          sprite: 'fireball',
          opacity: Math.min(1, event.transformationProgress * 2),
          scale: event.transformationProgress * 2,
          zIndex: 5
        });
      }
    });

    // Add monsters with distinct sprites based on type
    this.activeMonsters.forEach(monster => {
      entities.push({
        position: monster.position,
        sprite: `monster_${monster.type.toLowerCase()}`,
        originalType: monster.originalTrashType || 'can_trash', // Provide default
        zIndex: 4
      });
    });

    // Sort by zIndex for proper rendering
    return entities.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  }

  getActiveMonsters(): Creature[] {
    return Array.from(this.activeMonsters.values());
  }

  removeMonster(monsterId: string) {
    this.activeMonsters.delete(monsterId);
  }

  checkBattleTrigger(playerPosition: Position): Creature | null {
    const BATTLE_TRIGGER_DISTANCE = 50; // pixels

    // Convert to array before iterating to avoid downlevelIteration issues
    const monsters = Array.from(this.activeMonsters.values());
    for (const monster of monsters) {
      const dx = playerPosition.x - monster.position.x;
      const dy = playerPosition.y - monster.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= BATTLE_TRIGGER_DISTANCE) {
        return monster;
      }
    }

    return null;
  }

  // Method to replace a transformed NPC with a new one
  replaceTransformedNPC() {
    // Only spawn a new NPC if we're below our desired count
    if (this.npcs.size < 10) { // Maintain around 10 NPCs
      const newNPC = this.npcSpawner.spawnNPC();
      if (newNPC) {
        // Set collision checker function
        newNPC.setCollisionChecker((npc, nextPosition) => {
          return this.npcSpawner.checkNPCCollision(npc, nextPosition);
        });
        
        this.addNPC(newNPC);
      }
    }
  }
} 