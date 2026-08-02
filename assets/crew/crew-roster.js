/* Everyone with a drawn chibi, in the order the members page lists them.
 *
 * Being on this list is what gives a member the "send for a walk" button. The
 * roster used to cover the whole team and fall back to a generated sprite for
 * anyone without artwork; the generated ones read as placeholders next to the
 * drawn ones, so they are gone. A member who is not here simply has no button,
 * which is a smaller absence than a stand-in nobody recognises.
 *
 * To add someone: drop their PNG in `sprites/` — see the README there for what
 * the file has to be — and add a line.
 */
export const CREW = [
  { name: 'Areej Dridi',      sprite: 'assets/crew/sprites/areej-dridi.png' },
  { name: 'Abdulla Sumaity',  sprite: 'assets/crew/sprites/abdulla-sumaity.png' },
  { name: 'Ali Husseinpoor',  sprite: 'assets/crew/sprites/ali-husseinpoor.png' },
  { name: 'Basar Ural',       sprite: 'assets/crew/sprites/basar-ural.png' },
  { name: 'Bushra Al Sultan', sprite: 'assets/crew/sprites/bushra-al-sultan.png' },
  { name: 'Dua Hasan',        sprite: 'assets/crew/sprites/dua-hasan.png' },
  { name: 'Jiayi Lin',        sprite: 'assets/crew/sprites/jiayi-lin.png' },
  { name: 'Mansour Banna',    sprite: 'assets/crew/sprites/mansour-banna.png' },
  { name: 'Mirza Akova',      sprite: 'assets/crew/sprites/mirza-akova.png' },
  { name: 'Salma Rashdan',    sprite: 'assets/crew/sprites/salma-rashdan.png' },
  { name: 'Selma Labchaki',   sprite: 'assets/crew/sprites/selma-labchaki.png' },
  { name: 'Shiqi Lin',        sprite: 'assets/crew/sprites/shiqi-lin.png' },
  { name: 'Taim Adi',         sprite: 'assets/crew/sprites/taim-adi.png' },
  { name: 'Taim Yasin',       sprite: 'assets/crew/sprites/taim-yasin.png' },
  { name: 'Zainab Baber',     sprite: 'assets/crew/sprites/zainab-baber.png' },
];

export const byName = (name) => CREW.find((m) => m.name === name);
