import { isWalkable } from './collisionMap';

export function movePlayer(x, y, dx, dy) {
  const nextX = x + dx;
  const nextY = y + dy;

  // Define the collision point. 
  // User recommended: "Punto de colisión (pies del personaje)"
  // Adjust offset based on your sprite's anchor/pivot.
  // Assuming (x, y) is the center-bottom of the character or similar.
  // User example had `footY = Math.floor(nextY + 8)`. 
  // I'll stick to a reasonable foot offset. If (x,y) is center, foot is y + something.
  // If (x,y) is already feet, then offset is small.
  // Based on World.jsx: sprite anchor is {x: 0.5, y: 1}, so (x,y) corresponds to the bottom center of the sprite.
  
  // Check collision at the "feet" of the character
  // Based on PLAYER_CONFIG (Width:4, Height:6)
  // Sprite anchor is bottom-center.
  // We want to check the center X and the bottom Y.
  const footX = Math.floor(nextX + 2); // Center x (assuming width ~4)
  const footY = Math.floor(nextY + 2); // Bottom y (adjusted for precision)

  // Debug (optional)
  // console.log(`Checking ${footX}, ${footY}`);

  if (isWalkable(footX, footY)) {
    return { x: nextX, y: nextY };
  }
  
  // Slide logic:
  // Check X movement only
  if (dx !== 0) {
      const slideX = Math.floor(nextX + 2);
      const slideY = Math.floor(y + 6);
      if (isWalkable(slideX, slideY)) {
          return { x: nextX, y: y };
      }
  }
  
  // Check Y movement only
  if (dy !== 0) {
      const slideX = Math.floor(x + 2);
      const slideY = Math.floor(nextY + 6);
      if (isWalkable(slideX, slideY)) {
          return { x: x, y: nextY };
      }
  }

  // If blocked completely
  return { x, y };
}
