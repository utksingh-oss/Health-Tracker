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
  private readonly CALORIES_PER_KG = 7700;

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

      let projectedWeight = currentWeight - cumulativeDeficit / this.CALORIES_PER_KG;

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
    
    const averageDailyDeficit = this.getRecentAverageDailyDeficit(entries, userProfile);

    const historical = this.getWeightProjection();
    if (historical.length === 0) return [];

    const lastPoint = historical[historical.length - 1];

    let currentWeight = lastPoint.projectedWeight;

    const lastEntry = entries[entries.length - 1]!;
    const lastDate = new Date(lastEntry.date);

    const projections: WeightProjection[] = [];

    for (let i = 1; i <= daysToProject; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + i);

      currentWeight -= averageDailyDeficit / this.CALORIES_PER_KG;

      projections.push({
        id: `future-${i}`,
        date: nextDate.toISOString().split('T')[0],
        projectedWeight: currentWeight,
      });
    }

    return projections;
  }

  public getGoalETA(): { date: string|null; days: number|null; status: 'on_track' | 'not_on_track' } | null {
    
    const { entries, userProfile } = this.getContext();

    const averageDailyDeficit = this.getRecentAverageDailyDeficit(entries, userProfile);
    if(averageDailyDeficit <= 0) {
      return {
        date: null,
        days: null,
        status: 'not_on_track'
      }
    }

    if (!entries.length || !userProfile.targetWeight) return null;

    const historical = this.getWeightProjection();
    if(historical.length === 0) return null;
    const lastPoint = historical[historical.length - 1];

    const currentWeight = lastPoint.projectedWeight;
    const targetWeight = userProfile.targetWeight;

    // ✅ Already reached goal
    if (currentWeight <= targetWeight) {
      return {
        date: lastPoint.date,
        days: 0,
        status: 'on_track'
      };
    }


    // 🔮 Generate future projection (extend if needed)
    const future = this.getFutureWeightProjection(180); // 6 months

    for (let i = 0; i < future.length; i++) {
      const point = future[i];

      if (point.projectedWeight <= targetWeight) {
        return {
          date: point.date,
          days: i + 1,
          status: 'on_track'
        };
      }
    }

    // ❗ Not reachable within projection window
    return null;
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
  private getInitialWeight(entries: DataEntry[], profile: UserProfile): number {
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
      profile.gender === 'female' ? heightMeters * 0.413 : heightMeters * 0.415;

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

  private getRecentAverageDailyDeficit(entries: DataEntry[], userProfile: UserProfile): number {
    let totalDeficit = 0;

    const recentEntries = entries.slice(-Math.min(14, entries.length));
    recentEntries.forEach((entry) => {
      const burned = this.getCaloriesBurned(entry, userProfile);
      totalDeficit += this.getDeficit(burned, entry.caloriesIntake);
    });

    return Math.max(
      -1500,
      Math.min(1500, totalDeficit / recentEntries.length),
    );
  }
}
