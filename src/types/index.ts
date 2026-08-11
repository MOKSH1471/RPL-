export type LeagueType = 'cricket' | 'football' | 'womens';

export type CricketRole = 'Batter' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';
export type FootballPosition = 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper';
export type WomensSportCategory = "Women's Cricket" | "Women's Football" | 'Throwball';

export interface RegistrationFormData {
  // Gmail Config
  recipientGmail?: string;
  ccEmail?: string;

  // Personal Info
  fullName: string;
  mobileNumber: string;
  email: string;
  dateOfBirth: string;
  photoName?: string;
  photoDataUrl?: string;
  centre: string;

  // RPL Specifics
  existingRplFamily: 'Yes' | 'No' | string;
  gender: 'Male' | 'Female' | 'Other' | string;
  tshirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | string;
  foodPreference: 'Jain' | 'Swaminarayan' | 'Regular Veg' | 'Special Diet' | string;
  accommodationRequired: 'Yes' | 'No' | string;

  // League Details
  league: LeagueType;
  cricketRole?: CricketRole;
  battingStyle?: string;
  footballPosition?: FootballPosition;
  womensCategory?: WomensSportCategory;
  preferredTeamName?: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  accent: 'amber' | 'emerald' | 'magenta' | 'cyan';
}

export interface GalleryItem {
  id: string;
  title: string;
  season: string;
  category: 'cricket' | 'football' | 'womens' | 'moments';
  image: string;
  caption: string;
}

export interface SubmissionResponse {
  registrationId: string;
  timestamp: string;
  data: RegistrationFormData;
}
