export type Role = 'CLIENT' | 'PROFESSIONAL';

export type Stage = 'PRECONCEPTION' | 'TRIMESTER_1' | 'TRIMESTER_2' | 'TRIMESTER_3' | 'POSTPARTUM' | 'RECOVERY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  householdId: string; // Even professionals might have a dummy household or undefined
  assignedClients?: string[]; // For professionals, list of household IDs
}

export interface HouseholdMember {
  id: string;
  name: string;
  stage: Stage;
  allergies: string[];
  medicalConditions: string[];
  dietaryRestrictions: string[];
  servingsMultiplier: number;
}

export interface Household {
  id: string;
  name: string;
  members: HouseholdMember[];
  professionalId?: string;
}

export interface InventoryItem {
  id: string;
  householdId: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string; // ISO date
  category: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTimeMinutes: number;
  suitableStages: Stage[];
  nutritionSummary: {
    calories: number;
    protein: number;
    folate?: number;
    iron?: number;
    dha?: number;
  };
  ingredients: {
    name: string;
    amount: number;
    unit: string;
  }[];
  allergens: string[];
}

export interface MealPlanEntry {
  id: string;
  householdId: string;
  memberId: string;
  recipeId: string;
  date: string; // YYYY-MM-DD
  servings: number;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}
