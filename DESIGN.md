# SIS Al Jada Cobras — Design Direction

This document is the visual and UX brief for the SIS Al Jada Cobras website. It is written for a UI/brand designer. The goal is to keep every future screen feeling like the same elite student race team—not a generic school site and not a soft “green energy” startup.

## 1. The idea in one sentence

**A student-built electric race program with the attitude of a cobra and the discipline of a motorsport team.**

The experience should feel:

- Fast
- Precise
- Dangerous, but controlled

The design is aggressive, but it must remain school-appropriate, readable, and credible to students, parents, school leadership, competition judges, and sponsors.

## 2. Brand story

The Cobra is not decoration. It represents how the team works:

- **Coiled:** planning, studying, preparing, and checking safety.
- **Strike:** racing, testing, making decisions, and acting quickly.
- **Shed:** learning from a failed idea and returning with an improved design.

The website should communicate that students are doing real work: designing, assembling, testing, documenting, and preparing for EVGP.

Avoid language or visuals that pretend the team has data, sponsors, results, or approvals that have not been confirmed. Honest “pending” states are part of the design system.

## 3. Visual system

### Core colors

| Token | Color | Use |
|---|---:|---|
| Ink | `#0A0A0A` | Main page background and structural areas |
| Panel | `#141414` | Cards, dashboards, navigation, and raised sections |
| Raised panel | `#1A1A1A` | Hovered or emphasized dark surfaces |
| Cobra red | `#7C0A02` | Deep branded atmosphere and large low-intensity accents |
| Hot red | `#E6392B` | Primary actions, active navigation, and race-energy moments |
| Gold | `#C9A227` | Small prestige accents, labels, rules, and hover details |
| Soft gold | `#E8B923` | Rare highlights only |
| Cream | `#F5F0E8` | Headlines and primary text |
| Steel | `#9AA3A8` | Supporting text, captions, and metadata |

### Color behavior

- The interface is dark first.
- Red means action, speed, urgency, or the active state.
- Gold means status, craft, or prestige. Use it sparingly.
- Cream carries the reading hierarchy.
- Never introduce lime green, teal, cyan, or generic eco-EV gradients.
- Use one loud accent per section. A section should not contain competing large red and gold areas.
- “Pending” or unknown information should use a neutral dark treatment, not a fake success color.

### Typography

**Orbitron** is the race voice:

- Logo and wordmark
- Hero headlines
- Section titles
- Numbers, technical labels, phase numbers, and race UI

**Poppins** is the human voice:

- Navigation
- Paragraphs
- Buttons
- Forms
- Captions and explanations

Suggested scale:

| Role | Typeface | Size guidance |
|---|---|---|
| Hero H1 | Orbitron 700–900 | `clamp(2.5rem, 6vw, 5.6rem)` |
| Section H2 | Orbitron 700 | `clamp(1.35rem, 2.6vw, 2.35rem)` |
| Card H3 | Orbitron 700 | About `1rem` |
| Body | Poppins 400 | `1rem`, line-height around `1.65` |
| Small label | Orbitron 700 | `0.7–0.8rem`, spaced uppercase |
| Button | Poppins 600 | `0.85–1rem` |

Do not use Orbitron for long paragraphs. It creates visual fatigue, especially in Arabic and on mobile.

### Graphic language

Use:

- Thin technical grid lines
- Race telemetry-style numbers
- Angled cuts and controlled diagonal lines
- Cobra hood shapes used as watermarks
- Dark photography with deliberate red color grading
- Small gold rules or labels
- Generous black space around important content

Avoid:

- Neon gamer effects across the full site
- Excessive glowing borders
- Cartoon snake graphics in professional sections
- Generic leaf, plug, lightning, or eco icons
- Large gold-filled surfaces
- A different visual gimmick on every page

## 4. Layout principles

The desktop content width is approximately **1180 px**. Sections should feel editorial and intentional, not like a collection of equal template cards.

### Section rhythm

Each major section should normally contain:

1. A small index or kicker
2. One strong headline
3. A short explanation
4. One main visual or one clear data group
5. At most one primary action

Use alternating compositions to create movement:

