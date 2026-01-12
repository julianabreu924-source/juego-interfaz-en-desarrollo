import React from 'react';
import { motion } from 'framer-motion';
import { X, Volume2, VolumeX, Music, Download } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import '../styles/global.css'; // Ensure global styles are available

const SettingsModal = ({ onClose, onInstall, canInstall }) => {
  const { 
    musicVolume, setMusicVolume, 
    sfxVolume, setSfxVolume, 
    isMuted, setIsMuted 
  } = useAudio();

  return (
    <div className="settings-overlay">
      <motion.div 
        className="settings-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="settings-header">
          <h2>CONFIGURACIÓN</h2>
          <button className="pixel-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          {/* Mute Toggle */}
          <div className="settings-row">
            <label>Sonido General</label>
            <button 
              className={`pixel-toggle-btn ${isMuted ? 'muted' : ''}`} 
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              <span>{isMuted ? 'OFF' : 'ON'}</span>
            </button>
          </div>

          {/* Music Volume */}
          <div className="settings-row">
            <div className="label-group">
                <Music size={16} />
                <label>Música</label>
            </div>
            <input 
              type="range" 
              min="0" max="1" step="0.05" 
              value={musicVolume} 
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              className="pixel-slider"
              disabled={isMuted}
            />
            <span className="volume-value">{Math.round(musicVolume * 100)}%</span>
          </div>

          {/* SFX Volume */}
          <div className="settings-row">
            <div className="label-group">
                <Volume2 size={16} />
                <label>Efectos</label>
            </div>
            <input 
              type="range" 
              min="0" max="1" step="0.05" 
              value={sfxVolume} 
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              className="pixel-slider"
              disabled={isMuted}
            />
            <span className="volume-value">{Math.round(sfxVolume * 100)}%</span>
          </div>

          {/* PWA Install Button */}
          {canInstall && (
            <div className="settings-row install-row">
              <label>App de Escritorio</label>
              <button className="pixel-install-btn" onClick={onInstall}>
                <Download size={20} />
                <span>INSTALAR JUEGO</span>
              </button>
            </div>
          )}
        </div>

        <div className="settings-footer">
            <p className="version-text">Version 0.3.5 (Alpha)</p>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
