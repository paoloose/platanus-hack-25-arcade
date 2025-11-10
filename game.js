// Platanus Hack 25: Late to the Hackathon
// A Crazy Climber inspired game where you race to reach the hackathon floor!

// =============================================================================
// ARCADE BUTTON MAPPING - COMPLETE TEMPLATE
// =============================================================================
const CTRLS = {
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
const CONF = {
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
  OBSTACLE_DUAL_CHANCE: 0.3, // 30% chance both players get obstacles when both alive

  // Guard AI
  GUARD_CLIMB_MIN_DELAY: 700, // Min ms between climb steps
  GUARD_CLIMB_MAX_DELAY: 900, // Max ms between climb steps
  GUARD_CHASE_SPEED: 0.02, // How aggressively guard moves toward player (0-1)
  GUARD_INITIAL_SLOW_MULTIPLIER: 0.7, // Guard is slower initially (until row 10)
  GUARD_OFFSCREEN_BOOST: 2.5, // Speed multiplier when guard is off-camera below players

  // Camera
  CAMERA_SMOOTH: 0.08,
  CAMERA_OFFSET: 20, // pixels below center

  // Audio
  DIALOG_BEEP_VOLUME: 0.05, // Volume for dialog beeps (0-1)
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
  0x18171a, 0xf7bb1b,
];

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
  GOAL_MARKER: P[53],     // 0xc84ff5 - magenta goal
};

