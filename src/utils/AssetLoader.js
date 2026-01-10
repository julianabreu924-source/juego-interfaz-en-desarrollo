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

export const preloadAudio = (url) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.src = url;
    // canplaythrough suggests the full file is loaded and playable
    audio.oncanplaythrough = () => resolve(url);
    audio.oncanplay = () => resolve(url);
    audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
    
    // Snappier fallback for audio loading
    setTimeout(() => resolve(url), 500); 
  });
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
