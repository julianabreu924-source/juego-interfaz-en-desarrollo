import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { preloadAssets } from '../utils/AssetLoader';

// Asset imports for preloading (Solo UI/Menús)
import swordImg from '../assets/images/ui/sword_icon.png';
import loadingBg from '../assets/images/environment/loading_screen.jpg';
import lobbyBg from '../assets/images/environment/lobby_inner.jpg';
import wizardImg from '../assets/images/characters/wizard.png';
import menuMusic from '../assets/audio/music/menu.mp3';
import charSelectMusic from '../assets/audio/music/lobby.mp3';
import clickSfx from '../assets/audio/sfx/click.mp3';

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  const tips = [
    "TIP: Los cristales de maná restauran tu energía vital.",
    "LORE: La Academia de Magia cayó hace un milenio...",
    "TIP: Usa la pausa para planear tu próxima estrategia.",
    "LORE: Los espectros solo pueden ser vistos en la oscuridad.",
    "TIP: Combina hechizos para causar mayor daño elemental."
  ];

  useEffect(() => {
    // Assets list (Solo UI/Menús)
    const assetsToLoad = [
        { type: 'image', url: swordImg },
        { type: 'image', url: wizardImg },
        { type: 'image', url: loadingBg },
        { type: 'image', url: lobbyBg },
        { type: 'audio', url: menuMusic },
        { type: 'audio', url: charSelectMusic },
        { type: 'audio', url: clickSfx }
    ];

    let progressValue = 0;
    
    // Real asset loading
    preloadAssets(assetsToLoad, (p) => {
        progressValue = p;
        setProgress(p);
    }).then(() => {
        // Ensure progress is visually 100% before allowing completion
        setProgress(100);
        setTimeout(() => setAssetsLoaded(true), 300);
    });

    const tipInterval = setInterval(() => {
        setTipIndex(prev => (prev + 1) % tips.length);
    }, 2000);

    return () => {
        clearInterval(tipInterval);
    };
  }, []); // Remove onComplete dependency to prevent double triggers

  return (
    <motion.div 
      className="loading-container-v2"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => assetsLoaded && onComplete()}
      style={{ cursor: assetsLoaded ? 'pointer' : 'default' }}
    >
        <div className="loading-bg-grid" />
        
        <div className="loading-content-wrapper">
            <div className="rune-spinner-container">
                <div className="rune-circle-outer" />
                <div className="rune-circle-inner" />
                <div className="rune-symbol">
                    <div className="pixel-crystal-icon" />
                </div>
            </div>

            <motion.h1 
                className="loading-title-v2"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                ARCANUM: LEGACY
            </motion.h1>

            <div className="mana-bar-frame">
                <div className="mana-bar-track">
                    <motion.div 
                        className="mana-bar-fill" 
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 40,
                            damping: 12,
                            mass: 1
                        }}
                    >
                        <div className="mana-glare" />
                    </motion.div>
                </div>
                <div className="mana-value">{Math.floor(progress)}%</div>
            </div>

            <div className="loading-status-area">
                <AnimatePresence mode="wait">
                    {!assetsLoaded ? (
                        <motion.div 
                            key="tips"
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="loading-tip-container"
                        >
                            <motion.p 
                                key={tipIndex}
                                className="loading-tip-text"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                {tips[tipIndex]}
                            </motion.p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="ready"
                            className="press-to-start"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 400, 
                                damping: 10 
                            }}
                        >
                            <motion.span
                                animate={{ opacity: [0.3, 0.8, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ 
                                    color: '#ffffff', 
                                    fontSize: '0.7rem', 
                                    letterSpacing: '2px',
                                    fontFamily: "'Press Start 2P', cursive",
                                    textShadow: '2px 2px 0px #000'
                                }}
                            >
                                TOQUE CUALQUIER LADO PARA ENTRAR
                            </motion.span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    </motion.div>
  );
};

export default LoadingScreen;
