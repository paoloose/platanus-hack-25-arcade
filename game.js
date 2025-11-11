// Platanus Hack 25: Late to the Hackathon
// A Crazy Climber inspired game where you race to reach the hackathon floor!

// =============================================================================
// ARCADE BUTTON MAPPING - COMPLETE TEMPLATE
// =============================================================================
const CTRLS = {
  // ===== Hacker 1 CONTROLS =====
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

  // ===== Hacker 2 CONTROLS =====
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
  'START2': ['2', ' ']
};

// Build reverse lookup: keyboard key → arcade button code
const KBD_TO_ARC = {};
for (const [arcadeCode, keyboardKeys] of Object.entries(CTRLS)) {
  if (keyboardKeys) {
    const keys = Array.isArray(keyboardKeys) ? keyboardKeys : [keyboardKeys];
    keys.forEach(key => {
      KBD_TO_ARC[key] = arcadeCode;
    });
  }
}

// =============================================================================
// GAME CONSTANTS
// =============================================================================
const C = {
  // Display (320x240 scaled to 800x600)
  GW: 320, // game width
  GH: 240, // game height
  S: 2.5, // Game scale | 320 * 2.5 = 800, 240 * 2.5 = 600

  // Building
  BW: 200, // Building width pixels in game coords
  BVC: 6, // Building # visual columns vc = visual column
  BAC: 13, // Buillding # actual column, players can be between visual columns
  ROWS: 135,
  RHEIGHT: 12, // pixels per row
  GOAL: 125, // Win at row 90

  // Player
  PW: 30, // Player width
  PH: 30, // Player height
  STEP: 100, // ms per animation state
  // HSTEP: 60, // horizontal steps pixels per second

  // Obstacles
  OS: 14, // obstacle size 14x14 pixels
  OSI: 1000, // ostacle spawn interval | ms between spawns
  VAR: 200, // interval variance | random variation in spawn interval (±VAR/2)
  OFS: 100, // obstacle fall speed |  pixels per second
  OSR: 10, // obstacle start row |  Obstacles only start falling after this row
  ODC: 0.3, // obstacle dual chance | 30% chance both players get obstacles when both alive
  ORC: 0.2, // obstacle random chance | chance to spawn additional random obstacle
  OOR: 20, // obstacle offset range | random X offset from player position (±OOR)
  OD: 150, // obstacle delay | ms delay between multiple obstacles in same spawn

  // Guard AI
  GCmD: 530, // Guard Climb min delay | Min ms between climb steps
  GCMD: 700, // Guard climb max delay |  Max ms between climb steps
  GCS: 0.02, // Guard chase speed |  How aggressively guard moves toward player (0-1)
  GISM: 0.75, // Guard initial slow multiplier | Guard is slower initially (until row 10)
  GOB: 2.5, // Guard off-screen buff | Speed multiplier when guard is off-camera below players

  // Camera
  CS: 0.08, // Camera smoothness
  CO: 20, // Camera offset | pixels below center

  // Audio
  VOL: 0.05, // Volume for dialog beeps (0-1)
};

// =============================================================================
// PC-66 COLOR PALETTE
// =============================================================================
// PC-66 Palette from Lospec - 66 colors for retro arcade feel
const P = [
  0x000000, 0x24222a, 0x4e4b5b, 0x7b768e, 0xaba4c1, 0xd3cde7, 0xfefdfe, 0xffefa8,
  0xe2b35a, 0x9f5611, 0x6e2100, 0x390800, 0x5e2e00, 0x915f01, 0xe6c429, 0xeceab7,
  0xd2fe7d, 0xc1e12c, 0x989800, 0x5b4d00, 0x362400, 0x004d03, 0x0c6d00, 0x2b9200,
  0x7ec43f, 0xb2da73, 0xc8feae, 0x83fe6b, 0xff6600, 0x00cb22, 0x006d45, 0x004d3d,
  0x206100, 0x019000, 0x0bba3d, 0x2eda91, 0x4fffca, 0xd0fff6, 0xa9fbee, 0x01ffff,
  0x009cbe, 0x006092, 0x004373, 0x006cdc, 0x6dd0ff, 0xb6f3ff, 0xa4dbff, 0x687aff,
  0x0147ff, 0x0017c5, 0x140c81, 0x4200a5, 0x8d00f9, 0xc84ff5, 0xea9bf3, 0xf8dcf7,
  0xf49fb3, 0xf6629d, 0xff0092, 0xcc0095, 0xa30092, 0x920030, 0xc1003f, 0xff0000,
  0xf5765d, 0xd11717, 0xa41c1c, 0xab8169, 0x7c6822, 0xffc7ba, 0x254c93, 0xdeac92,
  0x18171a, 0xf7bb1b, 0xBF7F1F
];

const ph = 'Platanus Hack 2025'
const pcb = 'Presiona cualquier botón\npara volver al menú';

// Environment color palette from PC-66
const COLORS = {
  SKY: P[46],             // 0xa9fbee - sky blue
  GLASSB: P[41],      // 0x006092 - dark blue glass
  GLASSSTR: P[43],    // 0x006cdc - blue streaks
  GLASSW1: P[44],  // 0x6dd0ff - light blue windows
  GLASSW2: P[46],  // 0xa4dbff - alternate blue windows
  GLASSREF: P[45],// 0xb6f3ff - window highlights
  METAL1: P[4],      // 0xaba4c1 - metallic structure
  METAL2: P[5],  // 0xd3cde7 - metallic highlights
  BASE1: P[3],    // 0x7b768e - sidewalk base
  BASE2: P[2],    // 0x4e4b5b - dark concrete
  BASE3: P[3],   // 0x7b768e - light concrete
  PANEL_LINE: P[2],       // 0x4e4b5b - panel divisions
};

