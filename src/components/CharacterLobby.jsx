import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Shield, Zap, Heart, Sword, ChevronLeft, ChevronRight, Lock, Crosshair, Skull } from 'lucide-react';
import wizardImg from '../assets/wizard.png';
import lobbyMusic from '../assets/seleccion de personaje.mp3';

const CharacterLobby = ({ onBack, onSelect }) => {
  const [selectedChar, setSelectedChar] = useState(0);

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
      name: "CAZADOR ELFO",
      role: "TIRADOR DE ARCO",
      description: "Próximamente: Maestro de la precisión y el ataque a distancia.",
      stats: { attack: 75, defense: 30, magic: 30, speed: 90 },
      image: null,
      locked: true
    },
    {
      id: 3,
      name: "SÁBIA DE LUZ",
      role: "CURANDERA",
      description: "Próximamente: Especialista en restauración y protección divina.",
      stats: { attack: 20, defense: 50, magic: 85, speed: 50 },
      image: null,
      locked: true
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
  };

  const handlePrev = () => {
    setSelectedChar((prev) => (prev - 1 + characters.length) % characters.length);
  };

  return (
    <motion.div 
      className="lobby-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="lobby-bg-grid" />
      
      <div className="lobby-content">
        <motion.h1 
          className="lobby-title"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
        >
          SELECCIÓN DE HÉROE
        </motion.h1>

        <div className="character-display-area">
          <button className="nav-arrow left" onClick={handlePrev}>
            <ChevronLeft size={40} />
          </button>

          {/* Character Card */}
          <motion.div 
            className="character-card active"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-inner-frame">
              <div className="char-portrait-container">
                <div className="char-glow" />
                {characters[selectedChar].image ? (
                  <img 
                    src={characters[selectedChar].image} 
                    alt={characters[selectedChar].name} 
                    className="char-image"
                  />
                ) : (
                  <Lock size={64} color="#555" style={{zIndex: 5}} />
                )}
              </div>

              <div className="char-info">
                <h2 className="char-name">{characters[selectedChar].name}</h2>
                <span className="char-role">{characters[selectedChar].role}</span>
                
                <div className="char-stats">
                  {/* Stats bars logic remains same, just ensuring it renders per character */}
                  <div className="stat-row">
                    <Sword size={16} className="stat-icon" />
                    <div className="stat-bar-track">
                      <motion.div 
                        className="stat-bar-fill atk" 
                        initial={{ width: 0 }}
                        animate={{ width: `${characters[selectedChar].stats.attack}%` }}
                      />
                    </div>
                  </div>
                  <div className="stat-row">
                    <Shield size={16} className="stat-icon" />
                    <div className="stat-bar-track">
                      <motion.div 
                        className="stat-bar-fill def" 
                        initial={{ width: 0 }}
                        animate={{ width: `${characters[selectedChar].stats.defense}%` }}
                      />
                    </div>
                  </div>
                  <div className="stat-row">
                    <Zap size={16} className="stat-icon" />
                    <div className="stat-bar-track">
                      <motion.div 
                        className="stat-bar-fill mag" 
                        initial={{ width: 0 }}
                        animate={{ width: `${characters[selectedChar].stats.magic}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className="char-desc">{characters[selectedChar].description}</p>
              </div>
            </div>
          </motion.div>

          <button className="nav-arrow right" onClick={handleNext}>
            <ChevronRight size={40} />
          </button>
        </div>

        <div className="lobby-controls">
          <button className="crystal-button secondary" onClick={onBack}>
            <ArrowLeft size={20} />
            <span>VOLVER</span>
          </button>
          
          <button 
            className={`crystal-button ${characters[selectedChar].locked ? 'locked' : 'primary'}`} 
            onClick={() => !characters[selectedChar].locked && onSelect(characters[selectedChar])}
            disabled={characters[selectedChar].locked}
            style={{ opacity: characters[selectedChar].locked ? 0.5 : 1, cursor: characters[selectedChar].locked ? 'not-allowed' : 'pointer' }}
          >
            {characters[selectedChar].locked ? <Lock size={16} /> : null}
            <span>{characters[selectedChar].locked ? 'BLOQUEADO' : 'SELECCIONAR'}</span>
            {!characters[selectedChar].locked && <div className="shimmer-effect" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CharacterLobby;
