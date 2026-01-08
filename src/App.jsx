import React, { useState, Suspense, lazy } from 'react';
import LoadingScreen from './components/LoadingScreen';
import MainMenu from './components/MainMenu';
import GameOver from './components/GameOver';
import PixelParticles from './components/PixelParticles';
import { AnimatePresence, motion } from 'framer-motion';

import WinScreen from './components/WinScreen';
import InGameUI from './components/InGameUI';
import CharacterLobby from './components/CharacterLobby';

// Lazy load the game engine
const GameContainer = lazy(() => import('./core/GameContainer'));

function App() {
  const [gameState, setGameState] = useState('loading'); // loading, menu, playing, gameover, win
  const [gameKey, setGameKey] = useState(0); // For forcing re-mount on retry
  const [isPaused, setIsPaused] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);

  const handleStartGame = () => {
    setGameKey(prev => prev + 1); 
    setGameState('playing');
    setIsPaused(false);
    setCurrentLevel(1);
  };

  const handleGameOver = () => {
    setGameState('gameover');
  };

  const handleWin = () => {
    if (currentLevel < 2) {
        setCurrentLevel(2);
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
      <div className="game-viewport">
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
                
                {gameState === 'playing' && (
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
                    >
                      <button className="pixel-button secondary" onClick={handleExit}>
                        VOLVER AL MENÚ
                      </button>
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
