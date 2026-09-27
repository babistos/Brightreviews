import type { ReactNode } from 'react';

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-[1px]" aria-label={`${rating} stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= full ? '#f5b23c' : 'none'} stroke={i <= full ? '#f5b23c' : '#4a5c52'} strokeWidth={1.6}>
          <path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9L12 3.6z" />
        </svg>
      ))}
    </span>
  );
}

export function PlatformBadge({ platform }: { platform: string }) {
  const colors: Record<string, string> = {
    Google: 'bg-[#1a2a20] text-blue-300 border-blue-900/50',
    Yelp: 'bg-[#241a1a] text-red-300 border-red-900/50',
    Facebook: 'bg-[#16202b] text-blue-300 border-blue-900/50',
    Bing: 'bg-[#1a2420] text-teal-300 border-teal-900/50',
    Trustpilot: 'bg-[#1f2416] text-lime-300 border-lime-900/50',
  };
  const cls = colors[platform] || 'bg-panel2 text-slate border-line';
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${cls}`}>
      {platform}
    </span>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-line bg-panel/80 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'amber';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-neon/60 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]';
  const styles = {
    primary: 'bg-neon text-ink hover:bg-[#5ceaa7] shadow-[0_0_20px_rgba(70,227,155,0.25)]',
    ghost: 'border border-line2 text-slate hover:border-neon/50 hover:text-cream bg-transparent',
    danger: 'bg-red/15 text-red border border-red/30 hover:bg-red/25',
    amber: 'bg-amber/15 text-amber border border-amber/30 hover:bg-amber/25',
  } as const;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  mono = false,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  mono?: boolean;
}) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-xs font-medium text-slate">{label}</span>}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border border-line bg-ink/60 px-3 py-2.5 text-sm text-cream placeholder:text-slate/40 focus:border-neon/60 focus:outline-none focus:ring-1 focus:ring-neon/30 ${mono ? 'font-mono text-xs' : ''}`}
      />
    </label>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="1" y="1" width="30" height="30" rx="8" fill="#46e39b" />
        <path d="M9 22V14M16 22V9M23 22v-5" stroke="#0c1512" strokeWidth="3.4" strokeLinecap="round" />
      </svg>
      <span className="font-bold tracking-tight text-cream">BrightReviews</span>
    </span>
  );
}
