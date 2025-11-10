// Platanus Hack 25: Late to the Hackathon
// A Crazy Climber inspired game where you race to reach the hackathon floor!

// =============================================================================
// ARCADE BUTTON MAPPING - COMPLETE TEMPLATE
// =============================================================================
const ARCADE_CONTROLS = {
  // ===== PLAYER 1 CONTROLS =====
  'P1U': ['w'],
  'P1D': ['s'],
  'P1L': ['a'],
  'P1R': ['d'],

  // Action Buttons - Right hand on home row area (ergonomic!)
  // Top row (ABC): U, I, O  |  Bottom row (XYZ): J, K, L
  'P1A': ['u'],
  'P1B': ['i'],
  'P1C': ['o'],
  'P1X': ['j'],
  'P1Y': ['k'],
  'P1Z': ['l'],
  'START1': ['1', 'Enter'],

  // ===== PLAYER 2 CONTROLS =====
  'P2U': ['ArrowUp'],
  'P2D': ['ArrowDown'],
  'P2L': ['ArrowLeft'],
  'P2R': ['ArrowRight'],

  // Action Buttons - Left hand (avoiding P1's WASD keys)
  // Top row (ABC): R, T, Y  |  Bottom row (XYZ): F, G, H
  'P2A': ['r'],
  'P2B': ['t'],
  'P2C': ['y'],
  'P2X': ['f'],
  'P2Y': ['g'],
  'P2Z': ['h'],
  'START2': ['2']
};

// Build reverse lookup: keyboard key → arcade button code
const KEYBOARD_TO_ARCADE = {};
for (const [arcadeCode, keyboardKeys] of Object.entries(ARCADE_CONTROLS)) {
  if (keyboardKeys) {
    const keys = Array.isArray(keyboardKeys) ? keyboardKeys : [keyboardKeys];
    keys.forEach(key => {
      KEYBOARD_TO_ARCADE[key] = arcadeCode;
    });
  }
}

// =============================================================================
// GAME CONSTANTS
// =============================================================================
const GAME_CONFIG = {
  // Display (320x240 scaled to 800x600)
  GAME_WIDTH: 320,
  GAME_HEIGHT: 240,
  SCALE: 2.5, // 320 * 2.5 = 800, 240 * 2.5 = 600

  // Building
  BUILDING_WIDTH: 200, // pixels in game coords
  BUILDING_VISUAL_COLUMNS: 6,
  BUILDING_ACTUAL_COLUMNS: 13, // players can be between visual columns
  TOTAL_ROWS: 100,
  ROW_HEIGHT: 12, // pixels per row
  GOAL_FLOOR: 90, // Win at row 90

  // Player
  PLAYER_WIDTH: 30,
  PLAYER_HEIGHT: 30,
  CLIMB_STEP_DURATION: 100, // ms per animation state
  HORIZONTAL_MOVE_SPEED: 60, // pixels per second

  // Obstacles
  OBSTACLE_SIZE: 14, // 14x14 pixels
  OBSTACLE_SPAWN_INTERVAL: 1000, // ms between spawns
  OBSTACLE_FALL_SPEED: 100, // pixels per second
  OBSTACLE_START_ROW: 10, // Obstacles only start falling after this row

  // Guard AI
  GUARD_CLIMB_MIN_DELAY: 700, // Min ms between climb steps
  GUARD_CLIMB_MAX_DELAY: 900, // Max ms between climb steps
  GUARD_CHASE_SPEED: 0.02, // How aggressively guard moves toward player (0-1)
  GUARD_INITIAL_SLOW_MULTIPLIER: 0.7, // Guard is slower initially (until row 10)
  GUARD_OFFSCREEN_BOOST: 2.5, // Speed multiplier when guard is off-camera below players

  // Camera
  CAMERA_SMOOTH: 0.08,
  CAMERA_OFFSET: 20 // pixels below center
};

// =============================================================================
// PC-66 COLOR PALETTE
// =============================================================================
// PC-66 Palette from Lospec - 66 colors for retro arcade feel
const PALETTE = [
  0x000000, 0x24222a, 0x4e4b5b, 0x7b768e, 0xaba4c1, 0xd3cde7, 0xfefdfe, 0xffefa8,
  0xe2b35a, 0x9f5611, 0x6e2100, 0x390800, 0x5e2e00, 0x915f01, 0xe6c429, 0xeceab7,
  0xd2fe7d, 0xc1e12c, 0x989800, 0x5b4d00, 0x362400, 0x004d03, 0x0c6d00, 0x2b9200,
  0x7ec43f, 0xb2da73, 0xc8feae, 0x83fe6b, 0x00fe00, 0x00cb22, 0x006d45, 0x004d3d,
  0x206100, 0x019000, 0x0bba3d, 0x2eda91, 0x4fffca, 0xd0fff6, 0xa9fbee, 0x01ffff,
  0x009cbe, 0x006092, 0x004373, 0x006cdc, 0x6dd0ff, 0xb6f3ff, 0xa4dbff, 0x687aff,
  0x0147ff, 0x0017c5, 0x140c81, 0x4200a5, 0x8d00f9, 0xc84ff5, 0xea9bf3, 0xf8dcf7,
  0xf49fb3, 0xf6629d, 0xff0092, 0xcc0095, 0xa30092, 0x920030, 0xc1003f, 0xff0000,
  0xf5765d, 0xd11717, 0xa41c1c, 0xab8169, 0x7c6822, 0xffc7ba, 0x254c93,
];

// Environment color palette from PC-66
const ENV_COLORS = {
  SKY: PALETTE[46],             // 0xa9fbee - sky blue
  GLASSB: PALETTE[41],      // 0x006092 - dark blue glass
  GLASSSTR: PALETTE[43],    // 0x006cdc - blue streaks
  GLASSW1: PALETTE[44],  // 0x6dd0ff - light blue windows
  GLASSW2: PALETTE[46],  // 0xa4dbff - alternate blue windows
  GLASSREF: PALETTE[45],// 0xb6f3ff - window highlights
  METAL1: PALETTE[4],      // 0xaba4c1 - metallic structure
  METAL2: PALETTE[5],  // 0xd3cde7 - metallic highlights
  BASE1: PALETTE[3],    // 0x7b768e - sidewalk base
  BASE2: PALETTE[2],    // 0x4e4b5b - dark concrete
  BASE3: PALETTE[3],   // 0x7b768e - light concrete
  PANEL_LINE: PALETTE[2],       // 0x4e4b5b - panel divisions
  GOAL_MARKER: PALETTE[53],     // 0xc84ff5 - magenta goal
};

