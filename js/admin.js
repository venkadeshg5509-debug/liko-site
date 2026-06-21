/* LIKO Admin — visual editors (no code required) */

function adminFlash(el, msg, ms=2000){
  if(typeof el==='string') el=document.getElementById(el);
  if(!el) return;
  el.textContent = msg;
  setTimeout(()=>{el.textContent='';}, ms);
}

function renderAdminPanel(site){
  renderPkgRates(site);
  renderSpecEditor(site);
  renderServicesEditor(site);
  renderAddonsEditor(site);
  renderCompanyEditor(site);
  renderRequests(site);
  renderProjectsEditor(site);
  renderGalleryEditor(site);
}

const PRJ_SECTIONS = [
  {key:'plans', label:'House Plans', icon:'bi-map'},
  {key:'elevations', label:'Elevation Designs', icon:'bi-building'},
  {key:'completed', label:'Completed Projects', icon:'bi-house-check'}
];

const GAL_SECTIONS = [
  {key:'exterior', label:'Exterior Photos'},
  {key:'interior', label:'Interior Photos'},
  {key:'ongoing', label:'Ongoing Sites'}
];

function adminProjectCard(item, section, i){
  return `<div class="admin-img-card" data-section="${section}" data-i="${i}">
    <div class="row g-2 align-items-start">
      <div class="col-auto">
        <img class="admin-img-preview" src="${esc(item.img)}" alt="" onerror="this.src='${IMG_PLACEHOLDER}'">
      </div>
      <div class="col">
        <label class="form-label small mb-1">Image path <span class="text-muted">(upload to images/ folder first)</span></label>
        <input type="text" class="form-control form-control-sm prj-img" value="${esc(item.img)}" placeholder="images/photo.jpg">
        <label class="form-label small mb-1 mt-2">Title</label>
        <input type="text" class="form-control form-control-sm prj-title" value="${esc(item.title)}">
        <label class="form-label small mb-1 mt-2">Description</label>
        <input type="text" class="form-control form-control-sm prj-desc" value="${esc(item.desc)}">
      </div>
      <div class="col-auto pt-1">
        <button type="button" class="btn btn-outline-danger btn-sm prj-del" title="Remove"><i class="bi bi-trash"></i></button>
      </div>
    </div>
  </div>`;
}

function adminGalleryRow(src, section, i){
  return `<div class="admin-img-card" data-section="${section}" data-i="${i}">
    <div class="row g-2 align-items-center">
      <div class="col-auto">
        <img class="admin-img-preview" src="${esc(src)}" alt="" onerror="this.src='${IMG_PLACEHOLDER}'">
      </div>
      <div class="col">
        <label class="form-label small mb-1">Image path</label>
        <input type="text" class="form-control form-control-sm gal-img" value="${esc(src)}" placeholder="images/photo.jpg">
      </div>
      <div class="col-auto">
        <button type="button" class="btn btn-outline-danger btn-sm gal-del" title="Remove"><i class="bi bi-trash"></i></button>
      </div>
    </div>
  </div>`;
}

function renderProjectsEditor(site){
  if(!site.projects) site.projects = {plans:[], elevations:[], completed:[]};
  document.getElementById('prjEdit').innerHTML = PRJ_SECTIONS.map(sec=>`
    <div class="admin-img-section mb-4" data-section="${sec.key}">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="m-0"><i class="bi ${sec.icon}"></i> ${sec.label}</h6>
        <button type="button" class="btn btn-outline-brand btn-sm prj-add" data-section="${sec.key}"><i class="bi bi-plus-lg"></i> Add</button>
      </div>
      <div class="admin-img-list">${(site.projects[sec.key]||[]).map((p,i)=>adminProjectCard(p, sec.key, i)).join('') || '<p class="small text-muted mb-2">No items yet.</p>'}</div>
    </div>`).join('');
}

