import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stars, Logo, Button } from '../components/ui';
import { useApp } from '../context/AppContext';

const EXAMPLES = [
  { name: 'A2 Plumbing & Heating', city: 'Austin, TX', rating: 4.6 },
  { name: 'GreenLeaf Pest Control', city: 'Denver, CO', rating: 4.8 },
  { name: 'SunCity HVAC Solutions', city: 'Phoenix, AZ', rating: 4.4 },
];

export default function Landing() {
  const { setDetail, setDemo } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDetail(email);
    navigate('/login');
  };

  const launchDemo = () => {
    setDemo();
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line/60 bg-ink/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-slate md:flex">
            <a href="#how" className="transition-colors hover:text-cream">How it works</a>
            <a href="#business" className="transition-colors hover:text-cream">Business model</a>
            <a href="#pricing" className="transition-colors hover:text-cream">Pricing</a>
          </nav>
          <Button onClick={launchDemo} className="px-4 py-2 text-xs">Try the demo</Button>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pb-12 pt-14 md:pt-20">
          <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-3.5 py-1.5 text-xs font-medium text-neon">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
                Free tier · No credit card required
              </div>
              <h1 className="text-4xl font-extrabold leading-[1.06] tracking-tight md:text-[3.4rem]">
                Reply to your reviews in seconds, not at 2 a.m.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate">
                BrightReviews listens to your Google, Yelp, and Facebook reviews and drafts on-brand, on-voice replies with AI — matching your tone, your length, and your sign-off. You review. It publishes.
              </p>
              <form onSubmit={submit} className="mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
                <input
                  id="email-field"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your work email"
                  className="flex-1 rounded-lg border border-line bg-panel px-4 py-3 text-sm text-cream placeholder:text-slate/50 focus:border-neon/60 focus:outline-none"
                />
                <Button type="submit">Get started free</Button>
              </form>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                <p className="text-xs text-slate/70">25 free replies / month · upgrade only when you need more</p>
                <button onClick={launchDemo} className="text-xs font-semibold text-neon hover:underline">
                  Try the live interactive demo →
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-line bg-panel p-5 shadow-2xl shadow-neon/5">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-neon/70" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate">review draft</span>
                </div>
                <div className="mt-4 space-y-4">
                  {EXAMPLES.slice(0, 2).map((biz) => (
                    <div key={biz.name} className="rounded-xl border border-line bg-ink/50 p-3.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-cream">{biz.name}</div>
                          <div className="text-xs text-slate">{biz.city}</div>
                        </div>
                        <Stars rating={biz.rating} size={12} />
                      </div>
                      <p className="mt-2 text-xs italic text-slate/90">"Great job on the whole kitchen remodel. Crew was on time, clean, and the final walkthrough was smooth."</p>
                      <div className="mt-3 rounded-lg border-l-2 border-neon bg-neon/[0.06] p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-neon">Draft reply · auto</div>
                        <p className="mt-1 text-xs text-cream/90">Thank you, Marcus — genuinely appreciated. We're glad the final walkthrough went smoothly; please pass this to friends who need reliable local help. — The Team</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Set up in under 2 minutes</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { n: '01', t: 'Tell us your business', d: 'Name, industry, city, and how you write when you reply to a customer. Your AI learns your voice from this.' },
              { n: '02', t: 'Connect your profiles', d: 'Add your Google Business Profile. Watch new reviews arrive as they post, across Google, Yelp, and Facebook.' },
              { n: '03', t: 'Approve & publish', d: 'Approve the AI draft, tweak it, or let auto-reply publish it after a delay. Public replies go up where the review lives.' },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-line bg-panel p-6">
                <div className="font-mono text-sm font-bold text-neon">{s.n}</div>
                <h3 className="mt-3 font-semibold text-cream">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-line/60 bg-panel/40">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Why local businesses ignore reviews</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                { t: 'Small teams', d: 'A 2-person shop can get 5-10 reviews a month. There is no time to read, write, and post each reply.' },
                { t: 'Big incumbents', d: 'Birdeye, BrightLocal and NiceJob charge $39-$450 per month per location, often on annual contracts.' },
                { t: 'Voice matters', d: 'A generic "we apologize" reads as robotic. Customers want replies that sound like the owner.' },
                { t: 'Reputation compounds', d: 'Reviews are the top trust signal for local search. Unanswered negative reviews drag your rating and bookings.' },
              ].map((c) => (
                <div key={c.t} className="rounded-xl border border-line bg-ink/50 p-5">
                  <h3 className="font-semibold text-cream">{c.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="business" className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">The business model</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate">Built to reach $50,000/month in subscription revenue with no upfront capital spend.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <ModelCard t="Who it's for" body="Solo owners and 2-person teams at local service businesses (plumbing, HVAC, pest control, roofing). They get 3-10 reviews a month and can't afford Birdeye ($300-450/mo per location) or BrightLocal." />
            <ModelCard t="The problem" body="Unanswered and unreplied reviews drag average ratings down, push competitors up local search rankings, and waste owner time writing generic replies at 2 a.m." />
            <ModelCard t="The product" body="AI reply drafting that matches your tone, length, and sign-off — plus review monitoring, Google Business Profile sync, and ROI forecasting. You approve, it publishes." />
            <ModelCard t="Pricing" body="Free for 25 replies/month. Pro at $29/month, unlimited replies, auto-reply publishing, ROI forecasting, and weekly digests. Zero upfront cost to start." />
          </div>

          <div className="mt-6 rounded-xl border border-neon/30 bg-neon/[0.05] p-6">
            <h3 className="font-bold text-neon">Path to $50,000/month</h3>
            <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
              <MathStep n="1 · Price" v="$29/mo Pro" d="Pro customers who pick the plan once past 25 replies. Blended real-world price ≈ $24/mo after free-tier base." />
              <MathStep n="2 · Customers" v="≈ 2,100 customers" d="2,100 × $24 blended ≈ $50,400 MRR (50k ÷ 24). Growth is outbound-first: Founding Tier pricing to the first 12 customers, then open signup." />
              <MathStep n="3 · Engine" v="Zero-capital distribution" d="Local owner cold-outreach (DMs, communities, fair stands) + free tier as the top of funnel. AI does the drafting, so CAC approaches ~$0/customer." />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate/80">
              Honest caveat: $50k MRR is a real stretch goal, not a promise. Free-tier conversion of 8-15% is assumed; if conversion lands near 5%, the $50k target moves to ~3,400 customers. Path goes: $5k MRR (~250 Pro customers) in month 6-9, $15k (~750) by month 12-15, then scale outbound volume.
            </p>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Simple pricing</h2>
          <p className="mt-2 text-sm text-slate">Start free. Pay only when you reply to more than 25 reviews in a month.</p>
          <div className="mt-8 grid max-w-3xl gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-line bg-panel p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-cream">Free</h3>
                <div className="text-3xl font-extrabold text-cream">$0<span className="text-sm font-normal text-slate">/mo</span></div>
              </div>
              <ul className="mt-5 space-y-2.5 text-sm text-slate">
                <li className="flex gap-2"><span className="text-neon">✓</span>AI replies matching your tone & length</li>
                <li className="flex gap-2"><span className="text-neon">✓</span>25 replies / month</li>
                <li className="flex gap-2"><span className="text-neon">✓</span>Google Business Profile sync</li>
                <li className="flex gap-2"><span className="text-neon">✓</span>Review monitoring & unreplied alerts</li>
                <li className="flex gap-2 text-slate/50"><span>—</span>Unlimited replies</li>
                <li className="flex gap-2 text-slate/50"><span>—</span>Auto-reply publishing</li>
                <li className="flex gap-2 text-slate/50"><span>—</span>ROI & revenue forecasting</li>
              </ul>
              <Button onClick={launchDemo} variant="ghost" className="mt-6 w-full">Try the interactive demo</Button>
            </div>
            <div className="relative rounded-xl border border-neon/50 bg-panel p-6">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-neon px-3 py-1 text-xs font-bold text-ink">Most popular</div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-cream">Pro</h3>
                <div className="text-3xl font-extrabold text-cream">$29<span className="text-sm font-normal text-slate">/mo</span></div>
              </div>
              <ul className="mt-5 space-y-2.5 text-sm text-slate">
                <li className="flex gap-2"><span className="text-neon">✓</span>Everything in Free</li>
                <li className="flex gap-2"><span className="text-neon">✓</span>Unlimited replies</li>
                <li className="flex gap-2"><span className="text-neon">✓</span>Auto-reply publishing</li>
                <li className="flex gap-2"><span className="text-neon">✓</span>ROI & revenue forecasting</li>
                <li className="flex gap-2"><span className="text-neon">✓</span>Weekly reputation digest</li>
                <li className="flex gap-2"><span className="text-neon">✓</span>Multi-location support</li>
              </ul>
              <Button onClick={launchDemo} className="mt-6 w-full">Start 14-day Pro trial (demo)</Button>
          </div>
          </div>
        </section>

        <section className="border-t border-line/60 bg-panel/30">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <h2 className="text-xl font-bold tracking-tight">Built for the businesses that can't afford Birdeye</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3 text-sm">
              {EXAMPLES.map((biz) => (
                <div key={biz.name} className="rounded-xl border border-line bg-ink/40 p-5">
                  <Stars rating={biz.rating} size={13} />
                  <p className="mt-3 text-slate">{biz.name} · {biz.city}</p>
                  <p className="mt-1 text-cream/80">"Reviews used to pile up unanswered. Drafts took 3x longer. Now I just hit approve."</p>
                  <p className="mt-2 text-xs text-slate/70">Founding user · Service business</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-slate/60 md:flex-row">
          <Logo size={22} />
          <p>Local review reply automation. Start free, upgrade when you save time.</p>
        </div>
      </footer>
    </div>
  );
}

function ModelCard({ t, body }: { t: string; body: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <h3 className="font-semibold text-cream">{t}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate">{body}</p>
    </div>
  );
}

function MathStep({ n, v, d }: { n: string; v: string; d: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate/80">{n}</div>
      <div className="mt-0.5 text-lg font-bold text-cream">{v}</div>
      <p className="mt-1 leading-relaxed text-slate">{d}</p>
    </div>
  );
}
