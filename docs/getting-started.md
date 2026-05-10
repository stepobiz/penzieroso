---
layout: default
title: Getting Started
nav_order: 2
---

# Getting Started

## Prerequisiti

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose

---

## Avvio con Docker Compose

**1. Crea la cartella dati e scarica il compose file:**

```bash
mkdir penzieroso && cd penzieroso
curl -O https://raw.githubusercontent.com/stepobiz/penzieroso/main/compose.yml
```

**2. Avvia il servizio:**

```bash
docker compose up -d
```

L'API è disponibile su `http://localhost:3000`.

**3. Verifica che sia in esecuzione:**

```bash
curl -X POST http://localhost:3000/data/test \
  -H "Content-Type: application/json" \
  -d '{"key": "mykey", "payload": {"hello": "world"}}'
# → 201 {"ok":true}
```

---

## Persistenza dei dati

I dati vengono salvati nella cartella `./data/` come file JSON, uno per namespace.
Il volume Docker garantisce la persistenza tra i riavvii del container.

```
./data/
└── test.json   ← creato automaticamente dopo il primo POST
```

---

## Sviluppo locale

**Prerequisiti:** Node.js 20+

```bash
git clone https://github.com/stepobiz/penzieroso.git
cd penzieroso
npm install
npm run dev      # avvia con hot reload su porta 3000
```

| Script | Descrizione |
|--------|-------------|
| `npm run dev` | Avvio con `ts-node-dev` e hot reload |
| `npm run build` | Compila TypeScript in `dist/` |
| `npm start` | Avvia il build compilato |

---

## Configurazione

| Parametro | Valore | Note |
|-----------|--------|------|
| Porta | `3000` | Configurabile nel compose file |
| Dati | `./data/` | Cartella montata come volume |
| CORS | `*` | Abilitato per qualsiasi origine |

---

## Aggiornare l'immagine

```bash
docker compose pull
docker compose up -d
```
