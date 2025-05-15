import { EcoType } from './battle';
import { Position } from '../types';

export type Direction = 'up' | 'down' | 'left' | 'right';
export type AnimationState = 'idle' | 'walking' | 'transforming' | 'littering';

export interface NPCConfig {
  id: string;
  position: Position;
  litterChance: number;  // 0-1 probability of littering per update
  moveSpeed: number;
}

export type TrashType = {
  type: EcoType;
  sprite: string;
  description: string;
}

export const TRASH_TYPES: Record<string, TrashType> = {
  PLASTIC_BOTTLE: {
    type: EcoType.RECYCLABLE,
    sprite: 'fireball', // Using existing fireball asset as placeholder for plastic bottle
    description: 'A discarded plastic bottle'
  },
  FOOD_WASTE: {
    type: EcoType.COMPOSTABLE,
    sprite: 'portal', // Using existing portal asset as placeholder for food waste
    description: 'Rotting food scraps'
  },
  BATTERY: {
    type: EcoType.HAZARDOUS,
    sprite: 'fireball', // Using existing fireball asset as placeholder for battery
    description: 'A leaking battery'
  },
  PAPER_CUP: {
    type: EcoType.RECYCLABLE,
    sprite: 'portal', // Using existing portal asset as placeholder for paper cup
    description: 'A used paper coffee cup'
  },
  PLASTIC_BAG: {
    type: EcoType.RECYCLABLE,
    sprite: 'fireball', // Using existing fireball asset as placeholder for plastic bag
    description: 'A discarded plastic shopping bag'
  }
};

export class NPC {
  id: string;
  position: Position;
  private litterChance: number;
  private moveSpeed: number;
  private isTransforming: boolean = false;
  private litteringState: {
    isLittering: boolean;
    startTime: number;
    duration: number;
    trashType?: TrashType;
  } = {
    isLittering: false,
    startTime: 0,
    duration: 1000 // 1 second littering animation
  };
  
  // Collision handling callback
  private collisionChecker?: (npc: NPC, nextPosition: Position) => boolean;
  
  // Sprite and animation properties
  direction: Direction = 'down';
  animationState: AnimationState = 'idle';
  animationFrame: number = 0;
  private readonly FRAME_COUNT = 4;
  private readonly FRAME_HOLD = 3; // Match player animation hold time
  private frame_hold_counter = 0; // For counting frames
  private readonly FRAME_DURATION = 150; // milliseconds
  private lastFrameUpdate: number = 0;
  private movementCooldown: number = 0;

  constructor(config: NPCConfig) {
    this.id = config.id;
    this.position = config.position;
    this.litterChance = config.litterChance;
    this.moveSpeed = config.moveSpeed;
  }

  // Set collision checker function
  setCollisionChecker(checker: (npc: NPC, nextPosition: Position) => boolean) {
    this.collisionChecker = checker;
  }

  update(deltaTime: number): { didLitter: boolean; trashType?: TrashType } {
    // Handle transformation state
    if (this.isTransforming) {
      this.animationState = 'transforming';
      return { didLitter: false };
    }

    // Handle littering animation
    if (this.litteringState.isLittering) {
      this.animationState = 'littering';
      const now = Date.now();
      const elapsed = now - this.litteringState.startTime;
      
      if (elapsed >= this.litteringState.duration) {
        // Littering animation is complete
        const trashType = this.litteringState.trashType;
        this.litteringState.isLittering = false;
        this.isTransforming = true;
        
        return { didLitter: true, trashType };
      }
      
      return { didLitter: false };
    }

    // Random chance to start littering
    if (Math.random() < this.litterChance * deltaTime) {
      this.startLittering();
      return { didLitter: false }; // We'll report the litter after animation completes
    }

    // Update movement and animation
    this.updatePosition(deltaTime);
    this.updateAnimation(deltaTime);
    return { didLitter: false };
  }

  private startLittering() {
    const trashType = this.selectRandomTrash();
    this.litteringState = {
      isLittering: true,
      startTime: Date.now(),
      duration: 1000,
      trashType
    };
    this.animationState = 'littering';
  }

  private selectRandomTrash(): TrashType {
    const trashTypes = Object.values(TRASH_TYPES);
    return trashTypes[Math.floor(Math.random() * trashTypes.length)];
  }

