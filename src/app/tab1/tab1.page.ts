import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonContent, IonIcon, IonInput, IonHeader, IonItem, IonRange, IonCard, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  flameOutline,
  trendingUpOutline,
  walkOutline,
  waterOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonTitle, IonToolbar, IonCard, IonRange, IonItem, IonHeader, CommonModule, IonContent, IonIcon, IonInput],
})
export class Tab1Page {
  readonly todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  readonly statCards = [
    { label: 'Calories', value: '1,840', icon: flameOutline },
    { label: 'Steps', value: '8,420', icon: walkOutline },
    { label: 'Water', value: '6 / 8', icon: waterOutline },
    { label: 'Burned', value: '520', icon: trendingUpOutline },
  ];

  readonly keyInputs = [
    { label: 'Calories Consumed', tone: 'accent-yellow' },
    { label: 'Calories Burnt', tone: 'accent-orange' },
    { label: 'Protein', tone: 'accent-orange' },
    { label: 'Carbs', tone: 'accent-yellow' },
    { label: 'Fats', tone: 'accent-blue' },
    { label: 'Fibre', tone: 'accent-cream' },
    { label: 'Steps', tone: 'accent-blue' },
    { label: 'Water Glasses', tone: 'accent-cream' },
  ];

  constructor() {
    addIcons({
      flameOutline,
      trendingUpOutline,
      walkOutline,
      waterOutline,
    });
  }
}