function renderGalleryEditor(site){
  if(!site.gallery) site.gallery = {exterior:[], interior:[], ongoing:[]};
  document.getElementById('galEdit').innerHTML = GAL_SECTIONS.map(sec=>`
    <div class="admin-img-section mb-4" data-section="${sec.key}">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="m-0">${sec.label}</h6>
        <button type="button" class="btn btn-outline-brand btn-sm gal-add" data-section="${sec.key}"><i class="bi bi-plus-lg"></i> Add Photo</button>
      </div>
      <div class="admin-img-list">${(site.gallery[sec.key]||[]).map((src,i)=>adminGalleryRow(src, sec.key, i)).join('') || '<p class="small text-muted mb-2">No photos yet.</p>'}</div>
    </div>`).join('');
}

function collectProjects(site){
  if(!site.projects) site.projects = {};
  PRJ_SECTIONS.forEach(sec=>{
    const section = document.querySelector(`.admin-img-section[data-section="${sec.key}"]`);
    if(!section) return;
    site.projects[sec.key] = [...section.querySelectorAll('.admin-img-card')].map(row=>({
      img: row.querySelector('.prj-img').value.trim(),
      title: row.querySelector('.prj-title').value.trim(),
      desc: row.querySelector('.prj-desc').value.trim()
    })).filter(p=>p.img || p.title);
  });
}

function collectGallery(site){
  if(!site.gallery) site.gallery = {};
  GAL_SECTIONS.forEach(sec=>{
    const section = document.querySelector(`#galEdit .admin-img-section[data-section="${sec.key}"]`);
    if(!section) return;
    site.gallery[sec.key] = [...section.querySelectorAll('.admin-img-card')]
      .map(row=>row.querySelector('.gal-img').value.trim())
      .filter(Boolean);
  });
}

function updateAdminPreview(input){
  const card = input.closest('.admin-img-card');
  if(!card) return;
  const img = card.querySelector('.admin-img-preview');
  if(img) img.src = input.value.trim() || IMG_PLACEHOLDER;
}

function renderPkgRates(site){
  document.getElementById('pkgEdit').innerHTML = site.packages.map((p,i)=>`
    <div class="col-md-6 col-lg-3">
      <label class="form-label fw-bold">${esc(p.name)}</label>
      <div class="input-group mb-2">
        <span class="input-group-text">₹</span>
        <input type="number" class="form-control pkg-rate" data-i="${i}" value="${p.rate}">
        <span class="input-group-text">/sq.ft</span>
      </div>
      <input type="text" class="form-control form-control-sm pkg-name" data-i="${i}" value="${esc(p.name)}" placeholder="Package name">
    </div>`).join('');
}

