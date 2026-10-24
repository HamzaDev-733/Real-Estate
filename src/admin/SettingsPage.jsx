import { useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Modal } from '../components/ui.jsx';
import { useToast } from '../components/Toast.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { api } from '../services/api.js';
import { CURRENCIES } from '../data/seed.js';
import { downloadFile } from '../utils/helpers.js';
import { ImageField } from './fields.jsx';

const Card = ({ title, children, desc }) => (
  <section className="rounded-3xl border border-mist-200 bg-white p-6 sm:p-8">
    <h2 className="font-sans text-lg font-bold text-navy-900">{title}</h2>
    {desc && <p className="mt-1 text-sm text-mist-500">{desc}</p>}
    <div className="mt-6">{children}</div>
  </section>
);

export default function SettingsPage() {
  const store = useStore();
  const toast = useToast();
  const [form, setForm] = useState(() => ({ ...store.settings, newPassword: '', confirm: '' }));
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setVal = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.company.trim()) return toast('Company name is required', 'error');
    if (!/^\S+@\S+\.\S+$/.test(form.adminEmail)) return toast('Enter a valid admin email', 'error');
    if (form.newPassword || form.confirm) {
      if (form.newPassword.length < 6) return toast('Password must be at least 6 characters', 'error');
      if (form.newPassword !== form.confirm) return toast('Passwords do not match', 'error');
    }
    const { newPassword, confirm, ...rest } = form;
    const ok = await store.saveSettings({ ...rest, adminPassword: newPassword || store.settings.adminPassword });
    if (ok) {
      setForm((f) => ({ ...f, newPassword: '', confirm: '' }));
      toast('Settings saved');
    }
    return undefined;
  };

  const exportData = () => {
    const { settings, listings, projects, meetings, inquiries, faqs } = store;
    downloadFile(
      `aurelia-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify({ settings, listings, projects, meetings, inquiries, faqs }, null, 2),
    );
    toast('Backup downloaded');
  };

  const importData = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (typeof data !== 'object' || data === null || Array.isArray(data)) throw new Error('bad');
      const ok = await store.importAll(data);
      if (ok) {
        toast('Backup restored');
        setForm({ ...store.settings, ...(data.settings || {}), newPassword: '', confirm: '' });
      }
    } catch {
      toast('That file is not a valid backup', 'error');
    }
  };

  const doReset = async () => {
    const ok = await store.resetAll();
    setConfirmReset(false);
    if (ok) toast('Demo data restored');
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-navy-900">Settings</h1>
      <p className="mt-1 text-sm text-mist-500">Branding, contact details and data tools.</p>

      <form onSubmit={save} className="mt-8 space-y-6">
        <Card title="Company & branding" desc="Shown in the navbar, footer, chatbot and meeting pass.">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="s-company">Company name</label>
              <input id="s-company" className="input" value={form.company} onChange={set('company')} />
            </div>
            <div>
              <label className="label" htmlFor="s-tag">Tagline</label>
              <input id="s-tag" className="input" value={form.tagline} onChange={set('tagline')} />
            </div>
            <div className="sm:col-span-2">
              <ImageField label="Logo (leave empty for the built-in mark)" value={form.logoUrl} onChange={setVal('logoUrl')} />
            </div>
            <div className="sm:col-span-2">
              <ImageField label="Homepage hero image" value={form.heroImage} onChange={setVal('heroImage')} />
            </div>
          </div>
        </Card>

        <Card title="Contact & locale">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="s-phone">Phone</label>
              <input id="s-phone" className="input" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="label" htmlFor="s-email">Public email</label>
              <input id="s-email" className="input" value={form.email} onChange={set('email')} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="s-address">Address</label>
              <input id="s-address" className="input" value={form.address} onChange={set('address')} />
            </div>
            <div>
              <label className="label" htmlFor="s-hours">Office hours</label>
              <input id="s-hours" className="input" value={form.hours} onChange={set('hours')} />
            </div>
            <div>
              <label className="label" htmlFor="s-cur">Currency</label>
              <select id="s-cur" className="input" value={form.currency} onChange={set('currency')}>
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-mist-400">Changes the symbol only — prices are not converted.</p>
            </div>
          </div>
        </Card>

        <Card title="Admin login" desc="Demo-only authentication stored in the browser. Replace with real server-side auth when you add a backend.">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="s-aemail">Admin email</label>
              <input id="s-aemail" className="input" value={form.adminEmail} onChange={set('adminEmail')} />
            </div>
            <div>
              <label className="label" htmlFor="s-pw">New password</label>
              <input id="s-pw" type="password" className="input" value={form.newPassword} onChange={set('newPassword')} placeholder="Leave blank to keep" autoComplete="new-password" />
            </div>
            <div>
              <label className="label" htmlFor="s-pw2">Confirm password</label>
              <input id="s-pw2" type="password" className="input" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            <Icon name="check" className="h-4 w-4" />
            Save settings
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-6">
        <Card title="Data tools" desc={`Current data source: ${api.label}`}>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-outline" onClick={exportData}>
              <Icon name="download" className="h-4 w-4" />
              Export backup (JSON)
            </button>
            <button type="button" className="btn-outline" onClick={() => fileRef.current?.click()}>
              <Icon name="upload" className="h-4 w-4" />
              Import backup
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importData} />
            <button type="button" className="btn border border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white" onClick={() => setConfirmReset(true)}>
              <Icon name="refresh" className="h-4 w-4" />
              Reset to demo data
            </button>
          </div>
        </Card>

        <Card title="Connect a backend" desc="The whole site reads and writes through one file: src/services/api.js.">
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            <li>Create a REST API with the endpoints listed at the top of <code className="rounded bg-mist-100 px-1.5">src/services/api.js</code>.</li>
            <li>Add a <code className="rounded bg-mist-100 px-1.5">.env</code> file: <code className="rounded bg-mist-100 px-1.5">VITE_API_URL=https://api.yourdomain.com</code></li>
            <li>Restart the dev server. Every screen — public site and admin — now uses your API.</li>
          </ol>
        </Card>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} maxWidth="max-w-md">
        <div className="p-8 text-center">
          <h3 className="text-xl font-semibold">Reset everything?</h3>
          <p className="mt-2 text-sm text-mist-500">All your listings, projects, meetings and settings will be replaced by the demo data.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" className="btn-outline" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
            <button type="button" className="btn bg-rose-500 text-white hover:bg-rose-600" onClick={doReset}>
              Yes, reset
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
