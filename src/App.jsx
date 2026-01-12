import React, { useState, Suspense, lazy, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import MainMenu from './components/MainMenu';
import PixelParticles from './components/PixelParticles';
import { AnimatePresence } from 'framer-motion';
import { GAME_CONFIG } from './config/constants';

import CharacterLobby from './components/CharacterLobby';

// Lazy load Gacha System & Shop
// Lazy load Gacha System & Shop
const GachaSystem = lazy(() => import('./components/GachaSystem'));
const ShopSystem = lazy(() => import('./components/ShopSystem'));

import { AudioProvider } from './context/AudioContext';
import SettingsModal from './components/SettingsModal';

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
    });
  }
};

import { useGameStore } from './store/useGameStore';

function App() {
  const { 
    gameState, setGameState, 
    showSettings, setShowSettings 
  } = useGameStore();

  const [scale, setScale] = useState(1);
  const [dimensions, setDimensions] = useState({ 
    width: GAME_CONFIG.LOGICAL_WIDTH, 
    height: GAME_CONFIG.LOGICAL_HEIGHT 
  });
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Resolution Scaling Logic with Debounce for Performance
  useEffect(() => {
    let timeoutId = null;

    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        const h = GAME_CONFIG.LOGICAL_HEIGHT;
        const newScale = windowHeight / h;
        const newWidth = Math.ceil(windowWidth / newScale);
        
        setScale(newScale);
        setDimensions({ width: newWidth, height: h });
      }, 150); // Performance optimization: debounce
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // F11 Fullscreen Toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F11') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => console.warn(err));
        } else {
          document.exitFullscreen().catch(err => console.warn(err));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Capture PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleExit = () => setGameState('menu');
  const handleLobby = () => setGameState('lobby');
  const handleGacha = () => setGameState('gacha');
  const handleShop = () => setGameState('shop');
  const handleSettings = () => setShowSettings(true);

  const handleCharacterSelect = (char) => {
    console.log("Personaje seleccionado:", char);
    setGameState('menu');
  };
  
  // Attempt to lock orientation to landscape
  const lockOrientation = async () => {
    try {
      // Check if it's mobile/tablet
      if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen().catch(() => {});
        }
        
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape');
        }
      }
    } catch (err) {
      console.warn("Orientation lock failed:", err);
    }
  };

  useEffect(() => {
    // Initial attempt
    lockOrientation();
    
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        lockOrientation();
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <AudioProvider>
      <div className="game-wrapper" onClick={() => {
        // Subtle attempt to lock on any click if not already landscape
        if (window.innerHeight > window.innerWidth) {
          lockOrientation();
        }
      }}>
        <PixelParticles />
        
        {/* Mobile Orientation Warning */}
        <div className="portrait-warning">
          <div className="rotate-icon" />
          <h2 className="warning-text-large">MODO HORIZONTAL REQUERIDO</h2>
          <p className="warning-text-small">Por favor, rota tu dispositivo para una mejor experiencia arcana.</p>
          <button 
            className="force-landscape-btn"
            onClick={(e) => {
              e.stopPropagation();
              lockOrientation();
            }}
          >
            FORZAR LANDSCAPE
          </button>
        </div>

        {/* SCALED CONTAINER: Holds UI */}
        <div 
          className="game-scaler"
          style={{
            width: dimensions.width,
            height: dimensions.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'hidden',
            imageRendering: 'pixelated'
          }}
        >
          <div className="vignette-overlay" />
          
          <AnimatePresence mode="wait">
            {gameState === 'loading' && (
              <LoadingScreen key="loading" onComplete={() => setGameState('menu')} />
            )}

            {gameState === 'menu' && (
              <MainMenu 
                key="menu"
                onStart={() => alert('Modo Aventura en construcción')}
                onTutorial={() => alert('Tutorial próximamente...')}
                onCharacters={handleLobby}
                onSettings={handleSettings}
                onGacha={handleGacha}
                onShop={handleShop}
              />
            )}

            {gameState === 'lobby' && (
              <CharacterLobby 
                key="lobby"
                onBack={() => setGameState('menu')}
                onSelect={handleCharacterSelect}
              />
            )}

            {gameState === 'gacha' && (
              <Suspense fallback={<div className="loading-container">CARGANDO ALTAR...</div>}>
                  <GachaSystem onBack={handleExit} />
              </Suspense>
            )}

            {gameState === 'shop' && (
              <Suspense fallback={<div className="loading-container">CARGANDO MERCADO...</div>}>
                  <ShopSystem onBack={handleExit} />
              </Suspense>
            )}
          </AnimatePresence>

          {/* GLOBAL OVERLAYS */}
          <AnimatePresence>
              {showSettings && (
                  <SettingsModal 
                    onClose={() => setShowSettings(false)} 
                    onInstall={handleInstallClick}
                    canInstall={!!deferredPrompt}
                  />
              )}
          </AnimatePresence>
        </div>
      </div>
    </AudioProvider>
  );
}

export default App;
