import { Todo } from "./todo.model";

export interface DataEntry {
  id: string; // Unique identifier for the entry
  date: string; // ISO format: YYYY-MM-DD

  steps: number;
  caloriesIntake: number;
  caloriesBurned?: number;

  protein?: number;
  carbs?: number;
  fats?: number;
  fibre?: number;

  waterGlasses: number;
  todos: Todo[];
  weight?: number;

  createdAt?: string; // ISO format: YYYY-MM-DDTHH:mm:ssZ
  updatedAt?: string; // ISO format: YYYY-MM-DDTHH:mm:ssZ
}
