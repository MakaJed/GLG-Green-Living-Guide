import { Creature, EcoType, EcoSkill, Stats } from './battle';

// Base stats for different monster tiers
const TIER_1_STATS: Stats = {
    hp: 100,
    mp: 50,
    attack: 15,
    defense: 10,
    speed: 10,
    resistance: 10
};

const TIER_2_STATS: Stats = {
    hp: 150,
    mp: 75,
    attack: 20,
    defense: 15,
    speed: 15,
    resistance: 15
};

// Define some basic eco-skills
export const RECYCLABLE_SKILLS = {
    plasticCrush: new EcoSkill(
        "Plastic Crush",
        EcoType.RECYCLABLE,
        40,
        15,
        "A powerful crushing attack using recycled plastic"
    ),
    paperCut: new EcoSkill(
        "Paper Cut",
        EcoType.RECYCLABLE,
        30,
        10,
        "Sharp attack using recycled paper"
    )
};

export const COMPOSTABLE_SKILLS = {
    compostBlast: new EcoSkill(
        "Compost Blast",
        EcoType.COMPOSTABLE,
        45,
        20,
        "Explosive attack using compressed compost"
    ),
    organicWrap: new EcoSkill(
        "Organic Wrap",
        EcoType.COMPOSTABLE,
        25,
        10,
        "Wraps the target in decomposing matter"
    )
};

export const HAZARDOUS_SKILLS = {
    toxicSpill: new EcoSkill(
        "Toxic Spill",
        EcoType.HAZARDOUS,
        50,
        25,
        "Dangerous attack using hazardous waste"
    ),
    chemicalBurn: new EcoSkill(
        "Chemical Burn",
        EcoType.HAZARDOUS,
        35,
        15,
        "Burns the target with harmful chemicals"
    )
};

// Trash Monster Factory
export class TrashMonsterFactory {
    static createCanstruct(level: number = 1): Creature {
        const monster = new Creature(
            "Canstruct",
            EcoType.RECYCLABLE,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 10,
                attack: TIER_1_STATS.attack + (level - 1) * 2
            },
            [RECYCLABLE_SKILLS.plasticCrush, RECYCLABLE_SKILLS.paperCut]
        );
        monster.originalTrashType = 'can_trash';
        return monster;
    }

    static createCompostCreeper(level: number = 1): Creature {
        const monster = new Creature(
            "Compost Creeper",
            EcoType.COMPOSTABLE,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 10,
                defense: TIER_1_STATS.defense + (level - 1) * 2
            },
            [COMPOSTABLE_SKILLS.compostBlast, COMPOSTABLE_SKILLS.organicWrap]
        );
        monster.originalTrashType = 'compost_creeper';
        return monster;
    }

    static createToxicTerror(level: number = 1): Creature {
        const monster = new Creature(
            "Toxic Terror",
            EcoType.HAZARDOUS,
            level,
            {
                ...TIER_2_STATS,
                hp: TIER_2_STATS.hp + (level - 1) * 15,
                attack: TIER_2_STATS.attack + (level - 1) * 3
            },
            [HAZARDOUS_SKILLS.toxicSpill, HAZARDOUS_SKILLS.chemicalBurn]
        );
        monster.originalTrashType = 'toxic_terror';
        return monster;
    }

    static createPaperPhantom(level: number = 1): Creature {
        const monster = new Creature(
            "Paper Phantom",
            EcoType.RECYCLABLE,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 10,
                attack: TIER_1_STATS.attack + (level - 1) * 2
            },
            [RECYCLABLE_SKILLS.paperCut]
        );
        monster.originalTrashType = 'paper_trash';
        return monster;
    }

    static createGreezeGlob(level: number = 1): Creature {
        const monster = new Creature(
            "Greeze Glob",
            EcoType.RECYCLABLE,
            level,
            {
                ...TIER_1_STATS,
                hp: TIER_1_STATS.hp + (level - 1) * 10,
                attack: TIER_1_STATS.attack + (level - 1) * 2
            },
            [RECYCLABLE_SKILLS.plasticCrush]
        );
        monster.originalTrashType = 'organic_trash';
        return monster;
    }
}

// Example usage:
// const canstruct = TrashMonsterFactory.createCanstruct(2);
// const toxicTerror = TrashMonsterFactory.createToxicTerror(3); 