import { DUNGEON_RIDDLES } from './storyData.js';

export const DUNGEON_WIDTH = 11;
export const DUNGEON_HEIGHT = 9;

// Curated architectural base blueprint: 4 connected rooms + Locked Boss Sanctum + Secret Vault behind 'S'
// Tile chars: 'W' wall, '.' floor, 'E' entrance/extraction stairs, 'L' locked boss gate, 'S' cracked secret wall
const BASE_LAYOUT = [
  'WWWWWWWWWWW',
  'W...W.W...W',
  'W...L.W...W',
  'W...W...W.W',
  'WW.WWWW.W.W',
  'W.......W.W',
  'W..W.W..W.W',
  'W.EW.W..S.W',
  'WWWWWWWWWWW',
];
// Notice carefully where each zone is in BASE_LAYOUT (9 rows y=0..8, 11 cols x=0..10):
// - Entrance Stairs 'E' = (2, 7) inside West-South Hall (x: 1..3, y: 5..7)
// - Corridor up: (2, 4) connects South Hall (x:1..3, y:5..7) <-> North-West Vault? Wait! Look at row 3 col 1..3:
//   Row 1: x=1..3 '.', Row 2: x=1..3 '.' Boss Chamber?, Wait: Row 2 x=4 is 'L'! Wait: if x=1..3 row 1..3 connects via (2,4) AND via (4,2) 'L', then (1..3,1..3) would connect to (2,4)!
// Let's trace every cell cleanly so Boss Chamber is ONLY behind 'L' and Secret Vault is ONLY behind 'S'!

const CURATED_LAYOUTS = [
  // Layout A: Entrance West-South (1,7), Main Hall Central, North-West Treasury, Locked Boss Chamber East-Top, Secret Vault East-Bottom
  [
    'WWWWWWWWWWW',
    'W...W...W.W',
    'W...W...L.W',
    'W.........W',
    'WW.WWWWWW.W',
    'W.....W...W',
    'W..W..W...W',
    'WE.W....S.W',
    'WWWWWWWWWWW',
  ],
  // Wait let's double check Boss Chamber in Layout A:
  // Row 1: x=9 is '.', x=10 is W -> (9,1), (9,2) '.' and (9,3)? Wait row 3 has '.' at x=9! So (9,3) bypasses L=(8,2)!
  // Good thing we checked mathematically! Let's write crisp exact isolated regions with 1 entry tile ('L' for Boss, 'S' for Secret)!
];

const VERIFIED_LAYOUTS = [
  // Layout 0:
  // Boss Sanctum = (8..9, 1..3), ONLY connected at L=(7, 2)! Check row 4 col 8..9 = W, row 0 = W, col 7 = W except (7,2)=L!
  // Secret Vault = (8..9, 6..7), ONLY connected at S=(7, 7)! Check row 5 col 8..9 = W, row 8 = W, col 7 = W except (7,7)=S!
  // Entrance 'E' = (1, 7). Connects cleanly across West-North, Central Plaza, and South-Mid!
  {
    map: [
      'WWWWWWWWWWW',
      'W...W..W..W',
      'W......L..W',
      'W...W..W..W',
      'WW.WW..WWWW',
      'W......WWWW',
      'W..W...W..W',
      'WE.W...S..W',
      'WWWWWWWWWWW',
    ],
    bossPos: { x: 9, y: 2 },
    secretVaultSpots: [
      { x: 9, y: 6 },
      { x: 8, y: 6 },
      { x: 9, y: 7 },
    ],
    keyCandidates: [
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 2, y: 3 },
    ],
    roomSpots: [
      { x: 2, y: 5 },
      { x: 3, y: 2 },
      { x: 5, y: 1 },
      { x: 6, y: 3 },
      { x: 5, y: 5 },
      { x: 4, y: 7 },
      { x: 6, y: 7 },
      { x: 1, y: 3 },
      { x: 5, y: 2 },
      { x: 6, y: 5 },
      { x: 1, y: 5 },
      { x: 5, y: 7 },
    ],
  },
  // Layout 1:
  // Boss Sanctum = (1..2, 1..3), ONLY connected at L=(3, 2)! Check row 4 col 1..2 = W, col 3 = W except (3,2)=L!
  // Secret Vault = (1..2, 6..7), ONLY connected at S=(2, 5)? Wait col 1..2 row 5 = W except S=(2,5) or S=(3,6)! Let's use S=(3,6).
  // Entrance 'E' = (9, 7).
  {
    map: [
      'WWWWWWWWWWW',
      'W..W...W..W',
      'W..L......W',
      'W..W...W..W',
      'WWWW..WW.WW',
      'WWWW......W',
      'W..S..W...W',
      'W..W..W..EW',
      'WWWWWWWWWWW',
    ],
    bossPos: { x: 1, y: 2 },
    secretVaultSpots: [
      { x: 1, y: 6 },
      { x: 1, y: 7 },
      { x: 2, y: 7 },
    ],
    keyCandidates: [
      { x: 9, y: 1 },
      { x: 8, y: 2 },
      { x: 9, y: 3 },
    ],
    roomSpots: [
      { x: 5, y: 1 },
      { x: 6, y: 2 },
      { x: 5, y: 3 },
      { x: 4, y: 5 },
      { x: 7, y: 5 },
      { x: 5, y: 6 },
      { x: 5, y: 7 },
      { x: 8, y: 5 },
      { x: 8, y: 6 },
      { x: 7, y: 1 },
      { x: 4, y: 7 },
      { x: 9, y: 5 },
    ],
  },
];

