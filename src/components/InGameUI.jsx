import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Pause, Play, Home, RotateCcw } from 'lucide-react';

const InGameUI = ({ onBack, onTogglePause, isPaused, onRestart }) => {
  return (
    <div className="in-game-ui-container">
      {/* Botones de Control Superior Izquierda */}
      <div className="top-left-controls">
        <motion.button 
          className="ui-control-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          title="Volver al Menú"
        >
          <ArrowLeft size={24} />
        </motion.button>

        <motion.button 
          className="ui-control-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onTogglePause}
          title={isPaused ? "Reanudar" : "Pausar"}
        >
          {isPaused ? <Play size={24} /> : <Pause size={24} />}
        </motion.button>
      </div>

      {/* Overlay de Pausa */}
      {isPaused && (
        <motion.div 
          className="pause-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="crystal-pause-modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
          >
            <h2 className="pause-title">PAUSA</h2>
            
            <div className="pause-options">
              {[
                { 
                  id: 'resume', 
                  label: 'REANUDAR', 
                  desc: 'CONTINUAR LA BATALLA', 
                  icon: <Play size={20} />, 
                  action: onTogglePause,
                  primary: true
                },
                { 
                  id: 'restart', 
                  label: 'REINICIAR', 
                  desc: 'INTENTAR DE NUEVO', 
                  icon: <RotateCcw size={20} />, 
                  action: onRestart 
                },
                { 
                  id: 'exit', 
                  label: 'ABANDONAR', 
                  desc: 'VOLVER AL MENÚ', 
                  icon: <Home size={20} />, 
                  action: onBack,
                  isExit: true
                }
              ].map((opt) => (
                <motion.button
                  key={opt.id}
                  className={`crystal-button pause-btn ${opt.isExit ? 'exit' : ''}`}
                  onClick={opt.action}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="shimmer-effect" />
                  
                  <div className="btn-icon-v2">
                    {opt.icon}
                  </div>

                  <div className="btn-text-content" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
                    <span className="btn-label-v2">{opt.label}</span>
                    <span className="btn-desc-v2">{opt.desc}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default InGameUI;
