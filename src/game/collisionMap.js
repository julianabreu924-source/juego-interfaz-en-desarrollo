
let canvas;
let ctx;
let width = 0;
let height = 0;

export async function loadCollisionMap(src, targetWidth, targetHeight) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = `${src}?t=${Date.now()}`; // Force cache bust
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      // Use target dimensions if provided, else image dimensions
      width = targetWidth || img.width;
      height = targetHeight || img.height;

      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      ctx = canvas.getContext('2d', { willReadFrequently: true });
      // Draw scaled image to match world coordinates 1:1
      ctx.drawImage(img, 0, 0, width, height);

      console.log(`Collision map loaded. Source: ${img.width}x${img.height}, Canvas: ${width}x${height}`);
      resolve();
    };
    img.onerror = (e) => {
        console.error("Failed to load collision map:", src, e);
        reject(e);
    }
  });
}

export function isWalkable(x, y) {
  if (!ctx) return true;

  if (x < 0 || y < 0 || x >= width || y >= height) {
    // console.log(`Out of bounds: ${x}, ${y} (Map: ${width}x${height})`);
    return false;
  }

  const pixel = ctx.getImageData(x >> 0, y >> 0, 1, 1).data;
  const r = pixel[0];
  const g = pixel[1];
  const b = pixel[2];

  // Debug first few checks
  // if (Math.random() < 0.01) console.log(`Walkable Check: ${x},${y} -> RGB(${r},${g},${b})`);

  return r > 100 && g > 100 && b > 100; // Lower threshold to be safe
}

// BFS / Spiral search for the nearest walkable pixel
export function findNearestWalkablePoint(startX, startY, maxRadius = 400) {
    if (!ctx || !width || !height) return { x: startX, y: startY };

    // Check center first
    if (isWalkable(startX, startY)) return { x: startX, y: startY };

    console.log(`Searching for spawn point near ${startX}, ${startY}...`);

    // Spiral search
    // Optimize: check grid points every 5 pixels to save perf
    const step = 4;
    
    for (let r = step; r < maxRadius; r += step) {
        // Check circle/box perimeter at radius r
        for (let i = -r; i <= r; i += step) {
            // Top and Bottom rows
            if (isWalkable(startX + i, startY - r)) return { x: startX + i, y: startY - r };
            if (isWalkable(startX + i, startY + r)) return { x: startX + i, y: startY + r };
            
            // Left and Right columns
            if (isWalkable(startX - r, startY + i)) return { x: startX - r, y: startY + i };
            if (isWalkable(startX + r, startY + i)) return { x: startX + r, y: startY + i };
        }
    }
    
    console.warn("Could not find ANY walkable ground within radius", maxRadius);
    return { x: startX, y: startY };
}
