import fs from 'node:fs';
import assert from 'node:assert/strict';

const dist = new URL('../site/dist/', import.meta.url);
const html = fs.readFileSync(new URL('index.html', dist), 'utf8');

assert.match(html, /srcset=/, 'images must ship a srcset');
assert.match(html, /\.webp/, 'images must offer webp');
assert.match(html, /loading="lazy"/, 'below-fold images must lazy-load');

// Isolate the pipeline-produced photo specifically — identified by its srcset,
// which only Img.astro's output carries — rather than asserting width/height
// anywhere in the document. That looser assertion used to be satisfied by the
// nav logo's hand-authored width="36" height="36", a plain <img> with no
// srcset that never goes through the image pipeline at all, so it would have
// kept passing even if Img.astro stopped emitting intrinsic dimensions.
const pipelineImg = html.match(/<img[^>]*srcset="[^"]*"[^>]*>/);
assert.ok(pipelineImg, 'could not find a pipeline-produced <img srcset=...> to check');
assert.match(pipelineImg[0], /width="\d+"\s+height="\d+"/,
  'the pipeline-produced image must carry intrinsic dimensions to avoid layout shift');

console.log('PASS images');
