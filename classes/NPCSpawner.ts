import { NPC, NPCConfig } from './NPC';
import { Position } from '../types';
import { Boundary } from './Boundary';
import { rectangularCollision } from '../app/(tabs)/data/util';

export class NPCSpawner {
  private readonly boundaries: Boundary[];
  private readonly mapWidth: number;
  private readonly mapHeight: number;
  private readonly tileSize: number;
  private readonly spawnAttempts: number = 10;

  constructor(
    boundaries: Boundary[],
    mapWidth: number,
    mapHeight: number,
    tileSize: number = 48
  ) {
    this.boundaries = boundaries;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.tileSize = tileSize;
  }

  /**
   * Spawn a new NPC at a valid position that doesn't overlap with boundaries
   */
  spawnNPC(litterChance: number = 0.005, moveSpeed: number = 2): NPC | null {
    // Try to find a valid position several times
    for (let i = 0; i < this.spawnAttempts; i++) {
      // Generate a random position within the map bounds, with padding
      const padding = this.tileSize * 2;
      const position = {
        x: padding + Math.random() * (this.mapWidth - padding * 2),
        y: padding + Math.random() * (this.mapHeight - padding * 2)
      };

      // Check if the position is valid
      if (this.isValidSpawnPosition(position)) {
        const npcConfig: NPCConfig = {
          id: `npc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          position,
          litterChance,
          moveSpeed
        };
        return new NPC(npcConfig);
      }
    }

    // Could not find a valid position after several attempts
    console.warn('Could not find a valid NPC spawn position after multiple attempts');
    return null;
  }

  /**
   * Batch spawn multiple NPCs
   */
  spawnNPCs(count: number, litterChance: number = 0.005, moveSpeed: number = 2): NPC[] {
    const npcs: NPC[] = [];

    for (let i = 0; i < count; i++) {
      const npc = this.spawnNPC(litterChance, moveSpeed);
      if (npc) {
        npcs.push(npc);
      }
    }

    return npcs;
  }

  /**
   * Check if a position is valid for NPC spawning
   */
  private isValidSpawnPosition(position: Position): boolean {
    // Create a rectangle for the NPC
    const npcRect = {
      position,
      width: this.tileSize,
      height: this.tileSize,
    };

    // Check if the NPC would collide with any boundary
    for (const boundary of this.boundaries) {
      if (rectangularCollision({
        rectangle1: npcRect,
        rectangle2: {
          position: boundary.position,
          width: boundary.width,
          height: boundary.height
        }
      })) {
        return false;
      }
    }

    // Also ensure the NPC is within the map bounds
    if (
      position.x < 0 || 
      position.x > this.mapWidth - this.tileSize ||
      position.y < 0 || 
      position.y > this.mapHeight - this.tileSize
    ) {
      return false;
    }

    return true;
  }

  /**
   * Check if an NPC's movement would result in a collision
   */
  checkNPCCollision(npc: NPC, nextPosition: Position): boolean {
    const npcRect = {
      position: nextPosition,
      width: this.tileSize,
      height: this.tileSize,
    };

    // Check if the NPC would collide with any boundary
    for (const boundary of this.boundaries) {
      if (rectangularCollision({
        rectangle1: npcRect,
        rectangle2: {
          position: boundary.position,
          width: boundary.width,
          height: boundary.height
        }
      })) {
        return true;
      }
    }

    // Also check map boundaries
    if (
      nextPosition.x < 0 || 
      nextPosition.x > this.mapWidth - this.tileSize ||
      nextPosition.y < 0 || 
      nextPosition.y > this.mapHeight - this.tileSize
    ) {
      return true;
    }

    return false;
  }
} 