const MONSTER_ARCHETYPES = [
  { key: 'slime', name: 'Ink Slime', hp: 40, atk: 8, def: 1, xp: 20, shards: 8, cycle: ['STRIKE', 'HEX', 'STRIKE'] },
  { key: 'bat', name: 'Mist Bat', hp: 44, atk: 10, def: 2, xp: 24, shards: 10, cycle: ['STRIKE', 'HEAVY', 'STRIKE'] },
  { key: 'imp', name: 'Distraction Imp', hp: 50, atk: 11, def: 2, xp: 28, shards: 12, cycle: ['HEX', 'STRIKE', 'RITUAL'] },
  { key: 'golem', name: 'Papyrus Golem', hp: 66, atk: 11, def: 5, xp: 34, shards: 14, cycle: ['SHELL', 'HEAVY', 'STRIKE'] },
  { key: 'wraith', name: 'Sloth Wraith', hp: 58, atk: 13, def: 3, xp: 36, shards: 15, cycle: ['HEX', 'HEAVY', 'RITUAL'] },
  { key: 'knight', name: 'Tome Knight', hp: 74, atk: 14, def: 6, xp: 42, shards: 18, cycle: ['STRIKE', 'SHELL', 'HEAVY'] },
  { key: 'stalker', name: 'Void Stalker', hp: 68, atk: 16, def: 4, xp: 46, shards: 20, cycle: ['HEX', 'HEAVY', 'RITUAL'] },
  { key: 'drake', name: 'Archive Drake', hp: 82, atk: 17, def: 5, xp: 52, shards: 24, cycle: ['STRIKE', 'RITUAL', 'HEAVY'] },
];

const BOSS_DEFS = [
  { key: 'golem', name: 'Elder Papyrus Warden', hp: 105, atk: 14, def: 5, cycle: ['SHELL', 'HEAVY', 'STRIKE', 'RITUAL'] },
  { key: 'knight', name: 'Iron Syllabus Sentinel', hp: 130, atk: 16, def: 6, cycle: ['STRIKE', 'SHELL', 'HEAVY', 'HEX'] },
  { key: 'drake', name: 'Crimson Deadline Wyrm', hp: 155, atk: 18, def: 5, cycle: ['RITUAL', 'HEAVY', 'STRIKE', 'HEX'] },
  { key: 'boss_lich', name: 'Malakor, Arch-Lich of Burnout', hp: 185, atk: 20, def: 6, cycle: ['RITUAL', 'HEX', 'HEAVY', 'SHELL'] },
];

export function isWalkableTile(ch) {
  return ch === '.' || ch === 'E';
}

