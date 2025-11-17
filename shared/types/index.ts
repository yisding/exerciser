// Shared types for Exerciser application

export interface Studio {
  id: string;
  name: string;
  brand: string;
  location: string;
  address: string;
  latitude?: number;
  longitude?: number;
  websiteUrl?: string;
  phoneNumber?: string;
}

export interface FitnessClass {
  id: string;
  studioId: string;
  className: string;
  instructor: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  capacity?: number;
  spotsAvailable?: number;
  level?: string;
  description?: string;
  bookingUrl?: string;
}

export interface RawClassData {
  [key: string]: any;
}

export interface ScrapeResult {
  brand: string;
  status: 'success' | 'error' | 'partial';
  message?: string;
  classes: FitnessClass[];
  classCount: number;
  error?: Error;
}

export interface UserPreferences {
  favoriteStudios: string[];
  favoriteInstructors: string[];
  classTypes: string[];
  preferredTimes: { start: string; end: string }[];
}
