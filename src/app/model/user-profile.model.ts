
export interface UserProfile {
    name: string; 
    age: number;
    height: number; // in cm
    currentWeight: number; // in kg
    gender: 'male' | 'female' | 'other';
    targetWeight?: number; // in kg
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very active';
    bodyFatPercentage?: number; // in %
}