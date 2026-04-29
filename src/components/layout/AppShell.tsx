import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuthSession, getStoredUser } from '../../utils/authSession';

type Theme = 'light' | 'dark';
type FontPresetId =
  | 'modern'
  | 'editorial'
  | 'geometric'
  | 'google-sans'
  | 'open-sans'
  | 'inter'
  | 'work-sans';

interface FontPreset {
  id: FontPresetId;
  label: string;
  sans: string;
  display: string;
  mono: string;
}

const THEME_KEY = 'theme';
const FONT_KEY = 'font-preset';

const FONT_PRESETS: FontPreset[] = [
  { id: 'modern', label: 'Modern', sans: '"DM Sans"', display: '"Syne"', mono: '"JetBrains Mono"' },
  { id: 'editorial', label: 'Editorial', sans: '"Plus Jakarta Sans"', display: '"Fraunces"', mono: '"IBM Plex Mono"' },
  { id: 'geometric', label: 'Geometric', sans: '"Manrope"', display: '"Space Grotesk"', mono: '"Fira Code"' },
  { id: 'google-sans', label: 'Google Sans', sans: '"Google Sans", "Product Sans", "Inter"', display: '"Space Grotesk"', mono: '"JetBrains Mono"' },
  { id: 'open-sans', label: 'Open Sans', sans: '"Open Sans"', display: '"Fraunces"', mono: '"IBM Plex Mono"' },
  { id: 'inter', label: 'Inter', sans: '"Inter"', display: '"Syne"', mono: '"JetBrains Mono"' },
  { id: 'work-sans', label: 'Work Sans', sans: '"Work Sans"', display: '"Space Grotesk"', mono: '"Fira Code"' },
];

const isFontPresetId = (value: string | null): value is FontPresetId =>
  FONT_PRESETS.some((preset) => preset.id === value);

const getInitialTheme = (): Theme => {
  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialFont = (): FontPresetId => {
  const storedFont = localStorage.getItem(FONT_KEY);
  return isFontPresetId(storedFont) ? storedFont : 'modern';
};

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/expenses',
    label: 'Expenses',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    to: '/budgets',
    label: 'Budgets',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const AppearanceMenu = () => {
  const [open, setOpen] = useState(false);
  const [activeFont, setActiveFont] = useState<FontPresetId>(getInitialFont);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark');
    root.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const preset = FONT_PRESETS.find((font) => font.id === activeFont) ?? FONT_PRESETS[0];

    root.dataset.font = preset.id;
    root.style.setProperty('--font-sans', `${preset.sans}, sans-serif`);
    root.style.setProperty('--font-display', `${preset.display}, sans-serif`);
    root.style.setProperty('--font-mono', `${preset.mono}, monospace`);
    localStorage.setItem(FONT_KEY, preset.id);
  }, [activeFont]);

  useEffect(() => {
    if (localStorage.getItem(THEME_KEY)) return undefined;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setTheme(mediaQuery.matches ? 'dark' : 'light');

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-xl border border-surface-700/50 bg-surface-900/80 px-3 py-2 text-sm text-slate-300 transition-all duration-150 hover:bg-surface-800 hover:text-white"
        aria-label="Open appearance settings"
        aria-expanded={open}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.5 12a7.5 7.5 0 0012.46 5.672l1.693 1.692a1.5 1.5 0 002.121-2.121l-1.692-1.693A7.5 7.5 0 1012 4.5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8.25v7.5M8.25 12h7.5" />
        </svg>
        <span className="hidden sm:inline">Settings</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+0.75rem)] z-[9999] w-72 max-w-[calc(100vw-1.5rem)] -translate-x-2 rounded-2xl border border-surface-700/50 p-3 shadow-2xl shadow-black/20"
          style={{
            backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
          }}
        >
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Appearance
            </p>
            <h3 className="mt-1 font-display text-base font-bold text-white">
              Quick settings
            </h3>
          </div>

          <div className="mb-3 rounded-2xl border border-surface-700/50 bg-surface-800/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Theme mode</p>
                <p className="text-xs text-slate-500">
                  Light or dark
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
                className="inline-flex items-center gap-2 rounded-xl border border-surface-700/50 bg-surface-900/80 px-3 py-2 text-sm text-slate-300 transition-all duration-150 hover:bg-surface-800 hover:text-white"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3v2.25m0 13.5V21m9-9h-2.25M5.25 12H3m15.114 6.364l-1.591-1.591M7.477 7.477 5.886 5.886m12.228 0l-1.591 1.591M7.477 16.523l-1.591 1.591M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0Z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 12.79A9 9 0 1111.21 3a7.5 7.5 0 009.79 9.79Z" />
                  </svg>
                )}
                <span className="capitalize">{theme}</span>
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2">
              <p className="text-sm font-medium text-white">Fonts</p>
              <p className="text-xs text-slate-500">
                Choose your text style
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <select
                value={activeFont}
                onChange={(event) => setActiveFont(event.target.value as typeof activeFont)}
                className="input pr-10 text-sm"
                aria-label="Select font preset"
              >
                {FONT_PRESETS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.label}
                  </option>
                ))}
              </select>

              {FONT_PRESETS.map((font) => {
                if (activeFont !== font.id) return null;

                return (
                  <div
                    key={font.id}
                    className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-3 py-3 text-left text-brand-400"
                  >
                    <span
                      className="block text-sm font-semibold"
                      style={{ fontFamily: `${font.display}, sans-serif` }}
                    >
                      {font.label}
                    </span>
                    <span
                      className="mt-1 block text-xs"
                      style={{ fontFamily: `${font.sans}, sans-serif` }}
                    >
                      Aa The quick brown fox jumps over the budget.
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const user = getStoredUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login');
  };

  return (
    <aside className="flex flex-col h-full w-64 bg-surface-900/90 backdrop-blur-sm border-r border-surface-700/50 p-4">
      <div className="flex items-center gap-3 px-2 py-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center text-white font-display font-bold text-lg shadow-lg shadow-brand-500/30">
          S
        </div>
        <span className="font-display text-xl font-bold text-white">Spendly</span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-surface-800'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-surface-700/50">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.name.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name ?? 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email ?? ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 flex">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-x-hidden overflow-y-visible">
        <header className="relative z-40 overflow-visible flex items-center gap-3 px-4 py-3 lg:px-8 lg:py-5 border-b border-surface-700/50 bg-surface-900/80 backdrop-blur-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl hover:bg-surface-800 text-slate-400 lg:hidden"
            aria-label="Open navigation menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="min-w-0 flex-1">
            <span className="font-display text-lg font-bold text-white lg:hidden">Spendly</span>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Workspace
              </p>
              <h2 className="font-display text-xl font-bold text-white">
                Spendly control center
              </h2>
            </div>
          </div>

          <AppearanceMenu />
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
