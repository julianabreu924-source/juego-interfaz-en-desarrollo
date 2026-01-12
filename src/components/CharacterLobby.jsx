import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Shield, Zap, Sword, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import wizardImg from '../assets/images/characters/MAGO_DE_BATALLA_2D-removebg-preview.png';
import elfImg from '../assets/images/characters/CAZADORA_ELFO-removebg-preview.png';
import reinaImg from '../assets/images/characters/Reina.png';
import lobbyMusic from '../assets/audio/music/lobby.mp3';
import clickSfx from '../assets/audio/sfx/click.mp3';

const CharacterLobby = ({ onBack, onSelect }) => {
  const [selectedChar, setSelectedChar] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const audio = new Audio(lobbyMusic);
    audio.loop = true;
    audio.volume = 0.6;
    
    // Play attempt
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Lobby music autoplay blocked:", error);
        });
    }

    return () => {
        audio.pause();
        audio.currentTime = 0;
    };
  }, []);

  const characters = [
    {
      id: 0,
      name: "MAGO DE BATALLA",
      role: "HECHICERO ARCANO",
      description: "Un maestro de las artes místicas, capaz de controlar los elementos y doblegar la realidad.",
      stats: {
        attack: 40,
        defense: 30,
        magic: 95,
        speed: 60
      },
      image: wizardImg
    },
    {
      id: 1,
      name: "GUERRERO FEROZ",
      role: "COMBATIENTE",
      description: "Próximamente: Un luchador cuerpo a cuerpo con fuerza bruta inigualable.",
      stats: { attack: 90, defense: 70, magic: 10, speed: 40 },
      image: null,
      locked: true
    },
    {
      id: 2,
      name: "CAZADORA ELFO",
      role: "TIRADOR DE ARCO",
      description: "Maestra de la precisión y el ataque a distancia, guardiana de los bosques antiguos.",
      stats: { attack: 75, defense: 30, magic: 30, speed: 90 },
      image: elfImg
    },
    {
      id: 3,
      name: "REINA",
      role: "CURANDERA",
      description: "Sábia de la luz, especialista en restauración y protección divina.",
      stats: { attack: 20, defense: 50, magic: 85, speed: 50 },
      image: reinaImg,
      locked: false
    },
    {
      id: 4,
      name: "SEÑOR OSCURO",
      role: "DEMONIO",
      description: "Próximamente: Poder destructivo alimentado por las sombras.",
      stats: { attack: 95, defense: 40, magic: 70, speed: 65 },
      image: null,
      locked: true
    },
    {
      id: 5,
      name: "MINOTAURO COLOSAL",
      role: "TANQUE",
      description: "Próximamente: Una bestia imparable con una resistencia legendaria.",
      stats: { attack: 60, defense: 95, magic: 5, speed: 20 },
      image: null,
      locked: true
    }
  ];

  const handleNext = () => {
    setSelectedChar((prev) => (prev + 1) % characters.length);
    setShowInfo(false); // Reset info on change
  };

  const handlePrev = () => {
    setSelectedChar((prev) => (prev - 1 + characters.length) % characters.length);
    setShowInfo(false);
  };

  return (
    <motion.div 
      className="lobby-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="lobby-bg-image" />
      <div className="lobby-bg-grid" />
      
      <div className="lobby-content">
        <motion.h1 
          className="lobby-title"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          SELECCIÓN DE HÉROE
        </motion.h1>

        <div className="char-selection-stage">
          <button className="nav-arrow left" onClick={() => { new Audio(clickSfx).play(); handlePrev(); }}>
            <ChevronLeft size={48} color="#fff" />
          </button>

          {/* LARGE HERO SHOWCASE CONTAINER */}
          <motion.div 
            className="hero-showcase-container"
            key={selectedChar}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            {/* 1. Large Image Area (The container requested) */}
            <div className="hero-image-wrapper">
               {/* This is where the large beautiful images will go */}
               <div className="hero-image-placeholder">
                  {characters[selectedChar].image ? (
                     <img 
                       src={characters[selectedChar].image} 
                       alt={characters[selectedChar].name} 
                       className="hero-full-img"
                     />
                  ) : (
                     <div className="locked-hero-state">
                         <Lock size={80} color="#555" />
                         <span>CLASIFICADO</span>
                     </div>
                  )}
               </div>
               
               {/* Visual overlay for depth */}
               <div className="hero-vignette" />
            </div>

            {/* 2. Info Panel (Floating/Overlay) - Now Conditional */}
            <AnimatePresence>
              {showInfo && (
                <motion.div 
                  className="hero-info-panel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                   <div className="hero-header-group">
                     <h1 className="hero-name-large">{characters[selectedChar].name}</h1>
                     <div className="hero-role-badge">
                        <Sword size={16} />
                        <span>{characters[selectedChar].role}</span>
                     </div>
                   </div>

                   <p className="hero-lore">{characters[selectedChar].description}</p>
                   
                   <div className="hero-stats-grid">
                      <div className="stat-unit">
                         <span className="stat-label">ATK</span>
                         <div className="stat-track-large">
                            <motion.div className="stat-fill-large atk" initial={{width: 0}} animate={{width: `${characters[selectedChar].stats.attack}%`}} />
                         </div>
                      </div>
                      <div className="stat-unit">
                         <span className="stat-label">DEF</span>
                         <div className="stat-track-large">
                            <motion.div className="stat-fill-large def" initial={{width: 0}} animate={{width: `${characters[selectedChar].stats.defense}%`}} />
                         </div>
                      </div>
                      <div className="stat-unit">
                         <span className="stat-label">MAG</span>
                         <div className="stat-track-large">
                            <motion.div className="stat-fill-large mag" initial={{width: 0}} animate={{width: `${characters[selectedChar].stats.magic}%`}} />
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* COMPACT Info Toggle Button - Moved far right, floating above panel */}
          <div style={{position: 'absolute', bottom: '20px', right: '50px', zIndex: 100}}>
             <button 
                className="crystal-button secondary" 
                style={{
                  minWidth: 'auto', 
                  padding: '8px 16px', 
                  height: '36px',
                  gap: '8px',
                  borderRadius: '20px',
                  background: 'rgba(0,0,0,0.8)', // Ensure contrast if overlapping panel
                  border: '1px solid var(--pixel-gold)'
                }}
                onClick={() => { new Audio(clickSfx).play(); setShowInfo(!showInfo); }}
             >
                <User size={14} color="var(--pixel-gold)" />
                <span style={{fontSize: '0.6rem', color: 'var(--pixel-gold)'}}>{showInfo ? 'CERRAR' : 'INFO'}</span>
             </button>
          </div>

          <button className="nav-arrow right" onClick={() => { new Audio(clickSfx).play(); handleNext(); }}>
            <ChevronRight size={48} color="#fff" />
          </button>
        </div>

        <div className="lobby-controls">
          <button className="crystal-button secondary" onClick={() => { new Audio(clickSfx).play(); onBack(); }}>
            <ArrowLeft size={20} />
            <span>VOLVER</span>
          </button>
          
          <button 
            className={`crystal-button ${characters[selectedChar].locked ? 'locked' : 'primary'}`} 
            onClick={() => { new Audio(clickSfx).play(); !characters[selectedChar].locked && onSelect(characters[selectedChar]); }}
            disabled={characters[selectedChar].locked}
            style={{ opacity: characters[selectedChar].locked ? 0.5 : 1, cursor: characters[selectedChar].locked ? 'not-allowed' : 'pointer' }}
          >
            {characters[selectedChar].locked ? <Lock size={16} /> : null}
            <span>{characters[selectedChar].locked ? 'BLOQUEADO' : 'SELECCIONAR'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CharacterLobby;
