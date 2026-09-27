import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import CoPilot from './pages/CoPilot';
import { Logo } from './components/ui';
import {
  Inbox as InboxIcon,
  LayoutDashboard,
  BarChart3,
  Settings as SettingsIcon,
  Sparkles,
  LogOut,
} from 'lucide-react';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app/*" element={<AuthedApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

function AuthedApp() {
  const { account, state } = useApp();
  const navigate = useNavigate();

  if (!account || !state) {
    return <Navigate to="/login" replace />;
  }
  if (!state.onboarded && !(account as { demo?: boolean })?.demo) {
    return <Navigate to="/login" replace />;
  }

  return <Shell />;
}

function Shell() {
  const { state, account, logout } = useApp();
  const navigate = useNavigate();
  const [route, setRoute] = useState('/app/dashboard');
  const confirmed = window.confirm;

  if (!state) return null;

  const navItems = [
    { id: 'dashboard', path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', path: '/app/inbox', label: 'Reviews', icon: InboxIcon },
    { id: 'analytics', path: '/app/analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'copilot', path: '/app/copilot', label: 'Copilot', icon: Sparkles },
    { id: 'settings', path: '/app/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const onNav = (path: string) => {
    setRoute(path);
    navigate(path);
  };

  const onLogout = () => {
    if (window.confirm('Sign out of BrightReviews?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-panel/80 backdrop-blur-md md:flex">
        <div className="flex items-center justify-between px-5 py-4">
          <Logo size={26} />
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = route === item.path || route.startsWith(item.path);
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.path)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-neon/15 text-neon'
                    : 'text-slate hover:bg-panel2 hover:text-cream'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-line p-4">
          <div className="rounded-lg bg-ink/60 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate">Plan</span>
              <span className={`font-bold ${state.plan === 'pro' ? 'text-neon' : 'text-amber'}`}>
                {state.plan === 'pro' ? 'PRO' : 'FREE'}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-neon"
                style={{ width: state.plan === 'pro' ? '100%' : `${Math.min(100, (state.usage.repliesUsed / 25) * 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-slate/70">
              {state.plan === 'pro' ? 'Unlimited replies' : `${state.usage.repliesUsed}/25 free replies`}
            </p>
            {state.plan !== 'pro' && (
              <button
                onClick={() => onNav('/app/settings')}
                className="mt-2 w-full rounded-md bg-neon/15 py-1.5 text-xs font-semibold text-neon hover:bg-neon/25"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
          <button
            onClick={onLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate hover:bg-panel2 hover:text-cream"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-line bg-ink/85 px-4 py-3 backdrop-blur-md md:hidden">
        <Logo size={24} />
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = route === item.path || route.startsWith(item.path);
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.path)}
                className={`rounded-lg p-2 ${active ? 'bg-neon/15 text-neon' : 'text-slate hover:text-cream'}`}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 md:ml-60 md:pt-0 pt-16">
        <Routes>
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/inbox" element={<Inbox />} />
          <Route path="/app/analytics" element={<Analytics />} />
          <Route path="/app/copilot" element={<CoPilot />} />
          <Route path="/app/settings" element={<Settings />} />
          <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