  private updatePosition(deltaTime: number) {
    // Don't move if littering
    if (this.litteringState.isLittering) return;

    // Movement cooldown to prevent rapid direction changes
    if (this.movementCooldown > 0) {
      this.movementCooldown -= deltaTime;
      return;
    }
    
    // Try multiple directions if one has collision
    // Define direction vectors for all 8 directions (4 cardinal + 4 diagonal)
    const directions = [
      { x: 0, y: -1 },  // up
      { x: 1, y: -1 },  // up-right
      { x: 1, y: 0 },   // right
      { x: 1, y: 1 },   // down-right
      { x: 0, y: 1 },   // down
      { x: -1, y: 1 },  // down-left
      { x: -1, y: 0 },  // left
      { x: -1, y: -1 }  // up-left
    ];
    
    // Choose a random direction biased towards current direction
    let directionIndex;
    // 85% chance to continue in roughly the same direction for smoother movement
    if (Math.random() < 0.85) {
      let baseDir = 0; // default to "up"
      if (this.direction === 'right') baseDir = 2;
      else if (this.direction === 'down') baseDir = 4;
      else if (this.direction === 'left') baseDir = 6;
      
      // Choose direction within +/- 1 of current direction (wrapping around array)
      const offset = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      directionIndex = (baseDir + offset + directions.length) % directions.length;
    } else {
      // 15% chance to pick a completely random direction
      directionIndex = Math.floor(Math.random() * directions.length);
    }
    
    const moveDir = directions[directionIndex];
    
    // Calculate movement amount based on speed
    const moveAmount = this.moveSpeed * deltaTime;
    const moveX = moveDir.x * moveAmount;
    const moveY = moveDir.y * moveAmount;

    // Calculate next position
    const nextPosition = {
      x: this.position.x + moveX,
      y: this.position.y + moveY
    };

    // Check for collisions
    let canMove = true;
    
    if (this.collisionChecker) {
      canMove = !this.collisionChecker(this, nextPosition);
    }

    // Apply movement if no collision
    if (canMove) {
      this.position = nextPosition;

      // Update direction based on movement
      // Use a stronger threshold to prevent flickering between directions
      if (Math.abs(moveX) > Math.abs(moveY) + 0.01) {
        this.direction = moveX > 0 ? 'right' : 'left';
      } else if (Math.abs(moveY) > Math.abs(moveX) + 0.01) {
        this.direction = moveY > 0 ? 'down' : 'up';
      }

      // Update animation state - require a minimum movement amount to count as "moving"
      const isMoving = Math.abs(moveX) > 0.01 || Math.abs(moveY) > 0.01;
      this.animationState = isMoving ? 'walking' : 'idle';
      
      // Set a small random cooldown for natural-looking movement pauses
      if (Math.random() < 0.01) {
        this.movementCooldown = 500 + Math.random() * 1000; // 0.5-1.5 second pause
        this.animationState = 'idle';
      }
    } else {
      // If collision detected, set a shorter cooldown and try again with a different direction
      this.movementCooldown = 100; // shorter cooldown (0.1 seconds)
      this.animationState = 'idle';
    }
  }

  private updateAnimation(deltaTime: number) {
    // For walking animation, use frame hold counter like the player does
    if (this.animationState === 'walking') {
      this.frame_hold_counter++;
      if (this.frame_hold_counter >= this.FRAME_HOLD) {
        this.animationFrame = (this.animationFrame + 1) % this.FRAME_COUNT;
        this.frame_hold_counter = 0;
      }
    } 
    // For littering, use both progress-based frames and frame counter for smooth animation
    else if (this.animationState === 'littering') {
      this.frame_hold_counter++;
      if (this.frame_hold_counter >= this.FRAME_HOLD) {
        // Progress through frames but don't cycle - stop at the max frame
        if (this.animationFrame < this.FRAME_COUNT - 1) {
          this.animationFrame++;
        }
        this.frame_hold_counter = 0;
      }
    } 
    // For transforming, keep current frame but add visual effects in the rendering part
    else if (this.animationState === 'transforming') {
      // Keep current frame but don't animate
    }
    // For idle state, reset animation
    else {
      this.animationFrame = 0;
      this.frame_hold_counter = 0;
    }
  }

  getLitterProgress(): number {
    if (!this.litteringState.isLittering) return 0;
    
    const elapsed = Date.now() - this.litteringState.startTime;
    return Math.min(1, elapsed / this.litteringState.duration);
  }

  getCurrentLitter(): TrashType | null {
    return this.litteringState.isLittering ? this.litteringState.trashType || null : null;
  }

  // Get the current sprite based on state
  getSprite(): string {
    const baseSprite = 'player';
    
    // If littering, use a specific littering sprite
    if (this.animationState === 'littering') {
      return `player_littering_${this.direction}`;
    } 
    // If walking, include _walking in the sprite name and pass animation frame separately
    else if (this.animationState === 'walking') {
      return `player_walking_${this.direction}`;
    } 
    // For idle state, just use the direction
    else {
      return `player_${this.direction}`;
    }
  }

  startTransformation() {
    this.isTransforming = true;
    this.animationState = 'transforming';
  }

  isCurrentlyTransforming(): boolean {
    return this.isTransforming;
  }

  isCurrentlyLittering(): boolean {
    return this.litteringState.isLittering;
  }
} 