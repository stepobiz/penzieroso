# penzieroso

Generic key-value storage REST backend. Lets any frontend save and load JSON data identified by a name and protected by a key. No application logic — just storage.

Data is persisted as JSON files on disk, one file per namespace.

## Quick start

```bash
docker compose up -d
```

The service will be available at `http://localhost:3000`.

## API

### GET /data/:name?key=xxx

Retrieve stored payload.

```bash
# Success
curl "http://localhost:3000/data/myapp?key=secret123"
# → 200 { "payload": { ... }, "updatedAt": "2024-01-15T10:30:00.000Z" }

# Wrong key
curl "http://localhost:3000/data/myapp?key=wrongkey"
# → 401 { "error": "wrong key" }

# Not found
curl "http://localhost:3000/data/nonexistent?key=anykey"
# → 404 { "error": "not found" }
```

### POST /data/:name

Create or update a namespace. On first call creates the namespace and hashes the key. On subsequent calls verifies the key before updating.

```bash
# Create (first call)
curl -X POST http://localhost:3000/data/myapp \
  -H "Content-Type: application/json" \
  -d '{"key": "secret123", "payload": {"theme": "dark", "lang": "it"}}'
# → 201 { "ok": true }

# Update (subsequent calls)
curl -X POST http://localhost:3000/data/myapp \
  -H "Content-Type: application/json" \
  -d '{"key": "secret123", "payload": {"theme": "light", "lang": "en"}}'
# → 200 { "ok": true }

# Wrong key
curl -X POST http://localhost:3000/data/myapp \
  -H "Content-Type: application/json" \
  -d '{"key": "wrongkey", "payload": {}}'
# → 401 { "error": "wrong key" }
```

### PUT /data/:name/key

Change the key for an existing namespace.

```bash
# Success
curl -X PUT http://localhost:3000/data/myapp/key \
  -H "Content-Type: application/json" \
  -d '{"oldKey": "secret123", "newKey": "newsecret456"}'
# → 200 { "ok": true }

# Wrong old key
curl -X PUT http://localhost:3000/data/myapp/key \
  -H "Content-Type: application/json" \
  -d '{"oldKey": "wrongkey", "newKey": "newsecret456"}'
# → 401 { "error": "wrong key" }
```

## Stored JSON structure

Each namespace is saved at `./data/:name.json`:

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

The key is never stored in plaintext — only a bcrypt hash.

## Development

```bash
npm install
npm run dev   # ts-node-dev with hot reload
npm run build # compile TypeScript
npm start     # run compiled output
```