// Color character mapping (~ and ^ are semantic codes, not colors)
const COLOR_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%&*()_+-=[]{};:,./<>?`"';

// Build color lookup from character to actual color
const COLOR_MAP = {};
for (let i = 0; i < COLOR_CHARS.length; i++) {
  if (i < PALETTE.length) {
    COLOR_MAP[COLOR_CHARS[i]] = PALETTE[i];
  }
}
COLOR_MAP['.'] = null; // Dot is transparent/empty
COLOR_MAP[' '] = null; // Space also transparent (for old format compatibility)

// =============================================================================
// CHARACTER DEFINITIONS (for character selection)
// =============================================================================
const CHARACTERS = [
  // Character 1: Default hacker (existing sprite)
  {
    id: 0,
    name: 'Bodoque',
    sprites: {
      IDLE: '~~9.4.1[9.7.9.4.1[2.2[9.3.9.2[2.1[2.1[2.2[9.8.2[3.1[2.1[3.2[8.8.3[2.1[2.1[2.3[8.8.2A3.4[3.2A8.7.1A1G3.6[3.1G1A7.6.2A1G3.6[3.1G2A6.6.1A1G4.6[4.1G1A6.6.1A1G1A1G1A2.4[2.1A1G1A1G1A6.8.1A1G1A1G6A1G1A1G1A8.9.1.1A1G1A4G1A1G1A9.1.9.4.5A9.3.9.4.4G9.4.9.3.6A9.3.9.3.6G9.3.9.3.6A9.3.9.2.8[9.2.9.2.9[9.1.9.1.2[7.1[9.1.9.2[8.2[9.^^^9.1.2[6.2[9.1.9.3[6.3[9.~~',
      LUP0: null, // Will be created as horizontal mirror of RUP0
      LUP1: null, // Will be created as horizontal mirror of RUP1
      RUP0: '9.4.1[9.7.9.4.1[2.2[9.3.9.4.1[2.1[9.4.9.4.1[2.1[2.3[8.9.4.1[2.1[3.2[8.9.4.4[3.2A8.9.3.6[2.3G7.9.3.6[3.2A7.9.3.6[3.2G7.9.4.4[3.2A8.9.1.1A1G6A1G1A2G8.9.1G1A1G1A4G1A1G1A9.1.8.1A1G1A2.5A9.3.8.3A2.4G9.4.9.2G2.4A9.4.9.1.2A1.4G9.4.9.1.3[5A9.3.9.1.1[1.6G1.2[9.9.3.5A5[8.9.2.8[1.2[8.9.2.7[2.2[8.9.1.3[7.2[8.9.1.2[8.2[8.9.1.1[9.3[7.9.1.1[9.9.1.9.1.2[9.9.9.3[9.9.~~~',
      RUP1: '9.4.1[9.7.9.4.1[2.2[1.3[8.9.4.1[2.1[3.2[8.9.4.1[2.1[3.2A8.9.4.1[2.1[3.1A2G7.9.4.4[4.2A7.9.3.6[3.2G7.9.3.6[3.2A7.9.3.6[2.2G8.9.4.4[2.2A9.9.4.6A2G9.9.1.1A1G1A5G1A9.2.9.1G1A1G6A9.3.9.1G1A2.4G9.4.9.2A2.4A9.4.9.1.2G1.4G9.4.9.1.2A1.4A9.4.9.1.3[4G9.4.9.1.1[2.4A9.4.9.4.4G9.4.9.4.4A9.4.9.4.4[9.4.9.3.6[9.3.9.2.3[2.2[9.3.9.2.2[4.2[9.2.^9.2.1[5.2[9.2.9.1.2[6.1[9.2.9.3[6.2[9.1.~',
      FRONT: '9.3.2[3.2[9.2.9.3.2[2.3[9.2.9.3.2[2.2[9.3.^^9.3.7[9.2.9.3.1[1A2[1A2[9.2.^9.3.2[2O3[9.2.9.4.5[9.3.9.4.5A9.3.9.3.7G9.2.9.2.1G7A1G9.1.9.2.1A1.5G1.1A9.1.9.2.1G1.5A1.1G9.1.9.2.1A1.5G1.1A9.1.9.2.1G1.5A1.1G9.1.9.2.1A1.5G1.1A9.1.9.1.2[1.5A1.2[9.9.1.2[1.5G1.2[9.9.4.5A9.3.9.4.5[9.3.^9.4.1[3.1[9.3.^^^^9.3.2[2.2[9.3.^',
    }
  },
  // Character 2: Empty (to be designed)
  {
    id: 1,
    name: 'Condorito',
    sprites: {
      IDLE: '~~~~9.2;3.2[3.2;9.8.2;3.4;3.2;8.8.3;1.6;1.3;8.8.2;1.8;1.2;8.7.2;2.8;2.2;7.6.3;2.8;2.3;6.6.2;4.6;4.2;6.6.4;1[3.3=2.1[4;6.8.2;3[4G3[2;8.9.1.9[1[9.1.9.3.6[9.3.9.4.4[9.4.9.3.6[9.3.^9.3.6A9.3.9.2.8A9.2.9.2.9A9.1.9.1.2A7.1A9.1.9.2A8.2A9.9.2;8.2;9.^^9.1.2[6.2[9.1.9.3[6.3[9.~~',
      LUP0: null,
      LUP1: null,
      RUP0: '~~9.5.2[9.5.9.4.4;2.3;8.9.3.6;2.2;8.9.2.8;1.2;8.9.2.8;1.3;7.9.2.8;2.2;7.9.3.6;3.2;7.9.5.3=3.1[1;8.9.1.3[4G4[1;8.9.1;9[1[9.1.8.2;3.5[9.3.8.2;3.4[9.4.9.2;2.4[9.4.9.1.2;1.4[9.4.9.1.3;4[1A9.3.9.1.1;1.6A1.2;9.9.3.7A3;8.9.2.8A1.2;8.9.2.7A2.2;8.9.1.1;2A7.2;8.9.1.2;8.1[1;8.9.1.1;9.3[7.9.1.1;9.9.1.9.1.2[9.9.9.3[9.9.~~~',
      RUP1: '~9.9.1.3;8.9.5.2[4.2;8.9.4.4;3.2;8.9.3.6;3.2;7.9.2.8;2.2;7.^9.2.8;2.1;8.9.3.6;2.2;8.9.5.3=2.2;9.9.4.4G2[2;9.9.1.9[9.2.9.1;8[9.3.9.2;2.4[9.4.^9.1.1;2.4[9.4.^9.1.2;1.4[9.4.9.1.1;2.4[9.4.9.4.4A9.4.^^9.3.6A9.3.9.2.3A2.2A9.3.9.2.2;4.2;9.2.^9.2.1;5.2;9.2.9.1.2[6.1[9.2.9.3[6.2[9.1.~',
      FRONT: '~~9.3.5[9.4.9.2.6[9.4.9.2.2[5;9.3.9.3.2;1A1G3;9.2.9.1.4;1A1G3;9.2.9.1.9;9.2.9.1.2;3]4;9.2.9.2.1;1.1]4;9.3.9.5.3=9.4.9.4.5G9.3.9.3.7[9.2.9.2.9[9.1.^9.2.1;1.5[1.1;9.1.^^^9.1.2;1.5A1.2;9.^9.4.5A9.3.^9.4.1A3.1A9.3.^9.4.1;3.1;9.3.^^9.3.1[1;2.1[1;9.3.9.3.2[2.2[9.3.',
    }
  },
  // Character 3: Empty (to be designed)
  {
    id: 2,
    name: 'Arturo Vidal',
    sprites: {
      IDLE: '~~~9.5.2A9.5.8.2{2.2{2A2{2.2{8.7.2{2.3{2A3{2.2{7.7.3{1.3{2A3{1.3{7.7.2{2.3{2A3{2.3{6.6.3{2.8{3.2{6.5.3{3.8{3.3{5.5.3{1:3.1J4{1J3.4{5.5.1{3:3.6[2.3:1{6.6.1:9[6[1:7.7.9[6[8.9.9[2[9.1.9.2.8[9.2.^^^^9.2.8:9.2.^9.1.9:1:9.1.9.1.3{1:2.1:3{9.1.9.4{4.4{9.9.3:6.3:9.^^9.3A6.3A9.8.4A6.4A8.',
      LUP0: null,
      LUP1: null,
      RUP0: '~9.5.2A9.5.9.3.2{2A2{9.3.9.2.3{2A3{1.3{7.9.2.3{2A3{2.3{6.9.2.3{2A3{3.2{6.9.2.8{3.2{6.9.2.8{2.3{6.9.3.1J4{1J3.3{6.9.3.6:2.2:1{7.9.9[3[2:7.8.9[6[7.7.3:9[3[8.7.3{1.8[9.2.^8.2{1.8[9.2.8.3{8[9.2.8.2{1.9:1{9.9.2.9:2{8.^9.2.3:5.2{1:8.9.1.4{5.3:8.9.1.3{6.3:8.9.1.3:6.3A8.9.1.3:6.4A7.9.1.3:9.8.9.1.3A9.8.9.4A9.8.~~',
      RUP1: '9.9.3.3{6.9.5.2A6.3{5.9.3.2{2A2{4.3{5.9.2.3{2A3{4.2{5.^^9.2.8{3.3{5.9.2.8{2.1:3{5.9.3.1J4{1J2.1[2:1{6.9.3.6:1.3[1:7.9.2.9[2[8.9.9[3[9.8.9[2[9.2.7.3:9[9.2.7.3{1.8[9.2.^^^^7.2{2.8:9.2.9.2.8:9.2.9.2.3:2.3:9.2.9.2.3{2.3{9.2.^9.1.3{4.3{9.1.9.1.3:4.3:9.1.^^9.1.3A4.3A9.1.9.4A4.4A9.',
      FRONT: '9.5.2A9.5.9.3.2{2A2{9.3.9.2.8{9.2.9.2.3U2{3U9.2.9.2.1{2A2{2A1{9.2.9.2.8{9.2.9.2.3{2U3{9.2.9.2.1U1{1U2F1U1{1U9.2.9.3.6U9.3.9.1.2[6:2[9.1.9.9[3[9.^9.7[2F3[9.9.2:5[2F1[2:9.9.2{5[2F1[2{9.9.2{8[2{9.^^^9.2{8:2{9.9.2.8:9.2.^9.2.3:2.3:9.2.9.2.3{2.3{9.2.^9.2.3:2.3:9.2.^^9.2.3A2.3A9.2.^',
    }
  },
  // Character 4: Empty (to be designed)
  {
    id: 3,
    name: 'Character 4',
    sprites: {
      IDLE: '~'.repeat(30),
      LUP0: null,
      LUP1: null,
      RUP0: '~'.repeat(30),
      RUP1: '~'.repeat(30),
      FRONT: '~'.repeat(30),
    }
  },
];

// Guard sprites (reuses player sprites for now)
const GUARD_SPRITES = {
  IDLE: '~~~9.2.8A9.2.8.2{1.8A1.2{8.7.2{2.8A2.2{7.7.3{1.8U1.3{7.7.2D2.8U2.2D7.6.3A2.8U2.3A6.5.3A3.1{6U1{3.3A5.5.4A3.6{3.4A5.5.4A3.6A2.5A5.6.9A8A7.7.9A6A8.9.9A2A9.1.9.2.8A9.2.^^9.2.1B2}5B9.2.^9.2.8A9.2.^9.1.9A1A9.1.9.1.4A2.4A9.1.9.4A4.4A9.9.3A6.3A9.^^9.3B6.3B9.8.4B6.4B8.',
  LUP0: null, // Will be mirrored from RUP0 below
  LUP1: null, // Will be mirrored from RUP1 below
  RUP0: '~9.2.8A9.2.^9.2.8A1.4{6.9.2.8U2.3{6.9.2.8U2.3D6.9.2.8U2.3A6.9.2.1{6U1{2.3A6.9.3.6{3.3A6.9.3.6A2.4A6.9.9A5A7.8.9A6A7.7.9A6A8.7.3A1.8A9.2.^8.2D1.8A9.2.8.3{1B2}5B9.2.8.2{1.1B2}5B2A9.9.2.9A2A8.^9.2.6A2.3A8.9.1.4A5.3A8.9.1.3A6.3A8.9.1.3A6.3B8.9.1.3A6.4B7.9.1.3A9.8.9.1.3B9.8.9.4B9.8.~~',
  RUP1: '9.9.3.4{5.9.2.8A3.3{5.9.2.8A3.3D5.9.2.8A3.3A5.9.2.8U3.3A5.^9.2.8U2.4A5.9.2.1{6U1{2.4A5.9.3.6{3.3A6.9.3.6A1.4A7.9.2.9A2A8.9.9A3A9.8.9A2A9.2.7.9A3A9.2.7.3A1.8A9.2.^^7.3D1.1B2}5B9.2.7.3{1.1B2}5B9.2.7.2{2.8A9.2.9.2.8A9.2.^^9.1.4A2.4A9.1.^9.1.3A4.3A9.1.^^9.1.3B4.3B9.1.9.4B4.4B9.',
  FRONT: '9.2.8A9.2.9.2.2A4O2A9.2.^9.2.3U2O3U9.2.9.2.8q9.2.9.2.3q2{3q9.2.9.2.3{2U3{9.2.9.2.2{1U2J1U2{9.2.9.3.6{9.3.9.1.2A2D2A2D2A9.1.9.4A1D2A1D4A9.^9.9A3A9.^^^^9.2D3B2O3B2D9.9.2{3B2O3B2{9.9.2{8A2{9.9.2.8A9.2.^9.2.3A2.3A9.2.^^^^^^^',
};

// Mirror sprites for guard (must be done after GUARD_SPRITES is defined)
GUARD_SPRITES.LUP0 = mirrorSpriteHorizontally(GUARD_SPRITES.RUP0);
GUARD_SPRITES.LUP1 = mirrorSpriteHorizontally(GUARD_SPRITES.RUP1);

// Initialize LUP0 and LUP1 as mirrored versions to save space
// Mirror sprites to create LUP0 and LUP1 from RUP0 and RUP1 for all characters
CHARACTERS.forEach(char => {
  char.sprites.LUP0 = mirrorSpriteHorizontally(char.sprites.RUP0);
  char.sprites.LUP1 = mirrorSpriteHorizontally(char.sprites.RUP1);
});

// Player animation cycle for climbing
const CLIMB_CYCLE = ['IDLE', 'RUP0', 'RUP1', 'RUP0', 'IDLE', 'LUP0', 'LUP1', 'LUP0', 'IDLE'];

// Debug mode
const DEBUG = false;

// Game States
const GAME_STATES = {
  CINEMATIC: 'CINEMATIC',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER'
};

// =============================================================================
// SPRITE RENDERING HELPERS
// =============================================================================

// CSEF Decoder: Compact Sprite Encoding Format
// Format: <digit><char> where digit is run-length (1-9) and char is color code
// Semantic codes:
//   ~ = full row of empty pixels (must appear at row boundary)
//   ^ = repeat previous row
function parseCSEF(s, w) {
  const r = [], p = [];
  for (let i = 0; i < s.length;) {
    if (!p.length) {
      if (s[i] === '~') { r.push(Array(w).fill('.')); i++; continue; }
      if (s[i] === '^') { if (r.length) r.push([...r.at(-1)]); i++; continue; }
    }
    const n = +s[i], c = s[i + 1];
    if (!n || n > 9) { i++; continue; }
    p.push(...Array(n).fill(c));
    while (p.length >= w) r.push(p.splice(0, w));
    i += 2;
  }
  if (p.length) r.push(p);
  return r;
}

// Parse sprite using CSEF (Compact Sprite Encoding Format)
// Can accept either a CSEF string or a pre-parsed 2D array
function parseSprite(spriteData, width = 30) {
  if (!spriteData) return [];
  // If it's already an array, return it directly
  if (Array.isArray(spriteData)) return spriteData;
  // Otherwise parse as CSEF string
  return parseCSEF(spriteData, width);
}

function mirrorSpriteHorizontally(spriteString, width = GAME_CONFIG.PLAYER_WIDTH) {
  // Parse sprite and mirror each row
  const spriteData = parseCSEF(spriteString, width);

  // Mirror each row
  const mirrored = spriteData.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < width) paddedRow.push(' ');
    return paddedRow.reverse();
  });

  // Return the 2D array directly (no need to encode back to string)
  return mirrored;
}

function drawSprite(graphics, spriteData, x, y, options = {}) {
  // Draw sprite pixel by pixel using global COLOR_MAP
  if (!spriteData || spriteData.length === 0) return;

  // Calculate sprite dimensions
  const spriteHeight = spriteData.length;
  const spriteWidth = spriteData[0] ? spriteData[0].length : 0;
  if (spriteWidth === 0) return;

  // Calculate center offset dynamically
  const centerOffsetX = spriteWidth / 2;
  const centerOffsetY = spriteHeight / 2;

  // Draw shadow first (offset down and right by 1-2 pixels)
  const shadowOffsetX = 1;
  const shadowOffsetY = 2;
  if (!options.noShadow) {
    for (let row = 0; row < spriteHeight; row++) {
      for (let col = 0; col < spriteData[row].length; col++) {
        const char = spriteData[row][col];
        const color = COLOR_MAP[char];

        if (color !== null && color !== undefined) {
          graphics.fillStyle(PALETTE[0], 0.3); // Black shadow
          graphics.fillRect(
            Math.floor(x - centerOffsetX + col + shadowOffsetX),
            Math.floor(y - centerOffsetY + row + shadowOffsetY),
            1,
            1
          );
        }
      }
    }
  }

  // Draw actual sprite
  for (let row = 0; row < spriteHeight; row++) {
    for (let col = 0; col < spriteData[row].length; col++) {
      const char = spriteData[row][col];
      const color = COLOR_MAP[char];

      if (color !== null && color !== undefined) {
        graphics.fillStyle(color, 1);
        graphics.fillRect(
          Math.floor(x - centerOffsetX + col),
          Math.floor(y - centerOffsetY + row),
          1,
          1
        );
      }
    }
  }

  // Debug border
  if (DEBUG && options.showSpriteBorder) {
    graphics.lineStyle(1, 0xff00ff, 1);
    graphics.strokeRect(
      Math.floor(x - centerOffsetX),
      Math.floor(y - centerOffsetY),
      spriteWidth,
      spriteHeight
    );
  }
}

// Horizontal movement animation cycle (alternates between left and right arm reaching)
const HORIZONTAL_CYCLE = ['LUP0', 'RUP0'];

// =============================================================================
// OBSTACLE TYPES (14x14 pixels)
// =============================================================================
const OBSTACLE_TYPES = {
  OBJ1: {
    name: 'OBJ1',
    sprite: '1.9A2A2.1.9C1C1B1A1.1.1C7e1f1C2B1A1.1C1e3i3e1f1C2B1A1.1C7e1f1C2B1A^^1.1C8f1C2B1A1.9C1C1B1A1.3.4A4B3.2.9C1C1B1.1.6C4B2C1A1.9C3C1A~',
  },
  OBJ2: {
    name: 'OBJ2',
    sprite: '3.1Y1h4.2Y1h2.2.3Y1h3.2Y2h1.2.4Y1h1.3Y2h1.3.3Y1h1.2Y3h1.4.6Y2h2.6.1Y4h3.6.1Y1h6.1.9M3M1.1.9J2J1M1.1.9M3M1.2.1N7J2M2.2.2N6J2M2.2.2N5J3M2.3.1N5J2M3.',
  },
  OBJ3: {
    name: 'OBJ3',
    sprite: '4.8I1N1.^4.9N1.5.5I1N1M2.^^5.6N1M2.3.9I1N1.2.8I2N1M1.1.9N1N2M1.1.2M1.2M2.2M1.2M1.^^^',
  }
};

// =============================================================================
// OBSTACLE ENTITY CLASS
// =============================================================================
class Obstacle {
  constructor(scene, x, y, type) {
    try {
    this.scene = scene;
      this.x = x;
      this.y = y;
      this.type = type;
      this.rotation = 0;
      this.active = true;

      // Collider
      this.size = GAME_CONFIG.OBSTACLE_SIZE;

      // Graphics
      this.graphics = scene.add.graphics();
      this.graphics.setDepth(15);

      console.log(`Obstacle created: ${type.name} at (${x}, ${y})`);
    } catch (error) {
      console.error('Error in Obstacle constructor:', error);
      this.active = false;
    }
  }

  getColliderBounds() {
    return {
      left: this.x - this.size / 2,
      right: this.x + this.size / 2,
      top: this.y - this.size / 2,
      bottom: this.y + this.size / 2,
      centerX: this.x,
      centerY: this.y,
      width: this.size,
      height: this.size
    };
  }

  update(delta) {
    try {
      if (!this.active) return;

      // Fall down
      this.y += GAME_CONFIG.OBSTACLE_FALL_SPEED * (delta / 1000);

      // Rotate while falling
      this.rotation += (delta / 1000) * 3; // 3 radians per second

      // Remove if fallen far below camera view
      const cameraBottomY = this.scene.cameraTargetY + (GAME_CONFIG.GAME_HEIGHT / 2);
      if (this.y > cameraBottomY + 200) {
        this.destroy();
      }

      this.draw();
    } catch (error) {
      console.error('Error updating obstacle:', error);
      this.destroy();
    }
  }

  draw() {
    try {
      this.graphics.clear();

      // Debug collider (always draw for visibility)
      if (DEBUG) {
        const bounds = this.getColliderBounds();
        this.graphics.lineStyle(1, 0xff0000, 1);
        this.graphics.strokeRect(
          bounds.left,
          bounds.top,
          bounds.width,
          bounds.height
        );
      }

      // Get sprite data
      const spriteData = parseSprite(this.type.sprite, GAME_CONFIG.OBSTACLE_SIZE);

      if (spriteData && spriteData.length > 0) {
        // Draw without rotation first (simpler)
        drawSprite(this.graphics, spriteData, this.x, this.y, {
          noShadow: true, // Too small for shadow
          showSpriteBorder: false
        });
      }
    } catch (error) {
      console.error('Error drawing obstacle:', error);
    }
  }

  destroy() {
    this.active = false;
    this.graphics.destroy();
  }
}

// =============================================================================
// BASE CHARACTER CLASS (for code reuse)
// =============================================================================
class Character {
  constructor(scene, playerNum, col, row) {
    this.scene = scene;
    this.playerNum = playerNum;
    this.col = col;
    this.row = row;

    // Position
    this.x = this.colToX(col);
    this.y = this.rowToY(row);
    this.targetX = this.x;
    this.targetY = this.y;

    // Animation state
    this.animState = 'IDLE';
    this.animIndex = 0;
    this.animTimer = 0;
    this.isClimbing = false;
    
    // Collision box (14x26 centered in 30x30 sprite)
    this.colliderWidth = 14;
    this.colliderHeight = 26;

    // Graphics
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(50);
  }

  colToX(col) {
    const buildingStartX = (GAME_CONFIG.GAME_WIDTH - GAME_CONFIG.BUILDING_WIDTH) / 2;
    const colWidth = GAME_CONFIG.BUILDING_WIDTH / (GAME_CONFIG.BUILDING_ACTUAL_COLUMNS - 1);
    return buildingStartX + col * colWidth;
  }

  rowToY(row) {
    const startY = GAME_CONFIG.GAME_HEIGHT - 20;
    return startY - (row * GAME_CONFIG.ROW_HEIGHT);
  }

  getColliderBounds() {
    return {
      left: this.x - this.colliderWidth / 2,
      right: this.x + this.colliderWidth / 2,
      top: this.y - this.colliderHeight / 2,
      bottom: this.y + this.colliderHeight / 2,
      centerX: this.x,
      centerY: this.y,
      width: this.colliderWidth,
      height: this.colliderHeight
    };
  }

  checkCollision(otherBounds) {
    const myBounds = this.getColliderBounds();
    return !(
      myBounds.right < otherBounds.left ||
      myBounds.left > otherBounds.right ||
      myBounds.bottom < otherBounds.top ||
      myBounds.top > otherBounds.bottom
    );
  }

  getWorldY() {
    return this.y;
  }

  destroy() {
    if (this.graphics) {
      this.graphics.destroy();
    }
  }
}

// =============================================================================
// PLAYER ENTITY CLASS
// =============================================================================
class Player extends Character {
  constructor(scene, playerNum, col, row, character) {
    // Call parent constructor first
    super(scene, playerNum, col, row);

    // Character selection (stores which character sprites to use)
    this.character = character;
    this.sprites = character.sprites;

    // Player-specific properties (base properties already set by Character)
    this.targetRow = row;

    // Input state
    this.inputUp = false;
    this.inputDown = false;
    this.inputLeft = false;
    this.inputRight = false;

    // Movement state (isClimbing already set by Character)
    this.isMovingHorizontal = false;
    this.horizontalAnimIndex = 0; // Start at LUP0

    // Lives
    this.lives = 3;
    this.isDead = false;
    this.isFalling = false;
    this.fallVelocity = 0;
    this.fallRotation = 0;

    // Caught by guard state
    this.isCaught = false;
    this.lostAnimTimer = 0;
    this.lostAnimState = 'LUP0'; // Alternates between LUP0 and RUP0

    // Falling one row state (becomes an obstacle to other players)
    this.isFallingOneRow = false;
    this.fallOneRowTimer = 0;
    this.fallOneRowDuration = 600; // 600ms fall animation (climbing down animation)

    // Collision box offsets (colliderWidth/Height already set by Character)
    this.colliderOffsetX = (GAME_CONFIG.PLAYER_WIDTH - this.colliderWidth) / 2; // 8
    this.colliderOffsetY = (GAME_CONFIG.PLAYER_HEIGHT - this.colliderHeight) / 2; // 2

    // Override graphics depth for players
    this.graphics.setDepth(10);
  }
  
  // Check collision with another player (player-specific)
  checkPlayerCollision(otherPlayer) {
    if (otherPlayer.isDead || this.isDead) return false;
    return this.checkCollision(otherPlayer.getColliderBounds());
  }

  // Check if moving to a specific row would cause collision
  wouldCollideAtRow(newRow, otherPlayers) {
    // Check if there's a player at the destination row that would block us
    for (let other of otherPlayers) {
      if (other === this || other.isDead || other.isFalling || other.isFallingOneRow) continue;

      // Only check if the other player is actually AT the destination row
      // Players at the current row or far away shouldn't block vertical movement
      if (other.row !== newRow) continue;

      // Check if there's horizontal overlap with the other player
      const myLeft = this.x - this.colliderWidth / 2;
      const myRight = this.x + this.colliderWidth / 2;
      const otherLeft = other.x - other.colliderWidth / 2;
      const otherRight = other.x + other.colliderWidth / 2;

      const horizontalOverlap = !(myRight < otherLeft || myLeft > otherRight);

      // Block if there's horizontal overlap at the destination row
      if (horizontalOverlap) return true;
    }

    return false;
  }

  setInput(up, down, left, right) {
    this.inputUp = up;
    this.inputDown = down;
    this.inputLeft = left;
    this.inputRight = right;
  }

  update(delta) {
    // Handle LOST animation (caught by guard)
    if (this.isCaught) {
      this.lostAnimTimer += delta;

      // Alternate between LUP0 and RUP0 every 200ms
      if (this.lostAnimTimer >= 200) {
        this.lostAnimTimer = 0;
        this.lostAnimState = this.lostAnimState === 'LUP0' ? 'RUP0' : 'LUP0';
      }

      this.draw();
      return; // Don't process anything else
    }

    // Handle falling animation (Mario-like)
    if (this.isFalling) {
      this.fallVelocity += 500 * (delta / 1000); // Gravity acceleration
      this.y += this.fallVelocity * (delta / 1000);
      this.fallRotation += (delta / 1000) * 5; // Rotate while falling
      
      // Keep target positions synced to prevent interpolation from pulling player back
      this.targetX = this.x;
      this.targetY = this.y;

      // Check if hit the ground (floor level)
      const floorLevel = GAME_CONFIG.GAME_HEIGHT;
      if (this.y >= floorLevel) {
        this.y = floorLevel;
        this.targetY = this.y; // Lock position
        this.isFalling = false;
        this.fallVelocity = 0;
        this.fallRotation = 0;
        this.isDead = true; // Player is dead if they hit the floor
        console.log(`Player ${this.playerNum} hit the ground and died at y=${this.y}`);
      }

      this.draw();
      return;
    }

    // Handle falling one row (after taking damage but not dead)
    // This just plays the climbing down animation automatically
    if (this.isFallingOneRow) {
      this.fallOneRowTimer += delta;

      // Continue the climbing down animation
      this.animTimer += delta;
      if (this.animTimer >= GAME_CONFIG.CLIMB_STEP_DURATION) {
        this.animTimer = 0;
        this.advanceClimbAnimation(true); // going down
      }

      // Smooth position interpolation (only Y, stay at current X)
      this.x = Phaser.Math.Linear(this.x, this.targetX, 0.2);
      this.y = Phaser.Math.Linear(this.y, this.targetY, 0.15);

      // Finished falling one row
      if (this.fallOneRowTimer >= this.fallOneRowDuration) {
        this.isFallingOneRow = false;
        this.fallOneRowTimer = 0;
        this.isClimbing = false;
        console.log(`Player ${this.playerNum} finished falling one row`);
      }

      this.draw();
      return; // Don't process other input while falling
    }

    if (this.isDead) return;

    // Handle horizontal movement (resets climbing state)
    if (this.inputLeft || this.inputRight) {
      const dir = this.inputLeft ? -1 : 1;

      // Reset climbing animation when moving horizontally
      if (this.isClimbing) {
        this.isClimbing = false;
        this.animIndex = 0; // Reset to IDLE in climb cycle
      }

      // Start horizontal movement animation
      if (!this.isMovingHorizontal) {
        this.isMovingHorizontal = true;
        this.horizontalAnimIndex = 0;
        this.animTimer = 0;
        this.animIndex = 0; // Reset climb cycle index
      }

      // Move continuously (smooth movement)
      const newCol = Phaser.Math.Clamp(this.col + dir * 0.06, 0, GAME_CONFIG.BUILDING_ACTUAL_COLUMNS - 1);
      if (newCol !== this.col) {
        this.col = newCol;
        this.targetX = this.colToX(this.col);
      }

      // Animate between LUP0 and RUP0 for visual climbing feel
      this.animTimer += delta;
      if (this.animTimer >= GAME_CONFIG.CLIMB_STEP_DURATION) {
        this.animTimer = 0;
        this.horizontalAnimIndex = (this.horizontalAnimIndex + 1) % HORIZONTAL_CYCLE.length;
      }
      this.animState = HORIZONTAL_CYCLE[this.horizontalAnimIndex];

    } else {
      // No horizontal input - stop horizontal animation
      if (this.isMovingHorizontal) {
        this.isMovingHorizontal = false;
        this.animState = 'IDLE';
        this.horizontalAnimIndex = 0;
      }
    }

    // Handle vertical climbing (only if not moving horizontally)
    if (!this.isMovingHorizontal) {
      if (this.inputUp && !this.inputDown) {
        if (!this.isClimbing) {
          this.isClimbing = true;
          this.animTimer = 0;
        }

        // Advance through climb animation
        this.animTimer += delta;
        if (this.animTimer >= GAME_CONFIG.CLIMB_STEP_DURATION) {
          this.animTimer = 0;
          this.advanceClimbAnimation();
        }
      } else if (this.inputDown && !this.inputUp) {
        // Climbing down (same animation cycle, but going down)
        if (!this.isClimbing) {
          this.isClimbing = true;
          this.animTimer = 0;
        }

        this.animTimer += delta;
        if (this.animTimer >= GAME_CONFIG.CLIMB_STEP_DURATION) {
          this.animTimer = 0;
          this.advanceClimbAnimation(true); // going down
        }
      } else {
        // No vertical input - stay in current state
        this.isClimbing = false;
      }
    }

    // Smooth position interpolation
    this.x = Phaser.Math.Linear(this.x, this.targetX, 0.2);
    this.y = Phaser.Math.Linear(this.y, this.targetY, 0.15);

    // Update graphics
    this.draw();
  }

  advanceClimbAnimation(goingDown = false) {
    // Move through the climb cycle
    this.animIndex = (this.animIndex + 1) % CLIMB_CYCLE.length;
    this.animState = CLIMB_CYCLE[this.animIndex];

    // Movement happens at LUP1 and RUP1 states (climbing motion)
    if (this.animState === 'LUP1' || this.animState === 'RUP1') {
      const newRow = goingDown ? this.row - 1 : this.row + 1;

      // Clamp to valid rows
      if (newRow >= 0 && newRow <= GAME_CONFIG.TOTAL_ROWS) {
        // Check if this movement would cause a collision
        const wouldCollide = this.wouldCollideAtRow(newRow, this.scene.players);

        if (!wouldCollide) {
          // Only move if no collision
          this.row = newRow;
          this.targetY = this.rowToY(this.row);
        }
        // If blocked, animation continues but position doesn't change
      }
    }
  }

  draw() {
    try {
      this.graphics.clear();

      // Get sprite data for current animation state
      const spriteString = this.sprites[this.animState] || this.sprites.IDLE;
      const spriteData = parseSprite(spriteString, GAME_CONFIG.PLAYER_WIDTH);

      // Draw the sprite (rotation effect is visual only, we just flip/mirror for falling)
      if (this.isCaught) {
        // LOST animation - alternate between LUP0 and RUP0
        const lostSpriteData = parseSprite(this.sprites[this.lostAnimState], GAME_CONFIG.PLAYER_WIDTH);
        drawSprite(this.graphics, lostSpriteData, this.x, this.y, { showSpriteBorder: DEBUG });
      } else if (this.isFalling) {
        // For death fall, we'll alternate the sprite for a tumbling effect
        const tumbleFrame = Math.floor(this.fallRotation * 2) % 2;
        const tumbleSprite = tumbleFrame === 0 ? 'LUP1' : 'RUP1';
        const fallingSpriteData = parseSprite(this.sprites[tumbleSprite], GAME_CONFIG.PLAYER_WIDTH);
        drawSprite(this.graphics, fallingSpriteData, this.x, this.y, { showSpriteBorder: false, noShadow: false });
      } else {
        // Use normal sprite (includes climbing down animation when isFallingOneRow)
        drawSprite(this.graphics, spriteData, this.x, this.y, { showSpriteBorder: DEBUG });
      }

      // Draw debug collider box
      if (DEBUG && !this.isFalling) {
        const bounds = this.getColliderBounds();
        this.graphics.lineStyle(1, 0x00ff00, 1);
        this.graphics.strokeRect(
          bounds.left,
          bounds.top,
          bounds.width,
          bounds.height
        );
      }
    } catch (error) {
      console.error(`Error drawing player ${this.playerNum}:`, error);
    }
  }

  takeDamage() {
    if (this.isDead || this.isFalling) return;

    this.lives--;
    console.log(`Player ${this.playerNum} took damage! Lives remaining: ${this.lives}`);

    if (this.lives <= 0) {
      this.die();
    } else {
      // Player still has lives - fall one row as punishment
      this.fallOneRow();
    }
  }

  fallOneRow() {
    // Make the player fall down one row using the climbing down animation
    if (this.row > 0) {
      // Set flag to prevent input and start animation
      this.isFallingOneRow = true;
      this.fallOneRowTimer = 0;

      // Start climbing down from the middle of the cycle (LUP0)
      // So the next step will be LUP1 which triggers the actual row movement
        this.isClimbing = true;
      this.animIndex = 5; // Start at LUP0 (index 5 in CLIMB_CYCLE)
      this.animState = CLIMB_CYCLE[5]; // 'LUP0'
      this.animTimer = 0;

      console.log(`Player ${this.playerNum} starting to fall one row from row ${this.row}`);
    }
  }

  die() {
    console.log(`Player ${this.playerNum} is dying! Starting fall animation.`);
    this.isFalling = true;
    this.fallVelocity = -200; // Initial upward velocity (Mario bounce)
    this.fallRotation = 0;
    
    // Ensure target positions don't interfere with fall animation
    // Set them to current position so interpolation doesn't pull player back
    this.targetX = this.x;
    this.targetY = this.y;
    
    // Stop all other animations and states
    this.isClimbing = false;
    this.isMovingHorizontal = false;
    this.isFallingOneRow = false;
    this.isCaught = false;
    
    console.log(`Player ${this.playerNum} isFalling: ${this.isFalling}, fallVelocity: ${this.fallVelocity}, position locked at (${this.x}, ${this.y})`);
  }
}

// =============================================================================
// GUARD ENEMY CLASS
// =============================================================================
class Guard extends Character {
  constructor(scene, col, row) {
    super(scene, 0, col, row); // playerNum=0 for guard (not a real player)

    // AI state
    this.nextClimbDelay = this.getRandomClimbDelay();
    this.climbTimer = 0;
    this.targetPlayer = null; // Which player to chase
  }

  getRandomClimbDelay() {
    const min = GAME_CONFIG.GUARD_CLIMB_MIN_DELAY;
    const max = GAME_CONFIG.GUARD_CLIMB_MAX_DELAY;
    return min + Math.random() * (max - min);
  }

  update(delta) {
    // AI: Find target player (chase the highest one)
    this.findTargetPlayer();

    // AI: Move toward target
    if (this.targetPlayer) {
      this.moveTowardTarget(delta);
    }

    // Smooth position interpolation
    this.x = Phaser.Math.Linear(this.x, this.targetX, 0.2);
    this.y = Phaser.Math.Linear(this.y, this.targetY, 0.15);

    // Draw
    this.draw();
  }

  findTargetPlayer() {
    const alivePlayers = this.scene.players.filter(p => !p.isDead && !p.isFalling);

    if (alivePlayers.length === 0) {
      this.targetPlayer = null;
      return;
    }

    // Chase the nearest player (by distance)
    this.targetPlayer = alivePlayers.reduce((nearest, player) => {
      const distToPlayer = Math.sqrt(
        Math.pow(player.x - this.x, 2) + Math.pow(player.y - this.y, 2)
      );
      const distToNearest = Math.sqrt(
        Math.pow(nearest.x - this.x, 2) + Math.pow(nearest.y - this.y, 2)
      );
      return distToPlayer < distToNearest ? player : nearest;
    });
  }

  moveTowardTarget(delta) {
    if (!this.targetPlayer) return;

    const targetRow = this.targetPlayer.row;
    const targetCol = this.targetPlayer.col;

    // Calculate speed multipliers based on game state
    let speedMultiplier = 1.0;
    
    // 1. Initial slow multiplier (before row 10)
    if (this.targetPlayer.row < GAME_CONFIG.OBSTACLE_START_ROW) {
      speedMultiplier *= GAME_CONFIG.GUARD_INITIAL_SLOW_MULTIPLIER;
    }
    
    // 2. Off-screen boost (when guard is below camera view)
    const cameraBottomY = this.scene.cameraTargetY + (GAME_CONFIG.GAME_HEIGHT / 2);
    const guardY = this.getWorldY();
    
    if (guardY > cameraBottomY) {
      // Guard is below camera (off-screen) - boost speed to catch up
      speedMultiplier *= GAME_CONFIG.GUARD_OFFSCREEN_BOOST;
      console.log(`Guard off-screen! Boosting speed (multiplier: ${speedMultiplier})`);
    }

    // Vertical movement (climbing) with speed multiplier
    this.climbTimer += delta * speedMultiplier;

    if (this.climbTimer >= this.nextClimbDelay) {
      this.climbTimer = 0;
      this.nextClimbDelay = this.getRandomClimbDelay();

      // Climb toward target
      if (this.row < targetRow) {
        // Need to climb up
        if (!this.isClimbing) {
        this.isClimbing = true;
          this.animTimer = 0;
          this.animIndex = 0;
        }

        this.advanceClimbAnimation(false); // Climbing up
      } else if (this.row > targetRow) {
        // Need to climb down
        if (!this.isClimbing) {
          this.isClimbing = true;
          this.animTimer = 0;
          this.animIndex = 5; // Start at LUP0 for going down
        }

        this.advanceClimbAnimation(true); // Climbing down
      } else {
        this.isClimbing = false;
      }
    }

    // Continue climbing animation if climbing
    if (this.isClimbing) {
      this.animTimer += delta * speedMultiplier;
      if (this.animTimer >= GAME_CONFIG.CLIMB_STEP_DURATION) {
        this.animTimer = 0;
        const goingDown = this.row > targetRow;
        this.advanceClimbAnimation(goingDown);
      }
    }

    // Horizontal movement (move toward target column) with speed multiplier
    const colDifference = targetCol - this.col;

    if (Math.abs(colDifference) > 0.5) {
      // Move horizontally with chase speed and multiplier
      const direction = colDifference > 0 ? 1 : -1;
      this.col += direction * GAME_CONFIG.GUARD_CHASE_SPEED * speedMultiplier;

      // Clamp to valid columns
      this.col = Math.max(0, Math.min(GAME_CONFIG.BUILDING_ACTUAL_COLUMNS - 1, this.col));

      this.targetX = this.colToX(this.col);
    }
  }

  advanceClimbAnimation(goingDown = false) {
    // Move through the climb cycle
    this.animIndex = (this.animIndex + 1) % CLIMB_CYCLE.length;
    this.animState = CLIMB_CYCLE[this.animIndex];

    // Movement happens at LUP1 and RUP1 states
    if (this.animState === 'LUP1' || this.animState === 'RUP1') {
      const newRow = goingDown ? this.row - 1 : this.row + 1;

      // Clamp to valid rows
      if (newRow >= 0 && newRow <= GAME_CONFIG.TOTAL_ROWS) {
        this.row = newRow;
        this.targetY = this.rowToY(this.row);
      }
    }

    // Stop climbing at IDLE
    if (this.animState === 'IDLE' && this.animIndex === 0) {
      this.isClimbing = false;
    }
  }

  draw() {
    this.graphics.clear();
    
    // Get sprite data for current animation state
    const spriteString = GUARD_SPRITES[this.animState] || GUARD_SPRITES.IDLE;
    const spriteData = parseSprite(spriteString, GAME_CONFIG.PLAYER_WIDTH);

    // Draw the guard sprite (different color tint would be nice, but we'll use same for now)
    drawSprite(this.graphics, spriteData, this.x, this.y, { showSpriteBorder: DEBUG });

    // Draw debug collider box (in red to distinguish from players)
    if (DEBUG) {
      const bounds = this.getColliderBounds();
      this.graphics.lineStyle(1, 0xff0000, 1);
      this.graphics.strokeRect(
        bounds.left,
        bounds.top,
        bounds.width,
        bounds.height
      );
    }
  }
  
  destroy() {
    if (this.graphics) {
      this.graphics.destroy();
    }
  }
}

// =============================================================================
// DIALOG SYSTEM
// =============================================================================
class Dialog {
  constructor(scene) {
    this.scene = scene;
    this.isActive = false;
    this.currentDialog = null;

    // Dialog box dimensions
    this.boxHeight = 60;
    this.boxPadding = 8;
    this.portraitSize = 44; // 44x44 portrait (scaled from 30x30)
    this.portraitPadding = 4;

    // Create graphics objects - use Graphics for everything for consistency
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(2000); // Way above everything
    this.graphics.setScrollFactor(0, 0); // Fixed to camera
    this.graphics.setVisible(true);

    // Portrait graphics
    this.portraitGraphics = scene.add.graphics();
    this.portraitGraphics.setDepth(2001);
    this.portraitGraphics.setScrollFactor(0, 0);
    this.portraitGraphics.setVisible(true);

    // Create text object
    this.textObject = scene.add.text(0, 0, '', {
      fontFamily: 'Courier New, monospace',
      fontSize: '11px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      wordWrap: { width: 200 }
    });
    this.textObject.setDepth(2002);
    this.textObject.setScrollFactor(0, 0);
    this.textObject.setVisible(true);

    // Force graphics to top of render list
    scene.children.bringToTop(this.graphics);
    scene.children.bringToTop(this.portraitGraphics);
    scene.children.bringToTop(this.textObject);
  }

  show(type, text, sprites = []) {
    this.isActive = true;
    this.currentDialog = { type, text, sprites };
    this.textObject.setVisible(true);
    // Render will be called every frame
  }

  hide() {
    this.isActive = false;
    this.currentDialog = null;
    this.graphics.clear();
    this.portraitGraphics.clear();
    this.textObject.setText('');
    this.textObject.setVisible(false);
  }

  render() {
    // Clear graphics every frame
    this.graphics.clear();
    this.portraitGraphics.clear();

    if (!this.currentDialog) {
      // No dialog to show
      this.textObject.setVisible(false);
      return;
    }

    const { type, text, sprites } = this.currentDialog;

    const screenHeight = GAME_CONFIG.GAME_HEIGHT;
    const screenWidth = GAME_CONFIG.GAME_WIDTH;
    const boxY = screenHeight - this.boxHeight + 10; // At the top of the screen
    const boxWidth = screenWidth - 20;
    const boxX = 250; // Hardcoded value i don't know why

    // Draw black background box
    this.graphics.fillStyle(0x000000, 0.95);
    this.graphics.fillRect(boxX, boxY, boxWidth, this.boxHeight);

    // Draw white border
    this.graphics.lineStyle(4, 0xffffff, 1);
    this.graphics.strokeRect(boxX, boxY, boxWidth, this.boxHeight);

    // Make sure text is visible
    this.textObject.setVisible(true);

    if (type === 'PLAYER') {
      // Player dialog: portrait on right, text on left
      this.renderPlayerDialog(text, sprites[0], boxY, boxX, screenWidth);
    } else if (type === 'GUARD') {
      // Guard dialog: portrait on left, text on right
      this.renderGuardDialog(text, sprites[0], boxY, boxX, screenWidth);
    } else if (type === 'UNISON') {
      // Unison dialog: both portraits on right, text on left
      this.renderUnisonDialog(text, sprites, boxY, boxX, screenWidth);
    }
  }

  renderPlayerDialog(text, sprite, boxY, boxX, screenWidth) {
    // Portrait on the right (relative to box position)
    const portraitX = boxX + (screenWidth - 20) - this.portraitSize - this.portraitPadding;
    const portraitY = boxY + this.boxPadding;
    this.renderPortrait(sprite, portraitX, portraitY);

    // Text on the left (relative to box position)
    const textX = boxX + this.boxPadding + 4;
    const textY = boxY + this.boxPadding + 2;
    const textWidth = (screenWidth - 20) - this.portraitSize - this.boxPadding * 3 - this.portraitPadding - 8;

    this.textObject.setWordWrapWidth(textWidth);
    this.textObject.setPosition(textX, textY);
    this.textObject.setText(text);
  }

  renderGuardDialog(text, sprite, boxY, boxX, screenWidth) {
    // Portrait on the left (relative to box position)
    const portraitX = boxX + this.boxPadding + this.portraitPadding;
    const portraitY = boxY + this.boxPadding;
    this.renderPortrait(sprite, portraitX, portraitY);

    // Text on the right (relative to box position)
    const textX = boxX + this.portraitSize + this.boxPadding * 2 + this.portraitPadding + 4;
    const textY = boxY + this.boxPadding + 2;
    const textWidth = (screenWidth - 20) - this.portraitSize - this.boxPadding * 3 - this.portraitPadding - 8;

    this.textObject.setWordWrapWidth(textWidth);
    this.textObject.setPosition(textX, textY);
    this.textObject.setText(text);
  }

  renderUnisonDialog(text, sprites, boxY, boxX, screenWidth) {
    // Both portraits on the right (stacked or side by side)
    const numSprites = sprites.filter(s => s).length;

    if (numSprites === 1) {
      // Only one player - render like player dialog
      this.renderPlayerDialog(text, sprites[0] || sprites[1], boxY, boxX, screenWidth);
    } else {
      // Two players - render both portraits (relative to box position)
      const boxWidth = screenWidth - 20;
      const portraitX1 = boxX + boxWidth - this.portraitSize * 2 - this.portraitPadding * 2 - 4;
      const portraitX2 = boxX + boxWidth - this.portraitSize - this.portraitPadding;
      const portraitY = boxY + this.boxPadding;

      this.renderPortrait(sprites[0], portraitX1, portraitY);
      this.renderPortrait(sprites[1], portraitX2, portraitY);

      // Text on the left (relative to box position)
      const textX = boxX + this.boxPadding + 4;
      const textY = boxY + this.boxPadding + 2;
      const textWidth = boxWidth - this.portraitSize * 2 - this.boxPadding * 3 - this.portraitPadding * 2 - 12;

      this.textObject.setWordWrapWidth(textWidth);
      this.textObject.setPosition(textX, textY);
      this.textObject.setText(text);
    }
  }

  renderPortrait(sprite, x, y) {
    if (!sprite) return;

    // Parse and render the FRONT sprite
    const spriteData = parseSprite(sprite, GAME_CONFIG.PLAYER_WIDTH);
    if (!spriteData || spriteData.length === 0) return;

    const spriteHeight = spriteData.length;
    const spriteWidth = spriteData[0] ? spriteData[0].length : 0;

    // Scale factor to fit portrait in 44x44 box
    const scale = Math.min(this.portraitSize / spriteWidth, this.portraitSize / spriteHeight);

    // Draw pixel by pixel with scaling
    for (let row = 0; row < spriteHeight; row++) {
      for (let col = 0; col < spriteData[row].length; col++) {
        const char = spriteData[row][col];
        const color = COLOR_MAP[char];

        if (color !== null && color !== undefined) {
          this.portraitGraphics.fillStyle(color, 1);
          this.portraitGraphics.fillRect(
            Math.floor(x + col * scale),
            Math.floor(y + row * scale),
            Math.ceil(scale),
            Math.ceil(scale)
          );
        }
      }
    }

    // Draw border around portrait
    this.portraitGraphics.lineStyle(1, 0xffffff, 0.5);
    this.portraitGraphics.strokeRect(x - 1, y - 1, this.portraitSize + 2, this.portraitSize + 2);
  }

  update() {
    // Future: handle text animation, input to advance dialog, etc.
  }
}

// =============================================================================
// CINEMATIC CONTROLLER
// =============================================================================
class CinematicController {
  constructor(scene) {
    this.scene = scene;
    this.isActive = false;
    this.currentStep = 0;
    this.autoClimbProgress = 0;
    this.autoClimbTarget = 4; // Climb 4 rows
  }

  start() {
    console.log('Starting opening cinematic...');
    this.isActive = true;
    this.currentStep = 0;

    // Step 0: Players walk in from the right (0-2s)
    this.walkInPlayers();

    // Step 1: Show guard dialog after players arrive (at 2s)
    this.scene.time.delayedCall(2000, () => {
      this.currentStep = 1;
      this.scene.dialog.show('GUARD', 'La hackathon ya ha iniciado, no estamos recibiendo más participantes', [GUARD_SPRITES.FRONT]);
    });

    // Step 2: After 5 seconds total, show players' unison dialog
    this.scene.time.delayedCall(5000, () => {
      this.currentStep = 2;
      const playerSprites = this.scene.players.map(p => p.sprites.FRONT);
      this.scene.dialog.show('UNISON', 'Tenemos que participar!!', playerSprites);
    });

    // Step 3: After 8 seconds, hide dialog and start auto-climb
    this.scene.time.delayedCall(8000, () => {
      this.currentStep = 3;
      this.scene.dialog.hide();
      this.startAutoClimb();
    });
  }

  walkInPlayers() {
    // Move players from far right to building entrance over 2 seconds
    console.log('Players walking in from right...');
    
    const startCol = GAME_CONFIG.BUILDING_ACTUAL_COLUMNS + 3; // Start off-screen right
    const walkDuration = 2000; // 2 seconds
    
    // Destination positions based on number of players
    const numPlayers = this.scene.players.length;
    const destinations = numPlayers === 1 ? [9] : [9, 10.5];
    
    this.scene.players.forEach((player, index) => {
      // Start players off-screen to the right
      player.col = startCol + index;
      player.x = player.colToX(player.col);
      player.targetX = player.x;
      player.animState = 'FRONT'; // Use FRONT sprite for walking
      
      // Animate walking to destination
      this.scene.tweens.add({
        targets: player,
        col: destinations[index],
        duration: walkDuration,
        ease: 'Linear',
        onUpdate: (tween) => {
          player.x = player.colToX(player.col);
          player.targetX = player.x;
          // Keep FRONT state, add vertical "jump" for walking effect
          player.animState = 'FRONT';
          
          // Add small vertical bounce to simulate walking
          const progress = tween.progress;
          const walkCycle = Math.sin(progress * Math.PI * 8) * 2; // 8 steps, 2 pixel bounce
          player.y = player.rowToY(player.row) + walkCycle;
        },
        onComplete: () => {
          // Reset to exact position when arrived
          player.y = player.rowToY(player.row);
          player.targetY = player.y;
          player.animState = 'FRONT'; // Face forward
        }
      });
    });
  }

  startAutoClimb() {
    console.log('Starting auto-climb animation...');
    this.autoClimbProgress = 0;

    // Climb 4 rows for both players
    const climbInterval = 300; // 300ms per row

    for (let i = 0; i < this.autoClimbTarget; i++) {
      this.scene.time.delayedCall(i * climbInterval, () => {
        this.scene.players.forEach(player => {
          if (player.row < this.autoClimbTarget) {
            player.row++;
            player.targetY = player.rowToY(player.row);
            player.animState = i % 2 === 0 ? 'RUP1' : 'LUP1';
          }
        });

        this.autoClimbProgress++;

        // When done climbing, show guard's reaction
        if (this.autoClimbProgress >= this.autoClimbTarget) {
          this.scene.time.delayedCall(500, () => {
            this.showGuardReaction();
          });
        }
      });
    }
  }

  showGuardReaction() {
    console.log('Guard reacts to players climbing...');
    
    // Show guard's angry dialog
    this.scene.dialog.show('GUARD', 'A dónde van, vuelvan!!', [GUARD_SPRITES.FRONT]);
    
    // After 2 seconds, end cinematic and start the chase
    this.scene.time.delayedCall(2000, () => {
      this.scene.dialog.hide();
      this.end();
    });
  }

  end() {
    console.log('Cinematic complete - starting game!');
    this.isActive = false;
    this.scene.gameState = GAME_STATES.PLAYING;

    // Reset players to IDLE animation
    this.scene.players.forEach(player => {
      player.animState = 'IDLE';
      player.animIndex = 0;
    });
    
    // Guard starts chasing now!
    console.log('Guard begins chase!');
  }
}

// =============================================================================
// MAIN GAME SCENE
// =============================================================================
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Game state management
    this.gameState = GAME_STATES.CINEMATIC;

    // Setup graphics
    this.buildingGraphics = this.add.graphics();
    this.buildingGraphics.setDepth(0); // Background layer
    this.uiGraphics = this.add.graphics();
    this.uiGraphics.setDepth(100);

    // Initialize dialog system AFTER other graphics so it renders on top
    this.dialog = new Dialog(this);

    // Initialize cinematic controller
    this.cinematic = new CinematicController(this);

    // Create players (start in FRONT state for cinematic)
    // Create players with character selection
    // Hardcoded: Player 1 = Character 0 (Default Hacker), Player 2 = Character 1 (Empty)
    this.players = [
      new Player(this, 1, 9, 0, CHARACTERS[2]), // Player 1: Default Hacker
      new Player(this, 2, 10.5, 0, CHARACTERS[1])  // Player 2: Character 2 (empty)
    ];

    // Set players to FRONT state initially (for cinematic)
    this.players.forEach(player => {
      player.animState = 'FRONT';
    });

    // Create guard (starts at middle column, row 0)
    this.guard = new Guard(this, 3.5, 0);
    // Set guard to FRONT state initially (for cinematic)
    this.guard.animState = 'FRONT';

    // Obstacles array and spawning
    this.obstacles = [];
    this.obstacleSpawnTimer = 0;
    this.obstaclesPaused = false; // Pause obstacles during guard catch dialog

    // Camera tracking - start at floor level (matching the camera limit)
    const groundY = GAME_CONFIG.GAME_HEIGHT;
    const maxCameraY = groundY - (GAME_CONFIG.GAME_HEIGHT / 2);
    this.cameraTargetY = maxCameraY;

    // Input tracking
    this.inputState = {
      p1: { up: false, down: false, left: false, right: false },
      p2: { up: false, down: false, left: false, right: false }
    };

    // Setup keyboard input
    this.setupInput();

    // UI Text
    this.setupUI();

    // Camera setup
    this.cameras.main.setBackgroundColor(ENV_COLORS.SKY);
    this.cameras.main.setZoom(GAME_CONFIG.SCALE);

    // Position camera at floor level at start
    const camX = GAME_CONFIG.GAME_WIDTH / 2;
    this.cameras.main.centerOn(camX, this.cameraTargetY);
  }

  setupInput() {
    this.input.keyboard.on('keydown', (event) => {
    const key = KEYBOARD_TO_ARCADE[event.key] || event.key;
      this.handleInput(key, true);
    });

    this.input.keyboard.on('keyup', (event) => {
    const key = KEYBOARD_TO_ARCADE[event.key] || event.key;
      this.handleInput(key, false);
    });
  }

  handleInput(key, isDown) {
    // Player 1 controls
    if (key === 'P1U') this.inputState.p1.up = isDown;
    if (key === 'P1D') this.inputState.p1.down = isDown;
    if (key === 'P1L') this.inputState.p1.left = isDown;
    if (key === 'P1R') this.inputState.p1.right = isDown;

    // Player 2 controls
    if (key === 'P2U') this.inputState.p2.up = isDown;
    if (key === 'P2D') this.inputState.p2.down = isDown;
    if (key === 'P2L') this.inputState.p2.left = isDown;
    if (key === 'P2R') this.inputState.p2.right = isDown;
  }

  setupUI() {
    const uiScale = 1 / GAME_CONFIG.SCALE;

    // Player 1 Lives
    this.p1LivesText = this.add.text(10, 10, 'P1: ♥♥♥', {
      fontSize: `${16 * uiScale}px`,
    fontFamily: 'Arial',
    color: '#00ff00'
    });
    this.p1LivesText.setScrollFactor(0);
    this.p1LivesText.setDepth(100);

    // Player 2 Lives
    this.p2LivesText = this.add.text(GAME_CONFIG.GAME_WIDTH - 10, 10, 'P2: ♥♥♥', {
      fontSize: `${16 * uiScale}px`,
    fontFamily: 'Arial',
      color: '#ff00ff',
      align: 'right'
    });
    this.p2LivesText.setOrigin(1, 0);
    this.p2LivesText.setScrollFactor(0);
    this.p2LivesText.setDepth(100);

    // Floor indicator
    this.floorText = this.add.text(GAME_CONFIG.GAME_WIDTH / 2, 10, 'Floor: 0 / 90', {
      fontSize: `${14 * uiScale}px`,
    fontFamily: 'Arial',
      color: '#ffffff'
    });
    this.floorText.setOrigin(0.5, 0);
    this.floorText.setScrollFactor(0);
    this.floorText.setDepth(100);

    // Start the opening cinematic
    this.cinematic.start();
  }

  checkCollisions() {
    // Check guard catching players
    if (this.guard) {
      this.players.forEach(player => {
        // Skip if player is already caught, dead, or falling
        if (player.isCaught || player.isDead || player.isFalling) return;

        if (this.guard.checkCollision(player.getColliderBounds())) {
          this.handlePlayerCaught(player);
        }
      });
    }

    // Check player-player collisions (blocking each other while climbing)
    if (this.players[0].checkPlayerCollision(this.players[1])) {
      // Don't resolve collision if either is falling - they become obstacles instead
      const p0Falling = this.players[0].isFallingOneRow || this.players[0].isFalling;
      const p1Falling = this.players[1].isFallingOneRow || this.players[1].isFalling;

      if (!p0Falling && !p1Falling) {
        // Both players are normal - resolve collision (push apart)
        this.resolvePlayerCollision(this.players[0], this.players[1]);
      }
    }

    // Check all falling objects (obstacles + dying players + falling one row players)
    this.players.forEach(player => {
      // Skip if player is already affected by something
      if (player.isDead || player.isFalling || player.isFallingOneRow) return;

      // Check regular obstacles
      this.obstacles.forEach(obstacle => {
        if (!obstacle.active) return;

        if (player.checkCollision(obstacle.getColliderBounds())) {
          this.handleFallingObjectHit(player, `obstacle ${obstacle.type.name}`);
          obstacle.destroy();
        }
      });

      // Check dying players (they act as falling obstacles)
      this.players.forEach(dyingPlayer => {
        if (!dyingPlayer.isFalling) return; // Only dying players
        if (dyingPlayer === player) return; // Can't hit yourself

        if (player.checkCollision(dyingPlayer.getColliderBounds())) {
          this.handleFallingObjectHit(player, `dying Player ${dyingPlayer.playerNum}`);
        }
      });

      // Check players falling one row (they also act as obstacles)
      this.players.forEach(fallingPlayer => {
        if (!fallingPlayer.isFallingOneRow) return; // Only falling one row
        if (fallingPlayer === player) return; // Can't hit yourself

        if (player.checkCollision(fallingPlayer.getColliderBounds())) {
          this.handleFallingObjectHit(player, `falling Player ${fallingPlayer.playerNum}`);
        }
      });
    });

    // Remove inactive obstacles
    this.obstacles = this.obstacles.filter(obs => obs.active);
  }

  handlePlayerCaught(player) {
    console.log(`Player ${player.playerNum} caught by guard!`);

    // Pause obstacle spawning
    this.obstaclesPaused = true;

    // Check if there are other players still alive
    const otherPlayers = this.players.filter(p => p !== player && !p.isCaught && !p.isDead);

    if (otherPlayers.length > 0) {
      // Another player is still alive
      // Show dialog WHILE player falls (use caught player's sprite)
      this.dialog.show('PLAYER', 'Continúa sin mí!!!', [player.sprites.FRONT]);
      
      // IMMEDIATELY start death fall animation
      player.die();

      // After dialog, hide it and resume obstacles
      this.time.delayedCall(2000, () => {
        this.dialog.hide();
        this.obstaclesPaused = false; // Resume obstacle spawning
      });
    } else {
      // No players left - game over, freeze game
      console.log('Game Over - All players caught!');
      this.gameState = GAME_STATES.GAME_OVER;
      
      // Freeze player with LOST animation
      player.isCaught = true;
      player.lostAnimTimer = 0;
      player.lostAnimState = 'LUP0';
      
      // Keep obstacles paused, game is frozen
    }
  }

  handleFallingObjectHit(player, objectName) {
    // Unified logic for when any falling object hits a player
    console.log(`${objectName} hit Player ${player.playerNum}!`);
    player.takeDamage(); // This handles: lose life, fall one row, or die
  }

  spawnObstacle() {
    try {
      // Choose a random alive player
      const alivePlayers = this.players.filter(p => !p.isDead && !p.isFalling);
      if (alivePlayers.length === 0) return;

      const targetPlayer = Phaser.Utils.Array.GetRandom(alivePlayers);

      // Only spawn obstacles if highest player has reached the start row
      const highestPlayer = alivePlayers.reduce((highest, player) =>
        player.row > highest.row ? player : highest
      );
      
      if (highestPlayer.row < GAME_CONFIG.OBSTACLE_START_ROW) {
        // Players haven't reached obstacle start row yet
        return;
      }

      // Choose random obstacle type
      const types = Object.values(OBSTACLE_TYPES);
      const type = Phaser.Utils.Array.GetRandom(types);

      // Spawn at player's X position, above the camera view
      const spawnX = targetPlayer.x;
      // Camera center is at this.cameraTargetY, top of view is center - height/2
      const cameraTopY = this.cameraTargetY - (GAME_CONFIG.GAME_HEIGHT / 2);
      const spawnY = cameraTopY - 50; // Spawn 50px above visible area

      console.log(`Spawning ${type.name} at (${spawnX}, ${spawnY})`);

      const obstacle = new Obstacle(this, spawnX, spawnY, type);
      this.obstacles.push(obstacle);

      console.log(`Total obstacles: ${this.obstacles.length}`);
    } catch (error) {
      console.error('Error spawning obstacle:', error);
    }
  }

  resolvePlayerCollision(player1, player2) {
    // Simple collision resolution: push players apart slightly
    const bounds1 = player1.getColliderBounds();
    const bounds2 = player2.getColliderBounds();

    // Calculate overlap
    const overlapX = Math.min(bounds1.right - bounds2.left, bounds2.right - bounds1.left);
    const overlapY = Math.min(bounds1.bottom - bounds2.top, bounds2.bottom - bounds1.top);

    // Resolve collision along the axis with smallest overlap
    if (overlapX < overlapY) {
      // Separate horizontally
      const direction = bounds1.centerX < bounds2.centerX ? -1 : 1;
      const pushAmount = overlapX / 2;

      player1.x += direction * pushAmount;
      player1.targetX = player1.x;
      player1.col = Phaser.Math.Clamp(
        (player1.x - ((GAME_CONFIG.GAME_WIDTH - GAME_CONFIG.BUILDING_WIDTH) / 2)) /
        (GAME_CONFIG.BUILDING_WIDTH / (GAME_CONFIG.BUILDING_ACTUAL_COLUMNS - 1)),
        0,
        GAME_CONFIG.BUILDING_ACTUAL_COLUMNS - 1
      );

      player2.x -= direction * pushAmount;
      player2.targetX = player2.x;
      player2.col = Phaser.Math.Clamp(
        (player2.x - ((GAME_CONFIG.GAME_WIDTH - GAME_CONFIG.BUILDING_WIDTH) / 2)) /
        (GAME_CONFIG.BUILDING_WIDTH / (GAME_CONFIG.BUILDING_ACTUAL_COLUMNS - 1)),
        0,
        GAME_CONFIG.BUILDING_ACTUAL_COLUMNS - 1
      );
    } else {
      // Separate vertically (block climbing)
      const direction = bounds1.centerY < bounds2.centerY ? -1 : 1;
      const pushAmount = overlapY / 2;

      player1.y += direction * pushAmount;
      player1.targetY = player1.y;

      player2.y -= direction * pushAmount;
      player2.targetY = player2.y;
    }
  }

  update(time, delta) {
    try {
      // Only accept input and update guard when PLAYING
      if (this.gameState === GAME_STATES.PLAYING) {
        // Update players with input
        this.players[0].setInput(
          this.inputState.p1.up,
          this.inputState.p1.down,
          this.inputState.p1.left,
          this.inputState.p1.right
        );
        this.players[1].setInput(
          this.inputState.p2.up,
          this.inputState.p2.down,
          this.inputState.p2.left,
          this.inputState.p2.right
        );

        // Update guard (only during gameplay)
        if (this.guard) {
          try {
            this.guard.update(delta);
          } catch (error) {
            console.error('Error updating guard:', error);
          }
        }
      } else if (this.gameState === GAME_STATES.GAME_OVER) {
        // During game over, freeze everything except LOST animation
        this.players[0].setInput(false, false, false, false);
        this.players[1].setInput(false, false, false, false);
        // Guard freezes (don't update)
        if (this.guard) {
          this.guard.draw(); // Just redraw in current state
        }
      } else {
        // During cinematic, block all input
        this.guard.draw();
        this.players[0].setInput(false, false, false, false);
        this.players[1].setInput(false, false, false, false);
      }

      // Always update players (for animations)
      this.players.forEach(player => {
        try {
          player.update(delta);
        } catch (error) {
          console.error('Error updating player:', error);
        }
      });

      // Update obstacles
      this.obstacles.forEach(obstacle => {
        try {
          obstacle.update(delta);
        } catch (error) {
          console.error('Error in obstacle update:', error);
        }
      });

      // Spawn obstacles and check collisions only during active gameplay
      if (this.gameState === GAME_STATES.PLAYING) {
        // Only spawn obstacles if not paused (e.g., during guard catch dialog)
        if (!this.obstaclesPaused) {
          this.obstacleSpawnTimer += delta;
          if (this.obstacleSpawnTimer >= GAME_CONFIG.OBSTACLE_SPAWN_INTERVAL) {
            this.obstacleSpawnTimer = 0;
            this.spawnObstacle();
          }
        }

        // Check collisions (only during active gameplay, not during GAME_OVER)
        this.checkCollisions();
      }
      // During GAME_OVER, no spawning and no collision checking
    } catch (error) {
      console.error('Critical error in game update:', error);
    }

    try {
      // Update camera to follow highest ALIVE player smoothly
      const alivePlayers = this.players.filter(p => !p.isDead && !p.isFalling);

      if (alivePlayers.length > 0) {
        // Follow highest alive player
        const highestPlayer = alivePlayers.reduce((highest, player) =>
          player.row > highest.row ? player : highest
        );

        // Calculate target camera center Y (in game coordinates)
        // Offset camera upward (lower Y) to keep player slightly below center
        // This leaves more room above to see falling obstacles and chase elements
        const targetCameraY = highestPlayer.getWorldY() - GAME_CONFIG.CAMERA_OFFSET;

        // Floor limit - camera shouldn't show anything below ground
        // Ground is at Y = GAME_HEIGHT + 20 = 260
        // Camera shows GAME_HEIGHT/2 = 120 pixels above and below center
        // So camera center max = 260 - 120 = 140 (camera bottom edge at 260)
        const groundY = GAME_CONFIG.GAME_HEIGHT + 25;
        const maxCameraY = groundY - (GAME_CONFIG.GAME_HEIGHT / 2);

        // Clamp camera to not go below floor
        const clampedTargetY = Math.min(targetCameraY, maxCameraY);

        // Smoothly interpolate camera target
        this.cameraTargetY = Phaser.Math.Linear(
          this.cameraTargetY,
          clampedTargetY,
          GAME_CONFIG.CAMERA_SMOOTH
        );
      }
      // If no alive players, camera stays where it is

      // Update camera to center on target Y
      this.cameras.main.centerOn(GAME_CONFIG.GAME_WIDTH / 2, this.cameraTargetY);
    } catch (error) {
      console.error('Error updating camera:', error);
    }

    try {
      // Draw building
      this.drawBuilding();

      // Update UI
      this.updateUI();
    } catch (error) {
      console.error('Error in draw/UI:', error);
    }

    try {
      // Render dialog AFTER everything else (needs to be called every frame)  <-- SEPARATED INTO OWN BLOCK
      if (this.dialog) {
        this.dialog.render();
      }
    } catch (error) {
      console.error('Error rendering dialog:', error);
    }
  }

  drawBuilding() {
    this.buildingGraphics.clear();

    // Building boundaries
    const buildingStartX = (GAME_CONFIG.GAME_WIDTH - GAME_CONFIG.BUILDING_WIDTH) / 2;
    const buildingEndX = buildingStartX + GAME_CONFIG.BUILDING_WIDTH;

    // Calculate building height - extend well above and below visible area
    const topY = -1500; // High above
    const bottomY = GAME_CONFIG.GAME_HEIGHT + 100; // Below start

    // Draw building background - glass blue with gradient effect
    this.buildingGraphics.fillStyle(ENV_COLORS.GLASSB, 1);
    this.buildingGraphics.fillRect(
      buildingStartX,
      topY,
      GAME_CONFIG.BUILDING_WIDTH,
      bottomY - topY
    );

    // Add glass texture overlay (lighter blue streaks)
    for (let i = 0; i < 15; i++) {
      const offsetX = buildingStartX + (i * GAME_CONFIG.BUILDING_WIDTH / 15);
      this.buildingGraphics.fillStyle(ENV_COLORS.GLASSSTR, 0.3);
      this.buildingGraphics.fillRect(offsetX, topY, 2, bottomY - topY);
    }

    // Draw windows/rows
    const colWidth = GAME_CONFIG.BUILDING_WIDTH / GAME_CONFIG.BUILDING_VISUAL_COLUMNS;

    for (let row = 0; row < GAME_CONFIG.TOTAL_ROWS; row++) {
      const y = this.players[0].rowToY(row);

      // Draw horizontal row line (metallic frame)
      this.buildingGraphics.lineStyle(2, ENV_COLORS.METAL1, 0.8);
      this.buildingGraphics.lineBetween(buildingStartX, y, buildingEndX, y);

      // Draw glass windows with reflections
      for (let col = 0; col < GAME_CONFIG.BUILDING_VISUAL_COLUMNS; col++) {
        const x = buildingStartX + col * colWidth + colWidth / 2;

        // Glass window - alternating blue tones for depth
        const baseColor = (row + col) % 2 === 0 ? ENV_COLORS.GLASSW1 : ENV_COLORS.GLASSW2;
        this.buildingGraphics.fillStyle(baseColor, 0.7);
        this.buildingGraphics.fillRect(
          x - 10,
          y - GAME_CONFIG.ROW_HEIGHT / 2 - 4,
          20,
          8
        );

        // Glass reflection/highlight (lighter area)
        this.buildingGraphics.fillStyle(ENV_COLORS.GLASSREF, 0.4);
        this.buildingGraphics.fillRect(
          x - 8,
          y - GAME_CONFIG.ROW_HEIGHT / 2 - 3,
          12,
          2
        );
      }
    }

    // Draw vertical column lines (metallic structure)
    for (let col = 0; col <= GAME_CONFIG.BUILDING_VISUAL_COLUMNS; col++) {
      const x = buildingStartX + col * colWidth;
      this.buildingGraphics.lineStyle(3, ENV_COLORS.METAL1, 0.9);
      this.buildingGraphics.lineBetween(x, topY, x, bottomY);

      // Add highlight for metallic effect
      this.buildingGraphics.lineStyle(1, ENV_COLORS.METAL2, 0.6);
      this.buildingGraphics.lineBetween(x - 1, topY, x - 1, bottomY);
    }

    // Draw ground/sidewalk at the bottom with subtle concrete texture
    const groundY = GAME_CONFIG.GAME_HEIGHT - 10;
    const groundHeight = 50;

    // Base concrete color
    this.buildingGraphics.fillStyle(ENV_COLORS.BASE1, 1);
    this.buildingGraphics.fillRect(0, groundY, GAME_CONFIG.GAME_WIDTH, groundHeight);

    // Add subtle concrete texture (static pattern using position-based seed)
    for (let x = 0; x < GAME_CONFIG.GAME_WIDTH; x += 8) {
      for (let y = 0; y < groundHeight; y += 8) {
        // Use position as seed for consistent pattern
        const seed = (x * 7 + y * 13) % 100;
        if (seed > 85) {
          // Darker spots (fewer and more subtle)
          this.buildingGraphics.fillStyle(ENV_COLORS.BASE2, 0.4);
          this.buildingGraphics.fillRect(x, groundY + y, 6, 6);
        } else if (seed < 15) {
          // Lighter spots (fewer and more subtle)
          this.buildingGraphics.fillStyle(ENV_COLORS.BASE3, 0.4);
          this.buildingGraphics.fillRect(x, groundY + y, 6, 6);
        }
      }
    }

    // Add horizontal lines for sidewalk panels
    this.buildingGraphics.lineStyle(2, ENV_COLORS.PANEL_LINE, 0.6);
    for (let i = 1; i < 5; i++) {
      const crackY = groundY + (i * groundHeight / 5);
      this.buildingGraphics.lineBetween(0, crackY, GAME_CONFIG.GAME_WIDTH, crackY);
    }

    // Add vertical lines for panel divisions
    this.buildingGraphics.lineStyle(2, ENV_COLORS.PANEL_LINE, 0.6);
    for (let i = 0; i < GAME_CONFIG.GAME_WIDTH; i += 40) {
      this.buildingGraphics.lineBetween(i, groundY, i, groundY + groundHeight);
    }

    // Draw goal floor indicator
    const goalY = this.players[0].rowToY(GAME_CONFIG.GOAL_FLOOR);
    this.buildingGraphics.fillStyle(ENV_COLORS.GOAL_MARKER, 0.3);
    this.buildingGraphics.fillRect(
      buildingStartX,
      goalY - GAME_CONFIG.ROW_HEIGHT,
      GAME_CONFIG.BUILDING_WIDTH,
      GAME_CONFIG.ROW_HEIGHT * 2
    );

    this.buildingGraphics.lineStyle(3, ENV_COLORS.GOAL_MARKER, 1);
    this.buildingGraphics.lineBetween(buildingStartX, goalY, buildingEndX, goalY);
  }

  updateUI() {
    // Update lives display
    const p1Hearts = '♥'.repeat(this.players[0].lives);
    const p2Hearts = '♥'.repeat(this.players[1].lives);
    this.p1LivesText.setText(`P1: ${p1Hearts}`);
    this.p2LivesText.setText(`P2: ${p2Hearts}`);

    // Update floor indicator
    const maxFloor = Math.max(this.players[0].row, this.players[1].row);
    this.floorText.setText(`Floor: ${maxFloor} / ${GAME_CONFIG.GOAL_FLOOR}`);
  }
}

// =============================================================================
// GAME INITIALIZATION
// =============================================================================
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  pixelArt: true
};

const game = new Phaser.Game(config);