// Color character mapping (~ and ^ are semantic codes, not colors)
const COLOR_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%&*()_+-=[]{};:,./<>?`"';

// Build color lookup from character to actual color
const COLOR_MAP = {};
for (let i = 0; i < COLOR_CHARS.length; i++) {
  if (i < P.length) {
    COLOR_MAP[COLOR_CHARS[i]] = P[i];
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
    name: 'Bodoque',
    rawSprites: {
      IDLE: '~~9.4.1[9.7.9.4.1[2.2[9.3.9.2[2.1[1.>8.2[3.1[1.>8.3[2.1[1.>8.2A3.2[>7.1A1G3.3[>6.2A1G3.3[>6.1A1G4.3[>6.1A1G1A1G1A2.2[>8.1A1G1A1G3A>9.1.1A1G1A2G>9.4.5A9.3.9.4.2G>9.3.3A>9.3.3G>9.3.3A>9.2.4[>9.2.9[9.1.9.1.2[7.1[9.1.9.2[4.>^^^9.1.2[3.>9.3[3.>~~',
      // LUP0: null, // Will be created as horizontal mirror of RUP0
      // LUP1: null, // Will be created as horizontal mirror of RUP1
      RUP0: '9.4.1[9.7.9.4.1[2.2[9.3.9.4.1[1.>9.4.1[2.1[2.3[8.9.4.1[2.1[3.2[8.9.4.4[3.2A8.9.3.6[2.3G7.9.3.6[3.2A7.9.3.6[3.2G7.9.4.4[3.2A8.9.1.1A1G6A1G1A2G8.9.1G1A1G1A4G1A1G1A9.1.8.1A1G1A2.5A9.3.8.3A2.4G9.4.9.2G2.4A9.4.9.1.2A1.4G9.4.9.1.3[5A9.3.9.1.1[1.6G1.2[9.9.3.5A5[8.9.2.8[1.2[8.9.2.7[2.2[8.9.1.3[7.2[8.9.1.2[8.2[8.9.1.1[9.3[7.9.1.1[9.9.1.9.1.2[9.9.9.3[9.9.~~~',
      RUP1: '9.4.1[9.7.9.4.1[2.2[1.3[8.9.4.1[2.1[3.2[8.9.4.1[2.1[3.2A8.9.4.1[2.1[3.1A2G7.9.4.4[4.2A7.9.3.6[3.2G7.9.3.6[3.2A7.9.3.6[2.2G8.9.4.4[2.2A9.9.4.6A2G9.9.1.1A1G1A5G1A9.2.9.1G1A1G6A9.3.9.1G1A2.4G9.4.9.2A2.4A9.4.9.1.2G1.4G9.4.9.1.2A1.4A9.4.9.1.3[4G9.4.9.1.1[2.4A9.4.9.4.2G>9.4.2A>9.4.2[>9.3.3[>9.2.3[2.2[9.3.9.2.2[2.>^9.2.1[5.2[9.2.9.1.2[6.1[9.2.9.3[6.2[9.1.~',
      FRONT: '9.3.2[3.2[9.2.9.3.2[2.3[9.2.9.3.2[1.>^^9.3.7[9.2.9.3.1[1A2[1A2[9.2.^9.3.2[2O3[9.2.9.4.5[9.3.9.4.5A9.3.9.3.7G9.2.9.2.1G7A1G9.1.9.2.1A1.5G1.1A9.1.9.2.1G1.5A1.1G9.1.9.2.1A1.5G1.1A9.1.9.2.1G1.5A1.1G9.1.9.2.1A1.5G1.1A9.1.9.1.2[1.5A1.2[9.9.1.2[1.5G1.2[9.9.4.5A9.3.9.4.5[9.3.^9.4.1[3.1[9.3.^^^^9.3.2[1.>^',
    }
  },
  // Character 2: Empty (to be designed)
  {
    name: 'Condorito',
    rawSprites: {
      IDLE:'~~~~9.2;3.1[>8.2;3.2;>8.3;1.3;>8.2;1.4;>7.2;2.4;>6.3;2.4;>6.2;4.3;>6.4;1[3.3=2.1[4;6.8.2;3[2G>9.1.5[>9.3.3[>9.4.2[>9.3.3[>^9.3.3A>9.2.4A>9.2.9A9.1.9.1.2A7.1A9.1.9.2A4.>9.2;4.>^^9.1.2[3.>9.3[3.>~~',
      // LUP0: null,
      // LUP1: null,
      RUP0: '~~9.5.1[>9.4.4;2.3;8.9.3.6;2.2;8.9.2.8;1.2;8.9.2.8;1.3;7.9.2.8;2.2;7.9.3.6;3.2;7.9.5.3=3.1[1;8.9.1.3[4G4[1;8.9.1;9[1[9.1.8.2;3.5[9.3.8.2;3.4[9.4.9.2;2.4[9.4.9.1.2;1.4[9.4.9.1.3;4[1A9.3.9.1.1;1.6A1.2;9.9.3.7A3;8.9.2.8A1.2;8.9.2.7A2.2;8.9.1.1;2A7.2;8.9.1.2;8.1[1;8.9.1.1;9.3[7.9.1.1;9.9.1.9.1.2[9.9.9.3[9.9.~~~',
      RUP1: '~9.9.1.3;8.9.5.2[4.2;8.9.4.4;3.2;8.9.3.6;3.2;7.9.2.8;2.2;7.^9.2.8;2.1;8.9.3.6;2.2;8.9.5.3=2.2;9.9.4.4G2[2;9.9.1.9[9.2.9.1;8[9.3.9.2;2.4[9.4.^9.1.1;2.4[9.4.^9.1.2;1.4[9.4.9.1.1;2.4[9.4.9.4.2A>^^9.3.3A>9.2.3A2.2A9.3.9.2.2;2.>^9.2.1;5.2;9.2.9.1.2[6.1[9.2.9.3[6.2[9.1.~',
      FRONT: '~~9.3.5[9.4.9.2.6[9.4.9.2.2[5;9.3.9.3.2;1A1G3;9.2.9.1.4;1A1G3;9.2.9.1.9;9.2.9.1.2;3]4;9.2.9.2.1;1.1]4;9.3.9.5.3=9.4.9.4.5G9.3.9.3.7[9.2.9.2.9[9.1.^9.2.1;1.5[1.1;9.1.^^^9.1.2;1.5A1.2;9.^9.4.5A9.3.^9.4.1A3.1A9.3.^9.4.1;3.1;9.3.^^9.3.1[1;2.1[1;9.3.9.3.2[1.>',
    }
  },
  // Character 3: Empty (to be designed)
  {
    name: 'Arturo Vidal',
    rawSprites: {
      IDLE: '~~~9.5.1A>8.2{2.2{1A>7.2{2.3{1A>7.3{1.3{1A>7.2{2.3{2A3{2.3{6.6.3{2.8{3.2{6.5.3{3.4{>5.3{1:3.1J4{1J3.4{5.5.1{3:3.6[2.3:1{6.6.1:9[6[1:7.7.9[6[8.9.9[2[9.1.9.2.4[>^^^^9.2.4:>^9.1.5:>9.1.3{1:1.>9.4{2.>9.3:3.>^^9.3A3.>8.4A3.>',
      // LUP0: null,
      // LUP1: null,
      RUP0: '~9.5.1A>9.3.2{1A>9.2.3{2A3{1.3{7.9.2.3{2A3{2.3{6.9.2.3{2A3{3.2{6.9.2.8{3.2{6.9.2.8{2.3{6.9.3.1J4{1J3.3{6.9.3.6:2.2:1{7.9.9[3[2:7.8.9[6[7.7.3:9[3[8.7.3{1.8[9.2.^8.2{1.8[9.2.8.3{8[9.2.8.2{1.9:1{9.9.2.9:2{8.^9.2.3:5.2{1:8.9.1.4{5.3:8.9.1.3{6.3:8.9.1.3:6.3A8.9.1.3:6.4A7.9.1.3:9.8.9.1.3A9.8.9.4A9.8.~~',
      RUP1: '9.9.3.3{6.9.5.2A6.3{5.9.3.2{2A2{4.3{5.9.2.3{2A3{4.2{5.^^9.2.8{3.3{5.9.2.8{2.1:3{5.9.3.1J4{1J2.1[2:1{6.9.3.6:1.3[1:7.9.2.9[2[8.9.6[>8.9[2[9.2.7.3:9[9.2.7.3{1.8[9.2.^^^^7.2{2.8:9.2.9.2.4:>9.2.3:1.>9.2.3{1.>^9.1.3{2.>9.1.3:2.>^^9.1.3A2.>9.4A2.>',
      FRONT: '9.5.1A>9.3.2{1A>9.2.4{>9.2.3U1{>9.2.1{2A1{>9.2.4{>9.2.3{1U>9.2.1U1{1U1F>9.3.3U>9.1.2[3:>9.6[>^9.7[2F3[9.9.2:5[2F1[2:9.9.2{5[2F1[2{9.9.2{4[>^^^9.2{4:>9.2.4:>^9.2.3:1.>9.2.3{1.>^9.2.3:1.>^^9.2.3A1.>^',
    }
  },
  // Character 4: Empty (to be designed)
  {
    name: 'Hacker 1',
    rawSprites: {
      IDLE: '~~~~8.2,2.6U2.2,8.7.2,2.8U2.2,7.7.3,1.8U1.3,7.7.2B2.8U2.3B6.6.3B2.8U3.2B6.5.3B3.1{6U1{3.3B5.5.4B3.6,3.4B5.5.4B3.6B2.4B6.6.9B8B7.7.9B6B8.9.9B2B9.1.9.3.6B9.3.^^^^9.2.8:9.2.^9.1.9:1:9.1.9.1.4:2.4:9.1.9.4:4.4:9.9.3:6.3:9.^^9.3A6.3A9.8.4A6.4A8.',
      // LUP0: null,
      // LUP1: null,
      RUP0: '~~9.3.6U9.3.9.2.8U1.3,7.9.2.8U2.3,6.9.2.8U3.2B6.^9.2.1{6U1{2.3B6.9.3.6,3.3B6.9.3.6B2.3B7.9.9B5B7.8.9B6B7.7.9B6B8.7.3B2.6B9.3.^8.2B2.6B9.3.8.3,1.6B9.3.8.2,1.9:1:9.9.2.9:2:8.^9.2.3:5.3:8.9.1.4:5.3:8.9.1.3:6.3:8.9.1.3:6.3A8.9.1.3:6.4A7.9.1.3:9.8.9.1.3A9.8.9.4A9.8.~~',
      RUP1: '9.9.3.3,6.9.9.4.3,5.9.3.6U4.1,2B5.9.2.8U4.2B5.^^9.2.8U3.3B5.9.2.1{6U1{2.4B5.9.3.6,2.4B6.9.3.6B1.4B7.9.2.9B2B8.9.9B3B9.8.9B1B9.3.7.4B1.6B9.3.7.3B2.6B9.3.^^^7.3,2.6B9.3.7.2,2.8:9.2.9.2.8:9.2.9.2.3:2.3:9.2.^^9.1.3:4.3:9.1.^^^9.1.3A4.3A9.1.9.4A4.4A9.',
      FRONT: '~9.3.6U9.3.9.2.8U9.2.^9.2.1U6,1U9.2.9.2.1,2A2,2A1,9.2.^9.2.3,2{3,9.2.9.3.6,9.3.9.1.4B2{4B9.1.9.9B3B9.^9.2B1.6B1.2B9.^^^^^9.2,1.6B1.2,9.9.2,8:2,9.9.2.8:9.2.^9.2.3:2.3:9.2.^^^^^9.2.3A2.3A9.2.^',
    }
  },
  {
    name: 'Engineer',
    rawSprites: {
      IDLE: '~~~9.3.5A9.4.8.2,1.4A>7.2,2.4A>7.3,5A>7.2/1.9A1A1.3/6.6.3/1.9A1A2.2/6.5.3/3.1{3A>5.4/3.1,2A>5.4/3.6/2.4/6.6.9/8/7.7.9/6/8.9.9/2/9.1.9.2.1}3/>^^^^9.2.4A>^9.1.5A>9.1.4A1.>9.4A2.>9.3A3.>^^^8.4A3.>',
      // LUP0: null,
      // LUP1: null,
      RUP0: '~9.3.3A>9.2.4A>9.1.9A1.3,7.9.1.9A1A1.3,6.9.1.9A1A2.2/6.^9.1.1A1{6A1{1A1.3/6.9.3.1,4A1,3.3/6.9.3.6/2.3/7.9.9/5/7.8.9/6/7.7.9/6/8.7.3/1.1}6/1}9.2.^8.2/1.1}6/1}9.2.8.3,1}6/1}9.2.8.2,1.9A1A9.9.2.9A2A8.^9.2.3A5.3A8.9.1.4A5.3A8.9.1.3A6.3A8.^9.1.3A6.4A7.9.1.3A9.8.^9.4A9.8.~~',
      RUP1: '9.9.3.3,6.9.3.6A4.3,5.9.2.8A3.1,2/5.9.1.9A1A3.2/5.9.1.9A2A2.2/5.9.1.9A1A3.2/5.9.1.9A1A2.3/5.9.1.1A1{6A1{1A1.4/5.9.3.1,4A1,2.4/6.9.3.6/1.4/7.9.2.9/2/8.9.6/>8.9/1/1}9.2.7.4/1}6/1}9.2.7.3/1.1}6/1}9.2.^^^7.3,1.1}6/1}9.2.7.2,2.8A9.2.9.2.4A>9.2.3A1.>^^9.1.3A2.>^^^^9.4A2.>',
      FRONT: '9.2.7A9.3.9.9A1A9.2.9.1.5A>9.3A2,1A3,3A9.9.2A1,2A1,>^9.1.1A4{>9.2.3{1K>9.3.3{>9.2.3/1,>9.1.5/>9.4/1G7/9.9.2/1}2/1G3/1}2/9.9.2/1}2/1G>^^9.2/1}1/2G3/1}2/9.9.2/1}3/>9.2,1}3/>9.2,4A>9.2.4A>^9.2.3A1.>^^^^^^^',
    }
  },
  {
    name: 'VC',
    rawSprites: {
      IDLE: '~~9.4.2,>8.2,2.3,>5.2Y3,1.4,>5.2Y2,2Y8,2Y2,1Y1i5.6.1i3,1i4,>7.2G2.8,2.3G6.6.3G2.1{6,1{3.2G6.5.3G3.4{>5.4G3.3{>5.4G3.6G2.4G6.6.9G8G7.7.6G1c2G1c5G8.9.4G1c2G1c3G9.1.9.2.1F1G2c>9.2.1F2G1c>^^9.2.1F3G>9.2.4:>^9.1.5:>9.1.4:1.>9.4:2.>9.3:3.>^^9.3q3.>8.4q3.>',
      // LUP0: null,
      // LUP1: null,
      RUP0: '9.4.2,>9.3.3,>9.2.4,>9.2.8,1.3,2i5.9.2.8,2Y3,1Y5.9.2.8,3i2G6.9.2.1{6,1{3.2G6.9.2.8{2.3G6.9.3.6{3.3G6.9.3.6G2.3G7.9.4G1c2G1c6G7.8.5G1c2G1c6G7.7.6G4c5G8.7.3G1.1F2G2c2G1F9.2.^8.2G1.1F2G2c2G1F9.2.6.2Y3,1Y6G1F9.2.6.2i2,2i9:9.9.2.9:2:8.^9.2.3:5.3:8.9.1.4:5.3:8.9.1.3:6.3:8.9.1.3:6.3q8.9.1.3:6.4q7.9.1.3:9.8.9.1.3q9.8.9.4q9.8.~~',
      RUP1: '9.4.4,4.3,2i4.9.3.6,2.2Y3,1Y4.9.2.8,1.2i1,2G5.9.2.8,4.2G5.^^9.2.1{6,1{3.3G5.9.2.8{2.4G5.9.3.6{2.4G6.9.3.6G1.4G7.9.2.9G2G8.9.4G1c1G>8.5G1c2G1c1G1F9.2.7.4G1F1G4c1G1F9.2.7.3G1.1F2G2c2G1F9.2.^^7.3G1.1F6G1F9.2.5.2Y3,1Y1F6G1F9.2.5.2i2,2i8:9.2.9.2.4:>9.2.3:1.>^^9.1.3:2.>^^^9.1.3q2.>9.4q2.>',
      FRONT: '9.4.2,>9.3.3,>9.2.4,>^9.2.1,2A1,>9.2.4,>9.2.2{1G1{>9.2.3{1G>9.3.3{>9.1.4G2,3G3.3,5.9.9G2G1.6Y3.9.2G1F5c3G1.2i2,2i3.9.2G1F1c1G1c1G1c1G1F2G2.2G5.9.2G1F1c3G1c1G1F6G5.9.2G1F2c1G2c1G1F5G6.9.2G1F2c1G2c1G1F1.3G7.9.2G1F5c1G1F9.2.9.2G1F6G1F9.2.7.2i3,1Y5G1F9.2.7.2Y2,2i6:9.2.9.2.4:>^9.2.3:1.>^^^^^9.2.3q1.>^',
    }
  },
];

// Guard sprites (reuses player sprites for now)
const RAW_GUARD_SPRITES = {
  IDLE: '~~~9.2.4A>8.2{1.4A>7.2{2.4A>7.3{1.4U>7.2D2.4U>6.3A2.4U>5.3A3.1{3U>5.4A3.3{>5.4A3.6A2.5A5.6.9A8A7.7.9A6A8.9.9A2A9.1.9.2.4A>^^9.2.1B2}5B9.2.^9.2.4A>^9.1.5A>9.1.4A1.>9.4A2.>9.3A3.>^^9.3B3.>8.4B3.>',
  LUP0: null, // Will be mirrored from RUP0 below
  LUP1: null, // Will be mirrored from RUP1 below
  RUP0: '~9.2.4A>^9.2.8A1.4{6.9.2.8U2.3{6.9.2.8U2.3D6.9.2.8U2.3A6.9.2.1{6U1{2.3A6.9.3.6{3.3A6.9.3.6A2.4A6.9.9A5A7.8.9A6A7.7.9A6A8.7.3A1.8A9.2.^8.2D1.8A9.2.8.3{1B2}5B9.2.8.2{1.1B2}5B2A9.9.2.9A2A8.^9.2.6A2.3A8.9.1.4A5.3A8.9.1.3A6.3A8.9.1.3A6.3B8.9.1.3A6.4B7.9.1.3A9.8.9.1.3B9.8.9.4B9.8.~~',
  RUP1: '9.9.3.4{5.9.2.8A3.3{5.9.2.8A3.3D5.9.2.8A3.3A5.9.2.8U3.3A5.^9.2.8U2.4A5.9.2.1{6U1{2.4A5.9.3.6{3.3A6.9.3.6A1.4A7.9.2.9A2A8.9.6A>8.9A2A9.2.7.9A3A9.2.7.3A1.8A9.2.^^7.3D1.1B2}5B9.2.7.3{1.1B2}5B9.2.7.2{2.8A9.2.9.2.4A>^^9.1.4A1.>^9.1.3A2.>^^9.1.3B2.>9.4B2.>',
  FRONT: '9.2.4A>9.2.2A2O>^9.2.3U1O>9.2.4q>9.2.3q1{>9.2.3{1U>9.2.2{1U1J>9.3.3{>9.1.2A2D1A>9.4A1D1A>^9.6A>^^^^9.2D3B1O>9.2{3B1O>9.2{4A>9.2.4A>^9.2.3A1.>^^^^^9.2.3B1.>^',
};

// Mirror sprites for guard (must be done after RAW_GUARD_SPRITES is defined)
if (RAW_GUARD_SPRITES.RUP0 && !RAW_GUARD_SPRITES.LUP0) {
  RAW_GUARD_SPRITES.LUP0 = mirrorSpriteHorizontally(RAW_GUARD_SPRITES.RUP0);
}
if (RAW_GUARD_SPRITES.RUP1 && !RAW_GUARD_SPRITES.LUP1) {
  RAW_GUARD_SPRITES.LUP1 = mirrorSpriteHorizontally(RAW_GUARD_SPRITES.RUP1);
}

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
function parseSprite(spriteData, width = 30) {
  if (!spriteData) return [];
  // If it's already an array, return it directly
  if (Array.isArray(spriteData)) return spriteData;
  // Otherwise parse as CSEF string
  return parseCSEF(spriteData, width);
}

function mirrorSpriteHorizontally(spriteString, width = CONF.PLAYER_WIDTH) {
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

function buildSpriteSet(rawMap, width = CONF.PLAYER_WIDTH) {
  const parsed = {};
  for (const key in rawMap) {
    const value = rawMap[key];
    parsed[key] = value ? parseSprite(value, width) : null;
  }
  return parsed;
}

CHARACTERS.forEach(char => {
  const raw = char.rawSprites;
  if (raw.RUP0 && !raw.LUP0) raw.LUP0 = mirrorSpriteHorizontally(raw.RUP0);
  if (raw.RUP1 && !raw.LUP1) raw.LUP1 = mirrorSpriteHorizontally(raw.RUP1);
  char.sprites = buildSpriteSet(raw);
});

const GUARD_SPRITES = buildSpriteSet(RAW_GUARD_SPRITES);

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
          graphics.fillStyle(P[0], 0.3); // Black shadow
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
      this.size = CONF.OBSTACLE_SIZE;

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
      this.y += CONF.OBSTACLE_FALL_SPEED * (delta / 1000);

      // Rotate while falling
      this.rotation += (delta / 1000) * 3; // 3 radians per second

      // Remove if fallen far below camera view
      const cameraBottomY = this.scene.cameraTargetY + (CONF.GAME_HEIGHT / 2);
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
      const spriteData = parseSprite(this.type.sprite, CONF.OBSTACLE_SIZE);

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
    const buildingStartX = (CONF.GAME_WIDTH - CONF.BUILDING_WIDTH) / 2;
    const colWidth = CONF.BUILDING_WIDTH / (CONF.BUILDING_ACTUAL_COLUMNS - 1);
    return buildingStartX + col * colWidth;
  }

  rowToY(row) {
    const startY = CONF.GAME_HEIGHT - 20;
    return startY - (row * CONF.ROW_HEIGHT);
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
    this.colliderOffsetX = (CONF.PLAYER_WIDTH - this.colliderWidth) / 2; // 8
    this.colliderOffsetY = (CONF.PLAYER_HEIGHT - this.colliderHeight) / 2; // 2

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
      const floorLevel = CONF.GAME_HEIGHT;
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
      if (this.animTimer >= CONF.CLIMB_STEP_DURATION) {
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
      const newCol = Phaser.Math.Clamp(this.col + dir * 0.06, 0, CONF.BUILDING_ACTUAL_COLUMNS - 1);
      if (newCol !== this.col) {
        this.col = newCol;
        this.targetX = this.colToX(this.col);
      }

      // Animate between LUP0 and RUP0 for visual climbing feel
      this.animTimer += delta;
      if (this.animTimer >= CONF.CLIMB_STEP_DURATION) {
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
        if (this.animTimer >= CONF.CLIMB_STEP_DURATION) {
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
        if (this.animTimer >= CONF.CLIMB_STEP_DURATION) {
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
      if (newRow >= 0 && newRow <= CONF.TOTAL_ROWS) {
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
      const spriteData = this.sprites[this.animState] || this.sprites.IDLE;

      // Draw the sprite (rotation effect is visual only, we just flip/mirror for falling)
      if (this.isCaught) {
        // LOST animation - alternate between LUP0 and RUP0
        const lostSpriteData = this.sprites[this.lostAnimState] || this.sprites.IDLE;
        drawSprite(this.graphics, lostSpriteData, this.x, this.y, { showSpriteBorder: DEBUG });
      } else if (this.isFalling) {
        // For death fall, we'll alternate the sprite for a tumbling effect
        const tumbleFrame = Math.floor(this.fallRotation * 2) % 2;
        const tumbleSprite = tumbleFrame === 0 ? 'LUP1' : 'RUP1';
        const fallingSpriteData = this.sprites[tumbleSprite] || this.sprites.IDLE;
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
    const min = CONF.GUARD_CLIMB_MIN_DELAY;
    const max = CONF.GUARD_CLIMB_MAX_DELAY;
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
    if (this.targetPlayer.row < CONF.OBSTACLE_START_ROW) {
      speedMultiplier *= CONF.GUARD_INITIAL_SLOW_MULTIPLIER;
    }

    // 2. Off-screen boost (when guard is below camera view)
    const cameraBottomY = this.scene.cameraTargetY + (CONF.GAME_HEIGHT / 2);
    const guardY = this.getWorldY();

    if (guardY > cameraBottomY) {
      // Guard is below camera (off-screen) - boost speed to catch up
      speedMultiplier *= CONF.GUARD_OFFSCREEN_BOOST;
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
      if (this.animTimer >= CONF.CLIMB_STEP_DURATION) {
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
      this.col += direction * CONF.GUARD_CHASE_SPEED * speedMultiplier;

      // Clamp to valid columns
      this.col = Math.max(0, Math.min(CONF.BUILDING_ACTUAL_COLUMNS - 1, this.col));

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
      if (newRow >= 0 && newRow <= CONF.TOTAL_ROWS) {
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
    const spriteData = GUARD_SPRITES[this.animState] || GUARD_SPRITES.IDLE;

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

    // Text animation state
    this.fullText = '';
    this.displayedText = '';
    this.charIndex = 0;
    this.charDelay = 30; // ms per character
    this.charTimer = 0;
    this.isTextComplete = false;

    // Audio context for beep sounds
    this.audioContext = null;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported, dialog sounds disabled');
    }

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
      color: '#fff',
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

    // Initialize text animation
    this.fullText = text;
    this.displayedText = '';
    this.charIndex = 0;
    this.charTimer = 0;
    this.isTextComplete = false;
  }

  hide() {
    this.isActive = false;
    this.currentDialog = null;
    this.graphics.clear();
    this.portraitGraphics.clear();
    this.textObject.setText('');
    this.textObject.setVisible(false);

    // Reset text animation
    this.fullText = '';
    this.displayedText = '';
    this.charIndex = 0;
    this.isTextComplete = false;
  }

  playBeep(voiceType = 'PLAYER') {
    if (!this.audioContext) return;

    // Create a short beep sound
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Different pitch ranges for different voices
    let baseFreq, variation;
    if (voiceType === 'GUARD') {
      // Deeper voice for guard (250-350 Hz)
      baseFreq = 275;
      variation = 75;
    } else {
      // Higher voice for players (450-600 Hz)
      baseFreq = 450;
      variation = 150;
    }

    oscillator.frequency.value = baseFreq + Math.random() * variation;
    oscillator.type = 'square';

    // Quick fade out
    gainNode.gain.setValueAtTime(CONF.DIALOG_BEEP_VOLUME, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

    // Play for 50ms
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }

  updateTextAnimation(delta) {
    if (this.isTextComplete || !this.fullText) return;

    this.charTimer += delta;

    if (this.charTimer >= this.charDelay) {
      this.charTimer = 0;

      if (this.charIndex < this.fullText.length) {
        // Add next character
        this.displayedText += this.fullText[this.charIndex];
        this.charIndex++;

        // Play beep (skip spaces) with voice type
        if (this.fullText[this.charIndex - 1] !== ' ') {
          const voiceType = this.currentDialog ? this.currentDialog.type : 'PLAYER';
          this.playBeep(voiceType);
        }
      } else {
        // Text complete
        this.isTextComplete = true;
      }
    }
  }

  render(delta = 16) {
    // Update text animation
    this.updateTextAnimation(delta);

    // Clear graphics every frame
    this.graphics.clear();
    this.portraitGraphics.clear();

    if (!this.currentDialog) {
      // No dialog to show
      this.textObject.setVisible(false);
      return;
    }

    const { type, sprites } = this.currentDialog;

    const screenHeight = CONF.GAME_HEIGHT;
    const screenWidth = CONF.GAME_WIDTH;
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

    // Use displayed text (animated) instead of full text
    const displayText = this.displayedText;

    if (type === 'PLAYER') {
      // Player dialog: portrait on right, text on left
      this.renderPlayerDialog(displayText, sprites[0], boxY, boxX, screenWidth);
    } else if (type === 'GUARD') {
      // Guard dialog: portrait on left, text on right
      this.renderGuardDialog(displayText, sprites[0], boxY, boxX, screenWidth);
    } else if (type === 'UNISON') {
      // Unison dialog: both portraits on right, text on left
      this.renderUnisonDialog(displayText, sprites, boxY, boxX, screenWidth);
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
    const spriteData = sprite;
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
    this.autoClimbTarget = 5; // Climb 5 rows
  }

  start() {
    console.log('Starting opening cinematic...');
    this.isActive = true;
    this.currentStep = 0;

    // Step 0: Players walk in from the right (0-2s)
    this.walkInPlayers();

    // Step 1: Show players greeting after they arrive (at 2s)
    this.scene.time.delayedCall(2000, () => {
      this.currentStep = 1;
      const playerSprites = this.scene.players.map(p => p.sprites.FRONT);
      const dialogType = this.scene.is1PlayerMode ? 'PLAYER' : 'UNISON';
      const dialogText = this.scene.is1PlayerMode
        ? 'Hola, vengo para la platanus hack 2025 🍌'
        : 'Hola, venimos para la platanus hack 2025 🍌';
      this.scene.dialog.show(dialogType, dialogText, playerSprites);
    });

    // Step 2: Show guard dialog (at 5s)
    this.scene.time.delayedCall(5000, () => {
      this.currentStep = 2;
      this.scene.dialog.show('GUARD', 'La hackathon ya ha iniciado, no estamos recibiendo más participantes', [GUARD_SPRITES.FRONT]);
    });

    // Step 3: Show players' response (at 8s)
    this.scene.time.delayedCall(8000, () => {
      this.currentStep = 3;
      const playerSprites = this.scene.players.map(p => p.sprites.FRONT);
      const dialogType = this.scene.is1PlayerMode ? 'PLAYER' : 'UNISON';
      const dialogText = this.scene.is1PlayerMode
        ? 'Cómo? Tengo que entrar!!'
        : 'Cómo? Tenemos que entrar!!';
      this.scene.dialog.show(dialogType, dialogText, playerSprites);
    });

    // Step 4: After 11 seconds, hide dialog and start auto-climb
    this.scene.time.delayedCall(11000, () => {
      this.currentStep = 4;
      this.scene.dialog.hide();
      this.startAutoClimb();
    });
  }

  walkInPlayers() {
    // Move players from far right to building entrance over 2 seconds
    console.log('Players walking in from right...');

    const startCol = CONF.BUILDING_ACTUAL_COLUMNS + 3; // Start off-screen right
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
    if (this.scene.is1PlayerMode) {
      this.scene.dialog.show('GUARD', 'A dónde vas, vuelve!', [GUARD_SPRITES.FRONT]);
    } else {
      this.scene.dialog.show('GUARD', 'A dónde van, vengan aquí!', [GUARD_SPRITES.FRONT, GUARD_SPRITES.FRONT]);
    }

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
// MENU SCENE
// =============================================================================
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.SKY);
    this.cameras.main.setZoom(CONF.SCALE);
    this.cameras.main.centerOn(CONF.GAME_WIDTH / 2, CONF.GAME_HEIGHT / 2);

    this.bg = this.add.graphics().setDepth(0);

    // Grass layer behind buildings
    this.grassGfx = this.add.graphics().setDepth(0.9);

    // Create separate graphics for each building layer
    this.farBuildingsGfx = this.add.graphics().setDepth(1);    // P[3] - farthest
    this.midBuildingsGfx = this.add.graphics().setDepth(1.1);  // P[4] - middle
    this.nearBuildingsGfx = this.add.graphics().setDepth(1.2); // P[5] - closest

    this.cloudsGfx = this.add.graphics().setDepth(2);

    this.clouds = [];
    this.obstacles = [];
    this.obstacleTimer = 0;
    this.cameraTargetY = CONF.GAME_HEIGHT / 2;

    this.drawMountains();
    this.generateBuildings();
    this.generateClouds();

    const camWidth = this.cameras.main.width;
    const camHeight = this.cameras.main.height;

    this.titleText = this.add.text(
      400,
      260,
      'LATE TO THE\nHACKATHON',
      {
        font: "bold 24px arial",
        color: '#000',
        backgroundColor: '#f7bb1b',
        padding: {
          left: 100, // 100px left padding
          right: 100, // 100px right padding
          top: 5, // 5px top padding
          bottom: 5 // 5px bottom padding
        }
      }
    ).setOrigin(0.5).setDepth(9).setScrollFactor(0);

    this.subtitleText = this.add.text(
      400,
      310,
      '🍌 Platanus Hack 2025 Edition 🍌',
      {
        fontFamily: 'arial',
        fontSize: 13,
        color: 1,
      }
    ).setOrigin(0.5).setDepth(9).setScrollFactor(0);

    this.promptText = this.add.text(
      400,
      370,
      'Press any button',
      {
        fontFamily: 'monospace',
        fontSize: 14,
        color: 1,
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
    this.time.delayedCall(200, () => {
      this.scene.start('CharacterSelection');
    });
  }

  generateClouds() {
    const cloudCount = 6;
    for (let i = 0; i < cloudCount; i++) {
      this.clouds.push({
        x: Phaser.Math.Between(0, CONF.GAME_WIDTH),
        y: Phaser.Math.Between(20, 90),
        w: Phaser.Math.Between(32, 64),
        h: Phaser.Math.Between(12, 20),
        speed: Phaser.Math.FloatBetween(6, 12)
      });
    }
  }

  drawMountains() {
    this.bg.clear();
    const baseY = CONF.GAME_HEIGHT - 40;
    const count = 8;
    for (let i = 0; i < count; i++) {
      const peakX = (i / (count - 1)) * CONF.GAME_WIDTH + Phaser.Math.Between(-20, 20);
      const peakY = Phaser.Math.Between(baseY - 65, baseY - 35) - 15;
      const left = peakX - Phaser.Math.Between(45, 75);
      const right = peakX + Phaser.Math.Between(45, 75);

      this.bg.fillStyle(P[5], 0.9);
      this.bg.fillTriangle(left, baseY, peakX, peakY, right, baseY);

      this.bg.fillStyle(P[6], 1);
      this.bg.fillTriangle(peakX - 15, peakY + 12, peakX, peakY, peakX + 15, peakY + 12);
    }
  }

  generateBuildings() {
    this.buildings = [];

    // Generate buildings in multiple layers (depths) with different colors
    // Array format: [color, depth, baseY, count, minW, maxW, minH, maxH]
    const layers = [
      [P[5], 1, CONF.GAME_HEIGHT, 20, 25, 30, 50, 90], // Closest (largest)
      [P[4], 2, CONF.GAME_HEIGHT, 24, 20, 25, 35, 80], // Middle
      [P[3], 3, CONF.GAME_HEIGHT, 30, 10, 15, 25, 50]  // Farthest (smallest)
    ];

    layers.forEach(layer => {
      let x = -50;
      for (let i = 0; i < layer[3]; i++) { // count
        const width = Phaser.Math.Between(layer[4], layer[5]); // minW, maxW
        const height = Phaser.Math.Between(layer[6], layer[7]); // minH, maxH
        this.buildings.push({
          x,
          w: width,
          h: height,
          color: layer[0], // color
          depth: layer[1], // depth
          baseY: layer[2]  // baseY
        });
        x += width + Phaser.Math.Between(1, 2 * i);
      }
    });

    this.drawBuildings();
  }

  drawBuildings() {
    // Clear all building and grass graphics
    this.grassGfx.clear();
    this.farBuildingsGfx.clear();
    this.midBuildingsGfx.clear();
    this.nearBuildingsGfx.clear();

    // Draw grass behind all buildings
    this.grassGfx.fillStyle(P[16], 1); // Grass color P[16]
    this.grassGfx.fillRect(0, CONF.GAME_HEIGHT - 45, CONF.GAME_WIDTH, 45);

    // Group buildings by depth
    const farBuildings = this.buildings.filter(b => b.depth === 3);
    const midBuildings = this.buildings.filter(b => b.depth === 2);
    const nearBuildings = this.buildings.filter(b => b.depth === 1);

    // Draw far buildings (P[3])
    farBuildings.forEach(building => {
      this.farBuildingsGfx.fillStyle(building.color, 0.75);
      this.farBuildingsGfx.fillRect(building.x, building.baseY - building.h, building.w, building.h);
      this.farBuildingsGfx.lineStyle(1, 0x000000, 0.1);
      this.farBuildingsGfx.strokeRect(building.x, building.baseY - building.h, building.w, building.h);
    });

    // Draw mid buildings (P[4])
    midBuildings.forEach(building => {
      this.midBuildingsGfx.fillStyle(building.color, 0.85);
      this.midBuildingsGfx.fillRect(building.x, building.baseY - building.h, building.w, building.h);
      this.midBuildingsGfx.lineStyle(1, 0x000000, 0.15);
      this.midBuildingsGfx.strokeRect(building.x, building.baseY - building.h, building.w, building.h);
    });

    // Draw near buildings (P[5])
    nearBuildings.forEach(building => {
      this.nearBuildingsGfx.fillStyle(building.color, 0.95);
      this.nearBuildingsGfx.fillRect(building.x, building.baseY - building.h, building.w, building.h);
      this.nearBuildingsGfx.lineStyle(1, 0x000000, 0.2);
      this.nearBuildingsGfx.strokeRect(building.x, building.baseY - building.h, building.w, building.h);
    });
  }

  updateClouds(delta) {
    this.cloudsGfx.clear();
    this.clouds.forEach(cloud => {
      cloud.x += (cloud.speed * delta) / 1000;
      if (cloud.x - cloud.w > CONF.GAME_WIDTH) {
        cloud.x = -cloud.w;
        cloud.y = Phaser.Math.Between(20, 90);
        cloud.speed = Phaser.Math.FloatBetween(6, 12);
      }
      this.cloudsGfx.fillStyle(0xffffff, 0.82);
      this.cloudsGfx.fillEllipse(cloud.x, cloud.y, cloud.w, cloud.h);
      this.cloudsGfx.fillEllipse(cloud.x + cloud.w * 0.35, cloud.y + 3, cloud.w * 0.65, cloud.h * 0.85);
      this.cloudsGfx.fillEllipse(cloud.x - cloud.w * 0.35, cloud.y + 4, cloud.w * 0.6, cloud.h * 0.75);
    });
  }

  spawnObstacle() {
    const types = Object.values(OBSTACLE_TYPES);
    const type = Phaser.Utils.Array.GetRandom(types);
    const spawnX = Phaser.Math.Between(40, CONF.GAME_WIDTH - 40);
    const obstacle = new Obstacle(this, spawnX, -50, type);
    this.obstacles.push(obstacle);
  }

  update(time, delta) {
    this.promptTimer += delta;
    this.promptText.setAlpha(0.6 + Math.sin(this.promptTimer / 450) * 0.4);

    this.updateClouds(delta);

    this.obstacleTimer += delta;
    if (this.obstacleTimer >= CONF.OBSTACLE_SPAWN_INTERVAL) {
      this.obstacleTimer = 0;
      this.spawnObstacle();
    }

    this.obstacles = this.obstacles.filter(o => o.active);
    this.obstacles.forEach(o => o.update(delta));
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
    // this.cameras.main.setBackgroundColor(0x000000);
    this.cameras.main.setZoom(CONF.SCALE);
    this.trans = false; // transitioning?

    // Center camera on the game world
    this.cameras.main.centerOn(CONF.GAME_WIDTH / 2, CONF.GAME_HEIGHT / 2);

    // Player selection state
    this.playerSelections = [
      { join: true, selIdx: 0, confirm: false, c: null },  // P1
      { join: false, selIdx: 3, confirm: false, c: null }  // P2 c = character
    ];

    // Input state with debouncing
    this.inputState = {
      p1: { u: false, d: false, l: false, r: false, any: false, act: false },
      p2: { u: false, d: false, l: false, r: false, any: false, act: false }
    };
    this.moveTimers = [0, 0];
    this.buttonTimers = [0, 0];
    this.lastMoveTime = [0, 0];
    this.lastButtonTime = [0, 0];

    // Transition state
    this.isTransitioning = false;

    // Graphics
    this.graphics = this.add.graphics();
    this.p1PreviewGraphics = this.add.graphics();
    this.p2PreviewGraphics = this.add.graphics();

    // Create text objects once (reuse them)
    this.createTextObjects();

    // Setup keyboard input using arcade mapping
    this.setupInput();
  }

  setupInput() {
    this.input.keyboard.on('keydown', (event) => {
      const key = KBD_TO_ARC[event.key] || event.key;
      this.handleInput(key, true);
    });

    this.input.keyboard.on('keyup', (event) => {
      const key = KBD_TO_ARC[event.key] || event.key;
      this.handleInput(key, false);
    });
  }

  createTextObjects() {
    // Slot indicator texts (8 slots)
    this.slotTexts = [];
    for (let i = 0; i < 8; i++) {
      this.slotTexts.push({
        p1: this.add.text(0, 0, 'P1', { fontSize: '8px' }).setVisible(false),
        p2: this.add.text(0, 0, 'P2', { fontSize: '8px' }).setVisible(false)
      });
    }

    // Player preview texts
    this.p1TitleText = this.add.text(0, 0, 'Player 1', { fontSize: '12px', color: '#0000ff' });
    this.p2TitleText = this.add.text(0, 0, 'Player 2', { fontSize: '12px', color: '#ff0000' });

    this.p2JoinText = this.add.text(0, 0, 'Press\nSTART\nto join', { fontSize: '10px', color: '#888', align: 'center' }).setVisible(false);

    this.p1NameText = this.add.text(0, 0, '', { fontSize: '10px' }).setOrigin(.5, .5);
    this.p2NameText = this.add.text(0, 0, '', { fontSize: '10px' }).setOrigin(.5, .5);

    this.p1ConfirmedText = this.add.text(0, 0, '✓ READY', { fontSize: '12px', color: '#0f0' }).setVisible(false);
    this.p2ConfirmedText = this.add.text(0, 0, '✓ READY', { fontSize: '12px', color: '#0f0' }).setVisible(false);
  }

  handleInput(key, isDown) {
    // Player 1 directional controls
    if (key === 'P1U') this.inputState.p1.u = isDown;
    else if (key === 'P1D') this.inputState.p1.d = isDown;
    else if (key === 'P1L') this.inputState.p1.l = isDown;
    else if (key === 'P1R') this.inputState.p1.r = isDown;

    const any1 = key.includes('1');
    const any2 = key.includes('2');

    // Player 1 action buttons (any button except joystick for ready confirmation)
    if (isDown && any1 && !['P1U', 'P1D', 'P1L', 'P1R'].includes(key)) {
      this.inputState.p1.act = true;
    }

    // Player 1 any button (including joystick for joining - though P1 auto-joins)
    if (any1) {
      this.inputState.p1.any = isDown;
    }

    // Player 2 directional controls
    if (key === 'P2U') this.inputState.p2.u = isDown;
    else if (key === 'P2D') this.inputState.p2.d = isDown;
    else if (key === 'P2L') this.inputState.p2.l = isDown;
    else if (key === 'P2R') this.inputState.p2.r = isDown;

    // Player 2 action buttons (any button except joystick for ready confirmation)
    if (isDown && any2 && !['P2U', 'P2D', 'P2L', 'P2R'].includes(key)) {
      this.inputState.p2.act = true;
    }

    // Player 2 any button (including joystick for joining)
    if (any2) {
      this.inputState.p2.any = isDown;
    }
  }

  update(time, delta) {
    // Handle selector movement and confirmation
    for (let i = 0; i < 2; i++) {
      const selection = this.playerSelections[i];
      const input = i === 0 ? this.inputState.p1 : this.inputState.p2;

      if (!selection.join) continue;

      // Movement (with better debouncing using time)
      if (!selection.confirm && (time - this.lastMoveTime[i]) >= 150) {
        const col = selection.selIdx % 4;
        const row = Math.floor(selection.selIdx / 4);
        let moved = false;

        if (input.u && row > 0) { selection.selIdx -= 4; moved = true; }
        else if (input.d && row < 1) { selection.selIdx += 4; moved = true; }
        else if (input.l && col > 0) { selection.selIdx -= 1; moved = true; }
        else if (input.r && col < 3) { selection.selIdx += 1; moved = true; }

        if (moved) this.lastMoveTime[i] = time;
      }

      // Confirmation toggle (with better debouncing using time)
      if (input.act && (time - this.lastButtonTime[i]) >= 250) {
        selection.confirm = !selection.confirm;
        selection.c = selection.confirm ? CHARACTERS[selection.selIdx] : null;
        input.act = false;
        this.lastButtonTime[i] = time;
      }
    }

    // Handle P2 join (any button including joystick)
    if (!this.playerSelections[1].join && this.inputState.p2.any) {
      this.playerSelections[1].join = true;
      this.inputState.p2.any = false;
      this.inputState.p2.act = false; // Also clear action button to prevent immediate confirmation
      this.lastButtonTime[1] = time;
    }

    // Check if ready to start (all joined players must confirm)
    const joinedPlayers = this.playerSelections.filter(p => p.join);
    const allJoinedConfirmed = joinedPlayers.every(p => p.confirm);

    if (joinedPlayers.length > 0 && allJoinedConfirmed && !this.isTransitioning) {
      this.isTransitioning = true;

      // Wait 1 second before transition
      this.time.delayedCall(1000, () => {
        this.scene.start('GameScene', {
          p1Character: this.playerSelections[0].c,
          p2Character: this.playerSelections[1].join ? this.playerSelections[1].c : null
    });
  });
    }

    // Render only once per frame
    this.renderUI();
  }

  renderUI() {
    this.graphics.clear();
    this.p1PreviewGraphics.clear();
    this.p2PreviewGraphics.clear();

    // Hide all slot texts first
    this.slotTexts.forEach(slot => {
      slot.p1.setVisible(false);
      slot.p2.setVisible(false);
    });

    // Draw character slots grid
    this.drawCharacterGrid();

    // Draw player previews
    this.drawPlayerPreview(0, 11, 20);
    this.drawPlayerPreview(1, CONF.GAME_WIDTH - 83, 20);
  }

  drawCharacterGrid() {
    const slotSize = 30;
    const gap = 5;
    const gridW = 4 * (slotSize + gap) - gap;
    const startX = (CONF.GAME_WIDTH - gridW) / 2;
    const startY = CONF.GAME_HEIGHT - 105;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const idx = row * 4 + col;
        const x = startX + col * (slotSize + gap);
        const y = startY + row * (slotSize + gap);

        const p1Hover = this.playerSelections[0].join && this.playerSelections[0].selIdx === idx;
        const p2Hover = this.playerSelections[1].join && this.playerSelections[1].selIdx === idx;

        // Background
        this.graphics.fillStyle(idx < CHARACTERS.length ? 0x333333 : 0x000000, 1);
        this.graphics.fillRect(x, y, slotSize, slotSize);

        // Border
        if (p1Hover && p2Hover) {
          // Left half blue border
          this.graphics.fillStyle(0x0000ff, 1);
          this.graphics.fillRect(x, y, slotSize / 2, 2); // top
          this.graphics.fillRect(x, y, 2, slotSize); // left
          this.graphics.fillRect(x, y + slotSize - 2, slotSize / 2, 2); // bottom

          // Right half red border
          this.graphics.fillStyle(0xff0000, 1);
          this.graphics.fillRect(x + slotSize / 2, y, slotSize / 2, 2); // top
          this.graphics.fillRect(x + slotSize - 2, y, 2, slotSize); // right
          this.graphics.fillRect(x + slotSize / 2, y + slotSize - 2, slotSize / 2, 2); // bottom
        } else if (p1Hover) {
          this.graphics.lineStyle(2, 0x0000ff, 1);
          this.graphics.strokeRect(x, y, slotSize, slotSize);
        } else if (p2Hover) {
          this.graphics.lineStyle(2, 0xff0000, 1);
          this.graphics.strokeRect(x, y, slotSize, slotSize);
        } else {
          this.graphics.lineStyle(1, 0x555555, 1);
          this.graphics.strokeRect(x, y, slotSize, slotSize);
        }

        // Draw character (top half)
        if (idx < CHARACTERS.length) {
          this.drawCharacterSlot(CHARACTERS[idx], x - 15, y - 4, slotSize);
        }

        // P1/P2 indicators (only show when hovering)
        if (p1Hover) {
          this.graphics.fillStyle(0x0000ff, 1);
          this.graphics.fillRect(x + 1, y + 1, 10, 8);
          this.slotTexts[idx].p1.setPosition(x + 2, y + 1).setVisible(true);
        }
        if (p2Hover) {
          this.graphics.fillStyle(0xff0000, 1);
          this.graphics.fillRect(x + slotSize - 11, y + 1, 10, 8);
          this.slotTexts[idx].p2.setPosition(x + slotSize - 10, y + 1).setVisible(true);
        }
      }
    }
  }

  drawCharacterSlot(char, x, y, size) {
    const sprite = char.sprites.FRONT;
    if (!sprite || sprite.length === 0) return;

    const halfH = Math.floor(sprite.length / 2);
    const scale = (size * 1.8) / sprite[0].length;

    for (let r = 0; r < halfH; r++) {
      for (let c = 0; c < sprite[0].length; c++) {
        const code = sprite[r][c];
        if (code && code !== '.') {
          const color = COLOR_MAP[code];
          if (color !== null && color !== undefined) {
            this.graphics.fillStyle(color, 1);
            this.graphics.fillRect(x + c * scale + size * 0.1, y + r * scale + size * 0.2, scale, scale);
          }
        }
      }
    }
  }

  drawPlayerPreview(pIdx, x, y) {
    const sel = this.playerSelections[pIdx];
    const g = pIdx === 0 ? this.p1PreviewGraphics : this.p2PreviewGraphics;

    // Update title text position
    const titleText = pIdx === 0 ? this.p1TitleText : this.p2TitleText;
    titleText.setPosition(x + 5, y);

    // Show/hide join text
    const joinText = this.p2JoinText;
    if (!sel.join) {
      joinText.setPosition(x + 13, y + 55).setVisible(true);

      // Hide other texts
      const nameText = pIdx === 0 ? this.p1NameText : this.p2NameText;
      const confirmedText = pIdx === 0 ? this.p1ConfirmedText : this.p2ConfirmedText;
      nameText.setVisible(false);
      confirmedText.setVisible(false);
      return;
    }

    joinText.setVisible(false);

    // Preview sprite
    const char = CHARACTERS[sel.selIdx];
    const sprite = char.sprites.FRONT;
    if (sprite && sprite.length > 0) {
      const targetH = 90;
      const scale = targetH / sprite.length * 1.5;

      for (let r = 0; r < sprite.length; r++) {
        for (let c = 0; c < sprite[0].length; c++) {
          const code = sprite[r][c];
          if (code && code !== '.') {
            const col = COLOR_MAP[code];
            if (col !== null && col !== undefined) {
              g.fillStyle(col, 1);
              g.fillRect(x + c * scale - 35, y + 25 + r * scale, scale, scale);
            }
          }
        }
      }
    }

    // Update name text
    const nameText = pIdx === 0 ? this.p1NameText : this.p2NameText;
    nameText.setText(char.name).setPosition(x + 35, y + 175).setVisible(true);

    // Update confirmation status
    const confirmedText = pIdx === 0 ? this.p1ConfirmedText : this.p2ConfirmedText;
    if (sel.confirm) {
      confirmedText.setPosition(x, y + 125).setVisible(true);
    } else {
      confirmedText.setVisible(false);
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
    // Receive character selections
    this.selectedCharacters = {
      p1: data.p1Character || CHARACTERS[0],
      p2: data.p2Character // null if 1 player mode
    };

    // Check if we're in 1 player mode
    this.is1PlayerMode = !this.selectedCharacters.p2;
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
    // Create players with selected characters from character selection scene
    this.players = [
      new Player(this, 1, this.is1PlayerMode ? 9.5 : 9, 0, this.selectedCharacters.p1)
    ];

    // Only create player 2 if in 2 player mode
    if (!this.is1PlayerMode) {
      this.players.push(new Player(this, 2, 10.5, 0, this.selectedCharacters.p2));
    }

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
    const groundY = CONF.GAME_HEIGHT;
    const maxCameraY = groundY - (CONF.GAME_HEIGHT / 2);
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
    this.cameras.main.setBackgroundColor(COLORS.SKY);
    this.cameras.main.setZoom(CONF.SCALE);

    // Position camera at floor level at start
    const camX = CONF.GAME_WIDTH / 2;
    this.cameras.main.centerOn(camX, this.cameraTargetY);
  }

  setupInput() {
    this.input.keyboard.on('keydown', (event) => {
      const key = KBD_TO_ARC[event.key] || event.key;
      this.handleInput(key, true);
    });

    this.input.keyboard.on('keyup', (event) => {
      const key = KBD_TO_ARC[event.key] || event.key;
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
    // Player 1 Lives
    this.p1LivesText = this.add.text(10, 10, 'P1: ♥♥♥', {
      fontSize: '16px',
    fontFamily: 'Arial',
    color: '#00ff00'
    });
    this.p1LivesText.setScrollFactor(0);
    this.p1LivesText.setDepth(100);

    // Player 2 Lives (only in 2 player mode)
    this.p2LivesText = this.add.text(CONF.GAME_WIDTH - 10, 10, 'P2: ♥♥♥', {
      fontSize: '16px',
    fontFamily: 'Arial',
      color: '#ff00ff',
      align: 'right'
    });
    this.p2LivesText.setOrigin(1, 0);
    this.p2LivesText.setScrollFactor(0);
    this.p2LivesText.setDepth(100);

    // Hide P2 lives in 1 player mode
    if (this.is1PlayerMode) {
      this.p2LivesText.setVisible(false);
    }

    // Floor indicator
    this.floorText = this.add.text(CONF.GAME_WIDTH / 2, 10, 'Floor: 0 / 90', {
      fontSize: '14px',
    fontFamily: 'Arial',
      color: P[6],
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

    // Check player-player collisions (blocking each other while climbing) - only in 2 player mode
    if (!this.is1PlayerMode && this.players[0].checkPlayerCollision(this.players[1])) {
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

      // Only spawn obstacles if highest player has reached the start row
      const highestPlayer = alivePlayers.reduce((highest, player) =>
        player.row > highest.row ? player : highest
      );

      if (highestPlayer.row < CONF.OBSTACLE_START_ROW) {
        // Players haven't reached obstacle start row yet
        return;
      }

      // Determine target players
      let targetPlayers = [];

      if (alivePlayers.length === 2) {
        // Both players alive - 30% chance to target both
        if (Math.random() < CONF.OBSTACLE_DUAL_CHANCE) {
          targetPlayers = alivePlayers;
          console.log('Dual obstacle spawn - targeting both players!');
        } else {
          targetPlayers = [Phaser.Utils.Array.GetRandom(alivePlayers)];
        }
      } else {
        // Only one player alive - target them
        targetPlayers = [alivePlayers[0]];
      }

      // Spawn one obstacle per target player
      const types = Object.values(OBSTACLE_TYPES);
      const cameraTopY = this.cameraTargetY - (CONF.GAME_HEIGHT / 2);
      const spawnY = cameraTopY - 50; // Spawn 50px above visible area

      targetPlayers.forEach(targetPlayer => {
        const type = Phaser.Utils.Array.GetRandom(types);
        const spawnX = targetPlayer.x;

        console.log(`Spawning ${type.name} at (${spawnX}, ${spawnY}) targeting Player ${targetPlayer.playerNum}`);

        const obstacle = new Obstacle(this, spawnX, spawnY, type);
        this.obstacles.push(obstacle);
      });

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
        (player1.x - ((CONF.GAME_WIDTH - CONF.BUILDING_WIDTH) / 2)) /
        (CONF.BUILDING_WIDTH / (CONF.BUILDING_ACTUAL_COLUMNS - 1)),
        0,
        CONF.BUILDING_ACTUAL_COLUMNS - 1
      );

      player2.x -= direction * pushAmount;
      player2.targetX = player2.x;
      player2.col = Phaser.Math.Clamp(
        (player2.x - ((CONF.GAME_WIDTH - CONF.BUILDING_WIDTH) / 2)) /
        (CONF.BUILDING_WIDTH / (CONF.BUILDING_ACTUAL_COLUMNS - 1)),
        0,
        CONF.BUILDING_ACTUAL_COLUMNS - 1
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

        // Only update player 2 input in 2 player mode
        if (!this.is1PlayerMode) {
          this.players[1].setInput(
            this.inputState.p2.up,
            this.inputState.p2.down,
            this.inputState.p2.left,
            this.inputState.p2.right
          );
        }

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
        if (!this.is1PlayerMode) {
          this.players[1].setInput(false, false, false, false);
        }
        // Guard freezes (don't update)
        if (this.guard) {
          this.guard.draw(); // Just redraw in current state
        }
      } else {
        // During cinematic, block all input
        this.guard.draw();
        this.players[0].setInput(false, false, false, false);
        if (!this.is1PlayerMode) {
          this.players[1].setInput(false, false, false, false);
        }
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
          if (this.obstacleSpawnTimer >= CONF.OBSTACLE_SPAWN_INTERVAL) {
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
        const targetCameraY = highestPlayer.getWorldY() - CONF.CAMERA_OFFSET;

        // Floor limit - camera shouldn't show anything below ground
        // Ground is at Y = GAME_HEIGHT + 20 = 260
        // Camera shows GAME_HEIGHT/2 = 120 pixels above and below center
        // So camera center max = 260 - 120 = 140 (camera bottom edge at 260)
        const groundY = CONF.GAME_HEIGHT + 25;
        const maxCameraY = groundY - (CONF.GAME_HEIGHT / 2);

        // Clamp camera to not go below floor
        const clampedTargetY = Math.min(targetCameraY, maxCameraY);

        // Smoothly interpolate camera target
        this.cameraTargetY = Phaser.Math.Linear(
          this.cameraTargetY,
          clampedTargetY,
          CONF.CAMERA_SMOOTH
        );
      }
      // If no alive players, camera stays where it is

      // Update camera to center on target Y
      this.cameras.main.centerOn(CONF.GAME_WIDTH / 2, this.cameraTargetY);
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
        this.dialog.render(delta);
      }
    } catch (error) {
      console.error('Error rendering dialog:', error);
    }
  }

  drawBuilding() {
    this.buildingGraphics.clear();

    // Building boundaries
    const buildingStartX = (CONF.GAME_WIDTH - CONF.BUILDING_WIDTH) / 2;
    const buildingEndX = buildingStartX + CONF.BUILDING_WIDTH;

    // Calculate building height - extend well above and below visible area
    const topY = -1500; // High above
    const bottomY = CONF.GAME_HEIGHT + 100; // Below start

    // Draw building background - glass blue with gradient effect
    this.buildingGraphics.fillStyle(COLORS.GLASSB, 1);
    this.buildingGraphics.fillRect(
      buildingStartX,
      topY,
      CONF.BUILDING_WIDTH,
      bottomY - topY
    );

    // Add glass texture overlay (lighter blue streaks)
    for (let i = 0; i < 15; i++) {
      const offsetX = buildingStartX + (i * CONF.BUILDING_WIDTH / 15);
      this.buildingGraphics.fillStyle(COLORS.GLASSSTR, 0.3);
      this.buildingGraphics.fillRect(offsetX, topY, 2, bottomY - topY);
    }

    // Draw windows/rows
    const colWidth = CONF.BUILDING_WIDTH / CONF.BUILDING_VISUAL_COLUMNS;

    for (let row = 0; row < CONF.TOTAL_ROWS; row++) {
      const y = this.players[0].rowToY(row);

      // Draw horizontal row line (metallic frame)
      this.buildingGraphics.lineStyle(2, COLORS.METAL1, 0.8);
      this.buildingGraphics.lineBetween(buildingStartX, y, buildingEndX, y);

      // Draw glass windows with reflections
      for (let col = 0; col < CONF.BUILDING_VISUAL_COLUMNS; col++) {
        const x = buildingStartX + col * colWidth + colWidth / 2;

        // Glass window - alternating blue tones for depth
        const baseColor = (row + col) % 2 === 0 ? COLORS.GLASSW1 : COLORS.GLASSW2;
        this.buildingGraphics.fillStyle(baseColor, 0.7);
        this.buildingGraphics.fillRect(
          x - 10,
          y - CONF.ROW_HEIGHT / 2 - 4,
          20,
          8
        );

        // Glass reflection/highlight (lighter area)
        this.buildingGraphics.fillStyle(COLORS.GLASSREF, 0.4);
        this.buildingGraphics.fillRect(
          x - 8,
          y - CONF.ROW_HEIGHT / 2 - 3,
          12,
          2
        );
      }
    }

    // Draw vertical column lines (metallic structure)
    for (let col = 0; col <= CONF.BUILDING_VISUAL_COLUMNS; col++) {
      const x = buildingStartX + col * colWidth;
      this.buildingGraphics.lineStyle(3, COLORS.METAL1, 0.9);
      this.buildingGraphics.lineBetween(x, topY, x, bottomY);

      // Add highlight for metallic effect
      this.buildingGraphics.lineStyle(1, COLORS.METAL2, 0.6);
      this.buildingGraphics.lineBetween(x - 1, topY, x - 1, bottomY);
    }

    // Draw ground/sidewalk at the bottom with subtle concrete texture
    const groundY = CONF.GAME_HEIGHT - 10;
    const groundHeight = 50;

    // Base concrete color
    this.buildingGraphics.fillStyle(COLORS.BASE1, 1);
    this.buildingGraphics.fillRect(0, groundY, CONF.GAME_WIDTH, groundHeight);

    // Add subtle concrete texture (static pattern using position-based seed)
    for (let x = 0; x < CONF.GAME_WIDTH; x += 8) {
      for (let y = 0; y < groundHeight; y += 8) {
        // Use position as seed for consistent pattern
        const seed = (x * 7 + y * 13) % 100;
        if (seed > 85) {
          // Darker spots (fewer and more subtle)
          this.buildingGraphics.fillStyle(COLORS.BASE2, 0.4);
          this.buildingGraphics.fillRect(x, groundY + y, 6, 6);
        } else if (seed < 15) {
          // Lighter spots (fewer and more subtle)
          this.buildingGraphics.fillStyle(COLORS.BASE3, 0.4);
          this.buildingGraphics.fillRect(x, groundY + y, 6, 6);
        }
      }
    }

    // Add horizontal lines for sidewalk panels
    this.buildingGraphics.lineStyle(2, COLORS.PANEL_LINE, 0.6);
    for (let i = 1; i < 5; i++) {
      const crackY = groundY + (i * groundHeight / 5);
      this.buildingGraphics.lineBetween(0, crackY, CONF.GAME_WIDTH, crackY);
    }

    // Add vertical lines for panel divisions
    this.buildingGraphics.lineStyle(2, COLORS.PANEL_LINE, 0.6);
    for (let i = 0; i < CONF.GAME_WIDTH; i += 40) {
      this.buildingGraphics.lineBetween(i, groundY, i, groundY + groundHeight);
    }

    // Draw goal floor indicator
    const goalY = this.players[0].rowToY(CONF.GOAL_FLOOR);
    this.buildingGraphics.fillStyle(COLORS.GOAL_MARKER, 0.3);
    this.buildingGraphics.fillRect(
      buildingStartX,
      goalY - CONF.ROW_HEIGHT,
      CONF.BUILDING_WIDTH,
      CONF.ROW_HEIGHT * 2
    );

    this.buildingGraphics.lineStyle(3, COLORS.GOAL_MARKER, 1);
    this.buildingGraphics.lineBetween(buildingStartX, goalY, buildingEndX, goalY);
  }

  updateUI() {
    // Update lives display
    const p1Hearts = '♥'.repeat(this.players[0].lives);
    this.p1LivesText.setText(`P1: ${p1Hearts}`);

    // Only update P2 lives in 2 player mode
    if (!this.is1PlayerMode) {
      const p2Hearts = '♥'.repeat(this.players[1].lives);
      this.p2LivesText.setText(`P2: ${p2Hearts}`);
    }

    // Update floor indicator
    const maxFloor = this.is1PlayerMode
      ? this.players[0].row
      : Math.max(this.players[0].row, this.players[1].row);
    this.floorText.setText(`Floor: ${maxFloor} / ${CONF.GOAL_FLOOR}`);
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
