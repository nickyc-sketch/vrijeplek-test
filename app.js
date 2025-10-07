const $ = s => document.querySelector(s);
document.addEventListener('DOMContentLoaded',()=>{
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  const menuBtn = document.getElementById('menuBtn');
  const menuDrop = document.getElementById('menuDrop');
  if (menuBtn && menuDrop){
    menuBtn.addEventListener('click',()=>menuDrop.classList.toggle('open'));
    document.addEventListener('click',(e)=>{ if (!menuDrop.contains(e.target) && !menuBtn.contains(e.target)) menuDrop.classList.remove('open'); });
  }
  // Identity UI
  const identity = window.netlifyIdentity;
  const loginLink = document.getElementById('loginLink');
  const logoutLink = document.getElementById('logoutLink');
  if (identity){
    identity.on('init', user => {
      if (user){
        if (loginLink) loginLink.style.display='none';
        if (logoutLink){ logoutLink.style.display='inline-flex'; logoutLink.addEventListener('click', ()=>identity.logout()); }
        const emailSpan = document.getElementById('uEmail'); if (emailSpan) emailSpan.textContent = user.email;
        const onDashboard = location.pathname.endsWith('dashboard.html');
        if (!onDashboard && location.pathname.endsWith('login.html')){
          // If logged in and on login page, redirect to dashboard
          window.location.href = 'dashboard.html';
        }
      } else {
        if (logoutLink) logoutLink.style.display='none';
        if (loginLink) loginLink.style.display='inline-flex';
        if (location.pathname.endsWith('dashboard.html')){
          window.location.href = 'login.html';
        }
      }
    });
    identity.init();
  }
});

function handleSearch(){
  const q = ($('#q')||{}).value || '';
  const cat = ($('#cat')||{}).value || '';
  const loc = ($('#loc')||{}).value || '';
  const params = new URLSearchParams({ q, cat, loc });
  window.location.href = `results.html?${params.toString()}`;
}

// Demo dataset for public pages
const DEMO = [
  {name:'Brasserie Nova', cat:'Horeca', city:'Genk', free:['Vandaag 14:00','Morgen 12:30'], rating:4.5},
  {name:'Kapsalon Lien', cat:'Diensten', city:'Hasselt', free:['Vandaag 16:15'], rating:4.8},
  {name:'Osteo Care', cat:'Gezondheidszorg', city:'Diepenbeek', free:['Morgen 10:00','Morgen 11:30'], rating:4.7},
  {name:'Pizzeria Sole', cat:'Horeca', city:'Genk', free:[], rating:4.2},
  {name:'Studio Anders', cat:'Anders', city:'Zonhoven', free:['Vandaag 18:00'], rating:4.1},
];

if (document.getElementById('nearby')){
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(()=>renderNearby(), ()=>renderNearby());
  } else { renderNearby(); }
}
function renderNearby(){
  const wrap = document.getElementById('nearby');
  wrap.innerHTML = DEMO.slice(0,3).map(card).join('');
}
function card(b){
  const free = b.free.length ? `<span class="tag">${b.free[0]} vrij</span>` : `<span class="tag">Geen vrije plek</span>`;
  return `<div class="card"><div class="kicker">${b.cat} · ${b.city}</div><h3>${b.name}</h3><p>Score: ${b.rating}/5</p>${free}</div>`;
}
if (document.getElementById('results')){
  const url = new URL(location.href);
  const q = url.searchParams.get('q')?.toLowerCase() || '';
  const cat = url.searchParams.get('cat') || '';
  const loc = url.searchParams.get('loc')?.toLowerCase() || '';
  const filtered = DEMO.filter(b =>
    (!cat || b.cat===cat) &&
    (!q || b.name.toLowerCase().includes(q)) &&
    (!loc || b.city.toLowerCase().includes(loc))
  );
  document.getElementById('results').innerHTML = filtered.map(card).join('') || '<p class="notice">Geen resultaten gevonden.</p>';
}

// —— Signup (Stripe Checkout) ——
let SELECTED_PLAN = null;
function selectPlan(plan){ SELECTED_PLAN = plan; alert(`Gekozen: ${plan==='monthly'?'Maandelijks €9':'Jaar €80'}`); }
async function startSignup(e){
  e.preventDefault();
  if (!SELECTED_PLAN){ alert('Kies eerst een plan links.'); return false; }
  if (!document.getElementById('agree').checked){ alert('Je moet akkoord gaan met de Algemene voorwaarden.'); return false; }
  const payload = {
    plan: SELECTED_PLAN,
    company: document.getElementById('company').value,
    vat: document.getElementById('vat').value,
    category: document.getElementById('category').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    reviews: document.getElementById('reviews').value,
    address: document.getElementById('address').value,
    bio: document.getElementById('bio').value,
  };
  try{
    const res = await fetch('/.netlify/functions/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.url){ location.href = data.url; } else alert('Kon geen betaalpagina openen.');
  }catch(err){ alert('Fout bij starten betaling: '+err.message); }
  return false;
}

// —— Dashboard Slots CRUD (via Netlify Functions → Supabase) ——
async function syncSlots(){
  const res = await fetch('/.netlify/functions/slots-list');
  const data = await res.json();
  const table = document.getElementById('slotsTable');
  if (!Array.isArray(data)){ table.innerHTML = '<tr><td>Geen data</td></tr>'; return; }
  table.innerHTML = data.map(s=>`<tr><td>${s.when}</td><td>${s.status||'Vrij'}</td><td><button class="button" onclick="delSlot('${s.id}')">Verwijder</button></td></tr>`).join('');
}
async function addSlot(){
  const when = prompt('Wanneer? (bv. 2025-10-10 14:30)');
  if (!when) return;
  await fetch('/.netlify/functions/slots-upsert',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({when, status:'Vrij'})});
  syncSlots();
}
async function delSlot(id){
  await fetch('/.netlify/functions/slots-delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
  syncSlots();
}
async function saveProfile(){ alert('Profiel opgeslagen (demo)'); }

// Load slots on dashboard
if (location.pathname.endsWith('dashboard.html')){
  document.addEventListener('DOMContentLoaded',()=>setTimeout(syncSlots, 300));
}
