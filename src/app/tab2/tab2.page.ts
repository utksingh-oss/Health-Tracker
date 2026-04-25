import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  barChartOutline,
  calendarClearOutline,
  flagOutline,
  flameOutline,
  pulseOutline,
  timerOutline,
} from 'ionicons/icons';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DataEntry } from '../model/data-entry.model';
import { UserProfile } from '../model/user-profile.model';
import { WeightProjection } from '../model/weight-projection.model';
import { DataEntryService } from '../service/data-entry-service';
import { UserProfileService } from '../service/user-profile-service';

Chart.register(...registerables);

type ProjectionMode = 'past' | 'future';

interface TrackingCard {
  label: string;
  value: string;
  note?: string;
  icon: string;
}

interface StreakDay {
  shortLabel: string;
  dateLabel: string;
  tracked: boolean;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [CommonModule, IonHeader, IonContent, IonIcon, BaseChartDirective],
})
export class Tab2Page implements OnInit {
  readonly flagOutline = flagOutline;
  readonly todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  readonly projectionModes: Array<{ id: ProjectionMode; label: string }> = [
    { id: 'past', label: 'Past Projection' },
    { id: 'future', label: 'Target ETA' },
  ];

  readonly projectionChartType = 'bar' as const;
  readonly nutritionChartType = 'line' as const;

  activeProjectionMode: ProjectionMode = 'past';
  summaryCards: TrackingCard[] = [];
  streakDays: StreakDay[] = [];
  currentStreak = 0;
  longestStreak = 0;
  trackedDays = 0;
  goalEtaLabel = 'Watching trend';
  projectionHeadline = 'Historical movement based on daily deficits.';
  projectionSupport = 'Every check-in helps refine the curve.';
  nutritionInsight = 'Nutrient consistency builds out as more entries are added.';

  activeProjectionChartData: ChartData<'bar' | 'line'> = { labels: [], datasets: [] };
  pastProjectionChartData: ChartData<'bar' | 'line'> = { labels: [], datasets: [] };
  futureProjectionChartData: ChartData<'bar' | 'line'> = { labels: [], datasets: [] };
  nutritionChartData: ChartData<'line'> = { labels: [], datasets: [] };

