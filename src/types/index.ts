export type LeagueType = 'cricket' | 'football' | 'womens';

export type SportType =
  | 'cricket'
  | 'football'
  | 'badminton'
  | 'table-tennis'
  | 'pickleball'
  | 'volleyball'
  | 'womens-sports';

export interface SportOptionInfo {
  id: SportType;
  name: string;
  categoryTag: string;
  iconEmoji: string;
  accent: 'amber' | 'emerald' | 'cyan' | 'indigo' | 'orange' | 'purple' | 'pink';
}

export type CricketRole = 'Batter' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';
export type BattingStyle = 'Right-hand bat' | 'Left-hand bat';
export type BowlingStyle =
  | 'Right-arm Fast / Medium'
  | 'Left-arm Fast / Medium'
  | 'Right-arm Off-Spin'
  | 'Right-arm Leg-Spin'
  | 'Left-arm Orthodox'
  | 'Wicketkeeper / Non-bowler';

export type FootballPosition =
  | 'Forward / Striker'
  | 'Winger (LW / RW)'
  | 'Attacking Midfielder (CAM)'
  | 'Central / Defensive Midfielder (CM / CDM)'
  | 'Fullback (LB / RB)'
  | 'Centre Back (CB)'
  | 'Goalkeeper (GK)';

export type PreferredFoot = 'Right foot' | 'Left foot' | 'Both / Ambidextrous';
export type ExperienceLevel = 'Beginner / Casual' | 'Intermediate (Club / College)' | 'Advanced / RPL Veteran';

export interface RegistrationFormData {
  // Gmail Config
  recipientGmail?: string;
  ccEmail?: string;

  // Basic / Common Info (Common across all sports)
  fullName: string;
  countryCode?: string;
  mobileNumber: string;

  email: string;
  centre: string;
  tshirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other' | string;
  foodPreference: 'Jain' | 'Swaminarayan' | 'Regular Veg' | 'Special Diet' | string;
  accommodationRequired: 'Yes' | 'No' | string;
  checkInDate?: string;
  checkOutDate?: string;
  existingRplFamily: 'Yes' | 'No' | string;
  photoName?: string;
  photoDataUrl?: string;

  // Selected Sports (Supports 1 or multiple out of 7 options)
  selectedSports: SportType[];
  primarySport?: SportType | string;
  league?: LeagueType; // backward compatibility

  // Dynamic Cricket Specifics
  cricketRole?: CricketRole;
  battingStyle?: BattingStyle | string;
  bowlingStyle?: BowlingStyle | string;
  cricketExperience?: ExperienceLevel | string;

  // Dynamic Football Specifics
  footballPosition?: FootballPosition | string;
  preferredFoot?: PreferredFoot | string;
  footballExperience?: ExperienceLevel | string;

  // Dynamic Badminton Specifics
  badmintonCategory?: 'Singles' | 'Doubles' | 'Mixed Doubles' | string;
  badmintonHand?: 'Right-handed' | 'Left-handed' | string;
  badmintonExperience?: ExperienceLevel | string;

  // Dynamic Table Tennis Specifics
  ttCategory?: 'Singles' | 'Doubles' | string;
  ttGrip?: 'Shakehand Grip' | 'Penhold Grip' | string;
  ttExperience?: ExperienceLevel | string;

  // Dynamic Pickleball Specifics
  pickleballCategory?: 'Men Singles' | 'Women Singles' | 'Men Doubles' | 'Women Doubles' | 'Mixed Doubles' | string;
  pickleballSkill?: '2.5 - 3.0 (Beginner)' | '3.5 (Intermediate)' | '4.0+ (Advanced)' | string;
  pickleballPartner?: string;
  pickleballExperience?: ExperienceLevel | string;

  // Dynamic Volleyball / Throwball Specifics
  volleyballRole?: 'Spiker / Attacker' | 'Setter' | 'Libero / Defender' | 'Throwball Player' | string;
  volleyballExperience?: ExperienceLevel | string;

  // Dynamic Women's League Specifics
  womensCategory?: "Women's Cricket" | "Women's Football" | 'Throwball' | string;
  womensPlayingRole?: string;
  womensExperience?: ExperienceLevel | string;

  // Optional Squad / Apparel Customization
  customJerseyName?: string;
  preferredJerseyNumber?: string;
  preferredTeamName?: string;
  additionalNotes?: string;
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

export interface DynamicField {
  id: string;
  sport_id: string | null;
  field_key: string;
  label: string;
  field_type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'file';
  options?: string[] | null;
  validation_rules?: {
    required?: boolean;
    min?: number;
    max?: number;
    regex?: string;
  } | null;
  sort_order: number;
}

export interface DynamicSport {
  id: string;
  name: string;
  is_active?: boolean;
}


