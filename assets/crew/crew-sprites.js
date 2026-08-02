/* Pixel crew, drawn from data rather than shipped as pictures.
 *
 * The members page represents the team with photographs of rubber ducks — 6.6 MB
 * of them, one 2.1 MB file rendered at 118 px. The characters those ducks carry
 * are good and are kept: whoever picked the chef, the golfer and the Batman had
 * a reason, and each becomes a prop here. What goes is the weight. Nineteen
 * sprites cost a couple of kilobytes of source and no network requests at all.
 *
 * Proportions follow the reference the owner supplied: a head about two fifths of
 * the figure, sloped shoulders rather than a rectangular torso, and every colour
 * carrying a shadow tone so shapes read as volume instead of flat blocks. An
 * earlier pass at 16x18 with a pure-black outline came out thin and papery, and
 * those three changes are what fix it.
 *
 * Each sprite is a 20x24 grid of single characters, one per pixel. Letters are
 * palette slots resolved per member, so one grid serves the whole crew:
 *
 *   .  transparent      K  outline          S/s  skin, shadow
 *   H/h hair, shadow    U/u shirt, shadow   P/p  trousers, shadow
 *   B  boot             E  eye              W    white
 *   A  accent (prop)
 */

export const CELL = 3;          // device-independent pixels per sprite pixel
export const SPRITE_W = 20;
export const SPRITE_H = 24;

/* Two frames. The legs step and the arms swap sides between them, which is the
   whole walk — at this size that reads better than any amount of extra detail. */
const BODY = [
  [
    '....................',
    '......KKKKKKKK......',
    '....KKHHHHHHHHKK....',
    '...KHHHHHHHHHHHHK...',
    '...KHHHHHHHHHHhhK...',
    '...KHSSSSSSSSSshK...',
    '...KHSSSSSSSSSshK...',
    '...KHSEESSSSEEshK...',
    '...KHSEESSSSEEshK...',
    '....KSSSSSSSSssK....',
    '.....KKSSSSSsKK.....',
    '.......KKKKKK.......',
    '.....KKUUUUUUKK.....',
    '...KKUUUUUUUUUUKK...',
    '..KSKUUUUUUUUUUuKK..',
    '..KSKUUUUUUUUUUuKK..',
    '..KSKUUUUUUUUUUuK...',
    '...KKUUUUUUUUUUuK...',
    '....KUUUUUUUUUUuK...',
    '....KPPPKKKKPPPpK...',
    '....KPPPK..KPPPpK...',
    '....KPPPK..KPPPpK...',
    '...KBBBBK..KBBBBK...',
    '...KKKKKK..KKKKKK...',
  ],
  [
    '....................',
    '......KKKKKKKK......',
    '....KKHHHHHHHHKK....',
    '...KHHHHHHHHHHHHK...',
    '...KHHHHHHHHHHhhK...',
    '...KHSSSSSSSSSshK...',
    '...KHSSSSSSSSSshK...',
    '...KHSEESSSSEEshK...',
    '...KHSEESSSSEEshK...',
    '....KSSSSSSSSssK....',
    '.....KKSSSSSsKK.....',
    '.......KKKKKK.......',
    '.....KKUUUUUUKK.....',
    '...KKUUUUUUUUUUKK...',
    '..KKUUUUUUUUUUuKSK..',
    '..KKUUUUUUUUUUuKSK..',
    '...KUUUUUUUUUUuKSK..',
    '...KUUUUUUUUUUuKK...',
    '...KUUUUUUUUUUuK....',
    '...KPPPKKKKPPPpK....',
    '...KPPPK..KPPPpK....',
    '....KPPK..KPPpK.....',
    '....KBBBK.KBBBK.....',
    '...KKKKKK.KKKKKK....',
  ],
];

/* One prop per member, carried over from the duck they already had. Each carries
   an anchor — without one they all drew from the grid origin and floated detached
   in the corner. Head props sit around rows 0-6, hand props around 13-16 where
   the body draws its hands. */
