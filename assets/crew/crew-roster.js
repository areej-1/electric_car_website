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
  { name: 'Areej Dridi',      role: 'Mechanic',   character: 'coffee',      fromPhoto: false },
  { name: 'Abdulla Sumaity',  role: 'Safety',     character: 'dolphin',     fromPhoto: false },
  { name: 'Ali Husseinpoor',  role: 'Mechanic',   character: 'hedgehog',    fromPhoto: false },
  { name: 'Ayah Yousif',      role: 'Media',      character: 'selfie',      fromPhoto: false },
  { name: 'Basar Ural',       role: 'Driver',     character: 'chef',        fromPhoto: false },
  { name: 'Bushra Al Sultan', role: 'Mechanic',   character: 'leopard',     fromPhoto: false },
  { name: 'Dua Hasan',        role: 'Mechanic',   character: 'blueglitter', fromPhoto: false },
  { name: 'Jiayi Lin',        role: 'Media',      character: 'influencer',  fromPhoto: false },
  { name: 'Joud Hassan',      role: 'Innovation', character: 'batman',      fromPhoto: false },
  { name: 'Mansour Banna',    role: 'Driver',     character: 'chef',        fromPhoto: false },
  { name: 'Mirza Akova',      role: 'Mechanic',   character: 'chef',        fromPhoto: false },
  { name: 'Salma Rashdan',    role: 'Mechanic',   character: 'minion',      fromPhoto: false },
  { name: 'Selma Labchaki',   role: 'Mechanic',   character: 'clownfish',   fromPhoto: false },
  { name: 'Shiqi Lin',        role: 'Media',      character: 'holland',     fromPhoto: false },
  { name: 'Taim Adi',         role: 'Driver',     character: 'muslce',      fromPhoto: false },
  { name: 'Taim Saadi',       role: 'Safety',     character: 'hat',         fromPhoto: false },
  { name: 'Taim Yasin',       role: 'Mechanic',   character: 'golf',        fromPhoto: false },
  { name: 'Yas Shahriari',    role: 'Innovation', character: 'singer',      fromPhoto: false },
  { name: 'Zainab Baber',     role: 'Media',      character: 'vacation',    fromPhoto: false },
];

export const byName = (name) => CREW.find((m) => m.name === name);
