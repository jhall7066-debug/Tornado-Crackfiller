# Tornado Crackfiller website

Static site (HTML/CSS/JS, no build step). Products, cart and checkout come from the existing Shopify store (`tornadocrackfiller.myshopify.com`) through Shopify Storefront Web Components.

## Deploy: GitHub → Netlify
1. Create a new GitHub repo (e.g. `tornado-crackfiller`) and upload everything in this folder (keep the `assets` folder intact).
2. In Netlify: **Add new site → Import an existing project → GitHub**, then pick the repo.
3. Build settings: leave **Build command** blank and set **Publish directory** to `/` (the repo root).
4. Deploy. Every push to GitHub redeploys automatically.
5. After the first deploy, turn on form notifications under **Forms** so contractor inquiries get emailed to the client.

## Before going live
- Confirm the Buy 2 Get 1 Free promo, the address shown, and the phone/email.
- Point `tornadocrackfiller.com` at Netlify. Keep Shopify on its myshopify domain (or a `shop.` subdomain) so checkout still works.
