---
layout: default
title: API Reference
nav_order: 3
---

# API Reference

Base URL: `http://localhost:3000`

---

## GET /data/:name

Legge il payload di un namespace verificando la chiave.

### Parametri

| Parametro | Tipo | Dove | Descrizione |
|-----------|------|------|-------------|
| `name` | string | path | Nome del namespace |
| `key` | string | query | Chiave di accesso |

### Risposte

| Status | Corpo | Quando |
|--------|-------|--------|
| `200` | `{ payload, updatedAt }` | Chiave corretta |
| `401` | `{ error: "wrong key" }` | Chiave errata o assente |
| `404` | `{ error: "not found" }` | Namespace non esistente |

### Esempio

```bash
curl "http://localhost:3000/data/myapp?key=secret123"
```

```json
{
  "payload": { "theme": "dark", "lang": "it" },
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## POST /data/:name

Crea o aggiorna un namespace. Alla prima chiamata crea il namespace e salva l'hash della chiave. Alle chiamate successive verifica la chiave prima di aggiornare il payload.

### Body

```json
{
  "key": "string",
  "payload": "any"
}
```

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `key` | string | Chiave di accesso (hashata con bcrypt) |
| `payload` | any | Dati JSON da salvare |

### Risposte

| Status | Corpo | Quando |
|--------|-------|--------|
| `201` | `{ ok: true }` | Namespace creato (prima chiamata) |
| `200` | `{ ok: true }` | Payload aggiornato |
| `401` | `{ error: "wrong key" }` | Chiave errata |

### Esempio — prima creazione

```bash
curl -X POST http://localhost:3000/data/myapp \
  -H "Content-Type: application/json" \
  -d '{"key": "secret123", "payload": {"theme": "dark", "lang": "it"}}'
```

```json
{ "ok": true }
```

### Esempio — aggiornamento

```bash
curl -X POST http://localhost:3000/data/myapp \
  -H "Content-Type: application/json" \
  -d '{"key": "secret123", "payload": {"theme": "light", "lang": "en"}}'
```

```json
{ "ok": true }
```

---

## PUT /data/:name/key

Cambia la chiave di un namespace esistente.

### Body

```json
{
  "oldKey": "string",
  "newKey": "string"
}
```

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `oldKey` | string | Chiave attuale (per verifica) |
| `newKey` | string | Nuova chiave da impostare |

### Risposte

| Status | Corpo | Quando |
|--------|-------|--------|
| `200` | `{ ok: true }` | Chiave aggiornata |
| `401` | `{ error: "wrong key" }` | `oldKey` errata |
| `404` | `{ error: "not found" }` | Namespace non esistente |

### Esempio

```bash
curl -X PUT http://localhost:3000/data/myapp/key \
  -H "Content-Type: application/json" \
  -d '{"oldKey": "secret123", "newKey": "newsecret456"}'
```

```json
{ "ok": true }
```

---

## Struttura JSON su disco

Ogni namespace viene salvato in `./data/:name.json`:

```json
{
  "name": "myapp",
  "keyHash": "$2a$10$hashedkeystring...",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "payload": {
    "theme": "dark",
    "lang": "it"
  }
}
```

> La chiave non viene mai salvata in chiaro. Solo il suo hash bcrypt è persistito su disco.
