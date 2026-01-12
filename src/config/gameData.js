import wizardImg from '../assets/images/characters/wizard.png';
import hunterImg from '../assets/images/characters/CAZADORA_ELFO-removebg-preview.png';
import warriorImg from '../assets/images/characters/MAGO_DE_BATALLA_2D-removebg-preview.png';
import reinaImg from '../assets/images/characters/Reina.png';
import swordImg from '../assets/images/ui/sword_icon.png';

export const CHARACTERS = {
  SOLAS: {
    id: 'solas',
    name: 'Archimago Solas',
    rarity: 5,
    image: wizardImg,
    desc: 'Maestro de las Artes Arcanas, portador de magia cósmica antigua.',
    color: '#8a2be2',
    stats: { atk: 120, def: 40, hp: 800 }
  },
  ELFA: {
    id: 'elfa',
    name: 'Guardabosques Élfica',
    rarity: 5,
    image: hunterImg,
    desc: 'Una depredadora silenciosa de los bosques, nunca falla un tiro.',
    color: '#4caf50',
    stats: { atk: 100, def: 50, hp: 900 }
  },
  MAGO_BATALLA: {
    id: 'mago_batalla',
    name: 'Mago de Batalla',
    rarity: 5,
    image: warriorImg,
    desc: 'Combinando acero y hechicería para dominar el campo de batalla.',
    color: '#f44336',
    stats: { atk: 110, def: 80, hp: 1200 }
  },
  REINA: {
    id: 'reina',
    name: 'Reina',
    rarity: 5,
    image: reinaImg,
    desc: 'Sábia de la luz, especialista en restauración y protección divina.',
    color: '#ffd700',
    stats: { atk: 60, def: 70, hp: 1500 }
  }
};

export const BANNERS = [
  {
    id: 'banner_wizard',
    title: 'ASCENSIÓN\nARCANA',
    subTitle: 'Deseo de Evento - Archimago Solas',
    character: CHARACTERS.SOLAS,
    color: CHARACTERS.SOLAS.color
  },
  {
    id: 'banner_hunter',
    title: 'CAZA\nSILENCIOSA',
    subTitle: 'Deseo de Evento - Guardabosques Élfica',
    character: CHARACTERS.ELFA,
    color: CHARACTERS.ELFA.color
  },
  {
    id: 'banner_warrior',
    title: 'FORJADO EN\nBATALLA',
    subTitle: 'Deseo de Evento - Mago de Batalla',
    character: CHARACTERS.MAGO_BATALLA,
    color: CHARACTERS.MAGO_BATALLA.color
  },
  {
    id: 'banner_reina',
    title: 'LUZ\nDIVINA',
    subTitle: 'Deseo de Evento - Reina',
    character: CHARACTERS.REINA,
    color: CHARACTERS.REINA.color
  }
];

export const ITEMS = [
  { id: 'com_1', name: 'Daga Oxidada', rarity: 3, image: swordImg, desc: 'Mejor que nada' },
  { id: 'com_2', name: 'Pergamino Viejo', rarity: 3, image: swordImg, desc: 'Contiene hechizos básicos' },
  { id: 'rare_1', name: 'Báculo del Vacío', rarity: 4, image: swordImg, desc: 'Corrompido por magia oscura' },
];
