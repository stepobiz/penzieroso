import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { StoredEntry } from './types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SALT_ROUNDS = 10;

function entryPath(name: string): string {
  const safe = path.basename(name);
  return path.join(DATA_DIR, `${safe}.json`);
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readEntry(name: string): StoredEntry | null {
  const file = entryPath(name);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf-8');
  return JSON.parse(raw) as StoredEntry;
}

function writeEntry(entry: StoredEntry): void {
  ensureDataDir();
  fs.writeFileSync(entryPath(entry.name), JSON.stringify(entry, null, 2), 'utf-8');
}

export async function verifyKey(entry: StoredEntry, key: string): Promise<boolean> {
  return bcrypt.compare(key, entry.keyHash);
}

export async function upsertEntry(
  name: string,
  key: string,
  payload: unknown
): Promise<'created' | 'updated' | 'unauthorized'> {
  const existing = readEntry(name);

  if (existing) {
    const valid = await verifyKey(existing, key);
    if (!valid) return 'unauthorized';
    existing.payload = payload;
    existing.updatedAt = new Date().toISOString();
    writeEntry(existing);
    return 'updated';
  }

  const keyHash = await bcrypt.hash(key, SALT_ROUNDS);
  const entry: StoredEntry = {
    name,
    keyHash,
    updatedAt: new Date().toISOString(),
    payload,
  };
  writeEntry(entry);
  return 'created';
}

export async function changeKey(
  name: string,
  oldKey: string,
  newKey: string
): Promise<'ok' | 'unauthorized' | 'notfound'> {
  const entry = readEntry(name);
  if (!entry) return 'notfound';

  const valid = await verifyKey(entry, oldKey);
  if (!valid) return 'unauthorized';

  entry.keyHash = await bcrypt.hash(newKey, SALT_ROUNDS);
  entry.updatedAt = new Date().toISOString();
  writeEntry(entry);
  return 'ok';
}
