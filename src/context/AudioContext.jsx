import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  // Track active music to adjust volume in real-time
  const musicRef = useRef(null);

  const playMusic = (src, loop = true) => {
    if (musicRef.current) {
      musicRef.current.pause();
    }
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = isMuted ? 0 : musicVolume;
    audio.play().catch(e => console.warn("Audio play blocked:", e));
    musicRef.current = audio;
  };

  const stopMusic = () => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current = null;
    }
  };

  const playSfx = (src) => {
    const audio = new Audio(src);
    audio.volume = isMuted ? 0 : sfxVolume;
    audio.play().catch(e => console.warn("SFX play blocked:", e));
  };

  // Update volume of currently playing music when setting changes
  useEffect(() => {
    if (musicRef.current) {
        musicRef.current.volume = isMuted ? 0 : musicVolume;
    }
  }, [musicVolume, isMuted]);

  const value = {
    musicVolume,
    setMusicVolume,
    sfxVolume,
    setSfxVolume,
    isMuted,
    setIsMuted,
    playMusic,
    stopMusic,
    playSfx
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};
