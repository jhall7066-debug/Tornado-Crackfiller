// ===== Shopify connection =====
// The live store stays on Shopify; this site is the storefront.
const SHOP_URL = 'https://tornadocrackfiller.myshopify.com';

// When Shopify's web components load, swap the fallback links for live add-to-cart buttons.
if (window.customElements) {
  customElements.whenDefined('shopify-store').then(() => {
    document.documentElement.classList.add('wc-ready');
  });
}

function bumpCartIcon() {
  const btn = document.querySelector('.cart-btn');
  if (!btn) return;
  btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
}

window.addToCart = function (event) {
  const cart = document.getElementById('cart');
  cart.addLine(event).showModal();
  bumpCartIcon();
};

window.openCart = function () {
  const cart = document.getElementById('cart');
  if (document.documentElement.classList.contains('wc-ready') && cart && cart.showModal) {
    cart.showModal();
  } else {
    window.location.href = SHOP_URL + '/cart';
  }
};

// Fallback buy links + policy links point at the Shopify store
document.querySelectorAll('.fallback-buy').forEach(a => { a.href = SHOP_URL + '/products/' + a.dataset.handle; });
document.querySelectorAll('.shop-link').forEach(a => { a.href = SHOP_URL + a.dataset.path; });

// ===== Mobile menu =====
const menuBtn = document.querySelector('.menu-btn');
const mobileNav = document.getElementById('mobile-nav');
if (menuBtn && mobileNav) {
  menuBtn.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }));
}

// ===== Video loader =====
// Each video has a local copy (assets/) and a backup copy hosted on the client's Shopify store.
// If the local file is missing or won't play, the backup is used automatically.
const SHOPIFY_VIDEO = 'https://cdn.shopify.com/videos/c/vp/';
const SHOPIFY_POSTER = 'https://cdn.shopify.com/s/files/1/0969/1748/7902/files/preview_images/';
const VIDEO_BACKUPS = {
  'assets/video-tornado.mp4': { id: '015c2a9b730d40c2ae55c21b761686cc', v: '93824980' },
  'assets/video-gator.mp4':   { id: 'f074229df8a34b56b4361a95027b4755', v: '93824981' },
  'assets/video-mix.mp4':     { id: '83ae9a4d4f794f48a378e43c00b5ab76', v: '95227918' }
};
function videoSources(src, poster) {
  const list = [{ src: src, poster: poster }];
  const b = VIDEO_BACKUPS[src];
  if (b) list.push({
    src: SHOPIFY_VIDEO + b.id + '/' + b.id + '.HD-720p-4.5Mbps-' + b.v + '.mp4',
    poster: SHOPIFY_POSTER + b.id + '.thumbnail.0000000000_600x.jpg'
  });
  return list;
}
function loadVideo(video, src, poster) {
  const list = videoSources(src, poster);
  let i = 0;
  const token = String(Math.random());
  video.dataset.token = token;
  video.dataset.src = src;
  video.classList.remove('video-failed');
  const tryNext = () => {
    if (video.dataset.token !== token) return;
    if (i >= list.length) { video.classList.add('video-failed'); return; }
    const s = list[i++];
    video.poster = s.poster;
    video.src = s.src;
    video.load();
    video.play().catch(() => {});
  };
  video.onerror = () => { console.warn('Video source failed, trying backup:', video.currentSrc || video.src); tryNext(); };
  tryNext();
}

// ===== Product gallery: photos + product video =====
document.querySelectorAll('[data-gallery]').forEach(g => {
  const main = g.querySelector('.main-img');
  let vid = null;
  const stopVideo = () => { if (vid) { vid.pause(); vid.remove(); vid = null; } main.hidden = false; };
  g.querySelectorAll('.thumbs button').forEach(b => {
    b.addEventListener('click', () => {
      g.querySelectorAll('.thumbs button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      if (b.dataset.video) {
        stopVideo();
        vid = document.createElement('video');
        vid.className = 'main-video';
        vid.controls = true; vid.playsInline = true; vid.muted = true;
        vid.setAttribute('playsinline', ''); vid.setAttribute('muted', '');
        main.hidden = true;
        main.after(vid);
        loadVideo(vid, b.dataset.video, b.dataset.poster);
      } else {
        stopVideo();
        main.style.opacity = 0;
        setTimeout(() => { main.src = b.dataset.src; main.style.opacity = 1; }, 150);
      }
    });
  });
});

