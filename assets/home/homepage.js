// Homepage scroll island, lifted from the Astro build.
//
// This used to refuse to enhance under `prefers-reduced-motion: reduce`, which
// meant Windows — where the setting is reported whenever "Animation effects" is
// off, a common configuration — got a 5,000px vertical stack instead of the
// horizontal strip, while macOS got the design.
//
// It now enhances for everyone, because there is no animation here to suppress.
// The strip's transform is a direct function of scroll position: it moves
// exactly as far as the reader scrolls and stops the instant they stop. Nothing
// plays on its own, nothing eases, nothing continues after input ends. Removing
// the entire layout was answering a request about motion by changing the
// information architecture.
//
// The car travels by the same rule, and for the same reason. It was pinned here
// for a while as a reduced-motion concession, which was over-cautious and looked
// broken: the resting position put it sixty pixels off the left edge, so anyone
// with the setting on saw a car half out of frame that never moved. Its offset
// is a direct function of scroll progress exactly like the strip's — if one is
// acceptable, so is the other.
//
// The concession that does belong is in CSS: decorative transitions are dropped
// under reduced motion, so nothing eases or keeps going on its own timer.
function e(e){if(!e)return;let t=e.querySelector(`[data-world]`),n=[...e.querySelectorAll(`[data-world-panel]:not([data-world-outro])`)],r=e.querySelector(`[data-world-car]`);if(!t||n.length<2)return;let i=getComputedStyle(document.documentElement).direction===`rtl`?1:-1,a=.86,o=!1,R=matchMedia(`(prefers-reduced-motion: reduce)`).matches;function s(){o=!1;let s=e.getBoundingClientRect(),c=s.height-window.innerHeight;if(c<=0)return;let l=Math.min(1,Math.max(0,-s.top/c)),u=Math.min(1,l/a),d=Math.max(0,(l-a)/(1-a)),f=u*(n.length-1)*window.innerWidth,p=d*window.innerHeight;if(t.style.transform=`translate3d(${(i*f).toFixed(2)}px,${(-p).toFixed(2)}px,0)`,e.style.setProperty(`--world-progress`,l.toFixed(4)),r){let e=window.innerWidth*(-.52+l*.95);r.style.transform=`translate3d(${e.toFixed(2)}px,0,0)`}let m=Math.min(n.length-1,Math.round(u*(n.length-1)));n.forEach((e,t)=>e.classList.toggle(`is-active`,t===m)),e.style.setProperty(`--world-panel`,String(m))}function c(){o||(o=!0,requestAnimationFrame(s))}e.classList.add(`is-enhanced`),addEventListener(`scroll`,c,{passive:!0}),addEventListener(`resize`,c,{passive:!0}),s()}e(document.querySelector(`[data-home-world]`));
