import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Play, Book, RefreshCw, LogOut, Sword, Sparkles, Map, Ghost, User } from 'lucide-react';
import swordImg from '../assets/espada.png';
import magicIcon from '../assets/icono.academia.de.magia.png';
import menuMusic from '../assets/musicademenu.mp3';
import { useEffect } from 'react';

const MainMenu = ({ onStart, onTutorial, onCharacters, onSettings, onDevMode }) => {
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    const audio = new Audio(menuMusic);
    audio.loop = true;
    audio.volume = 0.5;
    
    // Intentar reproducir (los navegadores pueden bloquearlo si no hay interacción previa)
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Autoplay blocked usually until interaction:", error);
        });
    }

    return () => {
        audio.pause();
        audio.currentTime = 0;
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const sidebarVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", damping: 20, stiffness: 100 }
    }
  };

  const titleVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const menuOptions = [
    { 
      id: 'start', 
      label: 'INICIAR AVENTURA', 
      desc: 'ENTRA AL MUNDO ARCANO', 
      icon: <img src={swordImg} alt="Espada" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />, 
      action: onStart,
      primary: true 
    },
    { 
      id: 'tutorial', 
      label: 'ACADEMIA MÁGICA', 
      desc: 'APRENDE LOS HECHIZOS', 
      icon: <img src={magicIcon} alt="Magia" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />, 
      action: onTutorial 
    },
    { 
      id: 'characters', 
      label: 'PERSONAJES', 
      desc: 'ESCOGE TU HÉROE', 
      icon: <User size={22} />, 
      action: onCharacters 
    },
    { 
      id: 'dev', 
      label: 'MODO OBSERVADOR', 
      desc: 'EXPLORA LAS DIMENSIONES', 
      icon: <Map size={22} />, 
      action: onDevMode 
    }
  ];

  return (
    <motion.div 
      className="menu-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background Magic Motes */}
      {[...Array(15)].map((_, i) => (
        <div 
          key={i} 
          className="magic-mote" 
          style={{ 
            left: `${Math.random() * 80}%`, 
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            transform: `scale(${0.5 + Math.random()})`
          }} 
        />
      ))}

      {/* Title Section */}
      <div className="title-section">
        <div className="title-glow-aura" />
        
        <motion.div variants={titleVariants}>
          <h1 className="menu-title-v2">ARCANUM</h1>
          <div className="menu-subtitle">
            <Ghost size={20} className="floating-ghost" />
            <span>LEGACY OF THE CRYSTALS</span>
          </div>
        </motion.div>

        <div className="loading-dots">
          {[1, 2, 3].map(i => (
            <div key={i} className="dot" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>

      {/* Options Sidebar */}
      <motion.div className="options-sidebar" variants={sidebarVariants}>
        {menuOptions.map((opt) => (
          <motion.button
            key={opt.id}
            className={`crystal-button ${opt.exit ? 'exit' : ''}`}
            onMouseEnter={() => setHoveredBtn(opt.id)}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={(e) => {
                if (window.spawnParticles) window.spawnParticles(e);
                opt.action();
            }}
          >
            <div className="shimmer-effect" />
            <div className="selection-indicator" />
            
            <div className="btn-icon-v2">
              {opt.icon}
            </div>

            <div className="btn-text-content">
              <span className="btn-label-v2">{opt.label}</span>
              <span className="btn-desc-v2">{opt.desc}</span>
            </div>

            <AnimatePresence>
                {hoveredBtn === opt.id && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        style={{ marginLeft: 'auto', color: 'var(--pixel-gold)' }}
                    >
                        <Sparkles size={16} />
                    </motion.div>
                )}
            </AnimatePresence>
          </motion.button>
        ))}
      </motion.div>

      {/* Settings Action (Top Right) */}
      <motion.button 
        className="settings-btn-v2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ rotate: 90 }}
        onClick={onSettings}
      >
        <Settings size={28} />
      </motion.button>

      {/* Exit Action (Top Left) */}
      <motion.button 
        className="exit-btn-v2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => {}}
      >
        <LogOut size={28} />
      </motion.button>
    </motion.div>
  );
};

export default MainMenu;
