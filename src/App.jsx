import React, { useState, Suspense, lazy, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import MainMenu from './components/MainMenu';
import GameOver from './components/GameOver';
import PixelParticles from './components/PixelParticles';
import { AnimatePresence, motion } from 'framer-motion';
import { GAME_CONFIG } from './config/constants';

import WinScreen from './components/WinScreen';
import InGameUI from './components/InGameUI';
import CharacterLobby from './components/CharacterLobby';

// Lazy load the game engine
const GameContainer = lazy(() => import('./core/GameContainer'));

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
    });
  }
};

function App() {
  const [gameState, setGameState] = useState('loading'); // loading, menu, playing, gameover, win
  const [gameKey, setGameKey] = useState(0); // For forcing re-mount on retry
  const [isPaused, setIsPaused] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [scale, setScale] = useState(1);

  // Resolution Scaling Logic
  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const scaleX = windowWidth / GAME_CONFIG.LOGICAL_WIDTH;
      const scaleY = windowHeight / GAME_CONFIG.LOGICAL_HEIGHT;
      const newScale = Math.min(scaleX, scaleY);
      setScale(newScale);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial calculation

    return () => window.removeEventListener('resize', handleResize);
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

  const handleStartGame = () => {
    toggleFullScreen();
    setGameKey(prev => prev + 1); 
    setGameState('playing');
    setIsPaused(false);
    setCurrentLevel(1);
  };

  const handleGameOver = () => {
    setGameState('gameover');
  };

  const handleWin = () => {
    if (currentLevel <= 2) {
        setCurrentLevel(prev => prev + 1);
        setGameKey(prev => prev + 1); // Forzar recarga del motor para el nuevo nivel
    } else {
        setGameState('win');
    }
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleDevViewer = () => {
    setGameState('dev-viewer');
  };

  const handleRestart = () => {
    setGameKey(prev => prev + 1); // Increment key to reset World component
    setGameState('playing');
  };

  const handleExit = () => {
    setGameState('menu');
  };

  const handleLobby = () => {
    setGameState('lobby');
  };

  const handleCharacterSelect = (char) => {
    console.log("Personaje seleccionado:", char);
    setGameState('menu'); // Return to menu after selection
  };

  return (
    <div className="game-wrapper">
      <PixelParticles />
      
      {/* SCALED CONTAINER: Holds both Game and UI */}
      <div 
        className="game-scaler"
        style={{
          width: GAME_CONFIG.LOGICAL_WIDTH,
          height: GAME_CONFIG.LOGICAL_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          position: 'absolute',
          overflow: 'hidden',
          boxShadow: '0 0 100px rgba(0,0,0,0.8)', // Enhanced shadow
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
              onStart={handleStartGame}
              onTutorial={() => alert('Tutorial próximamente...')}
              onCharacters={handleLobby}
              onSettings={() => alert('Configuración próximamente...')}
              onDevMode={handleDevViewer}
            />
          )}

          {gameState === 'lobby' && (
            <CharacterLobby 
              key="lobby"
              onBack={() => setGameState('menu')}
              onSelect={handleCharacterSelect}
            />
          )}
          
          {(gameState === 'playing' || gameState === 'gameover' || gameState === 'dev-viewer' || gameState === 'win') && (
            <Suspense fallback={<div className="loading-container">CARGANDO MOTOR...</div>}>
              <div key="game-content" style={{ width: '100%', height: '100%', position: 'relative' }}>
                <GameContainer 
                  key={gameKey}
                  gameState={gameState} 
                  isPaused={isPaused}
                  levelId={currentLevel}
                  onGameOver={handleGameOver}
                  onComplete={handleWin}
                />
                
                {(gameState === 'playing' || gameState === 'win') && (
                  <InGameUI
                    onBack={handleExit}
                    onTogglePause={togglePause}
                    isPaused={isPaused}
                    onRestart={handleRestart}
                  />
                )}

                <AnimatePresence>
                  {gameState === 'gameover' && (
                    <GameOver 
                      onRestart={handleRestart}
                      onExit={handleExit}
                    />
                  )}
                  {gameState === 'win' && (
                    <WinScreen 
                      onRestart={handleRestart}
                      onExit={handleExit}
                    />
                  )}
                  {gameState === 'dev-viewer' && (
                    <motion.div 
                      className="dev-ui-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ pointerEvents: 'none' }} // Allow clicks pass through to game for camera
                    >
                      {/* Bottom Controls Bar */}
                      <div style={{ 
                        position: 'absolute', 
                        bottom: 20, 
                        right: 20, 
                        display: 'flex', 
                        gap: '15px', 
                        alignItems: 'center',
                        pointerEvents: 'auto',
                        zIndex: 9999 
                      }}>
                          <button 
                            className="pixel-button secondary" 
                            onClick={() => {
                                setCurrentLevel(prev => Math.max(1, prev - 1));
                                setGameKey(prev => prev + 1);
                            }}
                            style={{ fontSize: '12px', padding: '8px 12px' }}
                          >
                            ◀
                          </button>
                          
                          <div style={{ 
                            background: 'rgba(0,0,0,0.8)', 
                            padding: '8px 12px', 
                            color: '#fff', 
                            fontFamily: '"Press Start 2P"',
                            fontSize: '12px',
                            border: '2px solid #4a4a4a'
                          }}>
                            NIVEL {currentLevel}
                          </div>

                          <button 
                            className="pixel-button secondary" 
                            onClick={() => {
                                setCurrentLevel(prev => Math.min(3, prev + 1));
                                setGameKey(prev => prev + 1);
                            }}
                            style={{ fontSize: '12px', padding: '8px 12px' }}
                          >
                            ▶
                          </button>

                          <div style={{ width: '10px' }} /> {/* Spacer */}

                          <button className="pixel-button secondary" onClick={handleExit}>
                            SALIR
                          </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Suspense>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
