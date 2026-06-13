export interface TripBlock {
  id: number;
  type: string; // 'place', 'note', etc.
  name: string;
  note: string;
  lat?: number;
  lng?: number;
  address: string;
  description: string;
  googleUrl: string;
  photoUrls: string[];
  travelMode: string | null;
}

export interface TripSection {
  id: number;
  heading: string;
  type: string; // 'hotels', 'normal'
  mode: string; // 'placeList', 'dayPlan'
  blocks: TripBlock[];
}

export interface TripData {
  title: string;
  startDate: string;
  endDate: string;
  sections: TripSection[];
}

export type Language = 'az' | 'en';

export interface TranslationDict {
  title: string;
  subtitle: string;
  viewAllMap: string;
  lodgingTitle: string;
  hotelsTitle: string;
  dayPlanTitle: string;
  optimizerTitle: string;
  aiTitle: string;
  daysLabel: string;
  dateLabel: string;
  addressLabel: string;
  noteLabel: string;
  directionsBtn: string;
  optimizeBtn: string;
  optimizedOrderLabel: string;
  originalOrderLabel: string;
  totalDistanceLabel: string;
  recommendLabel: string;
  noCoordsError: string;
  loadingAi: string;
  aiPlaceholder: string;
  roadtripOverview: string;
  searchPlaceholder: string;
  recommendedPlacesOnWayTitle: string;
}
