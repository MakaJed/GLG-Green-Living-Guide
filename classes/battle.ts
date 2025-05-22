// Battle system for Green Living Guide

// Eco-Type system representing different waste management categories
export enum EcoType {
    // Pet Types
    RECYCLABLE = 'RECYCLABLE',
    COMPOSTABLE = 'COMPOSTABLE',
    HAZARDOUS = 'HAZARDOUS',
    
    // Trash Types
    METAL = 'METAL',
    FOOD_WASTE = 'FOOD_WASTE',
    PAPER = 'PAPER',
    PLASTIC = 'PLASTIC',
    GLASS = 'GLASS',
    ELECTRONIC = 'ELECTRONIC'
}

// Type effectiveness mapping for Pet Types against Trash Types
export const typeEffectiveness: Record<EcoType, EcoType[]> = {
    // Pet Types
    [EcoType.RECYCLABLE]: [EcoType.PLASTIC, EcoType.PAPER, EcoType.METAL, EcoType.GLASS], // Strong against
    [EcoType.COMPOSTABLE]: [EcoType.FOOD_WASTE, EcoType.PAPER], // Strong against
    [EcoType.HAZARDOUS]: [EcoType.ELECTRONIC, EcoType.METAL], // Strong against
    
    // Trash Types (not used for effectiveness, just for completeness)
    [EcoType.METAL]: [],
    [EcoType.FOOD_WASTE]: [],
    [EcoType.PAPER]: [],
    [EcoType.PLASTIC]: [],
    [EcoType.GLASS]: [],
    [EcoType.ELECTRONIC]: []
};

// Type weaknesses mapping for Pet Types against Trash Types
export const typeWeaknesses: Record<EcoType, EcoType[]> = {
    // Pet Types
    [EcoType.RECYCLABLE]: [EcoType.FOOD_WASTE, EcoType.ELECTRONIC], // Weak against
    [EcoType.COMPOSTABLE]: [EcoType.PLASTIC, EcoType.METAL, EcoType.GLASS, EcoType.ELECTRONIC], // Weak against
    [EcoType.HAZARDOUS]: [EcoType.PAPER, EcoType.FOOD_WASTE, EcoType.PLASTIC, EcoType.GLASS], // Weak against
    
    // Trash Types (not used for effectiveness, just for completeness)
    [EcoType.METAL]: [],
    [EcoType.FOOD_WASTE]: [],
    [EcoType.PAPER]: [],
    [EcoType.PLASTIC]: [],
    [EcoType.GLASS]: [],
    [EcoType.ELECTRONIC]: []
};

// Base stats interface
export interface Stats {
    hp: number;
    mp: number;
    attack: number;
    defense: number;
    speed: number;
    resistance: number;
}

// Skill interface
export interface Skill {
    name: string;
    type: EcoType;
    power: number;
    mpCost: number;
    description: string;
    execute(user: Creature, target: Creature): number; // Returns damage dealt
}

import { Position } from './types';

// Add EXP required for each level
const EXP_PER_LEVEL = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));

// Base class for all creatures (both player's pet and trash monsters)
export class Creature {
    name: string;
    type: EcoType;
    level: number;
    exp: number;
    stats: Stats;
    currentHp: number;
    currentMp: number;
    skills: Skill[];
    position: Position;
    recycleGauge: number = 0;
    isInRecycleMode: boolean = false;
    recycleModeTurnsLeft: number = 0;
    // Add property for tracking original trash type for monsters
    originalTrashType?: string;
    availableSkills: Skill[]; // Add available skills pool
    // New properties for enhanced battle mechanics
    nextSkillDiscount: number = 0;
    isStunned: boolean = false;
    // Healing-related properties
    healingBoost: number = 1.0;
    healingBoostTurns: number = 0;
    hotAmount: number = 0;
    hotTurnsLeft: number = 0;
    // Damage-over-time properties
    dotAmount: number = 0;
    dotTurnsLeft: number = 0;
    // Delayed damage properties
    pendingDamage: number = 0;
    pendingDamageTurns: number = 0;

