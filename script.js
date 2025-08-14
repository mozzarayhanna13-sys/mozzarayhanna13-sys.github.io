
// --- Data Produk ---
const PRODUCTS = [
  {id:'STRAW', name:'Strawberry Dream', price:28000, img:'assets/slide1.svg', tags:['strawberry','milk']},
  {id:'MANGO', name:'Mango Glow', price:26000, img:'assets/slide2.svg', tags:['mango','fresh']},
  {id:'MATCHA', name:'Matcha Mellow', price:30000, img:'assets/slide3.svg', tags:['matcha','oat milk']},
  {id:'AVO', name:'Avocado Bliss', price:32000, img:'assets/slide1.svg', tags:['avocado','choco']},
  {id:'BERRYMIX', name:'Berry Party', price:31000, img:'assets/slide1.svg', tags:['blueberry','raspberry']},
  {id:'TROPICAL', name:'Tropical Splash', price:27000, img:'assets/slide2.svg', tags:['pineapple','coconut']},
];

// --- Util ---
const rupiah = v => new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0}).format(v);
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// --- Tahun footer ---
$('#year').textContent = new Date().getFullYear();

// --- Scroll reveal simple ---
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('show'); } });
},{threshold:.15});
$$('.wow').forEach(el => observer.observe(el));

// --- Build product grid ---
const grid = $('#productGrid');
PRODUCTS.forEach(p => {
  const card = document.createElement('div');
  card.className = 'card wow up';
  card.innerHTML = `
    <img alt="${p.name}" src="${p.img}" style="border-radius:14px; aspect-ratio: 4/3; object-fit:cover">
    <h4>${p.name}</h4>
    <div class="tiny">${p.tags.join(' • ')}</div>
    <div class="price">${rupiah(p.price)}</div>
    <div class="actions">
      <div class="qty">
        <button class="dec" aria-label="Kurangi">–</button>
        <input type="number" class="q" min="1" value="1" style="width:44px; text-align:center">
        <button class="inc" aria-label="Tambah">+</button>
      </div>
      <button class="btn primary add">Tambah</button>
    </div>
  `;
  grid.appendChild(card);

  const q = card.querySelector('.q');
  card.querySelector('.inc').onclick = ()=> q.value = +q.value + 1;
  card.querySelector('.dec').onclick = ()=> q.value = Math.max(1, +q.value - 1);
  card.querySelector('.add').onclick = ()=> addToCart(p, +q.value);
  observer.observe(card);
});

// --- Slider ---
const slidesEl = document.querySelector('.slides');
const slideEls = [...document.querySelectorAll('.slide')];
const dotsEl = document.querySelector('.dots');
let idx = 0, timer;

function go(i){
  idx = (i + slideEls.length) % slideEls.length;
  slidesEl.style.transform = `translateX(${-idx*100}%)`;
  [...dotsEl.children].forEach((d,di)=>d.classList.toggle('active', di===idx));
}
function next(){ go(idx+1); }
function prev(){ go(idx-1); }

// Build dots
slideEls.forEach((_,i)=>{
  const b = document.createElement('button');
  b.setAttribute('role','tab');
  b.setAttribute('aria-label', 'Slide '+(i+1));
  b.onclick = ()=> go(i);
  dotsEl.appendChild(b);
});
go(0);

function autoplay(){
  clearInterval(timer);
  timer = setInterval(next, 4000);
}
autoplay();
document.querySelector('.next').onclick = ()=>{ next(); autoplay(); };
document.querySelector('.prev').onclick = ()=>{ prev(); autoplay(); };

// --- Cart ---
const drawer = $('#cartDrawer');
const cartBtn = $('#cartBtn');
const openCartFooter = $('#openCartFooter');
const closeCart = $('#closeCart');
const cartItems = $('#cartItems');
const cartCount = $('#cartCount');
const cartTotal = $('#cartTotal');
let CART = JSON.parse(localStorage.getItem('MOO_CART')||'[]');

function saveCart(){ localStorage.setItem('MOO_CART', JSON.stringify(CART)); }
function updateBadge(){ cartCount.textContent = CART.reduce((a,c)=>a+c.qty,0); }
function total(){ return CART.reduce((a,c)=>a+c.qty*c.price,0); }

