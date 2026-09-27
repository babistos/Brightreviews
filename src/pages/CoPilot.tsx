import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button } from '../components/ui';
import { Sparkles } from 'lucide-react';

export default function CoPilot() {
  const { state } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  if (!state) return null;
  const pro = state.plan === 'pro';
  const repliesUsed = state.usage.repliesUsed;
  const hasKey = state.settings.apiKey.trim().length > 0;

  const canUse = pro || hasKey || true; // template copilot available to all

  const ask = async () => {
    const q = input.trim();
    if (!q || thinking) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setThinking(true);
    try {
      const reply = await copilotReply(state, q);
      setMessages((m) => [...m, { role: 'ai', text: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'ai', text: `Error: ${e instanceof Error ? e.message : e}` }]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col p-5 md:p-8" style={{ height: 'calc(100vh - 0px)' }}>
      <h1 className="text-2xl font-bold tracking-tight">Copilot</h1>
      <p className="mt-0.5 text-sm text-slate">Ask anything about your business, your reviews, and your reputation.</p>

      <Card className="mt-4 flex flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Sparkles className="h-8 w-8 text-neon" />
              <p className="mt-3 max-w-sm text-sm text-slate">
                Try asking: "Draft a reply for a 1-star review about a late service" or "Summarize my review sentiment."
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl p-4 text-sm leading-relaxed ${
                m.role === 'user' ? 'bg-neon/15 text-cream' : 'border border-line bg-ink/50 text-cream/90'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-line bg-ink/50 p-4 text-sm text-slate">Thinking…</div>
            </div>
          )}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); ask(); }}
          className="flex items-center gap-2 border-t border-line p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your reviews…"
            className="flex-1 rounded-lg border border-line bg-ink/60 px-4 py-3 text-sm text-cream placeholder:text-slate/40 focus:border-neon/60 focus:outline-none"
          />
          <Button type="submit" disabled={!input.trim() || thinking || !canUse} className="py-2.5">Send</Button>
        </form>
      </Card>
    </div>
  );
}

async function copilotReply(state: import('../lib/types').AppState, question: string): Promise<string> {
  const hasKey = state.settings.apiKey.trim().length > 0;
  if (!hasKey) {
    return `I'm the Business Copilot. I can answer questions about your reviews and draft replies once you add your Anthropic API key in Settings.\n\nRight now: you have ${state.reviews.filter((r) => !r.replied && !r.ignored).length} unreplied reviews, average rating ${state.reviews.length ? (state.reviews.reduce((a, r) => a + r.rating, 0) / state.reviews.length).toFixed(1) : '—'}, and ${state.replies.length} replies published.`;
  }
  const sys = `You are a concise business copilot for a local service business owner. Answer questions using only the provided business data. Be direct, practical, and specific. No fluff.`;
  const data = JSON.stringify({
    business: state.profile.businessName,
    industry: state.profile.niche,
    city: state.profile.city,
    reviews: state.reviews.map((r) => ({ rating: r.rating, platform: r.platform, author: r.author, text: r.text, replied: r.replied })),
    replies: state.replies.map((r) => ({ author: r.author, rating: r.rating, text: r.text, channel: r.channel })),
  }, null, 2);
  const resp = await fetch(state.settings.endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': state.settings.apiKey.trim(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: state.settings.model,
      max_tokens: 600,
      system: sys,
      messages: [{ role: 'user', content: `Business data:\n${data}\n\nQuestion: ${question}` }],
    }),
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error((json as any)?.error?.message || `HTTP ${resp.status}`);
  return (json as any)?.content?.[0]?.text || 'No response.';
}
