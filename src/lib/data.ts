import type { AppState, BusinessProfile, Monitor, Review } from './types';

export const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
export const FREE_REPLY_LIMIT = 25;
export const FREE_DRAFT_LIMIT = 5;

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function defaultProfile(name: string = 'BrightReviews'): BusinessProfile {
  return {
    businessName: name,
    ownerName: 'the owner',
    niche: 'local service business',
    city: '',
    gbMapsUrl: '',
    website: '',
    phone: '',
    email: '',
    serviceRadius: '',
    hours: '',
    aiTone: 'warm',
    aiLength: 'medium',
    signOff: '— The Team',
    language: 'English',
  };
}

const SEED: Array<Omit<Review, 'id' | 'createdAt' | 'replied' | 'ignored' | 'source' | 'draftVariant'>> = [
  { rating: 5, platform: 'Google', author: 'Marcus W.', text: 'Great job on the whole kitchen remodel. Crew was on time, clean, and the final walkthrough was smooth. Highly recommend.' },
  { rating: 4, platform: 'Google', author: 'Priya S.', text: 'Solid work overall. Took a little longer than quoted but the finish quality is excellent. Would hire again for a smaller project.' },
  { rating: 1, platform: 'Google', author: 'Jordan T.', text: 'We waited three weeks after scheduling for a confirmation. When the tech arrived the fix was never resolved. Really disappointed.' },
  { rating: 5, platform: 'Yelp', author: 'Elena R.', text: 'Booked, arrived early, fixed it in one visit. The team was friendly and sent a photo of the finished work. Super impressed.' },
  { rating: 3, platform: 'Google', author: 'Dana K.', text: 'Service was okay but communication was slow before the visit. Needed two follow-up calls to confirm the appointment time.' },
  { rating: 2, platform: 'Facebook', author: 'Chris B.', text: 'This is the second time we tried to book. Phone line went unanswered twice. Getting frustrated with how communication is handled.' },
  { rating: 5, platform: 'Google', author: 'Aisha N.', text: 'Lifesaver! Our AC broke on a hot day and they got here fast with a same-day fix. Professional and explained everything clearly.' },
  { rating: 1, platform: 'Yelp', author: 'Tom H.', text: 'Charged double the estimate with no prior agreement. Work done was average and the invoice had several line items that were never mentioned. Unacceptable.' },
  { rating: 4, platform: 'Google', author: 'Sofia L.', text: 'Quick and professional. The part they installed is high quality and they left the old part. Minor scheduling overlap but otherwise great.' },
  { rating: 5, platform: 'Facebook', author: 'Ben C.', text: 'Recommended them to a friend and said the same good things. Zero complaints about the visit itself. Great crew.' },
];

export function buildSeedReviews(): Review[] {
  const now = Date.now();
  return SEED.map((s, i) => {
    const daysAgo = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10][i] ?? 1;
    const d = new Date(now - daysAgo * 86400000 - i * 3600000);
    return {
      ...s,
      id: `seed_${i + 1}_${uid('r')}`,
      createdAt: d.toISOString(),
      replied: false,
      ignored: false,
      source: 'seed' as const,
      draftVariant: 0,
    };
  });
}

export function buildMonitors(): Monitor[] {
  return [
    { id: uid('m'), kind: 'review', title: 'New review alert', description: 'Notify me as soon as a new review is posted to any connected profile.', schedule: 'Instant', enabled: true },
    { id: uid('m'), kind: 'weekly', title: 'Weekly reputation digest', description: 'A summary of new reviews, rating changes, and unanswered posts every Monday morning.', schedule: 'Weekly · Mon', enabled: true },
    { id: uid('m'), kind: 'monthly', title: 'Monthly ROI report', description: 'Estimated revenue impact of replies and monitoring vs. the cost of the plan, every month.', schedule: 'Monthly · 1st', enabled: true },
    { id: uid('m'), kind: 'rating', title: 'Rating-drop watch', description: 'Flag immediately if average rating drops more than 0.2 in a week.', schedule: 'Hourly', enabled: false },
  ];
}

export function defaultSettings(): AppState['settings'] {
  return {
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: '',
    model: 'claude-haiku-4-5-20251001',
    digestEmail: '',
    autoPublish: false,
    previewReplies: true,
  };
}

export function freshState(account: AppState['account']): AppState {
  return {
    account,
    onboarded: false,
    profile: defaultProfile(account?.name?.split(' ')[0] || 'My Business'),
    reviews: buildSeedReviews(),
    replies: [],
    monitors: buildMonitors(),
    plan: 'free',
    connectedGoogle: false,
    usage: { month: CURRENT_MONTH, repliesUsed: 0, draftsUsed: 0 },
    settings: defaultSettings(),
    simCount: 0,
    uid: 0,
    copilotSeen: false,
  };
}