function shuffleArr(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function updateDungeonFov(dungeon, baseVisionRadius = 2, intuition = 8) {
  const effectiveRadius = dungeon.torch < 25 ? 1 : Math.max(2, baseVisionRadius);
  const { playerX: px, playerY: py, fov, tiles, entities } = dungeon;

  // Demote currently visible -> explored (1)
  for (let y = 0; y < DUNGEON_HEIGHT; y++) {
    for (let x = 0; x < DUNGEON_WIDTH; x++) {
      if (fov[y][x] === 2) fov[y][x] = 1;
    }
  }

  for (let y = 0; y < DUNGEON_HEIGHT; y++) {
    for (let x = 0; x < DUNGEON_WIDTH; x++) {
      const dist = Math.max(Math.abs(px - x), Math.abs(py - y)); // Chebyshev radius looks crisp on grids
      if (dist <= effectiveRadius) {
        fov[y][x] = 2;
      }
    }
  }

  // Reveal doors/walls immediately bordering visible tiles nicely + passive Intuition trap/secret sense
  const trapRevealDist = intuition >= 18 ? 2 : intuition >= 11 ? 1 : 0;
  for (const ent of entities) {
    if (ent.done) continue;
    const d = Math.abs(px - ent.x) + Math.abs(py - ent.y);
    if (ent.type === 'trap' && !ent.detected && trapRevealDist > 0 && d <= trapRevealDist) {
      ent.detected = true;
    }
  }

  // Secret crack subtle intuition ping when adjacent with intuition >= 12
  let sensedHint = null;
  if (intuition >= 12) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = px + dx;
        const ny = py + dy;
        if (tiles[ny]?.[nx] === 'S') {
          sensedHint = 'Faint draft detected near a cracked wall — use 🔍 Search!';
        }
      }
    }
  }
  dungeon.sensedHint = sensedHint;
}