- Text left / image right
- Image left / data right
- Full-width technical dashboard
- Narrow editorial text block

Do not turn every section into a three-card grid. Repeating the same card pattern makes the site feel like a template.

### Page length

The homepage currently tells a complete story, but it is long on mobile. The ideal mobile homepage should prioritize:

1. Team identity
2. Current build status
3. Car facts
4. Latest workshop update
5. Race-day or sponsor action

Detailed engineering decisions and the full build process can live on their dedicated pages. The homepage should preview them rather than repeat them in full.

## 5. Shared components

### Navigation

- Sticky, dark, and slightly translucent.
- Logo at the start edge; actions at the opposite edge.
- The active page uses hot red.
- Gold appears only as a small detail.
- Desktop navigation should remain one clean row.
- Mobile shows the cobra mark, language switch, CarGPT entry, and menu button.
- Arabic uses RTL layout, but the logo must not become oversized or compete with the links.

### Primary button

- Hot red fill
- Cream text
- Strong weight
- Comfortable touch target, at least 44 px high
- Hover: slightly brighter red, subtle lift, or gold detail—not all three

### Secondary button

- Transparent or panel background
- Subtle red or gold border
- Cream text
- Hover can introduce a restrained gold border

### Cards

- Charcoal background
- Subtle border
- Minimal shadow
- Clear internal spacing
- Use a red top rule for race/action cards or a gold detail for prestige/status cards, never both at full strength

Cards should not all be the same height unless they are directly comparable.

### Data and status

Every number needs context:

- What was measured?
- When was it measured?
- Is it recorded, estimated, or pending?
- What is the next test?

Use “Pending team confirmation” instead of inventing a percentage or result.

### CarGPT

CarGPT is a supporting utility, not the brand hero.

- Keep it as a small navigation option.
- Use it for FAQs about the team, car, EVGP, or sponsorship.
- Never make the assistant visually louder than the race team.
- Its offline state should still feel complete and intentional.

### Footer

The footer is a practical directory, not another hero section. Include the most useful pages, social links, PDFs, and the credit:

**Made by Areej and Mirza**

Arabic credit:

**تصميم وتطوير عريج وميرزا**

## 6. Page-by-page intent

### Home

Purpose: make a visitor understand who the Cobras are within ten seconds.

The hero should lead with attitude, then quickly prove the team is real with student count, 48V system, EVGP target, current workshop status, and one clear build action.

Design priority: shorten the mobile story and keep the best proof above the fold.

### Members

Purpose: show the people and responsibilities behind the car.

Organize members by role or discipline. Each profile should eventually use consistent real portraits: same crop, similar lighting, simple background, and name/role hierarchy. Until approved photos exist, use one honest branded placeholder system rather than unrelated duck images.

Design priority: create a strong portrait placeholder that feels intentional and does not make the team look unserious.

### Our Work

Purpose: explain how an idea becomes a race-ready machine.

Use a five-stage visual timeline:

1. Design and planning
2. Build and assembly
3. Wiring and controls
4. Testing and troubleshooting
5. Final adjustments

Each stage needs a distinct visual. Mouse wheel, trackpad, keyboard, touch, and arrow controls should all work without trapping normal page scrolling.

### Specs

Purpose: be the source of truth for the current car.

Separate information into:

- Basic information
- Power system
- Build and design
- Performance
- Safety
- Test status

Recorded, estimated, and pending values must look different. Avoid oversized decorative numbers that collide with nearby diagrams or imply false precision.

### Race Day

Purpose: become the useful race-week hub.

Show only confirmed information. The target date is **13 February 2027** until the event date is officially verified. Driver selection, official timing, schedule, and results should retain clear pending states.

### Sponsors

Purpose: make support feel practical and trustworthy.

Explain:

- What support enables
- Equipment or services needed
- Visibility a sponsor receives
- What is already secured
- What is still unconfirmed
- The verified public contact route

Do not publish invented funding targets, sponsor names, or a fake email address.

### Electric Cars 101

Purpose: explain EV concepts to students and parents without becoming a textbook.

Use clear diagrams and short modules for battery, motor, controller, charging, and safety. Tie every concept back to the Cobras’ 48V car.

