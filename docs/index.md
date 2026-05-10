---
layout: default
title: Home
nav_order: 1
---

# Penzieroso

**Generic key-value storage REST backend.**

Un mini datastore che permette a qualsiasi frontend di salvare e caricare dati JSON identificati da un nome e protetti da una chiave. Nessuna logica applicativa — solo storage.

---

## Come funziona

Ogni namespace è un file JSON isolato su disco. La chiave non viene mai salvata in chiaro: al primo salvataggio viene hashata con **bcrypt**, e ogni accesso successivo la verifica contro l'hash.

```
POST /data/myapp   { key: "secret", payload: {...} }   → crea il namespace
GET  /data/myapp?key=secret                            → legge il payload
POST /data/myapp   { key: "secret", payload: {...} }   → aggiorna il payload
PUT  /data/myapp/key { oldKey, newKey }                → cambia la chiave
```

---

## Quick start

```bash
docker compose up -d
```

L'API è disponibile su `http://localhost:3000`.

---

## Link rapidi

- [Getting Started](getting-started) — avvio con Docker, sviluppo locale
- [API Reference](api-reference) — documentazione completa delle 3 route
