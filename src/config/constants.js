/**
 * Global Game Configuration
 * Used for physics, dimensions, and balancing.
 */
export const GAME_CONFIG = {
  WIDTH: 1200,
  HEIGHT: 700,
  GRAVITY: 0.6,    // Slightly lower gravity for "floatier" magic feel
  JUMP_FORCE: -10, // Increased jump power
  WALK_SPEED: 5,   // Faster movement speed
  MAX_FALL_SPEED: 12,
  TILE_SIZE: 32,
  PIXEL_RATIO: 1,
  COLORS: {
    PRIMARY: '#8c52ff',
    SECONDARY: '#ffde59',
    DANGER: '#ff4d4d',
    SUCCESS: '#00e676',
    BACKGROUND: 0x1a1a1a,
  }
};

export const PLAYER_CONFIG = {
  START_X: 100,
  START_Y: 600, 
  WIDTH: 4,     
  HEIGHT: 6,    
  HEALTH: 3,
  GROUND_Y: 620, // Suelo visual de la imagen
};
