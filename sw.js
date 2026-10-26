/* Cache offline. Kode (html/js/css/json): jaringan dulu, cadangan dari cache -> update selalu terbaca saat online.
   assets/ (gambar, musik, font): cache dulu -> muat instan. NAIKKAN V setiap mengganti isi file di assets/ dengan nama yang sama. */
const V = 'ddlc-1', SHELL = ['./', 'index.html', 'css/style.css', 'js/core.js', 'js/content.js', 'js/dialogue.js', 'js/settings.js', 'js/app.js', 'js/simplus.js', 'js/story.js', 'assets/data/sayori.json', 'assets/data/yuri.json', 'assets/data/natsuki.json', 'assets/data/monika.json'];

self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(u.pathname.includes('/assets/') ? asset(r) : fresh(r));
});

async function fresh(r) {
  try { const n = await fetch(r); if (n.ok) (await caches.open(V)).put(r, n.clone()); return n }
  catch (err) { const m = await caches.match(r, { ignoreSearch: true }); if (m) return m; throw err }
}

async function asset(r) {
  const c = await caches.open(V); let m = await c.match(r.url);
  if (!m) { m = await fetch(r.url); if (m.ok) c.put(r.url, m.clone()) }   // permintaan Range (musik) diganti unduhan penuh agar bisa di-cache
  const rg = r.headers.get('range'), x = rg && /bytes=(\d+)-(\d*)/.exec(rg);
  if (!x || !m.ok) return m;
  const b = await m.arrayBuffer(), z = x[2] ? Math.min(+x[2], b.byteLength - 1) : b.byteLength - 1;
  return new Response(b.slice(+x[1], z + 1), { status: 206, headers: { 'Content-Type': m.headers.get('Content-Type') || 'audio/ogg', 'Content-Range': `bytes ${x[1]}-${z}/${b.byteLength}` } });
}