const PROPS = {
  chef:        { x: 5,  y: 0,  grid: ['KWWWWWWWWK', 'KWWWWWWWWK', 'KWWWWWWWWK', '.KWWWWWWK.'] },
  hat:         { x: 2,  y: 2,  grid: ['KKKKKKKKKKKKKKKK', '.KKAAAAAAAAAAKK.', '..KAAAAAAAAAAK..'] },
  holland:     { x: 3,  y: 4,  grid: ['KAAAAAAAAAAAAK'] },
  minion:      { x: 3,  y: 6,  grid: ['KAAAAAAAAAAAAK', 'KAWWKKKKWWAAAK', 'KAAAAAAAAAAAAK'] },
  batman:      { x: 3,  y: 1,  grid: ['K..........K', 'KK........KK', 'KKKKKKKKKKKK'] },
  hedgehog:    { x: 3,  y: 0,  grid: ['K.K.K.K.K.K.', 'KHKHKHKHKHKH'] },
  leopard:     { x: 4,  y: 3,  grid: ['KAK.KAK.KAK.', '.K.KAK.KAK.K'] },
  blueglitter: { x: 4,  y: 2,  grid: ['.W.W.W.W.W.', 'W.W.W.W.W.W'] },
  vacation:    { x: 2,  y: 2,  grid: ['KKKKKKKKKKKKKKKK', '.KWWWWWWWWWWWWK.', '..KAAAAAAAAAAK..'] },
  coffee:      { x: 16, y: 14, grid: ['KKK', 'KAK', 'KAK', 'KKK'] },
  golf:        { x: 16, y: 10, grid: ['..K', '..K', '.K.', 'K..', 'KA.'] },
  singer:      { x: 16, y: 12, grid: ['KAK', 'KAK', '.K.', '.K.'] },
  selfie:      { x: 16, y: 13, grid: ['KKKK', 'KWWK', 'KWWK', 'KKKK'] },
  influencer:  { x: 16, y: 13, grid: ['KKKK', 'KWWK', 'KWWK', 'KKKK'] },
  muslce:      { x: 0,  y: 14, grid: ['KAK', 'KAK', 'KAK'], mirror: { x: 17 } },
  dolphin:     { x: 16, y: 15, grid: ['.KKK', 'KAAK', '.KK.'] },
  clownfish:   { x: 16, y: 15, grid: ['.KKK', 'KAAK', '.KK.'] },
};

/* Role decides the shirt, so the crew reads as a crew and the shape of the team
   is visible at a glance. Muted against the site's own tokens, because the
   reference palette is desaturated and the raw brand red is far too hot next to
   skin at this size. */
const ROLE_SHIRT = {
  Mechanic:   ['#c8493f', '#9c3229'],
  Driver:     ['#c9a227', '#9a7a19'],
  Safety:     ['#dcd6cb', '#aca69b'],
  Media:      ['#5b8fb9', '#42688a'],
  Innovation: ['#8d6bd8', '#6a4da8'],
};

const HAIRS = [
  ['#2b1d15', '#1a110c'], ['#4a3226', '#33221a'], ['#151515', '#080808'],
  ['#6b4a2f', '#4c3320'], ['#8a5a3c', '#63402a'],
];
const SKINS = [
  ['#f0c9a4', '#d3a77f'], ['#e0aa7e', '#bd875d'], ['#c08b5e', '#9c6c45'],
  ['#96603a', '#754828'], ['#f5dbc0', '#d6b998'],
];
const TROUSERS = [
  ['#3d4757', '#2b323e'], ['#4a4a52', '#33333a'], ['#2f3b46', '#212a32'],
];

// Deterministic, so a face never changes between loads or between pages.
function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/* `member.look` is where a photograph goes: { hair: [base, shadow], skin: [...] }.
   Anything it sets wins, anything it omits falls back to the hash — so a member
   nobody has photographed yet is drawn to the same standard and differs only in
   being invented rather than observed. */
export function paletteFor(member) {
  const h = hash(member.name);
  const look = member.look || {};
  const skin = look.skin || SKINS[h % SKINS.length];
  const hair = look.hair || HAIRS[(h >> 3) % HAIRS.length];
  const trouser = look.trousers || TROUSERS[(h >> 6) % TROUSERS.length];
  const shirt = ROLE_SHIRT[member.role] || ['#9aa3a8', '#767d81'];
  return {
    K: '#241c26',            // a dark plum rather than black: black reads as a cut-out
    S: skin[0],    s: skin[1],
    H: hair[0],    h: hair[1],
    U: shirt[0],   u: shirt[1],
    P: trouser[0], p: trouser[1],
    B: '#2f2a33',
    E: '#241c26',
    W: '#f5f0e8',
    A: member.role === 'Safety' ? '#c8493f' : '#c9a227',
    '.': null,
  };
}

function paint(ctx, grid, palette, ox = 0, oy = 0) {
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      const colour = palette[row[x]];
      if (!colour) continue;
      ctx.fillStyle = colour;
      ctx.fillRect((x + ox) * CELL, (y + oy) * CELL, CELL, CELL);
    }
  }
}

/* Both walk frames of one member, side by side, on one canvas. A canvas rather
   than a data URL: the caller draws it straight into a sheet with no decode. */
export function drawMember(member) {
  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_W * CELL * 2;
  canvas.height = SPRITE_H * CELL;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const palette = paletteFor(member);
  const prop = PROPS[member.character];

  BODY.forEach((frame, index) => {
    ctx.save();
    ctx.translate(index * SPRITE_W * CELL, 0);
    paint(ctx, frame, palette);
    if (prop) {
      paint(ctx, prop.grid, palette, prop.x, prop.y);
      if (prop.mirror) paint(ctx, prop.grid, palette, prop.mirror.x, prop.y);
    }
    ctx.restore();
  });
  return canvas;
}

/* Exported for a test to assert every body row is exactly SPRITE_W wide. A short
   row silently shifts everything to its right — invisible in the data, obvious
   only once drawn, and tedious to find by eye across 48 rows. */
export const _GRIDS = { BODY, PROPS };
