import { useState } from 'react';
import ResourceManager from './ResourceManager.jsx';
import Icon from '../components/Icon.jsx';
import { Badge, Img, statusTone } from '../components/ui.jsx';
import { useMoney, useStore } from '../store/StoreContext.jsx';
import { findAnswer, fillTemplate } from '../utils/chatEngine.js';
import {
  INQUIRY_STATUS,
  LISTING_STATUS,
  MEETING_STATUS,
  MEETING_TYPES,
  PROJECT_STATUS,
  PROPERTY_TYPES,
  PURPOSES,
  TIME_SLOTS,
} from '../data/seed.js';
import { formatDateShort, formatTime, timeAgo } from '../utils/helpers.js';

const Thumb = ({ src }) => (
  <div className="h-12 w-16 overflow-hidden rounded-lg bg-mist-100">
    <Img src={src} alt="" />
  </div>
);

/* ------------------------------ Listings ------------------------------ */
export function ListingsAdmin() {
  const { money } = useMoney();
  return (
    <ResourceManager
      title="Listings"
      subtitle="Add, edit and remove properties. Changes appear on the website instantly."
      collection="listings"
      newLabel="Add listing"
      searchKeys={['title', 'city', 'type', 'address']}
      filter={{ key: 'status', label: 'Status', options: LISTING_STATUS }}
      defaults={{
        title: '',
        type: 'Apartment',
        purpose: 'Sale',
        status: 'Available',
        price: 0,
        city: '',
        address: '',
        beds: 0,
        baths: 0,
        sqft: 0,
        featured: false,
        image: '',
        gallery: [],
        features: [],
        description: '',
      }}
      columns={[
        { label: 'Photo', render: (l) => <Thumb src={l.image} /> },
        {
          label: 'Property',
          render: (l) => (
            <div>
              <p className="font-semibold text-navy-900">{l.title}</p>
              <p className="text-xs text-mist-400">
                {l.type} · {l.city}
              </p>
            </div>
          ),
        },
        { label: 'Price', render: (l) => <span className="font-semibold text-navy-900">{money(l.price)}{l.purpose === 'Rent' ? '/mo' : ''}</span> },
        { label: 'For', render: (l) => l.purpose },
        { label: 'Status', render: (l) => <Badge tone={statusTone(l.status)}>{l.status}</Badge> },
        { label: 'Featured', render: (l) => (l.featured ? <Icon name="star" className="h-4 w-4 fill-current text-navy-500" /> : <span className="text-mist-300">—</span>) },
      ]}
      fields={[
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'type', label: 'Type', type: 'select', options: PROPERTY_TYPES, half: true },
        { key: 'purpose', label: 'Purpose', type: 'select', options: PURPOSES, half: true },
        { key: 'price', label: 'Price (rent = per month)', type: 'number', min: 0, required: true, half: true },
        { key: 'status', label: 'Status', type: 'select', options: LISTING_STATUS, half: true },
        { key: 'city', label: 'Area / city', type: 'text', required: true, half: true },
        { key: 'address', label: 'Address', type: 'text', half: true },
        { key: 'beds', label: 'Bedrooms', type: 'number', min: 0, half: true },
        { key: 'baths', label: 'Bathrooms', type: 'number', min: 0, half: true },
        { key: 'sqft', label: 'Area (sqft)', type: 'number', min: 0, half: true },
        { key: 'featured', label: 'Featured on homepage', type: 'bool', half: true },
        { key: 'image', label: 'Main photo', type: 'image' },
        { key: 'gallery', label: 'Extra photo URLs', type: 'lines' },
        { key: 'features', label: 'Features', type: 'tags', help: 'e.g. Pool, Gym, Sea view' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
    />
  );
}

/* ------------------------------ Projects ------------------------------ */
export function ProjectsAdmin() {
  const { compact } = useMoney();
  return (
    <ResourceManager
      title="Projects & deployment"
      subtitle="Update construction progress — the public roadmap and phase tracker update automatically."
      collection="projects"
      newLabel="Add project"
      searchKeys={['name', 'location', 'status']}
      filter={{ key: 'status', label: 'Status', options: PROJECT_STATUS }}
      defaults={{ name: '', location: '', status: 'Planning', progress: 0, units: 0, startingPrice: 0, handover: '', image: '', description: '' }}
      columns={[
        { label: 'Photo', render: (p) => <Thumb src={p.image} /> },
        {
          label: 'Project',
          render: (p) => (
            <div>
              <p className="font-semibold text-navy-900">{p.name}</p>
              <p className="text-xs text-mist-400">{p.location}</p>
            </div>
          ),
        },
        { label: 'Status', render: (p) => <Badge tone={statusTone(p.status)}>{p.status}</Badge> },
        {
          label: 'Progress',
          render: (p) => (
            <div className="flex w-32 items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-mist-200">
                <div className="h-full rounded-full bg-navy-900" style={{ width: `${p.progress}%` }} />
              </div>
              <span className="text-xs font-semibold">{p.progress}%</span>
            </div>
          ),
        },
        { label: 'From', render: (p) => compact(p.startingPrice) },
        { label: 'Handover', key: 'handover' },
      ]}
      fields={[
        { key: 'name', label: 'Project name', type: 'text', required: true },
        { key: 'location', label: 'Location', type: 'text', required: true, half: true },
        { key: 'status', label: 'Status', type: 'select', options: PROJECT_STATUS, half: true },
        { key: 'progress', label: 'Progress (%)', type: 'number', min: 0, max: 100, half: true, help: 'Drives the phase tracker (20% per phase)' },
        { key: 'units', label: 'Total units', type: 'number', min: 0, half: true },
        { key: 'startingPrice', label: 'Starting price', type: 'number', min: 0, half: true },
        { key: 'handover', label: 'Handover', type: 'text', half: true, placeholder: 'Q3 2027' },
        { key: 'image', label: 'Photo', type: 'image' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
    />
  );
}

/* ------------------------------ Meetings ------------------------------ */
export function MeetingsAdmin() {
  return (
    <ResourceManager
      title="Meetings"
      subtitle="Bookings made through the website scheduler. Confirm, complete or cancel them here."
      collection="meetings"
      newLabel="Add meeting"
      searchKeys={['name', 'email', 'phone', 'type', 'ref']}
      filter={{ key: 'status', label: 'Status', options: MEETING_STATUS }}
      defaults={{ name: '', email: '', phone: '', type: MEETING_TYPES[0].id, date: '', time: TIME_SLOTS[0], status: 'Confirmed', note: '' }}
      beforeCreate={(m) => ({ ...m, ref: `AUR-${Math.floor(1000 + Math.random() * 9000)}` })}
      columns={[
        {
          label: 'Client',
          render: (m) => (
            <div>
              <p className="font-semibold text-navy-900">{m.name}</p>
              <p className="text-xs text-mist-400">{m.email}</p>
            </div>
          ),
        },
        { label: 'Type', key: 'type' },
        {
          label: 'When',
          render: (m) => (
            <span className="whitespace-nowrap font-semibold text-navy-900">
              {m.date ? formatDateShort(m.date) : '—'} · {m.time ? formatTime(m.time) : ''}
            </span>
          ),
        },
        { label: 'Ref', render: (m) => <span className="font-mono text-xs">{m.ref || '—'}</span> },
        { label: 'Status', render: (m) => <Badge tone={statusTone(m.status)}>{m.status}</Badge> },
      ]}
      fields={[
        { key: 'name', label: 'Name', type: 'text', required: true, half: true },
        { key: 'email', label: 'Email', type: 'email', required: true, half: true },
        { key: 'phone', label: 'Phone', type: 'text', half: true },
        { key: 'type', label: 'Meeting type', type: 'select', options: MEETING_TYPES.map((t) => t.id), half: true },
        { key: 'date', label: 'Date', type: 'date', required: true, half: true },
        { key: 'time', label: 'Time', type: 'select', options: TIME_SLOTS, half: true },
        { key: 'status', label: 'Status', type: 'select', options: MEETING_STATUS },
        { key: 'note', label: 'Notes', type: 'textarea', rows: 3 },
      ]}
    />
  );
}

/* ------------------------------ Inquiries ------------------------------ */
export function InquiriesAdmin() {
  return (
    <ResourceManager
      title="Inquiries & leads"
      subtitle="Messages from listing pages and the newsletter signup."
      collection="inquiries"
      canAdd={false}
      searchKeys={['name', 'email', 'phone', 'listingTitle', 'message']}
      filter={{ key: 'status', label: 'Status', options: INQUIRY_STATUS }}
      defaults={{}}
      columns={[
        {
          label: 'From',
          render: (i) => (
            <div>
              <p className="font-semibold text-navy-900">{i.name}</p>
              <p className="text-xs text-mist-400">{i.email}</p>
              {i.phone && <p className="text-xs text-mist-400">{i.phone}</p>}
            </div>
          ),
        },
        { label: 'About', render: (i) => <span className="text-navy-900">{i.listingTitle || 'General'}</span> },
        { label: 'Message', render: (i) => <p className="line-clamp-2 max-w-xs text-mist-600">{i.message}</p> },
        { label: 'Received', render: (i) => <span className="whitespace-nowrap text-xs text-mist-400">{i.createdAt ? timeAgo(i.createdAt) : '—'}</span> },
        { label: 'Status', render: (i) => <Badge tone={statusTone(i.status)}>{i.status}</Badge> },
      ]}
      fields={[
        { key: 'name', label: 'Name', type: 'text', half: true, required: true },
        { key: 'email', label: 'Email', type: 'email', half: true },
        { key: 'phone', label: 'Phone', type: 'text', half: true },
        { key: 'status', label: 'Status', type: 'select', options: INQUIRY_STATUS, half: true },
        { key: 'listingTitle', label: 'Regarding', type: 'text' },
        { key: 'message', label: 'Message', type: 'textarea', rows: 4 },
      ]}
    />
  );
}

/* ------------------------------ Chatbot ------------------------------ */
function ChatTester() {
  const { faqs, settings, listings, projects } = useStore();
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

  const run = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const match = findAnswer(text, faqs);
    setResult(
      match
        ? {
            ok: true,
            q: match.question,
            a: fillTemplate(match.answer, {
              company: settings.company,
              phone: settings.phone,
              email: settings.email,
              address: settings.address,
              hours: settings.hours,
              listings: listings.filter((l) => l.status === 'Available').length,
              projects: projects.length,
            }),
          }
        : { ok: false },
    );
  };

  return (
    <div className="mb-6 rounded-3xl border border-mist-200 bg-white p-6">
      <div className="flex items-center gap-2 text-sm font-bold text-navy-900">
        <Icon name="bot" className="h-5 w-5 text-navy-500" />
        Test the chatbot
      </div>
      <p className="mt-1 text-xs text-mist-500">
        Type a question exactly like a visitor would. The bot matches against each entry&apos;s keywords. Placeholders you can use in answers:{' '}
        <code className="rounded bg-mist-100 px-1.5 py-0.5">{'{company} {phone} {email} {address} {hours} {listings} {projects}'}</code>
      </p>
      <form onSubmit={run} className="mt-4 flex gap-3">
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. how can I book a viewing?" aria-label="Test question" />
        <button type="submit" className="btn-primary shrink-0">
          Test
        </button>
      </form>
      {result && (
        <div className={`mt-4 rounded-2xl p-4 text-sm ${result.ok ? 'bg-navy-50 text-navy-900' : 'bg-amber-50 text-amber-700'}`}>
          {result.ok ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wider text-navy-500">Matched: {result.q}</p>
              <p className="mt-1">{result.a}</p>
            </>
          ) : (
            <p>No match — the visitor would see the fallback reply. Add a new Q&amp;A with matching keywords.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function FaqAdmin() {
  return (
    <ResourceManager
      title="AI chatbot"
      subtitle="Hardcoded questions and answers used by the website chat assistant."
      collection="faqs"
      newLabel="Add Q&A"
      searchKeys={['question', 'answer', 'keywords']}
      header={<ChatTester />}
      defaults={{ question: '', answer: '', keywords: '', linkLabel: '', linkTo: '' }}
      toForm={(f) => ({ ...f, linkLabel: f.link?.label || '', linkTo: f.link?.to || '' })}
      fromForm={(d) => {
        const { linkLabel, linkTo, ...rest } = d;
        return { ...rest, link: linkTo ? { label: linkLabel || 'Learn more', to: linkTo } : undefined };
      }}
      columns={[
        { label: 'Question', render: (f) => <span className="font-semibold text-navy-900">{f.question}</span> },
        { label: 'Answer', render: (f) => <p className="line-clamp-2 max-w-md text-mist-600">{f.answer}</p> },
        { label: 'Keywords', render: (f) => <p className="line-clamp-1 max-w-[200px] text-xs text-mist-400">{f.keywords}</p> },
      ]}
      fields={[
        { key: 'question', label: 'Question (shown as a suggestion chip)', type: 'text', required: true },
        { key: 'answer', label: 'Answer', type: 'textarea', required: true },
        { key: 'keywords', label: 'Keywords', type: 'text', required: true, help: 'Comma separated. Add Roman-Urdu words too (e.g. qeemat, kiraya).' },
        { key: 'linkLabel', label: 'Button label (optional)', type: 'text', half: true },
        { key: 'linkTo', label: 'Button link (optional)', type: 'text', half: true, placeholder: '/listings' },
      ]}
    />
  );
}
