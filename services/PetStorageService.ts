import AsyncStorage from '@react-native-async-storage/async-storage';
import { Creature, EcoType, Stats, EcoSkill } from '../classes/battle';
import { RECYCLABLE_SKILLS, COMPOSTABLE_SKILLS, HAZARDOUS_SKILLS } from '../classes/monsters';

// Keys for AsyncStorage
const MAIN_PET_KEY = 'glg_main_pet';
const PARTY_PETS_KEY = 'glg_party_pets';

// Pet configurations for initial creation
export const PET_CONFIGURATIONS = {
  Owlleaf: {
    type: EcoType.COMPOSTABLE,
    skills: [
      COMPOSTABLE_SKILLS.compostBlast,
      COMPOSTABLE_SKILLS.organicWrap,
      RECYCLABLE_SKILLS.paperCut,
    ],
  },
  Cubble: {
    type: EcoType.RECYCLABLE,
    skills: [
      RECYCLABLE_SKILLS.plasticCrush,
      RECYCLABLE_SKILLS.paperCut,
      COMPOSTABLE_SKILLS.organicWrap,
    ],
  },
  Meowmblebee: {
    type: EcoType.HAZARDOUS,
    skills: [
      HAZARDOUS_SKILLS.toxicSpill,
      HAZARDOUS_SKILLS.chemicalBurn,
      RECYCLABLE_SKILLS.plasticCrush,
    ],
  },
};

// Base stats for pets
export const PET_BASE_STATS: Stats = {
  hp: 120,
  mp: 100,
  attack: 18,
  defense: 12,
  speed: 15,
  resistance: 12,
};

// Interface for serialized pet data
interface SerializedPet {
  name: string;
  type: EcoType;
  level: number;
  exp: number;
  stats: Stats;
  skills: string[]; // Store skill names only
  position: { x: number; y: number };
}

// Helper to serialize a Creature for storage
const serializeCreature = (creature: Creature): SerializedPet => {
  return {
    name: creature.name,
    type: creature.type,
    level: creature.level,
    exp: creature.exp,
    stats: { ...creature.stats },
    skills: creature.skills.map(skill => skill.name),
    position: { ...creature.position },
  };
};

// Helper to deserialize a pet from storage
const deserializeCreature = (data: SerializedPet): Creature => {
  // Find the skills by name
  const skills = data.skills.map(skillName => {
    // Search in all skill sets
    const skillSets = [
      RECYCLABLE_SKILLS as Record<string, EcoSkill>,
      COMPOSTABLE_SKILLS as Record<string, EcoSkill>,
      HAZARDOUS_SKILLS as Record<string, EcoSkill>
    ];
    
    for (const skillSet of skillSets) {
      for (const key in skillSet) {
        if (skillSet[key].name === skillName) {
          return skillSet[key];
        }
      }
    }
    // Fallback to a basic skill if not found
    return RECYCLABLE_SKILLS.paperCut;
  });

  // Create and return the creature
  const creature = new Creature(
    data.name,
    data.type,
    data.level,
    data.stats,
    skills,
    [], // Empty available skills for now
    data.position
  );
  
  creature.exp = data.exp;
  return creature;
};

// Create a new pet based on selection
export const createNewPet = (petName: string): Creature => {
  const config = PET_CONFIGURATIONS[petName as keyof typeof PET_CONFIGURATIONS];
  return new Creature(
    petName, 
    config.type, 
    1, 
    { ...PET_BASE_STATS }, 
    config.skills
  );
};

// Save the main pet
export const saveMainPet = async (pet: Creature): Promise<void> => {
  try {
    const serialized = serializeCreature(pet);
    await AsyncStorage.setItem(MAIN_PET_KEY, JSON.stringify(serialized));
    console.log('Main pet saved successfully');
  } catch (error) {
    console.error('Error saving main pet:', error);
  }
};

// Load the main pet
export const loadMainPet = async (): Promise<Creature | null> => {
  try {
    const data = await AsyncStorage.getItem(MAIN_PET_KEY);
    if (data) {
      const petData = JSON.parse(data) as SerializedPet;
      return deserializeCreature(petData);
    }
    return null;
  } catch (error) {
    console.error('Error loading main pet:', error);
    return null;
  }
};

// Check if main pet exists
export const hasMainPet = async (): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(MAIN_PET_KEY);
    return data !== null;
  } catch (error) {
    console.error('Error checking for main pet:', error);
    return false;
  }
};

// Save party pets
export const savePartyPets = async (pets: Creature[]): Promise<void> => {
  try {
    const serialized = pets.map(pet => serializeCreature(pet));
    await AsyncStorage.setItem(PARTY_PETS_KEY, JSON.stringify(serialized));
    console.log('Party pets saved successfully');
  } catch (error) {
    console.error('Error saving party pets:', error);
  }
};

// Load party pets
export const loadPartyPets = async (): Promise<Creature[]> => {
  try {
    const data = await AsyncStorage.getItem(PARTY_PETS_KEY);
    if (data) {
      const petsData = JSON.parse(data) as SerializedPet[];
      return petsData.map(petData => deserializeCreature(petData));
    }
    return [];
  } catch (error) {
    console.error('Error loading party pets:', error);
    return [];
  }
};

// Add a pet to the party
export const addPetToParty = async (pet: Creature): Promise<void> => {
  try {
    const currentParty = await loadPartyPets();
    // Check if pet with same name already exists
    const existingIndex = currentParty.findIndex(p => p.name === pet.name);
    
    if (existingIndex >= 0) {
      // Replace existing pet
      currentParty[existingIndex] = pet;
    } else {
      // Add new pet
      currentParty.push(pet);
    }
    
    await savePartyPets(currentParty);
  } catch (error) {
    console.error('Error adding pet to party:', error);
  }
};

// Update a pet's data (after battles, etc.)
export const updatePet = async (pet: Creature, isMainPet: boolean): Promise<void> => {
  if (isMainPet) {
    await saveMainPet(pet);
  } else {
    const party = await loadPartyPets();
    const index = party.findIndex(p => p.name === pet.name);
    if (index >= 0) {
      party[index] = pet;
      await savePartyPets(party);
    }
  }
};

// Clear all pet data (for testing or reset)
export const clearAllPetData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([MAIN_PET_KEY, PARTY_PETS_KEY]);
    console.log('All pet data cleared');
  } catch (error) {
    console.error('Error clearing pet data:', error);
  }
};
