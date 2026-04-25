import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonContent, IonHeader, IonIcon, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bodyOutline,
  fitnessOutline,
  personOutline,
  pulseOutline,
} from 'ionicons/icons';
import { UserProfile } from '../model/user-profile.model';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [CommonModule, IonHeader, IonContent, IonIcon, IonInput],
})
export class Tab3Page {
  readonly todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  readonly profile: UserProfile = {
    name: 'Avery Patel',
    age: 29,
    height: 168,
    currentWeight: 72,
    gender: 'female',
    targetWeight: 65,
    activityLevel: 'moderate',
    bodyFatPercentage: 24,
  };

  readonly statCards = [
    { label: 'Current', value: `${this.profile.currentWeight} kg`, icon: bodyOutline },
    { label: 'Target', value: `${this.profile.targetWeight ?? '-'} kg`, icon: fitnessOutline },
    { label: 'Body Fat', value: `${this.profile.bodyFatPercentage ?? '-'}%`, icon: pulseOutline },
    { label: 'Activity', value: this.toTitleCase(this.profile.activityLevel), icon: personOutline },
  ];

  readonly profileFields = [
    { label: 'Full Name', value: this.profile.name, type: 'text', tone: 'accent-yellow' },
    { label: 'Age', value: String(this.profile.age), type: 'number', tone: 'accent-yellow' },
    { label: 'Height (cm)', value: String(this.profile.height), type: 'number', tone: 'accent-yellow' },
    { label: 'Gender', value: this.toTitleCase(this.profile.gender), type: 'text', tone: 'accent-yellow' },
    { label: 'Current Weight', value: `${this.profile.currentWeight}`, type: 'number', tone: 'accent-orange' },
    { label: 'Target Weight', value: `${this.profile.targetWeight ?? ''}`, type: 'number', tone: 'accent-orange' },
    { label: 'Activity Level', value: this.toTitleCase(this.profile.activityLevel), type: 'text', tone: 'accent-orange' },
    { label: 'Body Fat %', value: `${this.profile.bodyFatPercentage ?? ''}`, type: 'number', tone: 'accent-orange' },
  ];

  readonly goalRows = [
    { label: 'Weight Goal', value: `${this.weightDelta} kg to lose` },
    { label: 'Lifestyle', value: this.toTitleCase(this.profile.activityLevel) },
    { label: 'Focus', value: 'Steady fat loss' },
  ];

  constructor() {
    addIcons({
      bodyOutline,
      fitnessOutline,
      personOutline,
      pulseOutline,
    });
  }

  private get weightDelta(): number {
    if (this.profile.targetWeight === undefined) {
      return 0;
    }

    return Math.max(this.profile.currentWeight - this.profile.targetWeight, 0);
  }

  private toTitleCase(value: string): string {
    return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
