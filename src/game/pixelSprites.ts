export type PixelPalette = Record<string, string>;

export interface SpriteFrames {
  palette: PixelPalette;
  frames: [string[], string[]];
}

export interface BiomePalette {
  bg: string;
  brickDark: string;
  brickLight: string;
  mortar: string;
  floorA: string;
  floorB: string;
  accent: string;
  torchGlow: string;
}

export const BIOME_PALETTES: Record<string, BiomePalette> = {
  moss_library: {
    bg: '#101916',
    brickDark: '#1b2c25',
    brickLight: '#243c32',
    mortar: '#0b120f',
    floorA: '#1a2721',
    floorB: '#22332a',
    accent: '#4ade80',
    torchGlow: '#fb923c',
  },
  clockwork_obs: {
    bg: '#16131c',
    brickDark: '#262030',
    brickLight: '#342c42',
    mortar: '#0e0c12',
    floorA: '#241f29',
    floorB: '#2f2836',
    accent: '#f59e0b',
    torchGlow: '#fbbf24',
  },
  crystal_archive: {
    bg: '#0c1524',
    brickDark: '#172740',
    brickLight: '#213659',
    mortar: '#08101c',
    floorA: '#142238',
    floorB: '#1c2f4c',
    accent: '#38bdf8',
    torchGlow: '#22d3ee',
  },
  astral_sanctum: {
    bg: '#130b1c',
    brickDark: '#241436',
    brickLight: '#331d4d',
    mortar: '#0b0612',
    floorA: '#1f1230',
    floorB: '#291740',
    accent: '#c084fc',
    torchGlow: '#e879f9',
  },
};

export const HERO_SPRITES: Record<string, SpriteFrames> = {
  hero_scholar: {
    palette: {
      K: '#09090b',
      H: '#38bdf8',
      B: '#0284c7',
      G: '#fbbf24',
      S: '#fed7aa',
      E: '#0f172a',
      W: '#92400e',
      P: '#22d3ee',
      C: '#e2e8f0',
    },
    frames: [
      [
        '....KKKK....',
        '...KHHHHK...',
        '..KHHHHHHK..',
        '..KKKKKKKK..',
        '..KSSESSKS..',
        '..KSSSSSSK..',
        '...KBBBBK.P.',
        '..KBBGBBBKW.',
        '..KBBBBBBKW.',
        '...KBBBBK.W.',
        '...KCKKCK...',
        '...KK..KK...',
      ],
      [
        '............',
        '....KKKK....',
        '...KHHHHK...',
        '..KHHHHHHK..',
        '..KKKKKKKK..',
        '..KSSESSKS..',
        '..KSSSSSSK.P',
        '...KBBBBK..W',
        '..KBBGBBBK.W',
        '..KBBBBBBK.W',
        '...KCK.KCK..',
        '...KK...KK..',
      ],
    ],
  },
  hero_knight: {
    palette: {
      K: '#09090b',
      A: '#cbd5e1',
      D: '#64748b',
      R: '#ef4444',
      G: '#fbbf24',
      V: '#0ea5e9',
      B: '#475569',
      W: '#f8fafc',
    },
    frames: [
      [
        '....KRRK....',
        '...KAAAAK...',
        '..KAAVVAAK..',
        '..KADDDDAK..',
        '...KAAAAK...',
        '.KKAAAAAAGG.',
        'KWKAAAAAAGGW',
        'KWKAAAAADDDW',
        '.KKADDDDAK..',
        '...KA..AK...',
        '...KD..DK...',
        '...KK..KK...',
      ],
      [
        '............',
        '....KRRK....',
        '...KAAAAK...',
        '..KAAVVAAK..',
        '..KADDDDAK..',
        '.KKAAAAAAKGG',
        'KWKAAAAAAKGW',
        'KWKAAAAADD.W',
        '.KKADDDDAK..',
        '...KA...AK..',
        '...KD...DK..',
        '...KK...KK..',
      ],
    ],
  },
  hero_rogue: {
    palette: {
      K: '#09090b',
      P: '#a855f7',
      D: '#581c87',
      S: '#fde68a',
      M: '#1e1b4b',
      E: '#34d399',
      W: '#e2e8f0',
    },
    frames: [
      [
        '...KKKKKK...',
        '..KDDDDDDK..',
        '.KDDPPPPDDK.',
        '..KMMEMEMK..',
        '..KMMMMMMK..',
        '...KDDDDK...',
        '..KDDPPDDKW.',
        '..KDDDDDDKW.',
        '..KDDDDDDK..',
        '...KD..DK...',
        '...KM..MK...',
        '...KK..KK...',
      ],
      [
        '............',
        '...KKKKKK...',
        '..KDDDDDDK..',
        '.KDDPPPPDDK.',
        '..KMMEMEMK..',
        '..KMMMMMMKW.',
        '...KDDDDK.W.',
        '..KDDPPDDK..',
        '..KDDDDDDK..',
        '...KD...DK..',
        '...KM...MK..',
        '...KK...KK..',
      ],
    ],
  },
  hero_mage: {
    palette: {
      K: '#09090b',
      M: '#4f46e5',
      L: '#818cf8',
      G: '#f59e0b',
      S: '#fed7aa',
      E: '#fef08a',
      W: '#78350f',
      O: '#f43f5e',
    },
    frames: [
      [
        '.....KK.....',
        '....KMMK....',
        '...KMLMMK...',
        '.KKKGGGGKKK.',
        '..KSSESSSK..',
        '..KSSSSSSK.O',
        '...KMMMMK..W',
        '..KMMLMMMK.W',
        '..KMMMMMMK.W',
        '..KMMMMMMK..',
        '...KM..MK...',
        '...KK..KK...',
      ],
      [
        '............',
        '.....KK.....',
        '....KMMK....',
        '...KMLMMK..O',
        '.KKKGGGGKKKW',
        '..KSSESSSK.W',
        '..KSSSSSSK.W',
        '...KMMMMK...',
        '..KMMLMMMK..',
        '..KMMMMMMK..',
        '...KM...MK..',
        '...KK...KK..',
      ],
    ],
  },
};

