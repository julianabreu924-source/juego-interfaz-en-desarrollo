import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Home, Skull, Ghost } from 'lucide-react';

const GameOver = ({ onRestart, onExit }) => {
  return (
    <motion.div 
      className="game-over-arcade-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Retro Scanlines Effect */}
      <div className="arcade-scanlines" />

      <motion.div 
        className="game-over-retro-panel"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
      >
        {/* Floating Ghost Decoration */}
        <motion.div
           className="retro-ghost"
           animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
           transition={{ duration: 4, repeat: Infinity }}
        >
          <Ghost size={80} color="#8c52ff" />
        </motion.div>

        <h1 className="retro-title">GAME OVER</h1>
        
        <div className="retro-divider" />
        
        <motion.p 
          className="retro-msg"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          TU VIAJE TERMINÓ AQUÍ...
        </motion.p>

        <div className="retro-stats">
          <div className="stat-row">
            <span>NIVEL:</span>
            <span className="stat-value">ZONA ARCANUM 1</span>
          </div>
          <div className="stat-row">
            <span>DESTINO:</span>
            <span className="stat-value">HACIA EL VACÍO</span>
          </div>
        </div>

        <div className="game-over-actions">
          <motion.button 
            className="arcade-btn primary" 
            onClick={onRestart}
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px #ffde59" }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw size={20} />
            CONTINUAR
          </motion.button>
          
          <motion.button 
            className="arcade-btn" 
            onClick={onExit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home size={20} />
            RENDIRSE
          </motion.button>
        </div>
        
        <div className="insert-coin-prompt">
           PRESIONA PARA VOLVER A INTENTAR
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameOver;
