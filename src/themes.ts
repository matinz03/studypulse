export type ThemeId =
  | 'shadcn-dark'
  | 'shadcn-light'
  | 'vercel'
  | 'vercel-light'
  | 'linear'
  | 'linear-light'
  | 'apple-glass'
  | 'apple-light'
  | 'raycast'
  | 'raycast-light'
  | 'sage-light'
  | 'sage-dark'
  | 'indigo-light'
  | 'indigo-dark'
  | 'terracotta-light'
  | 'terracotta-dark';

export const THEME_STORAGE_KEY = 'studypulse_ui_theme';

export interface UiThemeMeta {
  id: ThemeId;
  name: string;
  system: string;
  description: string;
  category: 'system' | 'study';
  mono: boolean;
  light: boolean;
  pairId: ThemeId;
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
  // 1. Shadcn Dark & Light
  {
    id: 'shadcn-dark',
    name: 'Shadcn Glass',
    system: 'shadcn/ui Dark',
    description: 'Frosted zinc-950 glass, razor 1px hairlines & pure white CTAs.',
    category: 'system',
    mono: true,
    light: false,
    pairId: 'shadcn-light',
    preview: {
      bg: '#09090b',
      card: 'rgba(24,24,27,0.88)',
      border: 'rgba(255,255,255,0.14)',
      primary: '#fafafa',
      primaryText: '#09090b',
      accent: '#e4e4e7',
      text: '#fafafa',
    },
    colors: { accent: '#fafafa', accent2: '#a1a1aa', track: 'rgba(255,255,255,0.09)' },
  },
  {
    id: 'shadcn-light',
    name: 'Shadcn Daylight',
    system: 'shadcn/ui Light',
    description: 'Crisp frosted white glass cards, zinc hairlines & obsidian controls.',
    category: 'system',
    mono: true,
    light: true,
    pairId: 'shadcn-dark',
    preview: {
      bg: '#f4f4f5',
      card: '#ffffff',
      border: 'rgba(9,9,11,0.14)',
      primary: '#09090b',
      primaryText: '#fafafa',
      accent: '#18181b',
      text: '#09090b',
    },
    colors: { accent: '#18181b', accent2: '#71717a', track: 'rgba(9,9,11,0.1)' },
  },

  // 2. Vercel Geist Dark & Light
  {
    id: 'vercel',
    name: 'Vercel Geist OLED',
    system: 'Geist Dark',
    description: 'True #000000 OLED canvas, sharp 8px geometry & high-contrast ink.',
    category: 'system',
    mono: true,
    light: false,
    pairId: 'vercel-light',
    preview: {
      bg: '#000000',
      card: '#0c0c0c',
      border: 'rgba(255,255,255,0.18)',
      primary: '#ffffff',
      primaryText: '#000000',
      accent: '#ffffff',
      text: '#ededed',
    },
    colors: { accent: '#ffffff', accent2: '#888888', track: 'rgba(255,255,255,0.1)' },
  },
  {
    id: 'vercel-light',
    name: 'Vercel Geist Paper',
    system: 'Geist Light',
    description: 'Stark #ffffff canvas, architectural 8px frames & pure black ink.',
    category: 'system',
    mono: true,
    light: true,
    pairId: 'vercel',
    preview: {
      bg: '#fafafa',
      card: '#ffffff',
      border: 'rgba(0,0,0,0.14)',
      primary: '#000000',
      primaryText: '#ffffff',
      accent: '#171717',
      text: '#000000',
    },
    colors: { accent: '#000000', accent2: '#666666', track: 'rgba(0,0,0,0.09)' },
  },

