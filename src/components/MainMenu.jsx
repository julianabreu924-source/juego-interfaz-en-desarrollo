import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, Map, User } from 'lucide-react';

const WizardHat = ({ size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    style={{ color: 'var(--pixel-gold)', filter: 'drop-shadow(0 0 5px var(--pixel-gold))', marginRight: '8px' }}
  >
    {/* Hat Body */}
    <path d="M12 3 L5 17 L19 17 Z" />
    {/* Ribbon */}
    <rect x="6.5" y="14" width="11" height="2" fill="#8c52ff" />
    {/* Rim */}
    <rect x="2" y="17" width="20" height="3" />
  </svg>
);
import swordImg from '../assets/images/ui/sword_icon.png';
import magicIcon from '../assets/images/ui/magic_icon.png';
import menuMusic from '../assets/audio/music/menu.mp3';
import clickSfx from '../assets/audio/sfx/click.mp3';

const BackgroundParticles = ({ count = 80, className = "magic-mote" }) => {
  const particles = useMemo(() => [...Array(count)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 90}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    scale: 0.5 + Math.random()
  })), [count]);

  return particles.map(p => (
    <div key={p.id} className={className} 
         style={{ left: p.left, top: p.top, animationDelay: p.delay, transform: `scale(${p.scale})` }} />
  ));
};

const MenuButton = ({ opt, isHovered, onHover, onAction }) => (
    <motion.button
      className={`crystal-button ${opt.exit ? 'exit' : ''}`}
      onMouseEnter={() => onHover(opt.id)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
          new Audio(clickSfx).play();
          window.spawnParticles?.(e);
          onAction();
      }}
    >
      <div className="btn-icon-v2">{opt.icon}</div>
      <div className="btn-text-content">
        <span className="btn-label-v2">{opt.label}</span>
        <span className="btn-desc-v2">{opt.desc}</span>
      </div>
    </motion.button>
);

const MainMenu = ({ onStart, onTutorial, onCharacters, onSettings, onDevMode }) => {
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    const audio = new Audio(menuMusic);
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch(() => console.log("Autoplay blocked"));
    return () => { audio.pause(); audio.currentTime = 0; };
  }, []);

  const menuOptions = [
    { id: 'start', label: 'INICIAR AVENTURA', desc: 'ENTRA AL MUNDO ARCANO', icon: <img src={swordImg} style={{ width: 22 }} />, action: onStart },
    { id: 'tutorial', label: 'ACADEMIA MÁGICA', desc: 'APRENDE LOS HECHIZOS', icon: <img src={magicIcon} style={{ width: 22 }} />, action: onTutorial },
    { id: 'characters', label: 'PERSONAJES', desc: 'ESCOGE TU HÉROE', icon: <User size={22} />, action: onCharacters },
    { id: 'dev', label: 'MODO OBSERVADOR', desc: 'EXPLORA LAS DIMENSIONES', icon: <Map size={22} />, action: onDevMode }
  ];

  return (
    <div className="menu-container">
      <BackgroundParticles />
      
      <div className="title-section">
        <div className="title-glow-aura" />
        <div>
          <h1 className="menu-title-v2">RUNES OF THE REBORN</h1>
          <div className="menu-subtitle">
            <WizardHat size={20} />
            <span>RUNES OF THE REBORN</span>
          </div>
        </div>
        <BackgroundParticles count={40} className="title-mote" />
      </div>

      <div className="options-sidebar">
        <div className="left-buttons">
          {menuOptions.slice(0, 2).map((opt) => (
            <MenuButton key={opt.id} opt={opt} isHovered={hoveredBtn === opt.id} onHover={setHoveredBtn} onAction={opt.action} />
          ))}
        </div>
        <div className="right-buttons">
          {menuOptions.slice(2, 4).map((opt) => (
            <MenuButton key={opt.id} opt={opt} isHovered={hoveredBtn === opt.id} onHover={setHoveredBtn} onAction={opt.action} />
          ))}
        </div>
      </div>

      <button 
        className="settings-btn-v2" 
        onClick={onSettings}
      >
        <Settings size={22} />
      </button>
      <button 
        className="exit-btn-v2" 
        onClick={() => {}}
      >
        <LogOut size={22} />
      </button>
    </div>
  );
};

export default MainMenu;
