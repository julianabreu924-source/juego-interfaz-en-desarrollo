import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GAME_CONFIG, PLAYER_CONFIG } from '../config/constants';
import { LEVELS, TILE_TYPES } from '../config/levels';

// Helper to read pixel data from a Phaser Texture for collision
const getPixelCollision = (scene, x, y, textureKey, width, height) => {
    if (!scene.textures.exists(textureKey)) return false;
    
    // We need to access the texture source data
    const texture = scene.textures.get(textureKey);
    const canvas = scene.textures.getPixel(x, y, textureKey);
    
    // If alpha is > 0 (or specific color), it's solid. 
    // Assuming black/white map or just alpha presence.
    return canvas && canvas.alpha > 0;
};

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    init(data) {
        this.levelId = data.levelId;
        this.levelData = LEVELS[this.levelId];
        this.onGameOver = data.onGameOver;
        this.onComplete = data.onComplete;
        this.isDevMode = data.isDevMode;
    }

    preload() {
        // Load Level Assets
        this.load.image('wizard', '/src/assets/images/characters/wizard.png');
        
        // Dynamically load level specific assets
        if (this.levelData.background) {
            this.load.image('background', this.levelData.background);
        }
        if (this.levelData.portal) {
            this.load.image('portal', this.levelData.portal);
        }
        if (this.levelData.collisionMap) {
            this.load.image('collision', this.levelData.collisionMap);
        }
    }

    create() {
        const { width, height } = this.scale;
        const mapWidth = this.levelData.map[0].length * GAME_CONFIG.TILE_SIZE;
        
        // 1. Setup World Bounds
        this.physics.world.setBounds(0, 0, mapWidth, height);
        
        // 2. Background
        if (this.textures.exists('background')) {
            const bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
            bg.displayWidth = mapWidth;
            bg.displayHeight = height;
            bg.setDepth(0); // Layer 0
        }

        // 3. Collision Visualization (Dev Mode) or Hidden Data
        if (this.textures.exists('collision')) {
            const col = this.add.image(0, 0, 'collision').setOrigin(0, 0);
            col.displayWidth = mapWidth;
            col.displayHeight = height;
            col.setAlpha(this.isDevMode ? 0.5 : 0); // Hide in normal mode
            col.setDepth(10);
            
            // Allow reading pixels
            // Note: Phaser 3.60+ handles texture data differently, ensuring we can read it is key.
            // Often easiest to draw to a hidden canvas if textures are WebGL only, 
            // but `textures.getPixel` works if the source is available.
        }

        // 4. Portal
        this.portalActivated = false;
        if (this.textures.exists('portal')) {
            // Find goal pos
            let goalX = 0, goalY = 0;
            this.levelData.map.forEach((row, y) => {
                row.forEach((tile, x) => {
                    if (tile === TILE_TYPES.GOAL) {
                        goalX = x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE/2;
                        goalY = y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE/2;
                    }
                });
            });
            
            this.portal = this.add.sprite(goalX, goalY, 'portal');
            this.portal.setScale(0.3);
            this.portal.setDepth(1);
            
            // Portal Animation (Tween)
            this.tweens.add({
                targets: this.portal,
                scale: 0.35,
                alpha: 0.8,
                duration: 1000,
                yoyo: true,
                repeat: -1
            });
        }

        // 5. Player Setup
        this.player = this.add.sprite(this.levelData.startX, this.levelData.startY, 'wizard');
        this.player.setOrigin(0.5, 1); // Feet pivot
        this.player.setScale(0.15);
        this.player.setDepth(5);
        
        // Custom Physics State
        this.pState = {
            velocity: { x: 0, y: 0 },
            onGround: false,
            jumpVelocity: 0,
            zOffset: 0,
            isDead: false
        };

        // 6. Camera
        this.cameras.main.setBounds(0, 0, mapWidth, height);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);

        // Inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            d: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
        
        // Create invisible canvas for pixel data if needed
        // (Phaser's `textures.getPixel` handles this usually)
    }

    update(time, delta) {
        if (this.pState.isDead) return;

        const dt = delta / 1000; // Seconds
        const speed = 200; // Pixels per second
        let vx = 0;
        let vy = 0;

        // --- INPUT ---
        if (this.cursors.left.isDown || this.wasd.a.isDown) {
            vx = -speed;
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown || this.wasd.d.isDown) {
            vx = speed;
            this.player.setFlipX(false);
        }

        // Depth movement (Z-simulated Y)
        if (this.cursors.up.isDown || this.wasd.w.isDown) {
            vy = -speed * 0.7;
        } else if (this.cursors.down.isDown || this.wasd.s.isDown) {
            vy = speed * 0.7;
        }

        // --- COLLISION LOGIC (Custom Pixel Check) ---
        // We calculate next position
        const nextX = this.player.x + vx * dt;
        const nextY = this.player.y + vy * dt;
        
        let canMoveX = true;
        let canMoveY = true;

        // Check Collision Map if exists
        if (this.textures.exists('collision')) {
            // Simple point check at feet
            const isSolid = (x, y) => {
                 const color = this.textures.getPixel(x, y, 'collision');
                 // Assume BLACK is wall/void, TRANSPARENT/WHITE is walkable?
                 // Let's match previous logic: usually Walkable = specific color or Void = alpha 0
                 // Let's assume ALPHA > 0 means "Walkable Area" (Mask) OR "Obstacle"?
                 // In the previous code `collisionMap.js`, `canWalk` checked a canvas context.
                 // Let's assume the map defines the FLOOR. So color = valid.
                 return color && color.a > 0;
            };

            // Check if next position is valid floor
            if (!isSolid(nextX, this.player.y)) canMoveX = false;
            if (!isSolid(this.player.x, nextY)) canMoveY = false;
        }

        // Move
        if (canMoveX) this.player.x += vx * dt;
        if (canMoveY) this.player.y += vy * dt;
        
        // Keep in bounds
        this.player.x = Phaser.Math.Clamp(this.player.x, 20, this.physics.world.bounds.width - 20);
        this.player.y = Phaser.Math.Clamp(this.player.y, 50, this.physics.world.bounds.height - 50);


        // --- JUMP (Fake Z-Axis) ---
        const isJump = Phaser.Input.Keyboard.JustDown(this.cursors.space) || Phaser.Input.Keyboard.JustDown(this.wasd.space);
        
        if (isJump && this.pState.onGround) {
            this.pState.onGround = false;
            this.pState.jumpVelocity = 300; // Jump force
        }

        if (!this.pState.onGround) {
            this.pState.jumpVelocity -= 800 * dt; // Gravity
            this.pState.zOffset += this.pState.jumpVelocity * dt;

            if (this.pState.zOffset <= 0) {
                this.pState.zOffset = 0;
                this.pState.onGround = true;
                this.pState.jumpVelocity = 0;
                
                // Land FX could go here
            }
        }
        
        // Apply Z-offset to visual sprite Y (but keep logical Y for depth sorting/collision)
        // Actually, in restricted 2.5D, player.y is the floor position.
        // We use a container or manipulate the sprite's display origin/offset.
        // Let's just offset the Y visually? No, that messes up collision check next frame.
        // Better: Use `this.player.y` as logical floor, and set `this.player.y` strictly for logic, 
        // but since Phaser couples them, we might interpret `y` as floor, and draw sprite offset?
        // No, simplest migration: Adjust Y visually only? 
        // Actually, let's just subtract Z from Y for the sprite, but we need to track "Base Y".
        // Oh right, Phaser sprite x/y IS the position.
        // Let's store `baseY` on the player object.
        if (this.player.baseY === undefined) this.player.baseY = this.player.y;
        
        // Sync Base Y with movement
        if (canMoveY) this.player.baseY += vy * dt;
        
        // Render Position
        this.player.y = this.player.baseY - this.pState.zOffset;


        // --- PORTAL CHECK ---
        if (this.portal && !this.portalActivated && !this.isDevMode) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.baseY, this.portal.x, this.portal.y);
            if (dist < 50) {
                this.portalActivated = true;
                this.onComplete && this.onComplete();
            }
        }
        
        // --- DEATH CHECK (Boundaries fallback) ---
        // If needed
    }
}

const World = ({ levelId = 1, onGameOver, onComplete, gameState, width, height }) => {
    const gameRef = useRef(null);
    const parentRef = useRef(null);

    useEffect(() => {
        if (!parentRef.current) return;

        const config = {
            type: Phaser.AUTO,
            width: width,
            height: height,
            parent: parentRef.current,
            backgroundColor: '#1a072a',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 }, // Top-down style walking
                    debug: gameState === 'dev-viewer'
                }
            },
            scene: [MainScene],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;
        
        // Pass React Props to Scene
        game.scene.start('MainScene', { 
            levelId, 
            onGameOver, 
            onComplete, 
            isDevMode: gameState === 'dev-viewer' 
        });

        return () => {
            game.destroy(true);
        };
    }, [levelId, gameState, width, height]);

    return (
        <div ref={parentRef} style={{ width: '100%', height: '100%' }} />
    );
};

export default World;
