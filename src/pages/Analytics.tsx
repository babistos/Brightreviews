import { useApp } from '../context/AppContext';
import { Card, Stars, Button } from '../components/ui';
import { Download } from 'lucide-react';

export default function Analytics() {
  const { state } = useApp();
  if (!state) return null;
  const reviews = state.reviews;
  const replies = state.replies;

  const total = reviews.length;
  const replied = reviews.filter((r) => r.replied);
  const negative = reviews.filter((r) => r.rating <= 3);
  const negReplied = negative.filter((r) => r.replied);
  const coverage = total ? Math.round((replied.length / total) * 100) : 0;
  const negCoverage = negative.length ? Math.round((negReplied.length / negative.length) * 100) : 100;
  const avgRating = total ? reviews.reduce((a, r) => a + r.rating, 0) / total : 0;

  const platformStats = ['Google', 'Yelp', 'Facebook', 'Bing', 'Trustpilot']
    .map((p) => {
      const list = reviews.filter((r) => r.platform === p);
      return { p, n: list.length, r: list.filter((x) => x.replied).length, avg: list.length ? list.reduce((a, x) => a + x.rating, 0) / list.length : 0 };
    })
    .filter((x) => x.n > 0);

  const ratingDist = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews.filter((r) => r.rating === s).length }));
  const maxDist = Math.max(1, ...ratingDist.map((d) => d.n));

  // Revenue forecast: est. cost per reply avoided ($29/plan vs hours).
  // Assume $/hire hour $15, 4 min/reply manual -> $1/reply. Avg job value $130. reply lift 12%.
  const jobsPerMonth = Math.max(4, Math.round(total * 0.12));
  const manualCost = replied.length * 1.0;
  const aiCost = state.plan === 'pro' ? 0.02 : 0.05;
  const aiSpend = replied.length * aiCost;
  const revImpact = replied.length * (jobsPerMonth * 0.004) * 130;

  const downloadCsv = () => {
    const rows = [
      ['Review ID', 'Rating', 'Platform', 'Author', 'Created', 'Replied', 'Reply text'],
      ...reviews.map((r) => [r.id, String(r.rating), r.platform, r.author, r.createdAt, r.replied ? 'yes' : 'no', r.editedReply ? r.editedReply.replace(/\n/g, ' ') : '']),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reviews.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-0.5 text-sm text-slate">Reputation and reply performance for {state.profile.businessName || 'your business'}</p>
        </div>
        <Button onClick={downloadCsv} variant="ghost" className="py-2"><Download className="h-4 w-4" /> Export CSV</Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 md:gap-4">
        <Stat label="Average rating" value={avgRating.toFixed(1)} sub={`${negative.length} reviews ≤3★`} />
        <Stat label="Reply coverage" value={`${coverage}%`} sub={`${replied.length}/${total} replied`} />
        <Stat label="Negative review coverage" value={`${negCoverage}%`} sub={`${negReplied.length}/${negative.length}`} accent={negCoverage < 100 ? 'red' : 'neon'} />
        <Stat label="Est. revenue impact" value={`$${Math.round(revImpact)}`} sub="vs. replies not answered" accent="neon" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Rating distribution */}
        <Card className="p-5">
          <h2 className="font-semibold text-cream">Rating distribution</h2>
          <div className="mt-4 space-y-2.5">
            {ratingDist.map((d) => (
              <div key={d.s} className="flex items-center gap-3">
                <span className="w-10 text-xs text-slate">{d.s}★</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
                  <div className={`h-full rounded-full ${d.s >= 4 ? 'bg-neon' : d.s === 3 ? 'bg-amber' : 'bg-red'}`} style={{ width: `${(d.n / maxDist) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-xs text-slate">{d.n}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Platform breakdown */}
        <Card className="p-5">
          <h2 className="font-semibold text-cream">By platform</h2>
          {platformStats.length === 0 ? (
            <p className="mt-4 text-sm text-slate">No reviews yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {platformStats.map((x) => (
                <div key={x.p} className="flex items-center justify-between rounded-lg border border-line bg-ink/40 px-3 py-2.5">
                  <span className="text-sm font-medium text-cream">{x.p}</span>
                  <div className="flex items-center gap-3 text-xs text-slate">
                    <Stars rating={x.avg} size={11} />
                    <span>{x.r}/{x.n} replied</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ROI model */}
      <Card className="mt-4 p-5">
        <h2 className="font-semibold text-cream">Estimated reply ROI</h2>
        <p className="mt-1 text-xs text-slate">Illustrative model — assumes $15/hr labor, ~4 min/reply manual, avg job value $130, replies lift bookings ~0.4% of monthly jobs.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MiniStat label="Replies sent" value={String(replied.length)} />
          <MiniStat label="Time saved vs manual" value={`${(replied.length * 4 / 60).toFixed(1)} hrs`} />
          <MiniStat label="Est. labor cost avoided" value={`$${manualCost.toFixed(0)}`} />
          <MiniStat label="Est. revenue impact" value={`$${Math.round(revImpact)}`} accent />
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, sub, accent = 'neon' }: { label: string; value: string; sub: string; accent?: 'neon' | 'red' }) {
  return (
    <Card className="p-4">
      <div className="text-xs font-medium text-slate">{label}</div>
      <div className={`mt-1.5 text-2xl font-extrabold ${accent === 'red' ? 'text-red' : 'text-cream'}`}>{value}</div>
      <div className="mt-0.5 text-xs text-slate/80">{sub}</div>
    </Card>
  );
}

function MiniStat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-ink/40 p-3">
      <div className="text-[11px] text-slate">{label}</div>
      <div className={`mt-1 text-lg font-bold ${accent ? 'text-neon' : 'text-cream'}`}>{value}</div>
    </div>
  );
}
