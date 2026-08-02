# Drawn crew sprites

Drop the artwork here, one PNG per member, named after them in lower-case with
hyphens:

    basar-ural.png
    mirza-akova.png
    shiqi-lin.png
    ...

Then point the roster at it — in `../crew-roster.js`, add `sprite` to that member
and flip `fromPhoto`:

    { name: 'Basar Ural', role: 'Driver', character: 'chef',
      sprite: 'assets/crew/sprites/basar-ural.png', fromPhoto: true },

That is the whole integration. Anyone without a `sprite` keeps the generated
version, at the same size and on the same walk, so a crowd still reads as one
crew rather than two.

## What the file should be

- **A single standing pose**, facing right. The code mirrors it with `scaleX` when
  someone walks the other way, so a left-facing version is not needed.
- **Transparent background.** The sprites walk over the page, not over a colour.
- **Trimmed to the character** — no padding, no label, no drop shadow. They are
  positioned by their bottom edge, so extra space below the feet lifts them off
  the floor.
- **Any size**, within reason. They are drawn to a 64px-wide box preserving
  aspect. Somewhere around 32–48px wide natively is the sweet spot.
- **No anti-aliasing.** They render with `image-rendering: pixelated`, so soft
  edges come out muddy rather than smooth.

## Still needed

Four members have no artwork and are generated for now:

- Ayah Yousif
- Joud Hassan
- Taim Saadi
- Yas Shahriari

`fromPhoto: false` in the roster marks them, so this list can be regenerated
rather than trusted.
