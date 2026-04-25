import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bodyOutline,
  closeOutline,
  createOutline,
  fitnessOutline,
  personOutline,
  pulseOutline,
} from 'ionicons/icons';
import { UserProfile } from '../model/user-profile.model';

type ProfileFieldType = 'text' | 'number' | 'enum';

interface ProfileFieldConfig {
  key: keyof UserProfile;
  label: string;
  tone: string;
  type: ProfileFieldType;
  validValues?: string[];
  suffix?: string;
}

interface ProfileFieldView extends ProfileFieldConfig {
  value: string;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [CommonModule, FormsModule, IonHeader, IonContent, IonIcon],
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

  readonly profileFieldConfigs: ProfileFieldConfig[] = [
    { key: 'name', label: 'Full Name', tone: 'accent-yellow', type: 'text' },
    { key: 'age', label: 'Age', tone: 'accent-yellow', type: 'number' },
    { key: 'height', label: 'Height (cm)', tone: 'accent-yellow', type: 'number' },
    {
      key: 'gender',
      label: 'Gender',
      tone: 'accent-yellow',
      type: 'enum',
      validValues: ['male', 'female', 'other'],
    },
    {
      key: 'currentWeight',
      label: 'Current Weight',
      tone: 'accent-orange',
      type: 'number',
      suffix: 'kg',
    },
    {
      key: 'targetWeight',
      label: 'Target Weight',
      tone: 'accent-orange',
      type: 'number',
      suffix: 'kg',
    },
    {
      key: 'activityLevel',
      label: 'Activity Level',
      tone: 'accent-orange',
      type: 'enum',
      validValues: ['sedentary', 'light', 'moderate', 'active', 'very active'],
    },
    {
      key: 'bodyFatPercentage',
      label: 'Body Fat %',
      tone: 'accent-orange',
      type: 'number',
      suffix: '%',
    },
  ];

  activeField: ProfileFieldView | null = null;
  draftValue = '';

  get statCards() {
    return [
      { label: 'Current', value: `${this.profile.currentWeight} kg`, icon: bodyOutline },
      { label: 'Target', value: `${this.profile.targetWeight ?? '-'} kg`, icon: fitnessOutline },
      { label: 'Body Fat', value: `${this.profile.bodyFatPercentage ?? '-'}%`, icon: pulseOutline },
      { label: 'Activity', value: this.toTitleCase(this.profile.activityLevel), icon: personOutline },
    ];
  }

  get profileFields(): ProfileFieldView[] {
    return this.profileFieldConfigs.map((field) => ({
      ...field,
      value: this.formatFieldValue(field),
    }));
  }

  get goalRows() {
    return [
      { label: 'Weight Goal', value: `${this.weightDelta} kg to lose` },
      { label: 'Lifestyle', value: this.toTitleCase(this.profile.activityLevel) },
      { label: 'Focus', value: 'Steady fat loss' },
    ];
  }

  constructor() {
    addIcons({
      bodyOutline,
      closeOutline,
      createOutline,
      fitnessOutline,
      personOutline,
      pulseOutline,
    });
  }

  openEditor(field: ProfileFieldView): void {
    this.activeField = { ...field };
    this.draftValue = this.getEditableValue(field);
  }

  closeEditor(): void {
    this.activeField = null;
    this.draftValue = '';
  }

  saveField(): void {
    if (!this.activeField) {
      return;
    }

    const key = this.activeField.key;

    if (this.activeField.type === 'number') {
      const parsedValue = Number(this.draftValue);
      if (Number.isNaN(parsedValue)) {
        return;
      }

      (this.profile[key] as number | undefined) = parsedValue;
      this.closeEditor();
      return;
    }

    if (this.activeField.type === 'enum') {
      if (!this.activeField.validValues?.includes(this.draftValue)) {
        return;
      }

      this.assignStringValue(key, this.draftValue);
      this.closeEditor();
      return;
    }

    this.assignStringValue(key, this.draftValue.trim());
    this.closeEditor();
  }

  private assignStringValue(key: keyof UserProfile, value: string): void {
    switch (key) {
      case 'name':
        this.profile.name = value;
        break;
      case 'gender':
        this.profile.gender = value as UserProfile['gender'];
        break;
      case 'activityLevel':
        this.profile.activityLevel = value as UserProfile['activityLevel'];
        break;
      default:
        break;
    }
  }

  private formatFieldValue(field: ProfileFieldConfig): string {
    const rawValue = this.profile[field.key];

    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return '-';
    }

    if (field.type === 'enum') {
      return this.toTitleCase(String(rawValue));
    }

    return field.suffix ? `${rawValue} ${field.suffix}` : String(rawValue);
  }

  private getEditableValue(field: ProfileFieldView): string {
    const rawValue = this.profile[field.key];
    return rawValue === undefined || rawValue === null ? '' : String(rawValue);
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
