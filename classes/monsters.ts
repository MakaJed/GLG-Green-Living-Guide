import { Creature, EcoType, EcoSkill, Stats } from './battle';

// Base stats for different monster tiers
const TIER_1_STATS: Stats = {
    hp: 100,
    mp: 50,
    attack: 25,
    defense: 10,
    speed: 10,
    resistance: 10
};

const TIER_2_STATS: Stats = {
    hp: 150,
    mp: 75,
    attack: 35,
    defense: 15,
    speed: 15,
    resistance: 15
};

// Define some basic eco-skills

// Self-healing skill for all pet types
export const GENERAL_SKILLS = {
    ecoRestore: new EcoSkill(
        "Eco Restore",
        EcoType.RECYCLABLE, // Type doesn't matter for healing
        25,
        0,
        "Restore HP using eco-friendly energy",
        (user, target, damage) => {
            // This is a healing skill, so it heals the user instead of damaging the target
            const healAmount = Math.floor(user.stats.hp * 0.25); // Heal 25% of max HP
            user.currentHp = Math.min(user.stats.hp, user.currentHp + healAmount);
            return `${user.name} recovered ${healAmount} HP!`;
        }
    )
};

export const RECYCLABLE_SKILLS = {
    segregationSweep: new EcoSkill(
        "Segregation Sweep",
        EcoType.RECYCLABLE,
        30,
        15,
        "Light damage; grants +20 EP next turn",
        (user, target, damage) => {
            // Grant +20 EP next turn
            user.currentMp = Math.min(user.stats.mp, user.currentMp + 20);
            return `${user.name} recovered 20 EP!`;
        }
    ),
    meltDown: new EcoSkill(
        "Melt Down",
        EcoType.RECYCLABLE,
        45,
        25,
        "Medium damage; deals bonus vs Plastic and Glass",
        (user, target, damage) => {
            // Bonus damage vs Plastic and Glass types
            if (target.type === EcoType.PLASTIC || target.type === EcoType.GLASS) {
                const bonusDamage = Math.floor(damage * 0.3);
                target.currentHp = Math.max(0, target.currentHp - bonusDamage);
                return `The melting effect caused ${bonusDamage} additional damage!`;
            }
            return '';
        }
    ),
    pulverize: new EcoSkill(
        "Pulverize",
        EcoType.RECYCLABLE,
        60,
        35,
        "Strong damage; next skill costs 5 less EP",
        (user, target, damage) => {
            // Set a flag for next skill to cost 5 less EP
            user.nextSkillDiscount = 5;
            return `${user.name}'s next skill will cost 5 less EP!`;
        }
    ),
    upcycleSurge: new EcoSkill(
        "Upcycle Surge",
        EcoType.RECYCLABLE,
        75,
        45,
        "Powerful hit; restores 20% of damage dealt as EP",
        (user, target, damage) => {
            // Restore 20% of damage as EP
            const epRestored = Math.floor(damage * 0.2);
            user.currentMp = Math.min(user.stats.mp, user.currentMp + epRestored);
            return `${user.name} recovered ${epRestored} EP from the attack!`;
        }
    ),
    paperCut: new EcoSkill(
        "Paper Cut",
        EcoType.RECYCLABLE,
        35,
        20,
        "Quick attack with recycled paper; has a chance to lower defense",
        (user, target, damage) => {
            // 30% chance to lower defense
            if (Math.random() < 0.3) {
                const defenseReduction = Math.floor(target.stats.defense * 0.15);
                target.stats.defense = Math.max(1, target.stats.defense - defenseReduction);
                return `${target.name}'s defense was lowered!`;
            }
            return '';
        }
    ),
    plasticCrush: new EcoSkill(
        "Plastic Crush",
        EcoType.RECYCLABLE,
        40,
        25,
        "Compresses plastic waste into a powerful projectile",
        (user, target, damage) => {
            // 25% chance to stun the target (skip their next turn)
            if (Math.random() < 0.25) {
                target.isStunned = true;
                return `${target.name} was stunned by the impact!`;
            }
            return '';
        }
    )
};

