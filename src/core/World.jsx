import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useTick, extend } from '@pixi/react';
import { Container, Graphics, Sprite, Text, TextStyle, Assets, TilingSprite, Matrix } from 'pixi.js';
import { GAME_CONFIG, PLAYER_CONFIG } from '../config/constants';
import { LEVELS, TILE_TYPES } from '../config/levels';
import { useKeyboard } from '../hooks/useKeyboard';

extend({ Container, Graphics, Sprite, Text, TilingSprite });

const World = ({ levelId = 1, onGameOver, onComplete, gameState, isPaused }) => {
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
  const shadowRef = useRef(null);

  const portalPhase = useRef(0);

  const player = useRef({
    x: level.startX,
    y: level.startY,
    vx: 0,
    vy: 0,
    width: PLAYER_CONFIG.WIDTH,
    height: PLAYER_CONFIG.HEIGHT,
    onGround: true, // Ahora aparece directamente sobre la roca, sin caer
    direction: 1,
    jumpTimer: 0,
    isJumping: false,
    deathAnimationStarted: false,
    platform: null
  });

  const platforms = useRef(
    (level.movingPlatforms || []).map((p, i) => ({
      ...p,
      id: i,
      baseX: p.x * tileSize,
      baseY: p.y * tileSize,
      currentX: p.x * tileSize,
      currentY: p.y * tileSize,
      curWidth: p.width * tileSize,
      time: 0
    }))
  );

  const camera = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        const cacheBust = `?v=${Date.now()}`;
        const [wiz, port, bg] = await Promise.all([
          Assets.load(`/wizard.png${cacheBust}`),
          Assets.load(`/${level.portal}${cacheBust}`),
          Assets.load(`/${level.background}${cacheBust}`)
        ]);
        
        if (wiz.source) wiz.source.scaleMode = 'nearest';
        if (bg.source) bg.source.scaleMode = 'nearest';

        setTextures({ wizard: wiz, portal: port, background: bg });
        setLoading(false);
      } catch (err) {
        console.error("Critical Asset Loading Error:", err);
      }
    };
    loadAssets();
  }, [levelId, level.background, level.portal]);

  useEffect(() => {
    platforms.current = (level.movingPlatforms || []).map((p, i) => ({
      ...p,
      id: i,
      baseX: p.x * tileSize,
      baseY: p.y * tileSize,
      currentX: p.x * tileSize,
      currentY: p.y * tileSize,
      curWidth: p.width * tileSize,
      time: 0
    }));
    
    player.current = {
      ...player.current,
      x: level.startX,
      y: level.startY,
      vx: 0,
      vy: 0,
      onGround: true, // Aparecer pisando firme en la roca del nuevo nivel
      platform: null,
      deathAnimationStarted: false
    };
  }, [level, tileSize]);

  const getTileAt = (tx, ty) => {
    if (ty < 0 || ty >= level.map.length || tx < 0 || tx >= level.map[0].length) return TILE_TYPES.EMPTY;
    return level.map[ty][tx];
  };

  const triggerDeath = () => {
    if (isDevMode) return;
    if (player.current.deathAnimationStarted) return;
    player.current.deathAnimationStarted = true;
    player.current.vy = -12;
    player.current.vx = (Math.random() - 0.5) * 8;
    setTimeout(() => onGameOver && onGameOver(), 2000);
  };

  const checkCollision = (nx, ny) => {
    const p = player.current;
    if (p.deathAnimationStarted) return false;
    if (ny > GAME_CONFIG.HEIGHT) { triggerDeath(); return false; }

    const margin = 2;
    const corners = [
        { x: nx + margin, y: ny + margin },
        { x: nx + p.width - margin, y: ny + margin },
        { x: nx + margin, y: ny + p.height - margin },
        { x: nx + p.width - margin, y: ny + p.height - margin }
    ];

    for (const c of corners) {
        const tx = Math.floor(c.x / tileSize);
        const ty = Math.floor(c.y / tileSize);
        const tile = getTileAt(tx, ty);
        if (tile === TILE_TYPES.SPIKES) { triggerDeath(); return false; }
        if (tile === TILE_TYPES.FLOOR || tile === TILE_TYPES.WALL) return true;
    }
    return false;
  };

  useTick((ticker) => {
    if (loading || isPaused) return;

    const p = player.current;
    const dt = Math.min(ticker.deltaTime, 1.5);
    portalPhase.current += 0.05 * dt;

    if (isDevMode) {
        if (keys['ArrowLeft'] || keys['KeyA']) camera.current.x -= 15 * dt;
        if (keys['ArrowRight'] || keys['KeyD']) camera.current.x += 15 * dt;
        const maxScroll = (level.map[0].length * tileSize) - GAME_CONFIG.WIDTH;
        camera.current.x = Math.max(0, Math.min(camera.current.x, maxScroll));
    }

    if (!isDevMode) {
        if (p.deathAnimationStarted) {
          p.vy += 0.5 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
          if (spriteRef.current) {
            spriteRef.current.position.set(p.x + p.width/2, p.y + p.height);
            spriteRef.current.rotation += 0.2 * dt;
            spriteRef.current.tint = 0xff4444;
          }
          return;
        }

        let targetVx = 0;
        if (keys['ArrowLeft'] || keys['KeyA']) { targetVx = -GAME_CONFIG.WALK_SPEED; p.direction = -1; }
        else if (keys['ArrowRight'] || keys['KeyD']) { targetVx = GAME_CONFIG.WALK_SPEED; p.direction = 1; }

        p.vx += (targetVx - p.vx) * 0.3;
        if (Math.abs(p.vx) < 0.1 && targetVx === 0) p.vx = 0;
        p.x += p.vx * dt;

        const jumpPressed = keys['Space'] || keys['ArrowUp'] || keys['KeyW'];
        if (jumpPressed && p.onGround) {
            p.vy = GAME_CONFIG.JUMP_FORCE;
            p.onGround = false;
        }

        if (!p.onGround) {
            p.vy += 0.6 * dt; 
            p.y += p.vy * dt;
            if (p.y + p.height >= level.groundY) {
                p.y = level.groundY - p.height;
                p.vy = 0;
                p.onGround = true;
            }
        } else {
            p.y = level.groundY - p.height;
            p.vy = 0;
        }

        const targetCamX = Math.max(0, Math.min(p.x - GAME_CONFIG.WIDTH / 2, (level.map[0].length * tileSize) - GAME_CONFIG.WIDTH));
        const targetCamY = Math.max(0, Math.min(p.y - (GAME_CONFIG.HEIGHT * 0.6), (level.map.length * tileSize) - GAME_CONFIG.HEIGHT));
        
        camera.current.x += (targetCamX - camera.current.x) * 0.1;
        camera.current.y += (targetCamY - camera.current.y) * 0.1;
    }

    if (containerRef.current) {
        containerRef.current.position.x = -camera.current.x;
        containerRef.current.position.y = -camera.current.y;
    }
    
    if (spriteRef.current && !isDevMode) {
      spriteRef.current.position.set(Math.round(p.x + p.width/2), Math.round(p.y + p.height));
      const breathe = Math.sin(Date.now() * 0.003) * 0.005;
      const walkAnim = p.onGround && p.vx !== 0 ? Math.abs(Math.sin(Date.now() * 0.01)) * 3 : 0;
      
      spriteRef.current.y = Math.round(p.y + p.height) - walkAnim;
      spriteRef.current.scale.set(p.direction * (0.15 + breathe), 0.15 - breathe);
      spriteRef.current.tint = 0xcc99ff; 

      if (levelGraphicsRef.current) {
          const g = levelGraphicsRef.current;
          g.clear(); 
          const jumpHeight = level.groundY - (p.y + p.height);
          const shadowAlpha = Math.max(0.05, 0.4 - (jumpHeight * 0.005));
          const shadowWidth = Math.max(5, 20 - (jumpHeight * 0.1));
          
          g.ellipse(p.x + p.width/2, level.groundY, shadowWidth, 4)
           .fill({ color: 0x000000, alpha: shadowAlpha });
      }
    }

    if (portalRef.current) {
        const portalPower = 1 + Math.sin(portalPhase.current * 2) * 0.1;
        portalRef.current.scale.set(0.3 * portalPower); 
        portalRef.current.alpha = 0.8 + Math.sin(portalPhase.current) * 0.3;
        portalRef.current.y = level.groundY - 50; 
        portalRef.current.x = goalPos.x;
    }
    
    if (backgroundRef.current && textures.background) {
      const bgScaleX = GAME_CONFIG.WIDTH / textures.background.width;
      const bgScaleY = GAME_CONFIG.HEIGHT / textures.background.height;
      backgroundRef.current.tilePosition.x = (-camera.current.x * 0.2) / bgScaleX;
      backgroundRef.current.tilePosition.y = (-camera.current.y * 0.1) / bgScaleY;
    }

    if (goalPos && !isDevMode && !p.deathAnimationStarted) {
        const dx = (p.x + p.width / 2) - goalPos.x;
        const dy = (p.y + p.height / 2) - (level.groundY - 50);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 40) onComplete && onComplete();
    }
  });

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

  const devTextStyle = new TextStyle({
    fontFamily: '"Press Start 2P"',
    fontSize: 14,
    fill: '#ffffff',
    align: 'left',
  });

  if (loading) return null;

  return (
    <pixiContainer>
      {textures.background && (
        <pixiTilingSprite 
          ref={backgroundRef} 
          texture={textures.background} 
          width={GAME_CONFIG.WIDTH} 
          height={GAME_CONFIG.HEIGHT}
          tileScale={{ 
            x: GAME_CONFIG.WIDTH / textures.background.width, 
            y: GAME_CONFIG.HEIGHT / textures.background.height 
          }}
        />
      )}
      
      <pixiContainer ref={containerRef}>
        <pixiGraphics ref={levelGraphicsRef} />
        {textures.portal && goalPos && (
            <pixiSprite ref={portalRef} texture={textures.portal} anchor={0.5} scale={0.5} />
        )}
        <pixiSprite ref={spriteRef} texture={textures.wizard} anchor={{ x: 0.5, y: 1 }} visible={!isDevMode} />
      </pixiContainer>

      {isDevMode && (
          <pixiContainer x={20} y={20}>
              <pixiText text="MODO OBSERVADOR (DEV)" style={devTextStyle} alpha={0.7} />
              <pixiText text="USA LAS FLECHAS PARA EXPLORAR EL MAPA" y={25} style={devTextStyle} scale={0.6} alpha={0.5} />
          </pixiContainer>
      )}
    </pixiContainer>
  );
};

export default World;
