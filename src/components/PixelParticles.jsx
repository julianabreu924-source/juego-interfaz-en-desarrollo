import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Particle = ({ x, y, color }) => {
  const destinationX = (Math.random() - 0.5) * 150;
  const destinationY = (Math.random() - 0.5) * 150;
  
  return (
    <motion.div
      initial={{ 
        left: x, 
        top: y, 
        opacity: 1, 
        scale: 1,
        width: 6,
        height: 6
      }}
      animate={{ 
        left: x + destinationX, 
        top: y + destinationY, 
        opacity: 0,
        scale: 0,
        rotate: Math.random() * 360
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        position: 'fixed',
        backgroundColor: color,
        zIndex: 9999,
        pointerEvents: 'none',
        boxShadow: '2px 2px 0px #000',
        imageRendering: 'pixelated'
      }}
    />
  );
};

const PixelParticles = () => {
  const [particles, setParticles] = useState([]);

  const createParticles = useCallback((e) => {
    const color = e.target.classList.contains('primary') ? '#ffffff' : '#ffde59';
    const newParticles = Array.from({ length: 12 }).map(() => ({
      id: Math.random(),
      x: e.clientX,
      y: e.clientY,
      color: color
    }));

    setParticles(prev => [...prev, ...newParticles]);
    
    // Cleanup
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 600);
  }, []);

  // Expose to window for easy access from any button
  React.useEffect(() => {
    window.spawnParticles = createParticles;
    return () => delete window.spawnParticles;
  }, [createParticles]);

  return (
    <AnimatePresence>
      {particles.map(p => (
        <Particle key={p.id} x={p.x} y={p.y} color={p.color} />
      ))}
    </AnimatePresence>
  );
};

export default PixelParticles;