export const COMPOSTABLE_SKILLS = {
    aerationGust: new EcoSkill(
        "Aeration Gust",
        EcoType.COMPOSTABLE,
        25,
        15,
        "Light wind damage; boosts healing received",
        (user, target, damage) => {
            // Boost healing received for 2 turns
            user.healingBoost = 1.3; // 30% more healing
            user.healingBoostTurns = 2;
            return `${user.name} will receive 30% more healing for 2 turns!`;
        }
    ),
    microbeInfusion: new EcoSkill(
        "Microbe Infusion",
        EcoType.COMPOSTABLE,
        35,
        25,
        "Applies a healing-over-time effect for 3 turns",
        (user, target, damage) => {
            // Set up healing over time
            user.hotAmount = Math.floor(user.stats.hp * 0.08); // 8% max HP per turn
            user.hotTurnsLeft = 3;
            return `${user.name} will recover health for 3 turns!`;
        }
    ),
    mulchBurst: new EcoSkill(
        "Mulch Burst",
        EcoType.COMPOSTABLE,
        45,
        35,
        "Restores 20% HP to the team; costs moderate EP",
        (user, target, damage) => {
            // Heal user by 20% of max HP
            const healAmount = Math.floor(user.stats.hp * 0.2);
            user.currentHp = Math.min(user.stats.hp, user.currentHp + healAmount);
            // In a real team battle, would heal all team members here
            return `${user.name} recovered ${healAmount} HP!`;
        }
    ),
    fertilifePulse: new EcoSkill(
        "Fertilife Pulse",
        EcoType.COMPOSTABLE,
        55,
        45,
        "Heals, restores EP, and purifies status effects",
        (user, target, damage) => {
            // Heal 15% HP
            const healAmount = Math.floor(user.stats.hp * 0.15);
            user.currentHp = Math.min(user.stats.hp, user.currentHp + healAmount);
            
            // Restore 15% MP
            const mpAmount = Math.floor(user.stats.mp * 0.15);
            user.currentMp = Math.min(user.stats.mp, user.currentMp + mpAmount);
            
            // Clear status effects
            user.isStunned = false;
            
            return `${user.name} recovered ${healAmount} HP and ${mpAmount} EP, and cleared status effects!`;
        }
    ),
    compostBlast: new EcoSkill(
        "Compost Blast",
        EcoType.COMPOSTABLE,
        40,
        20,
        "Launches a burst of nutrient-rich compost at the enemy",
        (user, target, damage) => {
            // 40% chance to reduce target's attack
            if (Math.random() < 0.4) {
                const attackReduction = Math.floor(target.stats.attack * 0.2);
                target.stats.attack = Math.max(1, target.stats.attack - attackReduction);
                return `${target.name}'s attack was reduced!`;
            }
            return '';
        }
    ),
    organicWrap: new EcoSkill(
        "Organic Wrap",
        EcoType.COMPOSTABLE,
        30,
        15,
        "Envelops the target in biodegradable material, slowing them down",
        (user, target, damage) => {
            // Reduce target's speed by 25%
            const speedReduction = Math.floor(target.stats.speed * 0.25);
            target.stats.speed = Math.max(1, target.stats.speed - speedReduction);
            return `${target.name}'s speed was reduced!`;
        }
    )
};