    constructor(
        name: string,
        type: EcoType,
        level: number,
        baseStats: Stats,
        initialSkills: Skill[],
        availableSkills: Skill[] = [], // Skills that can be learned at higher levels
        position: Position = { x: 0, y: 0 }
    ) {
        this.name = name;
        this.type = type;
        this.level = level;
        this.exp = 0;
        this.stats = baseStats;
        this.currentHp = baseStats.hp;
        this.currentMp = baseStats.mp;
        
        // Ensure level 1 pets start with exactly 2 skills
        if (level === 1) {
            // Take the first 2 skills from initialSkills
            this.skills = initialSkills.slice(0, 2);
            
            // Add remaining skills to availableSkills for learning later
            this.availableSkills = [
                ...initialSkills.slice(2),
                ...availableSkills
            ];
        } else {
            // For higher level pets, calculate how many skills they should have
            let skillCount = 2; // Start with 2
            if (level >= 5) skillCount++; // Add one at level 5
            if (level >= 10) skillCount++; // Add another at level 10
            
            // Cap at 4 skills maximum
            skillCount = Math.min(skillCount, 4);
            
            // Take the appropriate number of skills
            this.skills = initialSkills.slice(0, skillCount);
            
            // Add remaining skills to availableSkills
            this.availableSkills = [
                ...initialSkills.slice(skillCount),
                ...availableSkills
            ];
        }
        
        this.position = position;
    }

    // Calculate damage multiplier based on type effectiveness
    getTypeEffectiveness(attackType: EcoType, defenderType: EcoType): number {
        // Check if attacker is a Pet Type and defender is a Trash Type
        const isPetType = [EcoType.RECYCLABLE, EcoType.COMPOSTABLE, EcoType.HAZARDOUS].includes(attackType);
        const isTrashType = [EcoType.METAL, EcoType.FOOD_WASTE, EcoType.PAPER, EcoType.PLASTIC, EcoType.GLASS, EcoType.ELECTRONIC].includes(defenderType);
        
        // Only apply type effectiveness if attacker is Pet Type and defender is Trash Type
        if (isPetType && isTrashType) {
            if (typeEffectiveness[attackType].includes(defenderType)) {
                return 1.5; // Super effective (×1.5 damage)
            }
            if (typeWeaknesses[attackType].includes(defenderType)) {
                return 0.6; // Not very effective (×0.6 damage)
            }
            // If no specific effectiveness is defined, use the inverse of the other type's effectiveness
            const otherPetTypes = [EcoType.RECYCLABLE, EcoType.COMPOSTABLE, EcoType.HAZARDOUS].filter(type => type !== attackType);
            for (const otherType of otherPetTypes) {
                if (typeEffectiveness[otherType].includes(defenderType)) {
                    return 0.6; // Not very effective against types that other pets are strong against
                }
                if (typeWeaknesses[otherType].includes(defenderType)) {
                    return 1.5; // Super effective against types that other pets are weak against
                }
            }
        }
        return 1.0; // Default to normal effectiveness for non-pet vs trash matchups
    }

    // Basic attack that restores some MP
    basicAttack(target: Creature): number {
        const damage = Math.floor(this.stats.attack * 1.0);
        target.currentHp -= damage;
        this.currentMp = Math.min(this.stats.mp, this.currentMp + 10);
        return damage;
    }

    // Update Recycle Mode status
    updateRecycleMode() {
        if (this.isInRecycleMode) {
            this.recycleModeTurnsLeft--;
            if (this.recycleModeTurnsLeft <= 0) {
                this.isInRecycleMode = false;
                // Remove stat boosts
                this.stats.speed = Math.floor(this.stats.speed / 1.2);
                this.stats.resistance = Math.floor(this.stats.resistance / 1.2);
            }
        }
    }

    // Activate Recycle Mode when gauge is full
    activateRecycleMode() {
        if (this.recycleGauge >= 100 && !this.isInRecycleMode) {
            this.isInRecycleMode = true;
            this.recycleModeTurnsLeft = 3;
            this.recycleGauge = 0;
            // Apply stat boosts
            this.stats.speed = Math.floor(this.stats.speed * 1.2);
            this.stats.resistance = Math.floor(this.stats.resistance * 1.2);
            return true;
        }
        return false;
    }

    // Check if the creature is defeated
    isDefeated(): boolean {
        return this.currentHp <= 0;
    }

    // Add EXP and handle leveling up
    addExp(amount: number): { leveledUp: boolean; newLevel?: number; learnedSkill?: Skill } {
        this.exp += amount;
        const expNeeded = EXP_PER_LEVEL(this.level);
        
        if (this.exp >= expNeeded) {
            const oldLevel = this.level;
            this.levelUp();
            
            // Check for new skills at level 5 and 10
            let learnedSkill: Skill | undefined;
            
            // Learn a new skill at level 5 and level 10
            if (this.level === 5 || this.level === 10) {
                // Only learn if we have less than 4 skills total
                if (this.skills.length < 4) {
                    learnedSkill = this.learnNewSkill();
                }
            }
            
            // If the pet leveled up multiple times at once and crossed level 5 or 10
            if (!learnedSkill && oldLevel < 5 && this.level >= 5) {
                if (this.skills.length < 4) {
                    learnedSkill = this.learnNewSkill();
                }
            }
            
            // If the pet leveled up multiple times at once and crossed level 10
            if (!learnedSkill && oldLevel < 10 && this.level >= 10) {
                if (this.skills.length < 4) {
                    learnedSkill = this.learnNewSkill();
                }
            }
            
            return { 
                leveledUp: true, 
                newLevel: this.level,
                learnedSkill: learnedSkill
            };
        }
        
        return { leveledUp: false };
    }