// ===== "What are you fixing?" finder + product demo videos =====
const DEMOS = {
  cracks: {
    video: 'assets/video-tornado.mp4', poster: 'assets/video-tornado-poster.jpg',
    eyebrow: 'For single cracks', title: 'Tornado Crackfiller',
    text: 'Watch it pour straight from the jug into real driveway cracks and level off flush with the asphalt.',
    shop: 'asphalt.html#single-cracks',
    points: ['Ready to pour, no mixing', 'Matte finish that blends in', '1-gallon jug or 5-gallon bucket']
  },
  gator: {
    video: 'assets/video-gator.mp4', poster: 'assets/video-gator-poster.jpg',
    eyebrow: 'For alligator cracking', title: 'Gator-Nado Crackfiller',
    text: 'See the sand-reinforced formula spread across a webbed, broken-up section and lock it back together.',
    shop: 'asphalt.html#alligator-cracking',
    points: ['Sand built into the formula', 'Spread with a squeegee or trowel', 'Covers whole damaged areas']
  },
  concrete: {
    video: 'assets/video-mix.mp4', poster: 'assets/video-mix-poster.jpg',
    eyebrow: 'For damaged concrete', title: 'Mix Master Concrete Repair',
    text: 'Watch the two-part mortar get mixed and troweled into a cracked concrete slab.',
    shop: 'concrete.html',
    points: ['Strong adhesion to concrete', 'Feather edge up to 1", or 4" extended', 'Small, medium and large kits']
  }
};
if (document.getElementById('demo-panel')) {
const tabs = document.querySelectorAll('button.finder-tab');
const cards = document.querySelectorAll('.cat-shop .product-card');
const panel = document.getElementById('demo-panel');
const demoVideo = document.getElementById('demo-video');
function closeDemo() { demoVideo.pause(); panel.hidden = true; }
function openDemo(key) {
  const d = DEMOS[key];
  if (!d) { closeDemo(); return; }
  document.getElementById('demo-eyebrow').textContent = d.eyebrow;
  document.getElementById('demo-title').textContent = d.title;
  document.getElementById('demo-text').textContent = d.text;
  document.getElementById('demo-points').innerHTML = d.points.map(p => '<li>' + p + '</li>').join('');
  // "Shop This Product": jump within the page when the product is here, otherwise go to its category page
  let shopHref = d.shop || '#product-grid';
  const hash = shopHref.split('#')[1];
  if (hash && document.getElementById(hash)) shopHref = '#' + hash;
  document.getElementById('demo-shop').setAttribute('href', shopHref);
  panel.hidden = false;
  if (demoVideo.dataset.src !== d.video) {
    loadVideo(demoVideo, d.video, d.poster);
  } else {
    demoVideo.currentTime = 0;
    demoVideo.play().catch(() => {});
  }
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
  t.classList.add('active'); t.setAttribute('aria-selected', 'true');
  const f = t.dataset.filter;
  cards.forEach(c => c.classList.toggle('dim', f !== 'all' && c.dataset.cat !== f));
  openDemo(f);
}));
document.getElementById('demo-close').addEventListener('click', () => {
  closeDemo();
  tabs.forEach(x => { const all = x.dataset.filter === 'all'; x.classList.toggle('active', all); x.setAttribute('aria-selected', all); });
  cards.forEach(c => c.classList.remove('dim'));
});
document.getElementById('demo-shop').addEventListener('click', e => {
  demoVideo.pause();
  const href = e.currentTarget.getAttribute('href') || '';
  if (href.charAt(0) !== '#') return; // another page: follow the link
  e.preventDefault();
  const first = document.querySelector('.cat-shop .product-card:not(.dim)');
  (first || document.getElementById(href.slice(1)) || document.getElementById('product-grid')).scrollIntoView({ behavior: 'smooth', block: 'center' });
});
}

// ===== Before / after slider =====
document.querySelectorAll('.ba-slider').forEach(s => {
  const input = s.querySelector('input');
  input.addEventListener('input', () => s.style.setProperty('--pos', input.value + '%'));
});

// ===== Sticky mobile buy bar (shows after hero, hides at shop + footer) =====
const sticky = document.querySelector('.sticky-buy');
const hero = document.querySelector('.hero');
const shop = document.getElementById('shop');
if (sticky && hero && shop && 'IntersectionObserver' in window) {
  let heroVisible = true, shopVisible = false;
  const update = () => sticky.classList.toggle('show', !heroVisible && !shopVisible);
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }).observe(hero);
  new IntersectionObserver(([e]) => { shopVisible = e.isIntersecting; update(); }, { threshold: 0.05 }).observe(shop);
}

// ===== Reveal on scroll =====
if ('IntersectionObserver' in window) {
  const els = document.querySelectorAll('.section-head, .product-card, .step, .video-card, .ba-slider, .table-wrap, .use-grid figure, .faq-list details, .contact-form');
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  els.forEach(el => { el.classList.add('reveal'); io.observe(el); });
}