export const HAZARDOUS_SKILLS = {
    containQuarantine: new EcoSkill(
        "Contain & Quarantine",
        EcoType.HAZARDOUS,
        30,
        15,
        "Weak attack; lowers enemy's attack stat",
        (user, target, damage) => {
            // Lower target's attack by 15%
            const attackReduction = Math.floor(target.stats.attack * 0.15);
            target.stats.attack = Math.max(1, target.stats.attack - attackReduction);
            return `${target.name}'s attack was contained and reduced!`;
        }
    ),
    secureDisposal: new EcoSkill(
        "Secure Disposal",
        EcoType.HAZARDOUS,
        45,
        25,
        "Medium damage; bonus EP vs Electronic and Metal",
        (user, target, damage) => {
            // Bonus EP recovery vs Electronic and Metal types
            if (target.type === EcoType.ELECTRONIC || target.type === EcoType.METAL) {
                const epBonus = 15;
                user.currentMp = Math.min(user.stats.mp, user.currentMp + epBonus);
                return `${user.name} recovered ${epBonus} EP from proper disposal!`;
            }
            return '';
        }
    ),
    toxicFeedback: new EcoSkill(
        "Toxic Feedback",
        EcoType.HAZARDOUS,
        60,
        35,
        "Strong hit; enemy takes recoil next turn",
        (user, target, damage) => {
            // Set up a delayed damage effect (recoil next turn)
            target.pendingDamage = Math.floor(damage * 0.3);
            target.pendingDamageTurns = 1;
            return `${target.name} will take recoil damage next turn!`;
        }
    ),
    incinerationBlast: new EcoSkill(
        "Incineration Blast",
        EcoType.HAZARDOUS,
        75,
        45,
        "Powerful burst; deals heavy damage but costly",
        (user, target, damage) => {
            // Powerful but has a recoil effect on the user
            const recoilDamage = Math.floor(user.stats.hp * 0.1); // 10% max HP recoil
            user.currentHp = Math.max(1, user.currentHp - recoilDamage);
            return `The intense heat caused ${user.name} to take ${recoilDamage} recoil damage!`;
        }
    ),
    toxicSpill: new EcoSkill(
        "Toxic Spill",
        EcoType.HAZARDOUS,
        50,
        30,
        "Creates a dangerous puddle that damages over time",
        (user, target, damage) => {
            // Apply damage over time effect
            target.dotAmount = Math.floor(target.stats.hp * 0.05); // 5% max HP per turn
            target.dotTurnsLeft = 3;
            return `${target.name} will take poison damage for 3 turns!`;
        }
    ),
    chemicalBurn: new EcoSkill(
        "Chemical Burn",
        EcoType.HAZARDOUS,
        45,
        25,
        "Applies a corrosive substance that weakens defenses",
        (user, target, damage) => {
            // Reduce target's defense by 25%
            const defenseReduction = Math.floor(target.stats.defense * 0.25);
            target.stats.defense = Math.max(1, target.stats.defense - defenseReduction);
            return `The corrosive chemicals reduced ${target.name}'s defense!`;
        }
    )
};

