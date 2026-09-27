export interface GoogleReview {
  id: string;
  rating: number;
  text: string;
  authorName: string;
  reviewDate: string;
}

const API = 'https://businessprofile.googleapis.com/v1';

export function extractTokenFromUrl(url: string): string | null {
  const m = url.match(/[?&#](?:access_token|token|tb)=([^&]+)/);
  if (m) return decodeURIComponent(m[1]);
  const tb = url.match(/[?&#]tb=([^&]+)/);
  if (tb) return decodeURIComponent(tb[1]);
  return null;
}

export function parsePlaceId(url: string): string | null {
  const m = url.match(/place_id=([^&]+)/) || url.match(/places\/([^/?#]+)/);
  return m ? m[1] : null;
}

async function googleFetch<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = (data as any)?.error?.message || `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return data as T;
}

interface LocationsResponse {
  locations?: Array<{ name: string; placeId?: string }>;
}

async function getLocationName(token: string, placeId: string): Promise<string> {
  const data = await googleFetch<LocationsResponse>(token, '/locations');
  const locs = data.locations || [];
  const match = placeId ? locs.find((l) => l.placeId === placeId) : null;
  const loc = match || locs[0];
  if (!loc?.name) throw new Error('No Business Profile location found');
  return loc.name;
}

export async function fetchGoogleReviews(token: string, placeId: string): Promise<GoogleReview[]> {
  const locName = await getLocationName(token, placeId);
  const out: GoogleReview[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 4; page++) {
    const qs = pageToken ? `?pageToken=${encodeURIComponent(pageToken)}` : '';
    const data = await googleFetch<{ reviews?: any[]; nextPageToken?: string }>(
      token,
      `${locName}/reviews${qs}`,
    );
    const reviews = data.reviews || [];
    for (const r of reviews) {
      out.push({
        id: r.name || r.id || `g_${Math.random().toString(36).slice(2, 10)}`,
        rating: Number(r.rating ?? 5),
        text: r.text || r.reviewText || '',
        authorName: r.author?.displayName || r.authorName || 'Google reviewer',
        reviewDate: r.reviewDate || r.createTime || new Date().toISOString(),
      });
    }
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  return out;
}

export async function postGoogleReply(token: string, placeId: string, reviewName: string, text: string): Promise<void> {
  const locName = await getLocationName(token, placeId);
  const url = `${locName}/reviews/${encodeURIComponent(reviewName)}/reply`;
  await googleFetch(token, url, {
    method: 'POST',
    body: JSON.stringify({ comment: text }),
  });
}