    // Learn a new skill if available
    private learnNewSkill(): Skill | undefined {
        // Only learn if we have less than 4 skills and there are available skills
        if (this.skills.length < 4 && this.availableSkills.length > 0) {
            // Get the next skill from available skills
            const newSkill = this.availableSkills[0];
            // Remove it from available skills
            this.availableSkills = this.availableSkills.slice(1);
            // Add it to learned skills
            this.skills.push(newSkill);
            return newSkill;
        }
        return undefined;
    }

    // Level up and increase stats
    private levelUp() {
        this.level++;
        this.exp = 0;
        
        // Increase stats
        this.stats.hp += Math.floor(this.stats.hp * 0.1); // +10% HP
        this.stats.mp += Math.floor(this.stats.mp * 0.1); // +10% MP
        this.stats.attack += Math.floor(this.stats.attack * 0.1); // +10% Attack
        this.stats.defense += Math.floor(this.stats.defense * 0.1); // +10% Defense
        this.stats.speed += Math.floor(this.stats.speed * 0.1); // +10% Speed
        this.stats.resistance += Math.floor(this.stats.resistance * 0.1); // +10% Resistance
        
        // Restore HP and MP on level up
        this.currentHp = this.stats.hp;
        this.currentMp = this.stats.mp;
    }

    // Get EXP needed for next level
    getExpNeeded(): number {
        return EXP_PER_LEVEL(this.level);
    }
}

// Implementation of an enhanced eco-skill with level-based scaling and special effects
export class EcoSkill implements Skill {
    name: string;
    type: EcoType;
    power: number;
    mpCost: number;
    description: string;
    specialEffect?: (user: Creature, target: Creature, damage: number) => string;

    constructor(
        name: string,
        type: EcoType,
        power: number,
        mpCost: number,
        description: string,
        specialEffect?: (user: Creature, target: Creature, damage: number) => string
    ) {
        this.name = name;
        this.type = type;
        this.power = power;
        this.mpCost = mpCost;
        this.description = description;
        this.specialEffect = specialEffect;
    }

    execute(user: Creature, target: Creature): number {
        // Apply skill discount if available
        const actualCost = Math.max(0, this.mpCost - user.nextSkillDiscount);
        
        if (user.currentMp < actualCost) {
            return 0; // Not enough MP
        }

        // Reset skill discount after use
        user.nextSkillDiscount = 0;

        // Level-based power scaling (higher level = more powerful skills)
        const levelScalingFactor = 1 + (user.level * 0.05); // 5% increase per level
        
        // Calculate damage with level scaling
        const effectiveness = user.getTypeEffectiveness(this.type, target.type);
        const baseDamage = Math.floor(
            (user.stats.attack * this.power * levelScalingFactor) / target.stats.defense
        );
        
        // Critical hit chance (10% base + 0.5% per level)
        const critChance = 0.1 + (user.level * 0.005);
        const isCritical = Math.random() < critChance;
        const criticalMultiplier = isCritical ? 1.5 : 1.0;

        // Calculate final damage
        let finalDamage = Math.floor(
            baseDamage * effectiveness * criticalMultiplier
        );

        // Recycle Mode bonus (20% more damage if in Recycle Mode)
        if (user.isInRecycleMode) {
            finalDamage = Math.floor(finalDamage * 1.2);
        }

        // Apply damage and costs
        target.currentHp = Math.max(0, target.currentHp - finalDamage);
        user.currentMp -= actualCost;

        // Increase recycle gauge based on damage dealt (more for effective attacks)
        const gaugeIncrease = Math.floor(finalDamage * 0.1 * effectiveness);
        user.recycleGauge = Math.min(100, user.recycleGauge + gaugeIncrease);

        // Apply any special effects
        let specialEffectMessage = '';
        if (this.specialEffect) {
            specialEffectMessage = this.specialEffect(user, target, finalDamage);
        }

        // Add type effectiveness message to battle log
        let effectivenessMessage = '';
        if (effectiveness > 1) {
            effectivenessMessage = "It's super effective!";
        } else if (effectiveness < 1) {
            effectivenessMessage = "It's not very effective...";
        }

        // Add critical hit message if applicable
        if (isCritical) {
            effectivenessMessage = "A critical hit! " + effectivenessMessage;
        }

        // Return the damage dealt
        return finalDamage;
    }
} 