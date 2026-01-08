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
const generateDeepCavernMap = () => {
  const width = 200;
  const height = 24; 
  const map = Array(height).fill(0).map(() => Array(width).fill(TILE_TYPES.EMPTY));
  map[12][193] = TILE_TYPES.GOAL;
  return map;
};

export const LEVELS = {
  1: {
    map: generateDeepCavernMap(),
    startX: 100,
    startY: 620, 
    groundY: 620,
    onGround: true,
    background: 'background_old.png',
    portal: 'portal_level1.png',
    movingPlatforms: [] 
  },
  2: {
    map: generateDeepCavernMap(),
    startX: 100,
    startY: 400, // Ahora aparece más arriba, en una roca superior
    groundY: 400, // Y camina a esa altura permanentemente
    onGround: true,
    background: 'background.png',
    portal: 'portal_level1.png',
    movingPlatforms: []
  }
};
