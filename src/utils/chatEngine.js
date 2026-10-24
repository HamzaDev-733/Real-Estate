/**
 * Tiny rule-based "AI" engine for the demo chatbot.
 * It scores every FAQ (editable in Admin → Chatbot) by keyword and wording overlap
 * and returns the best match. No network, no API key.
 *
 * To upgrade to a real LLM later, replace `findAnswer` with a call to your backend.
 */
const STOP = new Set([
  'the', 'a', 'an', 'is', 'are', 'do', 'does', 'you', 'i', 'me', 'my', 'to', 'of', 'for', 'and', 'in', 'on',
  'it', 'can', 'what', 'how', 'your', 'have', 'with', 'at', 'be', 'there', 'any', 'please', 'we', 'us', 'our',
  'kya', 'hai', 'ka', 'ki', 'ke', 'main', 'mein', 'se', 'ko', 'aap', 'ap', 'mujhe', 'hain', 'kar', 'karna',
]);

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokens = (s) =>
  norm(s)
    .split(' ')
    .filter((t) => t && !STOP.has(t));

function sharedPrefix(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  return i;
}

export function findAnswer(text, faqs) {
  const q = norm(text);
  if (!q) return null;
  const qTokens = tokens(text);
  const qSet = new Set(qTokens);

  let best = null;
  let bestScore = 0;

  for (const faq of faqs) {
    let score = 0;
    if (norm(faq.question) === q) score += 20;

    const phrases = String(faq.keywords || '')
      .split(',')
      .map(norm)
      .filter(Boolean);

    for (const p of phrases) {
      if (p.includes(' ')) {
        if (q.includes(p)) score += 4;
      } else if (qSet.has(p)) {
        score += 3;
      } else if (p.length >= 4) {
        const fuzzy = qTokens.some((t) => t.length >= 4 && sharedPrefix(t, p) >= Math.min(5, t.length, p.length));
        if (fuzzy) score += 2;
      }
    }

    const fTokens = tokens(faq.question);
    fTokens.forEach((t) => {
      if (qSet.has(t)) score += 1;
    });

    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }

  return bestScore >= 3 ? best : null;
}

export function fillTemplate(text, ctx) {
  return String(text || '').replace(/\{(\w+)\}/g, (m, key) => (ctx[key] !== undefined ? ctx[key] : m));
}
