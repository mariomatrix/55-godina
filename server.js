/**
 * FGAG 55 GODINA - SAMOSTALNI POSLUŽITELJ & BROJAČ API
 * 
 * Značajke:
 * - Čisti Node.js (ugrađeni http, fs, path moduli - 0 eksternih npm ovisnosti)
 * - Poslužuje statičke datoteke (HTML, CSS, JS, fontovi, SVG)
 * - Atomski globalni brojač izvođenja (/api/counter i /api/counter/hit)
 * - Pohrana u data/counter.json (sigurno zaključavanje i atomic write)
 * - Pripremljeno za VPS (jubilej.fgag.eu) i lokalni razvoj
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '8055', 10);
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = path.join(__dirname, 'data');
const COUNTER_FILE = path.join(DATA_DIR, 'counter.json');

// Inicijalna vrijednost brojača (simbolika 55 godina: #001.055)
const INITIAL_COUNT = 1055;

// Osiguraj data direktorij
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache brojača
let currentCounter = null;
let isWriting = false;
let pendingWrite = false;

function loadCounter() {
  try {
    if (fs.existsSync(COUNTER_FILE)) {
      const data = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8'));
      if (typeof data.total === 'number') {
        currentCounter = data.total;
        return;
      }
    }
  } catch (err) {
    console.error('Greška pri čitanju counter.json, koristim inicijalnu vrijednost:', err.message);
  }
  currentCounter = INITIAL_COUNT;
  saveCounter();
}

function saveCounter() {
  if (isWriting) {
    pendingWrite = true;
    return;
  }
  isWriting = true;
  const tempFile = `${COUNTER_FILE}.tmp.${Date.now()}`;
  const payload = JSON.stringify({
    total: currentCounter,
    updatedAt: new Date().toISOString()
  }, null, 2);

  fs.writeFile(tempFile, payload, 'utf8', (err) => {
    if (err) {
      console.error('Greška pri pisanju privremene datoteke brojača:', err.message);
      isWriting = false;
      return;
    }
    fs.rename(tempFile, COUNTER_FILE, (renameErr) => {
      isWriting = false;
      if (renameErr) {
        console.error('Greška pri atomskom preimenovanju counter.json:', renameErr.message);
      }
      if (pendingWrite) {
        pendingWrite = false;
        saveCounter();
      }
    });
  });
}

loadCounter();

// MIME tipovi za statičko posluživanje
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
  // CORS zaglavlja
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // -------------------------------------------------------------------------
  // API: Globalni brojač
  // -------------------------------------------------------------------------
  if (pathname === '/api/counter' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });
    res.end(JSON.stringify({ total: currentCounter }));
    return;
  }

  if (pathname === '/api/counter/hit' && req.method === 'POST') {
    currentCounter++;
    saveCounter();
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });
    res.end(JSON.stringify({ total: currentCounter, incremented: true }));
    return;
  }

  // -------------------------------------------------------------------------
  // Statičko posluživanje datoteka
  // -------------------------------------------------------------------------
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Spriječi path traversal napade
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Zabranjen pristup');
    return;
  }

  fs.stat(normalizedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Ako ne postoji datoteka, vrati 404
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Datoteka nije pronađena');
      return;
    }

    const ext = path.extname(normalizedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Za HTML/CSS/JS isključi keširanje radi trenutnog osvježavanja
    const headers = { 'Content-Type': contentType };
    if (['.html', '.css', '.js'].includes(ext)) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      headers['Cache-Control'] = 'public, max-age=86400';
    }

    res.writeHead(200, headers);
    const readStream = fs.createReadStream(normalizedPath);
    readStream.pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(` FGAG 55 Godina - Samostalni poslužitelj pokrenut!`);
  console.log(` Adresa: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(` Brojač API: /api/counter i /api/counter/hit`);
  console.log(` Trenutni globalni brojač: ${currentCounter}`);
  console.log(`=======================================================`);
});
