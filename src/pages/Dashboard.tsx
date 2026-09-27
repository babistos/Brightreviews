import { useApp } from '../context/AppContext';
import { Card, Stars, Button } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { FREE_REPLY_LIMIT } from '../lib/data';

export default function Dashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  if (!state) return null;

  const reviews = state.reviews;
  const unreplied = reviews.filter((r) => !r.replied && !r.ignored);
  const replied = reviews.filter((r) => r.replied);
  const negative = reviews.filter((r) => r.rating <= 3);
  const avgRating = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const pendingNegative = negative.filter((r) => !r.replied && !r.ignored);
  const pro = state.plan === 'pro';
  const repliesUsed = state.usage.repliesUsed;
  const remaining = pro ? Infinity : Math.max(0, FREE_REPLY_LIMIT - repliesUsed);

  return (
    <div className="mx-auto max-w-6xl p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{state.profile.businessName || 'Your dashboard'}</h1>
          <p className="mt-1 text-sm text-slate">{state.profile.city || 'Local'} · {reviews.length} total reviews</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-lg px-3 py-2 text-sm font-bold ${pro ? 'bg-neon/15 text-neon' : 'bg-amber/15 text-amber'}`}>
            {pro ? 'PRO plan' : 'FREE plan'}
          </span>
          {pro ? null : (
            <Button onClick={() => navigate('/app/settings')} variant="amber" className="py-2">Upgrade</Button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 md:gap-4">
        <StatCard
          label="Average rating"
          value={avgRating.toFixed(1)}
          icon={<Stars rating={avgRating} size={13} />}
          sub={negative.length ? `${negative.length} reviews ≤3★` : 'No low reviews'}
        />
        <StatCard
          label="Unreplied"
          value={String(unreplied.length)}
          icon={<Clock className="h-4 w-4 text-amber" />}
          sub={pendingNegative.length ? `${pendingNegative.length} negative need replies` : pendingNegative.length === 0 && negative.length ? 'All negative replied' : 'All caught up'}
          accent={unreplied.length > 0 ? 'amber' : 'neon'}
        />
        <StatCard
          label="Replied"
          value={String(replied.length)}
          icon={<CheckCircle2 className="h-4 w-4 text-neon" />}
          sub={reviews.length ? `${Math.round((replied.length / reviews.length) * 100)}% coverage` : '—'}
          accent="neon"
        />
        <StatCard
          label={pro ? 'Replies used' : 'Free replies left'}
          value={pro ? String(repliesUsed) : String(remaining)}
          icon={<TrendingUp className="h-4 w-4 text-blue-300" />}
          sub={pro ? 'Unlimited plan' : `${repliesUsed}/${FREE_REPLY_LIMIT} used this month`}
          accent={pro ? 'neon' : remaining === 0 ? 'red' : 'blue'}
        />
      </div>

      {/* Needs attention + quick list */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        {/* Priority queue */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-cream">Needs attention</h2>
            {negative.some((r) => !r.replied && !r.ignored) && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-red/15 px-2 py-1 text-xs font-semibold text-red">
                <AlertTriangle className="h-3.5 w-3.5" /> {pendingNegative.length} negative
              </span>
            )}
          </div>
          <div className="mt-4 space-y-2.5">
            {pendingNegative.length === 0 && unreplied.length === 0 && (
              <p className="text-sm text-slate py-6 text-center">All caught up. No reviews need replies right now.</p>
            )}
            {pendingNegative.map((r) => (
              <ReviewRow key={r.id} review={r} onClick={() => navigate(`/app/inbox?focus=${r.id}`)} highlight />
            ))}
            {unreplied
              .filter((r) => r.rating > 3)
              .slice(0, 4)
              .map((r) => (
                <ReviewRow key={r.id} review={r} onClick={() => navigate(`/app/inbox?focus=${r.id}`)} />
              ))}
          </div>
        </Card>

        {/* Recent activity */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-cream">Review flow</h2>
            <Button onClick={() => navigate('/app/inbox')} variant="ghost" className="py-1.5 text-xs">
              Open inbox <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          {state.replies.length === 0 ? (
            <p className="mt-4 text-sm text-slate">No replies yet. Open a review and let the AI draft your first response.</p>
          ) : (
            <div className="mt-4 space-y-2.5">
              {[...state.replies]
                .sort((a, b) => b.ts.localeCompare(a.ts))
                .slice(0, 6)
                .map((rep) => (
                  <div key={rep.id} className="flex items-start gap-3 rounded-lg border border-line bg-ink/40 p-3">
                    <span className={`mt-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${rep.method === 'ai' ? 'bg-neon/15 text-neon' : 'bg-slate/15 text-slate'}`}>
                      {rep.method}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-cream">{rep.author}</div>
                      <div className="truncate text-xs text-slate">{rep.text}</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, sub, accent = 'neon' }: { label: string; value: string; icon: React.ReactNode; sub: string; accent?: 'neon' | 'amber' | 'red' | 'blue' }) {
  const colors = {
    neon: 'text-neon border-neon/25',
    amber: 'text-amber border-amber/25',
    red: 'text-red border-red/25',
    blue: 'text-blue-300 border-blue-300/25',
  } as const;
  return (
    <Card className={`p-4 md:p-5 ${colors[accent]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-extrabold text-cream md:text-3xl">{value}</div>
      <div className="mt-1 text-xs text-slate/80">{sub}</div>
    </Card>
  );
}

export function ReviewRow({ review, onClick, highlight = false }: { review: { id: string; rating: number; author: string; text: string; platform: string; createdAt: string; replied: boolean }; onClick: () => void; highlight?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border p-3 text-left transition-all hover:border-neon/40 ${
        highlight ? 'border-red/40 bg-red/[0.06]' : 'border-line bg-ink/40'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-sm font-medium text-cream">{review.author}</span>
          <Stars rating={review.rating} size={11} />
        </div>
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${review.replied ? 'bg-neon/15 text-neon' : 'bg-amber/15 text-amber'}`}>
          {review.replied ? 'Replied' : 'Open'}
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs text-slate">{review.text}</p>
    </button>
  );
}
