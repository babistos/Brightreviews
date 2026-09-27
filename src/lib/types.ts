export type Plan = 'free' | 'pro';
export type Platform = 'Google' | 'Yelp' | 'Facebook' | 'Bing' | 'Trustpilot';
export type AiTone = 'formal' | 'warm' | 'friendly';
export type AiLength = 'short' | 'medium' | 'detailed';

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  niche: string;
  city: string;
  gbMapsUrl: string;
  website: string;
  phone: string;
  email: string;
  serviceRadius: string;
  hours: string;
  aiTone: AiTone;
  aiLength: AiLength;
  signOff: string;
  language: string;
}

export interface Review {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  platform: Platform;
  author: string;
  text: string;
  createdAt: string;
  replied: boolean;
  ignored: boolean;
  source: 'seed' | 'simulated' | 'google';
  draftVariant: number;
  editedReply?: string;
}

export interface ReplyRecord {
  id: string;
  reviewId: string;
  author: string;
  rating: number;
  text: string;
  ts: string;
  channel: string;
  method: 'ai' | 'manual' | 'template';
}

export interface Monitor {
  id: string;
  kind: string;
  title: string;
  description: string;
  schedule: string;
  enabled: boolean;
}

export interface Account {
  name: string;
  email: string;
  passcodeHash?: string;
  demo?: boolean;
}

export interface Settings {
  endpoint: string;
  apiKey: string;
  model: string;
  digestEmail: string;
  autoPublish: boolean;
  previewReplies: boolean;
}

export interface Usage {
  month: string;
  repliesUsed: number;
  draftsUsed: number;
}

export interface AppState {
  account: Account | null;
  onboarded: boolean;
  profile: BusinessProfile;
  reviews: Review[];
  replies: ReplyRecord[];
  monitors: Monitor[];
  plan: Plan;
  connectedGoogle: boolean;
  usage: Usage;
  settings: Settings;
  simCount: number;
  uid: number;
  copilotSeen: boolean;
}
