import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, DB_KEY } from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import { formatCompact, formatMoney, uid } from '../utils/helpers.js';

const FAV_KEY = 'aurelia_favs_v1';
const SESSION_KEY = 'aurelia_admin_session_v1';

const StoreCtx = createContext(null);

function readFavs() {
  try {
    const v = JSON.parse(localStorage.getItem(FAV_KEY));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }) {
  const toast = useToast();
  const [db, setDb] = useState(() => api.readSync());
  const [ready, setReady] = useState(api.mode === 'local');
  const [favs, setFavs] = useState(readFavs);
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });

  const dbRef = useRef(db);
  dbRef.current = db;

  // Load from a real API when configured
  useEffect(() => {
    if (api.mode === 'local') return undefined;
    let alive = true;
    api
      .bootstrap()
      .then((data) => {
        if (!alive) return;
        setDb(data);
        setReady(true);
      })
      .catch(() => {
        if (!alive) return;
        toast('Could not reach the API — showing demo data', 'error');
        setReady(true);
      });
    return () => {
      alive = false;
    };
  }, [toast]);

  // Keep several browser tabs in sync (admin in one tab, site in another)
  useEffect(() => {
    if (api.mode !== 'local') return undefined;
    const onStorage = (e) => {
      if (e.key === DB_KEY) setDb(api.readSync());
      if (e.key === FAV_KEY) setFavs(readFavs());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const fail = useCallback(
    (e) => {
      const quota = e && (e.name === 'QuotaExceededError' || e.code === 22);
      toast(quota ? 'Storage is full — try smaller images' : 'Could not save your changes', 'error');
    },
    [toast],
  );

  const add = useCallback(
    async (name, item) => {
      const full = { createdAt: new Date().toISOString(), ...item, id: item.id || uid(name[0]) };
      setDb((d) => ({ ...d, [name]: [full, ...d[name]] }));
      try {
        await api.create(name, full);
        return full;
      } catch (e) {
        setDb((d) => ({ ...d, [name]: d[name].filter((x) => x.id !== full.id) }));
        fail(e);
        return null;
      }
    },
    [fail],
  );

  const update = useCallback(
    async (name, id, patch) => {
      const previous = dbRef.current[name];
      setDb((d) => ({ ...d, [name]: d[name].map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
      try {
        await api.update(name, id, patch);
        return true;
      } catch (e) {
        setDb((d) => ({ ...d, [name]: previous }));
        fail(e);
        return false;
      }
    },
    [fail],
  );

  const remove = useCallback(
    async (name, id) => {
      const previous = dbRef.current[name];
      setDb((d) => ({ ...d, [name]: d[name].filter((x) => x.id !== id) }));
      try {
        await api.remove(name, id);
        return true;
      } catch (e) {
        setDb((d) => ({ ...d, [name]: previous }));
        fail(e);
        return false;
      }
    },
    [fail],
  );

  const saveSettings = useCallback(
    async (patch) => {
      const previous = dbRef.current.settings;
      const next = { ...previous, ...patch };
      setDb((d) => ({ ...d, settings: next }));
      try {
        await api.saveSettings(next);
        return true;
      } catch (e) {
        setDb((d) => ({ ...d, settings: previous }));
        fail(e);
        return false;
      }
    },
    [fail],
  );

  const resetAll = useCallback(async () => {
    try {
      const fresh = await api.reset();
      setDb(fresh);
      return true;
    } catch (e) {
      fail(e);
      return false;
    }
  }, [fail]);

  const importAll = useCallback(
    async (data) => {
      try {
        const base = api.readSync();
        const next = { ...base, ...data, settings: { ...base.settings, ...(data.settings || {}) } };
        await api.replaceAll(next);
        setDb(next);
        return true;
      } catch (e) {
        fail(e);
        return false;
      }
    },
    [fail],
  );

  const toggleFav = useCallback((id) => {
    setFavs((list) => {
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const login = useCallback((email, password) => {
    const s = dbRef.current.settings;
    const ok =
      String(email).trim().toLowerCase() === String(s.adminEmail).trim().toLowerCase() &&
      String(password) === String(s.adminPassword);
    if (ok) {
      try {
        localStorage.setItem(SESSION_KEY, '1');
      } catch {
        /* ignore */
      }
      setIsAdmin(true);
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setIsAdmin(false);
  }, []);

  const value = useMemo(
    () => ({
      ...db,
      ready,
      favs,
      isAdmin,
      add,
      update,
      remove,
      saveSettings,
      resetAll,
      importAll,
      toggleFav,
      login,
      logout,
    }),
    [db, ready, favs, isAdmin, add, update, remove, saveSettings, resetAll, importAll, toggleFav, login, logout],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

export function useMoney() {
  const { settings } = useStore();
  const currency = settings.currency || 'USD';
  return useMemo(
    () => ({
      money: (n) => formatMoney(n, currency),
      compact: (n) => formatCompact(n, currency),
      currency,
    }),
    [currency],
  );
}
