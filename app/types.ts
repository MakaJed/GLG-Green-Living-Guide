// Navigation types
export type RootStackParamList = {
  Home: undefined;
  PetSelection: { enemy?: string };
  Battle: { pet: string; enemy?: string };
}; 