/* script.js
   - Single client-side script powering index/product/cart pages
   - Uses localStorage for persistence (cart, lastSearch)
*/

const PRODUCTS_KEY = 'shopnow_products';
const CART_KEY = 'shopnow_cart_v1';

// ---- Sample product catalog ----
// In a real app you'd fetch this from API. We embed a demo dataset.
const sampleProducts = [
  { id: 1, title: "Wireless Headphones", price: 59.99, category: "Audio", img: "https://i.pravatar.cc/420?img=1", rating:4.4, desc:"Comfortable over-ear with noise damping." },
  { id: 2, title: "Smart Watch Series X", price: 129.99, category: "Wearables", img: "https://i.pravatar.cc/420?img=2", rating:4.7, desc:"Fitness, notifications & long battery." },
  { id: 3, title: "RGB Gaming Mouse", price: 29.99, category: "Gaming", img: "https://i.pravatar.cc/420?img=3", rating:4.1, desc:"High precision sensor, programmable buttons." },
  { id: 4, title: "4K Monitor 27\"", price: 249.99, category: "Monitors", img: "https://i.pravatar.cc/420?img=4", rating:4.6, desc:"Ultra HD crisp display with HDR." },
  { id: 5, title: "Portable Bluetooth Speaker", price: 39.99, category: "Audio", img: "https://i.pravatar.cc/420?img=5", rating:4.2, desc:"Small, waterproof, punchy sound." },
  { id: 6, title: "Ergonomic Keyboard", price: 69.99, category: "Accessories", img: "https://i.pravatar.cc/420?img=6", rating:4.5, desc:"Mechanical feel with ergonomic layout." },
  { id: 7, title: "Action Camera 4K", price: 99.99, category: "Cameras", img: "https://i.pravatar.cc/420?img=7", rating:4.0, desc:"Compact, waterproof, stabilized." },
  { id: 8, title: "Smart Home Bulb (2-pack)", price: 24.99, category: "Home", img: "https://i.pravatar.cc/420?img=8", rating:4.3, desc:"Color-changing and voice controllable." }
];

// initialize products (only first time)
if (!localStorage.getItem(PRODUCTS_KEY)) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(sampleProducts));
}

/* helpers */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* CART helpers */
function readCart(){
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch(e){
    return [];
  }
}
function writeCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCartCount(); updateMiniCart(); }

function updateCartCount(){
  const count = readCart().reduce((s,i)=>s+i.qty,0);
  $$('#cart-count').forEach(el => el.textContent = count);
}

/* mini cart dropdown */
function updateMiniCart(){
  $$('#mini-cart').forEach(mini => {
    const cart = readCart();
    if (!mini) return;
    mini.innerHTML = '';
    if (cart.length === 0) {
      mini.innerHTML = `<div style="padding:12px;color:var(--muted)">Your cart is empty</div>`;
      return;
    }
    cart.slice(0,4).forEach(item => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `
        <img src="${item.img}" alt="${escapeHtml(item.title)}"/>
        <div style="flex:1">
          <div style="font-weight:600">${escapeHtml(item.title)}</div>
          <div style="font-size:.9rem;color:var(--muted)">${item.qty} × $${item.price.toFixed(2)}</div>
        </div>
        <div style="font-weight:700">$${(item.qty * item.price).toFixed(2)}</div>
      `;
      mini.appendChild(div);
    });
    const foot = document.createElement('div');
    foot.className = 'foot';
    const total = cart.reduce((s,i)=>s+i.qty*i.price,0);
    foot.innerHTML = `<div style="font-weight:700">Total: $${total.toFixed(2)}</div>
                      <div><a href="cart.html" class="btn small">View Cart</a></div>`;
    mini.appendChild(foot);
  });
}

/* product rendering (index) */
function renderProducts(list){
  const grid = $('#product-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const tpl = $('#product-card-template');
  list.forEach(p => {
    const el = tpl.content.cloneNode(true);
    const article = el.querySelector('.product-card');
    article.querySelector('img').src = p.img;
    article.querySelector('img').alt = p.title;
    article.querySelector('.product-name').textContent = p.title;
    article.querySelector('.product-desc').textContent = p.desc;
    article.querySelector('.price').textContent = `$${p.price.toFixed(2)}`;
    article.querySelector('.add-cart').addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(p.id, 1);
    });
    article.querySelector('.details').addEventListener('click', (e) => {
      e.stopPropagation();
      location.href = `product.html?id=${p.id}`;
    });
    // Clicking the card goes to details
    article.addEventListener('click', () => {
      location.href = `product.html?id=${p.id}`;
    });
    grid.appendChild(el);
  });
}

