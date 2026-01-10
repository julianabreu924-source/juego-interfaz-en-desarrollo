import React, { useEffect, useRef, useState } from 'react';
import { Application, extend } from '@pixi/react';
import { Container, Graphics, Sprite } from 'pixi.js';
import adventureMusic from '../assets/audio/music/adventure.mp3';
import World from './World';
import { GAME_CONFIG } from '../config/constants';

extend({ Container, Graphics, Sprite });

const GameContainer = ({ gameState, isPaused, levelId, onGameOver, onComplete }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize audio
    const audio = new Audio(adventureMusic);
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    return () => {
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

  return (
    <Application
      width={GAME_CONFIG.LOGICAL_WIDTH}
      height={GAME_CONFIG.LOGICAL_HEIGHT}
      background={0x1a072a}
      antialias={false}
      resolution={window.devicePixelRatio || 1}
      autoDensity={true}
      style={{ width: '100%', height: '100%' }}
    >
      {(gameState === 'playing' || gameState === 'gameover' || gameState === 'dev-viewer' || gameState === 'win') && (
        <World
          width={GAME_CONFIG.LOGICAL_WIDTH}
          height={GAME_CONFIG.LOGICAL_HEIGHT}
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