// Trash Monster Factory
export class TrashMonsterFactory {
    // Metal Type Monsters
    static createCanstruct(level: number = 1): Creature {
        const monster = new Creature(
            "Canstruct",
            EcoType.METAL,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 10,
                attack: TIER_1_STATS.attack + (level - 1) * 4
            },
            [RECYCLABLE_SKILLS.segregationSweep, RECYCLABLE_SKILLS.meltDown]
        );
        monster.originalTrashType = 'metal';
        return monster;
    }

    static createSarcan(level: number = 1): Creature {
        const monster = new Creature(
            "Sarcan",
            EcoType.METAL,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 12,
                attack: TIER_1_STATS.attack + (level - 1) * 5
            },
            [RECYCLABLE_SKILLS.pulverize, RECYCLABLE_SKILLS.upcycleSurge]
        );
        monster.originalTrashType = 'metal';
        return monster;
    }

    // Food Waste/Organic Type Monsters
    static createGreezeGlob(level: number = 1): Creature {
        const monster = new Creature(
            "Greeze Glob",
            EcoType.FOOD_WASTE,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 10,
                attack: TIER_1_STATS.attack + (level - 1) * 4
            },
            [COMPOSTABLE_SKILLS.aerationGust, COMPOSTABLE_SKILLS.microbeInfusion]
        );
        monster.originalTrashType = 'food_waste';
        return monster;
    }

    static createEgglut(level: number = 1): Creature {
        const monster = new Creature(
            "Egglut",
            EcoType.FOOD_WASTE,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 11,
                attack: TIER_1_STATS.attack + (level - 1) * 4
            },
            [COMPOSTABLE_SKILLS.mulchBurst, COMPOSTABLE_SKILLS.fertilifePulse]
        );
        monster.originalTrashType = 'food_waste';
        return monster;
    }

    static createGloofuud(level: number = 1): Creature {
        const monster = new Creature(
            "Gloofuud",
            EcoType.FOOD_WASTE,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 13,
                attack: TIER_1_STATS.attack + (level - 1) * 4
            },
            [COMPOSTABLE_SKILLS.aerationGust, COMPOSTABLE_SKILLS.fertilifePulse]
        );
        monster.originalTrashType = 'food_waste';
        return monster;
    }

    static createRotato(level: number = 1): Creature {
        const monster = new Creature(
            "Rotato",
            EcoType.FOOD_WASTE,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 12,
                attack: TIER_1_STATS.attack + (level - 1) * 2
            },
            [COMPOSTABLE_SKILLS.microbeInfusion, COMPOSTABLE_SKILLS.mulchBurst]
        );
        monster.originalTrashType = 'food_waste';
        return monster;
    }

    // Paper Type Monster
    static createPaperPhantom(level: number = 1): Creature {
        const monster = new Creature(
            "Paper Phantom",
            EcoType.PAPER,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 10,
                attack: TIER_1_STATS.attack + (level - 1) * 2
            },
            [RECYCLABLE_SKILLS.segregationSweep, RECYCLABLE_SKILLS.upcycleSurge]
        );
        monster.originalTrashType = 'paper';
        return monster;
    }

    // Plastic Type Monsters
    static createBottroll(level: number = 1): Creature {
        const monster = new Creature(
            "Bottroll",
            EcoType.PLASTIC,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 11,
                attack: TIER_1_STATS.attack + (level - 1) * 2
            },
            [RECYCLABLE_SKILLS.meltDown, RECYCLABLE_SKILLS.pulverize]
        );
        monster.originalTrashType = 'plastic';
        return monster;
    }

    static createCrunchor(level: number = 1): Creature {
        const monster = new Creature(
            "Crunchor",
            EcoType.PLASTIC,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 12,
                attack: TIER_1_STATS.attack + (level - 1) * 3
            },
            [RECYCLABLE_SKILLS.segregationSweep, RECYCLABLE_SKILLS.upcycleSurge]
        );
        monster.originalTrashType = 'plastic';
        return monster;
    }

    static createCupkwek(level: number = 1): Creature {
        const monster = new Creature(
            "Cupkwek",
            EcoType.PLASTIC,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 10,
                attack: TIER_1_STATS.attack + (level - 1) * 2
            },
            [RECYCLABLE_SKILLS.meltDown, RECYCLABLE_SKILLS.pulverize]
        );
        monster.originalTrashType = 'plastic';
        return monster;
    }

    static createSssstrawpent(level: number = 1): Creature {
        const monster = new Creature(
            "Sssstrawpent",
            EcoType.PLASTIC,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 11,
                attack: TIER_1_STATS.attack + (level - 1) * 2
            },
            [RECYCLABLE_SKILLS.segregationSweep, RECYCLABLE_SKILLS.upcycleSurge]
        );
        monster.originalTrashType = 'plastic';
        return monster;
    }

    static createJellystic(level: number = 1): Creature {
        const monster = new Creature(
            "Jellystic",
            EcoType.PLASTIC,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 12,
                attack: TIER_1_STATS.attack + (level - 1) * 2
            },
            [RECYCLABLE_SKILLS.meltDown, RECYCLABLE_SKILLS.pulverize]
        );
        monster.originalTrashType = 'plastic';
        return monster;
    }

    // Glass Type Monsters
    static createJar(level: number = 1): Creature {
        const monster = new Creature(
            "Jar",
            EcoType.GLASS,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 13,
                attack: TIER_1_STATS.attack + (level - 1) * 2
            },
            [RECYCLABLE_SKILLS.meltDown, RECYCLABLE_SKILLS.upcycleSurge]
        );
        monster.originalTrashType = 'glass';
        return monster;
    }

    static createShardlass(level: number = 1): Creature {
        const monster = new Creature(
            "Shardlass",
            EcoType.GLASS,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 11,
                attack: TIER_1_STATS.attack + (level - 1) * 3
            },
            [RECYCLABLE_SKILLS.segregationSweep, RECYCLABLE_SKILLS.pulverize]
        );
        monster.originalTrashType = 'glass';
        return monster;
    }

    // Electronic Type Monsters
    static createVoltwing(level: number = 1): Creature {
        const monster = new Creature(
            "Voltwing",
            EcoType.ELECTRONIC,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 12,
                attack: TIER_1_STATS.attack + (level - 1) * 3
            },
            [HAZARDOUS_SKILLS.containQuarantine, HAZARDOUS_SKILLS.secureDisposal]
        );
        monster.originalTrashType = 'electronic';
        return monster;
    }

    static createPhonii(level: number = 1): Creature {
        const monster = new Creature(
            "Phonii",
            EcoType.ELECTRONIC,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 11,
                attack: TIER_1_STATS.attack + (level - 1) * 2
            },
            [HAZARDOUS_SKILLS.toxicFeedback, HAZARDOUS_SKILLS.incinerationBlast]
        );
        monster.originalTrashType = 'electronic';
        return monster;
    }
}

// Example usage:
// const canstruct = TrashMonsterFactory.createCanstruct(2);
// const paperPhantom = TrashMonsterFactory.createPaperPhantom(1); 