/* product detail rendering (product.html) */
function renderProductDetail(product){
  const container = $('#product-detail');
  if (!container) return;
  container.innerHTML = `
    <div class="left">
      <img src="${product.img}" alt="${escapeHtml(product.title)}"/>
    </div>
    <div class="right">
      <h2>${escapeHtml(product.title)}</h2>
      <div class="product-meta">Category: ${escapeHtml(product.category)} • Rating: ${product.rating}</div>
      <p style="margin-top:12px;color:var(--muted)">${escapeHtml(product.desc)}</p>
      <h3 style="margin-top:12px">$${product.price.toFixed(2)}</h3>
      <div class="qty-controls">
        <label>Quantity</label>
        <button id="qty-decrease">−</button>
        <input id="qty-input" type="number" value="1" min="1" style="width:58px;padding:6px;border-radius:8px;border:1px solid rgba(0,0,0,0.06)" />
        <button id="qty-increase">+</button>
        <button id="add-cart-btn" class="btn" style="color:black;">Add to cart</button>
      </div>
      <div style="margin-top:16px">
        <a href="index.html" class="btn-link">← Back to products</a>
      </div>
    </div>
  `;
  $('#qty-increase').addEventListener('click', () => { $('#qty-input').value = +$('#qty-input').value + 1; });
  $('#qty-decrease').addEventListener('click', () => { if (+$('#qty-input').value > 1) $('#qty-input').value = +$('#qty-input').value - 1; });
  $('#add-cart-btn').addEventListener('click', () => addToCart(product.id, +$('#qty-input').value));
}

/* Cart operations */
function addToCart(productId, qty = 1){
  const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY));
  const p = products.find(x => x.id === productId);
  if (!p) return alert('Product not found');
  const cart = readCart();
  const existing = cart.find(it => it.id === productId);
  if (existing) existing.qty += qty;
  else cart.push({ id: p.id, title: p.title, price:p.price, img:p.img, qty });
  writeCart(cart);
  // small UI feedback
  toast(`${p.title} added to cart`);
}

