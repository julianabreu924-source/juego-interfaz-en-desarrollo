import React from 'react';
import { motion } from 'framer-motion';
import { Pause, Play, Home, RotateCcw } from 'lucide-react';
import exitBtnImg from '../assets/images/ui/exit_button.png';
import clickSfx from '../assets/audio/sfx/click.mp3';

const InGameUI = ({ onBack, onTogglePause, isPaused, onRestart }) => {
  return (
    <div className="in-game-ui-container">
      {/* Botones de Control Superior Izquierda */}
      <div className="top-left-controls">
        <motion.button
          className="ui-control-btn"
          onClick={() => { new Audio(clickSfx).play(); onBack(); }}
          title="Volver al Menú"
          style={{ width: '50px', height: '50px', background: 'transparent', border: 'none', boxShadow: 'none', cursor: 'pointer' }}
        >
          <img src={exitBtnImg} alt="Volver al Menú" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        </motion.button>

        <motion.button
          className="ui-control-btn"
          onClick={() => { new Audio(clickSfx).play(); onTogglePause(); }}
          title={isPaused ? "Reanudar" : "Pausar"}
          style={{ width: '60px', height: '60px', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          {isPaused ? <Play size={30} /> : <Pause size={30} />}
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
                  icon: <Play size={24} />,
                  action: onTogglePause,
                  primary: true
                },
                {
                  id: 'restart',
                  label: 'REINICIAR',
                  desc: 'INTENTAR DE NUEVO',
                  icon: <RotateCcw size={24} />,
                  action: onRestart
                },
                {
                  id: 'exit',
                  label: 'ABANDONAR',
                  desc: 'VOLVER AL MENÚ',
                  icon: <Home size={24} />,
                  action: onBack,
                  isExit: true
                }
              ].map((opt) => (
                <motion.button
                  key={opt.id}
                  className={`crystal-button pause-btn ${opt.isExit ? 'exit' : ''}`}
                  onClick={() => { new Audio(clickSfx).play(); opt.action(); }}
                >
                  
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
