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
  const canonical = 'https://stefano-apps.cavallaro.eu/penzieroso/';

  const integrationPrompt = `Voglio integrare la mia applicazione web con Penzieroso, un servizio REST di key-value storage gratuito che permette di salvare e caricare dati JSON in modo persistente e protetto da chiave.

Penzieroso è disponibile gratuitamente all'indirizzo:
https://stefano-apps.cavallaro.eu/penzieroso/data

## COMPORTAMENTO ATTESO

L'app deve funzionare in due modalità:

**MODALITÀ LOCALE (default, sempre attiva)**
- I dati si salvano automaticamente in localStorage ad ogni modifica
- Nessun login richiesto, l'app parte subito
- Un indicatore visivo conferma che il salvataggio locale è attivo

**MODALITÀ REMOTA (opzionale, attivabile dall'utente)**
- Un tasto nell'header (es. ☁ OFF / ☁ ON) apre un popup di connessione
- Il popup ha tre campi: URL server Penzieroso, nome namespace, chiave
  (URL precompilato con https://stefano-apps.cavallaro.eu/penzieroso/data)
- La chiave va trattata come password (input type=password)
- Quando remoto attivo, il tasto mostra ☁ ON e cambia colore
- Un tasto "SYNC ORA" nel popup invia i dati correnti al server
- Un tasto "CAMBIA KEY" nel popup permette di aggiornare la chiave
- Un tasto "DISCONNETTI" disattiva la modalità remota

## FLUSSO DI CONNESSIONE

1. Utente inserisce nome namespace e chiave e clicca Connetti
2. Fare HEAD /data/:name per verificare se il namespace esiste
   - Se 404: il namespace non esiste, verrà creato al primo sync
   - Se 200: fare GET per caricare i dati remoti → sovrascrivono il locale
3. Da quel momento il tasto SYNC ORA è disponibile

## API PENZIEROSO

  HEAD   /data/:name
         → 200 namespace esiste
         → 404 non trovato

  GET    /data/:name?key=xxx
         → 200 { payload: <JSON>, updatedAt: "ISO8601" }
         → 401 chiave errata
         → 404 non trovato

  POST   /data/:name
         body: { "key": "...", "payload": <qualsiasi JSON> }
         → 201 creato (prima volta)
         → 200 aggiornato
         → 401 chiave errata

  PUT    /data/:name/key
         body: { "oldKey": "...", "newKey": "..." }
         → 200 ok
         → 401 chiave errata
         → 404 non trovato

## DETTAGLI IMPLEMENTATIVI

- La chiave non appare mai nelle risposte del server (bcrypt lato server)
- Il nome namespace è permanente, solo la chiave può cambiare
- Il sync è sempre manuale (bottone esplicito), mai automatico
- In caso di errore di rete mostrare feedback visivo (es. ☁ ✗ in rosso)
- In caso di sync riuscito mostrare feedback visivo (es. ☁ ✓ in verde)
  per circa 2-3 secondi, poi tornare allo stato normale
- Il popup remoto deve potersi chiudere sia col tasto ✕ sia
  cliccando sull'overlay scuro esterno`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Penzieroso — Free Key-Value Storage per app create dall'AI</title>
  <meta name="description" content="Penzieroso è un server REST gratuito di key-value storage pensato per applicazioni web generate da AI (Claude, ChatGPT, Gemini). Salva e carica dati JSON persistenti, protetti da chiave bcrypt. Zero configurazione, pronto all'uso.">
  <meta name="keywords" content="key-value storage gratuito, storage per app AI, REST JSON storage, Claude artifacts storage, ChatGPT app storage, storage applicazioni web, penzieroso, namespace JSON, bcrypt storage, free storage API">
  <meta name="robots" content="index, follow">
  <meta name="author" content="Stefano Cavallaro">
  <link rel="canonical" href="${canonical}">

  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="Penzieroso — Free Key-Value Storage per app create dall'AI">
  <meta property="og:description" content="Server REST gratuito per salvare e caricare dati JSON da applicazioni web generate da AI. Protetto da chiave, zero configurazione.">
  <meta property="og:site_name" content="Penzieroso">

  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Penzieroso — Free Key-Value Storage per app AI">
  <meta name="twitter:description" content="Server REST gratuito per salvare e caricare dati JSON da app create dall'AI. Protetto da chiave bcrypt, zero configurazione.">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebAPI",
    "name": "Penzieroso",
    "description": "Free REST key-value storage server for AI-generated web applications. Store and retrieve persistent JSON data protected by bcrypt-hashed keys.",
    "url": "${canonical}",
    "documentation": "https://stefano-apps.cavallaro.eu/penzieroso/docs",
    "provider": { "@type": "Person", "name": "Stefano Cavallaro" },
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
    "keywords": "key-value storage, JSON storage, REST API, AI apps, Claude, ChatGPT"
  }
  </script>

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f1117; color: #e2e8f0; line-height: 1.6 }
    .page { max-width: 800px; margin: 0 auto; padding: 3rem 2rem 5rem }

    /* hero */
    .hero { padding-bottom: 2.5rem; border-bottom: 1px solid #1e293b }
    h1 { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.03em; color: #f8fafc }
    .tagline { margin-top: .6rem; color: #94a3b8; font-size: 1.1rem }
    .hero-desc { margin-top: 1.25rem; color: #cbd5e1; font-size: .97rem; max-width: 620px }
    .hero-desc strong { color: #f1f5f9 }
    .badge { display: inline-block; background: #14532d; color: #4ade80; font-size: .7rem; font-weight: 600; padding: .15rem .5rem; border-radius: 99px; vertical-align: middle; margin-left: .5rem }

    /* sections */
    section { padding: 2.5rem 0; border-bottom: 1px solid #1e293b }
    section:last-of-type { border-bottom: none }
    h2 { font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #64748b; margin-bottom: 1.1rem }
    h3 { font-size: 1rem; font-weight: 600; color: #f1f5f9; margin-bottom: .5rem }
    p { color: #94a3b8; font-size: .95rem }

    /* use-cases grid */
    .usecases { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: .75rem; margin-top: 1rem }
    .usecase { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 1rem 1.1rem }
    .usecase-icon { font-size: 1.4rem; margin-bottom: .4rem }

    /* prompt box */
    .prompt-wrap { position: relative; margin-top: 1rem }
    .prompt-box { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 1.25rem 1.25rem 3rem; font-family: 'SF Mono', 'Fira Code', monospace; font-size: .8rem; color: #cbd5e1; white-space: pre-wrap; line-height: 1.7; max-height: 320px; overflow-y: auto }
    .prompt-box .ph { color: #64748b }
    .copy-btn { position: absolute; bottom: .75rem; right: .75rem; background: #6366f1; color: #fff; border: none; border-radius: 6px; padding: .4rem .9rem; font-size: .8rem; font-weight: 600; cursor: pointer; transition: opacity .15s }
    .copy-btn:hover { opacity: .85 }
    .copy-btn.copied { background: #15803d }

    /* api flow */
    .flow { display: flex; flex-direction: column; gap: .5rem }
    .step { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: .75rem 1rem; font-family: 'SF Mono', 'Fira Code', monospace; font-size: .82rem; color: #e2e8f0 }
    .cm { color: #64748b }
    .me { color: #38bdf8 }
    .pa { color: #a78bfa }
    .st { color: #4ade80; margin-left: .5rem }

    /* actions */
    .links { display: flex; gap: .75rem; flex-wrap: wrap; margin-top: 1.5rem }
    a.btn, button.btn { display: inline-flex; align-items: center; gap: .5rem; padding: .625rem 1.25rem; border-radius: 8px; font-size: .9rem; font-weight: 500; text-decoration: none; transition: opacity .15s; cursor: pointer; border: none; font-family: inherit }
    a.btn:hover, button.btn:hover { opacity: .85 }
    .btn-primary { background: #6366f1; color: #fff }
    .btn-secondary { background: #1e293b; color: #94a3b8; border: 1px solid #334155 }

    /* modals */
    .overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.7); backdrop-filter: blur(4px); z-index: 100; align-items: center; justify-content: center; padding: 1rem }
    .overlay.open { display: flex }
    .modal { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.75rem; width: 100%; max-width: 520px; display: flex; flex-direction: column; gap: 1.25rem }
    .modal-title { font-size: 1.1rem; font-weight: 600; color: #f8fafc }
    .modal-meta { font-size: .8rem; color: #64748b }
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
<main class="page">

  <!-- HERO -->
  <header class="hero">
    <h1>Penzieroso <span class="badge">v1.0</span></h1>
    <p class="tagline">Free key-value storage REST server per applicazioni create dall'AI</p>
    <p class="hero-desc">
      Penzieroso è un backend gratuito e sempre disponibile che permette a qualsiasi applicazione web
      di <strong>salvare e recuperare dati JSON</strong> in modo persistente.
      Ogni namespace è isolato e protetto da una chiave — nessuna registrazione, nessun account.
      Pensato per app generate da <strong>Claude, ChatGPT, Gemini</strong> e altri AI che hanno bisogno
      di uno storage esterno senza poter configurare un proprio backend.
    </p>
  </header>

  <!-- USE CASES -->
  <section aria-labelledby="usecases-title">
    <h2 id="usecases-title">Casi d'uso</h2>
    <div class="usecases">
      <div class="usecase">
        <div class="usecase-icon">🤖</div>
        <h3>App generate da AI</h3>
        <p>Claude, ChatGPT e Gemini possono generare app web complete che usano Penzieroso come database remoto senza nessuna configurazione server.</p>
      </div>
      <div class="usecase">
        <div class="usecase-icon">📱</div>
        <h3>Prototipi e MVP</h3>
        <p>Salva le preferenze utente, lo stato dell'app o i dati di configurazione senza allestire un backend dedicato.</p>
      </div>
      <div class="usecase">
        <div class="usecase-icon">🔄</div>
        <h3>Sync tra dispositivi</h3>
        <p>Sincronizza dati tra browser diversi o dispositivi diversi con un semplice POST e GET protetti da chiave.</p>
      </div>
      <div class="usecase">
        <div class="usecase-icon">🧩</div>
        <h3>localStorage remoto</h3>
        <p>Un pattern semplice: salva in localStorage di default, offri sync remoto opzionale via Penzieroso con un solo bottone.</p>
      </div>
    </div>
  </section>

  <!-- INTEGRAZIONE AI -->
  <section aria-labelledby="integration-title">
    <h2 id="integration-title">Integra la tua app — prompt pronto per l'AI</h2>
    <p>Copia questo testo e incollalo nel tuo prompt per integrare Penzieroso in qualsiasi app generata da un AI assistant.</p>
    <div class="prompt-wrap">
      <div class="prompt-box" id="promptBox"></div>
      <button class="copy-btn" id="copyBtn" onclick="copyPrompt()">Copia</button>
    </div>
  </section>

  <!-- API REFERENCE -->
  <section aria-labelledby="api-title">
    <h2 id="api-title">API — come funziona</h2>
    <div class="flow">
      <div class="step"><span class="cm"># 1. Crea namespace (prima chiamata)</span><br><span class="me">POST</span> <span class="pa">${base}/data/myapp</span>  { key, payload: {} }<span class="st">→ 201</span></div>
      <div class="step"><span class="cm"># 2. Leggi payload</span><br><span class="me">GET</span>  <span class="pa">${base}/data/myapp?key=…</span><span class="st">→ 200 { payload, updatedAt }</span></div>
      <div class="step"><span class="cm"># 3. Aggiorna payload</span><br><span class="me">POST</span> <span class="pa">${base}/data/myapp</span>  { key, payload: {…} }<span class="st">→ 200</span></div>
      <div class="step"><span class="cm"># 4. Verifica esistenza (senza chiave)</span><br><span class="me">HEAD</span> <span class="pa">${base}/data/myapp</span><span class="st">→ 200 / 404</span></div>
      <div class="step"><span class="cm"># 5. Cambia chiave</span><br><span class="me">PUT</span>  <span class="pa">${base}/data/myapp/key</span>  { oldKey, newKey }<span class="st">→ 200</span></div>
    </div>
  </section>

  <!-- GESTISCI -->
  <section aria-labelledby="manage-title">
    <h2 id="manage-title">Gestisci i tuoi namespace</h2>
    <p>Crea un nuovo namespace o aprine uno esistente per visualizzare e modificare il JSON salvato direttamente da browser.</p>
    <div class="links">
      <button class="btn btn-primary" onclick="openCreateModal()">Crea namespace</button>
      <button class="btn btn-secondary" onclick="openLoginModal()">Apri namespace</button>
      <a class="btn btn-secondary" href="${base}/docs">Swagger UI</a>
      <a class="btn btn-secondary" href="${base}/openapi.json">openapi.json</a>
    </div>
  </section>

</main>

<!-- modal: crea namespace -->
<div class="overlay" id="createOverlay" onclick="overlayClick(event,'createOverlay')">
  <div class="modal">
    <div class="modal-title">Crea namespace</div>
    <label>Name<input type="text" id="createName" placeholder="myapp" autocomplete="off" /></label>
    <label>Key<input type="password" id="createKey" placeholder="••••••••" /></label>
    <label>Conferma key<input type="password" id="createKeyConfirm" placeholder="••••••••" /></label>
    <div class="msg" id="createMsg"></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal('createOverlay')">Annulla</button>
      <button class="btn btn-primary" id="createBtn" onclick="doCreate()">Crea</button>
    </div>
  </div>
</div>

<!-- modal: apri namespace -->
<div class="overlay" id="loginOverlay" onclick="overlayClick(event,'loginOverlay')">
  <div class="modal">
    <div class="modal-title">Apri namespace</div>
    <label>Name<input type="text" id="loginName" placeholder="myapp" autocomplete="off" /></label>
    <label>Key<input type="password" id="loginKey" placeholder="••••••••" /></label>
    <div class="msg" id="loginMsg"></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal('loginOverlay')">Annulla</button>
      <button class="btn btn-primary" id="loginBtn" onclick="doLogin()">Apri</button>
    </div>
  </div>
</div>

<!-- modal: editor JSON -->
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
  const PROMPT = ${JSON.stringify(integrationPrompt)};
  let _name = '', _key = '';

  // popola il prompt box
  document.getElementById('promptBox').textContent = PROMPT;

  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT).then(() => {
      const btn = document.getElementById('copyBtn');
      btn.textContent = 'Copiato!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copia'; btn.classList.remove('copied'); }, 2000);
    });
  }

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
      if (headRes.status === 200) { showMsg('createMsg', 'Namespace già esistente. Usa "Apri namespace".', 'err'); setLoading('createBtn', false); return; }
      _name = name; _key = key;
      closeModal('createOverlay');
      openEditorModal(name, {}, true, '');
    } catch(e) { showMsg('createMsg', 'Errore di rete.', 'err'); }
    setLoading('createBtn', false);
  }

  function openLoginModal() {
    document.getElementById('loginName').value = '';
    document.getElementById('loginKey').value = '';
    showMsg('loginMsg', '', '');
    document.getElementById('loginOverlay').classList.add('open');
    setTimeout(() => document.getElementById('loginName').focus(), 50);
  }

  async function doLogin() {
    const name = document.getElementById('loginName').value.trim();
    const key  = document.getElementById('loginKey').value;
    if (!name || !key) { showMsg('loginMsg', 'Compila tutti i campi.', 'err'); return; }
    setLoading('loginBtn', true);
    showMsg('loginMsg', '', '');
    try {
      const headRes = await fetch(BASE + '/data/' + encodeURIComponent(name), { method: 'HEAD' });
      let payload = {}, isNew = false, updatedAt = '';
      if (headRes.status === 404) {
        isNew = true;
      } else {
        const getRes = await fetch(BASE + '/data/' + encodeURIComponent(name) + '?key=' + encodeURIComponent(key));
        if (getRes.status === 401) { showMsg('loginMsg', 'Chiave errata.', 'err'); setLoading('loginBtn', false); return; }
        const data = await getRes.json();
        payload = data.payload; updatedAt = data.updatedAt;
      }
      _name = name; _key = key;
      closeModal('loginOverlay');
      openEditorModal(name, payload, isNew, updatedAt);
    } catch(e) { showMsg('loginMsg', 'Errore di rete.', 'err'); }
    setLoading('loginBtn', false);
  }

  function openEditorModal(name, payload, isNew, updatedAt) {
    document.getElementById('editorTitle').textContent = name;
    document.getElementById('editorMeta').textContent = isNew
      ? 'namespace nuovo — verrà creato al salvataggio'
      : 'aggiornato il ' + new Date(updatedAt).toLocaleString('it-IT');
    document.getElementById('editorArea').value = JSON.stringify(payload, null, 2);
    document.getElementById('editorArea').classList.remove('error');
    showMsg('editorMsg', '', '');
    document.getElementById('editorOverlay').classList.add('open');
    setTimeout(() => document.getElementById('editorArea').focus(), 50);
  }

  async function doSave() {
    const raw = document.getElementById('editorArea').value;
    let payload;
    try { payload = JSON.parse(raw); document.getElementById('editorArea').classList.remove('error'); }
    catch(e) { document.getElementById('editorArea').classList.add('error'); showMsg('editorMsg', 'JSON non valido.', 'err'); return; }
    setLoading('saveBtn', true);
    showMsg('editorMsg', '', '');
    try {
      const res = await fetch(BASE + '/data/' + encodeURIComponent(_name), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: _key, payload })
      });
      if (res.status === 401) { showMsg('editorMsg', 'Chiave errata.', 'err'); setLoading('saveBtn', false); return; }
      showMsg('editorMsg', 'Salvato.', 'ok');
      document.getElementById('editorMeta').textContent = 'aggiornato il ' + new Date().toLocaleString('it-IT');
    } catch(e) { showMsg('editorMsg', 'Errore di rete.', 'err'); }
    setLoading('saveBtn', false);
  }

  function closeModal(id) { document.getElementById(id).classList.remove('open'); }
  function overlayClick(e, id) { if (e.target === document.getElementById(id)) closeModal(id); }
  function showMsg(id, text, type) { const el = document.getElementById(id); el.textContent = text; el.className = 'msg' + (text ? ' show ' + type : ''); }
  function setLoading(btnId, loading) { const btn = document.getElementById(btnId); btn.disabled = loading; btn.style.opacity = loading ? '.5' : ''; }

  ['loginName','loginKey'].forEach(id => document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); }));
  ['createName','createKey','createKeyConfirm'].forEach(id => document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') doCreate(); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') ['editorOverlay','loginOverlay','createOverlay'].forEach(closeModal); });
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