function renderCart(){
  cartItems.innerHTML = '';
  if(CART.length===0){
    cartItems.innerHTML = `<div class="tiny">Keranjang kosong. Yuk tambah menu favoritmu!</div>`;
  } else {
    CART.forEach((item,i)=>{
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <img src="${item.img}" alt="${item.name}" style="width:60px; height:60px; object-fit:cover; border-radius:10px">
        <div>
          <div style="font-weight:600">${item.name}</div>
          <div class="tiny">${rupiah(item.price)} • x <input type="number" min="1" value="${item.qty}" style="width:54px"></div>
        </div>
        <button class="icon-btn" title="Hapus">🗑️</button>
      `;
      const input = el.querySelector('input');
      input.onchange = (e)=>{ item.qty = Math.max(1, +e.target.value); sync(); };
      el.querySelector('button').onclick = ()=>{ CART.splice(i,1); sync(); };
      cartItems.appendChild(el);
    });
  }
  cartTotal.textContent = rupiah(total());
  updateBadge();
}
function openDrawer(){ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); }
function closeDrawer(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); }
cartBtn.onclick = openDrawer;
openCartFooter.onclick = openDrawer;
closeCart.onclick = closeDrawer;

function addToCart(p, qty=1){
  const f = CART.find(x=>x.id===p.id);
  if(f) f.qty += qty;
  else CART.push({id:p.id, name:p.name, price:p.price, img:p.img, qty});
  sync();
  openDrawer();
}
function sync(){ saveCart(); renderCart(); }
sync();

// --- Checkout ---
const checkoutBtn = $('#checkoutBtn');
const checkoutModal = $('#checkoutModal');
const closeCheckout = $('#closeCheckout');
const orderPreview = $('#orderPreview');
const checkoutForm = $('#checkoutForm');
const placeOrder = $('#placeOrder');

checkoutBtn.onclick = ()=>{
  if(CART.length===0){ alert('Keranjang masih kosong.'); return; }
  orderPreview.innerHTML = `
    <div><strong>Ringkasan Pesanan</strong></div>
    ${CART.map(i=>`<div class="tiny">${i.name} × ${i.qty} — ${rupiah(i.qty*i.price)}</div>`).join('')}
    <div style="margin-top:6px"><strong>Total: ${rupiah(total())}</strong></div>
  `;
  checkoutModal.showModal();
}
closeCheckout.onclick = ()=> checkoutModal.close();

checkoutForm.addEventListener('submit', (e)=>{
  if(e.submitter !== placeOrder) return;
  e.preventDefault();
  // Build order object
  const order = {
    id: 'MOO-'+Date.now(),
    at: new Date().toISOString(),
    items: CART.map(({id,name,price,qty})=>({id,name,price,qty,subtotal:price*qty})),
    total: total(),
    customer:{
      name: $('#custName').value,
      email: $('#custEmail').value,
      phone: $('#custPhone').value,
      address: $('#custAddr').value,
      payment: $('#custPay').value
    }
  };
  // Save and download receipt
  const blob = new Blob([JSON.stringify(order,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = order.id + '-receipt.json';
  document.body.appendChild(a); a.click(); a.remove();

  // Reset cart
  CART = []; sync();
  checkoutModal.close();
  alert('Pesanan terkirim! Bukti (JSON) telah diunduh.');
});

// Footer small cart button mirrors main
document.getElementById('openCartFooter').onclick = openDrawer;

// --- Newsletter ---
document.getElementById('newsletter').addEventListener('submit', (e)=>{
  e.preventDefault();
  const email = document.getElementById('newsEmail').value;
  localStorage.setItem('MOO_NEWS', email);
  e.target.reset();
  alert('Terima kasih! Kami akan kirim update ke '+email);
});

// --- Ambience audio ---
const audio = document.getElementById('bg-audio');
document.getElementById('ambienceToggle').addEventListener('click', async ()=>{
  try{
    if(audio.paused){ await audio.play(); } else { audio.pause(); }
  }catch(err){
    console.log(err);
  }
});
