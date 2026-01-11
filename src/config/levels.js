import { GAME_CONFIG } from './constants.js';
import cavernBgAlt from '../assets/images/environment/background_alt.png';
import cavernMap from '../assets/images/environment/cavern_map.png';
import cavernFitted from '../assets/images/environment/cavern_fitted.png';
import portalCavern from '../assets/images/environment/portal_cavern.png';
import cavernBgAltCollision from '../assets/images/environment/background_alt.colision.png';
import cavernFittedCollision from '../assets/images/environment/cavern_fitted.colisiones.png';

export const TILE_TYPES = {
  EMPTY: 0,
  FLOOR: 1,
  PLATFORM: 2,
  WALL: 3,
  SPIKES: 4,
  GOAL: 5
};

// Nivel con Suelo Continuo: Sin obstáculos, solo piso firme que combina con el fondo
// Generador de mapa básico (vacío con portal al final)
const generateCavernMapWithPlatforms = (groundFactor = 0.85) => {
  const width = 80;
  const tileSize = GAME_CONFIG.TILE_SIZE;
  const groundTileY = Math.floor((window.innerHeight * groundFactor) / tileSize);
  const height = Math.max(groundTileY + 5, Math.floor(window.innerHeight / tileSize) + 2);
  
  const map = Array(height).fill(0).map(() => Array(width).fill(TILE_TYPES.EMPTY));
  
  // Continuous ground
  for (let x = 0; x < width; x++) {
    map[groundTileY][x] = TILE_TYPES.WALL;
    for (let y = groundTileY + 1; y < height; y++) {
        map[y][x] = TILE_TYPES.WALL;
    }
  }

  // Add some mystical platforms
  const platformConfigs = [
    { x: 300, y: groundTileY - 4, w: 5 },
    { x: 600, y: groundTileY - 7, w: 4 },
    { x: 1000, y: groundTileY - 5, w: 6 },
    { x: 1400, y: groundTileY - 9, w: 3 },
    { x: 1800, y: groundTileY - 6, w: 10 },
  ];

  platformConfigs.forEach(plat => {
    const tileX = Math.floor(plat.x / tileSize);
    for(let i = 0; i < plat.w; i++) {
        if (map[plat.y] && map[plat.y][tileX + i] !== undefined) {
            map[plat.y][tileX + i] = TILE_TYPES.PLATFORM;
        }
    }
  });
  
  // Goal enabled at the end of the map
  const goalY = Math.max(0, groundTileY - 3);
  if (map[goalY]) map[goalY][width - 8] = TILE_TYPES.GOAL;
  
  return map;
};

export const LEVELS = {
  1: {
    map: generateCavernMapWithPlatforms(0.75),
    startX: 200,
    startY: Math.floor(window.innerHeight * 0.65), // Attempting 65% to find the white zone
    groundY: Math.floor(window.innerHeight * 0.75),
    onGround: true,
    background: cavernBgAlt,
    collisionMap: cavernBgAltCollision,
    portal: portalCavern,
    movingPlatforms: []
  },
  2: {
    map: generateCavernMapWithPlatforms(0.81),
    startX: 400, // Try middle-left area
    startY: Math.floor(window.innerHeight * 0.55), // Mid-height, will be auto-corrected
    groundY: Math.floor(window.innerHeight * 0.81),
    onGround: true,
    background: cavernFitted,
    collisionMap: cavernFittedCollision,
    portal: portalCavern,
    movingPlatforms: []
  },
  3: {
    map: generateCavernMapWithPlatforms(0.85),
    startX: 100,
    startY: Math.floor(window.innerHeight * 0.85) - 40,
    groundY: Math.floor(window.innerHeight * 0.85),
    onGround: true,
    background: cavernMap,
    portal: portalCavern,
    movingPlatforms: []
  }
};