  // 3. Linear Carbon & Dawn
  {
    id: 'linear',
    name: 'Linear Carbon',
    system: 'Linear Dark',
    description: 'Precision carbon dark glass with specular rims & cool silver-indigo.',
    category: 'system',
    mono: false,
    light: false,
    pairId: 'linear-light',
    preview: {
      bg: '#08090a',
      card: 'rgba(18,19,24,0.88)',
      border: 'rgba(255,255,255,0.12)',
      primary: '#f7f8f8',
      primaryText: '#08090a',
      accent: '#818cf8',
      text: '#f7f8f8',
    },
    colors: { accent: '#c7d2fe', accent2: '#818cf8', track: 'rgba(255,255,255,0.09)' },
  },
  {
    id: 'linear-light',
    name: 'Linear Dawn',
    system: 'Linear Light',
    description: 'Cool alabaster workspace with crisp white surfaces & periwinkle cobalt.',
    category: 'system',
    mono: false,
    light: true,
    pairId: 'linear',
    preview: {
      bg: '#f5f6f8',
      card: '#ffffff',
      border: 'rgba(15,23,42,0.11)',
      primary: '#1e2028',
      primaryText: '#ffffff',
      accent: '#5e6ad2',
      text: '#111827',
    },
    colors: { accent: '#5e6ad2', accent2: '#818cf8', track: 'rgba(94,106,210,0.14)' },
  },

  // 4. Apple VisionOS Dark & Pearl
  {
    id: 'apple-glass',
    name: 'Apple VisionOS Dark',
    system: 'Spatial Dark',
    description: 'Thick 32px translucent titanium blur with luminous specular rims.',
    category: 'system',
    mono: true,
    light: false,
    pairId: 'apple-light',
    preview: {
      bg: '#101114',
      card: 'rgba(42,45,54,0.68)',
      border: 'rgba(255,255,255,0.24)',
      primary: '#ffffff',
      primaryText: '#111113',
      accent: '#f4f4f5',
      text: '#ffffff',
    },
    colors: { accent: '#f4f4f5', accent2: '#a1a1aa', track: 'rgba(255,255,255,0.13)' },
  },
  {
    id: 'apple-light',
    name: 'Apple VisionOS Pearl',
    system: 'Spatial Light',
    description: 'Airy frosted cloud glass with bright specular catchlights & satin chrome.',
    category: 'system',
    mono: true,
    light: true,
    pairId: 'apple-glass',
    preview: {
      bg: '#eaecf2',
      card: 'rgba(255,255,255,0.85)',
      border: 'rgba(17,24,39,0.12)',
      primary: '#1d1d1f',
      primaryText: '#ffffff',
      accent: '#1d1d1f',
      text: '#1d1d1f',
    },
    colors: { accent: '#1d1d1f', accent2: '#6e6e73', track: 'rgba(29,29,31,0.1)' },
  },

  // 5. Raycast Studio Dark & Light
  {
    id: 'raycast',
    name: 'Raycast Studio',
    system: 'Raycast Dark',
    description: 'Matte studio obsidian glass with crisp zinc chrome & coral spark.',
    category: 'system',
    mono: false,
    light: false,
    pairId: 'raycast-light',
    preview: {
      bg: '#0c0d10',
      card: 'rgba(22,23,28,0.88)',
      border: 'rgba(255,255,255,0.12)',
      primary: '#fafafa',
      primaryText: '#0c0d10',
      accent: '#ff6363',
      text: '#fafafa',
    },
    colors: { accent: '#e4e4e7', accent2: '#ff6363', track: 'rgba(255,255,255,0.09)' },
  },
  {
    id: 'raycast-light',
    name: 'Raycast Daylight',
    system: 'Raycast Light',
    description: 'Clean studio silver surfaces, obsidian ink & signature crimson spark.',
    category: 'system',
    mono: false,
    light: true,
    pairId: 'raycast',
    preview: {
      bg: '#f5f5f7',
      card: '#ffffff',
      border: 'rgba(17,18,21,0.12)',
      primary: '#111215',
      primaryText: '#ffffff',
      accent: '#e5484d',
      text: '#111215',
    },
    colors: { accent: '#e5484d', accent2: '#111215', track: 'rgba(229,72,77,0.12)' },
  },

