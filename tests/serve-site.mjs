import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prefix = '/electric_car_website/';
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.avif': 'image/avif', '.webp': 'image/webp', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.pdf': 'application/pdf' };

// Test-only, loopback-only server. The project prefix catches GitHub Pages URL bugs.
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith(prefix) || !['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(404).end(); return;
    }
    const relative = decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) || /(^|\/)\./.test(relative) || /^(node_modules|tests)\//.test(relative)) {
      res.writeHead(404).end(); return;
    }
    const info = await stat(file);
    if (!info.isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Content-Length': info.size, 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
}).listen(4327, '127.0.0.1', () => console.log(`Test site: http://127.0.0.1:4327${prefix}`));
