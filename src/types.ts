export interface StoredEntry {
  name: string;
  keyHash: string;
  updatedAt: string;
  payload: unknown;
}

export interface PostBody {
  key: string;
  payload: unknown;
}

export interface PutKeyBody {
  oldKey: string;
  newKey: string;
}
