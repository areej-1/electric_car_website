# Drawn crew sprites

Drop the artwork here, one PNG per member, named after them in lower-case with
hyphens:

    basar-ural.png
    mirza-akova.png
    shiqi-lin.png
    ...

Then add a line to `../crew-roster.js`:

    { name: 'Basar Ural', sprite: 'assets/crew/sprites/basar-ural.png' },

That is the whole integration. Being on that list is what gives someone the
"send for a walk" button on their card, so a member without artwork simply has
no button.

## What the file should be

- **A single standing pose**, facing right. The code mirrors it with `scaleX` when
  someone walks the other way, so a left-facing version is not needed.
- **Transparent background.** The sprites walk over the page, not over a colour.
- **Trimmed to the character** — no padding at the sides, no label, no card
  border, no drop shadow. They are positioned by their bottom edge, so extra
  space below the feet lifts them off the floor.
- **97 pixels tall**, feet on the bottom row, character trimmed tight otherwise.
  The height is shared so that fitting each sprite into its box scales all of
  them by the same amount: a crowd then stands on one floor at one scale, and a
  taller person still reads as taller. Width is free — the ones here run 52–73px.
- **No anti-aliasing.** They render with `image-rendering: pixelated`, so soft
  edges come out muddy rather than smooth. Watch the edge in particular: art
  exported over a coloured background keeps a fringe of that colour, which shows
  up as a halo once it is walking over a dark page.

## Cutting one out

These fifteen came off two sheets where each character sat on a bordered card,
and cutting them by colour did not work — the edge pixels are a blend of the
character and whatever was behind them, so no threshold separates the two. Both
attempts at automating it failed differently: keeping the blended edge left a
blue halo, and stripping it dissolved black hair into a dark page.

What worked was drawing a red line by hand around each character, then deleting
the line and everything outside it. A marked boundary is unambiguous where a
sampled colour is not. If the next four arrive the same way, mark them first.

## Still needed

Four members have no artwork and so no button:

- Ayah Yousif
- Joud Hassan
- Taim Saadi
- Yas Shahriari

There was a generator here that drew a stand-in for them from a text grid. It
was recognisably a stand-in next to fifteen drawn characters, so it is gone
rather than sitting in the repo waiting to be re-enabled.
