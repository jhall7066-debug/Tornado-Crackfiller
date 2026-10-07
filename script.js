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

// ===== Product image thumbnails =====
document.querySelectorAll('[data-gallery]').forEach(g => {
  const main = g.querySelector('.main-img');
  g.querySelectorAll('.thumbs button').forEach(b => {
    b.addEventListener('click', () => {
      g.querySelectorAll('.thumbs button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      main.style.opacity = 0;
      setTimeout(() => { main.src = b.dataset.src; main.style.opacity = 1; }, 150);
    });
  });
});

// ===== "What are you fixing?" finder =====
const tabs = document.querySelectorAll('.finder-tab');
const cards = document.querySelectorAll('.product-card');
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
  t.classList.add('active'); t.setAttribute('aria-selected', 'true');
  const f = t.dataset.filter;
  cards.forEach(c => c.classList.toggle('dim', f !== 'all' && c.dataset.cat !== f));
}));

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
