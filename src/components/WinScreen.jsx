import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, Home } from 'lucide-react';

const WinScreen = ({ onRestart, onExit }) => {
  return (
    <motion.div 
      className="game-overlay win"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="game-overlay-content"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 12 }}
      >
        <Trophy size={64} color="#ffde59" style={{ marginBottom: '20px' }} />
        <h2 className="overlay-title win-text">¡PORTAL CRUZADO!</h2>
        <p className="overlay-subtitle">Has escapado de las cavernas con éxito.</p>
        
        <div className="overlay-options">
          <button className="pixel-button primary" onClick={onRestart}>
            <RefreshCw size={20} style={{ marginRight: '10px' }} />
            JUGAR DE NUEVO
          </button>
          
          <button className="pixel-button" onClick={onExit}>
            <Home size={20} style={{ marginRight: '10px' }} />
            MENÚ PRINCIPAL
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WinScreen;