/* cart page render */
function renderCartPage(){
  const el = $('#cart-items');
  if (!el) return;
  const cart = readCart();
  if (cart.length === 0){
    el.innerHTML = `<div style="padding:20px;color:var(--muted)">Your cart is empty. <a href="index.html">Continue shopping</a></div>`;
    $('#order-summary').innerHTML = '';
    return;
  }
  el.innerHTML = '';
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${item.img}" alt="${escapeHtml(item.title)}"/>
      <div style="flex:1">
        <div style="font-weight:700">${escapeHtml(item.title)}</div>
        <div style="color:var(--muted)">$${item.price.toFixed(2)} each</div>
        <div style="margin-top:8px">
          <button class="btn small dec" data-id="${item.id}">−</button>
          <span style="padding:0 10px">${item.qty}</span>
          <button class="btn small inc" data-id="${item.id}">+</button>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700">$${(item.qty * item.price).toFixed(2)}</div>
        <div><button class="btn-link remove" data-id="${item.id}">Remove</button></div>
      </div>
    `;
    el.appendChild(row);
  });

  // attach events
  $$('.cart-item .inc').forEach(b => b.addEventListener('click', () => {
    const id = +b.dataset.id; changeQty(id, 1);
  }));
  $$('.cart-item .dec').forEach(b => b.addEventListener('click', () => {
    const id = +b.dataset.id; changeQty(id, -1);
  }));
  $$('.cart-item .remove').forEach(b => b.addEventListener('click', () => {
    const id = +b.dataset.id; removeFromCart(id);
  }));

  // summary
  const summary = $('#order-summary');
  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  summary.innerHTML = `
    <h3>Order Summary</h3>
    <div style="display:flex;justify-content:space-between"><span>Subtotal</span><strong>$${subtotal.toFixed(2)}</strong></div>
    <div style="display:flex;justify-content:space-between"><span>Shipping</span><span style="color:var(--muted)">Calculated at checkout</span></div>
    <div style="margin-top:12px"><button id="checkout-btn" class="btn" style="width:100%" onclick="window.location.href='checkout.html'">Proceed to Checkout</button></div>
  `;
}

/* change qty */
function changeQty(id, delta){
  const cart = readCart();
  const it = cart.find(x => x.id === id);
  if (!it) return;
  it.qty += delta;
  if (it.qty <= 0) {
    const idx = cart.findIndex(x => x.id === id); cart.splice(idx,1);
  }
  writeCart(cart);
  if (location.pathname.endsWith('/cart.html') || location.pathname.endsWith('cart.html')) renderCartPage();
}

/* remove */
function removeFromCart(id){
  const cart = readCart().filter(x => x.id !== id);
  writeCart(cart);
  renderCartPage();
}

/* Utilities */
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]); }

function toast(msg){
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {position:'fixed',right:'20px',bottom:'20px',padding:'10px 14px',background:'rgba(15,23,42,0.9)',color:'#fff',borderRadius:'8px',zIndex:9999});
  document.body.appendChild(t);
  setTimeout(()=>t.style.opacity='0',1600);
  setTimeout(()=>t.remove(),2000);
}

/* Search, Filter & Sort */
function getProducts(){
  return JSON.parse(localStorage.getItem(PRODUCTS_KEY));
}
function applyFiltersAndRender(){
  const q = ($('#search-input') ? $('#search-input').value.trim().toLowerCase() : '');
  const tag = ($('#category-select') ? $('#category-select').value : 'all');
  const sort = ($('#sort-select') ? $('#sort-select').value : 'recom');

  let list = getProducts().slice();

  if (q) {
    list = list.filter(p => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  }
  if (tag && tag !== 'all') list = list.filter(p => p.category === tag);

  if (sort === 'price-asc') list.sort((a,b)=>a.price-b.price);
  if (sort === 'price-desc') list.sort((a,b)=>b.price-a.price);
  if (sort === 'recom') list.sort((a,b)=>b.rating - a.rating);

  renderProducts(list);
  $('#results-summary') && ( $('#results-summary').textContent = `${list.length} result${list.length===1?'':'s'}` );
}

/* Populate category filters */
function populateCategories(){
  const products = getProducts();
  const cats = Array.from(new Set(products.map(p=>p.category)));
  const select = $('#category-select');
  const tags = $('#category-tags');
  cats.forEach(c=>{
    const opt = document.createElement('option'); opt.value = c; opt.textContent = c;
    select.appendChild(opt);
    const t = document.createElement('button'); t.className='tag'; t.textContent = c;
    t.addEventListener('click', ()=> {
      // toggle active
      $$('.tag').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      select.value = c;
      applyFiltersAndRender();
    });
    tags.appendChild(t);
  });
}

/* read product id from query */
function queryParam(name){
  const params = new URLSearchParams(location.search);
  return params.has(name) ? params.get(name) : null;
}

/* small DOM wiring */
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  updateMiniCart();

  // global elements
  if ($('#search-input')) $('#search-input').addEventListener('input', () => applyFiltersAndRender());
  if ($('#category-select')) $('#category-select').addEventListener('change', () => applyFiltersAndRender());
  if ($('#sort-select')) $('#sort-select').addEventListener('change', () => applyFiltersAndRender());

  // mini-cart toggle
  $$('#cart-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mini = btn.parentElement.querySelector('.mini-cart');
      if (!mini) return;
      mini.classList.toggle('show');
    });
  });

  // Close mini carts when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.cart-wrapper')) {
      $$('.mini-cart').forEach(m => m.classList.remove('show'));
    }
  });

  // Page-specific rendering:
  if (location.pathname.endsWith('/index.html') || location.pathname.endsWith('/') || location.pathname.endsWith('index.html')) {
    populateCategories();
    applyFiltersAndRender();
  }

  // product detail page
  if (location.pathname.endsWith('product.html')) {
    const id = Number(queryParam('id'));
    const prod = getProducts().find(p => p.id === id);
    if (!prod) {
      $('#product-detail').innerHTML = `<div style="padding:20px">Product not found. <a href="index.html">Back</a></div>`;
    } else {
      renderProductDetail(prod);
    }
  }

  // cart page
  if (location.pathname.endsWith('cart.html')) {
    renderCartPage();
  }

  // auth modals (front-end only)
  const openLogin = $('#open-login');
  const openSignup = $('#open-signup');
  const authDialog = $('#auth-dialog');
  const backdrop = $('#modal-backdrop');

  function openAuth(mode){
    if (!authDialog.showModal) {
      alert('Note: your browser does not support <dialog>. Login modal may be limited.');
      return;
    }
    $('#auth-title').textContent = mode === 'signup' ? 'Create account' : 'Login';
    authDialog.showModal();
    backdrop.hidden = false;
  }
  openLogin && openLogin.addEventListener('click', ()=>openAuth('login'));
  openSignup && openSignup.addEventListener('click', ()=>openAuth('signup'));
  $('#cancel-auth') && $('#cancel-auth').addEventListener('click', ()=>{ authDialog.close(); backdrop.hidden = true; });

  // close dialog on outside click
  if (authDialog) authDialog.addEventListener('click', (e)=>{
    if (e.target === authDialog) { authDialog.close(); backdrop.hidden = true; }
  });

});
