import { Injectable } from '@angular/core';
import { DataEntry } from '../model/data-entry.model';
import { UserProfile } from '../model/user-profile.model';
import { WeightProjection } from '../model/weight-projection.model';

@Injectable({
  providedIn: 'root',
})
export class WeightProjectionService {

  public getWeightProjection(
    entries: DataEntry[],
    profile: UserProfile
  ): WeightProjection[] {

    if (!entries || entries.length === 0) return [];

    const sortedEntries = [...entries].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    let cumulativeDeficit = 0;
    let currentWeight = this.getInitialWeight(sortedEntries, profile);

    return sortedEntries.map(entry => {
      const burned = this.getCaloriesBurned(entry, profile);
      const deficit = this.getDeficit(burned, entry.caloriesIntake);

      cumulativeDeficit += deficit;
      
      const projectedWeight = currentWeight - cumulativeDeficit / 7700;
      
      return {
        id: entry.id,
        date: entry.date,
        projectedWeight,
      };
    });
  }

  public getCaloriesBurned(entry: DataEntry, profile: UserProfile): number {
    if (entry.caloriesBurned !== undefined) {
      return entry.caloriesBurned;
    }
    return this.estimateCaloriesFromSteps(entry.steps, profile);
  }

  public getDeficit(burned: number, consumed: number): number {
    return burned - consumed;
  }

  private getInitialWeight(entries: DataEntry[], profile: UserProfile): number {
    const firstWithWeight = entries.find(e => e.weight !== undefined);
    return firstWithWeight?.weight ?? profile.currentWeight;
  }


  private estimateCaloriesFromSteps(steps: number, profile: UserProfile): number {
  const heightMeters = profile.height / 100;
  const weight = profile.currentWeight;

  // stride length
  const strideLength =
    profile.gender === 'female'
      ? heightMeters * 0.413
      : heightMeters * 0.415;

  // distance in km
  const distanceKm = (steps * strideLength) / 1000;

  // calories burned
  return weight * distanceKm * 0.75;
}
}