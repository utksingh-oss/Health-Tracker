import { Injectable } from '@angular/core';
import { DataEntry } from '../model/data-entry.model';
import { UserProfile } from '../model/user-profile.model';
import { WeightProjection } from '../model/weight-projection.model';
import { DataEntryService } from './data-entry-service';
import { UserProfileService } from './user-profile-service';

@Injectable({
  providedIn: 'root',
})
export class WeightProjectionService {
  public constructor(
    private dataEntryService: DataEntryService,
    private userProfileService: UserProfileService,
  ) {}

  // 📉 Historical Projection
  public getWeightProjection(): WeightProjection[] {
    const { entries, userProfile } = this.getContext();

    if (entries.length === 0) return [];

    let cumulativeDeficit = 0;
    let currentWeight = this.getInitialWeight(entries, userProfile);

    return entries.map((entry) => {
      const burned = this.getCaloriesBurned(entry, userProfile);
      const deficit = this.getDeficit(burned, entry.caloriesIntake);

      cumulativeDeficit += deficit;

      let projectedWeight = currentWeight - cumulativeDeficit / 7700;

      // 🔁 Soft correction using real weight
      if (entry.weight !== undefined) {
        const correction = entry.weight - projectedWeight;

        // apply partial correction (50%)
        projectedWeight += correction * 0.5;

        // reset baseline gently
        cumulativeDeficit = 0;
      }

      // ✅ Always update current weight
      currentWeight = projectedWeight;

      return {
        id: entry.id,
        date: entry.date,
        projectedWeight,
      };
    });
  }

  // 🔮 Future Projection
  public getFutureWeightProjection(
    daysToProject: number = 30,
  ): WeightProjection[] {
    const { entries, userProfile } = this.getContext();

    if (entries.length === 0) return [];

    const recentEntries = entries.slice(-Math.min(14, entries.length));

    let totalDeficit = 0;

    recentEntries.forEach((entry) => {
      const burned = this.getCaloriesBurned(entry, userProfile);
      totalDeficit += this.getDeficit(burned, entry.caloriesIntake);
    });

    const averageDailyDeficit = Math.max(
      -1500,
      Math.min(1500, totalDeficit / recentEntries.length),
    );

    const historical = this.getWeightProjection();
    const lastPoint = historical[historical.length - 1];

    let currentWeight = lastPoint.projectedWeight;

    const lastEntry = entries.at(-1)!;
    const lastDate = new Date(lastEntry.date);

    const projections: WeightProjection[] = [];

    for (let i = 1; i <= daysToProject; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + i);

      currentWeight -= averageDailyDeficit / 7700;

      projections.push({
        id: `future-${i}`,
        date: nextDate.toISOString().split('T')[0],
        projectedWeight: currentWeight,
      });
    }

    return projections;
  }

  // 🔥 Calories Burned
  public getCaloriesBurned(entry: DataEntry, profile: UserProfile): number {
    if (entry.caloriesBurned !== undefined) {
      return entry.caloriesBurned;
    }
    return this.estimateCaloriesFromSteps(entry.steps, profile, entry);
  }

  // 🔥 Deficit
  public getDeficit(burned: number, consumed: number): number {
    return burned - consumed;
  }

  // ⚖️ Initial Weight
  private getInitialWeight(
    entries: DataEntry[],
    profile: UserProfile,
  ): number {
    const firstWithWeight = entries.find((e) => e.weight !== undefined);
    return firstWithWeight?.weight ?? profile.currentWeight;
  }

  // 🚶 Step-based estimation
  private estimateCaloriesFromSteps(
    steps: number,
    profile: UserProfile,
    entry?: DataEntry,
  ): number {
    const heightMeters = profile.height / 100;

    const weight = entry?.weight ?? profile.currentWeight;

    const strideLength =
      profile.gender === 'female'
        ? heightMeters * 0.413
        : heightMeters * 0.415;

    const distanceKm = (steps * strideLength) / 1000;

    return weight * distanceKm * 0.75;
  }

  // 📦 Context helper
  private getContext() {
    return {
      entries: this.dataEntryService.getAllDataEntries(),
      userProfile: this.userProfileService.getUserProfileOrThrow(),
    };
  }
}