import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Input, Logo } from '../components/ui';
import { CURRENT_MONTH, FREE_REPLY_LIMIT } from '../lib/data';
import { LogOut, KeyRound, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { state, setState, logout } = useApp();
  const [saved, setSaved] = useState(false);

  if (!state) return null;
  const pro = state.plan === 'pro';

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const setProfile = (patch: Partial<typeof state.profile>) =>
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));

  const setSettings = (patch: Partial<typeof state.settings>) =>
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));

  const upgrade = () => {
    if (window.confirm('Upgrade to Pro for $29/month? (Demo: toggles instantly)')) {
      setState((s) => ({ ...s, plan: 'pro' }));
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-5 md:p-8">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-0.5 text-sm text-slate">Business profile, AI configuration, and plan.</p>

      <div className="mt-6 space-y-4">
        {/* Plan */}
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-cream">Plan</h2>
              <p className="mt-0.5 text-xs text-slate">
                {pro ? 'Pro · unlimited replies' : `Free · ${state.usage.repliesUsed}/${FREE_REPLY_LIMIT} replies used in ${CURRENT_MONTH}`}
              </p>
            </div>
            {pro ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-neon/15 px-3 py-2 text-sm font-bold text-neon">
                <CheckCircle2 className="h-4 w-4" /> Active
              </span>
            ) : (
              <Button onClick={upgrade} className="py-2">Upgrade to Pro · $29/mo</Button>
            )}
          </div>
          {!pro && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-neon" style={{ width: `${Math.min(100, (state.usage.repliesUsed / FREE_REPLY_LIMIT) * 100)}%` }} />
            </div>
          )}
        </Card>

        {/* Business profile */}
        <Card className="p-5">
          <h2 className="font-semibold text-cream">Business profile</h2>
          <p className="mt-0.5 text-xs text-slate">Used by the AI to write replies in your voice.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Business name" value={state.profile.businessName} onChange={(v) => setProfile({ businessName: v })} />
            <Input label="Owner name" value={state.profile.ownerName} onChange={(v) => setProfile({ ownerName: v })} />
            <Input label="Industry" value={state.profile.niche} onChange={(v) => setProfile({ niche: v })} />
            <Input label="City" value={state.profile.city} onChange={(v) => setProfile({ city: v })} />
            <Input label="Google Business Profile URL" value={state.profile.gbMapsUrl} onChange={(v) => setProfile({ gbMapsUrl: v })} className="sm:col-span-2" />
            <Input label="Website" value={state.profile.website} onChange={(v) => setProfile({ website: v })} className="sm:col-span-2" />
            <Input label="Phone" value={state.profile.phone} onChange={(v) => setProfile({ phone: v })} />
            <Input label="Email" value={state.profile.email} onChange={(v) => setProfile({ email: v })} />
            <div className="sm:col-span-2 grid gap-4 sm:grid-cols-3">
              <Field label="Tone">
                <select value={state.profile.aiTone} onChange={(e) => setProfile({ aiTone: e.target.value as any })} className="w-full rounded-lg border border-line bg-ink/60 px-3 py-2.5 text-sm text-cream focus:border-neon/60 focus:outline-none">
                  <option value="formal">Formal</option>
                  <option value="warm">Warm</option>
                  <option value="friendly">Friendly</option>
                </select>
              </Field>
              <Field label="Length">
                <select value={state.profile.aiLength} onChange={(e) => setProfile({ aiLength: e.target.value as any })} className="w-full rounded-lg border border-line bg-ink/60 px-3 py-2.5 text-sm text-cream focus:border-neon/60 focus:outline-none">
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="detailed">Detailed</option>
                </select>
              </Field>
              <Input label="Sign-off" value={state.profile.signOff} onChange={(v) => setProfile({ signOff: v })} />
            </div>
          </div>
        </Card>

        {/* AI settings */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-cream">AI configuration</h2>
              <p className="mt-0.5 text-xs text-slate">Bring your own Anthropic API key. Keys are stored only in your browser.</p>
            </div>
            <KeyRound className="h-5 w-5 text-slate" />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Anthropic API key" type="password" value={state.settings.apiKey} onChange={(v) => setSettings({ apiKey: v })} placeholder="sk-ant-…" mono />
            <Input label="Model" value={state.settings.model} onChange={(v) => setSettings({ model: v })} mono />
            <Input label="Endpoint" value={state.settings.endpoint} onChange={(v) => setSettings({ endpoint: v })} mono />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate/80">
            No key? The app falls back to template replies so you can still review and publish. Add a key to enable real AI replies. Get one at console.anthropic.com.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={save} className="py-2">Save settings</Button>
            {saved && <span className="text-sm text-neon">Saved ✓</span>}
          </div>
        </Card>

        {/* Notification monitors */}
        <Card className="p-5">
          <h2 className="font-semibold text-cream">Notification monitors</h2>
          <p className="mt-0.5 text-xs text-slate">Local alerts for new reviews and rating drops.</p>
          <div className="mt-4 space-y-2.5">
            {state.monitors.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border border-line bg-ink/40 p-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-cream">{m.title}</div>
                  <div className="truncate text-xs text-slate">{m.description}</div>
                </div>
                <button
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      monitors: s.monitors.map((x) => (x.id === m.id ? { ...x, enabled: !x.enabled } : x)),
                    }))
                  }
                  className={`ml-3 shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${m.enabled ? 'bg-neon/15 text-neon' : 'bg-line/60 text-slate'}`}
                >
                  {m.enabled ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="p-5 border-red/30">
          <h2 className="font-semibold text-red">Data</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              onClick={() => { if (window.confirm('Clear all data for this workspace? This cannot be undone.')) { setState((s) => ({ ...s, reviews: [], replies: [], usage: { month: CURRENT_MONTH, repliesUsed: 0, draftsUsed: 0 } })); } }}
              variant="danger"
              className="py-2"
            >
              Clear workspace data
            </Button>
            <Button onClick={() => { logout(); window.location.href = '/'; }} variant="ghost" className="py-2">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate">{label}</span>
      {children}
    </label>
  );
}
