import { EcoSkill, EcoType } from '../classes/battle';
import { RECYCLABLE_SKILLS, COMPOSTABLE_SKILLS, HAZARDOUS_SKILLS, GENERAL_SKILLS } from '../classes/monsters';

// Define skill progression for each pet type
export const PET_SKILL_PROGRESSION = {
    // Recyclable pet skills
    Recyclotron: {
        // Initial skills (first 2 available at level 1)
        initialSkills: [
            RECYCLABLE_SKILLS.segregationSweep,
            RECYCLABLE_SKILLS.paperCut,
            // Level 5 skill
            RECYCLABLE_SKILLS.meltDown,
            // Level 10 skill
            RECYCLABLE_SKILLS.upcycleSurge
        ],
        // Additional skills that could be learned through other means
        additionalSkills: [
            RECYCLABLE_SKILLS.pulverize,
            RECYCLABLE_SKILLS.plasticCrush
            // No healing skill for Recyclable type
        ]
    },
    
    // Compostable pet skills
    Composter: {
        // Initial skills (first 2 available at level 1)
        initialSkills: [
            COMPOSTABLE_SKILLS.aerationGust,
            COMPOSTABLE_SKILLS.organicWrap,
            // Level 5 skill
            COMPOSTABLE_SKILLS.microbeInfusion,
            // Level 10 skill
            COMPOSTABLE_SKILLS.fertilifePulse
        ],
        // Additional skills that could be learned through other means
        additionalSkills: [
            COMPOSTABLE_SKILLS.mulchBurst,
            COMPOSTABLE_SKILLS.compostBlast,
            GENERAL_SKILLS.ecoRestore // Add healing skill
        ]
    },
    
    // Hazardous pet skills
    Toxaway: {
        // Initial skills (first 2 available at level 1)
        initialSkills: [
            HAZARDOUS_SKILLS.containQuarantine,
            HAZARDOUS_SKILLS.chemicalBurn,
            // Level 5 skill
            HAZARDOUS_SKILLS.toxicSpill,
            // Level 10 skill
            HAZARDOUS_SKILLS.incinerationBlast
        ],
        // Additional skills that could be learned through other means
        additionalSkills: [
            HAZARDOUS_SKILLS.secureDisposal,
            HAZARDOUS_SKILLS.toxicFeedback
            // No healing skill for Hazardous type
        ]
    }
};

// Base stats for pets at level 1
export const PET_BASE_STATS = {
    hp: 120,
    mp: 80,
    attack: 30,
    defense: 15,
    speed: 20,
    resistance: 15
};

// Configuration for all available pets
export const PET_CONFIGURATIONS = {
    Recyclotron: {
        type: EcoType.RECYCLABLE,
        description: 'A recycling specialist that excels at handling recyclable materials.',
        skills: PET_SKILL_PROGRESSION.Recyclotron.initialSkills
    },
    Composter: {
        type: EcoType.COMPOSTABLE,
        description: 'A compost expert that thrives on organic waste.',
        skills: PET_SKILL_PROGRESSION.Composter.initialSkills
    },
    Toxaway: {
        type: EcoType.HAZARDOUS,
        description: 'A hazardous waste handler that safely disposes of dangerous materials.',
        skills: PET_SKILL_PROGRESSION.Toxaway.initialSkills
    }
};
