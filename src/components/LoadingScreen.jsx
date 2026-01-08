import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const tips = [
    "TIP: Los cristales de maná restauran tu energía vital.",
    "LORE: La Academia de Magia cayó hace un milenio...",
    "TIP: Usa la pausa para planear tu próxima estrategia.",
    "LORE: Los espectros solo pueden ser vistos en la oscuridad.",
    "TIP: Combina hechizos para causar mayor daño elemental."
  ];

  useEffect(() => {
    // Change tip every 1.5 seconds
    const tipInterval = setInterval(() => {
        setTipIndex(prev => (prev + 1) % tips.length);
    }, 1500);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          clearInterval(tipInterval);
          setTimeout(onComplete, 800); 
          return 100;
        }
        // Non-linear progress for realism
        const increment = Math.random() * 3 + 0.5;
        return Math.min(prev + increment, 100);
      });
    }, 50);

    return () => {
        clearInterval(interval);
        clearInterval(tipInterval);
    };
  }, [onComplete]);

  return (
    <motion.div 
      className="loading-container-v2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    >
        {/* Background Runes/Particles */}
        <div className="loading-bg-grid" />
        
        <div className="loading-content-wrapper">
             {/* Central Rune Animation */}
            <div className="rune-spinner-container">
                <div className="rune-circle-outer" />
                <div className="rune-circle-inner" />
                <div className="rune-symbol">
                    {/* Simplified Pixel Crystal Shape using CSS borders or just a character */}
                    <div className="pixel-crystal-icon" />
                </div>
            </div>

            <motion.h1 
                className="loading-title-v2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                ARCANUM
            </motion.h1>

             {/* Mana Bar */}
            <div className="mana-bar-frame">
                <div className="mana-bar-track">
                    <motion.div 
                        className="mana-bar-fill" 
                        style={{ width: `${progress}%` }}
                        layoutId="loadingParams"
                    >
                        <div className="mana-glare" />
                    </motion.div>
                </div>
                <div className="mana-value">{Math.floor(progress)}%</div>
            </div>

            {/* Dynamic Tips */}
            <div className="loading-tip-container">
                <AnimatePresence mode="wait">
                    <motion.p 
                        key={tipIndex}
                        className="loading-tip-text"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {tips[tipIndex]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    </motion.div>
  );
};

export default LoadingScreen;
