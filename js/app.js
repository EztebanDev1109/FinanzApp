//===VARIABLES DE COLORES DE  PARA CADA CATEGORIA===
    
const CAT_COLORS={//Este es un objeto donde estan los colores de las categorias
    'Alimentación':'#ef4444','Compras':'#f97316','Servicios':'#06b6d4',
    'Salud':'#3b82f6','Transporte':'#f59e0b','Entretenimiento':'#ec4899',
    'Freelance':'#8b5cf6','Salario':'#16a34a','Otro':'#6b7280'
};


//===FUNCIONES PARA GUARDAR DATOS===

//Esta funcion busca los datos guardados en el navegador. Si existen, los devuelve,Si no existne, toma los de por defecto
function load(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}} 

//Guarda  datos en el navegador
function save(k,v){localStorage.setItem(k,JSON.stringify(v));}


//===Lista de los movimientos financieros===
let transactions=load('fnz2_tx',[
    {id:1,desc:'Ropa',monto:300000,tipo:'gasto',cat:'Compras',fecha:'2026-04-22'},
    {id:2,desc:'Farmacia',monto:85000,tipo:'gasto',cat:'Salud',fecha:'2026-04-20'},
    {id:3,desc:'Luz y agua',monto:210000,tipo:'gasto',cat:'Servicios',fecha:'2026-04-18'},
    {id:4,desc:'Proyecto web',monto:1500000,tipo:'ingreso',cat:'Freelance',fecha:'2026-04-15'},
    {id:5,desc:'Cine y cena',monto:95000,tipo:'gasto',cat:'Entretenimiento',fecha:'2026-04-12'},
    {id:6,desc:'Mercado semanal',monto:280000,tipo:'gasto',cat:'Alimentación',fecha:'2026-04-10'},
    {id:7,desc:'Salario mensual',monto:4500000,tipo:'ingreso',cat:'Salario',fecha:'2026-04-01'},
    {id:8,desc:'Transmilenio',monto:120000,tipo:'gasto',cat:'Transporte',fecha:'2026-04-08'},
    {id:9,desc:'Supermercado',monto:320000,tipo:'gasto',cat:'Alimentación',fecha:'2026-04-05'},
    {id:10,desc:'Internet',monto:75000,tipo:'gasto',cat:'Servicios',fecha:'2026-04-03'},
    {id:11,desc:'Bus intermunicipal',monto:45000,tipo:'gasto',cat:'Transporte',fecha:'2026-04-02'},
    {id:12,desc:'Zapatos',monto:180000,tipo:'gasto',cat:'Compras',fecha:'2026-04-01'},
]);

let budgets=load('fnz2_budgets',[
    {id:1,cat:'Alimentación',limite:800000},
    {id:2,cat:'Transporte',limite:300000},
    {id:3,cat:'Entretenimiento',limite:200000},
    {id:4,cat:'Servicios',limite:350000},
    {id:5,cat:'Compras',limite:500000},
]);

let metas=load('fnz2_metas',[
    {id:1,nombre:'Fondo de emergencia',total:10000000,actual:4500000,fecha:'2026-12-31'},
    {id:2,nombre:'Vacaciones',total:5000000,actual:2000000,fecha:'2026-08-01'},
    {id:3,nombre:'Laptop nueva',total:3500000,actual:1800000,fecha:'2026-06-15'},
]);

let nextId=load('fnz2_nid',100);
let agTarget=null;



//=== Sidebar mobile ===
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebarToggle = document.getElementById('sidebar-toggle');

