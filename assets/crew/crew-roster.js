/* The nineteen, in the order the members page lists them.
 *
 * `character` is the rubber duck each person already had on that page. The ducks
 * stay — they are the portraits and they are personal — and the character is
 * reused as the chibi's prop so the two agree about who someone is.
 *
 * `sprite` is a drawn sprite — a real one, by a person, which beats anything
 * generated. When it is set the code loads that image and leaves the generator
 * alone. When it is absent the member is drawn from the text grid instead, to the
 * same size and on the same walk, so a crowd looks like one crew rather than two.
 *
 * `look` tunes the generated version, as { hair: [base, shadow], skin: [...] };
 * it is ignored once `sprite` is set. `fromPhoto` records which members still
 * need art, so the remainder is a visible list rather than something to remember.
 */
export const CREW = [
  { name: 'Areej Dridi',      role: 'Mechanic',   character: 'coffee',      sprite: 'assets/crew/sprites/areej-dridi.png', fromPhoto: true },
  { name: 'Abdulla Sumaity',  role: 'Safety',     character: 'dolphin',     sprite: 'assets/crew/sprites/abdulla-sumaity.png', fromPhoto: true },
  { name: 'Ali Husseinpoor',  role: 'Mechanic',   character: 'hedgehog',    sprite: 'assets/crew/sprites/ali-husseinpoor.png', fromPhoto: true },
  { name: 'Ayah Yousif',      role: 'Media',      character: 'selfie',      fromPhoto: false },
  { name: 'Basar Ural',       role: 'Driver',     character: 'chef',        sprite: 'assets/crew/sprites/basar-ural.png', fromPhoto: true },
  { name: 'Bushra Al Sultan', role: 'Mechanic',   character: 'leopard',     sprite: 'assets/crew/sprites/bushra-al-sultan.png', fromPhoto: true },
  { name: 'Dua Hasan',        role: 'Mechanic',   character: 'blueglitter', sprite: 'assets/crew/sprites/dua-hasan.png', fromPhoto: true },
  { name: 'Jiayi Lin',        role: 'Media',      character: 'influencer',  sprite: 'assets/crew/sprites/jiayi-lin.png', fromPhoto: true },
  { name: 'Joud Hassan',      role: 'Innovation', character: 'batman',      fromPhoto: false },
  { name: 'Mansour Banna',    role: 'Driver',     character: 'chef',        sprite: 'assets/crew/sprites/mansour-banna.png', fromPhoto: true },
  { name: 'Mirza Akova',      role: 'Mechanic',   character: 'chef',        sprite: 'assets/crew/sprites/mirza-akova.png', fromPhoto: true },
  { name: 'Salma Rashdan',    role: 'Mechanic',   character: 'minion',      sprite: 'assets/crew/sprites/salma-rashdan.png', fromPhoto: true },
  { name: 'Selma Labchaki',   role: 'Mechanic',   character: 'clownfish',   sprite: 'assets/crew/sprites/selma-labchaki.png', fromPhoto: true },
  { name: 'Shiqi Lin',        role: 'Media',      character: 'holland',     sprite: 'assets/crew/sprites/shiqi-lin.png', fromPhoto: true },
  { name: 'Taim Adi',         role: 'Driver',     character: 'muslce',      sprite: 'assets/crew/sprites/taim-adi.png', fromPhoto: true },
  { name: 'Taim Saadi',       role: 'Safety',     character: 'hat',         fromPhoto: false },
  { name: 'Taim Yasin',       role: 'Mechanic',   character: 'golf',        sprite: 'assets/crew/sprites/taim-yasin.png', fromPhoto: true },
  { name: 'Yas Shahriari',    role: 'Innovation', character: 'singer',      fromPhoto: false },
  { name: 'Zainab Baber',     role: 'Media',      character: 'vacation',    sprite: 'assets/crew/sprites/zainab-baber.png', fromPhoto: true },
];

export const byName = (name) => CREW.find((m) => m.name === name);
