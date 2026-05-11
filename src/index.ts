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
    a.btn, button.btn { display: inline-flex; align-items: center; gap: .5rem; padding: .625rem 1.25rem; border-radius: 8px; font-size: .9rem; font-weight: 500; text-decoration: none; transition: opacity .15s; cursor: pointer; border: none; font-family: inherit }
    a.btn:hover, button.btn:hover { opacity: .85 }
    .btn-primary { background: #6366f1; color: #fff }
    .btn-secondary { background: #1e293b; color: #94a3b8; border: 1px solid #334155 }
    .btn-danger { background: #7f1d1d; color: #fca5a5; border: 1px solid #991b1b }
    .badge { display: inline-block; background: #14532d; color: #4ade80; font-size: .7rem; font-weight: 600; padding: .15rem .5rem; border-radius: 99px; vertical-align: middle; margin-left: .5rem }

    /* modal overlay */
    .overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.7); backdrop-filter: blur(4px); z-index: 100; align-items: center; justify-content: center; padding: 1rem }
    .overlay.open { display: flex }
    .modal { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.75rem; width: 100%; max-width: 520px; display: flex; flex-direction: column; gap: 1.25rem }
    .modal-title { font-size: 1.1rem; font-weight: 600; color: #f8fafc }
    .modal-meta { font-size: .8rem; color: #64748b }
    .modal-meta span { color: #94a3b8; font-weight: 500 }
    label { display: flex; flex-direction: column; gap: .4rem; font-size: .85rem; color: #94a3b8 }
    input[type=text], input[type=password] { background: #0f1117; border: 1px solid #334155; border-radius: 6px; padding: .5rem .75rem; color: #e2e8f0; font-size: .95rem; font-family: inherit; outline: none; transition: border-color .15s }
    input:focus { border-color: #6366f1 }
    .editor { font-family: 'SF Mono', 'Fira Code', monospace; font-size: .85rem; background: #0f1117; border: 1px solid #334155; border-radius: 6px; padding: .75rem; color: #e2e8f0; resize: vertical; min-height: 220px; outline: none; transition: border-color .15s; width: 100% }
    .editor:focus { border-color: #6366f1 }
    .editor.error { border-color: #ef4444 }
    .modal-actions { display: flex; justify-content: flex-end; gap: .75rem }
    .msg { font-size: .82rem; padding: .5rem .75rem; border-radius: 6px; display: none }
    .msg.show { display: block }
    .msg.ok { background: #14532d; color: #4ade80 }
    .msg.err { background: #7f1d1d; color: #fca5a5 }
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
      <button class="btn btn-primary" onclick="openCreateModal()">Crea namespace</button>
      <button class="btn btn-secondary" onclick="openLoginModal()">Apri namespace</button>
      <a class="btn btn-secondary" href="${base}/docs">Swagger UI</a>
      <a class="btn btn-secondary" href="${base}/openapi.json">openapi.json</a>
    </div>
  </div>

  <!-- crea namespace -->
  <div class="overlay" id="createOverlay" onclick="overlayClick(event,'createOverlay')">
    <div class="modal">
      <div class="modal-title">Crea namespace</div>
      <label>Name
        <input type="text" id="createName" placeholder="myapp" autocomplete="off" />
      </label>
      <label>Key
        <input type="password" id="createKey" placeholder="••••••••" />
      </label>
      <label>Conferma key
        <input type="password" id="createKeyConfirm" placeholder="••••••••" />
      </label>
      <div class="msg" id="createMsg"></div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeModal('createOverlay')">Annulla</button>
        <button class="btn btn-primary" id="createBtn" onclick="doCreate()">Crea</button>
      </div>
    </div>
  </div>

  <!-- step 1: login -->
  <div class="overlay" id="loginOverlay" onclick="overlayClick(event,'loginOverlay')">
    <div class="modal">
      <div class="modal-title">Apri namespace</div>
      <label>Name
        <input type="text" id="loginName" placeholder="myapp" autocomplete="off" />
      </label>
      <label>Key
        <input type="password" id="loginKey" placeholder="••••••••" />
      </label>
      <div class="msg" id="loginMsg"></div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeModal('loginOverlay')">Annulla</button>
        <button class="btn btn-primary" id="loginBtn" onclick="doLogin()">Apri</button>
      </div>
    </div>
  </div>

  <!-- step 2: editor -->
  <div class="overlay" id="editorOverlay" onclick="overlayClick(event,'editorOverlay')">
    <div class="modal">
      <div>
        <div class="modal-title" id="editorTitle">namespace</div>
        <div class="modal-meta" id="editorMeta"></div>
      </div>
      <textarea class="editor" id="editorArea" spellcheck="false"></textarea>
      <div class="msg" id="editorMsg"></div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeModal('editorOverlay')">Chiudi</button>
        <button class="btn btn-primary" id="saveBtn" onclick="doSave()">Salva</button>
      </div>
    </div>
  </div>

  <script>
    const BASE = '${base}';
    let _name = '', _key = '';

    function openCreateModal() {
      ['createName','createKey','createKeyConfirm'].forEach(id => document.getElementById(id).value = '');
      showMsg('createMsg', '', '');
      document.getElementById('createOverlay').classList.add('open');
      setTimeout(() => document.getElementById('createName').focus(), 50);
    }

    async function doCreate() {
      const name    = document.getElementById('createName').value.trim();
      const key     = document.getElementById('createKey').value;
      const confirm = document.getElementById('createKeyConfirm').value;
      if (!name || !key) { showMsg('createMsg', 'Compila tutti i campi.', 'err'); return; }
      if (key !== confirm) { showMsg('createMsg', 'Le key non coincidono.', 'err'); return; }

      setLoading('createBtn', true);
      showMsg('createMsg', '', '');

      try {
        const headRes = await fetch(BASE + '/data/' + encodeURIComponent(name), { method: 'HEAD' });
        if (headRes.status === 200) {
          showMsg('createMsg', 'Namespace già esistente. Usa "Apri namespace".', 'err');
          setLoading('createBtn', false);
          return;
        }
        _name = name; _key = key;
        closeModal('createOverlay');
        openEditorModal(name, {}, true, '');
      } catch(e) {
        showMsg('createMsg', 'Errore di rete.', 'err');
      }
      setLoading('createBtn', false);
    }

    function openLoginModal() {
      document.getElementById('loginName').value = '';
      document.getElementById('loginKey').value = '';
      showMsg('loginMsg', '', '');
      document.getElementById('loginOverlay').classList.add('open');
      setTimeout(() => document.getElementById('loginName').focus(), 50);
    }

    function closeModal(id) {
      document.getElementById(id).classList.remove('open');
    }

    function overlayClick(e, id) {
      if (e.target === document.getElementById(id)) closeModal(id);
    }

    function showMsg(id, text, type) {
      const el = document.getElementById(id);
      el.textContent = text;
      el.className = 'msg' + (text ? ' show ' + type : '');
    }

    function setLoading(btnId, loading) {
      const btn = document.getElementById(btnId);
      btn.disabled = loading;
      btn.style.opacity = loading ? '.5' : '';
    }

    async function doLogin() {
      const name = document.getElementById('loginName').value.trim();
      const key  = document.getElementById('loginKey').value;
      if (!name || !key) { showMsg('loginMsg', 'Compila tutti i campi.', 'err'); return; }

      setLoading('loginBtn', true);
      showMsg('loginMsg', '', '');

      try {
        const headRes = await fetch(BASE + '/data/' + encodeURIComponent(name), { method: 'HEAD' });
        let payload = {};
        let isNew = false;
        let updatedAt = '';

        if (headRes.status === 404) {
          isNew = true;
        } else {
          const getRes = await fetch(BASE + '/data/' + encodeURIComponent(name) + '?key=' + encodeURIComponent(key));
          if (getRes.status === 401) { showMsg('loginMsg', 'Chiave errata.', 'err'); setLoading('loginBtn', false); return; }
          const data = await getRes.json();
          payload = data.payload;
          updatedAt = data.updatedAt;
        }

        _name = name; _key = key;
        closeModal('loginOverlay');
        openEditorModal(name, payload, isNew, updatedAt);
      } catch(e) {
        showMsg('loginMsg', 'Errore di rete.', 'err');
      }
      setLoading('loginBtn', false);
    }

    function openEditorModal(name, payload, isNew, updatedAt) {
      document.getElementById('editorTitle').textContent = name;
      const meta = isNew
        ? 'namespace nuovo — verrà creato al salvataggio'
        : 'aggiornato il ' + new Date(updatedAt).toLocaleString('it-IT');
      document.getElementById('editorMeta').textContent = meta;
      document.getElementById('editorArea').value = JSON.stringify(payload, null, 2);
      document.getElementById('editorArea').classList.remove('error');
      showMsg('editorMsg', '', '');
      document.getElementById('editorOverlay').classList.add('open');
      setTimeout(() => document.getElementById('editorArea').focus(), 50);
    }

    async function doSave() {
      const raw = document.getElementById('editorArea').value;
      let payload;
      try {
        payload = JSON.parse(raw);
        document.getElementById('editorArea').classList.remove('error');
      } catch(e) {
        document.getElementById('editorArea').classList.add('error');
        showMsg('editorMsg', 'JSON non valido.', 'err');
        return;
      }

      setLoading('saveBtn', true);
      showMsg('editorMsg', '', '');

      try {
        const res = await fetch(BASE + '/data/' + encodeURIComponent(_name), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: _key, payload })
        });
        if (res.status === 401) { showMsg('editorMsg', 'Chiave errata.', 'err'); setLoading('saveBtn', false); return; }
        showMsg('editorMsg', 'Salvato.', 'ok');
        const now = new Date().toLocaleString('it-IT');
        document.getElementById('editorMeta').textContent = 'aggiornato il ' + now;
      } catch(e) {
        showMsg('editorMsg', 'Errore di rete.', 'err');
      }
      setLoading('saveBtn', false);
    }

    // invio con Enter nei campi login
    ['loginName','loginKey'].forEach(id => {
      document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    });

    // invio con Enter nei campi crea
    ['createName','createKey','createKeyConfirm'].forEach(id => {
      document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') doCreate(); });
    });

    // Escape chiude il modal aperto
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        ['editorOverlay','loginOverlay'].forEach(id => closeModal(id));
      }
    });
  </script>
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