export const COMPANION_SPRITES: Record<string, SpriteFrames> = {
  pet_owl: {
    palette: { K: '#09090b', B: '#b45309', L: '#fcd34d', W: '#fef3c7', E: '#0f172a' },
    frames: [
      ['.K....K.', 'KBBBBBBK', 'KBWKKWBK', 'KBEKKEBK', 'KBBLLBBK', '.KBWWBK.', '..K..K..', '..K..K..'],
      ['K......K', 'KBBBBBBK', 'KBWKKWBK', 'KBEKKEBK', 'KBBLLBBK', '.KBWWBK.', '..K..K..', '........'],
    ],
  },
  pet_cat: {
    palette: { K: '#09090b', F: '#334155', L: '#94a3b8', E: '#22d3ee', P: '#f472b6' },
    frames: [
      ['K......K', 'KFKKKKFK', 'KFFFFFFK', 'KFEKKFEK', 'KFFPPFFK', '.KFFFFK.', '.KF..FK.', '..K..K..'],
      ['.K....K.', 'KFKKKKFK', 'KFFFFFFK', 'KFEKKFEK', 'KFFPPFFK', '.KFFFFFK', '..KF.FK.', '........'],
    ],
  },
  pet_dragon: {
    palette: { K: '#09090b', R: '#ef4444', O: '#f97316', Y: '#fde047', W: '#ffffff' },
    frames: [
      ['.K....K.', '.KRKKRK.', 'KRRRRRRK', 'KRWKWRYK', 'KROOOORK', '.KRRRRK.', '..K..K..', '........'],
      ['K......K', 'KORKKRKO', 'KRRRRRRK', 'KRWKWRYK', 'KROOOORK', '.KRRRRK.', '..K..K..', '........'],
    ],
  },
  pet_sprite: {
    palette: { K: '#09090b', C: '#67e8f9', B: '#06b6d4', W: '#ffffff' },
    frames: [
      ['...KK...', '..KCCK..', '.KCWWCK.', '.KCBBCK.', '.KCCCCK.', '..KCCK..', '...KK...', '..C..C..'],
      ['...KK...', '..KCCK..', 'KKCWWCKK', '.KCBBCK.', '.KCCCCK.', '..KCCK..', '...KK...', '....C...'],
    ],
  },
};

