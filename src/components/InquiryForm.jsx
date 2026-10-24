import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from './Icon.jsx';
import { useStore } from '../store/StoreContext.jsx';
import { useToast } from './Toast.jsx';

const EMPTY = { name: '', email: '', phone: '', message: '' };

export default function InquiryForm({ listing, light = false }) {
  const { add } = useStore();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Please enter your name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email';
    if (form.phone && form.phone.replace(/\D/g, '').length < 7) er.phone = 'Enter a valid phone number';
    return er;
  };

  const submit = async (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    const saved = await add('inquiries', {
      ...form,
      listingId: listing?.id || '',
      listingTitle: listing?.title || 'General inquiry',
      message: form.message.trim() || (listing ? `I am interested in ${listing.title}.` : 'Please contact me.'),
      status: 'New',
    });
    setBusy(false);
    if (saved) {
      setSent(true);
      setForm(EMPTY);
      toast('Inquiry sent — we will contact you shortly');
    }
  };

  const field = (k, label, props = {}) => (
    <div>
      <label className="label" htmlFor={`inq-${k}`}>
        {label}
      </label>
      <input id={`inq-${k}`} className={`input ${errors[k] ? '!border-rose-400' : ''}`} value={form[k]} onChange={set(k)} {...props} />
      {errors[k] && <p className="mt-1 text-xs text-rose-500">{errors[k]}</p>}
    </div>
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center py-8 text-center"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-900 text-white"
          >
            <Icon name="check" className="h-8 w-8" strokeWidth={2.5} />
          </motion.span>
          <h4 className="mt-5 text-xl font-semibold">Thank you!</h4>
          <p className="mt-2 max-w-xs text-sm text-mist-500">An advisor will reach out within one business day.</p>
          <button type="button" onClick={() => setSent(false)} className="mt-5 text-sm font-semibold text-navy-500 hover:text-navy-900">
            Send another inquiry
          </button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
          {field('name', 'Full name', { placeholder: 'Jane Doe', autoComplete: 'name' })}
          <div className="grid gap-4 sm:grid-cols-2">
            {field('email', 'Email', { type: 'email', placeholder: 'you@email.com', autoComplete: 'email' })}
            {field('phone', 'Phone (optional)', { type: 'tel', placeholder: '+1 555 000 0000', autoComplete: 'tel' })}
          </div>
          <div>
            <label className="label" htmlFor="inq-message">
              Message
            </label>
            <textarea
              id="inq-message"
              rows={3}
              className="input resize-none"
              placeholder={listing ? `I'd like to know more about ${listing.title}…` : 'How can we help?'}
              value={form.message}
              onChange={set('message')}
            />
          </div>
          <button type="submit" disabled={busy} className={light ? 'btn-light w-full' : 'btn-primary w-full'}>
            {busy ? 'Sending…' : 'Send inquiry'}
            <Icon name="send" className="h-4 w-4" />
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