function openSidebar(){
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeSidebar(){
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

sidebarToggle.addEventListener('click', openSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

//=== Nav ===
document.querySelectorAll('.nav-item').forEach(el=>{
    el.addEventListener('click',()=>{
    document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
    el.classList.add('active');
    el.setAttribute('aria-current','page');
    document.getElementById('page-'+el.dataset.page).classList.add('active');
    closeSidebar();
    renderAll();
    });
});

// MODALS
function openModal(t){
    if(t==='tx'){document.getElementById('tx-fecha').value=today();}
    document.getElementById('modal-'+t).classList.add('open');
}
function closeModal(t){document.getElementById('modal-'+t).classList.remove('open');}
document.querySelectorAll('.modal-overlay').forEach(m=>{
    m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');});
});

function today(){return new Date().toISOString().split('T')[0];}

// SAVE TX
function saveTx(){
    const desc=document.getElementById('tx-desc').value.trim();
    const monto=parseCOP(document.getElementById('tx-monto').value);
    const tipo=document.getElementById('tx-tipo').value;
    const cat=document.getElementById('tx-cat').value;
    const fecha=document.getElementById('tx-fecha').value;
    if(!desc||!monto||monto<=0||!fecha){alert('Completa todos los campos correctamente.');return;}
    transactions.unshift({id:nextId++,desc,monto,tipo,cat,fecha});
    save('fnz2_tx',transactions);save('fnz2_nid',nextId);
    document.getElementById('tx-desc').value='';
    document.getElementById('tx-monto').value='';
    document.getElementById('tx-preview').textContent='';
    closeModal('tx');renderAll();
}

// SAVE BUDGET
function saveBudget(){
    const cat=document.getElementById('b-cat').value;
    const limite=parseCOP(document.getElementById('b-limite').value);
    if(!limite||limite<=0){alert('Ingresa un límite válido.');return;}
    const idx=budgets.findIndex(b=>b.cat===cat);
    if(idx>=0){budgets[idx].limite=limite;}
    else{budgets.push({id:nextId++,cat,limite});}
    save('fnz2_budgets',budgets);save('fnz2_nid',nextId);
    document.getElementById('b-limite').value='';
    document.getElementById('b-preview').textContent='';
    closeModal('budget');renderAll();
}

// SAVE META
function saveMeta(){
    const nombre=document.getElementById('m-nombre').value.trim();
    const total=parseCOP(document.getElementById('m-total').value);
    const actual=parseCOP(document.getElementById('m-actual').value)||0;
    const fecha=document.getElementById('m-fecha').value;
    if(!nombre||!total||total<=0||!fecha){alert('Completa todos los campos correctamente.');return;}
    metas.push({id:nextId++,nombre,total,actual:Math.min(actual,total),fecha});
    save('fnz2_metas',metas);save('fnz2_nid',nextId);
    ['m-nombre','m-total','m-actual','m-fecha'].forEach(id=>document.getElementById(id).value='');
    ['m-total-prev','m-actual-prev'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent='';});
    closeModal('meta');renderAll();
}

// AGREGAR A META
function openAgregar(id){
    agTarget=id;
    const m=metas.find(x=>x.id===id);
    document.getElementById('ag-title').textContent='Agregar a: '+m.nombre;
    document.getElementById('ag-monto').value='';
    openModal('agregar');
}
function saveAgregar(){
    const monto=parseCOP(document.getElementById('ag-monto').value);
    if(!monto||monto<=0){alert('Monto inválido.');return;}
    const m=metas.find(x=>x.id===agTarget);
    if(m){m.actual=Math.round(Math.min(m.actual+monto,m.total));save('fnz2_metas',metas);}
    document.getElementById('ag-preview').textContent='';
    closeModal('agregar');renderAll();
}

// DELETE
function deleteTx(id){if(!confirm('¿Eliminar esta transacción?'))return;transactions=transactions.filter(t=>t.id!==id);save('fnz2_tx',transactions);renderAll();}
function deleteBudget(id){if(!confirm('¿Eliminar este presupuesto?'))return;budgets=budgets.filter(b=>b.id!==id);save('fnz2_budgets',budgets);renderAll();}
function deleteMeta(id){if(!confirm('¿Eliminar esta meta?'))return;metas=metas.filter(m=>m.id!==id);save('fnz2_metas',metas);renderAll();}

// FORMAT COP
function fmt(n){
    return'$\u00a0'+Math.abs(Math.round(n)).toLocaleString('es-CO');
}
function parseCOP(str){
    // acepta: 50000 / 50.000 / 50,000 / 1.500.000
    const clean=str.replace(/[\s.]/g,'').replace(',','.');
    const n=parseFloat(clean);
    return isNaN(n)?0:n;
}
function previewCOP(input,previewId){
    const raw=input.value;
    const n=parseCOP(raw);
    const el=document.getElementById(previewId);
    if(!el)return;
    if(n>0){el.textContent=fmt(n)+' COP';el.style.color='#16a34a';}
    else{el.textContent='';}
}
function fmtDate(s){const d=new Date(s+'T12:00:00');return d.toLocaleDateString('es',{day:'numeric',month:'short',year:'numeric'});}
function daysLeft(s){const d=new Date(s+'T12:00:00');const now=new Date();const diff=Math.round((d-now)/(86400000));return diff>0?diff+' días restantes':'Vencido';}

// STATS
function getStats(){
    const ingresos=transactions.filter(t=>t.tipo==='ingreso').reduce((a,t)=>a+t.monto,0);
    const gastos=transactions.filter(t=>t.tipo==='gasto').reduce((a,t)=>a+t.monto,0);
    return{ingresos,gastos,balance:ingresos-gastos,ahorros:metas.reduce((a,m)=>a+m.actual,0)};
}
function getGastosCat(){
    const map={};
    transactions.filter(t=>t.tipo==='gasto').forEach(t=>{map[t.cat]=(map[t.cat]||0)+t.monto;});
    return map;
}
function getGastoBudget(cat){
    return transactions.filter(t=>t.tipo==='gasto'&&t.cat===cat).reduce((a,t)=>a+t.monto,0);
}

// DASHBOARD
function renderDashboard(){
    const s=getStats();
    document.getElementById('d-ingresos').textContent=fmt(s.ingresos);
    document.getElementById('d-gastos').textContent=fmt(s.gastos);
    document.getElementById('d-balance').textContent=fmt(s.balance);
    document.getElementById('d-balance').className='stat-value '+(s.balance>=0?'stat-blue':'stat-red');
    document.getElementById('d-ahorros').textContent=fmt(s.ahorros);
    drawDonut();

    const bl=document.getElementById('d-budget-list');
    if(budgets.length===0){bl.innerHTML='<div style="color:#9ca3af;font-size:13px;text-align:center;padding:20px">Sin presupuestos creados</div>';return;}
    bl.innerHTML=budgets.slice(0,5).map(b=>{
    const g=getGastoBudget(b.cat);
    const pct=Math.min(100,Math.round(g/b.limite*100));
    const c=pct>=90?'#dc2626':pct>=70?'#d97706':'#16a34a';
    return`<div><div class="budget-row-top"><span class="budget-name">${b.cat}</span><span class="budget-amounts">${fmt(g)} / ${fmt(b.limite)}</span></div><div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%;background:${c}"></div></div></div>`;
    }).join('');

    const rl=document.getElementById('d-recent-list');
    const rec=transactions.slice(0,5);
    if(rec.length===0){rl.innerHTML='<div class="empty"><p>Sin transacciones aún</p></div>';return;}
    rl.innerHTML='<div class="tx-list">'+rec.map(t=>txHTML(t,true)).join('')+'</div>';
}

// DONUT
function drawDonut(){
    const canvas=document.getElementById('donut-canvas');
    const ctx=canvas.getContext('2d');
    const gc=getGastosCat();
    const cats=Object.keys(gc);
    const vals=cats.map(c=>gc[c]);
    const total=vals.reduce((a,v)=>a+v,0);
    ctx.clearRect(0,0,220,220);
    const leg=document.getElementById('donut-legend');
    if(total===0){
    ctx.fillStyle='#e5e7eb';ctx.beginPath();ctx.arc(110,110,85,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#f0f2f5';ctx.beginPath();ctx.arc(110,110,50,0,Math.PI*2);ctx.fill();
    leg.innerHTML='<span style="font-size:12px;color:#9ca3af">Sin gastos registrados</span>';
    return;
    }
    let angle=-Math.PI/2;
    cats.forEach((cat,i)=>{
    const slice=(vals[i]/total)*(Math.PI*2);
    ctx.beginPath();ctx.moveTo(110,110);
    ctx.arc(110,110,88,angle,angle+slice);ctx.closePath();
    ctx.fillStyle=CAT_COLORS[cat]||'#6b7280';ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();
    angle+=slice;
    });
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(110,110,52,0,Math.PI*2);ctx.fill();
    leg.innerHTML=cats.map(c=>`<div class="legend-item"><div class="legend-dot" style="background:${CAT_COLORS[c]||'#6b7280'}"></div>${c}</div>`).join('');
}

// TX HTML
function txHTML(t,mini){
    const isGasto=t.tipo==='gasto';
    const color=CAT_COLORS[t.cat]||'#6b7280';
    const arrowUp=`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`;
    const arrowDown=`<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><line x1="17" y1="17" x2="7" y2="7"/><polyline points="17 7 7 7 7 17"/></svg>`;
    const del=mini?'':` <button class="tx-del" onclick="deleteTx(${t.id})"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>`;
    return`<div class="tx-item">
    <div class="tx-icon" style="background:${color}22;color:${color}">${isGasto?arrowUp:arrowDown}</div>
    <div class="tx-info">
        <div class="tx-name">${t.desc}</div>
        <div class="tx-meta">
        <span class="tx-cat" style="background:${color}22;color:${color}">${t.cat}</span>
        <span class="tx-date">• ${fmtDate(t.fecha)}</span>
        </div>
    </div>
    <span class="tx-amount" style="color:${isGasto?'#dc2626':'#16a34a'}">${isGasto?'-':'+'}${fmt(t.monto)}</span>
    ${del}
    </div>`;
}

function renderTransacciones(){
    const list=document.getElementById('tx-list');
    if(transactions.length===0){
    list.innerHTML=`<div class="empty"><svg viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg><p>No hay transacciones. ¡Agrega una!</p></div>`;
    return;
    }
    list.innerHTML=transactions.map(t=>txHTML(t,false)).join('');
}

// PRESUPUESTOS
function renderPresupuestos(){
    const grid=document.getElementById('budget-grid');
    if(budgets.length===0){
    grid.innerHTML=`<div class="empty" style="grid-column:1/-1"><svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg><p>No hay presupuestos. ¡Crea uno!</p></div>`;
    return;
    }
    grid.innerHTML=budgets.map(b=>{
    const g=getGastoBudget(b.cat);
    const pct=Math.min(100,Math.round(g/b.limite*100));
    const restante=b.limite-g;
    const color=CAT_COLORS[b.cat]||'#6b7280';
    const barColor=pct>=100?'#dc2626':pct>=70?'#d97706':'#16a34a';
    let status='';
    const checkIcon=`<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    const warnIcon=`<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    const errIcon=`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    if(pct>=100)status=`<span class="budget-status st-over">${errIcon}Límite excedido</span>`;
    else if(pct>=70)status=`<span class="budget-status st-warn">${warnIcon}Cerca del límite</span>`;
    else status=`<span class="budget-status st-ok">${checkIcon}En orden</span>`;
    const trashIcon=`<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
    return`<div class="budget-card">
        <div class="budget-card-header">
        <div class="budget-card-name"><div class="cat-dot" style="background:${color}"></div>${b.cat}</div>
        <button class="icon-btn" onclick="deleteBudget(${b.id})">${trashIcon}</button>
        </div>
        <div class="budget-row2"><span>Gastado</span><span style="font-weight:500;color:#111827">${fmt(g)} / ${fmt(b.limite)}</span></div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
        ${status}
        <span class="budget-remaining">${restante>=0?fmt(restante)+' restante':'Excedido'}</span>
        </div>
    </div>`;
    }).join('');
}

// METAS
function renderMetas(){
    const grid=document.getElementById('metas-grid');
    if(metas.length===0){
    grid.innerHTML=`<div class="empty" style="grid-column:1/-1"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg><p>No hay metas. ¡Crea una!</p></div>`;
    return;
    }
    const trashIcon=`<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
    const trendIcon=`<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:#9ca3af;fill:none;stroke-width:2;stroke-linecap:round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;
    const calIcon=`<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:#9ca3af;fill:none;stroke-width:2;stroke-linecap:round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
    const plusIcon=`<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
    grid.innerHTML=metas.map(m=>{
    const pct=Math.min(100,Math.round(m.actual/m.total*100));
    const restante=m.total-m.actual;
    const completed=pct>=100;
    return`<div class="meta-card">
        <div class="meta-header">
        <div class="meta-name"><span style="font-size:18px">🎯</span>${m.nombre}</div>
        <button class="icon-btn" onclick="deleteMeta(${m.id})">${trashIcon}</button>
        </div>
        <div class="meta-progress-row"><span>Progreso</span><span class="meta-pct">${pct}%</span></div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%;background:${completed?'#16a34a':'#16a34a'}"></div></div>
        <div class="meta-info">
        <div class="meta-info-row">${trendIcon}<span>${fmt(m.actual)} / ${fmt(m.total)}</span></div>
        <div style="display:flex;justify-content:space-between;align-items:center">
            <div class="meta-info-row">${calIcon}<span>${fmtDate(m.fecha)}</span></div>
            <span style="font-size:12px;color:#9ca3af">${daysLeft(m.fecha)}</span>
        </div>
        ${completed
            ?'<div style="font-size:12px;color:#16a34a;font-weight:500">¡Meta alcanzada! 🎉</div>'
            :`<div style="font-size:12px;color:#9ca3af">Faltan ${fmt(restante)} para la meta</div>`
        }
        </div>
        <button class="btn-agregar" onclick="openAgregar(${m.id})">${plusIcon} Agregar</button>
    </div>`;
    }).join('');
}

function renderAll(){
    renderDashboard();
    renderTransacciones();
    renderPresupuestos();
    renderMetas();
}

renderAll();