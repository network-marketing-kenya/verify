import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { pathToFileURL } from 'url';

async function handleWebApiRoute(filePath: string, req: express.Request, res: express.Response) {
  try {
    // Dynamically import the API handler
    const module = await import(pathToFileURL(filePath).href);
    const apiHandler = module.default;

    if (typeof apiHandler !== 'function') {
      res.status(500).json({ error: `API file does not export a default function handler: ${path.basename(filePath)}` });
      return;
    }

    // Convert Express req to Web Request
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers.host || 'localhost';
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;

    // Collect body if any
    let body: any = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, val]) => {
      if (val === undefined) return;
      if (Array.isArray(val)) {
        val.forEach(v => headers.append(key, v));
      } else {
        headers.set(key, val);
      }
    });

    const webReq = new Request(fullUrl, {
      method: req.method,
      headers: headers,
      body: body
    });

    // Run the handler
    const webRes = await apiHandler(webReq);

    // Send the Web Response back
    res.statusCode = webRes.status;
    webRes.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    const bodyBuffer = await webRes.arrayBuffer();
    res.end(Buffer.from(bodyBuffer));
  } catch (err: any) {
    console.error(`API execution error at ${req.originalUrl}:`, err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000');

  // Body parsers
  app.use(express.json());
  app.use(express.text());
  app.use(express.urlencoded({ extended: true }));

  // API router mapping /api/:route (with or without trailing slash) to /api/:route.js
  app.all(/^\/api\/([^/]+)\/?$/, async (req, res) => {
    const route = req.params[0];
    const filePath = path.resolve(process.cwd(), 'api', `${route}.js`);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: `API route not found: /api/${route}` });
      return;
    }

    await handleWebApiRoute(filePath, req, res);
  });

  // API fallback: any unmatched request starting with /api/ returns a JSON 404, never falling through to SPA HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.path}` });
  });

  // Serve static assets in production, otherwise use Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