export function generateDungeonFloor(floor, intuition = 8, visionRadius = 2, usedRiddleIds = []) {
  const layout = VERIFIED_LAYOUTS[Math.floor(Math.random() * VERIFIED_LAYOUTS.length)];
  const tiles = layout.map.map((row) => row.split(''));

  let entranceX = 1;
  let entranceY = 7;
  let bossGate = null;
  for (let y = 0; y < DUNGEON_HEIGHT; y++) {
    for (let x = 0; x < DUNGEON_WIDTH; x++) {
      if (tiles[y][x] === 'E') {
        entranceX = x;
        entranceY = y;
      } else if (tiles[y][x] === 'L') {
        bossGate = { x, y };
      }
    }
  }

  const entities = [];
  let eid = 1;
  const nextId = () => `e_${eid++}`;

  // 1. Place Floor Boss inside Boss Sanctum
  const bDef = BOSS_DEFS[(floor - 1) % BOSS_DEFS.length];
  const bossScale = 1 + (floor - 1) * 0.34;
  entities.push({
    id: nextId(),
    type: 'boss',
    x: layout.bossPos.x,
    y: layout.bossPos.y,
    key: bDef.key,
    name: `Floor ${floor} Boss: ${bDef.name}`,
    hp: Math.round(bDef.hp * bossScale),
    maxHp: Math.round(bDef.hp * bossScale),
    atk: Math.round(bDef.atk * bossScale),
    def: Math.round(bDef.def + floor),
    xpReward: Math.round(80 * bossScale),
    shardReward: Math.round(35 * bossScale),
    cycle: bDef.cycle,
    done: false,
  });

  // 2. Secret Vault Treasure Chest + Moonpetal Herb behind 'S'
  const vaultChestPos = layout.secretVaultSpots[0];
  const vaultHerbPos = layout.secretVaultSpots[1];
  entities.push({
    id: nextId(),
    type: 'chest',
    x: vaultChestPos.x,
    y: vaultChestPos.y,
    isSecretVault: true,
    lockpickChance: 55,
    done: false,
  });
  entities.push({
    id: nextId(),
    type: 'herb',
    x: vaultHerbPos.x,
    y: vaultHerbPos.y,
    done: false,
  });

  // 3. Guaranteed Reachable Bronze Key
  const keySpot = layout.keyCandidates[Math.floor(Math.random() * layout.keyCandidates.length)];
  entities.push({
    id: nextId(),
    type: 'key',
    x: keySpot.x,
    y: keySpot.y,
    done: false,
  });

  // 4. Shuffle remaining reachable spots for Monsters, Chest, Traps, Brazier, Riddle, Herb, Shrine, Lore
  const spots = shuffleArr(
    layout.roomSpots.filter((p) => !(p.x === keySpot.x && p.y === keySpot.y) && !(p.x === entranceX && p.y === entranceY))
  );
  let idx = 0;
  const takeSpot = () => spots[idx++];

  // 4 monsters
  const monsterCount = Math.min(4, spots.length - 6);
  const scale = 1 + (floor - 1) * 0.28;
  for (let m = 0; m < monsterCount; m++) {
    const pos = takeSpot();
    const maxTier = Math.min(MONSTER_ARCHETYPES.length, 3 + floor);
    const arch = MONSTER_ARCHETYPES[Math.floor(Math.random() * maxTier)];
    entities.push({
      id: nextId(),
      type: 'monster',
      x: pos.x,
      y: pos.y,
      key: arch.key,
      name: arch.name,
      hp: Math.round(arch.hp * scale),
      maxHp: Math.round(arch.hp * scale),
      atk: Math.round(arch.atk * scale),
      def: Math.round(arch.def * (1 + (floor - 1) * 0.16)),
      xpReward: Math.round(arch.xp * scale),
      shardReward: Math.round(arch.shards * (1 + (floor - 1) * 0.2)),
      cycle: arch.cycle,
      done: false,
    });
  }

  // 1 Runic Riddle Pillar
  const rPos = takeSpot();
  const availRiddles = DUNGEON_RIDDLES.filter((r) => !usedRiddleIds.includes(r.id));
  const riddlePool = availRiddles.length ? availRiddles : DUNGEON_RIDDLES;
  const riddle = riddlePool[Math.floor(Math.random() * riddlePool.length)];
  if (rPos) {
    entities.push({ id: nextId(), type: 'riddle', x: rPos.x, y: rPos.y, riddleId: riddle.id, done: false });
  }

  // 1 Brazier (+40 Torch)
  const bPos = takeSpot();
  if (bPos) entities.push({ id: nextId(), type: 'brazier', x: bPos.x, y: bPos.y, done: false });

  // 1 Open Wing Chest
  const cPos = takeSpot();
  if (cPos) entities.push({ id: nextId(), type: 'chest', x: cPos.x, y: cPos.y, isSecretVault: false, done: false });

  // 1 Herb Patch
  const hPos = takeSpot();
  if (hPos) entities.push({ id: nextId(), type: 'herb', x: hPos.x, y: hPos.y, done: false });

  // 1 Shrine
  const sPos = takeSpot();
  if (sPos) entities.push({ id: nextId(), type: 'shrine', x: sPos.x, y: sPos.y, done: false });

  // 1 Lore Tablet
  const lPos = takeSpot();
  if (lPos) entities.push({ id: nextId(), type: 'lore', x: lPos.x, y: lPos.y, done: false });

  // 2 Hidden Traps
  for (let t = 0; t < 2; t++) {
    const tPos = takeSpot();
    if (tPos) {
      entities.push({ id: nextId(), type: 'trap', x: tPos.x, y: tPos.y, detected: false, disarmed: false, done: false });
    }
  }

  const fov = Array.from({ length: DUNGEON_HEIGHT }, () => Array(DUNGEON_WIDTH).fill(0));
  const dungeon = {
    floor,
    tiles,
    fov,
    playerX: entranceX,
    playerY: entranceY,
    entranceX,
    entranceY,
    bossGate,
    torch: 100,
    keys: 0,
    steps: 0,
    bossDefeated: false,
    sensedHint: null,
    entities,
    satchel: {
      shards: 0,
      coins: 0,
      herbs: 0,
      items: [],
      questRelics: [],
    },
  };

  updateDungeonFov(dungeon, visionRadius, intuition);
  return dungeon;
}
