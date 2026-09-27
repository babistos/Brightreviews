import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Stars, PlatformBadge, Button, Card } from '../components/ui';
import { useSearchParams } from 'react-router-dom';
import { generateReply, templateReply } from '../lib/ai';
import { FREE_REPLY_LIMIT, uid } from '../lib/data';
import { extractTokenFromUrl, parsePlaceId, fetchGoogleReviews } from '../lib/google';
import { RefreshCw, KeyRound, X, Check, Edit3, Trash2, Sparkles, AlertTriangle, ChevronDown } from 'lucide-react';

type Tab = 'all' | 'open' | 'negative' | 'replied';

export default function Inbox() {
  const { state, setState } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [draftVariant, setDraftVariant] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);
  const [googleUrl, setGoogleUrl] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const focusId = searchParams.get('focus');

  const reviews = state ? state.reviews : [];
  const selected = reviews.find((r) => r.id === selectedId) || null;

  // Resolve focus
  useEffect(() => {
    if (focusId && reviews.some((r) => r.id === focusId)) {
      setSelectedId(focusId);
      setTab('all');
      setSearchParams({}, { replace: true });
    }
  }, [focusId, reviews, setSearchParams]);

  // Auto-select first
  useEffect(() => {
    if (!selectedId && reviews.length) {
      const first = reviews.find((r) => !r.replied && !r.ignored) || reviews[0];
      setSelectedId(first.id);
    }
  }, [reviews, selectedId]);

  if (!state) return null;
  const pro = state.plan === 'pro';
  const used = state.usage.repliesUsed;
  const remaining = pro ? Infinity : Math.max(0, FREE_REPLY_LIMIT - used);
  const hasKey = state.settings.apiKey.trim().length > 0;

  const notify = (msg: string, kind = 'info') => {
    setNotice(kind === 'error' ? `Error: ${msg}` : msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const filtered = reviews.filter((r) => {
    if (tab === 'open') return !r.replied && !r.ignored;
    if (tab === 'negative') return r.rating <= 3 && !r.replied && !r.ignored;
    if (tab === 'replied') return r.replied;
    return true;
  });

  const select = (id: string) => {
    setSelectedId(id);
    const r = reviews.find((x) => x.id === id);
    setDraft(r && r.editedReply ? r.editedReply : '');
    setDraftVariant(r ? r.draftVariant : 0);
    setEditing(false);
  };

  const generate = async (variant: number) => {
    if (!selected) return;
    if (!hasKey) {
      // template fallback
      const text = templateReply(state, selected, variant);
      setDraft(text);
      setDraftVariant(variant);
      setGenerating(false);
      notify(`AI key not set — used a template draft. Add your Anthropic key in Settings for AI replies.`);
      return;
    }
    if (!pro && used >= FREE_REPLY_LIMIT) {
      notify(`Free plan limit reached (${FREE_REPLY_LIMIT} replies). Upgrade to Pro for unlimited.`, 'error');
      return;
    }
    setGenerating(true);
    setDraft('');
    try {
      const result = await generateReply(state, selected, variant);
      if (result.ok && result.text) {
        setDraft(result.text);
        setDraftVariant(variant);
        setEditing(false);
        // count a generation against usage on AI path
        setState((s) => ({ ...s, usage: { ...s.usage, repliesUsed: s.usage.repliesUsed + 1, draftsUsed: s.usage.draftsUsed + 1 } }));
      } else {
        notify(`AI generation failed (${result.error}). Try again or check your key in Settings.`, 'error');
      }
    } catch (e) {
      notify(`AI generation failed: ${e instanceof Error ? e.message : e}`, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const publish = () => {
    if (!selected || !draft.trim()) return;
    if (!pro && used >= FREE_REPLY_LIMIT) {
      notify(`Free plan limit reached. Upgrade to Pro for unlimited replies.`, 'error');
      return;
    }
    const replyText = draft.trim();
    setState((s) => {
      const reviews = s.reviews.map((r) =>
        r.id === selected.id ? { ...r, replied: true, editedReply: replyText, draftVariant: draftVariant } : r,
      );
      const record = {
        id: uid('rep'),
        reviewId: selected.id,
        author: selected.author,
        rating: selected.rating,
        text: replyText,
        ts: new Date().toISOString(),
        channel: selected.platform,
        method: (hasKey ? 'ai' : 'template') as 'ai' | 'template',
      };
      const usage = { ...s.usage, repliesUsed: s.usage.repliesUsed + (hasKey ? 0 : 1) };
      return { ...s, reviews, replies: [...s.replies, record], usage };
    });
    setDraft('');
    notify(`Published reply to ${selected.author}.`);
  };

  const ignore = () => {
    if (!selected) return;
    setState((s) => ({
      ...s,
      reviews: s.reviews.map((r) => (r.id === selected.id ? { ...r, ignored: true } : r)),
    }));
    setSelectedId(null);
    setDraft('');
  };

  const undo = () => {
    if (!selected) return;
    setState((s) => ({
      ...s,
      reviews: s.reviews.map((r) => (r.id === selected.id ? { ...r, replied: false } : r)),
    }));
    setDraft(selected.editedReply || '');
    notify(`Reply to ${selected.author} un-published.`);
  };

  const syncGoogle = async () => {
    setGoogleLoading(true);
    try {
      const url = googleUrl.trim();
      const token = extractTokenFromUrl(url);
      if (!token) throw new Error('Could not find an access token in that URL. Paste the full Google Business Profile URL with access_token.');
      const placeId = parsePlaceId(url) || '';
      const fetched = await fetchGoogleReviews(token, placeId);
      setState((s) => {
        const existing = new Set(s.reviews.map((r) => r.id));
        const added = fetched.filter((g) => !existing.has(g.id)).filter((g) => g.text.trim());
        const newReviews = [
          ...added.map((g) => ({
            id: g.id,
            rating: Math.min(5, Math.max(1, g.rating)) as 1 | 2 | 3 | 4 | 5,
            platform: 'Google' as const,
            author: g.authorName,
            text: g.text,
            createdAt: g.reviewDate,
            replied: false,
            ignored: false,
            source: 'google' as const,
            draftVariant: 0,
          })),
          ...s.reviews,
        ];
        return { ...s, reviews: newReviews, connectedGoogle: true };
      });
      setShowGoogle(false);
      setGoogleUrl('');
      notify(`Imported ${fetched.length} Google reviews.`);
    } catch (e) {
      notify(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const simulate = () => {
    const samples = [
      { rating: 5 as const, author: 'Riley', text: 'Booked on Monday, tech arrived Tuesday. Fast and very professional. Highly recommend.' },
      { rating: 2 as const, author: 'Morgan', text: 'The invoice was more than the quote by a third. Nobody warned us. Not happy.' },
      { rating: 4 as const, author: 'Casey', text: 'Good work, clean install. Would definitely book again, just wish they called first to confirm the time.' },
      { rating: 1 as const, author: 'Sam', text: 'Three no-shows by our office. Phone was unreachable each time. We are not using them anymore.' },
      { rating: 5 as const, author: 'Jordan', text: 'They fixed our furnace the same day in this cold snap. Explained everything clearly. Genuinely impressed.' },
    ];
    const n = samples.length;
    const pick = samples[Math.floor(Math.random() * n)];
    const newReview = {
      id: uid('sim'),
      rating: pick.rating,
      platform: 'Google' as const,
      author: pick.author,
      text: pick.text,
      createdAt: new Date().toISOString(),
      replied: false,
      ignored: false,
      source: 'simulated' as const,
      draftVariant: 0,
    };
    setState((s) => ({ ...s, reviews: [newReview, ...s.reviews], simCount: s.simCount + 1 }));
    setSelectedId(newReview.id);
    setDraft('');
    notify(`Simulated a new ${pick.rating}-star review from ${pick.author}.`);
  };

  return (
    <div className="mx-auto max-w-7xl p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
          <p className="mt-0.5 text-sm text-slate">
            {reviews.filter((r) => !r.replied && !r.ignored).length} unreplied · {pro ? 'unlimited replies' : `${remaining} free replies left`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowGoogle((v) => !v)} variant="ghost" className="py-2"><RefreshCw className="h-4 w-4" /> Connect Google</Button>
          <Button onClick={simulate} variant="ghost" className="py-2">+ Simulate review</Button>
        </div>
      </div>

      {showGoogle && (
        <Card className="mt-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-slate">Google Business Profile URL with access_token</label>
              <input
                value={googleUrl}
                onChange={(e) => setGoogleUrl(e.target.value)}
                placeholder="https://business.google.com/profile/…?access_token=…"
                className="w-full rounded-lg border border-line bg-ink/60 px-3 py-2.5 font-mono text-xs text-cream placeholder:text-slate/40 focus:border-neon/60 focus:outline-none"
              />
              <p className="mt-1.5 text-xs text-slate/70">Paste the full URL from an authenticated Google Business Profile session. Only used to import & reply to reviews.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={syncGoogle} disabled={!googleUrl.trim() || googleLoading} variant="primary" className="py-2">
                {googleLoading ? 'Importing…' : 'Import'}
              </Button>
              <Button onClick={() => setShowGoogle(false)} variant="ghost" className="py-2"><X className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      )}

      {notice && (
        <div className={`mt-4 rounded-lg border p-3 text-sm ${notice.startsWith('Error') ? 'border-red/40 bg-red/10 text-red' : 'border-neon/30 bg-neon/10 text-neon'}`}>
          {notice}
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-[380px_1fr]">
        {/* Left: list */}
        <Card className="overflow-hidden">
          <div className="flex border-b border-line">
            {([['all', 'All'], ['open', 'Open'], ['negative', '≤3★'], ['replied', 'Replied']] as Array<[Tab, string]>).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-colors ${tab === id ? 'bg-neon/10 text-neon' : 'text-slate hover:text-cream'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="max-h-[560px] overflow-y-auto">
            {filtered.length === 0 && (
              <p className="p-6 text-center text-sm text-slate">No reviews in this view.</p>
            )}
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => select(r.id)}
                className={`w-full border-b border-line/60 p-3.5 text-left transition-colors ${
                  selectedId === r.id ? 'bg-neon/[0.08]' : 'hover:bg-panel2'
                } ${r.replied ? 'opacity-60' : ''} ${r.ignored ? 'opacity-30' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate text-sm font-medium text-cream">{r.author}</span>
                    <Stars rating={r.rating} size={11} />
                  </div>
                  <span className={`shrink-0 text-[9px] font-bold uppercase ${r.replied ? 'text-neon' : 'text-amber'}`}>
                    {r.replied ? 'Done' : 'Open'}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate">{r.text}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <PlatformBadge platform={r.platform} />
                  <span className="text-[10px] text-slate/60">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Right: detail + reply */}
        <Card className="p-5 md:p-6">
          {!selected ? (
            <div className="flex h-full min-h-[300px] items-center justify-center text-slate">
              <p className="text-center text-sm">Select a review to draft a reply.</p>
            </div>
          ) : (
            <>
              {/* Review detail */}
              <div className="border-b border-line pb-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-cream">{selected.author}</h2>
                    <div className="mt-1 flex items-center gap-3">
                      <Stars rating={selected.rating} />
                      <PlatformBadge platform={selected.platform} />
                      <span className="text-xs text-slate">{new Date(selected.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  {selected.replied && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-neon/15 px-2.5 py-1.5 text-xs font-bold text-neon">
                      <Check className="h-3.5 w-3.5" /> Replied
                    </span>
                  )}
                </div>
                <p className="mt-4 rounded-lg border border-line bg-ink/50 p-4 text-sm leading-relaxed text-cream/90">"{selected.text}"</p>
              </div>

              {/* If already replied, show the reply */}
              {selected.replied ? (
                <div className="pt-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate">Published reply</div>
                  <p className="mt-2 whitespace-pre-wrap rounded-lg border-l-2 border-neon bg-neon/[0.06] p-4 text-sm text-cream/90">
                    {selected.editedReply || '(reply text)'}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Button onClick={undo} variant="ghost" className="py-2"><Edit3 className="h-4 w-4" /> Undo</Button>
                    <Button onClick={ignore} variant="ghost" className="py-2"><Trash2 className="h-4 w-4" /> Ignore</Button>
                  </div>
                </div>
              ) : (
                <div className="pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate">Your reply</div>
                    <div className="flex items-center gap-2 text-xs text-slate">
                      <Sparkles className={`h-3.5 w-3.5 ${hasKey ? 'text-neon' : 'text-slate/50'}`} />
                      {hasKey ? `AI · ${state.settings.model}` : 'Template mode (no AI key)'}
                    </div>
                  </div>

                  {draft ? (
                    <div className="mt-3 whitespace-pre-wrap rounded-lg border border-line bg-ink/50 p-4 text-sm text-cream/90">{draft}</div>
                  ) : (
                    <div className="mt-3 rounded-lg border border-dashed border-line bg-ink/30 p-4 text-sm text-slate">
                      No draft yet. Generate one with AI, or use a template.
                    </div>
                  )}

                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={4}
                    placeholder="Type or edit your reply here…"
                    className="mt-3 w-full rounded-lg border border-line bg-ink/60 p-4 text-sm text-cream placeholder:text-slate/40 focus:border-neon/60 focus:outline-none"
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={() => generate(draftVariant)} disabled={generating} className="py-2">
                      <Sparkles className="h-4 w-4" /> {generating ? 'Generating…' : draftVariant > 0 ? 'Regenerate (variant ' + (draftVariant + 1) + ')' : 'Generate with AI'}
                    </Button>
                    {draftVariant > 0 && (
                      <Button onClick={() => generate(draftVariant + 1)} disabled={generating} variant="ghost" className="py-2">
                        Try next variant
                      </Button>
                    )}
                    <div className="flex-1" />
                    <Button onClick={publish} disabled={!draft.trim()} className="py-2">Publish</Button>
                    <Button onClick={ignore} variant="ghost" className="py-2">Ignore</Button>
                  </div>
                  {!hasKey && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-amber/90">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Template drafts are static. Add your Anthropic API key in Settings to enable real AI replies.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