export const MONSTER_SPRITES: Record<string, SpriteFrames> = {
  slime: {
    palette: { K: '#09090b', G: '#22c55e', L: '#86efac', D: '#15803d', W: '#ffffff' },
    frames: [
      [
        '............',
        '............',
        '....KKKK....',
        '..KKLLLLKK..',
        '.KLLGGGGGGK.',
        '.KGGGGGGGGK.',
        'KGGKWKKWKGGK',
        'KGGKKKKKKGGK',
        'KGGGGGGGGGGK',
        'KDDDDDDDDDDK',
        '.KKKKKKKKKK.',
        '............',
      ],
      [
        '............',
        '............',
        '............',
        '...KKKKKK...',
        '.KKLLLLLLKK.',
        'KLGGGGGGGGGK',
        'KGGKWKKWKGGK',
        'KGGKKKKKKGGK',
        'KGGGGGGGGGGK',
        'KDDDDDDDDDDK',
        '.KKKKKKKKKK.',
        '............',
      ],
    ],
  },
  bat: {
    palette: { K: '#09090b', P: '#7e22ce', L: '#c084fc', R: '#f43f5e', W: '#f8fafc' },
    frames: [
      [
        'KK........KK',
        'KPK......KPK',
        'KPPKK..KKPPK',
        'KPPPPKKPPPPK',
        '.KPPKRKRPPK.',
        '..KPPWWPPK..',
        '...KPPPPK...',
        '....KKKK....',
        '............',
        '............',
      ],
      [
        '............',
        '....KKKK....',
        '..KKPPPPKK..',
        '.KPPKRKRPPK.',
        'KPPPWWWWPPPK',
        'KPPKPPPPKPPK',
        'KK..KKKK..KK',
        '............',
        '............',
        '............',
      ],
    ],
  },
  imp: {
    palette: { K: '#09090b', R: '#dc2626', O: '#f97316', Y: '#fde047', H: '#fef3c7' },
    frames: [
      [
        '.HK......KH.',
        '..KRRRRRRK..',
        '..KRYKKYRK..',
        '..KRRRRRRK..',
        '...KOOROK...',
        '..KRRRRRRK..',
        '..KRKRRKRK..',
        '...KR..RK...',
        '...KK..KK...',
        '............',
      ],
      [
        '............',
        '.HK......KH.',
        '..KRRRRRRK..',
        '..KRYKKYRK..',
        '..KRRRRRRK..',
        '...KOOROK...',
        '..KRRRRRRK..',
        '...KR..RK...',
        '..KK....KK..',
        '............',
      ],
    ],
  },
  golem: {
    palette: { K: '#09090b', S: '#78716c', L: '#a8a29e', D: '#44403c', G: '#38bdf8' },
    frames: [
      [
        '...KKKKKK...',
        '..KLLLLLLK..',
        '..KSGKKGSK..',
        '.KKSSSSSSKK.',
        'KLLSSSSSSLLK',
        'KSSSDDDDSSSK',
        'KSSKSSSSKSSK',
        '.KK.KSSK.KK.',
        '...KS..SK...',
        '...KD..DK...',
        '...KK..KK...',
      ],
      [
        '............',
        '...KKKKKK...',
        '..KLLLLLLK..',
        '..KSGKKGSK..',
        '.KKSSSSSSKK.',
        'KLLSSSSSSLLK',
        'KSSSDDDDSSSK',
        'KSS.KSSK.SSK',
        '...KS..SK...',
        '...KD..DK...',
        '...KK..KK...',
      ],
    ],
  },
  wraith: {
    palette: { K: '#09090b', C: '#67e8f9', B: '#0e7490', D: '#164e63', W: '#ecfeff' },
    frames: [
      [
        '....KKKK....',
        '...KCCCCK...',
        '..KCBBBBBK..',
        '..KBWKKWBK..',
        '..KBBBBBBK..',
        '..KDDDDDDK..',
        '.KDDKDDKDDK.',
        '.KD.KD.KD.K.',
        '....K..K....',
      ],
      [
        '....KKKK....',
        '...KCCCCK...',
        '..KCBBBBBK..',
        '..KBWKKWBK..',
        '..KBBBBBBK..',
        '..KDDDDDDK..',
        '..KDKDDKDK..',
        '...K.KD.K...',
        '.....K......',
      ],
    ],
  },
  mimic: {
    palette: { K: '#09090b', B: '#92400e', G: '#fbbf24', R: '#ef4444', W: '#ffffff', P: '#f472b6' },
    frames: [
      [
        '..KKKKKKKK..',
        '.KBBBBBBBBK.',
        '.KBGGBBGGBK.',
        '.KWWWWWWWWK.',
        'KKRRRRRRRRKK',
        '.KWKWKWKWKK.',
        '.KBBBPPBBBK.',
        '.KBBBBBBBBK.',
        '..KKKKKKKK..',
      ],
      [
        '..KKKKKKKK..',
        '.KBBBBBBBBK.',
        '.KBGGBBGGBK.',
        '.KKKKKKKKKK.',
        '.KBBGKKGBBK.',
        '.KBBBBBBBBK.',
        '.KBBBBBBBBK.',
        '..KKKKKKKK..',
        '............',
      ],
    ],
  },
  knight: {
    palette: { K: '#09090b', A: '#94a3b8', D: '#475569', R: '#ef4444', Y: '#fbbf24' },
    frames: [
      [
        '...KKKKKK...',
        '..KAAAAAAK..',
        '..KAKRRKAK..',
        '..KADDDDAK..',
        '.KKAAAAAAKK.',
        'KYKAAAAAADK.',
        'KYKADDDDAKK.',
        '..KAAAAAAK..',
        '...KA..AK...',
        '...KD..DK...',
        '...KK..KK...',
      ],
      [
        '............',
        '...KKKKKK...',
        '..KAAAAAAK..',
        '..KAKRRKAK..',
        '..KADDDDAK..',
        '.KKAAAAAAKK.',
        'KYKAAAAAADK.',
        '..KADDDDAK..',
        '...KA...AK..',
        '...KD...DK..',
        '...KK...KK..',
      ],
    ],
  },
  stalker: {
    palette: { K: '#09090b', V: '#3b0764', P: '#9333ea', E: '#f43f5e' },
    frames: [
      [
        '....KKKK....',
        '...KPPPPK...',
        '..KPVVVVPK..',
        '..KVEKKEVK..',
        '...KVVVVK...',
        '..KPVVVVPK..',
        '.KPVKVVKVPK.',
        '..KP.KK.PK..',
        '..K......K..',
      ],
      [
        '....KKKK....',
        '...KPPPPK...',
        '..KPVVVVPK..',
        '..KVEKKEVK..',
        '...KVVVVK...',
        '..KPVVVVPK..',
        '..KVKVVKVPK.',
        '...K.KK.PK..',
        '.....K......',
      ],
    ],
  },
  drake: {
    palette: { K: '#09090b', R: '#b91c1c', L: '#ef4444', Y: '#facc15', O: '#fb923c' },
    frames: [
      [
        '..K......K..',
        '..KRKKKKRK..',
        '..KRRRRRRK..',
        '.KRYKRRKRYK.',
        '.KRRRRRRRRK.',
        '..KROOOORK..',
        '.KLLRRRRLLK.',
        '.KK.KRRK.KK.',
        '....K..K....',
      ],
      [
        '..K......K..',
        '..KRKKKKRK..',
        '.KKRRRRRRKK.',
        'KLRYKRRKRYLK',
        'KKRRRRRRRRKK',
        '..KROOOORK..',
        '...KRRRRK...',
        '....KR.RK...',
        '....K...K...',
      ],
    ],
  },
  boss_lich: {
    palette: { K: '#09090b', G: '#fbbf24', P: '#a855f7', D: '#4c1d95', W: '#e2e8f0', C: '#22d3ee' },
    frames: [
      [
        '..GK.GG.KG..',
        '..KGGGGGGK..',
        '..KWWWWWWK..',
        '..KWCKKCWK..',
        '...KWWWWK...',
        '..KPPPPPPK..',
        '.KPDPGGPDPK.',
        '.KDDDDDDDDK.',
        '.KDKDDDDKDK.',
        '..K.KKKK.K..',
      ],
      [
        '..GK.GG.KG..',
        '..KGGGGGGK..',
        '..KWWWWWWK..',
        '..KWCKKCWK..',
        '...KWWWWK.C.',
        '..KPPPPPPKCK',
        '.KPDPGGPDPK.',
        '.KDDDDDDDDK.',
        '..KDDDDDDK..',
        '...KKKKKK...',
      ],
    ],
  },
};

