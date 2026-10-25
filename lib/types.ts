export interface Restaurant {
  id: string | number;
  name: string;
  region: 'toronto' | 'waterloo' | 'mississauga' | 'trip' | string;
  regionName: string;
  vibe: 'brunch' | 'date' | 'fine' | 'casual' | 'drinks' | string;
  vibeName: string;
  badge: string;
  creator: string;
  url: string;
  desc: string;
  tip?: string;
  price: '$' | '$$' | '$$$' | '$$$$' | string;
  tags: string[];
  status?: 'want_to_go' | 'visited' | 'favorite';
  userNotes?: string;
  userRating?: number;
  createdAt?: string;
}

export interface ExtractedReelData {
  name: string;
  region: string;
  regionName: string;
  vibe: string;
  vibeName: string;
  badge: string;
  creator: string;
  url: string;
  desc: string;
  tip: string;
  price: string;
  tags: string[];
}

export interface AIConciergeResponse {
  thought?: string;
  primary_spot_id?: string | number;
  secondary_spot_ids?: (string | number)[];
  recommendation: string;
  pro_tip?: string;
  vibe_match?: string;
}
