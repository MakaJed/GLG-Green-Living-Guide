// Battle system for Green Living Guide

// Eco-Type system representing different waste management categories
export enum EcoType {
    RECYCLABLE = 'RECYCLABLE',
    COMPOSTABLE = 'COMPOSTABLE',
    HAZARDOUS = 'HAZARDOUS',
    NEUTRAL = 'NEUTRAL'
}

// Type effectiveness mapping
export const typeEffectiveness: Record<EcoType, EcoType[]> = {
    [EcoType.COMPOSTABLE]: [EcoType.HAZARDOUS],
    [EcoType.RECYCLABLE]: [EcoType.COMPOSTABLE],
    [EcoType.HAZARDOUS]: [EcoType.RECYCLABLE],
    [EcoType.NEUTRAL]: []
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

// Base class for all creatures (both player's pet and trash monsters)
export class Creature {
    name: string;
    type: EcoType;
    level: number;
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

    constructor(
        name: string,
        type: EcoType,
        level: number,
        baseStats: Stats,
        skills: Skill[],
        position: Position = { x: 0, y: 0 }
    ) {
        this.name = name;
        this.type = type;
        this.level = level;
        this.stats = baseStats;
        this.currentHp = baseStats.hp;
        this.currentMp = baseStats.mp;
        this.skills = skills;
        this.position = position;
    }

    // Calculate damage multiplier based on type effectiveness
    getTypeEffectiveness(attackType: EcoType, defenderType: EcoType): number {
        if (typeEffectiveness[attackType].includes(defenderType)) {
            return 1.5; // Super effective
        }
        if (typeEffectiveness[defenderType].includes(attackType)) {
            return 0.5; // Not very effective
        }
        return 1.0; // Normal effectiveness
    }

    // Basic attack that restores some MP
    basicAttack(target: Creature): number {
        const damage = Math.floor(this.stats.attack * 0.8);
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
}

// Implementation of a basic eco-skill
export class EcoSkill implements Skill {
    name: string;
    type: EcoType;
    power: number;
    mpCost: number;
    description: string;

    constructor(
        name: string,
        type: EcoType,
        power: number,
        mpCost: number,
        description: string
    ) {
        this.name = name;
        this.type = type;
        this.power = power;
        this.mpCost = mpCost;
        this.description = description;
    }

    execute(user: Creature, target: Creature): number {
        if (user.currentMp < this.mpCost) {
            return 0; // Not enough MP
        }

        // Calculate damage
        const effectiveness = user.getTypeEffectiveness(this.type, target.type);
        const baseDamage = Math.floor(
            (user.stats.attack * this.power) / target.stats.defense
        );
        
        // Critical hit chance (10%)
        const isCritical = Math.random() < 0.1;
        const criticalMultiplier = isCritical ? 1.5 : 1.0;

        // Calculate final damage
        const finalDamage = Math.floor(
            baseDamage * effectiveness * criticalMultiplier
        );

        // Apply damage and costs
        target.currentHp -= finalDamage;
        user.currentMp -= this.mpCost;

        // Increase recycle gauge on super effective hits
        if (effectiveness > 1) {
            user.recycleGauge = Math.min(100, user.recycleGauge + 25);
        }

        return finalDamage;
    }
} 