export const PROP_SPRITES: Record<string, SpriteFrames> = {
  chest: {
    palette: { K: '#09090b', W: '#92400e', L: '#b45309', G: '#fbbf24', S: '#fde047' },
    frames: [
      [
        '..KKKKKKKK..',
        '.KLLLLLLLLK.',
        '.KLGGGGGGGK.',
        '.KWWWWWWWWK.',
        '.KWWGSSGWWK.',
        '.KWWWWWWWWK.',
        '.KGGGGGGGGK.',
        '..KKKKKKKK..',
      ],
      [
        '..KKKKKKKK..',
        '.KSSSSSSSSK.',
        '.KKKKKKKKKK.',
        '.KGGGGGGGGK.',
        '.KWWGSSGWWK.',
        '.KWWWWWWWWK.',
        '.KGGGGGGGGK.',
        '..KKKKKKKK..',
      ],
    ],
  },
  shrine: {
    palette: { K: '#09090b', S: '#64748b', L: '#cbd5e1', C: '#22d3ee', G: '#fbbf24' },
    frames: [
      [
        '....KKKK....',
        '...KLLLLK...',
        '..KLCCCCLK..',
        '..KLCGGLCK..',
        '...KSSSSK...',
        '...KSSSSK...',
        '..KSSSSSSK..',
        '.KSSSSSSSSK.',
        '.KKKKKKKKKK.',
      ],
      [
        '....KKKK....',
        '...KLLLLK...',
        '..KLWWWWLK..',
        '..KLCGGLCK..',
        '...KSSSSK...',
        '...KSSSSK...',
        '..KSSSSSSK..',
        '.KSSSSSSSSK.',
        '.KKKKKKKKKK.',
      ],
    ],
  },
  merchant: {
    palette: { K: '#09090b', G: '#10b981', D: '#047857', S: '#fde68a', Y: '#fbbf24', B: '#78350f' },
    frames: [
      [
        '...KKKKKK...',
        '..KDDDDDDK..',
        '.KDGGGGGGDK.',
        '..KKKSSKKK..',
        '...KGGGGK...',
        '..KGGYYGGK..',
        '..KBBBBBBK..',
        '..KGGGGGGK..',
        '...KK..KK...',
      ],
      [
        '............',
        '...KKKKKK...',
        '..KDDDDDDK..',
        '.KDGGGGGGDK.',
        '..KKKSSKKK..',
        '...KGGGGK...',
        '..KGGYYGGK..',
        '..KBBBBBBK..',
        '...KK..KK...',
      ],
    ],
  },
  campfire: {
    palette: { K: '#09090b', R: '#ef4444', O: '#f97316', Y: '#fde047', W: '#78350f', S: '#64748b' },
    frames: [
      [
        '....K..K....',
        '...KY..YK...',
        '..KOYOOYOK..',
        '..KROYYORK..',
        '.KRROOOORRK.',
        '.KWWWWWWWWK.',
        'KSSWWKKWWSSK',
        '.KKKKKKKKKK.',
      ],
      [
        '...K....K...',
        '....KYYK....',
        '..KROYYORK..',
        '..KROOOORK..',
        '.KRRROORRRK.',
        '.KWWWWWWWWK.',
        'KSSWWKKWWSSK',
        '.KKKKKKKKKK.',
      ],
    ],
  },
};

export function drawPixelMatrix(
  ctx: CanvasRenderingContext2D,
  matrix: string[],
  palette: PixelPalette,
  x: number,
  y: number,
  scale = 3,
  flipX = false
) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const cols = matrix[0]?.length || 0;
  for (let row = 0; row < matrix.length; row++) {
    const line = matrix[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      if (ch === '.' || !palette[ch]) continue;
      ctx.fillStyle = palette[ch];
      const drawCol = flipX ? cols - 1 - col : col;
      ctx.fillRect(ix + drawCol * scale, iy + row * scale, scale, scale);
    }
  }
}
