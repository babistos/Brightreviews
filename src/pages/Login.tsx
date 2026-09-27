import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo, Button, Input, Card } from '../components/ui';
import { useApp } from '../context/AppContext';
import { registerFamily, topFamilies } from '../lib/store';

export default function Login() {
  const { setDetail, state, setState } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'auth' | 'profile'>('auth');

  const doAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    registerFamily(name || email.split('@')[0]);
    setDetail(email);
    setStep('profile');
    // find out if we have a state after reload; if onboarded skip to app
  };

  useEffect(() => {
    if (state?.onboarded) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [state?.onboarded, navigate]);

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="w-full max-w-md">
          <Card className="p-8">
            <Logo />
            <p className="mt-6 text-sm text-slate">Loading your workspace…</p>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'auth') {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <Logo />
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Welcome</h1>
            <p className="mt-1 text-sm text-slate">One email to start. No password needed.</p>
          </div>
          <Card className="p-6">
            <form onSubmit={doAuth} className="space-y-4">
              <Input label="Your name" value={name} onChange={setName} placeholder="Sam from Acme Plumbing" />
              <Input label="Work email" type="email" value={email} onChange={setEmail} placeholder="sam@acmeplumbing.com" />
              <Button type="submit" className="w-full" disabled={!email.trim()}>Continue</Button>
            </form>
            <p className="mt-4 text-center text-xs text-slate/70">Your data stays in your browser. We never see it.</p>
          </Card>
          <div className="mt-6 text-center text-xs text-slate/60">
            <p>Are you one of the first 12 customers? Founding accounts get Pro free for a year.</p>
            <p className="mt-1 text-neon">Registered families on this device: {topFamilies(5).length > 0 ? topFamilies(5).map((f) => `${f.family} (${f.count})`).join(', ') : 'none yet'}</p>
          </div>
        </div>
      </div>
    );
  }

  // profile step
  const setProfile = (patch: Partial<typeof state.profile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  };

  const finish = (e: React.FormEvent) => {
    e.preventDefault();
    setState((s) => ({ ...s, onboarded: true }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Tell us about your business</h1>
          <p className="mt-1 text-sm text-slate">This teaches the AI your voice. Everything is editable later.</p>
        </div>
        <Card className="p-6">
          <form onSubmit={finish} className="grid gap-4 sm:grid-cols-2">
            <Input label="Business name" value={state.profile.businessName} onChange={(v) => setProfile({ businessName: v })} placeholder="Acme Plumbing & Heating" />
            <Input label="Owner name (optional)" value={state.profile.ownerName} onChange={(v) => setProfile({ ownerName: v })} placeholder="Sam Rivera" />
            <Input label="Industry" value={state.profile.niche} onChange={(v) => setProfile({ niche: v })} placeholder="Plumbing & HVAC" />
            <Input label="City" value={state.profile.city} onChange={(v) => setProfile({ city: v })} placeholder="Austin" />
            <Input label="Google Business Profile URL" value={state.profile.gbMapsUrl} onChange={(v) => setProfile({ gbMapsUrl: v })} placeholder="https://maps.google.com/?cid=…" className="sm:col-span-2" />
            <Input label="Website" value={state.profile.website} onChange={(v) => setProfile({ website: v })} placeholder="https://…" className="sm:col-span-2" />
            <div className="sm:col-span-2 grid gap-4 sm:grid-cols-3">
              <select
                value={state.profile.aiTone}
                onChange={(e) => setProfile({ aiTone: e.target.value as any })}
                className="rounded-lg border border-line bg-ink/60 px-3 py-2.5 text-sm text-cream focus:border-neon/60 focus:outline-none"
              >
                <option value="formal">Formal</option>
                <option value="warm">Warm</option>
                <option value="friendly">Friendly</option>
              </select>
              <select
                value={state.profile.aiLength}
                onChange={(e) => setProfile({ aiLength: e.target.value as any })}
                className="rounded-lg border border-line bg-ink/60 px-3 py-2.5 text-sm text-cream focus:border-neon/60 focus:outline-none"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="detailed">Detailed</option>
              </select>
              <Input label="Sign-off" value={state.profile.signOff} onChange={(v) => setProfile({ signOff: v })} placeholder="— The Team" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full">Start using BrightReviews</Button>
            </div>
          </form>
        </Card>
        <p className="mt-4 text-center text-xs text-slate/60">You can edit all of this anytime in Settings.</p>
      </div>
    </div>
  );
}
