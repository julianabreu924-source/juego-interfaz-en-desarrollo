import React, { useEffect, useRef } from 'react';
import { Application, extend } from '@pixi/react';
import { Container, Text, TextStyle, Graphics, Sprite } from 'pixi.js';
import { GAME_CONFIG } from '../config/constants';
import adventureMusic from '../assets/escena1.aventura.mp3';
import World from './World';

// Register PixiJS components
extend({ Container, Text, Graphics, Sprite });

const GameContainer = ({ gameState, isPaused, levelId, onGameOver, onComplete }) => {
  const width = GAME_CONFIG.WIDTH;
  const height = GAME_CONFIG.HEIGHT;
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize audio
    const audio = new Audio(adventureMusic);
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    return () => {
      // Cleanup
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    // Control playback based on state
    if (audioRef.current) {
      if (gameState === 'playing' && !isPaused) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Audio play failed:", error);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [gameState, isPaused]);

  const textStyle = new TextStyle({
    fontFamily: '"Press Start 2P"',
    fontSize: 24,
    fill: '#ffde59', // Arcanum Gold
    align: 'center',
    dropShadow: {
      alpha: 0.5,
      angle: Math.PI / 6,
      blur: 2,
      color: '#000000',
      distance: 4,
    }
  });

  return (
    <Application 
      width={width} 
      height={height} 
      background={0x1a072a}
      antialias={false}
      resolution={window.devicePixelRatio || 1}
      autoDensity={true}
    >
      {gameState === 'menu' && (
        <pixiContainer>
          <pixiText
            text={"ARCANUM\n\nPRESS SPACE"}
            x={width / 2}
            y={height / 2}
            anchor={0.5}
            style={textStyle}
          />
        </pixiContainer> 
      )}  

      {(gameState === 'playing' || gameState === 'gameover' || gameState === 'dev-viewer' || gameState === 'win') && (
        <World 
          levelId={levelId} 
          onGameOver={onGameOver} 
          onComplete={onComplete} 
          gameState={gameState} 
          isPaused={isPaused}
        />
      )}
    </Application>
  );
};

export default GameContainer;
