import fs from 'fs';
import path from 'path';
import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Shared Vite plugin that synchronizes cricket matches between apps/admin and apps/web
 * in real-time during local development, backed by a persistent file in the repository root.
 */
export function cricketDevSyncPlugin(rootDir: string): Plugin {
  const storeFilePath = path.resolve(rootDir, '.cricket_matches_store.json');
  const sseClients = new Set<ServerResponse>();

  function readMatches(): any[] {
    try {
      if (fs.existsSync(storeFilePath)) {
        const raw = fs.readFileSync(storeFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error reading cricket matches store:', e);
    }
    return [];
  }

  function writeMatches(matches: any[]) {
    try {
      fs.writeFileSync(storeFilePath, JSON.stringify(matches, null, 2), 'utf-8');
      broadcast(matches);
    } catch (e) {
      console.error('Error writing cricket matches store:', e);
    }
  }

  function broadcast(matches: any[]) {
    const payload = `data: ${JSON.stringify(matches)}\n\n`;
    sseClients.forEach((client) => {
      try {
        client.write(payload);
      } catch (e) {
        sseClients.delete(client);
      }
    });
  }

  return {
    name: 'cricket-dev-sync-plugin',
    apply: 'serve', // Only run during local dev server, do not hang production builds
    configureServer(server: ViteDevServer) {
      // Ensure store file exists
      if (!fs.existsSync(storeFilePath)) {
        try {
          fs.writeFileSync(storeFilePath, '[]', 'utf-8');
        } catch (e) {}
      }

      // Watch for changes made by the other Vite server instance
      let watcher: fs.FSWatcher | null = null;
      try {
        watcher = fs.watch(storeFilePath, (eventType) => {
          if (eventType === 'change') {
            const matches = readMatches();
            broadcast(matches);
          }
        });
      } catch (e) {}

      server.httpServer?.on('close', () => {
        try {
          watcher?.close();
        } catch (e) {}
      });

      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const parsedUrl = new URL(req.url || '/', 'http://localhost');
        const pathname = parsedUrl.pathname;

        // 1. Real-time Server-Sent Events (SSE) Stream
        if (pathname === '/api/cricket/matches/stream' || pathname === '/api/cricket/stream') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
          });
          const initial = readMatches();
          res.write(`data: ${JSON.stringify(initial)}\n\n`);
          sseClients.add(res);

          req.on('close', () => {
            sseClients.delete(res);
          });
          return;
        }

        // 2. GET /api/cricket/matches
        if (pathname === '/api/cricket/matches' && req.method === 'GET') {
          const matches = readMatches();
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(JSON.stringify(matches));
          return;
        }

        // 3. POST /api/cricket/matches (Create or Upsert Match)
        if (pathname === '/api/cricket/matches' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const newMatch = JSON.parse(body);
              const matches = readMatches();
              const existingIdx = matches.findIndex((m) => m.id === newMatch.id);
              if (existingIdx >= 0) {
                matches[existingIdx] = newMatch;
              } else {
                matches.unshift(newMatch);
              }
              writeMatches(matches);

              res.writeHead(201, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              });
              res.end(JSON.stringify(newMatch));
            } catch (err: any) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 4. PUT /api/cricket/matches/:id (Update Live Ball, Status, Score)
        if (pathname.startsWith('/api/cricket/matches/') && req.method === 'PUT') {
          const id = pathname.replace('/api/cricket/matches/', '');
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const updatedMatch = JSON.parse(body);
              const matches = readMatches();
              const existingIdx = matches.findIndex((m) => m.id === id || m.id === updatedMatch.id);
              if (existingIdx >= 0) {
                matches[existingIdx] = updatedMatch;
              } else {
                matches.unshift(updatedMatch);
              }
              writeMatches(matches);

              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              });
              res.end(JSON.stringify(updatedMatch));
            } catch (err: any) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 5. DELETE /api/cricket/matches/:id
        if (pathname.startsWith('/api/cricket/matches/') && req.method === 'DELETE') {
          const id = pathname.replace('/api/cricket/matches/', '');
          const matches = readMatches();
          const filtered = matches.filter((m) => m.id !== id);
          writeMatches(filtered);
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(JSON.stringify({ success: true, id }));
          return;
        }

        // 6. CORS Options Preflight
        if (req.method === 'OPTIONS' && pathname.startsWith('/api/cricket/')) {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          });
          res.end();
          return;
        }

        next();
      });
    },
  };
}
