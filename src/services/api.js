/**
 * Data layer — the ONLY file that knows where data lives.
 *
 * Right now the site runs without a backend: everything is stored in the browser (localStorage).
 * To go live with a real backend, set VITE_API_URL (e.g. https://api.yourdomain.com) in a `.env` file.
 * The same screens then talk to your REST API with no UI changes. Expected endpoints:
 *
 *   GET    /settings            PUT  /settings            (body: full settings object)
 *   GET    /listings            POST /listings            PATCH /listings/:id     DELETE /listings/:id
 *   (same CRUD for /projects, /meetings, /inquiries, /faqs)
 *   POST   /import  (body: whole database)                POST /reset
 */
import { makeSeed } from '../data/seed.js';

export const DB_KEY = 'aurelia_db_v1';
export const COLLECTIONS = ['listings', 'projects', 'meetings', 'inquiries', 'faqs'];

function readLocal() {
  const seed = makeSeed();
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const db = { ...seed, ...parsed, settings: { ...seed.settings, ...(parsed.settings || {}) } };
      COLLECTIONS.forEach((c) => {
        if (!Array.isArray(db[c])) db[c] = seed[c];
      });
      return db;
    }
  } catch {
    /* corrupted storage — fall back to demo data */
  }
  return seed;
}

function writeLocal(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

const localAdapter = {
  mode: 'local',
  label: 'Browser storage (no backend)',
  readSync: readLocal,
  async bootstrap() {
    return readLocal();
  },
  async create(name, item) {
    const db = readLocal();
    db[name] = [item, ...db[name]];
    writeLocal(db);
    return item;
  },
  async update(name, id, patch) {
    const db = readLocal();
    db[name] = db[name].map((x) => (x.id === id ? { ...x, ...patch } : x));
    writeLocal(db);
    return db[name].find((x) => x.id === id);
  },
  async remove(name, id) {
    const db = readLocal();
    db[name] = db[name].filter((x) => x.id !== id);
    writeLocal(db);
    return true;
  },
  async saveSettings(settings) {
    const db = readLocal();
    db.settings = settings;
    writeLocal(db);
    return settings;
  },
  async replaceAll(next) {
    writeLocal(next);
    return next;
  },
  async reset() {
    const seed = makeSeed();
    writeLocal(seed);
    return seed;
  },
};

const BASE = (import.meta.env && import.meta.env.VITE_API_URL) || '';

async function http(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status} on ${path}`);
  return res.status === 204 ? null : res.json();
}

const httpAdapter = {
  mode: 'rest',
  label: `REST API · ${BASE}`,
  readSync: () => makeSeed(),
  async bootstrap() {
    const [settings, ...lists] = await Promise.all([http('/settings'), ...COLLECTIONS.map((c) => http(`/${c}`))]);
    const db = { settings };
    COLLECTIONS.forEach((c, i) => {
      db[c] = lists[i];
    });
    return db;
  },
  create: (name, item) => http(`/${name}`, { method: 'POST', body: JSON.stringify(item) }),
  update: (name, id, patch) => http(`/${name}/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  remove: (name, id) => http(`/${name}/${id}`, { method: 'DELETE' }),
  saveSettings: (settings) => http('/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  replaceAll: (db) => http('/import', { method: 'POST', body: JSON.stringify(db) }),
  reset: () => http('/reset', { method: 'POST' }),
};

export const api = BASE ? httpAdapter : localAdapter;