// Color character mapping (~ and ^ are semantic codes, not colors)
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%&*()_+-=[]{};:,/<?`"';

// Build color lookup from character to actual color
const COLOR_MAP = {};
for (let i = 0; i < CHARS.length; i++) {
  if (i < P.length) {
    COLOR_MAP[CHARS[i]] = P[i];
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
    name: 'Engineer',
    raw: {
      I: '~~~9.3.5A9.4.8.2,1.4A>7.2,2.4A>7.3,5A>7.2<1.9A1A1.3<6.6.3<1.9A1A2.2<6.5.3<3.1{3A>5.4<3.1,2A>5.4<3.6<2.4<6.6.9<8<7.7.9<6<8.9.9<2<9.1.9.2.1}3<>^^^^9.2.4A>^9.1.5A>9.1.4A1.>9.4A2.>9.3A3.>^^^8.4A3.>',
      // LUP0: null,
      // LUP1: null,
      R0: '~9.3.3A>9.2.4A>9.1.9A1.3,7.9.1.9A1A1.3,6.9.1.9A1A2.2<6.^9.1.1A1{6A1{1A1.3<6.9.3.1,4A1,3.3<6.9.3.6<2.3<7.9.9<5<7.8.9<6<7.7.9<6<8.7.3<1.1}6<1}9.2.^8.2<1.1}6<1}9.2.8.3,1}6<1}9.2.8.2,1.9A1A9.9.2.9A2A8.^9.2.3A5.3A8.9.1.4A5.3A8.9.1.3A6.3A8.^9.1.3A6.4A7.9.1.3A9.8.^9.4A9.8.~~',
      R1: '9.9.3.3,6.9.3.6A4.3,5.9.2.8A3.1,2<5.9.1.9A1A3.2<5.9.1.9A2A2.2<5.9.1.9A1A3.2<5.9.1.9A1A2.3<5.9.1.1A1{6A1{1A1.4<5.9.3.1,4A1,2.4<6.9.3.6<1.4<7.9.2.9<2<8.9.6<>8.9<1<1}9.2.7.4<1}6<1}9.2.7.3<1.1}6<1}9.2.^^^7.3,1.1}6<1}9.2.7.2,2.8A9.2.9.2.4A>9.2.3A1.>^^9.1.3A2.>^^^^9.4A2.>',
      F: '9.2.7A9.3.9.9A1A9.2.9.1.5A>9.3A2,1A3,3A9.9.2A1,2A1,>^9.1.1A4{>9.2.3{1K>9.3.3{>9.2.3<1,>9.1.5<>9.4<1G7<9.9.2<1}2<1G3<1}2<9.9.2<1}2<1G>^^9.2<1}1<2G3<1}2<9.9.2<1}3<>9.2,1}3<>9.2,4A>9.2.4A>^9.2.3A1.>^^^^^^^',
    }
  },
  // Character 2: Empty (to be designed)
  {
    name: 'Condorito',
    raw: {
      I:'~~~~9.2;3.1[>8.2;3.2;>8.3;1.3;>8.2;1.4;>7.2;2.4;>6.3;2.4;>6.2;4.3;>6.4;1[3.3=2.1[4;6.8.2;3[2G>9.1.5[>9.3.3[>9.4.2[>9.3.3[>^9.3.3A>9.2.4A>9.2.9A9.1.9.1.2A7.1A9.1.9.2A4.>9.2;4.>^^9.1.2[3.>9.3[3.>~~',
      // LUP0: null,
      // LUP1: null,
      R0: '~~9.5.1[>9.4.4;2.3;8.9.3.6;2.2;8.9.2.8;1.2;8.9.2.8;1.3;7.9.2.8;2.2;7.9.3.6;3.2;7.9.5.3=3.1[1;8.9.1.3[4G4[1;8.9.1;9[1[9.1.8.2;3.5[9.3.8.2;3.4[9.4.9.2;2.4[9.4.9.1.2;1.4[9.4.9.1.3;4[1A9.3.9.1.1;1.6A1.2;9.9.3.7A3;8.9.2.8A1.2;8.9.2.7A2.2;8.9.1.1;2A7.2;8.9.1.2;8.1[1;8.9.1.1;9.3[7.9.1.1;9.9.1.9.1.2[9.9.9.3[9.9.~~~',
      R1: '~9.9.1.3;8.9.5.2[4.2;8.9.4.4;3.2;8.9.3.6;3.2;7.9.2.8;2.2;7.^9.2.8;2.1;8.9.3.6;2.2;8.9.5.3=2.2;9.9.4.4G2[2;9.9.1.9[9.2.9.1;8[9.3.9.2;2.4[9.4.^9.1.1;2.4[9.4.^9.1.2;1.4[9.4.9.1.1;2.4[9.4.9.4.2A>^^9.3.3A>9.2.3A2.2A9.3.9.2.2;2.>^9.2.1;5.2;9.2.9.1.2[6.1[9.2.9.3[6.2[9.1.~',
      F: '~~9.3.5[9.4.9.2.6[9.4.9.2.2[5;9.3.9.3.2;1A1G3;9.2.9.1.4;1A1G3;9.2.9.1.9;9.2.9.1.2;3]4;9.2.9.2.1;1.1]4;9.3.9.5.3=9.4.9.4.5G9.3.9.3.7[9.2.9.2.9[9.1.^9.2.1;1.5[1.1;9.1.^^^9.1.2;1.5A1.2;9.^9.4.5A9.3.^9.4.1A3.1A9.3.^9.4.1;3.1;9.3.^^9.3.1[1;2.1[1;9.3.9.3.2[1.>',
    }
  },
  // Character 3: Empty (to be designed)
  {
    name: 'Arturo Vidal',
    raw: {
      I: '~~~9.5.1A>8.2{2.2{1A>7.2{2.3{1A>7.3{1.3{1A>7.2{2.3{2A3{2.3{6.6.3{2.8{3.2{6.5.3{3.4{>5.3{1:3.1J4{1J3.4{5.5.1{3:3.6[2.3:1{6.6.1:9[6[1:7.7.9[6[8.9.9[2[9.1.9.2.4[>^^^^9.2.4:>^9.1.5:>9.1.3{1:1.>9.4{2.>9.3:3.>^^9.3A3.>8.4A3.>',
      // LUP0: null,
      // LUP1: null,
      R0: '~9.5.1A>9.3.2{1A>9.2.3{2A3{1.3{7.9.2.3{2A3{2.3{6.9.2.3{2A3{3.2{6.9.2.8{3.2{6.9.2.8{2.3{6.9.3.1J4{1J3.3{6.9.3.6:2.2:1{7.9.9[3[2:7.8.9[6[7.7.3:9[3[8.7.3{1.8[9.2.^8.2{1.8[9.2.8.3{8[9.2.8.2{1.9:1{9.9.2.9:2{8.^9.2.3:5.2{1:8.9.1.4{5.3:8.9.1.3{6.3:8.9.1.3:6.3A8.9.1.3:6.4A7.9.1.3:9.8.9.1.3A9.8.9.4A9.8.~~',
      R1: '9.9.3.3{6.9.5.2A6.3{5.9.3.2{2A2{4.3{5.9.2.3{2A3{4.2{5.^^9.2.8{3.3{5.9.2.8{2.1:3{5.9.3.1J4{1J2.1[2:1{6.9.3.6:1.3[1:7.9.2.9[2[8.9.6[>8.9[2[9.2.7.3:9[9.2.7.3{1.8[9.2.^^^^7.2{2.8:9.2.9.2.4:>9.2.3:1.>9.2.3{1.>^9.1.3{2.>9.1.3:2.>^^9.1.3A2.>9.4A2.>',
      F: '9.5.1A>9.3.2{1A>9.2.4{>9.2.3U1{>9.2.1{2A1{>9.2.4{>9.2.3{1U>9.2.1U1{1U1F>9.3.3U>9.1.2[3:>9.6[>^9.7[2F3[9.9.2:5[2F1[2:9.9.2{5[2F1[2{9.9.2{4[>^^^9.2{4:>9.2.4:>^9.2.3:1.>9.2.3{1.>^9.2.3:1.>^^9.2.3A1.>^',
    }
  },
  // Character 4: Empty (to be designed)
  {
    name: 'Señor VC',
    raw: {
      I: '~~9.4.2,>8.2,2.3,>5.2Y3,1.4,>5.2Y2,2Y8,2Y2,1Y1i5.6.1i3,1i4,>7.2G2.8,2.3G6.6.3G2.1{6,1{3.2G6.5.3G3.4{>5.4G3.3{>5.4G3.6G2.4G6.6.9G8G7.7.6G1c2G1c5G8.9.4G1c2G1c3G9.1.9.2.1F1G2c>9.2.1F2G1c>^^9.2.1F3G>9.2.4:>^9.1.5:>9.1.4:1.>9.4:2.>9.3:3.>^^9.3q3.>8.4q3.>',
      // LUP0: null,
      // LUP1: null,
      R0: '9.4.2,>9.3.3,>9.2.4,>9.2.8,1.3,2i5.9.2.8,2Y3,1Y5.9.2.8,3i2G6.9.2.1{6,1{3.2G6.9.2.8{2.3G6.9.3.6{3.3G6.9.3.6G2.3G7.9.4G1c2G1c6G7.8.5G1c2G1c6G7.7.6G4c5G8.7.3G1.1F2G2c2G1F9.2.^8.2G1.1F2G2c2G1F9.2.6.2Y3,1Y6G1F9.2.6.2i2,2i9:9.9.2.9:2:8.^9.2.3:5.3:8.9.1.4:5.3:8.9.1.3:6.3:8.9.1.3:6.3q8.9.1.3:6.4q7.9.1.3:9.8.9.1.3q9.8.9.4q9.8.~~',
      R1: '9.4.4,4.3,2i4.9.3.6,2.2Y3,1Y4.9.2.8,1.2i1,2G5.9.2.8,4.2G5.^^9.2.1{6,1{3.3G5.9.2.8{2.4G5.9.3.6{2.4G6.9.3.6G1.4G7.9.2.9G2G8.9.4G1c1G>8.5G1c2G1c1G1F9.2.7.4G1F1G4c1G1F9.2.7.3G1.1F2G2c2G1F9.2.^^7.3G1.1F6G1F9.2.5.2Y3,1Y1F6G1F9.2.5.2i2,2i8:9.2.9.2.4:>9.2.3:1.>^^9.1.3:2.>^^^9.1.3q2.>9.4q2.>',
      F: '9.4.2,>9.3.3,>9.2.4,>^9.2.1,2A1,>9.2.4,>9.2.2{1G1{>9.2.3{1G>9.3.3{>9.1.4G2,3G3.3,5.9.9G2G1.6Y3.9.2G1F5c3G1.2i2,2i3.9.2G1F1c1G1c1G1c1G1F2G2.2G5.9.2G1F1c3G1c1G1F6G5.9.2G1F2c1G2c1G1F5G6.9.2G1F2c1G2c1G1F1.3G7.9.2G1F5c1G1F9.2.9.2G1F6G1F9.2.7.2i3,1Y5G1F9.2.7.2Y2,2i6:9.2.9.2.4:>^9.2.3:1.>^^^^^9.2.3q1.>^',
    }
  },
  {
    name: 'Bodoque',
    raw: {
      I: '~~9.4.1[9.7.9.4.1[2.2[9.3.9.2[2.1[1.>8.2[3.1[1.>8.3[2.1[1.>8.2A3.2[>7.1A1G3.3[>6.2A1G3.3[>6.1A1G4.3[>6.1A1G1A1G1A2.2[>8.1A1G1A1G3A>9.1.1A1G1A2G>9.4.5A9.3.9.4.2G>9.3.3A>9.3.3G>9.3.3A>9.2.4[>9.2.9[9.1.9.1.2[7.1[9.1.9.2[4.>^^^9.1.2[3.>9.3[3.>~~',
      // LUP0: null, // Will be created as horizontal mirror of R0
      // LUP1: null, // Will be created as horizontal mirror of R1
      R0: '9.4.1[9.7.9.4.1[2.2[9.3.9.4.1[1.>9.4.1[2.1[2.3[8.9.4.1[2.1[3.2[8.9.4.4[3.2A8.9.3.6[2.3G7.9.3.6[3.2A7.9.3.6[3.2G7.9.4.4[3.2A8.9.1.1A1G6A1G1A2G8.9.1G1A1G1A4G1A1G1A9.1.8.1A1G1A2.5A9.3.8.3A2.4G9.4.9.2G2.4A9.4.9.1.2A1.4G9.4.9.1.3[5A9.3.9.1.1[1.6G1.2[9.9.3.5A5[8.9.2.8[1.2[8.9.2.7[2.2[8.9.1.3[7.2[8.9.1.2[8.2[8.9.1.1[9.3[7.9.1.1[9.9.1.9.1.2[9.9.9.3[9.9.~~~',
      R1: '9.4.1[9.7.9.4.1[2.2[1.3[8.9.4.1[2.1[3.2[8.9.4.1[2.1[3.2A8.9.4.1[2.1[3.1A2G7.9.4.4[4.2A7.9.3.6[3.2G7.9.3.6[3.2A7.9.3.6[2.2G8.9.4.4[2.2A9.9.4.6A2G9.9.1.1A1G1A5G1A9.2.9.1G1A1G6A9.3.9.1G1A2.4G9.4.9.2A2.4A9.4.9.1.2G1.4G9.4.9.1.2A1.4A9.4.9.1.3[4G9.4.9.1.1[2.4A9.4.9.4.2G>9.4.2A>9.4.2[>9.3.3[>9.2.3[2.2[9.3.9.2.2[2.>^9.2.1[5.2[9.2.9.1.2[6.1[9.2.9.3[6.2[9.1.~',
      F: '9.3.2[3.2[9.2.9.3.2[2.3[9.2.9.3.2[1.>^^9.3.7[9.2.9.3.1[1A2[1A2[9.2.^9.3.2[2O3[9.2.9.4.5[9.3.9.4.5A9.3.9.3.7G9.2.9.2.1G7A1G9.1.9.2.1A1.5G1.1A9.1.9.2.1G1.5A1.1G9.1.9.2.1A1.5G1.1A9.1.9.2.1G1.5A1.1G9.1.9.2.1A1.5G1.1A9.1.9.1.2[1.5A1.2[9.9.1.2[1.5G1.2[9.9.4.5A9.3.9.4.5[9.3.^9.4.1[3.1[9.3.^^^^9.3.2[1.>^',
    }
  },
  {
    name: 'Profesor Rossa',
    raw: {
      I: '~~9.3.3=>9.2.4=>8.2,5=>7.2,1.5=>7.3,5=>7.2D1.5=>6.3$1.5=>5.3$3.1,3=>5.4$3.3,>5.4$3.6A2.5$5.6.6$6A5$7.7.5$6A3$9.9.1.2$3A>9.2.4A>^^^9.2.4B>9.2.4A>9.2.9A9.1.9.1.4A1.>9.4A2.>9.3A3.>^^9.3B3.>8.4B3.>~',
      // LUP0: null,
      // LUP1: null,
      R0: '9.3.3=>9.2.4=>9.1.5=>9.1.9=1=4,6.9.1.9=1=1.3,6.9.1.9=1=1.3D6.9.1.9=1=1.3$6.9.2.1,6=1,2.3$6.9.3.6,3.3$6.9.3.6A2.4$6.9.3$7A4$7.8.4$7A4$7.7.5$7A3$8.7.3$1.8A9.2.^8.2D1.8A9.2.8.3,8A9.2.8.2,1.8B2A9.9.2.9A2A8.^9.2.6A2.3A8.9.1.4A5.3A8.9.1.3A6.3A8.9.1.3A6.3B8.9.1.3A6.4B7.9.1.3A9.8.9.1.3B9.8.9.4B9.8.~~',
      R1: '9.3.6=3.4,5.9.2.8=3.3,5.9.1.9=1=2.3D5.9.1.9=1=2.3$5.^^9.1.9=1=1.4$5.9.2.1,6=1,2.3$1A5.9.3.6,3.3$6.9.3.6A1.1A3$7.9.2.8A3$8.9.2$4A>8.3$8A9.2.7.3$9A9.2.7.3$1.8A9.2.^^7.3D1.8A9.2.7.3,1.8B9.2.7.2,2.8A9.2.9.2.4A>^^9.1.4A1.>^9.1.3A2.>^^9.1.3B2.>9.4B2.>',
      F: '9.3.3=>9.2.4=>9.1.3=2,>9.1.2=2&1,>9.1.2=2A1{>9.1.2=2,1{>9.1.1=3,1&>9.2.2,1&1_>9.3.3,>9.1.2A2$1A>9.3A3$>9.1$3A2$>9.2$3A1$>9.2$4A>^^^9.2D4A>9.2,4B>9.2,4A>9.2.4A>^9.2.3A1.>^^^^^9.2.3B1.>^',
    }
  },
  {
    name: 'E-Girl',
    raw: {
      I: '~~~~8.2;2.3G>7.2;2.4G>7.3;1.4G>7.2$2.8%2.3$6.6.3$2.8%3.2$6.5.3$3.4%>5.4$2.4%>5.4$2.7%2.4$6.6.6$6%5$7.7.5$6%4$8.9.4$4%3$9.1.9.3.1$3%2$9.3.9.3.2$1%>9.3.2$1%3$9.3.9.3.3$>9.3.3%>9.2.4G>^9.1.5G>9.1.4G1.>9.4G2.>9.3G3.>^^9.3%3.>8.4%3.>',
      // LUP0: null,
      // LUP1: null,
      R0: '~~9.3.3G>9.2.8G1.3;7.9.2.8G2.3;6.9.2.8%3.2$6.^9.2.8%2.3$6.^9.2.7%2.3$7.9.3$6%5$7.8.4$5%6$7.7.6$3%6$8.7.3$2.2$2%2$9.3.7.3$2.2$1%3$9.3.8.2$2.6$9.3.8.3;1.6%9.3.8.2;1.9G1G9.9.2.9G2G8.^9.2.3G5.3G8.9.1.4G5.3G8.9.1.3G6.3G8.9.1.3G6.3%8.9.1.3G6.4%7.9.1.3G9.8.9.1.3%9.8.9.4%9.8.~~',
      R1: '9.9.3.3;6.9.9.4.3;5.9.3.6G4.1;2$5.9.2.8G4.2$5.^9.2.8%4.2$5.9.2.8%3.3$5.9.2.8%2.4$5.9.2.8%1.4$6.9.2.7%1.4$7.9.2.6%5$8.9.3$5%4$9.8.5$3%2$9.3.7.4$1.1$2%3$9.3.7.3$2.2$1%3$9.3.7.3$2.6$9.3.^^7.3;2.6%9.3.7.2;2.8G9.2.9.2.4G>9.2.3G1.>^^9.1.3G2.>^^^9.1.3%2.>9.4%2.>',
      F: '~9.3.3G>9.2.3G1%>9.2.4G>9.2.4%>9.2.1%2;1%>9.2.1%2M1;>9.2.1%3;>9.2.2%2;>9.3.2%1,>9.2.1$2%1$>9.1.2$2%1$>9.3$2%1$>9.2$3%1$>^9.2$2%2$>9.3$1%2$>^9.2,4$>9.2,4%>9.2.4G>^^^^^^^9.2.4%>^',
    }
  },
  {
    name: 'Pandemia',
    raw: {
      I: '~9.5.1<1.1<9.4.9.3.3<>9.4.2/>8.2/2.3/>7.2/3.3/>7.3/1.4/>7.2o2.8/3.2o6.6.3B2.8/3.2B6.5.3B3.4/>5.4B2.2<2/>5.4B3.6<2.4B6.6.9B8B7.7.9B6B8.9.9B2B9.1.9.2.4B>^^^^^^9.1.1B1f1B1f1B1f1B1f1B1f9.1.9.1.5f>9.4f2.>9.3f3.>^^9.3/3.>8.4/3.>',
      // LUP0: null,
      // LUP1: null,
      R0: '9.4.2<>9.3.3<>9.4.2/>9.3.6/2.3/7.9.3.6/3.3/6.9.2.8/3.2o6.9.2.8/3.2B6.9.2.8/2.3B6.9.2.2<4/2<2.3B6.9.2.1B6<2.3B7.9.9B5B7.8.9B6B7.7.9B6B8.7.3B1.8B9.2.^8.2o1.8B9.2.8.3/8B9.2.8.2/1.9B1f9.9.2.8B3f8.9.2.1B1f1B1f1B1f1B4f8.9.2.3f5.3f8.9.1.4f5.3f8.9.1.3f6.3f8.9.1.3f6.3/8.9.1.3f6.4/7.9.1.3f9.8.9.1.3/9.8.9.4/9.8.~~',
      R1: '9.5.1<1.1<4.3/6.9.3.6<4.3/5.9.4.4<5.1/2o5.9.4.4/5.2o1B5.9.3.6/5.2B5.^9.3.7/3.3B5.9.2.8/2.4B5.9.2.8/1.4B6.9.2.8/4B7.9.2.2<4/2<3B8.9.3B3<>8.9B2B9.2.7.9B3B9.2.7.3B1.8B9.2.^^7.3o1.8B9.2.7.3/1.8B9.2.7.2/2.8B9.2.9.2.4B>9.2.1B1f1B1f>9.2.3f1.>^9.1.3f2.>^^^9.1.3/2.>9.4/2.>',
      F: '9.4.1?1.>9.3.3?>9.4.2<>9.3.3<>^9.3.3A>9.2.1<2G1?>9.2.1<1G1A1?>9.2.3<1?>9.2.1<1A1<1?>9.2.2<2A>9.1.2B1?2<>9.3B1o2?>9.4B2o>^9.1B1/3B1o>9.1B1/4B>^9.2o4B>9.2<4B>^9.2.4B>^9.2.1B1f1B1f1B1f1B1f9.2.9.2.4f>9.2.3f1.>^^9.2.3<1.>^',
    }
  }
];

// Guard sprites (reuses player sprites for now)
const GUARD = {
  I: '~~~9.2.4A>8.2{1.4A>7.2{2.4A>7.3{1.4U>7.2D2.4U>6.3A2.4U>5.3A3.1{3U>5.4A3.3{>5.4A3.6A2.5A5.6.9A8A7.7.9A6A8.9.9A2A9.1.9.2.4A>^^9.2.1B2}5B9.2.^9.2.4A>^9.1.5A>9.1.4A1.>9.4A2.>9.3A3.>^^9.3B3.>8.4B3.>',
  // LUP0: null, // Will be mirrored from R0 below
  // LUP1: null, // Will be mirrored from R1 below
  R0: '~9.2.4A>^9.2.8A1.4{6.9.2.8U2.3{6.9.2.8U2.3D6.9.2.8U2.3A6.9.2.1{6U1{2.3A6.9.3.6{3.3A6.9.3.6A2.4A6.9.9A5A7.8.9A6A7.7.9A6A8.7.3A1.8A9.2.^8.2D1.8A9.2.8.3{1B2}5B9.2.8.2{1.1B2}5B2A9.9.2.9A2A8.^9.2.6A2.3A8.9.1.4A5.3A8.9.1.3A6.3A8.9.1.3A6.3B8.9.1.3A6.4B7.9.1.3A9.8.9.1.3B9.8.9.4B9.8.~~',
  R1: '9.9.3.4{5.9.2.8A3.3{5.9.2.8A3.3D5.9.2.8A3.3A5.9.2.8U3.3A5.^9.2.8U2.4A5.9.2.1{6U1{2.4A5.9.3.6{3.3A6.9.3.6A1.4A7.9.2.9A2A8.9.6A>8.9A2A9.2.7.9A3A9.2.7.3A1.8A9.2.^^7.3D1.1B2}5B9.2.7.3{1.1B2}5B9.2.7.2{2.8A9.2.9.2.4A>^^9.1.4A1.>^9.1.3A2.>^^9.1.3B2.>9.4B2.>',
  F: '9.2.4A>9.2.2A2O>^9.2.3U1O>9.2.4q>9.2.3q1{>9.2.3{1U>9.2.2{1U1J>9.3.3{>9.1.2A2D1A>9.4A1D1A>^9.6A>^^^^9.2D3B1O>9.2{3B1O>9.2{4A>9.2.4A>^9.2.3A1.>^^^^^9.2.3B1.>^',
};

// Mirror sprites for guard (must be done after RAW_GUARD_SPRITES is defined)
if (GUARD.R0 && !GUARD.LUP0) {
  GUARD.LUP0 = mirror(GUARD.R0);
}
if (GUARD.R1 && !GUARD.LUP1) {
  GUARD.LUP1 = mirror(GUARD.R1);
}

// Player animation cycle for climbing
const CLIMB_CYCLE = ['I', 'R0', 'R1', 'R0', 'I', 'LUP0', 'LUP1', 'LUP0', 'I'];


// Game States
const STATES = {
  CINEMATIC: 'CINEMATIC',
  PLAYING: 'PLAYING',
  VICTORY: 'VICTORY',
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
//   > = horizontal symmetry marker (mirrors left half to right half, only for even widths)
function parseCSEF(s, w) {
  const r = [], p = [];
  for (let i = 0; i < s.length;) {
    if (!p.length) {
      if (s[i] === '~') { r.push(Array(w).fill('.')); i++; continue; }
      if (s[i] === '^') { if (r.length) r.push([...r.at(-1)]); i++; continue; }
    }
    if (s[i] === '>' && p.length >= w / 2 && w % 2 === 0) {
      const h = p.slice(0, w / 2);
      r.push([...h, ...h.toReversed()]);
      p.length = 0;
      i++;
      continue;
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
function parseSprite(sData, w = 30) {
  // sData = sprite data, w = width
  if (!sData) return [];
  // If it's already an array, return it directly
  if (Array.isArray(sData)) return sData;
  // Otherwise parse as CSEF string
  return parseCSEF(sData, w);
}

function mirror(sStr, w = C.PW) {
  // Mirror sprite horizontally (sStr = sprite string, w = width)
  const sData = parseCSEF(sStr, w); // sData = sprite data

  // Mirror each row
  const mir = sData.map(r => {
    // r = row, pRow = padded row
    const pRow = [...r];
    while (pRow.length < w) pRow.push(' ');
    return pRow.reverse();
  });

  // Return the 2D array directly (no need to encode back to string)
  return mir;
}

function buildSpriteSet(rawMap, w = C.PW) {
  // Build sprite set from raw map (w = width)
  const parsed = {};
  for (const k in rawMap) {
    const v = rawMap[k]; // k = key, v = value
    parsed[k] = v ? parseSprite(v, w) : null;
  }
  return parsed;
}

CHARACTERS.forEach(chr => {
  // chr = character
  const raw = chr.raw;
  if (raw.R0 && !raw.LUP0) raw.LUP0 = mirror(raw.R0);
  if (raw.R1 && !raw.LUP1) raw.LUP1 = mirror(raw.R1);
  chr.sprites = buildSpriteSet(raw);
});

const GUARD_SPRITES = buildSpriteSet(GUARD);

function drawSprite(gfx, sData, x, y, opt = {}) {
  // Draw sprite to graphics (gfx = graphics, sData = sprite data, opt = options)
  if (!sData || !sData.length) return;

  const h = sData.length; // h = height
  const w = sData[0]?.length || 0; // w = width
  if (!w) return;

  const cx = w >> 1; // cx = center X (faster than w/2)
  const cy = h >> 1; // cy = center Y

  // Shadow pass
  if (!opt.noShadow) {
    for (let r = 0; r < h; r++) {
      const row = sData[r]; // r = row index
      for (let c = 0; c < row.length; c++) {
        const col = COLOR_MAP[row[c]]; // c = column index, col = color
        if (col != null) {
          gfx.fillStyle(P[0], 0.3);
          gfx.fillRect(x - cx + c + 1 | 0, y - cy + r + 2 | 0, 1, 1);
        }
      }
    }
  }

  // Main sprite pass
  for (let r = 0; r < h; r++) {
    const row = sData[r]; // r = row index
    for (let c = 0; c < row.length; c++) {
      const col = COLOR_MAP[row[c]]; // c = column index, col = color
      if (col != null) {
        gfx.fillStyle(col, 1);
        gfx.fillRect(x - cx + c | 0, y - cy + r | 0, 1, 1);
      }
    }
  }
}
// Horizontal movement animation cycle (alternates between left and right arm reaching)
const HORIZONTAL_CYCLE = ['LUP0', 'R0'];

// =============================================================================
// SOUND MANAGER (Web Audio API)
// =============================================================================
class SoundManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterVol = 0.15; // Master volume
  }

  // Play a tone with frequency, duration, volume, and optional envelope
  play(freq, dur = 0.1, vol = 1, type = 'square', envelope = { a: 0.01, d: 0.05, s: 0.7, r: 0.05 }) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    const now = this.ctx.currentTime;
    const { a, d, s, r } = envelope;
    const v = vol * this.masterVol;
    // ADSR envelope
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(v, now + a); // Attack
    g.gain.linearRampToValueAtTime(v * s, now + a + d); // Decay to sustain
    g.gain.setValueAtTime(v * s, now + dur - r); // Sustain
    g.gain.linearRampToValueAtTime(0, now + dur); // Release
    osc.start(now);
    osc.stop(now + dur);
    return osc;
  }

  // Falling object whoosh sound
  fall() {
    this.play(800, 0.3, 0.3, 'sawtooth', { a: 0.01, d: 0.2, s: 0.3, r: 0.1 });
    setTimeout(() => this.play(400, 0.15, 0.2, 'sawtooth'), 50);
  }

  // Object hits player - impact sound
  hit() {
    this.play(150, 0.15, 0.6, 'square', { a: 0.001, d: 0.1, s: 0.1, r: 0.05 });
    setTimeout(() => this.play(80, 0.1, 0.4, 'square'), 30);
  }

  // Climbing/stepping sound
  step() {
    this.play(220 + Math.random() * 40, 0.08, 0.25, 'square', { a: 0.01, d: 0.03, s: 0.5, r: 0.04 });
  }

  // Moving left/right sound
  move() {
    this.play(180 + Math.random() * 30, 0.06, 0.2, 'square', { a: 0.01, d: 0.02, s: 0.6, r: 0.03 });
  }

  // Menu selection change (beep)
  select() {
    this.play(440, 0.08, 0.3, 'square', { a: 0.01, d: 0.03, s: 0.5, r: 0.04 });
  }

  // Menu confirm (higher beep)
  confirm() {
    this.play(880, 0.12, 0.4, 'square', { a: 0.01, d: 0.05, s: 0.6, r: 0.06 });
  }

  // Scene transition whoosh
  transition() {
    this.play(1200, 0.3, 0.3, 'sine', { a: 0.02, d: 0.15, s: 0.4, r: 0.13 });
    setTimeout(() => this.play(600, 0.2, 0.2, 'sine'), 100);
  }

  // Victory music (ascending arpeggio)
  victory() {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.play(freq, 0.4, 0.5, 'triangle', { a: 0.02, d: 0.1, s: 0.7, r: 0.1 }), i * 150);
    });
  }

  // Loss music (descending sad tones)
  loss() {
    const notes = [440, 392, 349, 330]; // A4, G4, F4, E4
    notes.forEach((freq, i) => {
      setTimeout(() => this.play(freq, 0.5, 0.4, 'triangle', { a: 0.05, d: 0.15, s: 0.6, r: 0.2 }), i * 200);
    });
  }
}

// Global sound manager instance
const SND = new SoundManager();

// =============================================================================
// OBSTACLE TYPES (14x14 pixels)
// =============================================================================
// Falling object emojis (compact string to save bytes)
const OBS = '🖨️|🧰|🪴|📦|🍌|🧯|🪑|📠|📺|🗃️|🍎|🍏|🖥️'.split('|');

// =============================================================================
// OBSTACLE ENTITY CLASS
// =============================================================================
class Obstacle {
  constructor(scene, x, y, emoji, speed = null) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.emoji = emoji;
    this.active = true;
    this.size = C.OS;
    this.playedSound = false; // Track if fall sound played
    this.speed = speed !== null ? speed : (0.9 + Math.random() * 0.2) * C.OFS; // Random speed 0.9-1.1 * C.OFS

    // Create text object for emoji
    this.text = scene.add.text(x, y, emoji, {
      fontSize: '14px',
      align: 'center'
    }).setOrigin(0.5).setDepth(15);
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
    if (!this.active) return;

    this.y += this.speed * (delta / 1000);
    this.text.setPosition(this.x, this.y);

    // Remove if out of visible area (above or below camera view)
    const cameraTopY = this.scene.camTY - (C.GH / 2);
    const cameraBottomY = this.scene.camTY + (C.GH / 2);
    if (this.y > cameraBottomY + 100 || this.y < cameraTopY - 100) this.destroy();
  }

  destroy() {
    this.active = false;
    if (this.text) this.text.destroy();
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
    this.animState = 'I';
    this.animIndex = 0;
    this.animTimer = 0;
    this.isClimbing = false;

    // Collision box (14x26 centered in 30x30 sprite)
    this.colliderWidth = 14;
    this.colliderHeight = 26;

    // Graphics
    this.gr = scene.add.graphics();
    this.gr.setDepth(50);
  }

  colToX(col) {
    const buildingStartX = (C.GW - C.BW) / 2;
    const colWidth = C.BW / (C.BAC - 1);
    return buildingStartX + col * colWidth;
  }

  rowToY(row) {
    const startY = C.GH - 20;
    return startY - (row * C.RHEIGHT);
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
    if (this.gr) {
      this.gr.destroy();
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
    this.chr = character; // chr = character data
    this.spr = character.sprites; // spr = sprites object

    // Player-specific properties (base properties already set by Character)
    this.tRow = row; // tRow = target row

    // Input state (inp = input)
    this.inpU = this.inpD = this.inpL = this.inpR = false;

    // Movement state (isCl already set by Character)
    this.isMvH = false; // isMvH = is moving horizontal
    this.hAnimIdx = 0; // hAnimIdx = horizontal animation index (Start at LUP0)

    // Lives
    this.liv = 3; // liv = lives
    this.isDd = this.isFl = false; // isDd = is dead, isFl = is falling
    this.flVel = this.flRot = 0; // flVel = fall velocity, flRot = fall rotation

    // Caught by guard state
    this.isCgt = false; // isCgt = is caught
    this.lostAnimT = 0; // lostAnimT = lost animation timer
    this.lostAnimSt = 'LUP0'; // lostAnimSt = lost animation state (Alternates between LUP0 and R0)

    // Falling one row state (becomes an obstacle to other players)
    this.isFl1R = false; // isFl1R = is falling one row
    this.fl1RT = 0; // fl1RT = fall one row timer
    this.fl1RDur = 600; // fl1RDur = fall one row duration (600ms fall animation - climbing down animation)

    // Win state
    this.hasW = false; // hasW = has won
    this.isEntW = false; // isEntW = is entering window
    this.entWT = 0; // entWT = enter window timer
    this.entWDur = 800; // entWDur = enter window duration (800ms entry animation)

    // Collision box offsets (colliderWidth/Height already set by Character)
    this.colOfsX = (C.PW - this.colliderWidth) / 2; // colOfsX = collider offset X (8)
    this.colOfsY = (C.PH - this.colliderHeight) / 2; // colOfsY = collider offset Y (2)

    // Override graphics depth for players
    this.gr.setDepth(10);
  }

  // Check collision with another player (player-specific)
  chkPCol(otherP) {
    // chkPCol = check player collision, otherP = other player
    if (otherP.isDd || this.isDd) return false;
    return this.checkCollision(otherP.getColliderBounds());
  }

  // Check if moving to a specific row would cause collision
  wdColAtRow(newR, otherPs) {
    // wdColAtRow = would collide at row, newR = new row, otherPs = other players
    // Check if there's a player at the destination row that would block us
    for (let o of otherPs) {
      if (o === this || o.isDd || o.isFl || o.isFl1R) continue;

      // Only check if the other player is actually AT the destination row
      // Players at the current row or far away shouldn't block vertical movement
      if (o.row !== newR) continue;

      // Check if there's horizontal overlap with the other player
      const myL = this.x - this.colliderWidth / 2; // myL = my left
      const myR = this.x + this.colliderWidth / 2; // myR = my right
      const oL = o.x - o.colliderWidth / 2; // oL = other left
      const oR = o.x + o.colliderWidth / 2; // oR = other right

      const hOvlp = !(myR < oL || myL > oR); // hOvlp = horizontal overlap

      // Block if there's horizontal overlap at the destination row
      if (hOvlp) return true;
    }

    return false;
  }

  setInp(u, d, l, r) {
    // setInp = set input (u = up, d = down, l = left, r = right)
    this.inpU = u;
    this.inpD = d;
    this.inpL = l;
    this.inpR = r;
  }

  upd(d) {
    // upd = update (d = delta)
    // Handle LOST animation (caught by guard)
    if (this.isCgt) {
      this.lostAnimT += d;

      // Alternate between LUP0 and R0 every 200ms
      if (this.lostAnimT >= 200) {
        this.lostAnimT = 0;
        this.lostAnimSt = this.lostAnimSt === 'LUP0' ? 'R0' : 'LUP0';
      }

      this.drw();
      return; // Don't process anything else
    }

    // Handle falling animation (Mario-like)
    if (this.isFl) {
      this.flVel += 500 * (d / 1000); // Gravity acceleration
      this.y += this.flVel * (d / 1000);
      this.flRot += (d / 1000) * 5; // Rotate while falling

      // Keep target positions synced to prevent interpolation from pulling player back
      this.targetX = this.x;
      this.targetY = this.y;

      // Check if hit the ground (floor level)
      const flrLvl = C.GH; // flrLvl = floor level
      if (this.y >= flrLvl) {
        this.y = flrLvl;
        this.targetY = this.y; // Lock position
        this.isFl = false;
        this.flVel = 0;
        this.flRot = 0;
        this.isDd = true; // Player is dead if they hit the floor
      }

      this.drw();
      return;
    }

    // Handle falling one row (after taking damage but not dead)
    // This just plays the climbing down animation automatically
    if (this.isFl1R) {
      this.fl1RT += d;

      // Continue the climbing down animation
      this.animTimer += d;
      if (this.animTimer >= C.STEP) {
        this.animTimer = 0;
        this.advClAnim(true); // advClAnim = advance climb animation (going down)
      }

      // Smooth position interpolation (only Y, stay at current X)
      this.x = Phaser.Math.Linear(this.x, this.targetX, 0.2);
      this.y = Phaser.Math.Linear(this.y, this.targetY, 0.15);

      // Finished falling one row
      if (this.fl1RT >= this.fl1RDur) {
        this.isFl1R = false;
        this.fl1RT = 0;
        this.isClimbing = false;
      }

      this.drw();
      return; // Don't process other input while falling
    }

    if (this.isDd) return;

    // Handle entering window animation (winning)
    if (this.isEntW) {
      this.entWT += d;

      // Move slightly into the building (toward center)
      const bCX = C.GW / 2; // bCX = building center X
      const mvX = (bCX - this.x) * 0.02; // mvX = move X
      this.x += mvX;
      this.targetX = this.x;

      // Finished entering window
      if (this.entWT >= this.entWDur) {
        this.hasW = true;
        this.isEntW = false;
      }

      this.drw();
      return;
    }

    // Don't process input if already won
    if (this.hasW) return;

    // Handle horizontal movement (resets climbing state)
    if (this.inpL || this.inpR) {
      const dir = this.inpL ? -1 : 1;

      // Reset climbing animation when moving horizontally
      if (this.isClimbing) {
        this.isClimbing = false;
        this.animIndex = 0; // Reset to I in climb cycle
      }

      // Start horizontal movement animation
      if (!this.isMvH) {
        this.isMvH = true;
        this.hAnimIdx = 0;
        this.animTimer = 0;
        this.animIndex = 0; // Reset climb cycle index
      }

      // Move continuously (smooth movement)
      const newCol = Phaser.Math.Clamp(this.col + dir * 0.06, 0, C.BAC - 1);
      if (newCol !== this.col) {
        this.col = newCol;
        this.targetX = this.colToX(this.col);
      }

      // Animate between LUP0 and R0 for visual climbing feel
      this.animTimer += d;
      if (this.animTimer >= C.STEP) {
        this.animTimer = 0;
        this.hAnimIdx = (this.hAnimIdx + 1) % HORIZONTAL_CYCLE.length;
        SND.move(); // Play move sound on each animation step
      }
      this.animState = HORIZONTAL_CYCLE[this.hAnimIdx];

    } else {
      // No horizontal input - stop horizontal animation
      if (this.isMvH) {
        this.isMvH = false;
        this.animState = 'I';
        this.hAnimIdx = 0;
      }
    }

    // Handle vertical climbing (only if not moving horizontally)
    if (!this.isMvH) {
      if (this.inpU && !this.inpD) {
        if (!this.isClimbing) {
          this.isClimbing = true;
          this.animTimer = 0;
        }

        // Advance through climb animation
        this.animTimer += d;
        if (this.animTimer >= C.STEP) {
          this.animTimer = 0;
          this.advClAnim();
        }
      } else if (this.inpD && !this.inpU) {
        // Climbing down (same animation cycle, but going down)
        if (!this.isClimbing) {
          this.isClimbing = true;
          this.animTimer = 0;
        }

        this.animTimer += d;
        if (this.animTimer >= C.STEP) {
          this.animTimer = 0;
          this.advClAnim(true); // going down
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
    this.drw();
  }

  advClAnim(goingDn = false) {
    // advClAnim = advance climb animation, goingDn = going down
    // Move through the climb cycle
    this.animIndex = (this.animIndex + 1) % CLIMB_CYCLE.length;
    this.animState = CLIMB_CYCLE[this.animIndex];

    // Movement happens at LUP1 and R1 states (climbing motion)
    if (this.animState === 'LUP1' || this.animState === 'R1') {
      const newR = goingDn ? this.row - 1 : this.row + 1; // newR = new row

      // Clamp to valid rows
      if (newR >= 0 && newR <= C.ROWS) {
        // Check if this movement would cause a collision
        const wdCol = this.wdColAtRow(newR, this.scene.players); // wdCol = would collide

        if (!wdCol) {
          // Only move if no collision
          this.row = newR;
          this.targetY = this.rowToY(this.row);
          SND.step(); // Play step sound when climbing
        }
        // If blocked, animation continues but position doesn't change
      }
    }
  }

  drw() {
    // drw = draw
    this.gr.clear();

    // Get sprite data for current animation state
    const sprD = this.spr[this.animState] || this.spr.I; // sprD = sprite data

    // Apply alpha for entering window animation
    if (this.isEntW) {
      const prg = this.entWT / this.entWDur; // prg = progress
      this.gr.setAlpha(1 - prg); // Fade out
    } else if (this.hasW) {
      this.gr.setAlpha(0); // Fully invisible after entering
      return; // Don't draw anything
    } else {
      this.gr.setAlpha(1); // Normal
    }

    // Draw the sprite (rotation effect is visual only, we just flip/mirror for falling)
    if (this.isCgt) {
      // LOST animation - alternate between LUP0 and R0
      const lostSprD = this.spr[this.lostAnimSt] || this.spr.I; // lostSprD = lost sprite data
      drawSprite(this.gr, lostSprD, this.x, this.y);
    } else if (this.isFl) {
      // For death fall, we'll alternate the sprite for a tumbling effect
      const tmbFrm = Math.floor(this.flRot * 2) % 2; // tmbFrm = tumble frame
      const tmbSpr = tmbFrm === 0 ? 'LUP1' : 'R1'; // tmbSpr = tumble sprite
      const flSprD = this.spr[tmbSpr] || this.spr.I; // flSprD = falling sprite data
      drawSprite(this.gr, flSprD, this.x, this.y, { showSpriteBorder: false, noShadow: false });
    } else {
      // Use normal sprite (includes climbing down animation when isFl1R)
      drawSprite(this.gr, sprD, this.x, this.y);
    }
  }

  takeDmg() {
    // takeDmg = take damage
    if (this.isDd || this.isFl) return;

    this.liv--;
    SND.hit(); // Play hit sound

    if (this.liv <= 0) {
      this.die();
    } else {
      // Player still has lives - fall one row as punishment
      this.fl1R(); // fl1R = fall one row
    }
  }

  fl1R() {
    // fl1R = fall one row
    // Make the player fall down one row using the climbing down animation
    if (this.row > 0) {
      // Set flag to prevent input and start animation
      this.isFl1R = true;
      this.fl1RT = 0;

      // Start climbing down from the middle of the cycle (LUP0)
      // So the next step will be LUP1 which triggers the actual row movement
      this.isClimbing = true;
      this.animIndex = 5; // Start at LUP0 (index 5 in CLIMB_CYCLE)
      this.animState = CLIMB_CYCLE[5]; // 'LUP0'
      this.animTimer = 0;

    }
  }

  die() {
    // Instant kill: set lives to zero and start falling animation
    this.liv = 0; // Set lives to zero
    this.isFl = true;
    this.flVel = -200; // Initial upward velocity (Mario bounce)
    this.flRot = 0;

    // Ensure target positions don't interfere with fall animation
    // Set them to current position so interpolation doesn't pull player back
    this.targetX = this.x;
    this.targetY = this.y;

    // Stop all other animations and states
    this.isClimbing = false;
    this.isMvH = false;
    this.isFl1R = false;
    this.isCgt = false;

  }
}

// =============================================================================
// GUARD ENEMY CLASS
// =============================================================================
class Guard extends Character {
  constructor(scene, col, row) {
    super(scene, 0, col, row); // playerNum=0 for guard (not a real player)

    // AI state (nCD=next climb delay, cTmr=climb timer, tP=target player)
    this.nCD = this.getRndCD();
    this.cTmr = 0;
    this.tP = null;

    // Falling state for death (isFl=is falling, fVel=fall velocity, fRot=fall rotation, isDd=is dead)
    this.isFl = false;
    this.fVel = 0;
    this.fRot = 0;
    this.isDd = false;
  }

  getRndCD() {
    // Get random climb delay (getRndCD=get random climb delay)
    const min = C.GCmD;
    const max = C.GCMD;
    return min + Math.random() * (max - min);
  }

  update(d) {
    // Update guard AI and movement (d=delta)
    if (this.isDd) {
      this.draw();
      return;
    }

    // Handle falling animation when defeated
    if (this.isFl) {
      this.fVel += 500 * (d / 1000); // Gravity
      this.y += this.fVel * (d / 1000);
      this.fRot += (d / 1000) * 5;
      this.targetX = this.x;
      this.targetY = this.y;

      // Check if hit the ground
      const flLvl = C.GAME_HEIGHT; // flLvl = floor level
      if (this.y >= flLvl) {
        this.y = flLvl;
        this.isFl = false;
        this.isDd = true; // Guard is dead now
      }

      this.draw();
      return;
    }

    // AI: Find target player (chase the highest one)
    this.fndTgt();

    // AI: Move toward target
    if (this.tP) {
      this.mvTwd(d);
    }

    // Smooth position interpolation
    this.x = Phaser.Math.Linear(this.x, this.targetX, 0.2);
    this.y = Phaser.Math.Linear(this.y, this.targetY, 0.15);

    // Draw
    this.draw();
  }

  fndTgt() {
    // Find target player to chase (fndTgt=find target, aP=alive players)
    const aP = this.scene.players.filter(p => !p.isDd && !p.isFl);

    if (aP.length === 0) {
      this.tP = null;
      return;
    }

    // Chase the nearest player by distance
    this.tP = aP.reduce((nst, p) => {
      // nst=nearest, p=player, dP=distance to player, dN=distance to nearest
      const dP = Math.sqrt(Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2));
      const dN = Math.sqrt(Math.pow(nst.x - this.x, 2) + Math.pow(nst.y - this.y, 2));
      return dP < dN ? p : nst;
    });
  }

  mvTwd(d) {
    // Move toward target player (mvTwd=move toward, d=delta)
    if (!this.tP) return;

    const tR = this.tP.row; // tR = target row
    const tC = this.tP.col; // tC = target col

    // Calculate speed multipliers based on game state (sM=speed multiplier)
    let sM = 1.0;

    // 1. Initial slow multiplier (before row 10)
    if (this.tP.row < C.OSR) {
      sM *= C.GISM;
    }

    // 2. Off-screen boost (when guard is below camera view)
    const cBY = this.scene.cameraTargetY + (C.GH / 2); // cBY = camera bottom Y
    const gY = this.getWorldY(); // gY = guard Y

    if (gY > cBY) {
      // Guard is below camera (off-screen) - boost speed to catch up
      sM *= C.GOB;
    }

    // Vertical movement (climbing) with speed multiplier
    this.cTmr += d * sM;

    if (this.cTmr >= this.nCD) {
      this.cTmr = 0;
      this.nCD = this.getRndCD();

      // Climb toward target
      if (this.row < tR) {
        // Need to climb up
        if (!this.isClimbing) {
          this.isClimbing = true;
          this.animTimer = 0;
          this.animIndex = 0;
        }
        this.advCA(false); // Climbing up
      } else if (this.row > tR) {
        // Need to climb down
        if (!this.isClimbing) {
          this.isClimbing = true;
          this.animTimer = 0;
          this.animIndex = 5; // Start at LUP0 for going down
        }
        this.advCA(true); // Climbing down
      } else {
        this.isClimbing = false;
      }
    }

    // Continue climbing animation if climbing
    if (this.isClimbing) {
      this.animTimer += d * sM;
      if (this.animTimer >= C.STEP) {
        this.animTimer = 0;
        const gDwn = this.row > tR; // gDwn = going down
        this.advCA(gDwn);
      }
    }

    // Horizontal movement (move toward target column) with speed multiplier
    const cDif = tC - this.col; // cDif = column difference

    if (Math.abs(cDif) > 0.5) {
      // Move horizontally with chase speed and multiplier
      const dir = cDif > 0 ? 1 : -1; // dir = direction
      this.col += dir * C.GCS * sM;

      // Clamp to valid columns
      this.col = Math.max(0, Math.min(C.BAC - 1, this.col));
      this.targetX = this.colToX(this.col);
    }
  }

  advCA(gDwn = false) {
    // Advance climb animation (advCA=advance climb animation, gDwn=going down)
    this.animIndex = (this.animIndex + 1) % CLIMB_CYCLE.length;
    this.animState = CLIMB_CYCLE[this.animIndex];

    // Movement happens at LUP1 and R1 states
    if (this.animState === 'LUP1' || this.animState === 'R1') {
      const nR = gDwn ? this.row - 1 : this.row + 1; // nR = new row

      // Clamp to valid rows
      if (nR >= 0 && nR <= C.ROWS) {
        this.row = nR;
        this.targetY = this.rowToY(this.row);
      }
    }

    // Stop climbing at I
    if (this.animState === 'I' && this.animIndex === 0) {
      this.isClimbing = false;
    }
  }

  draw() {
    // Draw guard sprite
    this.gr.clear();

    // Get sprite data for current animation state (sData=sprite data)
    const sData = GUARD_SPRITES[this.animState] || GUARD_SPRITES.I;

    // Draw the guard sprite
    drawSprite(this.gr, sData, this.x, this.y);
  }

  destroy() {
    // Clean up graphics
    if (this.gr) {
      this.gr.destroy();
    }
  }
}

// =============================================================================
// DIALOG SYSTEM
// =============================================================================
class Dialog {
  constructor(scene) {
    this.scene = scene;
    this.act = false; // act = is active
    this.cur = null; // cur = current dialog

    // Dialog box dimensions (bH=box height, bP=box padding, pS=portrait size, pP=portrait padding)
    this.bH = 60;
    this.bP = 8;
    this.pS = 44; // 44x44 portrait (scaled from 30x30)
    this.pP = 4;

    // Text animation state (fTxt=full text, dTxt=displayed text, cIdx=char index, cDly=char delay, cTmr=char timer, tCmp=text complete)
    this.fTxt = '';
    this.dTxt = '';
    this.cIdx = 0;
    this.cDly = 30; // ms per character
    this.cTmr = 0;
    this.tCmp = false;

    // Audio context for beep sounds
    this.aCtx = null;
    this.aCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Create graphics objects - use Graphics for everything for consistency
    this.gfx = scene.add.graphics();
    this.gfx.setDepth(2000); // Way above everything
    this.gfx.setScrollFactor(0, 0); // Fixed to camera
    this.gfx.setVisible(true);

    // Portrait graphics
    this.pGfx = scene.add.graphics();
    this.pGfx.setDepth(2001);
    this.pGfx.setScrollFactor(0, 0);
    this.pGfx.setVisible(true);

    // Create text object
    this.tObj = scene.add.text(0, 0, '', {
      fontFamily: 'Courier New, monospace',
      fontSize: '11px',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 2,
      wordWrap: { width: 200 }
    });
    this.tObj.setDepth(2002);
    this.tObj.setScrollFactor(0, 0);
    this.tObj.setVisible(true);

    // Force graphics to top of render list
    scene.children.bringToTop(this.gfx);
    scene.children.bringToTop(this.pGfx);
    scene.children.bringToTop(this.tObj);
  }

  show(type, text, sprites = []) {
    // Show dialog with text animation
    this.act = true;
    this.cur = { type, text, sprites };
    this.tObj.setVisible(true);

    // Initialize text animation
    this.fTxt = text;
    this.dTxt = '';
    this.cIdx = 0;
    this.cTmr = 0;
    this.tCmp = false;
  }

  hide() {
    // Hide dialog and reset state
    this.act = false;
    this.cur = null;
    this.gfx.clear();
    this.pGfx.clear();
    this.tObj.setText('');
    this.tObj.setVisible(false);

    // Reset text animation
    this.fTxt = '';
    this.dTxt = '';
    this.cIdx = 0;
    this.tCmp = false;
  }

  playBeep(vType = 'PLAYER') {
    // Play voice beep sound (vType=voice type)
    if (!this.aCtx) return;

    // Create a short beep sound
    const osc = this.aCtx.createOscillator(); // osc = oscillator
    const gain = this.aCtx.createGain();

    osc.connect(gain);
    gain.connect(this.aCtx.destination);

    // Different pitch ranges for different voices (bFreq=base frequency, vari=variation)
    let bFreq, vari;
    if (vType === 'GUARD') {
      // Deeper voice for guard (250-350 Hz)
      bFreq = 275;
      vari = 75;
    } else {
      // Higher voice for players (450-600 Hz)
      bFreq = 450;
      vari = 150;
    }

    osc.frequency.value = bFreq + Math.random() * vari;
    osc.type = 'square';

    // Quick fade out
    gain.gain.setValueAtTime(C.VOL, this.aCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.aCtx.currentTime + 0.05);

    // Play for 50ms
    osc.start(this.aCtx.currentTime);
    osc.stop(this.aCtx.currentTime + 0.05);
  }

  updTxtAnim(d) {
    // Update text animation (d=delta)
    if (this.tCmp || !this.fTxt) return;

    this.cTmr += d;

    if (this.cTmr >= this.cDly) {
      this.cTmr = 0;

      if (this.cIdx < this.fTxt.length) {
        // Add next character
        this.dTxt += this.fTxt[this.cIdx];
        this.cIdx++;

        // Play beep (skip spaces) with voice type
        if (this.fTxt[this.cIdx - 1] !== ' ') {
          const vType = this.cur ? this.cur.type : 'PLAYER'; // vType = voice type
          this.playBeep(vType);
        }
      } else {
        // Text complete
        this.tCmp = true;
      }
    }
  }

  render(d = 16) {
    // Render dialog box with portrait and text (d=delta)
    this.updTxtAnim(d);

    // Clear graphics every frame
    this.gfx.clear();
    this.pGfx.clear();

    if (!this.cur) {
      // No dialog to show
      this.tObj.setVisible(false);
      return;
    }

    const { type, sprites } = this.cur;

    const sH = C.GH; // sH = screen height
    const sW = C.GW; // sW = screen width
    const bY = sH - this.bH + 10; // bY = box Y (at the top of the screen)
    const bW = sW - 20; // bW = box width
    const bX = 250; // bX = box X (hardcoded value)

    // Draw black background box
    this.gfx.fillStyle(P[0], 0.95);
    this.gfx.fillRect(bX, bY, bW, this.bH);

    // Draw white border
    this.gfx.lineStyle(4, P[6], 1);
    this.gfx.strokeRect(bX, bY, bW, this.bH);

    // Make sure text is visible
    this.tObj.setVisible(true);

    // Use displayed text (animated) instead of full text
    const dTxt = this.dTxt;

    if (type === 'PLAYER') {
      // Player dialog: portrait on right, text on left
      this.rndrLay(dTxt, sprites, 'right', bY, bX, sW);
    } else if (type === 'GUARD') {
      // Guard dialog: portrait on left, text on right
      this.rndrLay(dTxt, sprites, 'left', bY, bX, sW);
    } else if (type === 'UNISON') {
      // Unison dialog: both portraits on right, text on left
      this.rndrLay(dTxt, sprites, 'right-dual', bY, bX, sW);
    }
  }

  rndrLay(txt, spr, lay, bY, bX, sW) {
    // Render dialog with portrait layout (txt=text, spr=sprites, lay=layout, bY=box Y, bX=box X, sW=screen width)
    const bW = sW - 20; // bW = box width
    const nS = spr.filter(s => s).length; // nS = num sprites

    if (lay === 'right') {
      // Portrait on right, text on left
      const pX = bX + bW - this.pS - this.pP; // pX = portrait X
      const pY = bY + this.bP; // pY = portrait Y
      this.rndrPort(spr[0], pX, pY);
      const tX = bX + this.bP + 4; // tX = text X
      const tY = bY + this.bP + 2; // tY = text Y
      const tW = bW - this.pS - this.bP * 3 - this.pP - 8; // tW = text width
      this.tObj.setWordWrapWidth(tW);
      this.tObj.setPosition(tX, tY);
      this.tObj.setText(txt);
    } else if (lay === 'left') {
      // Portrait on left, text on right
      const pX = bX + this.bP + this.pP; // pX = portrait X
      const pY = bY + this.bP; // pY = portrait Y
      this.rndrPort(spr[0], pX, pY);
      const tX = bX + this.pS + this.bP * 2 + this.pP + 4; // tX = text X
      const tY = bY + this.bP + 2; // tY = text Y
      const tW = bW - this.pS - this.bP * 3 - this.pP - 8; // tW = text width
      this.tObj.setWordWrapWidth(tW);
      this.tObj.setPosition(tX, tY);
      this.tObj.setText(txt);
    } else if (lay === 'right-dual') {
      // Two portraits on right, text on left
      if (nS === 1) {
        // Only one sprite, render as single portrait
        this.rndrLay(txt, spr, 'right', bY, bX, sW);
      } else {
        // Two portraits side by side
        const pX1 = bX + bW - this.pS * 2 - this.pP * 2 - 4; // pX1 = portrait 1 X
        const pX2 = bX + bW - this.pS - this.pP; // pX2 = portrait 2 X
        const pY = bY + this.bP; // pY = portrait Y
        this.rndrPort(spr[0], pX1, pY);
        this.rndrPort(spr[1], pX2, pY);
        const tX = bX + this.bP + 4; // tX = text X
        const tY = bY + this.bP + 2; // tY = text Y
        const tW = bW - this.pS * 2 - this.bP * 3 - this.pP * 2 - 12; // tW = text width
        this.tObj.setWordWrapWidth(tW);
        this.tObj.setPosition(tX, tY);
        this.tObj.setText(txt);
      }
    }
  }

  rndrPort(spr, x, y) {
    // Render portrait sprite (spr=sprite, x=X position, y=Y position)
    if (!spr) return;

    // Parse and render the sprite
    const sData = spr; // sData = sprite data
    if (!sData || sData.length === 0) return;

    const sH = sData.length; // sH = sprite height
    const sW = sData[0] ? sData[0].length : 0; // sW = sprite width

    // Scale factor to fit portrait in box (sc=scale)
    const sc = Math.min(this.pS / sW, this.pS / sH);

    // Draw pixel by pixel with scaling
    for (let r = 0; r < sH; r++) {
      for (let c = 0; c < sData[r].length; c++) {
        const ch = sData[r][c]; // ch = character
        const col = COLOR_MAP[ch]; // col = color

        if (col !== null && col !== undefined) {
          this.pGfx.fillStyle(col, 1);
          this.pGfx.fillRect(
            Math.floor(x + c * sc),
            Math.floor(y + r * sc),
            Math.ceil(sc),
            Math.ceil(sc)
          );
        }
      }
    }

    // Draw border around portrait
    this.pGfx.lineStyle(1, P[6], 0.5);
    this.pGfx.strokeRect(x - 1, y - 1, this.pS + 2, this.pS + 2);
  }

  update() {
    // Future: handle text animation, input to advance dialog, etc.
  }
}

// =============================================================================
// CINEMATIC CONTROLLER
// =============================================================================
class CinematicController {
  constructor(s) {
    this.s = s;
    this.a = false;
    this.step = 0;
    this.p = 0;
    this.t = 5;
  }

  start() {
    this.a = true;
    this.step = 0;
    const S = this.s;
    const p1 = S.is1P; // Changed from is1PlayerMode to is1P
    const ps = S.players.map(p => p.spr.F); // Changed from sprites to spr
    const dt = p1 ? 'PLAYER' : 'UNISON'; // dt = dialog type

    // Walk in
    S.players.forEach((p, i) => {
      p.col = C.BAC + 3 + i;
      p.x = p.colToX(p.col);
      p.targetX = p.x;
      p.animState = 'F';
      S.tweens.add({
        targets: p,
        col: p1 ? 9 : [9, 10.5][i],
        duration: 2000,
        ease: 'Linear',
        onUpdate: t => {
          p.x = p.colToX(p.col);
          p.targetX = p.x;
          p.y = p.rowToY(p.row) + Math.sin(t.progress * Math.PI * 8) * 2;
        },
        onComplete: () => {
          p.y = p.rowToY(p.row);
          p.targetY = p.y;
          p.animState = 'F';
        }
      });
    });

    // Dialog sequence
    S.time.delayedCall(2000, () => S.dialog.show(dt, p1 ? `Hola, vengo para la ${ph} 🍌` : `Hola, venimos para la ${ph} 🍌`, ps));
    S.time.delayedCall(5500, () => S.dialog.show('GUARD', 'Lo siento, han llegado tarde, ya hemos cerrado las puertas', [GUARD_SPRITES.F]));
    S.time.delayedCall(10000, () => S.dialog.show(dt, p1 ? 'Qué? No puedo perderme la hackathon!' : 'Qué? No podemos perdernos la hackathon', ps));
    S.time.delayedCall(13000, () => {
      S.dialog.hide();
      this.climb();
    });
  }

  climb() {
    this.p = 0;
    for (let i = 0; i < this.t; i++) {
      this.s.time.delayedCall(i * 300, () => {
        this.s.players.forEach(p => {
          if (p.row < this.t) {
            p.row++;
            p.targetY = p.rowToY(p.row);
            p.animState = i % 2 ? 'LUP1' : 'R1';
          }
        });
        if (++this.p >= this.t) {
          this.s.time.delayedCall(500, () => {
            this.s.dialog.show('GUARD', this.s.is1P ? 'A dónde vas, no puedes trepar el edificio!' : 'A dónde van, no pueden trepar el edificio!', this.s.is1P ? [GUARD_SPRITES.F] : [GUARD_SPRITES.F, GUARD_SPRITES.F]); // Changed from is1PlayerMode to is1P
            this.s.time.delayedCall(2000, () => {
              this.s.dialog.hide();
              this.a = false;
              this.s.state = STATES.PLAYING; // Changed from gameState to state
              this.s.gameStartTime = this.s.time.now;
              this.s.players.forEach(p => {
                p.animState = 'I';
                p.animIndex = 0;
              });
            });
          });
        }
      });
    }
  }
}


// =============================================================================
// DYNAMIC BACKGROUND UTILITY (Reusable across scenes)
// =============================================================================
class DynamicBackground {
  constructor(scene, wo = true) {
    this.s = scene; // s = scene reference
    this.clds = []; // clds = clouds array
    this.blds = []; // blds = buildings array
    this.obs = []; // obs = obstacles array
    this.obsT = 0; // obsT = obstacle timer
    this.wo = wo; // wo = with obstacles flag

    // Create graphics layers (gfx = graphics)
    this.bg = scene.add.graphics().setDepth(-2); // bg = background mountains
    this.grGfx = scene.add.graphics().setDepth(-1.2); // grGfx = grass graphics
    this.fBGfx = scene.add.graphics().setDepth(-1.1); // fBGfx = far buildings graphics
    this.mBGfx = scene.add.graphics().setDepth(-1); // mBGfx = mid buildings graphics
    this.nBGfx = scene.add.graphics().setDepth(-.9); // nBGfx = near buildings graphics
    this.clGfx = scene.add.graphics().setDepth(-0.8); // clGfx = clouds graphics (above buildings)

    // Initialize
    this.drwMts(); // drwMts = draw mountains (Los Andes)
    this.genBlds(); // genBlds = generate buildings (Santiago skyline)
    this.genClds(); // genClds = generate clouds (cloudy Santiago)
  }

  drwMts() {
    // Draw Los Andes mountains in background - majestic snow-capped peaks
    this.bg.clear();
    const bY = C.GH - 40; // bY = base Y (horizon line)

    // Draw distant mountain range with multiple peaks (Los Andes style)
    const peaks = 12; // More peaks for realistic mountain range
    for (let i = 0; i < peaks; i++) {
      const pX = (i / (peaks - 1)) * (C.GW + 200) - 100; // pX = peak X (extend beyond screen)
      const pY = Phaser.Math.Between(bY - 120, bY - 80); // pY = peak Y (taller mountains)
      const l = pX - Phaser.Math.Between(60, 100); // l = left base
      const r = pX + Phaser.Math.Between(60, 100); // r = right base

      // Main mountain body (dark blue-gray)
      this.bg.fillStyle(P[4], 0.85);
      this.bg.fillTriangle(l, bY, pX, pY, r, bY);

      // Snow caps (white/light gray)
      const snowH = Phaser.Math.Between(15, 25); // snowH = snow height
      this.bg.fillStyle(P[6], 0.95);
      this.bg.fillTriangle(pX - 20, pY + snowH, pX, pY, pX + 20, pY + snowH);

      // Add highlights to snow for depth
      this.bg.fillStyle(P[7], 0.3);
      this.bg.fillTriangle(pX - 8, pY + snowH / 2, pX, pY, pX + 8, pY + snowH / 2);
    }

    // Add atmospheric haze at mountain base
    this.bg.fillStyle(P[5], 0.3);
    this.bg.fillRect(0, bY - 40, C.GW, 40);
  }

  genBlds() {
    // Generate Santiago skyline - mix of modern high-rises and medium buildings
    this.blds = [];
    const lyrs = [ // lyrs = layers [color, depth, baseY, count, minW, maxW, minH, maxH, hasWindows]
      [P[5], 1, C.GH, 15, 30, 45, 80, 140, true],   // Far layer - tall buildings
      [P[4], 2, C.GH, 18, 25, 40, 60, 120, true],   // Mid layer - varied heights
      [P[3], 3, C.GH, 20, 20, 35, 40, 100, true]    // Near layer - more detail
    ];

    lyrs.forEach(lyr => {
      let x = -50;
      for (let i = 0; i < lyr[3]; i++) {
        const w = Phaser.Math.Between(lyr[4], lyr[5]); // w = width
        const h = Phaser.Math.Between(lyr[6], lyr[7]); // h = height
        const hasAntenna = Math.random() < 0.3; // 30% chance of antenna
        const roofType = Math.floor(Math.random() * 3); // 0=flat, 1=peaked, 2=stepped

        this.blds.push({
          x,
          w,
          h,
          col: lyr[0], // col = color
          d: lyr[1], // d = depth
          bY: lyr[2], // bY = base Y
          ant: hasAntenna, // ant = has antenna
          rType: roofType, // rType = roof type
          hasWin: lyr[8] // hasWin = has windows
        });
        x += w + Phaser.Math.Between(2, 8);
      }
    });

    this.drwBlds(); // drwBlds = draw buildings
  }

  drwBlds() {
    // Draw all buildings to their respective depth layers with details
    this.grGfx.clear();
    this.fBGfx.clear();
    this.mBGfx.clear();
    this.nBGfx.clear();

    // Draw grass/ground
    this.grGfx.fillStyle(P[16], 1);
    this.grGfx.fillRect(0, C.GH - 45, C.GW, 45);

    // Draw buildings by depth with windows and details
    this.blds.forEach(b => {
      const gfx = b.d === 3 ? this.fBGfx : b.d === 2 ? this.mBGfx : this.nBGfx;
      const alp = b.d === 3 ? 0.7 : b.d === 2 ? 0.8 : 0.9; // alp = alpha

      // Building body
      gfx.fillStyle(b.col, alp);
      gfx.fillRect(b.x, b.bY - b.h, b.w, b.h);

      // Add windows (if has windows)
      if (b.hasWin) {
        const winSize = b.d === 3 ? 2 : b.d === 2 ? 3 : 4; // winSize = window size
        const winSpacing = b.d === 3 ? 4 : b.d === 2 ? 6 : 8; // winSpacing = window spacing
        const winCol = Math.random() < 0.7 ? P[73] : P[7]; // winCol = window color (mostly orange, some yellow)

        for (let wy = b.bY - b.h + 5; wy < b.bY - 5; wy += winSpacing) {
          for (let wx = b.x + 3; wx < b.x + b.w - 3; wx += winSpacing) {
            if (Math.random() < 0.8) { // 80% windows lit
              gfx.fillStyle(winCol, 0.6);
              gfx.fillRect(wx, wy, winSize, winSize);
            }
          }
        }
      }

      // Building outline
      gfx.lineStyle(1, P[0], 0.2);
      gfx.strokeRect(b.x, b.bY - b.h, b.w, b.h);

      // Roof details
      if (b.rType === 1) { // Peaked roof
        gfx.fillStyle(b.col, alp * 0.8);
        gfx.fillTriangle(b.x, b.bY - b.h, b.x + b.w / 2, b.bY - b.h - 5, b.x + b.w, b.bY - b.h);
      } else if (b.rType === 2) { // Stepped roof
        gfx.fillStyle(b.col, alp * 0.9);
        gfx.fillRect(b.x + b.w * 0.2, b.bY - b.h - 3, b.w * 0.6, 3);
      }

      // Antenna (if has antenna)
      if (b.ant) {
        gfx.lineStyle(1, P[0], 0.5);
        gfx.lineBetween(b.x + b.w / 2, b.bY - b.h - (b.rType === 1 ? 5 : 0), b.x + b.w / 2, b.bY - b.h - 15);
        // Antenna light
        gfx.fillStyle(P[53], 0.8);
        gfx.fillCircle(b.x + b.w / 2, b.bY - b.h - 15, 2);
      }
    });
  }

  genClds() {
    // Generate fluffy clouds - Santiago can be very cloudy!
    const cnt = 12; // cnt = cloud count (more clouds for Santiago)
    for (let i = 0; i < cnt; i++) {
      this.clds.push({
        x: Phaser.Math.Between(0, C.GW),
        y: Phaser.Math.Between(10, 150), // Higher altitude range
        w: Phaser.Math.Between(40, 80), // w = width (larger clouds)
        h: Phaser.Math.Between(15, 30), // h = height (fluffier)
        spd: Phaser.Math.FloatBetween(3, 8), // spd = speed (slower, more realistic)
        dens: Math.random() // dens = density (for varied opacity)
      });
    }
  }

  updClds(d) {
    // Update and draw clouds (d = delta)
    this.clGfx.clear();
    this.clds.forEach(c => {
      c.x += (c.spd * d) / 1000;
      if (c.x - c.w > C.GW) {
        c.x = -c.w;
        c.y = Phaser.Math.Between(10, 150);
        c.spd = Phaser.Math.FloatBetween(3, 8);
        c.dens = Math.random();
      }

      // Draw cloud with multiple overlapping puffs for fluffy look
      const baseAlp = 0.5 + c.dens * 0.4; // baseAlp = base alpha (0.5-0.9)

      // Main cloud body
      this.clGfx.fillStyle(P[6], baseAlp);
      this.clGfx.fillEllipse(c.x, c.y, c.w, c.h);

      // Additional puffs for volume
      this.clGfx.fillEllipse(c.x + c.w * 0.25, c.y - c.h * 0.2, c.w * 0.7, c.h * 0.9);
      this.clGfx.fillEllipse(c.x - c.w * 0.25, c.y + c.h * 0.1, c.w * 0.6, c.h * 0.8);
      this.clGfx.fillEllipse(c.x + c.w * 0.4, c.y + c.h * 0.15, c.w * 0.55, c.h * 0.75);

      // Highlight on top for depth
      this.clGfx.fillStyle(P[6], baseAlp * 0.6);
      this.clGfx.fillEllipse(c.x - c.w * 0.15, c.y - c.h * 0.3, c.w * 0.5, c.h * 0.5);
    });
  }

  spwnObs() {
    // Spawn obstacle at random X position (spwnObs = spawn obstacle)
    const emj = OBS[Math.floor(Math.random() * OBS.length)]; // emj = emoji
    const spX = Phaser.Math.Between(40, C.GW - 40); // spX = spawn X
    const o = new Obstacle(this.s, spX, -50, emj); // o = obstacle
    this.obs.push(o);
  }

  update(d, camY = C.GH / 2) {
    // Update clouds, apply parallax scrolling, spawn/update obstacles (d = delta, camY = camera Y)
    this.updClds(d);

    // Apply parallax scrolling to background layers
    // Each layer moves at different speed based on depth (slower = farther)
    const bCamY = C.GH / 2; // bCamY = base camera Y (initial position)
    const cDelta = camY - bCamY; // cDelta = camera delta (how much camera moved)

    // Set Y offset for each layer with different parallax factors
    this.bg.setY(-cDelta * 0.05); // Mountains slowest (0.05x)
    this.fBGfx.setY(-cDelta * 0.15); // Far buildings (0.15x)
    this.mBGfx.setY(-cDelta * 0.3); // Mid buildings (0.3x)
    this.nBGfx.setY(-cDelta * 0.5); // Near buildings (0.5x)
    this.grGfx.setY(-cDelta * 0.7); // Grass (0.7x)
    this.clGfx.setY(-cDelta * 0.1); // Clouds (0.1x)

    // Handle obstacle spawning
    this.obsT += d;
    if (this.obsT >= C.OSI) {
      this.obsT = 0;
      if (this.wo !== false) this.spwnObs();
    }

    // Update and clean up obstacles
    this.obs = this.obs.filter(o => o.active);
    this.obs.forEach(o => o.update(d));
  }

  destroy() {
    // Clean up all graphics and obstacles
    this.bg.destroy();
    this.grGfx.destroy();
    this.fBGfx.destroy();
    this.mBGfx.destroy();
    this.nBGfx.destroy();
    this.clGfx.destroy();
    this.obs.forEach(o => o.destroy());
  }
}

// =============================================================================
// MENU SCENE
// =============================================================================
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.SKY);
    this.cameras.main.setZoom(C.S);
    this.cameras.main.centerOn(C.GW / 2, C.GH / 2);

    // Use reusable background
    this.background = new DynamicBackground(this);

    this.cameraTargetY = C.GH / 2;

    // Add transparent black overlay for better contrast
    this.overlay = this.add.graphics();
    this.overlay.fillStyle(P[0], 0.2); // 50% transparent black
    this.overlay.fillRect(0, 0, C.GW, C.GH);
    this.overlay.setDepth(0); // Above background, below UI


    // Create animated graphics layer for visual effects
    this.gfx = this.add.graphics().setDepth(8).setScrollFactor(0);

    this.titleText = this.add.text(
      400,
      260,
      'LLEGAMOS TARDE\nA LA HACKATHON',
      {
        font: "bold 24px arial",
        color: '#000',
        backgroundColor: '#f7bb1b',
        padding: { left: 100, right: 100, top: 5, bottom: 5 },
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(9).setScrollFactor(0);

    // Add decorative corner brackets around title
    this.cornerGfx = this.add.graphics().setDepth(9.5).setScrollFactor(0);

    // Subtitle with glowing effect
    this.subtitleText = this.add.text(
      400,
      315,
      `🍌🇨🇱 ${ph} Edition 🇨🇱🍌`,
      {
        fontFamily: 'arial',
        fontSize: 16,
        color: '#000',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(9).setScrollFactor(0);

    // Animated prompt with icon
    this.promptText = this.add.text(
      400,
      375,
      '▶ Presiona cualquier botón ◀',
      {
        fontSize: 14,
        color: '#000',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(9).setScrollFactor(0);

    this.setupInput();
    this.promptTimer = 0;
  }

  setupInput() {
    this.transitioning = false;
    this.input.keyboard.on('keydown', (event) => {
      if (this.transitioning) return;
      const key = KBD_TO_ARC[event.key] || event.key;
      if (key) this.goToNextScene();
    });

    this.input.on('pointerdown', () => {
      if (!this.transitioning) this.goToNextScene();
    });
  }

  goToNextScene() {
    this.transitioning = true;
    SND.transition(); // Play transition sound

    // Flash effect on transition
    this.gfx.clear();
    this.gfx.fillStyle(P[6], 0.5);
    this.gfx.fillRect(0, 0, C.GW, C.GH);

    this.time.delayedCall(200, () => {
      this.scene.start('CharacterSelection');
    });
  }

  update(time, delta) {
    // Update timers
    this.promptTimer += delta;

    // Pulsing prompt text
    const pulse = 0.7 + Math.sin(this.promptTimer / 300) * 0.3;
    this.promptText.setAlpha(pulse);

    // Animated decorative corners around title
    this.cornerGfx.clear();
    const cSize = 12 + Math.sin(this.promptTimer / 200) * 2; // cSize = corner size (animated)
    const tB = this.titleText.getBounds(); // tBounds = title bounds
    const pad = 8; // Padding from title

    // Draw corner brackets with animation
    this.cornerGfx.lineStyle(2, 0xf7bb1b, 1);
    // Top-left
    this.cornerGfx.lineBetween(tB.left - pad, tB.top - pad, tB.left - pad - cSize, tB.top - pad);
    this.cornerGfx.lineBetween(tB.left - pad, tB.top - pad, tB.left - pad, tB.top - pad - cSize);
    // Top-right
    this.cornerGfx.lineBetween(tB.right + pad, tB.top - pad, tB.right + pad + cSize, tB.top - pad);
    this.cornerGfx.lineBetween(tB.right + pad, tB.top - pad, tB.right + pad, tB.top - pad - cSize);
    // Bottom-left
    this.cornerGfx.lineBetween(tB.left - pad, tB.bottom + pad, tB.left - pad - cSize, tB.bottom + pad);
    this.cornerGfx.lineBetween(tB.left - pad, tB.bottom + pad, tB.left - pad, tB.bottom + pad + cSize);
    // Bottom-right
    this.cornerGfx.lineBetween(tB.right + pad, tB.bottom + pad, tB.right + pad + cSize, tB.bottom + pad);
    this.cornerGfx.lineBetween(tB.right + pad, tB.bottom + pad, tB.right + pad, tB.bottom + pad + cSize);

    // Draw glowing boxes around subtitle
    this.gfx.clear();
    const glowAlpha = 0.1 + Math.sin(this.promptTimer / 400) * 0.05;
    this.gfx.lineStyle(1, 0xf7bb1b, glowAlpha);
    for (let i = 0; i < 3; i++) {
      const offset = i * 4;
      this.gfx.strokeRect(
        this.subtitleText.x - this.subtitleText.width / 2 - offset,
        this.subtitleText.y - this.subtitleText.height / 2 - offset,
        this.subtitleText.width + offset * 2,
        this.subtitleText.height + offset * 2
      );
    }

    // Update background
    this.background.update(delta);
  }
}

// =============================================================================
// CHARACTER SELECTION SCENE
// =============================================================================
class CharacterSelectionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelection' });
  }

  create() {
    // Camera setup - scale to display resolution
    this.cameras.main.setBackgroundColor(COLORS.SKY);
    this.cameras.main.setZoom(C.S);
    this.trans = false; // transitioning?

    // Center camera on the game world
    this.cameras.main.centerOn(C.GW / 2, C.GH / 2);

    // Use reusable background
    this.background = new DynamicBackground(this, false);

    // Add transparent black overlay for better contrast
    this.overlay = this.add.graphics();
    this.overlay.fillStyle(P[0], 0.5); // 50% transparent black
    this.overlay.fillRect(0, 0, C.GW, C.GH);
    this.overlay.setDepth(0); // Above background, below UI

    // Player selection state (pSel=player selections)
    this.pSel = [
      { join: true, selIdx: 0, confirm: false, c: null },  // P1
      { join: false, selIdx: 3, confirm: false, c: null }  // P2 c = character
    ];

    // Input state with debouncing (inp=input state)
    this.inp = {
      p1: { u: false, d: false, l: false, r: false, any: false, act: false },
      p2: { u: false, d: false, l: false, r: false, any: false, act: false }
    };
    this.lMvT = [0, 0]; // lMvT = last move time
    this.lBtnT = [0, 0]; // lBtnT = last button time

    // Transition state (isTrans=is transitioning)
    this.isTrans = false;

    // Graphics
    this.gr = this.add.graphics();
    this.p1Gfx = this.add.graphics(); // p1Gfx = player 1 graphics
    this.p2Gfx = this.add.graphics(); // p2Gfx = player 2 graphics

    // Create text objects once (reuse them)
    this.crTxtObjs();

    // Setup keyboard input using arcade mapping
    this.stpInp();
  }

  stpInp() {
    // Setup input handlers (stpInp=setup input)
    this.input.keyboard.on('keydown', (e) => {
      const k = KBD_TO_ARC[e.key] || e.key; // k = key
      this.hdlInp(k, true);
    });

    this.input.keyboard.on('keyup', (e) => {
      const k = KBD_TO_ARC[e.key] || e.key;
      this.hdlInp(k, false);
    });
  }

  crTxtObjs() {
    // Create text objects (crTxtObjs=create text objects)
    // Slot indicator texts (8 slots) (slTxts=slot texts)
    this.slTxts = [];
    for (let i = 0; i < 8; i++) {
      this.slTxts.push({
        p1: this.add.text(0, 0, 'P1', { fontSize: '8px' }).setVisible(false),
        p2: this.add.text(0, 0, 'P2', { fontSize: '8px' }).setVisible(false)
      });
    }

    // Player preview texts (ttl=title, jn=join, nm=name, cnf=confirmed)
    this.p1Ttl = this.add.text(0, 0, 'Hacker 1', { fontSize: '12px', color: '#00f' });
    this.p2Ttl = this.add.text(0, 0, 'Hacker 2', { fontSize: '12px', color: '#f00' });
    this.p2Jn = this.add.text(0, 0, 'Press\nSTART\nto join', { fontSize: '10px', color: '#000', align: 'center' }).setVisible(false);
    this.p1Nm = this.add.text(0, 0, '', { fontSize: '10px', backgroundColor: '#000', padding: 3 }).setOrigin(.5, .5);
    this.p2Nm = this.add.text(0, 0, '', { fontSize: '10px', backgroundColor: '#000', padding: 3 }).setOrigin(.5, .5);

    const z = '#409740ff';
    this.p1Cnf = this.add.text(0, 0, '✓READY', { fontSize: '12px', color: '#000', backgroundColor: z }).setOrigin(.5, .5).setVisible(false);
    this.p2Cnf = this.add.text(0, 0, '✓READY', { fontSize: '12px', color: '#000', backgroundColor: z }).setOrigin(.5, .5).setVisible(false);
  }

  hdlInp(k, dn) {
    // Handle input (hdlInp=handle input, k=key, dn=is down)
    // Hacker 1 directional controls
    if (k === 'P1U') this.inp.p1.u = dn;
    else if (k === 'P1D') this.inp.p1.d = dn;
    else if (k === 'P1L') this.inp.p1.l = dn;
    else if (k === 'P1R') this.inp.p1.r = dn;

    const a1 = k.includes('1'); // a1 = any player 1 button
    const a2 = k.includes('2'); // a2 = any player 2 button

    // Hacker 1 action buttons (any button except joystick for ready confirmation)
    if (dn && a1 && !['P1U', 'P1D', 'P1L', 'P1R'].includes(k)) {
      this.inp.p1.act = true;
    }

    // Hacker 1 any button (including joystick for joining - though P1 auto-joins)
    if (a1) {
      this.inp.p1.any = dn;
    }

    // Hacker 2 directional controls
    if (k === 'P2U') this.inp.p2.u = dn;
    else if (k === 'P2D') this.inp.p2.d = dn;
    else if (k === 'P2L') this.inp.p2.l = dn;
    else if (k === 'P2R') this.inp.p2.r = dn;

    // Hacker 2 action buttons (any button except joystick for ready confirmation)
    if (dn && a2 && !['P2U', 'P2D', 'P2L', 'P2R'].includes(k)) {
      this.inp.p2.act = true;
    }

    // Hacker 2 any button (including joystick for joining)
    if (a2) {
      this.inp.p2.any = dn;
    }
  }

  update(t, d) {
    // Update scene (t=time, d=delta)
    // Don't process any input if transitioning to next scene
    if (this.isTrans) {
      this.background.update(d);
      this.rndrUI();
      return;
    }

    // Handle selector movement and confirmation
    for (let i = 0; i < 2; i++) {
      const sel = this.pSel[i]; // sel = selection
      const inp = i === 0 ? this.inp.p1 : this.inp.p2;

      if (!sel.join) continue;

      // Movement (with better debouncing using time)
      if (!sel.confirm && (t - this.lMvT[i]) >= 150) {
        const c = sel.selIdx % 4; // c = column
        const r = Math.floor(sel.selIdx / 4); // r = row
        let mv = false; // mv = moved

        if (inp.u && r > 0) { sel.selIdx -= 4; mv = true; }
        else if (inp.d && r < 1) { sel.selIdx += 4; mv = true; }
        else if (inp.l && c > 0) { sel.selIdx -= 1; mv = true; }
        else if (inp.r && c < 3) { sel.selIdx += 1; mv = true; }

        if (mv) {
          this.lMvT[i] = t;
          SND.select(); // Play selection change sound
        }
      }

      // Confirmation toggle (with better debouncing using time)
      if (inp.act && (t - this.lBtnT[i]) >= 250) {
        sel.confirm = !sel.confirm;
        sel.c = sel.confirm ? CHARACTERS[sel.selIdx] : null;
        inp.act = false;
        this.lBtnT[i] = t;
        SND.confirm(); // Play confirm sound
      }
    }

    // Handle P2 join (any button including joystick)
    if (!this.pSel[1].join && this.inp.p2.any) {
      this.pSel[1].join = true;
      this.inp.p2.any = false;
      this.inp.p2.act = false; // Also clear action button to prevent immediate confirmation
      this.lBtnT[1] = t;
      SND.select(); // Play join sound
    }

    // Check if ready to start (all joined players must confirm) (jPs=joined players, allCnf=all confirmed)
    const jPs = this.pSel.filter(p => p.join);
    const allCnf = jPs.every(p => p.confirm);

    if (jPs.length > 0 && allCnf && !this.isTrans) {
      this.isTrans = true;
      SND.transition(); // Play transition sound

      // Wait 1 second before transition
      this.time.delayedCall(1000, () => {
        this.scene.start('GameScene', {
          p1Character: this.pSel[0].c,
          p2Character: this.pSel[1].join ? this.pSel[1].c : null
        });
      });
    }

    // Update background
    this.background.update(d);

    // Render only once per frame
    this.rndrUI();
  }

  rndrUI() {
    // Render UI (rndrUI=render UI)
    this.gr.clear();
    this.p1Gfx.clear();
    this.p2Gfx.clear();

    // Hide all slot texts first
    this.slTxts.forEach(sl => {
      sl.p1.setVisible(false);
      sl.p2.setVisible(false);
    });

    // Draw character slots grid
    this.drwGrid();

    // Draw player previews
    this.drwPvw(0, 11, 20);
    this.drwPvw(1, C.GW - 83, 20);
  }

  drwGrid() {
    // Draw character grid (drwGrid=draw grid, sz=slot size, gp=gap, gW=grid width, sX/sY=start X/Y, b=blue, r=red)
    const sz = 30, gp = 5;
    const gW = 4 * (sz + gp) - gp;
    const sX = (C.GW - gW) / 2;
    const sY = C.GH - 105;
    const b = 0x0000ff, r = 0xff0000;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const idx = row * 4 + col;
        const x = sX + col * (sz + gp);
        const y = sY + row * (sz + gp);

        const p1H = this.pSel[0].join && this.pSel[0].selIdx === idx; // p1H = p1 hover
        const p2H = this.pSel[1].join && this.pSel[1].selIdx === idx; // p2H = p2 hover

        // Background
        this.gr.fillStyle(idx < CHARACTERS.length ? 0x333333 : P[0], 1);
        this.gr.fillRect(x, y, sz, sz);

        // Border
        if (p1H && p2H) {
          // Left half blue border
          this.gr.fillStyle(b, 1);
          this.gr.fillRect(x, y, sz / 2, 2); // top
          this.gr.fillRect(x, y, 2, sz); // left
          this.gr.fillRect(x, y + sz - 2, sz / 2, 2); // bottom

          // Right half red border
          this.gr.fillStyle(r, 1);
          this.gr.fillRect(x + sz / 2, y, sz / 2, 2); // top
          this.gr.fillRect(x + sz - 2, y, 2, sz); // right
          this.gr.fillRect(x + sz / 2, y + sz - 2, sz / 2, 2); // bottom
        } else if (p1H) {
          this.gr.lineStyle(2, b, 1);
          this.gr.strokeRect(x, y, sz, sz);
        } else if (p2H) {
          this.gr.lineStyle(2, r, 1);
          this.gr.strokeRect(x, y, sz, sz);
        } else {
          this.gr.lineStyle(1, 0x555555, 1);
          this.gr.strokeRect(x, y, sz, sz);
        }

        // Draw character (top half)
        if (idx < CHARACTERS.length) {
          this.drwSl(CHARACTERS[idx], x - 15, y - 4, sz);
        }

        // P1/P2 indicators (only show when hovering)
        if (p1H) {
          this.gr.fillStyle(b, 1);
          this.gr.fillRect(x + 1, y + 1, 10, 8);
          this.slTxts[idx].p1.setPosition(x + 2, y + 1).setVisible(true);
        }
        if (p2H) {
          this.gr.fillStyle(r, 1);
          this.gr.fillRect(x + sz - 11, y + 1, 10, 8);
          this.slTxts[idx].p2.setPosition(x + sz - 10, y + 1).setVisible(true);
        }
      }
    }
  }

  drwSl(chr, x, y, sz) {
    // Draw character slot (drwSl=draw slot, chr=character, sz=size, spr=sprite, hH=half height, sc=scale)
    const spr = chr.sprites.F;
    if (!spr || spr.length === 0) return;

    const hH = Math.floor(spr.length / 2);
    const sc = (sz * 1.8) / spr[0].length;

    for (let r = 0; r < hH; r++) {
      for (let c = 0; c < spr[0].length; c++) {
        const cd = spr[r][c]; // cd = code
        if (cd && cd !== '.') {
          const col = COLOR_MAP[cd]; // col = color
          if (col !== null && col !== undefined) {
            this.gr.fillStyle(col, 1);
            this.gr.fillRect(x + c * sc + sz * 0.1, y + r * sc + sz * 0.2, sc, sc);
          }
        }
      }
    }
  }

  drwPvw(pIdx, x, y) {
    // Draw player preview (drwPvw=draw preview, pIdx=player index, sel=selection, g=graphics)
    const sel = this.pSel[pIdx];
    const g = pIdx === 0 ? this.p1Gfx : this.p2Gfx;

    // Update title text position (ttl=title text)
    const ttl = pIdx === 0 ? this.p1Ttl : this.p2Ttl;
    ttl.setPosition(x + 5, y);

    // Show/hide join text
    const jnTxt = this.p2Jn; // jnTxt = join text
    if (!sel.join) {
      jnTxt.setPosition(x + 13, y + 55).setVisible(true);

      // Hide other texts (nm=name, cnf=confirmed)
      const nm = pIdx === 0 ? this.p1Nm : this.p2Nm;
      const cnf = pIdx === 0 ? this.p1Cnf : this.p2Cnf;
      nm.setVisible(false);
      cnf.setVisible(false);
      return;
    }

    jnTxt.setVisible(false);

    // Preview sprite (chr=character, spr=sprite)
    const chr = CHARACTERS[sel.selIdx];
    const spr = chr.sprites.F;
    if (spr && spr.length > 0) {
      const tH = 90; // tH = target height
      const sc = tH / spr.length * 1.5; // sc = scale

      for (let r = 0; r < spr.length; r++) {
        for (let c = 0; c < spr[0].length; c++) {
          const cd = spr[r][c]; // cd = code
          if (cd && cd !== '.') {
            const col = COLOR_MAP[cd]; // col = color
            if (col !== null && col !== undefined) {
              g.fillStyle(col, 1);
              g.fillRect(x + c * sc - 35, y + 25 + r * sc, sc, sc);
            }
          }
        }
      }
    }

    // Update name text (nm=name text)
    const nm = pIdx === 0 ? this.p1Nm : this.p2Nm;
    nm.setText(chr.name).setPosition(x + 35, y + 175).setVisible(true);

    // Update confirmation status (cnf=confirmed text)
    const cnf = pIdx === 0 ? this.p1Cnf : this.p2Cnf;
    if (sel.confirm) {
      cnf.setPosition(x + 35, y + 195).setVisible(true);
    } else {
      cnf.setVisible(false);
    }
  }
}

// =============================================================================
// MAIN GAME SCENE
// =============================================================================
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    // sel = selected characters (p1, p2), is1P = is 1-player mode
    this.sel = { p1: data.p1Character || CHARACTERS[0], p2: data.p2Character };
    this.is1P = !this.sel.p2;
  }

  create() {
    // state = game state, bg = background, bGfx = building graphics, uiGfx = UI graphics
    this.state = STATES.CINEMATIC;
    this.cameras.main.setBackgroundColor(COLORS.SKY).setZoom(C.S);
    this.bg = new DynamicBackground(this, false);
    this.bGfx = this.add.graphics().setDepth(3);
    this.uiGfx = this.add.graphics().setDepth(100);
    this.dialog = new Dialog(this);
    this.cinematic = new CinematicController(this);
    // Create players array with P1, optionally add P2
    this.players = [new Player(this, 1, this.is1P ? 9.5 : 9, 0, this.sel.p1)];
    if (!this.is1P) this.players.push(new Player(this, 2, 10.5, 0, this.sel.p2));
    this.players.forEach(p => p.animState = 'F');
    this.guard = new Guard(this, 3.5, 0);
    this.guard.animState = 'F';
    // obs = obstacles, obsSpawnT = obstacle spawn timer, obsPause = obstacles paused, obsRounds = obstacle spawn round counter, nxtInt = next spawn interval
    this.obs = [];
    this.obsSpawnT = 0;
    this.obsPause = false;
    this.obsRounds = 0; // Track spawn rounds for giant ball spawning
    this.nxtInt = C.OSI; // Next spawn interval with variance
    this.pendObs = []; // Pending obstacles to spawn with delay (pendObs = pending obstacles)
    // camTY = camera target Y
    this.camTY = C.GH - (C.GH / 2);
    // inp = input state for both players
    this.inp = {
      p1: { up: false, down: false, left: false, right: false },
      p2: { up: false, down: false, left: false, right: false }
    };
    // Setup keyboard input handlers for keydown and keyup
    ['keydown', 'keyup'].forEach(e => this.input.keyboard.on(e, ev => this.handleInput(KBD_TO_ARC[ev.key] || ev.key, e === 'keydown')));
    // p1Txt/p2Txt = player lives text displays
    this.p1Txt = this.add.text(250, 190, '', { fontSize: 11, color: '#000' }).setScrollFactor(0).setDepth(100);
    this.p2Txt = this.add.text(250, 205, '', { fontSize: 11, color: '#000' }).setScrollFactor(0).setDepth(100).setVisible(!this.is1P);
    // signTxt = sign text for "Platanus Hack 25"
    this.signTxt = this.add.text(0, 0, 'PLATANUS HACK 25', { fontSize: 14, fontFamily: 'Arial', fontStyle: 'bold', color: '#000' }).setDepth(5).setOrigin(0.5);
    this.cameras.main.centerOn(C.GW / 2, this.camTY);
    this.cinematic.start();
  }

  handleInput(k, down) {
    // Map arcade controls to input state using lookup table (k=key, down=isDown)
    const m = { P1U: ['p1', 'up'], P1D: ['p1', 'down'], P1L: ['p1', 'left'], P1R: ['p1', 'right'], P2U: ['p2', 'up'], P2D: ['p2', 'down'], P2L: ['p2', 'left'], P2R: ['p2', 'right'] };
    if (m[k]) this.inp[m[k][0]][m[k][1]] = down;
  }

  checkWin() {
    // Check if players reached goal floor and trigger window entry animation
    this.players.forEach(p => {
      if (!p.isDd && !p.hasW && !p.isEntW && p.row >= C.GOAL) { // Changed isDead→isDd, hasWon→hasW, isEnteringWindow→isEntW
        p.isEntW = true;
        p.entWT = 0; // Changed enterWindowTimer→entWT
        p.animSt = 'F'; // Changed animState→animSt
      }
    });
    // Check end conditions: all resolved (won or dead), trigger appropriate cinematic
    const allRes = this.players.every(p => p.hasW || p.isDd); // Changed hasWon→hasW, isDead→isDd
    const won = this.players.some(p => p.hasW); // Changed hasWon→hasW
    const dead = this.players.every(p => p.isDd); // Changed isDead→isDd
    if (allRes && this.state === STATES.PLAYING) {
      won ? this.trigVict() : dead ? this.trigLoss() : null;
    }
  }

  trigLoss() {
    // Trigger loss state and show loss screen after delay
    this.state = STATES.GAME_OVER;
    SND.loss(); // Play loss music
    this.time.delayedCall(1500, () => this.showLossEnd());
  }

  trigVict() {
    // Trigger victory state: capture end time, make guard fall
    this.state = STATES.VICTORY;
    SND.victory(); // Play victory music
    this.endT = this.time.now; // endT = end time for scoring
    if (this.guard) {
      this.guard.isFl = true; // Changed isFalling→isFl
      this.guard.fVel = 0; // Changed fallVelocity→fVel
    }
    const w = this.players.filter(p => p.hasW); // Changed hasWon→hasW
    this.allWon = w.length === this.players.length;
    this.time.delayedCall(2000, () => this.victCine());
  }

  victCine() {
    // Victory cinematic: setup dialog sequence with coordinator speaking
    this.vdIdx = 0; // vdIdx = victory dialog index
    this.showEnd = false; // showEnd = showing end screen flag
    this.waitDlg = false; // waitDlg = waiting for dialog to complete
    const w = this.players.filter(p => p.hasW); // Changed hasWon→hasW
    const all = w.length === this.players.length;
    const nms = this.players.map(p => p.chr.name).join(' y '); // nms = names (Changed from character to chr)
    this.cGfx = this.add.graphics().setDepth(50); // cGfx = coordinator graphics
    // vdlgs = victory dialogs array - each function shows one dialog step
    this.vdlgs = [
      () => { this.drawCoor(); this.dialog.show('GUARD', 'Buenos días con todos', [GUARD_SPRITES.F]); this.waitDlg = true; },
      () => { this.drawCoor(); this.dialog.show('GUARD', `Antes de comenzar la ${ph}, vamos a pasar asistencia`, [GUARD_SPRITES.F]); this.waitDlg = true; },
      () => { this.drawCoor(); this.dialog.show('GUARD', `El equipo de ${nms} está presente?`, [GUARD_SPRITES.F]); this.waitDlg = true; },
      () => {
        this.cGfx.clear();
        all ? this.dialog.show('UNISON', 'Sí, estamos aquí!', this.players.map(p => p.spr.F)) : this.dialog.show('PLAYER', 'Disculpe... no estamos completos...', [w[0].spr.F]); // Changed sprites→spr
        this.waitDlg = true;
      },
      () => { this.dialog.hide(); this.cGfx.clear(); this.showVictEnd(); }
    ];
    // vInpH = victory input handler - allows skipping dialogs or returning to menu
    this.vInpH = () => {
      if (this.showEnd) this.toMenu();
      else if (this.vdIdx < this.vdlgs.length) {
        if (this.dlgAutoT) { this.dlgAutoT.remove(); this.dlgAutoT = null; } // dlgAutoT = dialog auto-advance timer
        this.waitDlg = false;
        this.advVictDlg();
      }
    };
    this.input.keyboard.off('keydown', this.vInpH);
    this.input.keyboard.on('keydown', this.vInpH);
    this.time.delayedCall(500, () => this.advVictDlg());
  }

  drawCoor() {
    // Draw coordinator sprite on left side of screen
    this.cGfx.clear();
    drawSprite(this.cGfx, GUARD_SPRITES.F, 40, C.GAME_HEIGHT - 80);
  }

  advVictDlg() {
    // Advance victory dialog to next step
    if (this.vdIdx < this.vdlgs.length) {
      this.vdlgs[this.vdIdx]();
      this.vdIdx++;
    }
  }

  showVictEnd() {
    // Show victory end screen with time and message (cw=canvas width, ch=canvas height, ts=time string)
    this.showEnd = true;
    const ms = (this.endT || this.time.now) - (this.gameStartTime || 0);
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const ts = `${m}:${(s % 60).toString().padStart(2, '0')}`;
    const cw = 800, ch = 600;
    // endGfx = end screen graphics, endMsgTxt = end message text, endTimeTxt = end time text, endPromptTxt = end prompt text
    this.endGfx = this.add.graphics().setDepth(150).setScrollFactor(0, 0);
    this.endGfx.fillStyle(P[0], 0.85).fillRect(0, 0, cw, ch);
    const msg = this.allWon ? `¡Felicidades!\nEstás dentro de la\n${ph}!` : 'Tu equipo no se pudo\npresentar a la hackathon';
    const col = this.allWon ? '#0f0' : '#f00';
    this.endMsgTxt = this.add.text(cw / 2, 250, msg, { fontFamily: 'Arial', fontSize: '24px', color: col, align: 'center' }).setOrigin(0.5).setDepth(151).setScrollFactor(0, 0);
    if (this.allWon) this.endTimeTxt = this.add.text(cw / 2, 320, `Tiempo: ${ts}`, { fontFamily: 'Arial', fontSize: '20px', color: '#fff' }).setOrigin(0.5).setDepth(151).setScrollFactor(0, 0);
    this.endPromptTxt = this.add.text(cw / 2, 350, pcb, { fontFamily: 'Arial', fontSize: '16px', color: '#aaa', align: 'center' }).setOrigin(0.5).setDepth(151).setScrollFactor(0, 0);
  }

  showLossEnd() {
    // Show loss end screen with message (lInpH = loss input handler)
    this.showEnd = true;
    const cw = 800, ch = 600;
    this.endGfx = this.add.graphics().setDepth(150).setScrollFactor(0, 0);
    this.endGfx.fillStyle(P[0], 0.85).fillRect(0, 0, cw, ch);
    this.endMsgTxt = this.add.text(cw / 2, 250, 'Tu equipo no se pudo\npresentar a la hackathon', { fontFamily: 'Arial', fontSize: '24px', color: '#f00', align: 'center' }).setOrigin(0.5).setDepth(151).setScrollFactor(0, 0);
    this.endPromptTxt = this.add.text(cw / 2, 350, pcb, { fontFamily: 'Arial', fontSize: '16px', color: '#aaa', align: 'center' }).setOrigin(0.5).setDepth(151).setScrollFactor(0, 0);
    this.lInpH = () => this.toMenu();
    this.input.keyboard.off('keydown', this.lInpH);
    this.input.keyboard.on('keydown', this.lInpH);
  }

  toMenu() {
    // Return to menu scene
    this.scene.start('MenuScene');
  }

  checkColl() {
    // Check all collision types: guard vs players, player vs player, falling objects vs players
    // Guard catching players
    if (this.guard) {
      this.players.forEach(p => {
        if (p.isCgt || p.isDd || p.isFl || p.isEntW) return; // Changed isCaught→isCgt, isDead→isDd, isFalling→isFl, isEnteringWindow→isEntW
        if (this.guard.checkCollision(p.getColliderBounds())) this.pCaught(p);
      });
    }
    // Player-player collision (2P mode only) - f0/f1 = is falling flags
    if (!this.is1P && this.players[0].chkPCol(this.players[1])) { // Changed checkPlayerCollision→chkPCol
      const f0 = this.players[0].isFl1R || this.players[0].isFl || this.players[0].isEntW; // Changed isFallingOneRow→isFl1R, isFalling→isFl, isEnteringWindow→isEntW
      const f1 = this.players[1].isFl1R || this.players[1].isFl || this.players[1].isEntW; // Changed isFallingOneRow→isFl1R, isFalling→isFl, isEnteringWindow→isEntW
      if (!f0 && !f1) this.resolvePCol(this.players[0], this.players[1]);
    }
    // Falling objects hitting players (o=obstacle, dp=dying player, fp=falling player)
    this.players.forEach(p => {
      if (p.isDd || p.isFl || p.isFl1R || p.isEntW) return; // Changed isDead→isDd, isFalling→isFl, isFallingOneRow→isFl1R, isEnteringWindow→isEntW
      this.obs.forEach(o => {
        if (o.active && p.checkCollision(o.getColliderBounds())) {
          this.objHit(p, `obstacle ${o.emoji}`);
          o.destroy();
        }
      });
      this.players.forEach(dp => {
        if (dp.isFl && dp !== p && !dp.isEntW && p.checkCollision(dp.getColliderBounds())) this.objHit(p, `dying Player ${dp.playerNum}`); // Changed isFalling→isFl, isEnteringWindow→isEntW
      });
      this.players.forEach(fp => {
        if (fp.isFl1R && fp !== p && !fp.isEntW && p.checkCollision(fp.getColliderBounds())) this.objHit(p, `falling Player ${fp.playerNum}`); // Changed isFallingOneRow→isFl1R, isEnteringWindow→isEntW
      });
    });
    this.obs = this.obs.filter(o => o.active);
  }

  pCaught(p) {
    // Handle player caught by guard: show dialog if conditions met, trigger game over if last player (oth=other players, won=someone won flag)
    this.obsPause = true;
    const oth = this.players.filter(pl => pl !== p && !pl.isCgt && !pl.isDd && !pl.hasW); // Changed isCaught→isCgt, isDead→isDd, hasWon→hasW
    const won = this.players.some(pl => pl.hasW); // Changed hasWon→hasW
    if (!this.is1P && oth.length === 1 && !won) {
      this.dialog.show('PLAYER', 'Continúa sin mí!!!', [p.spr.F]); // Changed sprites→spr
      p.die();
      this.time.delayedCall(2000, () => { this.dialog.hide(); this.obsPause = false; });
    } else if (oth.length > 0) {
      p.die();
      this.obsPause = false;
    } else {
      if (won) {
        p.die();
        this.obsPause = false;
      } else {
        this.state = STATES.GAME_OVER;
        this.dialog.show('PLAYER', 'Súeltame, suéltame', [p.spr.F]); // Changed sprites→spr
        p.isCgt = true; // Changed isCaught→isCgt
        p.lostAnimT = 0; // Changed lostAnimTimer→lostAnimT
        p.lostAnimSt = 'LUP0'; // Changed lostAnimState→lostAnimSt
        this.time.delayedCall(2500, () => { this.dialog.hide(); this.showLossEnd(); });
      }
    }
  }

  objHit(p) {
    // Handle when falling object hits player (calls player's takeDamage method)
    p.takeDmg(); // Changed takeDamage→takeDmg
  }

  spawnObs() {
    // Spawn obstacles with new mechanics (high=highest player, tgt=targets, topY=spawn Y, prog=progress)
    const alive = this.players.filter(p => !p.isDd && !p.isFl); // Changed isDead→isDd, isFalling→isFl
    if (!alive.length) return;
    const high = alive.reduce((h, p) => p.row > h.row ? p : h);
    if (high.row < C.OSR) return;

    const topY = this.camTY - (C.GH / 2) - 50;
    const prog = high.row / C.GOAL; // Progress through building (0-1)
    const obsToSpawn = []; // Array of {x, delay, speed} objects

    // Check for giant ball spawning at 50% and 80% progress
    const isGBRound = (this.obsRounds % (C.OSI * 8 / C.OSI) === 0); // Every 10 rounds
    const spawnGB50 = prog >= 0.5 && prog < 0.8 && isGBRound; // 50% checkpoint window
    const spawnGB80 = prog >= 0.8 && prog < 1 && isGBRound; // 80% checkpoint window


    if (spawnGB80) {
      // Spawn 2 giant balls at random positions (80% progress)
      for (let gb = 0; gb < 2; gb++) {
        const gbX = Phaser.Math.Between(60, C.GW - 60);
        this.spawnGiantBall(gbX, topY);
      }
      return; // Giant balls replace normal obstacles
    } else if (spawnGB50) {
      // Spawn 1 giant ball at random position (50% progress)
      const gbX = Phaser.Math.Between(60, C.GW - 60);
      this.spawnGiantBall(gbX, topY);
      return; // Giant balls replace normal obstacles
    }

    // Normal obstacle spawning with player targeting
    let tgt = [];
    if (alive.length === 2) {
      // C.ODC chance both players get obstacles
      tgt = Math.random() < C.ODC ? alive : [Phaser.Utils.Array.GetRandom(alive)];
    } else {
      tgt = [alive[0]];
    }

    // Add obstacles at player positions with offset and delay
    let delay = 0;
    tgt.forEach((t, idx) => {
      const offset = (Math.random() - 0.5) * C.OOR * 2; // Random offset ±OOR
      const x = Phaser.Math.Clamp(t.x + offset, 40, C.GW - 40);
      obsToSpawn.push({ x, delay, speed: null }); // Random speed assigned in spawn
      delay += C.OD; // Stagger spawns
    });

    // C.ORC chance to add a completely random obstacle
    if (Math.random() < C.ORC) {
      const randX = Phaser.Math.Between(60, C.GW - 60);
      obsToSpawn.push({ x: randX, delay, speed: null });
      delay += C.OD;
    }

    // Schedule all obstacles with delays
    obsToSpawn.forEach(o => {
      if (o.delay === 0) {
        this.obs.push(new Obstacle(this, o.x, topY, OBS[Math.floor(Math.random() * OBS.length)], o.speed));
      } else {
        this.time.delayedCall(o.delay, () => {
          this.obs.push(new Obstacle(this, o.x, topY, OBS[Math.floor(Math.random() * OBS.length)], o.speed));
        });
      }
    });
  }

  spawnGiantBall(cx, cy) {
    // Spawn giant ball - 8 overlapping obstacles in circle pattern (cx=center X, cy=center Y, r=radius, spd=speed)
    const r = 25; // Radius of circle
    const spd = C.OFS * 0.8; // 80% of normal speed
    const angles = [0, 45, 90, 135, 180, 225, 270, 315]; // 8 positions around circle

    angles.forEach((ang, idx) => {
      const rad = (ang * Math.PI) / 180;
      const x = cx + r * Math.cos(rad);
      const y = cy + r * Math.sin(rad);
      const delay = idx * 50; // Small delay between each obstacle (50ms)

      this.time.delayedCall(delay, () => {
        this.obs.push(new Obstacle(this, x, y, OBS[Math.floor(Math.random() * OBS.length)], spd));
      });
    });
  }

  resolvePCol(p1, p2) {
    // Resolve player-player collision by pushing them apart (b1/b2=bounds, ox/oy=overlap x/y, d=direction, amt=push amount)
    const b1 = p1.getColliderBounds();
    const b2 = p2.getColliderBounds();
    const ox = Math.min(b1.right - b2.left, b2.right - b1.left);
    const oy = Math.min(b1.bottom - b2.top, b2.bottom - b1.top);
    if (ox < oy) {
      const d = b1.centerX < b2.centerX ? -1 : 1;
      const amt = ox / 2;
      p1.x += d * amt;
      p1.targetX = p1.x;
      p1.col = Phaser.Math.Clamp((p1.x - ((C.GW - C.BW) / 2)) / (C.BW / (C.BAC - 1)), 0, C.BAC - 1);
      p2.x -= d * amt;
      p2.targetX = p2.x;
      p2.col = Phaser.Math.Clamp((p2.x - ((C.GW - C.BW) / 2)) / (C.BW / (C.BAC - 1)), 0, C.BAC - 1);
    } else {
      const d = b1.centerY < b2.centerY ? -1 : 1;
      const amt = oy / 2;
      p1.y += d * amt;
      p1.targetY = p1.y;
      p2.y -= d * amt;
      p2.targetY = p2.y;
    }
  }

  update(t, d) {
    // Main update loop: handle input based on game state, update entities, check collisions/win, update camera (t=time, d=delta)
    this.bg.update(d, this.camTY); // Pass camera Y for parallax scrolling
    const setInp = (p, inp) => p.setInp(inp.up, inp.down, inp.left, inp.right); // Changed setInput→setInp
    // Handle state-specific logic: PLAYING=accept input, GAME_OVER=freeze, VICTORY=auto-advance dialogs, CINEMATIC=block input
    if (this.state === STATES.PLAYING) {
      setInp(this.players[0], this.inp.p1);
      if (!this.is1P) setInp(this.players[1], this.inp.p2);
      if (this.guard) this.guard.update(d);
    } else if (this.state === STATES.GAME_OVER) {
      setInp(this.players[0], { up: false, down: false, left: false, right: false });
      if (!this.is1P) setInp(this.players[1], { up: false, down: false, left: false, right: false });
      if (this.guard) this.guard.draw();
    } else if (this.state === STATES.VICTORY) {
      setInp(this.players[0], { up: false, down: false, left: false, right: false });
      if (!this.is1P) setInp(this.players[1], { up: false, down: false, left: false, right: false });
      if (this.guard) this.guard.update(d);
      // Auto-advance victory dialogs after text completes
      if (this.waitDlg && this.dialog.tCmp && !this.dlgAutoT) {
        this.dlgAutoT = this.time.delayedCall(2000, () => {
          this.waitDlg = false;
          this.dlgAutoT = null;
          this.advVictDlg();
        });
      }
    } else {
      if (this.guard) this.guard.draw();
      setInp(this.players[0], { up: false, down: false, left: false, right: false });
      if (!this.is1P) setInp(this.players[1], { up: false, down: false, left: false, right: false });
    }
    // Always update players and obstacles
    this.players.forEach(p => p.upd(d)); // Changed update→upd
    this.obs.forEach(o => o.update(d));
    // Spawn obstacles, check collisions, check win conditions (only during PLAYING state)
    if (this.state === STATES.PLAYING) {
      if (!this.obsPause) {
        this.obsSpawnT += d;
        if (this.obsSpawnT >= this.nxtInt) {
          this.obsSpawnT = 0;
          this.obsRounds++;
          // Calculate next interval with variance (±VAR/2)
          this.nxtInt = C.OSI + (Math.random() - 0.5) * C.VAR;
          this.spawnObs();
        }
      }
      this.checkColl();
      this.checkWin();
    }
    // Update camera to follow highest alive player (tgtY=target Y, maxY=max Y, clampY=clamped Y)
    const alive = this.players.filter(p => !p.isDd && !p.isFl); // Changed isDead→isDd, isFalling→isFl
    if (alive.length > 0) {
      const high = alive.reduce((h, p) => p.row > h.row ? p : h);
      const tgtY = high.getWorldY() - C.CO;
      const maxY = (C.GH + 25) - (C.GH / 2);
      const clampY = Math.min(tgtY, maxY);
      this.camTY = Phaser.Math.Linear(this.camTY, clampY, C.CS);
    }
    this.cameras.main.centerOn(C.GW / 2, this.camTY);
    this.drawBld();
    this.updUI();
    if (this.dialog) this.dialog.render(d);
  }

  drawBld() {
    // Draw building with glass windows, metal structure, and ground (bX=building X, bX2=building X end, cW=column width, isG=is goal floor)
    this.bGfx.clear();
    const bX = (C.GW - C.BW) / 2;
    const bX2 = bX + C.BW;
    const topY = -1500;
    const botY = C.GH + 100;
    // Building background with glass texture overlay
    this.bGfx.fillStyle(COLORS.GLASSB, 1).fillRect(bX, topY, C.BW, botY - topY);
    for (let i = 0; i < 15; i++) {
      this.bGfx.fillStyle(COLORS.GLASSSTR, 0.3).fillRect(bX + (i * C.BW / 15), topY, 2, botY - topY);
    }
    const cW = C.BW / C.BVC;
    // Draw rows and windows: horizontal lines, then windows (open at goal floor, glass otherwise)
    for (let r = 0; r < C.ROWS; r++) {
      const y = this.players[0].rowToY(r);
      this.bGfx.lineStyle(2, COLORS.METAL1, 0.8).lineBetween(bX, y, bX2, y);
      const isG = r === C.GOAL;
      for (let c = 0; c < C.BVC; c++) {
        const x = bX + c * cW + cW / 2;
        if (isG) {
          // Open window at goal floor: dark interior, yellow frame, warm glow
          this.bGfx.fillStyle(P[0], 0.9).fillRect(x - 12, y - C.RHEIGHT / 2 - 5, 24, 10);
          this.bGfx.lineStyle(2, P[73], 1).strokeRect(x - 12, y - C.RHEIGHT / 2 - 5, 24, 10);
          this.bGfx.fillStyle(P[7], 0.4).fillRect(x - 10, y - C.RHEIGHT / 2 - 4, 20, 8);
        } else {
          // Regular glass window: alternating blue tones with reflection
          this.bGfx.fillStyle((r + c) % 2 === 0 ? COLORS.GLASSW1 : COLORS.GLASSW2, 0.7).fillRect(x - 10, y - C.RHEIGHT / 2 - 4, 20, 8);
          this.bGfx.fillStyle(COLORS.GLASSREF, 0.4).fillRect(x - 8, y - C.RHEIGHT / 2 - 3, 12, 2);
        }
      }
    }
    // Vertical columns with metallic highlights
    for (let c = 0; c <= C.BVC; c++) {
      const x = bX + c * cW;
      this.bGfx.lineStyle(3, COLORS.METAL1, 0.9).lineBetween(x, topY, x, botY);
      this.bGfx.lineStyle(1, COLORS.METAL2, 0.6).lineBetween(x - 1, topY, x - 1, botY);
    }

    // Draw "Platanus Hack 25" sign above goal floor (signY=sign Y position, signH=sign height)
    const goalY = this.players[0].rowToY(C.GOAL);
    const signY = goalY - C.RHEIGHT / 2 - 40; // Position above goal floor
    const signW = C.BW * 0.8; // signW = sign width (80% of building width)
    const signH = 28; // signH = sign height
    const signX = (C.GW - signW) / 2; // signX = sign X (centered)

    // Sign background (bright with border)
    this.bGfx.fillStyle(P[7], 1).fillRect(signX, signY, signW, signH); // Yellow background
    this.bGfx.lineStyle(3, P[73], 1).strokeRect(signX, signY, signW, signH); // Orange border

    // Position sign text at center of sign
    this.signTxt.setPosition(C.GW / 2, signY + signH / 2);

    // Add decorative lights around sign (flashing effect based on time)
    const flsh = Math.floor(this.time.now / 300) % 2; // flsh = flash state (alternates every 300ms)
    const lCol = flsh ? P[73] : P[7]; // lCol = light color (orange/yellow alternating)
    for (let i = 0; i < 8; i++) {
      const lX = signX + (i * signW / 7); // lX = light X position
      this.bGfx.fillStyle(lCol, 1).fillCircle(lX, signY - 3, 2); // Top lights
      this.bGfx.fillStyle(lCol, 1).fillCircle(lX, signY + signH + 3, 2); // Bottom lights
    }

    // Ground with concrete texture (gY=ground Y, gH=ground height, s=seed for pattern)
    const gY = C.GH - 10;
    const gH = 50;
    this.bGfx.fillStyle(COLORS.BASE1, 1).fillRect(0, gY, C.GW, gH);
    for (let x = 0; x < C.GW; x += 8) {
      for (let y = 0; y < gH; y += 8) {
        const s = (x * 7 + y * 13) % 100;
        if (s > 85) this.bGfx.fillStyle(COLORS.BASE2, 0.4).fillRect(x, gY + y, 6, 6);
        else if (s < 15) this.bGfx.fillStyle(COLORS.BASE3, 0.4).fillRect(x, gY + y, 6, 6);
      }
    }
    // Sidewalk panel lines
    this.bGfx.lineStyle(2, COLORS.PANEL_LINE, 0.6);
    for (let i = 1; i < 5; i++) this.bGfx.lineBetween(0, gY + (i * gH / 5), C.GW, gY + (i * gH / 5));
    for (let i = 0; i < C.GW; i += 40) this.bGfx.lineBetween(i, gY, i, gY + gH);
  }

  updUI() {
    // Update UI: clear graphics, update lives text
    this.uiGfx.clear();
    this.p1Txt.setText(`P1:${'♥'.repeat(this.players[0].liv)}`); // Changed lives→liv
    if (!this.is1P) this.p2Txt.setText(`P2:${'♥'.repeat(this.players[1].liv)}`); // Changed lives→liv
  }
}

// =============================================================================
// GAME INITIALIZATION
// =============================================================================
const config = {
  type: Phaser.CANVAS,
  width: 800,
  height: 600,
  // fps: {
  //   target: 60,
  //   forceSetTimeOut: true,
  // },
  // scene: [GameScene],
  scene: [MenuScene, CharacterSelectionScene, GameScene],
  // pixelArt: true,
  // antialias: false,
  // autoRound: true,
  // roundPixels: true,
};

const game = new Phaser.Game(config);
