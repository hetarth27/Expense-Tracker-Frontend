import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

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

interface FontContextType {
  activeFont: FontPresetId;
  fonts: FontPreset[];
  setActiveFont: (fontId: FontPresetId) => void;
}

const STORAGE_KEY = 'font-preset';

const FONT_PRESETS: FontPreset[] = [
  {
    id: 'modern',
    label: 'Modern',
    sans: '"DM Sans"',
    display: '"Syne"',
    mono: '"JetBrains Mono"',
  },
  {
    id: 'editorial',
    label: 'Editorial',
    sans: '"Plus Jakarta Sans"',
    display: '"Fraunces"',
    mono: '"IBM Plex Mono"',
  },
  {
    id: 'geometric',
    label: 'Geometric',
    sans: '"Manrope"',
    display: '"Space Grotesk"',
    mono: '"Fira Code"',
  },
  {
    id: 'google-sans',
    label: 'Google Sans',
    sans: '"Google Sans", "Product Sans", "Inter"',
    display: '"Space Grotesk"',
    mono: '"JetBrains Mono"',
  },
  {
    id: 'open-sans',
    label: 'Open Sans',
    sans: '"Open Sans"',
    display: '"Fraunces"',
    mono: '"IBM Plex Mono"',
  },
  {
    id: 'inter',
    label: 'Inter',
    sans: '"Inter"',
    display: '"Syne"',
    mono: '"JetBrains Mono"',
  },
  {
    id: 'work-sans',
    label: 'Work Sans',
    sans: '"Work Sans"',
    display: '"Space Grotesk"',
    mono: '"Fira Code"',
  },
];

const FontContext = createContext<FontContextType | null>(null);

const isFontPresetId = (value: string | null): value is FontPresetId =>
  FONT_PRESETS.some((preset) => preset.id === value);

const getInitialFont = (): FontPresetId => {
  if (typeof window === 'undefined') return 'modern';

  const storedFont = window.localStorage.getItem(STORAGE_KEY);
  return isFontPresetId(storedFont) ? storedFont : 'modern';
};

export const FontProvider = ({ children }: { children: ReactNode }) => {
  const [activeFont, setActiveFont] = useState<FontPresetId>(getInitialFont);

  useEffect(() => {
    const root = document.documentElement;
    const preset = FONT_PRESETS.find((font) => font.id === activeFont) ?? FONT_PRESETS[0];

    root.dataset.font = preset.id;
    root.style.setProperty('--font-sans', `${preset.sans}, sans-serif`);
    root.style.setProperty('--font-display', `${preset.display}, sans-serif`);
    root.style.setProperty('--font-mono', `${preset.mono}, monospace`);

    window.localStorage.setItem(STORAGE_KEY, preset.id);
  }, [activeFont]);

  return (
    <FontContext.Provider value={{ activeFont, fonts: FONT_PRESETS, setActiveFont }}>
      {children}
    </FontContext.Provider>
  );
};

export const useFont = (): FontContextType => {
  const context = useContext(FontContext);

  if (!context) {
    throw new Error('useFont must be used within FontProvider');
  }

  return context;
};
