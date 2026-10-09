/* ===== settings.js : pengaturan tersimpan (suara, mode tampilan, tata letak) + layout adaptif desktop/mobile ===== */
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
   Mobile  : kanvas logis mengikuti rasio layar (landscape: tinggi 420; potret: lebar 400), isi diatur ulang lewat CSS body.m / body.p */
const Layout = {
  mobile: false, portrait: false,
  resolve() {
    const m = Settings.data.layout; if (m === 'mobile') return true; if (m === 'desktop') return false;
    const small = Math.min(innerWidth, innerHeight), coarse = matchMedia('(pointer:coarse)').matches;
    return (coarse && small < 820) || small < 480 || innerWidth < 640;
  },
  apply() {
    const st = $('#stage'), w = innerWidth, h = innerHeight, mob = this.resolve(), por = mob && h > w; let s;
    if (!mob) { s = Math.min(w / 1280, h / 720); st.style.cssText = `width:1280px;height:720px;left:50%;top:50%;margin:-360px 0 0 -640px;transform-origin:center;transform:scale(${s})` }
    else {
      s = por ? Math.min(w / 400, h / 640) : Math.min(h / 420, w / 700);
      st.style.cssText = `width:${w / s}px;height:${h / s}px;left:0;top:0;margin:0;transform-origin:0 0;transform:scale(${s})`;
    }
    const changed = mob !== this.mobile || por !== this.portrait; this.mobile = mob; this.portrait = por;
    document.body.classList.toggle('m', mob); document.body.classList.toggle('p', por);
    if (changed) dispatchEvent(new Event('layoutchange'));
  },
  init() { this.apply(); addEventListener('resize', () => this.apply()); addEventListener('orientationchange', () => setTimeout(() => this.apply(), 150)) }
};
