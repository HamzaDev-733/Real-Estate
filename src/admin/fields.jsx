import { useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Img } from '../components/ui.jsx';
import { useToast } from '../components/Toast.jsx';
import { fileToDataUrl } from '../utils/helpers.js';

export function ImageField({ value, onChange, label = 'Image' }) {
  const toast = useToast();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const isData = typeof value === 'string' && value.startsWith('data:');

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please choose an image file', 'error');
      return;
    }
    setBusy(true);
    try {
      onChange(await fileToDataUrl(file));
    } catch {
      toast('Could not read that image', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-4">
        <div className="h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-mist-200 bg-mist-50">
          {value ? (
            <Img src={value} alt="" />
          ) : (
            <div className="flex h-full items-center justify-center text-mist-300">
              <Icon name="image" className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            className="input"
            placeholder="Paste an image URL…"
            value={isData ? '' : value || ''}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} URL`}
          />
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => input.current?.click()} disabled={busy} className="btn-outline !px-4 !py-2 text-xs">
              <Icon name="upload" className="h-4 w-4" />
              {busy ? 'Processing…' : 'Upload file'}
            </button>
            {value && (
              <button type="button" onClick={() => onChange('')} className="text-xs font-semibold text-rose-500 hover:text-rose-700">
                Remove
              </button>
            )}
            {isData && <span className="text-xs text-mist-400">Uploaded image saved locally</span>}
          </div>
          <input ref={input} type="file" accept="image/*" className="hidden" onChange={upload} />
        </div>
      </div>
    </div>
  );
}

/** Renders one field of a generated admin form. */
export function FieldInput({ field, value, onChange, error }) {
  const id = `f-${field.key}`;
  const common = { id, 'aria-invalid': !!error };

  let control;
  switch (field.type) {
    case 'textarea':
      control = <textarea {...common} rows={field.rows || 4} className="input resize-y" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />;
      break;
    case 'number':
      control = (
        <input
          {...common}
          type="number"
          min={field.min}
          max={field.max}
          step={field.step || 1}
          className="input"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
      );
      break;
    case 'select':
      control = (
        <select {...common} className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
      break;
    case 'date':
      control = <input {...common} type="date" className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
      break;
    case 'bool':
      return (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-mist-200 px-4 py-3 text-sm font-semibold text-navy-900">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-navy-900" />
          {field.label}
          {field.help && <span className="font-normal text-mist-400">— {field.help}</span>}
        </label>
      );
    case 'image':
      return <ImageField label={field.label} value={value} onChange={onChange} />;
    case 'tags':
      control = (
        <input
          {...common}
          className="input"
          placeholder="Comma separated"
          value={Array.isArray(value) ? value.join(', ') : value ?? ''}
          onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trimStart()))}
          onBlur={() => onChange((Array.isArray(value) ? value : []).map((s) => s.trim()).filter(Boolean))}
        />
      );
      break;
    case 'lines':
      control = (
        <textarea
          {...common}
          rows={3}
          className="input resize-y font-mono text-xs"
          placeholder="One image URL per line"
          value={Array.isArray(value) ? value.join('\n') : value ?? ''}
          onChange={(e) => onChange(e.target.value.split('\n'))}
          onBlur={() => onChange((Array.isArray(value) ? value : []).map((s) => s.trim()).filter(Boolean))}
        />
      );
      break;
    default:
      control = <input {...common} type={field.type || 'text'} className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />;
  }

  return (
    <div>
      <label className="label" htmlFor={id}>
        {field.label}
        {field.required && <span className="text-rose-500"> *</span>}
      </label>
      {control}
      {field.help && <p className="mt-1 text-xs text-mist-400">{field.help}</p>}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
