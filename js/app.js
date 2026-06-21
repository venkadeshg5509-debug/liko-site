/* LIKO Construction - core JS */
const SITE_KEY = 'liko_site_data_v3';
const REQ_KEY  = 'liko_estimates_v1';
const AUTH_KEY = 'liko_auth_v1';
const IMG_PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90" viewBox="0 0 120 90"><rect fill="#e2e8f0" width="120" height="90"/><text x="60" y="48" text-anchor="middle" fill="#64748b" font-size="11" font-family="sans-serif">No image</text></svg>');

async function fetchDefaults(){
  const [base, specs] = await Promise.all([
    fetch('data/site.json').then(r=>r.json()),
    fetch('data/spec-categories.json').then(r=>r.json())
  ]);
  base.specCategories = specs.specCategories || [];
  return base;
}

async function loadSite(){
  if(localStorage.getItem('liko_site_data_v2') && !localStorage.getItem(SITE_KEY)){
    localStorage.setItem(SITE_KEY, localStorage.getItem('liko_site_data_v2'));
    localStorage.removeItem('liko_site_data_v2');
  }
  const defaults = await fetchDefaults();
  const cached = localStorage.getItem(SITE_KEY);
  if(!cached){
    localStorage.setItem(SITE_KEY, JSON.stringify(defaults));
    return defaults;
  }
  const data = mergeSiteData(defaults, JSON.parse(cached));
  localStorage.setItem(SITE_KEY, JSON.stringify(data));
  return data;
}

function mergeSiteData(defaults, saved){
  const out = {...defaults, ...saved};
  out.packages = (saved.packages || defaults.packages).map((p,i)=>({...defaults.packages[i], ...p}));
  out.services = saved.services?.length ? saved.services : defaults.services;
  out.addons = saved.addons?.length ? saved.addons : defaults.addons;
  out.specCategories = mergeSpecCategories(defaults.specCategories, saved.specCategories);
  out.projects = saved.projects || defaults.projects;
  out.gallery = saved.gallery || defaults.gallery;
  out.social = {...defaults.social, ...(saved.social||{})};
  out.admin = {...defaults.admin, ...(saved.admin||{})};
  return out;
}

function mergeSpecCategories(defaults, saved){
  if(!saved?.length) return defaults;
  const byNum = Object.fromEntries(saved.map(c=>[c.num, c]));
  return defaults.map(def=>{
    const s = byNum[def.num];
    if(!s) return def;
    return {
      ...def,
      title: s.title || def.title,
      desc: s.desc || def.desc,
      icon: s.icon || def.icon,
      specs: def.specs.map((sp,j)=>{
        const ss = s.specs?.[j];
        if(!ss) return sp;
        return {...sp, label:ss.label||sp.label, hint:ss.hint??sp.hint, values:{...sp.values, ...(ss.values||{})}};
      })
    };
  });
}

function saveSite(d){localStorage.setItem(SITE_KEY, JSON.stringify(d));}
function resetSite(){localStorage.removeItem(SITE_KEY);}

function inr(n){return '₹' + Number(n).toLocaleString('en-IN');}

