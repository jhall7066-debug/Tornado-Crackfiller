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

// ===== Video loader: plays the file directly, falls back to a blob copy if the host can't stream it =====
const blobCache = {};
function loadVideo(video, src, poster) {
  video.poster = poster;
  video.dataset.src = src;
  video.classList.remove('video-failed');
  video.onerror = async () => {
    if (video.dataset.src !== src || video.dataset.fallback === src) return;
    video.dataset.fallback = src;
    try {
      if (!blobCache[src]) {
        const res = await fetch(src);
        if (!res.ok) throw new Error(res.status);
        blobCache[src] = URL.createObjectURL(new Blob([await res.arrayBuffer()], { type: 'video/mp4' }));
      }
      if (video.dataset.src !== src) return;
      video.src = blobCache[src];
      video.play().catch(() => {});
    } catch (e) {
      video.classList.add('video-failed');
      console.warn('Video could not load:', src, e);
    }
  };
  video.src = blobCache[src] || src;
  video.load();
  video.play().catch(() => {});
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
    points: ['Ready to pour, no mixing', 'Matte finish that blends in', '1-gallon jug or 5-gallon bucket']
  },
  gator: {
    video: 'assets/video-gator.mp4', poster: 'assets/video-gator-poster.jpg',
    eyebrow: 'For alligator cracking', title: 'Gator-Nado Crackfiller',
    text: 'See the sand-reinforced formula spread across a webbed, broken-up section and lock it back together.',
    points: ['Sand built into the formula', 'Spread with a squeegee or trowel', 'Covers whole damaged areas']
  },
  concrete: {
    video: 'assets/video-mix.mp4', poster: 'assets/video-mix-poster.jpg',
    eyebrow: 'For damaged concrete', title: 'Mix Master Concrete Repair',
    text: 'Watch the two-part mortar get mixed and troweled into a cracked concrete slab.',
    points: ['Strong adhesion to concrete', 'Feather edge up to 1", or 4" extended', 'Small, medium and large kits']
  }
};
const tabs = document.querySelectorAll('.finder-tab');
const cards = document.querySelectorAll('.product-card');
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
  e.preventDefault();
  const first = document.querySelector('.product-card:not(.dim)');
  (first || document.getElementById('product-grid')).scrollIntoView({ behavior: 'smooth', block: 'center' });
  demoVideo.pause();
});

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

document.getElementById('year').textContent = new Date().getFullYear();
