const LEVEL_CANVAS_HEIGHT = 576;
const LEVEL_FLOOR_Y = LEVEL_CANVAS_HEIGHT * 0.75;

function aboveFloor(amount)
{
  return LEVEL_FLOOR_Y - amount;
}

function orb(id, x, height)
{
  return {
    id,
    x,
    y: aboveFloor(height)
  };
}

function platform(id, type, x, height, length)
{
  return {
    id,
    type,
    x,
    y: aboveFloor(height),
    length
  };
}

function enemy(x, range, speed)
{
  return {
    x,
    y: aboveFloor(8),
    range,
    speed
  };
}

const LEVELS = [
  {
    id: 'level-1',
    name: 'Neon Approach',
    introText: 'Warm up with forgiving gaps, easy enemy routes, and clean landing spots.',
    worldLength: 4200,
    spawn: { x: 205, y: LEVEL_FLOOR_Y },
    checkpoint: {
      x: 2240,
      y: LEVEL_FLOOR_Y,
      width: 54,
      spawn: { x: 2165, y: LEVEL_FLOOR_Y }
    },
    flagpoleX: 3950,
    scenery: {
      starCount: 80,
      trees: [
        { x: 240, scale: 0.95 },
        { x: 670, scale: 1.1 },
        { x: 1120, scale: 0.9 },
        { x: 1560, scale: 1.05 },
        { x: 1970, scale: 1.0 },
        { x: 2420, scale: 1.15 },
        { x: 2900, scale: 1.0 },
        { x: 3370, scale: 1.08 },
        { x: 3720, scale: 0.92 }
      ],
      mountains: [
        { x: 120, width: 360, height: 250 },
        { x: 910, width: 390, height: 270 },
        { x: 1760, width: 420, height: 295 },
        { x: 2610, width: 370, height: 240 },
        { x: 3370, width: 410, height: 270 }
      ],
      clouds: [
        { x: 160, y: 118, size: 0.9 },
        { x: 550, y: 94, size: 1.2 },
        { x: 960, y: 130, size: 1.0 },
        { x: 1450, y: 84, size: 1.35 },
        { x: 2050, y: 110, size: 1.1 },
        { x: 2570, y: 88, size: 0.98 },
        { x: 3140, y: 108, size: 1.28 },
        { x: 3680, y: 92, size: 1.0 }
      ]
    },
    canyons: [
      { x: 560, width: 110 },
      { x: 1280, width: 145 },
      { x: 2910, width: 165 }
    ],
    collectables: [
      orb('l1-orb-1', 360, 40),
      orb('l1-orb-2', 760, 40),
      orb('l1-orb-3', 980, 110),
      orb('l1-orb-4', 1300, 150),
      orb('l1-orb-5', 1710, 40),
      orb('l1-orb-6', 2140, 70),
      orb('l1-orb-7', 2530, 40),
      orb('l1-orb-8', 3020, 175),
      orb('l1-orb-9', 3460, 40),
      orb('l1-orb-10', 3840, 65)
    ],
    platforms: [
      platform('l1-platform-1', 'static', 900, 70, 160),
      platform('l1-platform-2', 'static', 1210, 120, 150),
      platform('l1-platform-3', 'static', 1385, 165, 110),
      platform('l1-platform-4', 'static', 2090, 90, 140),
      platform('l1-platform-5', 'static', 2860, 135, 130),
      platform('l1-platform-6', 'static', 2995, 195, 120)
    ],
    enemies: [
      enemy(1540, 150, 1.15),
      enemy(2460, 170, 1.2),
      enemy(3320, 180, 1.3)
    ]
  },
  {
    id: 'level-2',
    name: 'Relay Heights',
    introText: 'Climb through stacked rooftops and trust the unstable platforms only for a moment.',
    worldLength: 4800,
    spawn: { x: 205, y: LEVEL_FLOOR_Y },
    checkpoint: {
      x: 2680,
      y: LEVEL_FLOOR_Y,
      width: 54,
      spawn: { x: 2605, y: LEVEL_FLOOR_Y }
    },
    flagpoleX: 4535,
    scenery: {
      starCount: 92,
      trees: [
        { x: 250, scale: 1.0 },
        { x: 720, scale: 1.18 },
        { x: 1180, scale: 0.92 },
        { x: 1640, scale: 1.08 },
        { x: 2140, scale: 1.0 },
        { x: 2580, scale: 1.22 },
        { x: 3090, scale: 1.04 },
        { x: 3550, scale: 1.1 },
        { x: 4020, scale: 0.95 },
        { x: 4380, scale: 1.0 }
      ],
      mountains: [
        { x: 90, width: 380, height: 250 },
        { x: 820, width: 410, height: 285 },
        { x: 1680, width: 460, height: 310 },
        { x: 2560, width: 390, height: 255 },
        { x: 3330, width: 450, height: 295 },
        { x: 4110, width: 390, height: 260 }
      ],
      clouds: [
        { x: 150, y: 120, size: 0.92 },
        { x: 610, y: 102, size: 1.12 },
        { x: 1140, y: 80, size: 1.3 },
        { x: 1680, y: 128, size: 1.0 },
        { x: 2230, y: 90, size: 1.22 },
        { x: 2760, y: 116, size: 1.08 },
        { x: 3260, y: 84, size: 1.34 },
        { x: 3830, y: 104, size: 1.12 },
        { x: 4380, y: 82, size: 1.02 }
      ]
    },
    canyons: [
      { x: 640, width: 150 },
      { x: 1820, width: 165 },
      { x: 3230, width: 150 },
      { x: 3900, width: 175 }
    ],
    collectables: [
      orb('l2-orb-1', 420, 40),
      orb('l2-orb-2', 930, 110),
      orb('l2-orb-3', 1190, 170),
      orb('l2-orb-4', 1510, 225),
      orb('l2-orb-5', 2010, 40),
      orb('l2-orb-6', 2440, 140),
      orb('l2-orb-7', 2875, 190),
      orb('l2-orb-8', 3325, 70),
      orb('l2-orb-9', 3710, 180),
      orb('l2-orb-10', 4320, 95)
    ],
    platforms: [
      platform('l2-platform-1', 'static', 860, 75, 150),
      platform('l2-platform-2', 'crumble', 1030, 120, 120),
      platform('l2-platform-3', 'static', 1160, 175, 120),
      platform('l2-platform-4', 'crumble', 1290, 225, 115),
      platform('l2-platform-5', 'static', 1430, 260, 135),
      platform('l2-platform-6', 'static', 2360, 110, 135),
      platform('l2-platform-7', 'crumble', 2810, 185, 120),
      platform('l2-platform-8', 'static', 3460, 125, 140),
      platform('l2-platform-9', 'crumble', 3650, 190, 120),
      platform('l2-platform-10', 'static', 4230, 145, 145)
    ],
    enemies: [
      enemy(1680, 170, 1.3),
      enemy(2550, 200, 1.35),
      enemy(3400, 180, 1.45),
      enemy(4100, 170, 1.55)
    ]
  },
  {
    id: 'level-3',
    name: 'Final Skyline',
    introText: 'Thread together long jumps, enemy patrols, and collapsing routes to reach the last tower.',
    worldLength: 5400,
    spawn: { x: 205, y: LEVEL_FLOOR_Y },
    checkpoint: {
      x: 3140,
      y: LEVEL_FLOOR_Y,
      width: 54,
      spawn: { x: 3060, y: LEVEL_FLOOR_Y }
    },
    flagpoleX: 5125,
    scenery: {
      starCount: 104,
      trees: [
        { x: 260, scale: 0.98 },
        { x: 760, scale: 1.2 },
        { x: 1250, scale: 0.94 },
        { x: 1790, scale: 1.08 },
        { x: 2310, scale: 1.02 },
        { x: 2810, scale: 1.16 },
        { x: 3360, scale: 1.06 },
        { x: 3920, scale: 1.12 },
        { x: 4470, scale: 0.96 },
        { x: 4970, scale: 1.02 }
      ],
      mountains: [
        { x: 110, width: 390, height: 255 },
        { x: 980, width: 430, height: 290 },
        { x: 1890, width: 470, height: 315 },
        { x: 2870, width: 410, height: 275 },
        { x: 3700, width: 460, height: 305 },
        { x: 4560, width: 430, height: 280 }
      ],
      clouds: [
        { x: 180, y: 116, size: 0.94 },
        { x: 650, y: 86, size: 1.28 },
        { x: 1200, y: 126, size: 1.02 },
        { x: 1760, y: 92, size: 1.18 },
        { x: 2310, y: 76, size: 1.36 },
        { x: 2870, y: 118, size: 1.08 },
        { x: 3440, y: 88, size: 1.24 },
        { x: 4010, y: 128, size: 1.0 },
        { x: 4590, y: 94, size: 1.18 },
        { x: 5090, y: 82, size: 1.06 }
      ]
    },
    canyons: [
      { x: 760, width: 170 },
      { x: 1460, width: 135 },
      { x: 2230, width: 180 },
      { x: 3320, width: 195 },
      { x: 4200, width: 160 }
    ],
    collectables: [
      orb('l3-orb-1', 470, 40),
      orb('l3-orb-2', 1030, 120),
      orb('l3-orb-3', 1235, 180),
      orb('l3-orb-4', 1735, 210),
      orb('l3-orb-5', 2140, 90),
      orb('l3-orb-6', 2690, 165),
      orb('l3-orb-7', 3175, 40),
      orb('l3-orb-8', 3600, 200),
      orb('l3-orb-9', 4045, 140),
      orb('l3-orb-10', 4540, 200),
      orb('l3-orb-11', 5000, 90)
    ],
    platforms: [
      platform('l3-platform-1', 'static', 940, 85, 135),
      platform('l3-platform-2', 'crumble', 1120, 125, 115),
      platform('l3-platform-3', 'static', 1255, 185, 110),
      platform('l3-platform-4', 'crumble', 1570, 215, 120),
      platform('l3-platform-5', 'static', 1705, 255, 130),
      platform('l3-platform-6', 'crumble', 2470, 135, 120),
      platform('l3-platform-7', 'static', 2615, 175, 120),
      platform('l3-platform-8', 'crumble', 3515, 205, 115),
      platform('l3-platform-9', 'static', 3680, 245, 130),
      platform('l3-platform-10', 'crumble', 4400, 150, 125),
      platform('l3-platform-11', 'static', 4565, 205, 125)
    ],
    enemies: [
      enemy(1320, 150, 1.4),
      enemy(2050, 190, 1.55),
      enemy(3000, 220, 1.5),
      enemy(3890, 170, 1.65),
      enemy(4740, 190, 1.7)
    ]
  }
];