function esc(s){
  return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildHeader(site, active){
  const nav = ['index','about','services','packages','projects','gallery','contact'];
  const labels={index:'Home',about:'About',services:'Services',packages:'Packages',projects:'Projects',gallery:'Gallery',contact:'Contact'};
  const links = nav.map(p=>{
    const href = p==='index' ? 'index.html' : p+'.html';
    return `<li class="nav-item"><a class="nav-link ${active===p?'active':''}" href="${href}">${labels[p]}</a></li>`;
  }).join('');
  const phones = [{raw:site.phoneRaw,label:site.phone}];
  if(site.phone2Raw && site.phone2) phones.push({raw:site.phone2Raw,label:site.phone2});
  const phoneBtns = phones.map((p,i)=>`<a class="btn btn-brand btn-sm ms-3" href="tel:${p.raw}" title="${esc(p.label)}"><i class="bi bi-telephone-fill"></i> Call${phones.length>1?` ${i+1}`:''}</a>`).join('');
  return `
  <nav class="navbar navbar-expand-lg bg-white sticky-top">
    <div class="container">
      <a class="navbar-brand d-flex align-items-center gap-2" href="index.html">
        <img src="images/logo.png" alt="${esc(site.company)} logo">
        <span class="fw-bold text-brand d-inline">LIKO</span>
      </a>
      <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav"><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse" id="nav">
        <ul class="navbar-nav mx-auto">${links}</ul>
        <div class="header-social d-none d-lg-flex align-items-center">
          <a href="${site.social.facebook}" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
          <a href="${site.social.instagram}" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
          <a href="${site.social.youtube}" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
          <a href="${site.social.linkedin}" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a>
          ${phoneBtns}
        </div>
      </div>
    </div>
  </nav>`;
}

function buildFooter(site){
  const phones = [{raw:site.phoneRaw,label:site.phone}];
  if(site.phone2Raw && site.phone2) phones.push({raw:site.phone2Raw,label:site.phone2});
  return `
  <footer class="pt-5 pb-3 mt-5">
    <div class="container">
      <div class="row g-4">
        <div class="col-md-4">
          <div class="d-flex align-items-center gap-2 mb-3">
            <img src="images/logo.png" alt="logo" style="height:44px">
            <h5 class="m-0 text-white">${esc(site.company)}</h5>
          </div>
          <p class="small">${esc(site.tagline)}</p>
          <div>
            <a class="social-ic" href="${site.social.facebook}"><i class="bi bi-facebook"></i></a>
            <a class="social-ic" href="${site.social.instagram}"><i class="bi bi-instagram"></i></a>
            <a class="social-ic" href="${site.social.youtube}"><i class="bi bi-youtube"></i></a>
            <a class="social-ic" href="${site.social.linkedin}"><i class="bi bi-linkedin"></i></a>
          </div>
        </div>
        <div class="col-md-4">
          <h5>Quick Links</h5>
          <ul class="list-unstyled small">
            <li><a href="about.html">About Us</a></li>
            <li><a href="packages.html">Packages</a></li>
            <li><a href="projects.html">Projects</a></li>
            <li><a href="gallery.html">Gallery</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div class="col-md-4">
          <h5>Reach Us</h5>
          <p class="small mb-1"><i class="bi bi-geo-alt-fill text-gold"></i> ${esc(site.address)}</p>
          ${phones.map(p=>`<p class="small mb-1"><i class="bi bi-telephone-fill text-gold"></i> <a href="tel:${p.raw}">${esc(p.label)}</a></p>`).join('')}
          <p class="small mb-1"><i class="bi bi-whatsapp text-gold"></i> <a href="https://wa.me/${site.whatsapp}">WhatsApp</a></p>
          <p class="small"><i class="bi bi-envelope-fill text-gold"></i> <a href="mailto:${site.email}">${esc(site.email)}</a></p>
        </div>
      </div>
      <hr style="border-color:rgba(255,255,255,.1)">
      <div class="d-flex flex-wrap justify-content-between small">
        <span>© ${new Date().getFullYear()} ${esc(site.company)}. All rights reserved.</span>
        <span><a href="admin.html">Admin</a></span>
      </div>
    </div>
  </footer>
  <div class="float-buttons">
    <a class="fb-wa" href="https://wa.me/${site.whatsapp}" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a>
    <a class="fb-call" href="tel:${site.phoneRaw}" aria-label="Call"><i class="bi bi-telephone-fill"></i></a>
  </div>`;
}

async function mountChrome(activePage){
  const site = await loadSite();
  const h = document.getElementById('site-header');
  const f = document.getElementById('site-footer');
  if(h) h.innerHTML = buildHeader(site, activePage);
  if(f) f.innerHTML = buildFooter(site);
  return site;
}

/* Package cards */
function renderPackageCards(packages, opts={}){
  const {featuredIndex=2, limit=0, showBtn=false} = opts;
  return packages.map((p,i)=>{
    const highlights = limit ? p.highlights.slice(0, limit) : p.highlights;
    return `<div class="col-md-6 col-lg-3">
      <div class="pkg-card ${i===featuredIndex?'featured':''}">
        ${i===featuredIndex?'<div class="ribbon">POPULAR</div>':''}
        <h5 class="text-brand">${esc(p.name)}</h5>
        <div class="price">${inr(p.rate)}<small>/sq.ft</small></div>
        <ul>${highlights.map(h=>`<li>${esc(h)}</li>`).join('')}</ul>
        ${showBtn?`<a href="contact.html" class="btn btn-brand w-100">Enquire</a>`:''}
      </div>
    </div>`;
  }).join('');
}

/* Detailed spec comparison */
function renderSpecComparison(site){
  const pkgs = site.packages;
  const cats = site.specCategories || [];
  if(!cats.length) return '<p class="text-muted">Detailed specifications coming soon.</p>';

  const head = pkgs.map(p=>`<th class="spec-col-pkg"><span class="spec-pkg-name">${esc(p.name)}</span><span class="spec-pkg-rate">${inr(p.rate)}/sq.ft</span></th>`).join('');

  const desktop = `<div class="spec-table-wrap d-none d-lg-block">
    <table class="table spec-table mb-0">
      <thead><tr><th class="spec-col-label">Specification</th>${head}</tr></thead>
      <tbody>${cats.map(cat=>`
        <tr class="spec-cat-row"><td colspan="${pkgs.length+1}">
          <span class="spec-cat-num">${cat.num}</span>
          <i class="bi ${cat.icon||'bi-list-check'}"></i>
          <strong>${esc(cat.title)}</strong>
          ${cat.desc?`<span class="spec-cat-desc">${esc(cat.desc)}</span>`:''}
        </td></tr>
        ${(cat.specs||[]).map(sp=>`<tr>
          <td class="spec-col-label">
            <span class="spec-label">${esc(sp.label)}</span>
            ${sp.hint?`<span class="spec-hint" title="${esc(sp.hint)}"><i class="bi bi-info-circle"></i> ${esc(sp.hint)}</span>`:''}
          </td>
          ${pkgs.map(p=>`<td>${esc(sp.values?.[p.id]||'—')}</td>`).join('')}
        </tr>`).join('')}
      `).join('')}</tbody>
    </table>
  </div>`;

  const mobile = `<div class="d-lg-none spec-mobile">${cats.map(cat=>`
    <div class="spec-mobile-cat">
      <button class="spec-mobile-toggle" type="button" data-bs-toggle="collapse" data-bs-target="#spec-cat-${cat.num}">
        <span><span class="spec-cat-num">${cat.num}</span> ${esc(cat.title)}</span>
        <i class="bi bi-chevron-down"></i>
      </button>
      <div class="collapse" id="spec-cat-${cat.num}">
        ${cat.desc?`<p class="small text-muted px-3 pt-2 mb-0">${esc(cat.desc)}</p>`:''}
        ${(cat.specs||[]).map(sp=>`
          <div class="spec-mobile-item">
            <div class="spec-mobile-label">${esc(sp.label)}${sp.hint?`<small>${esc(sp.hint)}</small>`:''}</div>
            ${pkgs.map(p=>`<div class="spec-mobile-val"><span>${esc(p.name)}</span><strong>${esc(sp.values?.[p.id]||'—')}</strong></div>`).join('')}
          </div>`).join('')}
      </div>
    </div>`).join('')}</div>`;

  return desktop + mobile;
}

function renderAddons(addons){
  if(!addons?.length) return '';
  return addons.map(a=>`
    <div class="col-md-6 col-lg-4">
      <div class="feature-card h-100">
        <h6>${esc(a.title)}</h6>
        <p class="small text-muted mb-1">${esc(a.desc)}</p>
        <span class="badge bg-brand">${esc(a.rate)}</span>
      </div>
    </div>`).join('');
}

function renderServices(services, cols='col-md-6 col-lg-3', heading='h6'){
  return services.map(s=>`
    <div class="${cols}">
      <div class="feature-card h-100">
        <div class="ic"><i class="bi ${esc(s.icon)}"></i></div>
        <${heading}>${esc(s.title)}</${heading}>
        <p class="small text-muted mb-0">${esc(s.desc)}</p>
      </div>
    </div>`).join('');
}

function renderProjectCards(items){
  return (items||[]).map(p=>`
    <div class="col-md-6 col-lg-4">
      <div class="feature-card p-0 overflow-hidden h-100">
        <img class="gallery-img" style="height:240px" src="${esc(p.img)}" alt="${esc(p.title)}" loading="lazy" onerror="this.src='${IMG_PLACEHOLDER}'">
        <div class="p-3">
          <h6 class="mb-1">${esc(p.title)}</h6>
          <p class="small text-muted mb-0">${esc(p.desc)}</p>
        </div>
      </div>
    </div>`).join('');
}

function renderGalleryTiles(images){
  return (images||[]).map(src=>`
    <div class="col-6 col-md-4">
      <img class="gallery-img" src="${esc(src)}" alt="LIKO project photo" loading="lazy"
        onclick="openGalleryImg('${esc(src)}')" onerror="this.src='${IMG_PLACEHOLDER}'">
    </div>`).join('');
}

function openGalleryImg(src){
  const img = document.getElementById('modalImg');
  const modal = document.getElementById('imgModal');
  if(!img || !modal) return;
  img.src = src;
  bootstrap.Modal.getOrCreateInstance(modal).show();
}

/* Estimate calculator */
function calcByBudget(budget, packages){
  return packages.map(p=>({...p, sqft: Math.floor(budget / p.rate)}));
}
function calcBySqft(sqft, packages){
  return packages.map(p=>({...p, cost: sqft * p.rate}));
}

function renderEstimate(site){
  const mode = document.querySelector('input[name="emode"]:checked').value;
  const val = parseFloat(document.getElementById('eval').value);
  const out = document.getElementById('eresult');
  if(!val || val<=0){out.innerHTML='<div class="text-danger">Please enter a valid number.</div>';return;}
  let rows='';
  if(mode==='budget'){
    const rs = calcByBudget(val, site.packages);
    rows = rs.map(r=>`<tr><td><strong>${esc(r.name)}</strong></td><td>${inr(r.rate)}/sq.ft</td><td><strong>${r.sqft.toLocaleString('en-IN')} sq.ft</strong></td></tr>`).join('');
    out.innerHTML = `<h6 class="mb-2">For budget of ${inr(val)} you can build:</h6>
      <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Package</th><th>Rate</th><th>Build Area</th></tr></thead><tbody>${rows}</tbody></table></div>
      <small class="text-muted">* Estimates based on built-up area. Final cost may vary with site conditions and add-ons.</small>
      <div class="mt-2"><a href="packages.html#comparison" class="small">View full package specifications →</a></div>`;
  } else {
    const rs = calcBySqft(val, site.packages);
    rows = rs.map(r=>`<tr><td><strong>${esc(r.name)}</strong></td><td>${inr(r.rate)}/sq.ft</td><td><strong>${inr(r.cost)}</strong></td></tr>`).join('');
    out.innerHTML = `<h6 class="mb-2">Estimated cost for ${val.toLocaleString('en-IN')} sq.ft:</h6>
      <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Package</th><th>Rate</th><th>Total Cost</th></tr></thead><tbody>${rows}</tbody></table></div>
      <small class="text-muted">* Excludes plan approval, soil tests and optional add-ons.</small>
      <div class="mt-2"><a href="packages.html#comparison" class="small">View full package specifications →</a></div>`;
  }
}

function saveEstimateRequest(req){
  const arr = JSON.parse(localStorage.getItem(REQ_KEY) || '[]');
  arr.unshift({...req, at: new Date().toISOString()});
  localStorage.setItem(REQ_KEY, JSON.stringify(arr));
}
function getEstimateRequests(){return JSON.parse(localStorage.getItem(REQ_KEY)||'[]');}
function clearEstimateRequests(){localStorage.removeItem(REQ_KEY);}

function exportEstimateRequests(){
  const data = getEstimateRequests();
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `liko-estimates-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

function exportSiteData(site){
  const blob = new Blob([JSON.stringify(site,null,2)],{type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `liko-site-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

/* Admin */
function adminLogin(u,p,site){
  if(u===site.admin.username && p===site.admin.password){
    sessionStorage.setItem(AUTH_KEY,'1');return true;
  }return false;
}
function isAdmin(){return sessionStorage.getItem(AUTH_KEY)==='1';}
function adminLogout(){sessionStorage.removeItem(AUTH_KEY);}
