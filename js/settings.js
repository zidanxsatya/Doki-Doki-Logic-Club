/* settings.js : pengaturan tersimpan (suara, mode tampilan, tata letak) + layout adaptif desktop/mobile */
const Settings = {
  data: { music: .55, sfx: .7, layout: 'auto', display: 'window', ...store.get('tkm_settings', {}) },
  save() { store.set('tkm_settings', this.data) },
  set(k, v) { this.data[k] = v; clearTimeout(this._t); this._t = setTimeout(() => this.save(), 250) }   // slider: tulis localStorage sekali setelah berhenti
};
Snd.mv = clamp01(+Settings.data.music); Snd.sv = clamp01(+Settings.data.sfx);   // terapkan volume tersimpan

/* Fullscreen (Fullscreen API; pada iOS Safari tidak tersedia) */
const Full = {
  get ok() { const d = document; return !!(d.fullscreenEnabled || d.webkitFullscreenEnabled) },
  get on() { const d = document; return !!(d.fullscreenElement || d.webkitFullscreenElement) },
  async set(v) {
    const d = document, e = d.documentElement;
    try { if (v && !this.on) await (e.requestFullscreen || e.webkitRequestFullscreen).call(e); else if (!v && this.on) await (d.exitFullscreen || d.webkitExitFullscreen).call(d) } catch (err) { }
  }
};
['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, () => {
  Settings.set('display', Full.on ? 'full' : 'window'); Layout.apply(); dispatchEvent(new Event('settingschange'));
}));

/* Layout adaptif: SATU game untuk desktop & Android.
   Desktop : kanvas logis 1280x720 diskalakan (tampilan asli, tidak berubah).
   Mobile  : kanvas logis SELALU mendatar (tinggi 420, lebar >= 700); isi diatur ulang lewat CSS body.m.
             HP dipegang tegak: kanvas yang sama diputar 90 derajat lewat CSS (tepi ATAS game = sisi KANAN layar), jadi pemain cukup memiringkan HP ke kiri, tanpa bergantung pada kunci rotasi OS.
   Koordinat layar (clientX/Y) tidak boleh dikonversi sendiri dengan rect/offsetWidth: pakai Layout.pt() dan Layout.box(), yang paham rotasi. */
const Layout = {
  mobile: false, rot: false, s: 1,
  resolve() {
    const m = Settings.data.layout; if (m === 'mobile') return true; if (m === 'desktop') return false;
    const small = Math.min(innerWidth, innerHeight), coarse = matchMedia('(pointer:coarse)').matches;
    return coarse ? small < 820 : innerWidth >= innerHeight && (small < 480 || innerWidth < 768);   // jendela desktop yang tinggi-sempit tidak diputar: pakai tampilan desktop
  },
  apply() {
    const st = $('#stage'), w = innerWidth, h = innerHeight, mob = this.resolve(), rot = mob && h > w, vw = rot ? h : w, vh = rot ? w : h;   // vw x vh = layar mendatar yang dilihat pemain
    const s = mob ? Math.min(vh / 420, vw / 700) : Math.min(w / 1280, h / 720);
    st.style.cssText = mob
      ? `width:${vw / s}px;height:${vh / s}px;left:0;top:0;margin:0;transform-origin:0 0;transform:${rot ? `translate(${w}px,0) rotate(90deg) ` : ''}scale(${s})`
      : `width:1280px;height:720px;left:50%;top:50%;margin:-360px 0 0 -640px;transform-origin:center;transform:scale(${s})`;
    st.style.setProperty('--vh', vh / 100 + 'px');   // pengganti satuan vh di CSS: 1% tinggi layar MENDATAR (vh asli = tinggi fisik, salah sumbu saat diputar)
    const changed = mob !== this.mobile; this.mobile = mob; this.rot = rot; this.s = s;
    document.body.classList.toggle('m', mob); document.body.classList.toggle('sh', mob && vh <= 400);   // sh = layar mendatar pendek (<= 400 px): soal dipadatkan
    if (changed) dispatchEvent(new Event('layoutchange'));
  },
  pt(cx, cy) { const r = $('#stage').getBoundingClientRect(), s = this.s; return this.rot ? { x: (cy - r.top) / s, y: (r.right - cx) / s } : { x: (cx - r.left) / s, y: (cy - r.top) / s } },   // titik layar -> titik logis #stage
  box(el) { const r = el.getBoundingClientRect(), a = this.pt(r.left, r.top), b = this.pt(r.right, r.bottom), t = Math.min(a.y, b.y), h = Math.abs(a.y - b.y); return { l: Math.min(a.x, b.x), t, w: Math.abs(a.x - b.x), h, b: t + h } },   // kotak elemen dalam piksel logis #stage
  init() { this.apply(); addEventListener('resize', () => this.apply()); addEventListener('orientationchange', () => setTimeout(() => this.apply(), 150)) }
};
