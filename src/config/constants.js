/**
 * Global Game Configuration
 * Used for physics, dimensions, and balancing.
 */
export const GAME_CONFIG = {
  WIDTH: window.innerWidth,
  HEIGHT: window.innerHeight,
  LOGICAL_WIDTH: 1280, // Base resolution width
  LOGICAL_HEIGHT: 720, // Base resolution height
  GRAVITY: 0.6,    
  JUMP_FORCE: -10, 
  WALK_SPEED: 7,   
  TILE_SIZE: 32,
};

export const PLAYER_CONFIG = {
  WIDTH: 4,     
  HEIGHT: 6,    
  HEALTH: 3,
};