  // 6. Top Study Palette #1: Digital Wellness — Matcha Sage & Warm Sand
  {
    id: 'sage-light',
    name: 'Matcha & Warm Sand',
    system: 'Focus Study #1 · Light',
    description: 'Low-glare warm cream paper & botanical sage to calm study anxiety.',
    category: 'study',
    mono: false,
    light: true,
    pairId: 'sage-dark',
    preview: {
      bg: '#f7f5f0',
      card: '#ffffff',
      border: 'rgba(44,53,46,0.13)',
      primary: '#2c4d39',
      primaryText: '#f7f5f0',
      accent: '#5d8a6e',
      text: '#243028',
    },
    colors: { accent: '#3f6e52', accent2: '#7a9a83', track: 'rgba(63,110,82,0.14)' },
  },
  {
    id: 'sage-dark',
    name: 'Forest & Sage',
    system: 'Focus Study #1 · Dark',
    description: 'Deep pine charcoal & soft sage green designed for zero eye fatigue.',
    category: 'study',
    mono: false,
    light: false,
    pairId: 'sage-light',
    preview: {
      bg: '#101411',
      card: '#181e1a',
      border: 'rgba(138,168,147,0.18)',
      primary: '#dce8df',
      primaryText: '#101411',
      accent: '#7a9a83',
      text: '#edf3ef',
    },
    colors: { accent: '#8db399', accent2: '#d97757', track: 'rgba(141,179,153,0.13)' },
  },

  // 7. Top Study Palette #2: Deep Focus Mode — Nordic Slate & Cognitive Indigo
  {
    id: 'indigo-light',
    name: 'Nordic & Cobalt',
    system: 'Focus Study #2 · Light',
    description: 'Crisp cool slate & cognitive indigo calibrated for analytical deep work.',
    category: 'study',
    mono: false,
    light: true,
    pairId: 'indigo-dark',
    preview: {
      bg: '#f1f5f9',
      card: '#ffffff',
      border: 'rgba(15,23,42,0.12)',
      primary: '#4338ca',
      primaryText: '#ffffff',
      accent: '#6366f1',
      text: '#0f172a',
    },
    colors: { accent: '#4f46e5', accent2: '#0d9488', track: 'rgba(79,70,229,0.13)' },
  },
  {
    id: 'indigo-dark',
    name: 'Midnight & Indigo',
    system: 'Focus Study #2 · Dark',
    description: 'Anti-halation deep slate navy with electric indigo & bioluminescent teal.',
    category: 'study',
    mono: false,
    light: false,
    pairId: 'indigo-light',
    preview: {
      bg: '#0f172a',
      card: '#1e293b',
      border: 'rgba(148,163,184,0.18)',
      primary: '#6366f1',
      primaryText: '#ffffff',
      accent: '#2dd4bf',
      text: '#f1f5f9',
    },
    colors: { accent: '#818cf8', accent2: '#2dd4bf', track: 'rgba(148,163,184,0.14)' },
  },

  // 8. Top Study Palette #3: Flow State — Alabaster & Earthy Terracotta
  {
    id: 'terracotta-light',
    name: 'Alabaster & Terracotta',
    system: 'Focus Study #3 · Light',
    description: 'Library parchment warmth, earthy terracotta clay & steady espresso ink.',
    category: 'study',
    mono: false,
    light: true,
    pairId: 'terracotta-dark',
    preview: {
      bg: '#faf6f2',
      card: '#ffffff',
      border: 'rgba(61,51,42,0.13)',
      primary: '#9e4f37',
      primaryText: '#faf6f2',
      accent: '#c86d51',
      text: '#3d332a',
    },
    colors: { accent: '#b85d43', accent2: '#8a9a68', track: 'rgba(184,93,67,0.14)' },
  },
  {
    id: 'terracotta-dark',
    name: 'Espresso & Clay',
    system: 'Focus Study #3 · Dark',
    description: 'Warm roasted espresso surface with calm terracotta amber accents.',
    category: 'study',
    mono: false,
    light: false,
    pairId: 'terracotta-light',
    preview: {
      bg: '#161210',
      card: '#231c19',
      border: 'rgba(230,184,156,0.18)',
      primary: '#e6b89c',
      primaryText: '#161210',
      accent: '#d97757',
      text: '#f7efe9',
    },
    colors: { accent: '#e08b6c', accent2: '#a6b87d', track: 'rgba(230,184,156,0.13)' },
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
  if (meta.mono || meta.category === 'study') return meta.colors.accent;
  return color || meta.colors.accent;
}