function renderSpecEditor(site){
  const root = document.getElementById('specEdit');
  if(!site.specCategories?.length){
    root.innerHTML = '<p class="text-muted">No specification categories found.</p>';
    return;
  }
  root.innerHTML = `<p class="small text-muted mb-3"><strong>${site.specCategories.length}</strong> numbered categories — scroll to edit each section.</p>` +
    site.specCategories.map((cat,ci)=>`
    <div class="admin-spec-cat" data-ci="${ci}">
      <div class="admin-spec-cat-head">
        <span class="spec-cat-num">${cat.num}</span>
        <input type="text" class="form-control form-control-sm spec-cat-title" value="${esc(cat.title)}" placeholder="Category title">
        <input type="text" class="form-control form-control-sm spec-cat-desc" value="${esc(cat.desc||'')}" placeholder="Short description for customers">
      </div>
      <div class="table-responsive">
        <table class="table table-sm admin-spec-table align-middle">
          <thead><tr>
            <th style="min-width:160px">Item</th>
            <th style="min-width:140px">Help text</th>
            ${site.packages.map(p=>`<th>${esc(p.name.replace(' Package',''))}</th>`).join('')}
          </tr></thead>
          <tbody>
            ${(cat.specs||[]).map((sp,si)=>`<tr data-si="${si}">
              <td><input type="text" class="form-control form-control-sm spec-label" value="${esc(sp.label)}"></td>
              <td><input type="text" class="form-control form-control-sm spec-hint-inp" value="${esc(sp.hint||'')}"></td>
              ${site.packages.map(p=>`<td><input type="text" class="form-control form-control-sm spec-val" data-pkg="${p.id}" value="${esc(sp.values?.[p.id]||'')}"></td>`).join('')}
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`).join('');
}

function collectSpecEdits(site){
  document.querySelectorAll('.admin-spec-cat').forEach(el=>{
    const ci = +el.dataset.ci;
    const cat = site.specCategories[ci];
    cat.title = el.querySelector('.spec-cat-title').value.trim();
    cat.desc = el.querySelector('.spec-cat-desc').value.trim();
    el.querySelectorAll('tbody tr').forEach((row,si)=>{
      const sp = cat.specs[si];
      if(!sp) return;
      sp.label = row.querySelector('.spec-label').value.trim();
      sp.hint = row.querySelector('.spec-hint-inp').value.trim();
      row.querySelectorAll('.spec-val').forEach(inp=>{
        sp.values[inp.dataset.pkg] = inp.value.trim();
      });
    });
  });
}

function renderServicesEditor(site){
  document.getElementById('svcEdit').innerHTML = site.services.map((s,i)=>`
    <div class="admin-row-card" data-i="${i}">
      <div class="row g-2 align-items-end">
        <div class="col-md-1"><label class="form-label small">Icon</label>
          <input class="form-control form-control-sm svc-icon" value="${esc(s.icon)}" placeholder="bi-bricks"></div>
        <div class="col-md-3"><label class="form-label small">Title</label>
          <input class="form-control form-control-sm svc-title" value="${esc(s.title)}"></div>
        <div class="col-md-7"><label class="form-label small">Description</label>
          <input class="form-control form-control-sm svc-desc" value="${esc(s.desc)}"></div>
        <div class="col-md-1"><button type="button" class="btn btn-outline-danger btn-sm w-100 svc-del" title="Remove"><i class="bi bi-trash"></i></button></div>
      </div>
    </div>`).join('');
}

function collectServices(site){
  site.services = [...document.querySelectorAll('#svcEdit .admin-row-card')].map(row=>({
    icon: row.querySelector('.svc-icon').value.trim()||'bi-check2',
    title: row.querySelector('.svc-title').value.trim(),
    desc: row.querySelector('.svc-desc').value.trim()
  })).filter(s=>s.title);
}

function renderAddonsEditor(site){
  document.getElementById('addonEdit').innerHTML = (site.addons||[]).map((a,i)=>`
    <div class="admin-row-card" data-i="${i}">
      <div class="row g-2 align-items-end">
        <div class="col-md-3"><label class="form-label small">Title</label>
          <input class="form-control form-control-sm addon-title" value="${esc(a.title)}"></div>
        <div class="col-md-5"><label class="form-label small">Description</label>
          <input class="form-control form-control-sm addon-desc" value="${esc(a.desc)}"></div>
        <div class="col-md-3"><label class="form-label small">Rate</label>
          <input class="form-control form-control-sm addon-rate" value="${esc(a.rate)}"></div>
        <div class="col-md-1"><button type="button" class="btn btn-outline-danger btn-sm w-100 addon-del"><i class="bi bi-trash"></i></button></div>
      </div>
    </div>`).join('');
}

function collectAddons(site){
  site.addons = [...document.querySelectorAll('#addonEdit .admin-row-card')].map(row=>({
    title: row.querySelector('.addon-title').value.trim(),
    desc: row.querySelector('.addon-desc').value.trim(),
    rate: row.querySelector('.addon-rate').value.trim()
  })).filter(a=>a.title);
}

function renderCompanyEditor(site){
  const f = document.getElementById('companyForm');
  f.innerHTML = `
    <div class="row g-3">
      <div class="col-md-6"><label class="form-label">Company Name</label><input class="form-control co-field" data-k="company" value="${esc(site.company)}"></div>
      <div class="col-md-6"><label class="form-label">Tagline</label><input class="form-control co-field" data-k="tagline" value="${esc(site.tagline)}"></div>
      <div class="col-12"><label class="form-label">Address</label><textarea class="form-control co-field" data-k="address" rows="2">${esc(site.address)}</textarea></div>
      <div class="col-md-4"><label class="form-label">Phone (display)</label><input class="form-control co-field" data-k="phone" value="${esc(site.phone)}"></div>
      <div class="col-md-4"><label class="form-label">Phone (digits only)</label><input class="form-control co-field" data-k="phoneRaw" value="${esc(site.phoneRaw)}"></div>
      <div class="col-md-4"><label class="form-label">Second phone (display)</label><input class="form-control co-field" data-k="phone2" value="${esc(site.phone2||'')}"></div>
      <div class="col-md-4"><label class="form-label">Second phone (digits only)</label><input class="form-control co-field" data-k="phone2Raw" value="${esc(site.phone2Raw||'')}"></div>
      <div class="col-md-4"><label class="form-label">WhatsApp number</label><input class="form-control co-field" data-k="whatsapp" value="${esc(site.whatsapp)}"></div>
      <div class="col-md-6"><label class="form-label">Email</label><input class="form-control co-field" data-k="email" value="${esc(site.email)}"></div>
      <div class="col-md-6"><label class="form-label">Admin password</label><input type="text" class="form-control co-admin-pass" value="${esc(site.admin.password)}" placeholder="Change login password"></div>
      <div class="col-md-3"><label class="form-label">Facebook</label><input class="form-control co-social" data-k="facebook" value="${esc(site.social.facebook)}"></div>
      <div class="col-md-3"><label class="form-label">Instagram</label><input class="form-control co-social" data-k="instagram" value="${esc(site.social.instagram)}"></div>
      <div class="col-md-3"><label class="form-label">YouTube</label><input class="form-control co-social" data-k="youtube" value="${esc(site.social.youtube)}"></div>
      <div class="col-md-3"><label class="form-label">LinkedIn</label><input class="form-control co-social" data-k="linkedin" value="${esc(site.social.linkedin)}"></div>
    </div>`;
}

function collectCompany(site){
  document.querySelectorAll('.co-field').forEach(inp=>{site[inp.dataset.k]=inp.value.trim();});
  document.querySelectorAll('.co-social').forEach(inp=>{site.social[inp.dataset.k]=inp.value.trim();});
  const pw = document.querySelector('.co-admin-pass')?.value.trim();
  if(pw) site.admin.password = pw;
}

function renderRequests(site){
  const r = getEstimateRequests();
  document.getElementById('reqList').innerHTML = r.length?`<div class="table-responsive"><table class="table table-sm"><thead><tr><th>Date</th><th>Name</th><th>Phone</th><th>Mode</th><th>Value</th><th>Message</th></tr></thead><tbody>
    ${r.map(x=>`<tr><td><small>${new Date(x.at).toLocaleString()}</small></td><td>${esc(x.name||'-')}</td><td>${esc(x.phone||'-')}</td><td>${esc(x.mode||'-')}</td><td>${esc(x.value||'-')}</td><td><small>${esc(x.message||x.email||'')}</small></td></tr>`).join('')}
    </tbody></table></div>`:'<p class="text-muted">No requests yet.</p>';
}

function bindAdminEvents(site, reload){
  document.getElementById('savePkg').addEventListener('click',()=>{
    document.querySelectorAll('.pkg-rate').forEach(inp=>{site.packages[+inp.dataset.i].rate=+inp.value;});
    document.querySelectorAll('.pkg-name').forEach(inp=>{site.packages[+inp.dataset.i].name=inp.value.trim();});
    saveSite(site);
    adminFlash('pkgMsg','✓ Package rates saved');
  });

  document.getElementById('saveSpec').addEventListener('click',()=>{
    collectSpecEdits(site);
    saveSite(site);
    adminFlash('specMsg','✓ Specifications saved');
  });

  document.getElementById('saveSvc').addEventListener('click',()=>{
    collectServices(site);
    saveSite(site);
    renderServicesEditor(site);
    adminFlash('svcMsg','✓ Services saved');
  });

  document.getElementById('addSvc').addEventListener('click',()=>{
    site.services.push({icon:'bi-check2',title:'New Service',desc:'Description here'});
    renderServicesEditor(site);
  });

  document.getElementById('svcEdit').addEventListener('click',e=>{
    if(e.target.closest('.svc-del')){
      const i = +e.target.closest('.admin-row-card').dataset.i;
      site.services.splice(i,1);
      renderServicesEditor(site);
    }
  });

  document.getElementById('saveAddon').addEventListener('click',()=>{
    collectAddons(site);
    saveSite(site);
    renderAddonsEditor(site);
    adminFlash('addonMsg','✓ Add-ons saved');
  });

  document.getElementById('addAddon').addEventListener('click',()=>{
    if(!site.addons) site.addons=[];
    site.addons.push({title:'New Add-on',desc:'Description',rate:'₹0'});
    renderAddonsEditor(site);
  });

  document.getElementById('addonEdit').addEventListener('click',e=>{
    if(e.target.closest('.addon-del')){
      const i = +e.target.closest('.admin-row-card').dataset.i;
      site.addons.splice(i,1);
      renderAddonsEditor(site);
    }
  });

  document.getElementById('saveCompany').addEventListener('click',()=>{
    collectCompany(site);
    saveSite(site);
    adminFlash('coMsg','✓ Company info saved');
  });

  document.getElementById('clearReq').addEventListener('click',()=>{
    if(confirm('Delete all estimate requests?')){clearEstimateRequests();renderRequests();}
  });

  document.getElementById('exportReq').addEventListener('click',()=>exportEstimateRequests());
  document.getElementById('exportSite').addEventListener('click',()=>exportSiteData(site));

  document.getElementById('importSite').addEventListener('change',async e=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async ()=>{
      try{
        const imported = JSON.parse(reader.result);
        if(!imported.packages) throw new Error('Invalid backup file');
        const defaults = await fetchDefaults();
        Object.assign(site, mergeSiteData(defaults, imported));
        saveSite(site);
        reload();
        alert('Backup imported successfully.');
      }catch(err){alert('Could not import: ' + err.message);}
    };
    reader.readAsText(file);
    e.target.value='';
  });

  document.getElementById('savePrj').addEventListener('click',()=>{
    collectProjects(site);
    saveSite(site);
    renderProjectsEditor(site);
    adminFlash('prjMsg','✓ Projects saved');
  });

  document.getElementById('prjEdit').addEventListener('click',e=>{
    const add = e.target.closest('.prj-add');
    if(add){
      collectProjects(site);
      const k = add.dataset.section;
      if(!site.projects[k]) site.projects[k]=[];
      site.projects[k].push({img:'images/', title:'New Project', desc:'Description here'});
      renderProjectsEditor(site);
      return;
    }
    const del = e.target.closest('.prj-del');
    if(del){
      collectProjects(site);
      const card = del.closest('.admin-img-card');
      const k = card.dataset.section;
      site.projects[k].splice(+card.dataset.i, 1);
      renderProjectsEditor(site);
    }
  });

  document.getElementById('prjEdit').addEventListener('input',e=>{
    if(e.target.classList.contains('prj-img')) updateAdminPreview(e.target);
  });

  document.getElementById('saveGal').addEventListener('click',()=>{
    collectGallery(site);
    saveSite(site);
    renderGalleryEditor(site);
    adminFlash('galMsg','✓ Gallery saved');
  });

  document.getElementById('galEdit').addEventListener('click',e=>{
    const add = e.target.closest('.gal-add');
    if(add){
      collectGallery(site);
      const k = add.dataset.section;
      if(!site.gallery[k]) site.gallery[k]=[];
      site.gallery[k].push('images/');
      renderGalleryEditor(site);
      return;
    }
    const del = e.target.closest('.gal-del');
    if(del){
      collectGallery(site);
      const card = del.closest('.admin-img-card');
      const k = card.dataset.section;
      site.gallery[k].splice(+card.dataset.i, 1);
      renderGalleryEditor(site);
    }
  });

  document.getElementById('galEdit').addEventListener('input',e=>{
    if(e.target.classList.contains('gal-img')) updateAdminPreview(e.target);
  });
}
