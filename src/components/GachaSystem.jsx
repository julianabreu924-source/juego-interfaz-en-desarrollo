import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import wizardImg from '../assets/images/characters/wizard.png';
import hunterImg from '../assets/images/characters/CAZADORA_ELFO-removebg-preview.png';
import warriorImg from '../assets/images/characters/MAGO_DE_BATALLA_2D-removebg-preview.png';
import reinaImg from '../assets/images/characters/Reina.png';
import swordImg from '../assets/images/ui/sword_icon.png';
import gemIcon from '../assets/images/ui/gem_icon.png';
import '../index.css';

import { BANNERS, ITEMS } from '../config/gameData';
import { useGameStore } from '../store/useGameStore';

const GachaSystem = ({ onBack }) => {
  const { spendGems, addCharacter, gems } = useGameStore();
  const [phase, setPhase] = useState('idle'); // idle, wishing, result
  const [rewards, setRewards] = useState([]);
  const [legendaryQueue, setLegendaryQueue] = useState([]); 
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  
  const currentBanner = BANNERS[currentBannerIdx];

  const nextBanner = () => setCurrentBannerIdx(prev => (prev + 1) % BANNERS.length);
  const prevBanner = () => setCurrentBannerIdx(prev => (prev - 1 + BANNERS.length) % BANNERS.length);
  
  const generatePull = () => {
      const rand = Math.random() * 100;
      let baseItem;
      if (rand < 5) baseItem = currentBanner.character;
      else if (rand < 25) baseItem = ITEMS.find(i => i.rarity === 4) || ITEMS[0];
      else {
          const commons = ITEMS.filter(i => i.rarity === 3);
          baseItem = commons[Math.floor(Math.random() * commons.length)];
      }
      
      // If it's a character (rarity 5), add to collection
      if (baseItem.rarity === 5) {
          addCharacter(baseItem);
      }

      return { ...baseItem, instanceId: `${baseItem.id}_${Date.now()}_${Math.random()}` };
  };

  const pullGacha = (count) => {
    const cost = count === 1 ? 160 : 1600;
    if (gems < cost) {
        alert("¡No tienes suficientes gemas!");
        return;
    }

    spendGems(cost);
    const newRewards = [];
    for (let i = 0; i < count; i++) {
        newRewards.push(generatePull());
    }
    
    newRewards.sort((a, b) => b.rarity - a.rarity);
    const legendaries = newRewards.filter(r => r.rarity === 5);
    setLegendaryQueue(legendaries);
    setRewards(newRewards);
    setPhase('wishing');
  };

  // Animation Sequence
  useEffect(() => {
    if (phase === 'wishing') {
        const timer = setTimeout(() => {
            setPhase('result');
        }, 2500); // 2.5s travel animation
        return () => clearTimeout(timer);
    }
  }, [phase]);

  const reset = () => {
    setPhase('idle');
    setRewards([]);
    setLegendaryQueue([]);
  };
  
  const nextLegendary = () => {
      setLegendaryQueue(prev => prev.slice(1));
  };

  // Determine Main Meteor Color (Best Item)
  const getUpdateMeteorColor = () => {
      if (rewards.length === 0) return '#fff';
      const maxRarity = Math.max(...rewards.map(r => r.rarity));
      if (maxRarity === 5) return '#ffd700'; // Gold
      if (maxRarity === 4) return '#a855f7'; // Purple
      return '#4488ff'; // Blue
  };
  
  // Current flashing item
  const revealItem = legendaryQueue[0];

  return (
    <div className="gacha-overlay">
       {phase === 'idle' && (
           <div className="stars-bg-layer" />
       )}

       {/* PHASE 1: BANNER (IDLE) */}
       <AnimatePresence mode="wait">
         {phase === 'idle' && (
           <motion.div 
             key={currentBanner.id} // Re-render on banner change
             className="wish-banner pixel-panel"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             transition={{ duration: 0.3 }}
           >
              {/* Close Button */}
              <button className="close-btn-corner pixel-btn-close" onClick={onBack} style={{ zIndex: 100 }}>
                <X size={24} />
              </button>

              {/* Navigation Arrows */}
              <button 
                onClick={prevBanner}
                className="banner-nav-btn left"
              >
                  <ChevronLeft size={32} />
              </button>
              <button 
                onClick={nextBanner}
                className="banner-nav-btn right"
              >
                  <ChevronRight size={32} />
              </button>

              {/* Left Art */}
              <div className="banner-art-section">
                 <div className="banner-art-frame">
                     <motion.img 
                       key={currentBanner.character.image}
                       src={currentBanner.character.image} 
                       className="banner-char-img"
                       animate={{ x: [0, -10, 0] }}
                       transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                     />
                 </div>
              </div>

              {/* Right Info */}
              <div className="banner-info-section">
                  <div className="banner-attributes">
                      <span className="up-rate-badge pixel-badge">UP RATE</span>
                  </div>
                  <h1 className="banner-title pixel-text-title">{currentBanner.title}</h1>
                  <div className="banner-subtitle pixel-text-subtitle" style={{ color: currentBanner.color }}>{currentBanner.subTitle}</div>
                  
                  <div className="wish-controls">
                      <button className="wish-btn pixel-btn" onClick={() => pullGacha(1)}>
                          <span className="wish-btn-label">INVOCAR x1</span>
                          <span className="wish-cost">
                              <img src={gemIcon} className="pixel-gem-icon-sm" alt="Gem" /> 
                              160
                          </span>
                      </button>
                      <button className="wish-btn pixel-btn gold" onClick={() => pullGacha(10)}>
                          <span className="wish-btn-label">INVOCAR x10</span>
                          <span className="wish-cost">
                              <img src={gemIcon} className="pixel-gem-icon-sm" alt="Gem" /> 
                              1600
                          </span>
                      </button>
                  </div>
              </div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* PHASE 2: WISHING ANIMATION */}
       {phase === 'wishing' && rewards.length > 0 && (
           <div className="summon-animation-layer">
               {/* INTRO FLASH */}
               <motion.div 
                   style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 999 }}
                   initial={{ opacity: 1 }}
                   animate={{ opacity: 0 }}
                   transition={{ duration: 0.5 }}
               />

               {/* Meteor moving across screen with CENTERED ARC */}
               <motion.div 
                   className="meteor-star"
                   style={{ '--meteor-color': getUpdateMeteorColor() }}
                   initial={{ x: '120vw', y: '-20vh', scale: 0.5, rotate: 15 }}
                   animate={{ x: '-20vw', y: '120vh', scale: [1, 2, 0], rotate: 45 }}
                   transition={{ duration: 2.0, ease: "easeInOut" }}
               >
                   <div className="meteor-trail" />
               </motion.div>
               
               {/* Pixel Particles Trail */}
                {rewards.length > 1 && [...Array(15)].map((_, i) => (
                    <motion.div 
                        key={i}
                        className="meteor-star"
                        style={{ 
                            '--meteor-color': i % 2 === 0 ? '#4488ff' : '#fff', 
                            width: Math.random() * 10 + 5, 
                            height: Math.random() * 10 + 5,
                            borderRadius: 0 
                        }}
                        initial={{ x: '120vw', y: '-20vh', opacity: 0 }}
                        animate={{ 
                            x: '-25vw', 
                            y: '125vh', 
                            opacity: [0, 1, 0],
                            rotate: Math.random() * 360
                        }}
                        transition={{ 
                            duration: 2.0 + Math.random() * 0.5, 
                            delay: Math.random() * 0.5, 
                            ease: "easeInOut" 
                        }}
                    />
                ))}
               
                {/* Final Impact Flash */}
               <motion.div 
                  style={{ position: 'absolute', inset: 0, background: '#fff' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1] }}
                  transition={{ delay: 1.8, duration: 0.2 }} // Sync with meteor exit
               />
           </div>
       )}

       {/* PHASE 3: RESULT REVEAL */}
       {phase === 'result' && rewards.length > 0 && (
           <>
              {/* LEGENDARY REVEAL SCENE (If queue has items) */}
              {legendaryQueue.length > 0 ? (
                  <div key={revealItem.instanceId} className="legendary-reveal-overlay" onClick={nextLegendary}>
                      <div className="legendary-rays" />
                      <div className="legendary-burst" />
                      
                      <div className="legendary-char-container">
                          <img src={revealItem.image} className="legendary-char-img" />
                          <div className="legendary-title">{revealItem.name}</div>
                          <div className="legendary-stars">
                               {[...Array(5)].map((_, i) => (
                                   <Star key={i} size={40} fill="#ffd700" color="#ffd700" />
                               ))}
                          </div>
                      </div>
                  </div>
              ) : (
                  // STANDARD RESULT SCREEN (Single or Grid)
                   <div className="gacha-result-scene" onClick={reset} style={{ overflowY: 'auto', alignItems: rewards.length > 1 ? 'flex-start' : 'center', paddingTop: rewards.length > 1 ? 40 : 0 }}>
                       <div className="stars-bg-layer" style={{ position: 'fixed' }} />
                       
                       {rewards.length === 1 ? (
                           // SINGLE RESULT (Non-Legendary, because legendary is caught above, UNLESS the queue emptied. If it was legendary, we saw it, now we see card.)
                            // Actually, let's show the card too so they can see stats.
                            <motion.div 
                                className="result-card-container"
                                initial={{ scale: 0, opacity: 0, rotateY: 90 }}
                                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                                transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                            >
                                <img 
                                    src={rewards[0].image} 
                                    className={`result-art-full frame-${rewards[0].rarity}`} 
                                />
                                
                                <div className="result-meta">
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, gap: 5 }}>
                                        {[...Array(rewards[0].rarity)].map((_, i) => (
                                            <Star key={i} size={20} fill="#ffd700" color="#ffd700" />
                                        ))}
                                    </div>
                                    <h2 style={{ fontSize: '1.2rem', marginBottom: 5 }}>{rewards[0].name}</h2>
                                    <p style={{ fontSize: '0.7rem', color: '#ccc' }}>{rewards[0].desc}</p>
                                    <p style={{ fontSize: '0.6rem', marginTop: 15, opacity: 0.5 }}>Click anywhere to close</p>
                                </div>
                            </motion.div>
                       ) : (
                           // MULTI RESULT GRID
                           <div style={{ 
                               display: 'grid', 
                               gridTemplateColumns: 'repeat(5, 1fr)', 
                               gap: '20px', 
                               maxWidth: '1000px', 
                               margin: 'auto', 
                               zIndex: 850,
                               paddingBottom: 40
                            }}>
                               {rewards.map((item, idx) => (
                                   <motion.div 
                                        key={idx}
                                        className={`result-card-mini frame-${item.rarity}`}
                                        style={{ 
                                            width: '100%', 
                                            aspectRatio: '3/5', 
                                            background: '#1a1a1a', 
                                            position: 'relative',
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: 10,
                                            borderRadius: 4
                                        }}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                   >
                                        <img src={item.image} style={{ width: '80%', flex: 1, objectFit: 'contain' }} />
                                        <div style={{ fontSize: '0.6rem', color: '#fff', textAlign: 'center', marginTop: 5 }}>{item.name}</div>
                                        <div style={{ display: 'flex', marginTop: 5 }}>
                                            {[...Array(item.rarity)].map((_, i) => (
                                                <Star key={i} size={8} fill="#ffd700" color="#ffd700" />
                                            ))}
                                        </div>
                                   </motion.div>
                               ))}
                           </div>
                       )}
                   </div>
              )}
           </>
       )}
    </div>
  );
};
export default GachaSystem;
