export type ThemeId = 'shadcn-dark' | 'shadcn-light' | 'vercel' | 'linear' | 'apple-glass' | 'raycast';

export const THEME_STORAGE_KEY = 'studypulse_ui_theme';

export interface UiThemeMeta {
  id: ThemeId;
  name: string;
  system: string;
  description: string;
  mono: boolean;
  light: boolean;
  preview: {
    bg: string;
    card: string;
    border: string;
    primary: string;
    primaryText: string;
    accent: string;
    text: string;
  };
  colors: {
    accent: string;
    accent2: string;
    track: string;
  };
}

export const UI_THEMES: UiThemeMeta[] = [
  {
    id: 'shadcn-dark',
    name: 'Shadcn Glass',
    system: 'shadcn/ui',
    description: 'Frosted zinc-950 glass, razor 1px hairlines & pure white CTAs.',
    mono: true,
    light: false,
    preview: {
      bg: '#09090b',
      card: 'rgba(24,24,27,0.82)',
      border: 'rgba(255,255,255,0.14)',
      primary: '#fafafa',
      primaryText: '#09090b',
      accent: '#e4e4e7',
      text: '#fafafa',
    },
    colors: {
      accent: '#fafafa',
      accent2: '#a1a1aa',
      track: 'rgba(255,255,255,0.08)',
    },
  },
  {
    id: 'shadcn-light',
    name: 'Shadcn Daylight',
    system: 'shadcn/ui Light',
    description: 'Crisp frosted white glass cards, slate hairlines & obsidian controls.',
    mono: true,
    light: true,
    preview: {
      bg: '#f4f4f5',
      card: 'rgba(255,255,255,0.9)',
      border: 'rgba(9,9,11,0.14)',
      primary: '#09090b',
      primaryText: '#fafafa',
      accent: '#27272a',
      text: '#09090b',
    },
    colors: {
      accent: '#18181b',
      accent2: '#71717a',
      track: 'rgba(9,9,11,0.09)',
    },
  },
  {
    id: 'vercel',
    name: 'Vercel Geist',
    system: 'Geist OLED',
    description: 'True #000000 OLED canvas, sharp 12px geometry & high-contrast ink.',
    mono: true,
    light: false,
    preview: {
      bg: '#000000',
      card: '#0c0c0c',
      border: 'rgba(255,255,255,0.18)',
      primary: '#ffffff',
      primaryText: '#000000',
      accent: '#ffffff',
      text: '#ededed',
    },
    colors: {
      accent: '#ffffff',
      accent2: '#888888',
      track: 'rgba(255,255,255,0.1)',
    },
  },
  {
    id: 'linear',
    name: 'Linear Carbon',
    system: 'Linear UI',
    description: 'Precision carbon dark glass with specular hairlines & cool silver-indigo.',
    mono: false,
    light: false,
    preview: {
      bg: '#08090a',
      card: 'rgba(18,19,24,0.85)',
      border: 'rgba(255,255,255,0.12)',
      primary: '#f7f8f8',
      primaryText: '#08090a',
      accent: '#818cf8',
      text: '#f7f8f8',
    },
    colors: {
      accent: '#c7d2fe',
      accent2: '#818cf8',
      track: 'rgba(255,255,255,0.08)',
    },
  },
  {
    id: 'apple-glass',
    name: 'Apple VisionOS',
    system: 'Spatial Glass',
    description: 'Thick 32px translucent titanium blur with luminous specular rims.',
    mono: true,
    light: false,
    preview: {
      bg: '#101114',
      card: 'rgba(42,45,54,0.65)',
      border: 'rgba(255,255,255,0.24)',
      primary: '#ffffff',
      primaryText: '#111113',
      accent: '#e4e4e7',
      text: '#ffffff',
    },
    colors: {
      accent: '#f4f4f5',
      accent2: '#a1a1aa',
      track: 'rgba(255,255,255,0.12)',
    },
  },
  {
    id: 'raycast',
    name: 'Raycast Studio',
    system: 'Command Noir',
    description: 'Matte studio obsidian glass with crisp zinc chrome & coral spark.',
    mono: false,
    light: false,
    preview: {
      bg: '#0c0d10',
      card: 'rgba(22,23,28,0.85)',
      border: 'rgba(255,255,255,0.12)',
      primary: '#fafafa',
      primaryText: '#0c0d10',
      accent: '#ff6363',
      text: '#fafafa',
    },
    colors: {
      accent: '#e4e4e7',
      accent2: '#ff6363',
      track: 'rgba(255,255,255,0.08)',
    },
  },
];

export function isValidThemeId(val: string | null | undefined): val is ThemeId {
  return UI_THEMES.some((t) => t.id === val);
}

export function getThemeMeta(themeId: ThemeId): UiThemeMeta {
  return UI_THEMES.find((t) => t.id === themeId) || UI_THEMES[0];
}

export function resolveAccent(color: string | undefined, themeId: ThemeId): string {
  const meta = getThemeMeta(themeId);
  if (meta.mono) return meta.colors.accent;
  return color || meta.colors.accent;
}
