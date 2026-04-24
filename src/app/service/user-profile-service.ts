import { Injectable } from '@angular/core';
import { UserProfile } from '../model/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  userProfile: UserProfile | null = null;

  setUserProfile(profile: UserProfile): void {
    this.userProfile = profile;
  }

  getUserProfileOrThrow(): UserProfile {
    if (!this.userProfile) throw new Error('UserProfile not set');
    return this.userProfile;
  }
}
