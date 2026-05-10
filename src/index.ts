import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import dataRouter from './routes/data';
import { buildSpec } from './openapi';

const app = express();
const PORT = 3000;
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/$/, '');

const spec = buildSpec(BASE_PATH);

app.use(cors());
app.use(express.json());

app.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  _res.on('finish', () => {
    console.log(`${req.method} ${req.path} ${_res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

app.get(`${BASE_PATH}/openapi.json`, (_req: Request, res: Response) => {
  res.json(spec);
});

app.use(`${BASE_PATH}/docs`, swaggerUi.serve, swaggerUi.setup(spec, {
  customSiteTitle: 'Penzieroso API',
  customCss: '.swagger-ui .topbar { display: none }',
}));

app.get(`${BASE_PATH}/`, (_req: Request, res: Response) => {
  const base = BASE_PATH;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Penzieroso</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f1117; color: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem }
    .card { max-width: 680px; width: 100% }
    h1 { font-size: 2rem; font-weight: 700; letter-spacing: -0.02em; color: #f8fafc }
    .tagline { margin-top: .5rem; color: #94a3b8; font-size: 1.05rem }
    hr { margin: 2rem 0; border: none; border-top: 1px solid #1e293b }
    h2 { font-size: .75rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #64748b; margin-bottom: 1rem }
    .flow { display: flex; flex-direction: column; gap: .5rem }
    .step { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: .75rem 1rem; font-family: 'SF Mono', 'Fira Code', monospace; font-size: .85rem; color: #e2e8f0 }
    .step .comment { color: #64748b }
    .step .method { color: #38bdf8 }
    .step .path { color: #a78bfa }
    .step .status { color: #4ade80; margin-left: .5rem }
    .links { display: flex; gap: 1rem; margin-top: 2rem }
    a.btn { display: inline-flex; align-items: center; gap: .5rem; padding: .625rem 1.25rem; border-radius: 8px; font-size: .9rem; font-weight: 500; text-decoration: none; transition: opacity .15s }
    a.btn:hover { opacity: .85 }
    .btn-primary { background: #6366f1; color: #fff }
    .btn-secondary { background: #1e293b; color: #94a3b8; border: 1px solid #334155 }
    .badge { display: inline-block; background: #14532d; color: #4ade80; font-size: .7rem; font-weight: 600; padding: .15rem .5rem; border-radius: 99px; vertical-align: middle; margin-left: .5rem }
  </style>
</head>
<body>
  <div class="card">
    <h1>penzieroso <span class="badge">v1.0</span></h1>
    <p class="tagline">Generic key-value storage REST backend.<br>Salva e carica JSON identificati da un nome, protetti da una chiave.</p>

    <hr>

    <h2>Come funziona</h2>
    <div class="flow">
      <div class="step">
        <span class="comment"># 1. Crea un namespace (prima chiamata = registrazione)</span><br>
        <span class="method">POST</span> <span class="path">${base}/data/myapp</span>  { key, payload: {} }<span class="status">→ 201</span>
      </div>
      <div class="step">
        <span class="comment"># 2. Leggi il payload</span><br>
        <span class="method">GET</span> <span class="path">${base}/data/myapp?key=…</span><span class="status">→ 200</span>
      </div>
      <div class="step">
        <span class="comment"># 3. Aggiorna il payload</span><br>
        <span class="method">POST</span> <span class="path">${base}/data/myapp</span>  { key, payload: {…} }<span class="status">→ 200</span>
      </div>
      <div class="step">
        <span class="comment"># 4. Controlla se esiste (senza chiave)</span><br>
        <span class="method">HEAD</span> <span class="path">${base}/data/myapp</span><span class="status">→ 200 / 404</span>
      </div>
      <div class="step">
        <span class="comment"># 5. Cambia chiave</span><br>
        <span class="method">PUT</span> <span class="path">${base}/data/myapp/key</span>  { oldKey, newKey }<span class="status">→ 200</span>
      </div>
    </div>

    <div class="links">
      <a class="btn btn-primary" href="${base}/docs">Swagger UI</a>
      <a class="btn btn-secondary" href="${base}/openapi.json">openapi.json</a>
    </div>
  </div>
</body>
</html>`);
});

app.use(`${BASE_PATH}/data`, dataRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'not found' });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'internal server error' });
});

app.listen(PORT, () => {
  console.log(`penzieroso listening on port ${PORT} — base path: "${BASE_PATH || '/'}"`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