const yearEl = document.getElementById('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Hero deal badge: flips between the asphalt (red) and Mix Master (blue) deals =====
document.querySelectorAll('[data-deal-flip]').forEach(deal => {
  const faces = deal.querySelectorAll('.deal-face');
  if (faces.length < 2) return;
  let current = 0, paused = false;
  const show = n => {
    current = n;
    deal.classList.toggle('flipped', n === 1);
    faces.forEach((f, k) => { f.setAttribute('aria-hidden', k === n ? 'false' : 'true'); f.tabIndex = k === n ? 0 : -1; });
  };
  show(0);
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  deal.addEventListener('mouseenter', () => { paused = true; });
  deal.addEventListener('mouseleave', () => { paused = false; });
  deal.addEventListener('focusin', () => { paused = true; });
  deal.addEventListener('focusout', () => { paused = false; });
  setInterval(() => { if (!paused && !document.hidden) show(1 - current); }, 4000);
});

// ===== Buy 2, Get 1 Free: auto-add the free item =====
// When a customer has 2 of an eligible item in the cart, a 3rd is added automatically.
// The Shopify discount (in Shopify admin → Discounts) is what makes that 3rd item $0,
// so only turn a product ON here once its Shopify discount is active.
const BOGO_DEALS = [
  {
    name: 'Tornado Crackfiller 1 Gallon',
    on: true,  // Shopify discount: "TCF Buy 2 Get 1 Free" (active)
    handle: 'tornado-crack-filler-acrylic-pavement-crack-sealant-1-gallon',
    size: null, // single size, any variant counts
    note: 'Free jug added: Buy 2, Get 1 Free. It comes off at checkout.'
  },
  {
    name: 'Mix Master Small',
    on: true,  // needs the Mix Master Buy 2 Get 1 discount active in Shopify
    handle: 'mix-master-concrete-repair-mortar',
    size: /small/i, // only the Small size qualifies
    note: 'Free Small Mix Master added: Buy 2, Get 1 Free. It comes off at checkout.'
  }
];
// false = one free item per order. true = repeats (buy 4 get 2, buy 6 get 3...).
// Only set true if the Shopify discount also allows more than one use per order.
const BOGO_REPEAT = false;

(function () {
  if (!window.customElements) return;
  const STORE_KEY = 'tcf-bogo-prev';
  const read = () => { try { return JSON.parse(sessionStorage.getItem(STORE_KEY)) || null; } catch (e) { return null; } };
  const write = v => { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch (e) {} };

  const dealFor = line => {
    const m = line && line.merchandise;
    if (!m || !m.product) return null;
    return BOGO_DEALS.find(d => d.on && m.product.handle === d.handle &&
      (!d.size || d.size.test(m.title || '') || (m.selectedOptions || []).some(o => d.size.test(o.value)))) || null;
  };

  // Is a free item "due" at this total? A full set of 2 paid with no free one yet.
  const wantsFree = total => BOGO_REPEAT ? total % 3 === 2 : total === 2;

  customElements.whenDefined('shopify-cart').then(() => {
    const cart = document.getElementById('cart');
    if (!cart || !cart.addCartAction) return;
    let prev = read();      // { variantId: totalQty } from the last settled cart
    let busy = false, timer = null, latest = null, notes = {};

    const noteEl = document.createElement('div');
    noteEl.slot = 'extension';
    noteEl.className = 'bogo-note';
    noteEl.hidden = true;
    cart.appendChild(noteEl);
    const showNotes = () => {
      const msgs = Object.values(notes);
      noteEl.hidden = !msgs.length;
      noteEl.innerHTML = msgs.map(m => '<p>' + m + '</p>').join('');
    };

    const settle = () => {
      const c = latest;
      if (!c || !c.lines || busy) return;
      const lines = c.lines.nodes || [];
      if (lines.some(l => String(l.id).indexOf('__h_pending_') === 0)) return; // still saving
      // Shopify can show one cart line as two rows (paid + discounted) with the same line id,
      // so add quantities up per line id first.
      const totals = {}, byVariant = {};
      lines.forEach(l => {
        const d = dealFor(l);
        if (!d) return;
        const id = l.merchandise.id;
        totals[id] = (totals[id] || 0) + l.quantity;
        const v = (byVariant[id] = byVariant[id] || { deal: d, lines: {} });
        v.lines[l.id] = (v.lines[l.id] || 0) + l.quantity;
      });
      // First cart we see on this visit: just remember it, don't change anything.
      if (prev === null) { prev = totals; write(prev); return; }

      for (const id in byVariant) {
        const now = totals[id], before = prev[id] || 0, info = byVariant[id];
        if (now > before && wantsFree(now)) {
          // Customer just reached 2 (paid): add the free one.
          busy = true;
          prev[id] = now + 1; write(prev);
          notes[id] = info.deal.note; showNotes();
          cart.addLine({ variantId: id, quantity: 1 });
          setTimeout(() => { busy = false; settle(); }, 1500);
          return;
        }
        if (now < before && wantsFree(now)) {
          // Customer removed one from a deal set: drop the free item too.
          busy = true;
          const lineId = Object.keys(info.lines).reduce((a, b) => (info.lines[b] > info.lines[a] ? b : a));
          prev[id] = now - 1; write(prev);
          if (!wantsFree(now - 1) && (now - 1) < 3) delete notes[id];
          showNotes();
          cart.addCartAction({ action: 'updateCart', lines: [{ id: lineId, quantity: info.lines[lineId] - 1 }] });
          setTimeout(() => { busy = false; settle(); }, 1500);
          return;
        }
      }
      // Clear notes for items that are no longer in a deal set.
      Object.keys(notes).forEach(id => { if (!totals[id] || totals[id] < 3) delete notes[id]; });
      showNotes();
      prev = totals; write(prev);
    };

    cart.addEventListener('shopify:cartData', e => {
      latest = e.detail;
      clearTimeout(timer);
      timer = setTimeout(settle, 600);
    });
  });
})();
