import type { AppState, BusinessProfile, Review } from './types';

const LENGTH_INSTR: Record<string, string> = {
  short: 'Keep the reply to 1-2 sentences.',
  medium: 'Keep the reply to 2-4 sentences.',
  detailed: 'Write 4-6 sentences, still concise.',
};

function sanitizeName(businessName: string): string {
  return businessName.trim() || 'our team';
}

export function buildSystemPrompt(p: BusinessProfile): string {
  const biz = sanitizeName(p.businessName);
  const niche = p.niche.trim() || 'local service business';
  const city = p.city.trim() || '';
  const radius = p.serviceRadius.trim() || 'your area';
  const hours = p.hours.trim() || 'when you schedule';
  const tone = p.aiTone;
  const len = p.aiLength;
  const signoff = p.signOff.trim() || `— The ${biz} team`;
  const owner = p.ownerName.trim() || 'the owner';

  const prompt = `You write short, professional, empathetic public replies to on-site reviews for a local service business.

Business: ${biz}
Industry: ${niche}
Location: ${city || 'not specified'}
Service area: ${radius}
Hours: ${hours}
Tone: ${tone}
Length guidance: ${len}
Owner: ${owner}
Language: ${p.language || 'English'}
Sign-off: ${signoff}

Rules you MUST follow:
- Reply in the language of the review (default English).
- Never invent specifics: do not invent dates, job sites, phone numbers, prices, or facts not in the business profile.
- Do not apologize more than once. No "I'm so sorry" twice.
- No emojis. No hashtags. No forbidden words: "excited", "delighted", "passionate", "thrilled", "amazing", "incredible".
- Do not offer discounts, refunds, or incentives in a public reply.
- Do not become defensive. For negative reviews: acknowledge the issue clearly, apologize once, state one concrete next step (re-contact, call the office, invite them to discuss directly). Do not invent facts about what happened.
- For positive reviews: thank the reviewer genuinely, mirror one specific approved element (the service, the team, the speed), keep it short.
- For 3-star or lower: lead with acknowledgment.
- For 4-5 star: thank and reinforce.
- Match the tone register requested.
- Output ONLY the reply text, no quotes, no "Reply:", no explanation.

Output the reply text only.`;
  return prompt;
}

export interface AiCallResult {
  ok: boolean;
  text?: string;
  error?: string;
}

async function callAnthropic(state: AppState, user: string): Promise<string> {
  const { apiKey, endpoint, model } = state.settings;
  if (!apiKey.trim()) throw new Error('NO_KEY');
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey.trim(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: state.settings.model || 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: buildSystemPrompt(state.profile),
      messages: [{ role: 'user', content: user }],
    }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = (data as any)?.error?.message || `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  const content = (data as any)?.content;
  if (!Array.isArray(content) || !content[0]?.text) throw new Error('Unexpected API response');
  return content[0].text.trim();
}

function userPromptFor(profile: BusinessProfile, review: Review, variant: number): string {
  const p = profile;
  const biz = (p.businessName || 'the business').trim() || 'the business';
  const variantNote = variant > 0 ? `This is variant ${variant + 1}; it should differ from the previous attempt. ` : '';
  return `${variantNote}Write the public reply for the following review of ${biz} (${p.city || 'local'}).\n\nReview rating: ${review.rating} stars\nReviewer: ${review.author}\nReview text:\n"""\n${review.text}\n"""`;
}

export async function generateReply(state: AppState, review: Review, variant: number): Promise<AiCallResult> {
  try {
    const text = await callAnthropic(state, userPromptFor(state.profile, review, variant));
    return { ok: true, text };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return { ok: false, error: msg };
  }
}

// ---------- Template fallback (works with no API key) ----------

function signOff(state: AppState): string {
  return (state.profile.signOff || '— The Team').trim() || '— The Team';
}

export function templateReply(state: AppState, review: Review, variant: number): string {
  const biz = (state.profile.businessName || 'our team').trim() || 'our team';
  const off = signOff(state);
  const r = review.rating;
  const v = variant;

  let body = '';
  if (r >= 5) {
    const opts = [
      `Thank you, ${review.author} — genuinely appreciated. Please pass this to friends who need reliable local help.`,
      `Thank you for the kind words, ${review.author}. We're glad the visit went well; please pass this to friends who need reliable local help.`,
      `Thank you, ${review.author}. This kind of feedback means a lot to the whole ${biz} team.`,
    ];
    body = opts[v % opts.length];
  } else if (r === 4) {
    const opts = [
      `Thank you, ${review.author} — glad we could get this sorted out for you.`,
      `Thanks, ${review.author}. We're glad we could get this taken care of; reach out any time next visit.`,
    ];
    body = opts[v % opts.length];
  } else if (r === 3) {
    const opts = [
      `Thanks, ${review.author} for the honest feedback. We're working on the communication side and appreciate your patience while we fix that.`,
      `Thanks, ${review.author} for being direct. We'd welcome a chance to make the next visit go better — please feel free to call us directly.`,
    ];
    body = opts[v % opts.length];
  } else {
    const opts = [
      `Hi ${review.author}, thank you for letting us know. This isn't the experience we want — please call us directly and we'll make it right, and tell us again what went wrong and we'll fix it.`,
      `Hi ${review.author}, thank you for being straightforward. This isn't the experience we want — please call us and we'll make it right, and tell us again what went wrong and we'll fix it.`,
      `Hi ${review.author}, thank you for being straightforward. This isn't the experience we want — please call us and we'll make it right, and tell us again what went wrong and we'll fix it.`,
    ];
    body = opts[v % opts.length];
  }
  return `${body}\n${off}`;
}