  readonly projectionChartOptions: ChartConfiguration<'bar' | 'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          color: '#171717',
          font: {
            family: 'Source Code Pro',
            size: 10,
            weight: 700,
          },
        },
      },
      tooltip: {
        backgroundColor: '#171717',
        titleColor: '#fff6df',
        bodyColor: '#fff6df',
        borderColor: '#f7df46',
        borderWidth: 2,
        titleFont: {
          family: 'Source Code Pro',
          weight: 700,
        },
        bodyFont: {
          family: 'Source Code Pro',
        },
      },
    },
    elements: {
      line: {
        borderWidth: 3,
        tension: 0.28,
      },
      bar: {
        borderWidth: 2,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
        borderWidth: 2,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#d6c3a4',
        },
        ticks: {
          color: '#171717',
          font: {
            family: 'Source Code Pro',
            size: 10,
            weight: 700,
          },
          maxRotation: 0,
        },
        border: {
          color: '#171717',
          width: 2,
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: '#d6c3a4',
        },
        ticks: {
          color: '#171717',
          font: {
            family: 'Source Code Pro',
            size: 10,
            weight: 700,
          },
        },
        border: {
          color: '#171717',
          width: 2,
        },
      },
      yMetrics: {
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#171717',
          font: {
            family: 'Source Code Pro',
            size: 10,
            weight: 700,
          },
        },
        border: {
          color: '#171717',
          width: 2,
        },
      },
    },
  };

  readonly nutritionChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          color: '#171717',
          font: {
            family: 'Source Code Pro',
            size: 10,
            weight: 700,
          },
        },
      },
      tooltip: {
        backgroundColor: '#171717',
        titleColor: '#fff6df',
        bodyColor: '#fff6df',
        borderColor: '#f7df46',
        borderWidth: 2,
        titleFont: {
          family: 'Source Code Pro',
          weight: 700,
        },
        bodyFont: {
          family: 'Source Code Pro',
        },
      },
    },
    elements: {
      line: {
        borderWidth: 3,
        tension: 0.28,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
        borderWidth: 2,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#d6c3a4',
        },
        ticks: {
          color: '#171717',
          font: {
            family: 'Source Code Pro',
            size: 10,
            weight: 700,
          },
          maxRotation: 0,
        },
        border: {
          color: '#171717',
          width: 2,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#d6c3a4',
        },
        ticks: {
          color: '#171717',
          font: {
            family: 'Source Code Pro',
            size: 10,
            weight: 700,
          },
        },
        border: {
          color: '#171717',
          width: 2,
        },
      },
    },
  };

  constructor(
    private readonly dataEntryService: DataEntryService,
    private readonly userProfileService: UserProfileService,
  ) {
    addIcons({
      barChartOutline,
      calendarClearOutline,
      flagOutline,
      flameOutline,
      pulseOutline,
      timerOutline,
    });
  }

  ngOnInit(): void {
    const { entries, profile } = this.resolveContext();
    const historical = this.buildHistoricalProjection(entries, profile);
    const future = this.buildFutureProjection(entries, profile, historical, 45);
    const eta = this.getGoalEta(historical, future, profile);

    this.pastProjectionChartData = this.buildPastProjectionChart(historical, entries, profile);
    this.futureProjectionChartData = this.buildFutureProjectionChart(
      historical,
      future,
      profile.targetWeight,
    );
    this.activeProjectionChartData = this.pastProjectionChartData;
    this.nutritionChartData = this.buildNutritionChart(entries);

    this.buildStreakState(entries);
    this.summaryCards = this.buildSummaryCards(entries, historical, eta);
    this.goalEtaLabel = eta
      ? `${eta.days === 0 ? 'Goal met today' : `Target by ${this.formatLongDate(eta.date)}`}`
      : 'Need a stronger daily deficit';
    this.projectionHeadline = eta
      ? `Projected target touchpoint: ${this.formatLongDate(eta.date)}`
      : 'Future line stays flat until the average deficit improves.';
    this.projectionSupport = `Current pace reflects the last ${Math.min(entries.length, 14)} logged days.`;
    this.nutritionInsight = this.buildNutritionInsight(entries);
  }

  setProjectionMode(mode: ProjectionMode): void {
    this.activeProjectionMode = mode;
    this.activeProjectionChartData = this.activeProjectionMode === 'past'
      ? this.pastProjectionChartData
      : this.futureProjectionChartData;
  }

  private resolveContext(): { entries: DataEntry[]; profile: UserProfile } {
    const entries = this.dataEntryService.getAllDataEntries();
    const profile = this.userProfileService.userProfile ?? this.getFallbackProfile();

    return {
      entries: entries.length ? entries : this.buildFallbackEntries(),
      profile,
    };
  }

  private buildSummaryCards(
    entries: DataEntry[],
    historical: WeightProjection[],
    eta: { date: string; days: number } | null,
  ): TrackingCard[] {
    const lastWeight = historical[historical.length - 1]?.projectedWeight ?? 0;

    return [
      {
        label: 'Current Streak',
        value: `${this.currentStreak} days`,
        icon: flameOutline,
      },
      {
        label: 'Goal ETA',
        value: eta ? this.formatShortDate(eta.date) : 'Hold steady',
        icon: flagOutline,
      },
      {
        label: 'Tracked Days',
        value: `${entries.length}`,
        note: `${lastWeight.toFixed(1)} kg`,
        icon: calendarClearOutline,
      },
    ];
  }

  private buildStreakState(entries: DataEntry[]): void {
    const sortedDates = [...entries]
      .map((entry) => entry.date)
      .sort((a, b) => a.localeCompare(b));
    const dateSet = new Set(sortedDates);

    this.currentStreak = this.countCurrentStreak(sortedDates);
    this.longestStreak = this.countLongestStreak(sortedDates);
    this.trackedDays = sortedDates.length;

    const formatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    this.streakDays = Array.from({ length: 14 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - index));
      const isoDate = this.toIsoDate(date);

      return {
        shortLabel: new Intl.DateTimeFormat('en-US', {
          weekday: 'narrow',
        }).format(date),
        dateLabel: formatter.format(date),
        tracked: dateSet.has(isoDate),
      };
    });
  }

  private buildPastProjectionChart(
    historical: WeightProjection[],
    entries: DataEntry[],
    profile: UserProfile,
  ): ChartData<'bar' | 'line'> {
    return {
      labels: historical.map((point) => this.formatShortDate(point.date)),
      datasets: [
        {
          type: 'line',
          label: 'Projected Weight',
          data: historical.map((point) => this.round(point.projectedWeight)),
          borderColor: '#171717',
          backgroundColor: '#f7df46',
          pointBackgroundColor: '#f7df46',
          pointBorderColor: '#171717',
          fill: false,
          yAxisID: 'y',
          order: 0,
        },
        {
          type: 'bar',
          label: 'Steps',
          data: entries.slice(-historical.length).map((entry) => entry.steps),
          backgroundColor: '#78d7ff',
          borderColor: '#171717',
          yAxisID: 'yMetrics',
          order: 2,
        },
        {
          type: 'bar',
          label: 'Calories Burned',
          data: entries
            .slice(-historical.length)
            .map((entry) => this.round(this.getCaloriesBurned(entry, profile))),
          backgroundColor: '#ff6b2c',
          borderColor: '#171717',
          yAxisID: 'yMetrics',
          order: 1,
        },
      ],
    };
  }

  private buildFutureProjectionChart(
    historical: WeightProjection[],
    future: WeightProjection[],
    targetWeight?: number,
  ): ChartData<'bar' | 'line'> {
    const combined = [...historical, ...future];

    return {
      labels: combined.map((point) => this.formatShortDate(point.date)),
      datasets: [
        {
          type: 'line',
          label: 'Historical',
          data: [
            ...historical.map((point) => this.round(point.projectedWeight)),
            ...future.map(() => null),
          ],
          borderColor: '#171717',
          backgroundColor: '#171717',
          pointBackgroundColor: '#171717',
          pointBorderColor: '#fff6df',
          borderDash: [4, 4],
          spanGaps: true,
          yAxisID: 'y',
        },
        {
          type: 'line',
          label: 'Future',
          data: [
            ...historical.map(() => null),
            ...future.map((point) => this.round(point.projectedWeight)),
          ],
          borderColor: '#ff6b2c',
          backgroundColor: '#ff6b2c',
          pointBackgroundColor: '#f7df46',
          pointBorderColor: '#171717',
          spanGaps: true,
          yAxisID: 'y',
        },
        {
          type: 'line',
          label: 'Target',
          data: combined.map(() => (targetWeight ? this.round(targetWeight) : null)),
          borderColor: '#78d7ff',
          backgroundColor: '#78d7ff',
          pointRadius: 0,
          borderDash: [8, 4],
          yAxisID: 'y',
        },
      ],
    };
  }

  private buildNutritionChart(entries: DataEntry[]): ChartData<'line'> {
    const recentEntries = entries.slice(-7);

    return {
      labels: recentEntries.map((entry) => this.formatShortDate(entry.date)),
      datasets: [
        {
          label: 'Protein',
          data: recentEntries.map((entry) => entry.protein ?? 0),
          borderColor: '#171717',
          backgroundColor: '#171717',
          pointBackgroundColor: '#f7df46',
          pointBorderColor: '#171717',
        },
        {
          label: 'Fibre',
          data: recentEntries.map((entry) => entry.fibre ?? 0),
          borderColor: '#ff6b2c',
          backgroundColor: '#ff6b2c',
          pointBackgroundColor: '#fff6df',
          pointBorderColor: '#171717',
        },
        {
          label: 'Water',
          data: recentEntries.map((entry) => entry.waterGlasses ?? 0),
          borderColor: '#78d7ff',
          backgroundColor: '#78d7ff',
          pointBackgroundColor: '#f7df46',
          pointBorderColor: '#171717',
        },
      ],
    };
  }

  private buildHistoricalProjection(
    entries: DataEntry[],
    profile: UserProfile,
  ): WeightProjection[] {
    if (!entries.length) {
      return [];
    }

    let cumulativeDeficit = 0;
    let currentWeight = entries.find((entry) => entry.weight !== undefined)?.weight ?? profile.currentWeight;

    return entries.map((entry) => {
      const burned = this.getCaloriesBurned(entry, profile);
      const deficit = burned - entry.caloriesIntake;

      cumulativeDeficit += deficit;

      let projectedWeight = currentWeight - cumulativeDeficit / 7700;

      if (entry.weight !== undefined) {
        const correction = entry.weight - projectedWeight;
        projectedWeight += correction * 0.5;
        cumulativeDeficit = 0;
      }

      currentWeight = projectedWeight;

      return {
        id: entry.id,
        date: entry.date,
        projectedWeight,
      };
    });
  }

  private buildFutureProjection(
    entries: DataEntry[],
    profile: UserProfile,
    historical: WeightProjection[],
    daysToProject: number,
  ): WeightProjection[] {
    if (!entries.length || !historical.length) {
      return [];
    }

    const lastHistorical = historical[historical.length - 1];
    const averageDailyDeficit = this.getRecentAverageDailyDeficit(entries, profile);
    const lastDate = new Date(entries[entries.length - 1].date);
    let currentWeight = lastHistorical.projectedWeight;

    return Array.from({ length: daysToProject }, (_, index) => {
      const date = new Date(lastDate);
      date.setDate(lastDate.getDate() + index + 1);
      currentWeight -= averageDailyDeficit / 7700;

      return {
        id: `future-${index + 1}`,
        date: this.toIsoDate(date),
        projectedWeight: currentWeight,
      };
    });
  }

  private getGoalEta(
    historical: WeightProjection[],
    future: WeightProjection[],
    profile: UserProfile,
  ): { date: string; days: number } | null {
    if (!historical.length || profile.targetWeight === undefined) {
      return null;
    }

    const currentPoint = historical[historical.length - 1];
    if (currentPoint.projectedWeight <= profile.targetWeight) {
      return {
        date: currentPoint.date,
        days: 0,
      };
    }

    const targetHit = future.find(
      (point) => point.projectedWeight <= profile.targetWeight!,
    );

    if (!targetHit) {
      return null;
    }

    return {
      date: targetHit.date,
      days: Math.max(
        Math.round(
          (new Date(targetHit.date).getTime() - new Date(currentPoint.date).getTime()) /
            86400000,
        ),
        0,
      ),
    };
  }

  private getCaloriesBurned(entry: DataEntry, profile: UserProfile): number {
    if (entry.caloriesBurned !== undefined) {
      return entry.caloriesBurned;
    }

    const heightMeters = profile.height / 100;
    const weight = entry.weight ?? profile.currentWeight;
    const strideLength =
      profile.gender === 'female' ? heightMeters * 0.413 : heightMeters * 0.415;
    const distanceKm = (entry.steps * strideLength) / 1000;

    return weight * distanceKm * 0.75;
  }

  private getRecentAverageDailyDeficit(
    entries: DataEntry[],
    profile: UserProfile,
  ): number {
    const recentEntries = entries.slice(-Math.min(entries.length, 14));
    const totalDeficit = recentEntries.reduce((sum, entry) => {
      return sum + this.getCaloriesBurned(entry, profile) - entry.caloriesIntake;
    }, 0);

    return Math.max(-1500, Math.min(1500, totalDeficit / recentEntries.length));
  }

  private countCurrentStreak(sortedDates: string[]): number {
    if (!sortedDates.length) {
      return 0;
    }

    let streak = 1;

    for (let index = sortedDates.length - 1; index > 0; index--) {
      const current = new Date(sortedDates[index]);
      const previous = new Date(sortedDates[index - 1]);
      const difference = (current.getTime() - previous.getTime()) / 86400000;

      if (difference === 1) {
        streak += 1;
        continue;
      }

      break;
    }

    return streak;
  }

  private countLongestStreak(sortedDates: string[]): number {
    if (!sortedDates.length) {
      return 0;
    }

    let longest = 1;
    let current = 1;

    for (let index = 1; index < sortedDates.length; index++) {
      const currentDate = new Date(sortedDates[index]);
      const previousDate = new Date(sortedDates[index - 1]);
      const difference = (currentDate.getTime() - previousDate.getTime()) / 86400000;

      if (difference === 1) {
        current += 1;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }

    return longest;
  }

  private buildNutritionInsight(entries: DataEntry[]): string {
    const recentEntries = entries.slice(-7);
    const averageFibre =
      recentEntries.reduce((sum, entry) => sum + (entry.fibre ?? 0), 0) /
      recentEntries.length;
    const averageWater =
      recentEntries.reduce((sum, entry) => sum + entry.waterGlasses, 0) /
      recentEntries.length;

    return `${averageFibre.toFixed(1)} g fibre and ${averageWater.toFixed(1)} glasses average across the last week.`;
  }

  private buildFallbackEntries(): DataEntry[] {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 13);

    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + index);

      return {
        id: `sample-${index + 1}`,
        date: this.toIsoDate(date),
        steps: 6500 + index * 280 + (index % 3) * 180,
        caloriesIntake: 1750 + (index % 4) * 70,
        caloriesBurned: 2060 + (index % 5) * 55,
        protein: 72 + index * 2,
        carbs: 158 + (index % 4) * 9,
        fats: 48 + (index % 3) * 4,
        fibre: 19 + (index % 5) * 2,
        waterGlasses: 5 + (index % 4),
        todos: [],
        weight: this.round(72 - index * 0.18 + ((index % 3) - 1) * 0.07),
      };
    });
  }

  private getFallbackProfile(): UserProfile {
    return {
      name: 'Avery Patel',
      age: 29,
      height: 168,
      currentWeight: 72,
      gender: 'female',
      targetWeight: 65,
      activityLevel: 'moderate',
      bodyFatPercentage: 24,
    };
  }

  private formatShortDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  }

  private formatLongDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private round(value: number): number {
    return Math.round(value * 10) / 10;
  }
}