### Game

Purpose: provide a memorable side experience that matches the brand.

The game can be louder and more arcade-like than the rest of the site, but it must still use the Cobra Race palette. Keep controls obvious, sprites aligned with the road perspective, and the Dubai skyline recognizable.

## 7. Photography and imagery

The site needs an image plan, not random uploads.

Recommended shot list:

- Low-angle hero image of the car
- Team group photo in the workshop
- Hands working on wiring or controls
- Battery and safety system close-ups
- Driver seated in the car
- Testing or pushing the car
- One consistent portrait for each member
- Sponsor-friendly clean car side profile

Rules:

- Use the actual Cobras students and car wherever possible.
- Do not use unrelated students.
- Avoid repeated videos or duplicate frames across different build stages.
- Crop every image for its intended component before publishing.
- Compress images and videos so mobile visitors are not forced to download large files.

## 8. Responsive and Arabic behavior

Design desktop, mobile, English, and Arabic together—not as later fixes.

### Mobile

- Minimum 16 px page-side padding
- Buttons at least 44 px tall
- No horizontal scrolling
- Headlines must wrap intentionally
- Stack complex dashboards into readable groups
- Collapse secondary detail instead of creating a 10,000 px homepage

### Arabic

- Mirror layouts where it improves reading order.
- Keep numbers, `48V`, `EVGP`, dates, and technical model names in a natural direction.
- Use an Arabic-friendly body font fallback; Orbitron remains for Latin race labels only.
- Do not crowd the navigation with both a long Arabic wordmark and the full menu.
- Check every screen at desktop and mobile widths after translation.

## 9. Accessibility requirements

- Cream text on black/charcoal for primary reading.
- Steel gray must remain readable; do not reduce its opacity further.
- Visible keyboard focus on every interactive element.
- Do not communicate status with color alone.
- Every meaningful image needs useful alt text.
- Decorative cobra marks should be hidden from screen readers.
- Respect reduced-motion preferences.
- Carousels and timelines need keyboard, touch, and scroll support.

## 10. Recommended next design pass

The highest-value improvements, in order:

1. **Create a real portrait placeholder system.** Replace the duck images with consistent Cobra-branded silhouettes, role initials, or helmet-style profile graphics until real student photos are approved.
2. **Shorten the mobile homepage.** Keep the team introduction, current status, key specs, latest update, and final CTA. Move deeper engineering detail to Our Work and Specs.
3. **Create an image-crop system.** Define hero, card, portrait, timeline, and technical-detail aspect ratios so photos stop feeling accidental.
4. **Improve sponsor conversion.** Give sponsors one obvious action and a clear school-approved contact route when one becomes available.
5. **Add a verified update pattern.** Every workshop entry should consistently show date, discipline, what changed, evidence, and next action.
6. **Optimize media.** Export responsive images and smaller videos, with poster frames and loading states.
7. **Design empty/pending states.** Race results, driver selection, funding figures, and test data should look deliberately unfinished—not broken.

## 11. Figma handoff checklist

A complete design file should contain:

- Color variables matching the tokens above
- Orbitron and Poppins text styles
- Desktop and mobile grids
- English and Arabic examples
- Navigation variants: desktop, collapsed, mobile open, RTL
- Buttons: primary, secondary, hover, focus, disabled
- Cards: standard, data, pending, update, sponsor
- Status badges: recorded, estimated, pending
- Member card and portrait placeholder
- Timeline stage
- CarGPT closed and open states
- Footer
- Desktop and mobile screens for Home, Members, Our Work, Specs, Race Day, and Sponsors

The designer should use the existing website as the content source, but is encouraged to improve composition, spacing, imagery, and hierarchy while preserving the Cobra Race brand.

## Final design test

Before approving a screen, ask:

1. Does this look like a race team within three seconds?
2. Is the most important information obvious?
3. Is the red directing attention, or just decorating the page?
4. Is the gold rare enough to feel valuable?
5. Does the page still work without a perfect photograph?
6. Does it remain readable on a phone and in Arabic?
7. Does every claim feel honest and verifiable?

If all seven answers are yes, the screen belongs to the Cobras system.
