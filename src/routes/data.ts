import { Router, Request, Response } from 'express';
import { readEntry, upsertEntry, changeKey, verifyKey } from '../store';
import { PostBody, PutKeyBody } from '../types';

const router = Router();

router.get('/:name', async (req: Request, res: Response) => {
  const { name } = req.params;
  const key = req.query['key'];

  if (typeof key !== 'string' || key.trim() === '') {
    res.status(401).json({ error: 'wrong key' });
    return;
  }

  const entry = readEntry(name);
  if (!entry) {
    res.status(404).json({ error: 'not found' });
    return;
  }

  const valid = await verifyKey(entry, key);
  if (!valid) {
    res.status(401).json({ error: 'wrong key' });
    return;
  }

  res.status(200).json({ payload: entry.payload, updatedAt: entry.updatedAt });
});

router.post('/:name', async (req: Request, res: Response) => {
  const { name } = req.params;
  const body = req.body as PostBody;

  if (typeof body.key !== 'string' || body.key.trim() === '') {
    res.status(400).json({ error: 'key is required' });
    return;
  }

  const result = await upsertEntry(name, body.key, body.payload);

  if (result === 'unauthorized') {
    res.status(401).json({ error: 'wrong key' });
    return;
  }

  res.status(result === 'created' ? 201 : 200).json({ ok: true });
});

router.put('/:name/key', async (req: Request, res: Response) => {
  const { name } = req.params;
  const body = req.body as PutKeyBody;

  if (typeof body.oldKey !== 'string' || typeof body.newKey !== 'string') {
    res.status(400).json({ error: 'oldKey and newKey are required' });
    return;
  }

  const result = await changeKey(name, body.oldKey, body.newKey);

  if (result === 'notfound') {
    res.status(404).json({ error: 'not found' });
    return;
  }

  if (result === 'unauthorized') {
    res.status(401).json({ error: 'wrong key' });
    return;
  }

  res.status(200).json({ ok: true });
});

export default router;
