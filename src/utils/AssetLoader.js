/**
 * Utility to preload game assets (images and audio)
 */

export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
  });
};

export const preloadAudio = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.oncanplaythrough = () => resolve(url);
        audio.oncanplay = () => resolve(url);
        audio.onerror = () => reject(new Error(`Audio object error: ${url}`));
        
        audio.src = objectUrl;
        
        // Fallback for safety
        setTimeout(() => resolve(url), 2000);
    });
  } catch (err) {
    // If fetch fails (network error, etc), fallback to old method or just reject
    console.warn(`Audio fetch failed for ${url}, trying direct load...`);
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.src = url;
        audio.oncanplaythrough = () => resolve(url);
        audio.oncanplay = () => resolve(url);
        audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
        setTimeout(() => resolve(url), 2000);
    });
  }
};

export const preloadAssets = async (assets, onProgress) => {
  const total = assets.length;
  let loaded = 0;

  // Use a sequential approach for more fluid progress updates if needed,
  // or stick to parallel but with staggered reporting.
  // Sequential is usually better for a "smooth" bar feel.
  for (const asset of assets) {
    try {
      if (asset.type === 'image') {
        await preloadImage(asset.url);
      } else if (asset.type === 'audio') {
        await preloadAudio(asset.url);
      }
    } catch (error) {
      console.warn(error.message);
    }
    loaded++;
    if (onProgress) onProgress((loaded / total) * 100);
    // Small artificial delay so the user can actually see the bar moving
    await new Promise(r => setTimeout(r, 120));
  }
};
