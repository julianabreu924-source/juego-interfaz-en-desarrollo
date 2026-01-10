import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useTick, extend } from '@pixi/react';
import { Container, Graphics, Sprite, Text, Assets, TilingSprite } from 'pixi.js';
import { GAME_CONFIG, PLAYER_CONFIG } from '../config/constants';
import { LEVELS, TILE_TYPES } from '../config/levels';
import { useKeyboard } from '../hooks/useKeyboard';

import wizardImg from '../assets/images/characters/wizard.png';

extend({ Container, Graphics, Sprite, Text, TilingSprite });

const World = ({ levelId = 1, onGameOver, onComplete, gameState, isPaused, width, height }) => {
  const keys = useKeyboard();
  const level = LEVELS[levelId];
  const tileSize = GAME_CONFIG.TILE_SIZE;
  const isDevMode = gameState === 'dev-viewer';

  const [textures, setTextures] = useState({ wizard: null, portal: null, background: null });
  const [loading, setLoading] = useState(true);
  
  const containerRef = useRef(null);
  const spriteRef = useRef(null);
  const portalRef = useRef(null);
  const levelGraphicsRef = useRef(null);
  const backgroundRef = useRef(null);
  const portalPhase = useRef(0);
  const camera = useRef({ x: 0, y: 0 });

  const player = useRef({
    x: level.startX,
    y: level.startY,
    vx: 0,
    vy: 0,
    width: PLAYER_CONFIG.WIDTH,
    height: PLAYER_CONFIG.HEIGHT,
    onGround: true,
    direction: 1,
    deathAnimationStarted: false
  });

  // Assets Management
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        const [wiz, port, bg] = await Promise.all([
          Assets.load(wizardImg),
          Assets.load(level.portal),
          Assets.load(level.background)
        ]);

        [wiz, bg].forEach(t => { if(t.source) t.source.scaleMode = 'nearest'; });
        setTextures({ wizard: wiz, portal: port, background: bg });
        setLoading(false);
      } catch (err) {
        console.error("Critical Asset Loading Error:", err);
      }
    };
    loadAssets();
  }, [levelId, level.background, level.portal]);

  // Reset Player on Level Change
  useEffect(() => {
    Object.assign(player.current, {
      x: level.startX,
      y: level.startY,
      baseY: level.startY,
      zOffset: 0,
      vx: 0, vy: 0,
      onGround: true,
      deathAnimationStarted: false
    });
  }, [level]);

  useEffect(() => {
    if (loading || !levelGraphicsRef.current) return;
    const g = levelGraphicsRef.current;
    g.clear();

    // Draw organic boundaries in Dev Mode
    if (isDevMode && level.boundaries) {
        g.setStrokeStyle({ width: 4, color: 0xff0000, alpha: 0.8 });
        
        // Top Boundary
        for (let i = 0; i < level.boundaries.top.length - 1; i++) {
            g.moveTo(level.boundaries.top[i].x, level.boundaries.top[i].y * height);
            g.lineTo(level.boundaries.top[i+1].x, level.boundaries.top[i+1].y * height);
        }
        g.stroke();

        // Bottom Boundary
        for (let i = 0; i < level.boundaries.bottom.length - 1; i++) {
            g.moveTo(level.boundaries.bottom[i].x, level.boundaries.bottom[i].y * height);
            g.lineTo(level.boundaries.bottom[i+1].x, level.boundaries.bottom[i+1].y * height);
        }
        g.stroke();

        // Pits (Voids)
        if (level.boundaries.pits) {
            g.setStrokeStyle({ width: 2, color: 0xff0000, alpha: 0.3 });
            level.boundaries.pits.forEach(pit => {
                g.rect(pit.start, height * 0.4, pit.end - pit.start, height * 0.5)
                 .fill({ color: 0xff4444, alpha: 0.2 });
            });
        }
    }
  }, [loading, level, tileSize, isDevMode, height]);

  const goalPos = useMemo(() => {
    for (let y = 0; y < level.map.length; y++) {
      for (let x = 0; x < level.map[0].length; x++) {
        if (level.map[y][x] === TILE_TYPES.GOAL) {
          return { x: x * tileSize + tileSize/2, y: y * tileSize + tileSize/2 };
        }
      }
    }
    return null;
  }, [level, tileSize]);

  const triggerDeath = useCallback(() => {
    if (isDevMode || player.current.deathAnimationStarted) return;
    player.current.deathAnimationStarted = true;
    player.current.vy = -12;
    setTimeout(() => onGameOver?.(), 1500);
  }, [isDevMode, onGameOver]);

  // --- Sub-systems for Update Loop ---

  // helper for organic boundaries
  const getYBoundary = useCallback((x, points) => {
    if (!points || points.length === 0) return 0;
    // Find segments
    for (let i = 0; i < points.length - 1; i++) {
        if (x >= points[i].x && x <= points[i + 1].x) {
            const t = (x - points[i].x) / (points[i + 1].x - points[i].x);
            return (points[i].y + t * (points[i + 1].y - points[i].y)) * height;
        }
    }
    return points[x < points[0].x ? 0 : points.length - 1].y * height;
  }, [height]);

  const handlePhysics = (dt) => {
    const p = player.current;
    if (p.deathAnimationStarted) {
        p.vy += 0.5 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        return;
    }

    // Horizontal movement (A / D / Arrows)
    let targetVx = 0;
    if (keys['ArrowLeft'] || keys['KeyA']) { targetVx = -GAME_CONFIG.WALK_SPEED; p.direction = -1; }
    else if (keys['ArrowRight'] || keys['KeyD']) { targetVx = GAME_CONFIG.WALK_SPEED; p.direction = 1; }
    p.vx += (targetVx - p.vx) * 0.4;
    p.x += p.vx * dt;

    // X boundaries
    const mapWidth = level.map[0].length * tileSize;
    p.x = Math.max(20, Math.min(p.x, mapWidth - 60));

    // Depth movement (W / S / Arrows)
    let targetVy = 0;
    const depthSpeed = GAME_CONFIG.WALK_SPEED * 0.6;
    if (keys['KeyW'] || keys['ArrowUp']) { targetVy = -depthSpeed; }
    else if (keys['KeyS'] || keys['ArrowDown']) { targetVy = depthSpeed; }
    
    // Smooth vertical position (depth)
    p.baseY = p.baseY || p.y;
    p.baseY += targetVy * dt;

    // Dynamic boundaries from level config (red lines logic)
    const topLimit = level.boundaries ? getYBoundary(p.x, level.boundaries.top) : height * 0.5;
    const bottomLimit = level.boundaries ? getYBoundary(p.x, level.boundaries.bottom) : height * 0.85;

    p.baseY = Math.max(topLimit, Math.min(p.baseY, bottomLimit));

    // Jump logic (Spacebar)
    const isJumping = keys['Space'];
    if (isJumping && p.onGround) {
        p.jumpVelocity = GAME_CONFIG.JUMP_FORCE;
        p.onGround = false;
    }

    // Handle Jump Physics (Z-axis)
    if (!p.onGround) {
        p.jumpVelocity += 0.6 * dt; // Gravity
        p.zOffset = (p.zOffset || 0) + p.jumpVelocity * dt;
        
        if (p.zOffset >= 0) {
            p.zOffset = 0;
            p.jumpVelocity = 0;
            p.onGround = true;
        }
    } else {
        p.zOffset = 0;
    }

    // Update final visual Y
    p.y = p.baseY + (p.zOffset || 0);
  };

  const handleCamera = () => {
    const p = player.current;
    const maxScroll = (level.map[0].length * tileSize) - width;

    if (isDevMode) {
        const speed = 15;
        if (keys['ArrowLeft'] || keys['KeyA']) camera.current.x -= speed;
        if (keys['ArrowRight'] || keys['KeyD']) camera.current.x += speed;
    } else {
        const targetCamX = Math.max(0, Math.min(p.x - width / 2, maxScroll));
        camera.current.x += (targetCamX - camera.current.x) * 0.15;
    }
    
    camera.current.x = Math.max(0, Math.min(camera.current.x, maxScroll));
  };

  const updateVisuals = () => {
    const p = player.current;
    
    // Container Smoothing
    if (containerRef.current) {
        containerRef.current.position.set(-camera.current.x, -camera.current.y);
    }

    // Player Sprite
    if (spriteRef.current) {
        const breathe = Math.sin(Date.now() * 0.003) * 0.005;
        const walkAnim = p.onGround && p.vx !== 0 ? Math.abs(Math.sin(Date.now() * 0.01)) * 3 : 0;
        
        spriteRef.current.position.set(Math.round(p.x + p.width/2), Math.round(p.y + p.height) - walkAnim);
        spriteRef.current.scale.set(p.direction * (0.15 + breathe), 0.15 - breathe);
        
        if (p.deathAnimationStarted) {
            spriteRef.current.rotation += 0.2;
            spriteRef.current.tint = 0xff4444;
        } else {
            spriteRef.current.tint = 0xcc99ff;
        }
    }

    // Portal
    if (portalRef.current) {
        portalRef.current.scale.set(0.3 * (1 + Math.sin(portalPhase.current * 2) * 0.1)); 
        portalRef.current.alpha = 0.8 + Math.sin(portalPhase.current) * 0.3;
    }
    
    // Background is now a static world sprite, no parallax needed here
  };

  useTick((ticker) => {
    if (loading || isPaused) return;
    const dt = Math.min(ticker.deltaTime, 1.5);
    portalPhase.current += 0.05 * dt;

    handlePhysics(dt);
    handleCamera();
    updateVisuals();

    // Check Level Complete
    if (goalPos && !isDevMode && !player.current.deathAnimationStarted) {
        const p = player.current;
        const dx = (p.x + p.width / 2) - goalPos.x;
        const dy = p.baseY - (level.groundY - 50); // Using baseY for depth check
        if (Math.abs(dx) < 50 && Math.abs(dy) < 60) onComplete?.();
    }
  });

  if (loading) return null;

  return (
    <container>
      <container ref={containerRef}>
        {textures.background && (
          <sprite 
            texture={textures.background} 
            width={level.map[0].length * tileSize} 
            height={height}
            alpha={1}
          />
        )}
        <graphics ref={levelGraphicsRef} />
        {textures.portal && goalPos && (
            <sprite ref={portalRef} texture={textures.portal} anchor={0.5} x={goalPos.x} y={level.groundY - 50} />
        )}
        <sprite ref={spriteRef} texture={textures.wizard} anchor={{ x: 0.5, y: 1 }} visible={!isDevMode} />
      </container>
      {isDevMode && (
          <container x={20} y={20}>
              <text text="MODO OBSERVADOR (DEV)" style={{ fontFamily: '"Press Start 2P"', fontSize: 14, fill: '#ffffff' }} alpha={0.7} />
          </container>
      )}
    </container>
  );
};

export default World;
