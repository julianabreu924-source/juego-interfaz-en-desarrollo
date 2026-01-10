import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, Home } from 'lucide-react';
import clickSfx from '../assets/audio/sfx/click.mp3';

const WinScreen = ({ onRestart, onExit }) => {
  return (
    <motion.div 
      className="game-over-arcade-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="arcade-scanlines" />

      <motion.div 
        className="game-over-retro-panel"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Trophy size={80} color="#ffde59" style={{ marginBottom: '20px' }} />
        <h1 className="retro-title" style={{ color: '#ffde59' }}>¡VICTORIA!</h1>
        
        <div className="retro-divider" />
        
        <p className="retro-msg">Has escapado de las cavernas con éxito.</p>
        
        <div className="game-over-actions">
           <motion.button 
            className="arcade-btn primary" 
            onClick={() => { new Audio(clickSfx).play(); onRestart(); }}
          >
            <RefreshCw size={20} />
            REINTENTAR
          </motion.button>
          
          <motion.button 
            className="arcade-btn" 
            onClick={() => { new Audio(clickSfx).play(); onExit(); }}
          >
            <Home size={20} />
            INICIO
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WinScreen;
