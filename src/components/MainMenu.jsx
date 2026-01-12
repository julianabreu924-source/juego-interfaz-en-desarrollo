import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, Map, User, Sparkles, ShoppingBag } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

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

// Importar imágenes de botones personalizados
import btnJugar from '../assets/images/ui/btn_jugar.png';
import btnTutorial from '../assets/images/ui/btn_tutorial.png';
import btnInvocacion from '../assets/images/ui/btn_invocacion.png';
import btnConfiguracion from '../assets/images/ui/btn_configuracion.png';
import btnTienda from '../assets/images/ui/btn_tienda.png';
import btnPersonajes from '../assets/images/ui/btn_personajes.png';

import menuMusic from '../assets/audio/music/menu.mp3';
import clickSfx from '../assets/audio/sfx/click.mp3';

const BackgroundParticles = React.memo(({ count = 80, className = "magic-mote" }) => {
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
});

const MenuButton = React.memo(({ opt, isHovered, onHover, onAction }) => {
  const { playSfx } = useAudio();
  return (
  <motion.div className="menu-btn-wrapper">
    <motion.button
      className={`${opt.image ? 'menu-image-btn' : 'menu-circular-btn'} ${opt.exit ? 'exit' : ''}`}
      onMouseEnter={() => onHover(opt.id)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
          playSfx(clickSfx);
          window.spawnParticles?.(e);
          onAction();
      }}
      whileHover={{ scale: opt.image ? 1.05 : 1.1, y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      {opt.image ? (
        <img src={opt.image} alt={opt.label} style={{ width: '100%', height: 'auto', display: 'block' }} />
      ) : (
        <div className="menu-btn-icon">{opt.icon}</div>
      )}
    </motion.button>
    <div className="menu-btn-tooltip">
      <div className="menu-tooltip-label">{opt.label}</div>
      <div className="menu-tooltip-desc">{opt.desc}</div>
    </div>
  </motion.div>
)});

const MainMenu = ({ onStart, onTutorial, onCharacters, onSettings, onGacha, onShop }) => {
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const { playMusic, stopMusic } = useAudio();

  useEffect(() => {
    playMusic(menuMusic, true);
    return () => { stopMusic(); };
  }, [playMusic, stopMusic]);

  const menuOptions = [
    { id: 'start', label: 'PRÓXIMAMENTE', desc: 'Aventura en desarrollo', image: btnJugar, action: () => alert("Modo Aventura en construcción") },
    { id: 'tutorial', label: 'ACADEMIA MÁGICA', desc: 'Aprende los hechizos', image: btnTutorial, action: onTutorial },
    { id: 'characters', label: 'PERSONAJES', desc: 'Escoge tu héroe', image: btnPersonajes, action: onCharacters },
    { id: 'gacha', label: 'INVOCACIÓN', desc: 'Obtén recompensas', image: btnInvocacion, action: onGacha },
    { id: 'shop', label: 'TIENDA', desc: 'Ofertas exclusivas', image: btnTienda, action: onShop }
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

        {/* CENTER COLUMN (GACHA & SHOP) */}
        <div className="center-buttons" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '10px', gap: '15px' }}>
           <MenuButton 
             key={menuOptions[3].id} 
             opt={menuOptions[3]} 
             isHovered={hoveredBtn === menuOptions[3].id} 
             onHover={setHoveredBtn} 
             onAction={menuOptions[3].action} 
           />
           <MenuButton 
             key={menuOptions[4].id} 
             opt={menuOptions[4]} 
             isHovered={hoveredBtn === menuOptions[4].id} 
             onHover={setHoveredBtn} 
             onAction={menuOptions[4].action} 
           />
        </div>

        <div className="right-buttons">
          <MenuButton 
            key={menuOptions[2].id} 
            opt={menuOptions[2]} 
            isHovered={hoveredBtn === menuOptions[2].id} 
            onHover={setHoveredBtn} 
            onAction={menuOptions[2].action} 
          />
        </div>
      </div>

      <button 
        className="settings-btn-image" 
        onClick={onSettings}
      >
        <img src={btnConfiguracion} alt="Configuración" style={{ width: '100%', height: 'auto', display: 'block' }} />
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
