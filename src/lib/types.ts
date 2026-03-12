// 类型定义

export type ChildAge = '0-1' | '1-3' | '3-6';
export type Preference = 'indoor' | 'outdoor' | 'any';
export type DateType = 'saturday' | 'sunday' | 'weekend';

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface UserPreferences {
  childAge: ChildAge;
  maxDistance: 5 | 10 | 20 | 30;
  preference: Preference;
  date: DateType;
  location?: UserLocation;
}

export interface Place {
  id: string;
  city_id: number;
  name: string;
  address: string;
  location: UserLocation;
  place_type: 'indoor' | 'outdoor' | 'museum' | 'restaurant';
  age_min: number;
  age_max: number;
  rating: number;
  price_level: 1 | 2 | 3 | 4;
  suggested_duration: number;
  opening_hours?: Record<string, string>;
  description?: string;
  image_url?: string;
}

export interface ItineraryPlace {
  order: number;
  place_id: string;
  name: string;
  type: string;
  address: string;
  location: UserLocation;
  arrive_time: string;
  leave_time: string;
  duration: number;
  reason: string;
  tips?: string;
}

export interface RouteSegment {
  from: string;
  to: string;
  duration: number;
  distance?: number;
}

export interface ItinerarySummary {
  total_places: number;
  total_duration: number;
  total_distance: number;
  indoor_count?: number;
  outdoor_count?: number;
}

export interface Itinerary {
  id: string;
  title: string;
  date: string;
  child_age: ChildAge;
  places: ItineraryPlace[];
  route: RouteSegment[];
  summary: ItinerarySummary;
  weather?: {
    date: string;
    condition: string;
    temp: string;
  };
  created_at: string;
}

export interface WeatherData {
  date: string;
  temp_min: number;
  temp_max: number;
  condition: 'sunny' | 'cloudy' | 'rain' | 'snow';
  pop: number;
}

export interface City {
  id: number;
  name: string;
  code: string;
}
