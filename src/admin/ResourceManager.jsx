import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../components/Icon.jsx';
import { Modal } from '../components/ui.jsx';
import { useToast } from '../components/Toast.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { FieldInput } from './fields.jsx';

/**
 * Generic CRUD screen. Each admin section (listings, projects, …) is just a config object:
 * columns for the table, fields for the add/edit form. Data goes through the store → api layer,
 * so it works on localStorage today and on a REST backend later with zero changes here.
 */
export default function ResourceManager({
  title,
  subtitle,
  collection,
  columns,
  fields,
  defaults,
  searchKeys = [],
  canAdd = true,
  newLabel = 'Add new',
  filter,
  toForm = (x) => x,
  fromForm = (x) => x,
  beforeCreate = (x) => x,
  header,
}) {
  const store = useStore();
  const items = store[collection];
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [filterValue, setFilterValue] = useState('All');
  const [editing, setEditing] = useState(null); // { mode, id, data }
  const [errors, setErrors] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((it) => {
      if (filter && filterValue !== 'All' && it[filter.key] !== filterValue) return false;
      if (!term) return true;
      return searchKeys.some((k) => String(it[k] ?? '').toLowerCase().includes(term));
    });
  }, [items, search, filter, filterValue, searchKeys]);

  const openNew = () => {
    setErrors({});
    setEditing({ mode: 'new', data: { ...defaults } });
  };
  const openEdit = (it) => {
    setErrors({});
    setEditing({ mode: 'edit', id: it.id, data: toForm({ ...it }) });
  };

  const setField = (key) => (value) =>
    setEditing((e) => ({ ...e, data: { ...e.data, [key]: value } }));

  const save = async (e) => {
    e.preventDefault();
    const er = {};
    fields.forEach((f) => {
      const v = editing.data[f.key];
      if (f.required && (v === '' || v === undefined || v === null || (Array.isArray(v) && !v.length))) er[f.key] = 'This field is required';
      if (f.type === 'number' && v !== '' && v !== undefined && f.min !== undefined && Number(v) < f.min) er[f.key] = `Minimum is ${f.min}`;
      if (f.type === 'number' && v !== '' && v !== undefined && f.max !== undefined && Number(v) > f.max) er[f.key] = `Maximum is ${f.max}`;
    });
    setErrors(er);
    if (Object.keys(er).length) {
      toast('Please fix the highlighted fields', 'error');
      return;
    }

    // clean array fields and numbers
    const cleaned = { ...editing.data };
    fields.forEach((f) => {
      if (f.type === 'tags' || f.type === 'lines') {
        const arr = Array.isArray(cleaned[f.key]) ? cleaned[f.key] : String(cleaned[f.key] || '').split(f.type === 'tags' ? ',' : '\n');
        cleaned[f.key] = arr.map((s) => s.trim()).filter(Boolean);
      }
      if (f.type === 'number') cleaned[f.key] = Number(cleaned[f.key]) || 0;
    });
    const payload = fromForm(cleaned);

    setBusy(true);
    let ok;
    if (editing.mode === 'new') ok = await store.add(collection, beforeCreate(payload));
    else ok = await store.update(collection, editing.id, payload);
    setBusy(false);
    if (ok) {
      toast(editing.mode === 'new' ? 'Created successfully' : 'Changes saved');
      setEditing(null);
    }
  };

  const confirmDelete = async () => {
    const ok = await store.remove(collection, deleting.id);
    if (ok) toast('Deleted');
    setDeleting(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-mist-500">{subtitle}</p>}
        </div>
        {canAdd && (
          <button type="button" onClick={openNew} className="btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            {newLabel}
          </button>
        )}
      </div>

      {header}

      <div className="overflow-hidden rounded-3xl border border-mist-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-mist-100 p-4">
          <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl bg-mist-50 px-4 py-2.5">
            <Icon name="search" className="h-4 w-4 text-mist-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              aria-label="Search"
              className="w-full bg-transparent text-sm outline-none placeholder:text-mist-400"
            />
          </label>
          {filter && (
            <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} aria-label={filter.label} className="input !w-auto !py-2.5">
              <option value="All">{filter.label}: All</option>
              {filter.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          )}
          <span className="text-xs font-semibold text-mist-400">
            {rows.length} {rows.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-mist-50 text-left text-xs uppercase tracking-wider text-mist-500">
              <tr>
                {columns.map((c) => (
                  <th key={c.label} className={`px-5 py-3 font-semibold ${c.className || ''}`}>
                    {c.label}
                  </th>
                ))}
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {rows.map((it) => (
                  <motion.tr
                    key={it.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-t border-mist-100 align-middle transition-colors hover:bg-mist-50/70"
                  >
                    {columns.map((c) => (
                      <td key={c.label} className={`px-5 py-3.5 ${c.className || ''}`}>
                        {c.render ? c.render(it) : String(it[c.key] ?? '—')}
                      </td>
                    ))}
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => openEdit(it)} aria-label="Edit" className="flex h-9 w-9 items-center justify-center rounded-full text-navy-700 transition hover:bg-navy-900 hover:text-white">
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setDeleting(it)} aria-label="Delete" className="flex h-9 w-9 items-center justify-center rounded-full text-rose-500 transition hover:bg-rose-500 hover:text-white">
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {rows.length === 0 && <p className="px-5 py-14 text-center text-sm text-mist-400">Nothing here yet.</p>}
        </div>
      </div>

      {/* Add / edit */}
      <Modal open={!!editing} onClose={() => setEditing(null)} maxWidth="max-w-2xl">
        {editing && (
          <form onSubmit={save} noValidate className="p-6 sm:p-8">
            <h2 className="pr-12 text-2xl font-semibold">{editing.mode === 'new' ? newLabel : 'Edit record'}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className={f.half ? '' : 'sm:col-span-2'}>
                  <FieldInput field={f} value={editing.data[f.key]} onChange={setField(f.key)} error={errors[f.key]} />
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button type="button" className="btn-outline" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} maxWidth="max-w-md">
        <div className="p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <Icon name="trash" className="h-6 w-6" />
          </span>
          <h3 className="mt-5 text-xl font-semibold">Delete this record?</h3>
          <p className="mt-2 text-sm text-mist-500">This cannot be undone.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" className="btn-outline" onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button type="button" className="btn bg-rose-500 text-white hover:bg-rose-600" onClick={confirmDelete}>
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
