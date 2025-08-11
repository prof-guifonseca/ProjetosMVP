
// Connect3 - Gestão de Projetos (SPA leve, sem backend)
// Mantém o visual claro alinhado à landing e adiciona: filtros, ordenação,
// grid/kanban, drag & drop, detalhes do projeto, exportação CSV, import JSON
// e persistência em localStorage.

const SKEY = "connect3_app_state_v2";

// Dados de referência
const sistemaDados = {
  tiposParceria: [
    { id: "colaboracao", nome: "Termo de Colaboração" },
    { id: "fomento", nome: "Termo de Fomento" },
    { id: "cooperacao", nome: "Acordo de Cooperação" },
  ],
  categorias: [
    { nome: "Recursos Humanos", orcado: 60000, executado: 35000 },
    { nome: "Materiais e Insumos", orcado: 30000, executado: 18000 },
    { nome: "Equipamentos", orcado: 22500, executado: 8500 },
    { nome: "Infraestrutura", orcado: 15000, executado: 12000 },
    { nome: "Capacitação", orcado: 12000, executado: 7500 },
    { nome: "Outras Despesas", orcado: 10500, executado: 8000 },
  ],
};

// Estado
let appState = loadState() || {
  projetos: [
    {
      id: 1,
      nome: "Apoio às Famílias Vulneráveis",
      tipo_parceria: "colaboracao",
      status: "Em Andamento",
      orcamento_total: 150000,
      orcamento_executado: 89000,
      beneficiarios_meta: 200,
      beneficiarios_atual: 156,
      inicio: "2025-01-15",
      fim: "2025-12-15",
      progresso: 65,
    },
    {
      id: 2,
      nome: "Programa de Capacitação Profissional",
      tipo_parceria: "fomento",
      status: "Planejamento",
      orcamento_total: 85000,
      orcamento_executado: 0,
      beneficiarios_meta: 80,
      beneficiarios_atual: 0,
      inicio: "2025-03-01",
      fim: "2025-11-30",
      progresso: 15,
    },
  ],
  atividades: [
    { nome: "Prestação de Contas - Projeto Famílias", data: "2025-08-15", tipo: "prestacao_contas" },
    { nome: "Reunião de Monitoramento", data: "2025-08-20", tipo: "monitoramento" },
    { nome: "Capacitação de Voluntários", data: "2025-09-10", tipo: "capacitacao" },
  ],
  indicadores: [
    { nome: "Famílias Atendidas", atual: 156, meta: 200, unidade: "famílias" },
    { nome: "Atendimentos Realizados", atual: 489, meta: 600, unidade: "atendimentos" },
    { nome: "Taxa de Satisfação", atual: 4.2, meta: 4.5, unidade: "estrelas" },
  ],
  beneficiarios: [
    { id: 1, nome: "Maria das Graças Silva", cpf: "123.456.789-00", projeto: "Apoio às Famílias Vulneráveis", cadastro: "2025-02-15" },
    { id: 2, nome: "João Santos Oliveira", cpf: "987.654.321-00", projeto: "Apoio às Famílias Vulneráveis", cadastro: "2025-03-10" },
    { id: 3, nome: "Ana Paula Costa", cpf: "456.789.123-00", projeto: "Apoio às Famílias Vulneráveis", cadastro: "2025-04-05" },
  ],
  parcerias: [
    { id: 1, orgao: "Secretaria Municipal de Assistência Social", tipo: "colaboracao", objeto: "Atendimento a famílias em situação de vulnerabilidade social", status: "Ativo" },
    { id: 2, orgao: "Secretaria Estadual de Desenvolvimento Social", tipo: "fomento", objeto: "Programa de capacitação profissional para jovens", status: "Em análise" },
  ],
  reports: [
    { data: "2025-08-15", titulo: "Prestação de Contas - Projeto Famílias", descricao: "Relatório trimestral de execução física e financeira" },
    { data: "2025-09-30", titulo: "Relatório de Indicadores", descricao: "Monitoramento de metas e resultados alcançados" },
    { data: "2025-10-15", titulo: "Prestação de Contas - Capacitação", descricao: "Relatório de atividades do programa de capacitação" },
  ],
};

// Helpers
function saveState() {
  localStorage.setItem(SKEY, JSON.stringify(appState));
  toast("Dados salvos.");
}
function loadState() {
  try { return JSON.parse(localStorage.getItem(SKEY)); } catch { return null; }
}
function currency(v){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v||0)}
function formatDate(d){return new Date(d).toLocaleDateString('pt-BR')}
function byId(id){return document.getElementById(id)}

// Init
document.addEventListener('DOMContentLoaded', () => {
  // Navegação superior
  document.querySelectorAll('.topnav__link').forEach(btn => {
    btn.addEventListener('click', () => switchModule(btn.dataset.module, btn));
  });

  // Ações
  byId('btnSalvarEstado').addEventListener('click', saveState);
  byId('btnImportar').addEventListener('click', () => byId('importJson').click());
  byId('importJson').addEventListener('change', importJson);
  byId('btnNovoProjeto').addEventListener('click', () => showDialog('novoProjetoModal'));
  byId('btnNovaParceria').addEventListener('click', () => showDialog('novaParceriaModal'));
  byId('btnNovoBeneficiario').addEventListener('click', () => showDialog('novoBeneficiarioModal'));
  byId('btnGerarRelatorio').addEventListener('click', () => alert('Relatório gerado com sucesso (fictício).'));
  byId('btnExportarCsv').addEventListener('click', exportCsv);

  // View toggles
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchProjectsView(btn.dataset.view, btn));
  });

  // Filtros e buscas de projetos
  ['buscaProjeto','filtroStatus','filtroTipo','ordenacao'].forEach(id => {
    const el = byId(id);
    el && el.addEventListener('input', renderProjects);
  });

  byId('buscaBenef').addEventListener('input', renderBeneficiarios);

  // Forms
  byId('novoProjetoForm').addEventListener('submit', handleNewProject);
  byId('editProjetoForm').addEventListener('submit', handleEditProjeto);
  byId('novaParceriaForm').addEventListener('submit', handleNewParceria);
  byId('novoBeneficiarioForm').addEventListener('submit', handleNewBeneficiario);
  byId('editBeneficiarioForm').addEventListener('submit', handleEditBeneficiario);

  // Theme
  byId('btnTheme').addEventListener('click', toggleTheme);

  // Primeira renderização
  updateDashboard();
  renderProjects();
  renderParceriasList();
  renderBudgetData();
  renderBeneficiarios();
  renderIndicators();
  renderReportsTimeline();
  fillBeneficiarioProjetoSelects();
});

function toggleTheme(){
  const body = document.body;
  const isLight = body.getAttribute('data-color-scheme') === 'light';
  body.setAttribute('data-color-scheme', isLight ? 'dark' : 'light');
  const icon = byId('btnTheme').querySelector('i');
  icon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
}

/* Navegação */
function switchModule(moduleId, btn){
  document.querySelectorAll('.module').forEach(m => m.classList.remove('is-active'));
  byId(`${moduleId}-module`).classList.add('is-active');
  document.querySelectorAll('.topnav__link').forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');

  // Atualizações específicas
  if (moduleId === 'dashboard') updateDashboard();
  if (moduleId === 'projetos') renderProjects();
}

/* Dashboard */
let charts = {};
function updateDashboard(){
  byId('totalProjetos').textContent = appState.projetos.length;
  const orcTotal = appState.projetos.reduce((s,p)=>s+(p.orcamento_total||0),0);
  byId('orcamentoTotal').textContent = currency(orcTotal);
  const benefTotal = appState.projetos.reduce((s,p)=>s+(p.beneficiarios_atual||0),0);
  byId('beneficiariosTotal').textContent = benefTotal;
  const progMedio = appState.projetos.length ? Math.round(appState.projetos.reduce((s,p)=>s+(p.progresso||0),0)/appState.projetos.length) : 0;
  byId('progressoMedio').textContent = progMedio + '%';

  renderDashboardCharts();
  renderProximasAtividades();
}

function renderDashboardCharts(){
  const c1 = byId('orcamentoChart');
  if (c1){
    charts.orc && charts.orc.destroy();
    charts.orc = new Chart(c1.getContext('2d'), {
      type: 'bar',
      data: {
        labels: appState.projetos.map(p=>p.nome),
        datasets: [
          {label:'Orçado', data: appState.projetos.map(p=>p.orcamento_total), backgroundColor:'#1FB8CD'},
          {label:'Executado', data: appState.projetos.map(p=>p.orcamento_executado), backgroundColor:'#FFC185'}
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position:'bottom' },
          tooltip: { callbacks: { label: (ctx)=> `${ctx.dataset.label}: ${currency(ctx.parsed.y)}` } }
        },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  const c2 = byId('beneficiariosChart');
  if (c2){
    charts.ben && charts.ben.destroy();
    charts.ben = new Chart(c2.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: appState.projetos.map(p=>p.nome),
        datasets: [{ data: appState.projetos.map(p=>p.beneficiarios_atual||0) }]
      },
      options: { responsive: true, plugins: { legend:{position:'bottom'} } }
    });
  }
}

function renderProximasAtividades(){
  const c = byId('proximas-atividades');
  if (!c) return;
  c.innerHTML = '';
  const sorted = [...appState.atividades].sort((a,b)=> new Date(a.data) - new Date(b.data));
  sorted.forEach(a=>{
    const el = document.createElement('div');
    el.className = 'activity-item';
    el.innerHTML = `<div>
      <div class="activity-name">${a.nome}</div>
      <div class="activity-type">${tipoAtividadeLabel(a.tipo)}</div>
    </div>
    <div class="activity-date">${formatDate(a.data)}</div>`;
    c.appendChild(el);
  })
}
function tipoAtividadeLabel(t){
  return ({prestacao_contas:'Prestação de Contas',monitoramento:'Monitoramento',capacitacao:'Capacitação'})[t] || t;
}

/* Projetos */
let currentProjectsView = 'grid';
function switchProjectsView(view, btn){
  currentProjectsView = view;
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('is-active'));
  btn.classList.add('is-active');
  byId('viewGrid').classList.toggle('hidden', view!=='grid');
  byId('viewKanban').classList.toggle('hidden', view!=='kanban');
  renderProjects();
}

function filteredSortedProjects(){
  const q = byId('buscaProjeto').value.trim().toLowerCase();
  const st = byId('filtroStatus').value;
  const tp = byId('filtroTipo').value;
  const ord = byId('ordenacao').value;

  let items = appState.projetos.filter(p => {
    const okQ = !q || p.nome.toLowerCase().includes(q);
    const okS = !st || p.status === st;
    const okT = !tp || p.tipo_parceria === tp;
    return okQ && okS && okT;
  });

  const sorters = {
    'nome-asc': (a,b)=> a.nome.localeCompare(b.nome),
    'nome-desc': (a,b)=> b.nome.localeCompare(a.nome),
    'orcamento-desc': (a,b)=> (b.orcamento_total||0)-(a.orcamento_total||0),
    'progresso-desc': (a,b)=> (b.progresso||0)-(a.progresso||0),
  };
  items.sort(sorters[ord] || sorters['nome-asc']);
  return items;
}

function renderProjects(){
  const items = filteredSortedProjects();
  // Grid
  const grid = byId('viewGrid');
  grid.innerHTML='';
  items.forEach(p=> grid.appendChild(projectCard(p)));
  // Kanban
  ['planejamento','em-andamento','concluido','cancelado'].forEach(id=> byId('col-'+id).innerHTML='');
  items.forEach(p=>{
    const id = (p.status||'').toLowerCase().replace(' ', '-');
    const map = { 'planejamento':'col-planejamento','em-andamento':'col-em-andamento','concluído':'col-concluido','concluido':'col-concluido','cancelado':'col-cancelado' };
    const colId = map[id] || 'col-planejamento';
    byId(colId).appendChild(kanbanCard(p));
  });
  enableDnD();
}

function projectCard(p){
  const el = document.createElement('article');
  el.className='project-card';
  el.innerHTML = `
    <div class="project-header">
      <h3 class="project-title">${p.nome}</h3>
      <span class="project-status ${p.status}">${p.status}</span>
    </div>
    <div class="project-meta">
      <div><small>Executado</small><div class="project-metric-value">${currency(p.orcamento_executado)}</div><small>de ${currency(p.orcamento_total)}</small></div>
      <div><small>Beneficiários</small><div class="project-metric-value">${p.beneficiarios_atual}</div><small>de ${p.beneficiarios_meta}</small></div>
    </div>
    <div class="progress"><div class="progress__bar" style="width:${p.progresso||0}%"></div></div>
    <div class="project-actions">
      <button class="btn btn--outline btn--sm" aria-label="Editar" title="Editar"><i class="fa-solid fa-pen"></i></button>
      <button class="btn btn--primary btn--sm" aria-label="Ver detalhes" title="Ver detalhes"><i class="fa-solid fa-eye"></i></button>
    </div>`;
  const [btnEdit, btnView] = el.querySelectorAll('button');
  btnEdit.addEventListener('click', ()=> openEditProject(p.id));
  btnView.addEventListener('click', ()=> openViewProject(p.id));
  return el;
}

function kanbanCard(p){
  const el = document.createElement('div');
  el.className='kanban__card';
  el.setAttribute('draggable','true');
  el.dataset.id = p.id;
  el.innerHTML = `<strong>${p.nome}</strong><br><small>${p.beneficiarios_atual}/${p.beneficiarios_meta} • ${currency(p.orcamento_executado)}</small>`;
  el.addEventListener('dblclick', ()=> openViewProject(p.id));
  return el;
}

function enableDnD(){
  document.querySelectorAll('.kanban__card').forEach(card=>{
    card.addEventListener('dragstart', e=> e.dataTransfer.setData('text/plain', card.dataset.id));
  });
  document.querySelectorAll('.kanban__list').forEach(list=>{
    list.addEventListener('dragover', e=> { e.preventDefault(); list.classList.add('drag-over'); });
    list.addEventListener('dragleave', ()=> list.classList.remove('drag-over'));
    list.addEventListener('drop', e=>{
      e.preventDefault();
      list.classList.remove('drag-over');
      const id = Number(e.dataTransfer.getData('text/plain'));
      const p = appState.projetos.find(x=>x.id===id);
      if (!p) return;
      const statusMap = {
        'col-planejamento': 'Planejamento',
        'col-em-andamento': 'Em Andamento',
        'col-concluido': 'Concluído',
        'col-cancelado': 'Cancelado'
      };
      const newStatus = statusMap[list.id];
      p.status = newStatus;
      if (newStatus === 'Concluído') p.progresso = 100;
      saveState();
      renderProjects();
      updateDashboard();
      toast('Status atualizado.');
    });
  });
}

/* CRUD Projetos */
function showDialog(id){ const d=byId(id); d.showModal(); return d; }

function handleNewProject(e){
  e.preventDefault();
  const form = e.target;
  const [nomeEl, tipoEl, orcEl, metaEl] = form.querySelectorAll('input,select');
  const nome = nomeEl.value.trim();
  const tipo = tipoEl.value;
  const orc = Number(orcEl.value);
  const meta = Number(metaEl.value);
  if(!nome || !tipo || !orc || !meta) return;
  appState.projetos.push({
    id: Date.now(), nome, tipo_parceria: tipo, status:'Planejamento',
    orcamento_total: orc, orcamento_executado: 0, beneficiarios_meta: meta, beneficiarios_atual: 0,
    inicio: new Date().toISOString().slice(0,10), fim:'', progresso: 0
  });
  form.close(); form.reset();
  saveState(); renderProjects(); updateDashboard(); fillBeneficiarioProjetoSelects();
  toast('Projeto criado.');
}

function openEditProject(id){
  const p = appState.projetos.find(x=>x.id===id); if(!p) return;
  const d = showDialog('editProjetoModal');
  d.dataset.id = id;
  byId('editNomeProjeto').value = p.nome;
  byId('editTipoParceria').value = p.tipo_parceria;
  byId('editStatus').value = p.status;
  byId('editOrcTotal').value = p.orcamento_total;
  byId('editOrcExec').value = p.orcamento_executado;
  byId('editMetaBenef').value = p.beneficiarios_meta;
  byId('editAtualBenef').value = p.beneficiarios_atual;
}
function handleEditProjeto(e){
  e.preventDefault();
  const d = byId('editProjetoModal');
  const id = Number(d.dataset.id);
  const p = appState.projetos.find(x=>x.id===id); if(!p) return;
  p.nome = byId('editNomeProjeto').value.trim();
  p.tipo_parceria = byId('editTipoParceria').value;
  p.status = byId('editStatus').value;
  p.orcamento_total = Number(byId('editOrcTotal').value);
  p.orcamento_executado = Number(byId('editOrcExec').value);
  p.beneficiarios_meta = Number(byId('editMetaBenef').value);
  p.beneficiarios_atual = Number(byId('editAtualBenef').value);
  p.progresso = p.beneficiarios_meta ? Math.min(100, Math.round((p.beneficiarios_atual/p.beneficiarios_meta)*100)) : 0;
  d.close();
  saveState(); renderProjects(); updateDashboard();
  toast('Projeto atualizado.');
}

function openViewProject(id){
  const p = appState.projetos.find(x=>x.id===id); if(!p) return;
  byId('viewProjetoTitulo').textContent = p.nome;
  byId('viewProjetoBody').innerHTML = `
    <div class="grid-2">
      <div class="card">
        <strong>Status:</strong> <span class="badge--success">${p.status}</span><br>
        <strong>Tipo:</strong> ${labelTipo(p.tipo_parceria)}<br>
        <strong>Período:</strong> ${formatDate(p.inicio)} – ${p.fim ? formatDate(p.fim) : '—'}
      </div>
      <div class="card">
        <strong>Orçamento:</strong> ${currency(p.orcamento_total)}<br>
        <strong>Executado:</strong> ${currency(p.orcamento_executado)}<br>
        <div class="progress" style="margin-top:8px"><div class="progress__bar" style="width:${p.progresso||0}%"></div></div>
        <small>Progresso estimado: ${p.progresso||0}%</small>
      </div>
    </div>
    <div class="card" style="margin-top:12px">
      <strong>Beneficiários:</strong> ${p.beneficiarios_atual} de ${p.beneficiarios_meta}
    </div>`;
  showDialog('viewProjetoModal');
}

function labelTipo(id){
  return (sistemaDados.tiposParceria.find(t=>t.id===id)||{}).nome || id;
}

/* Parcerias */
function renderParceriasList(){
  const list = byId('parceriasList'); list.innerHTML='';
  appState.parcerias.forEach(x=>{
    const div = document.createElement('div');
    div.className='parceria-item';
    div.innerHTML = `<div>
      <h4>${x.orgao}</h4>
      <div><small><strong>Tipo:</strong> ${labelTipo(x.tipo)}</small></div>
      <div><small><strong>Objeto:</strong> ${x.objeto}</small></div>
    </div>
    <span class="badge--success">${x.status}</span>`;
    list.appendChild(div);
  });
}

/* Orçamento */
function renderBudgetData(){
  const c = byId('budgetChart');
  if(c){
    const ctx = c.getContext('2d');
    if (charts.budget) charts.budget.destroy();
    charts.budget = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: sistemaDados.categorias.map(c=>c.nome),
        datasets: [{ data: sistemaDados.categorias.map(c=>c.orcado) }]
      },
      options: { responsive:true, plugins:{ legend:{ position:'right' } } }
    });
  }
  const tbody = byId('budgetTableBody'); tbody.innerHTML='';
  sistemaDados.categorias.forEach(cat=>{
    const tr = document.createElement('tr');
    const pct = Math.round((cat.executado/cat.orcado)*100);
    tr.innerHTML = `<td>${cat.nome}</td>
      <td>${currency(cat.orcado)}</td>
      <td>${currency(cat.executado)}</td>
      <td>${pct}%</td>
      <td>${pct<50?'<span class="project-status Planejamento">Atenção</span>': pct>90?'<span class="project-status Cancelado">Limite</span>':'<span class="project-status Em Andamento">No prazo</span>'}</td>`;
    tbody.appendChild(tr);
  });
}

/* Beneficiários */
let benefPage = 1, benefPageSize = 8;
function renderBeneficiarios(){
  const q = byId('buscaBenef').value.trim().toLowerCase();
  let items = appState.beneficiarios.filter(b=> !q || b.nome.toLowerCase().includes(q) || b.cpf.includes(q) || (b.projeto||'').toLowerCase().includes(q));
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total/benefPageSize));
  if (benefPage>pages) benefPage = pages;
  const start = (benefPage-1)*benefPageSize;
  const pageItems = items.slice(start, start+benefPageSize);

  const tbody = byId('beneficiariosTableBody'); tbody.innerHTML='';
  pageItems.forEach(b=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${b.nome}</td><td>${b.cpf}</td><td>${b.projeto}</td><td>${formatDate(b.cadastro)}</td>
    <td>
      <button class="btn btn--outline btn--sm" title="Editar"><i class="fa-solid fa-pen"></i></button>
    </td>`;
    tr.querySelector('button').addEventListener('click', ()=> openEditBeneficiario(b.id));
    tbody.appendChild(tr);
  });

  const pag = byId('benefPagination'); pag.innerHTML='';
  for (let i=1;i<=pages;i++){
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i===benefPage?' is-active':'');
    btn.textContent = i;
    btn.addEventListener('click', ()=>{ benefPage=i; renderBeneficiarios(); });
    pag.appendChild(btn);
  }

  byId('totalBeneficiarios').textContent = appState.beneficiarios.length;
  byId('atendimentosMes').textContent = '47';
  byId('novosBeneficiarios').textContent = '12';
}

function openEditBeneficiario(id){
  const b = appState.beneficiarios.find(x=>x.id===id); if(!b) return;
  const d = showDialog('editBeneficiarioModal');
  d.dataset.id = id;
  byId('editNomeBenef').value = b.nome;
  byId('editCpfBenef').value = b.cpf;
  const sel = byId('editProjetoBenef'); sel.innerHTML = '';
  appState.projetos.forEach(p=>{
    const opt = document.createElement('option'); opt.value = p.nome; opt.textContent = p.nome; sel.appendChild(opt);
  });
  sel.value = b.projeto;
}
function handleEditBeneficiario(e){
  e.preventDefault();
  const d = byId('editBeneficiarioModal');
  const id = Number(d.dataset.id);
  const b = appState.beneficiarios.find(x=>x.id===id); if(!b) return;
  b.nome = byId('editNomeBenef').value.trim();
  b.cpf = byId('editCpfBenef').value.trim();
  b.projeto = byId('editProjetoBenef').value;
  d.close(); saveState(); renderBeneficiarios(); toast('Beneficiário atualizado.');
}

function handleNewBeneficiario(e){
  e.preventDefault();
  const form = e.target;
  const [nomeEl, cpfEl, projEl] = form.querySelectorAll('input,select');
  const nome = nomeEl.value.trim();
  const cpf = cpfEl.value.trim();
  const projetoNome = projEl.value;
  if(!nome || !cpf || !projetoNome) return;
  appState.beneficiarios.push({
    id: Date.now(), nome, cpf, projeto: projetoNome, cadastro: new Date().toISOString().slice(0,10)
  });
  const proj = appState.projetos.find(p=>p.nome===projetoNome);
  if (proj){
    proj.beneficiarios_atual = (proj.beneficiarios_atual||0)+1;
    proj.progresso = proj.beneficiarios_meta ? Math.min(100, Math.round((proj.beneficiarios_atual/proj.beneficiarios_meta)*100)) : 0;
  }
  form.close(); form.reset(); saveState(); renderBeneficiarios(); renderProjects(); updateDashboard();
  toast('Beneficiário cadastrado.');
}

function fillBeneficiarioProjetoSelects(){
  const selects = [document.querySelector('#novoBeneficiarioModal select'), byId('editProjetoBenef')];
  selects.forEach(sel=>{
    if(!sel) return;
    sel.innerHTML='';
    appState.projetos.forEach(p=>{
      const opt = document.createElement('option'); opt.value=p.nome; opt.textContent=p.nome; sel.appendChild(opt);
    });
  });
}

/* Indicadores */
function renderIndicators(){
  const grid = byId('indicatorsGrid'); grid.innerHTML='';
  appState.indicadores.forEach(ind=>{
    const prog = ind.meta ? ((ind.atual/ind.meta)*100).toFixed(1) : 0;
    const card = document.createElement('div');
    card.className='card';
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h4>${ind.nome}</h4><small style="opacity:.7">${ind.unidade}</small>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0">
        <strong style="color:var(--color-primary)">${ind.atual}</strong>
        <small>Meta: ${ind.meta}</small>
      </div>
      <div class="progress"><div class="progress__bar" style="width:${prog}%"></div></div>
      <small>Progresso: ${prog}%</small>`;
    grid.appendChild(card);
  });
}

/* Relatórios */
function renderReportsTimeline(){
  const cont = byId('reportsTimeline'); cont.innerHTML='';
  [...appState.reports].sort((a,b)=> new Date(a.data)-new Date(b.data)).forEach(r=>{
    const item = document.createElement('div');
    item.className='activity-item';
    item.innerHTML = `<div>
      <div class="activity-name">${r.titulo}</div>
      <div class="activity-type">${r.descricao}</div>
    </div>
    <div class="activity-date">${formatDate(r.data)}</div>`;
    cont.appendChild(item);
  });
}

/* Parcerias form */
function handleNewParceria(e){
  e.preventDefault();
  const form = e.target;
  const [orgaoEl, tipoEl, objEl] = form.querySelectorAll('input,select,textarea');
  const orgao = orgaoEl.value.trim();
  const tipo = tipoEl.value;
  const objeto = objEl.value.trim();
  if(!orgao || !tipo || !objeto) return;
  appState.parcerias.push({ id: Date.now(), orgao, tipo, objeto, status: 'Em análise' });
  form.close(); form.reset(); saveState(); renderParceriasList();
  toast('Parceria criada.');
}

/* Import/Export */
function exportCsv(){
  const rows = [
    ['id','nome','tipo_parceria','status','orcamento_total','orcamento_executado','beneficiarios_meta','beneficiarios_atual','inicio','fim','progresso'],
    ...appState.projetos.map(p=>[p.id,p.nome,p.tipo_parceria,p.status,p.orcamento_total,p.orcamento_executado,p.beneficiarios_meta,p.beneficiarios_atual,p.inicio,p.fim,p.progresso])
  ];
  const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'projetos.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importJson(e){
  const file = e.target.files[0]; if(!file) return;
  const fr = new FileReader();
  fr.onload = () => {
    try{
      const data = JSON.parse(fr.result);
      if (data && data.projetos) appState.projetos = data.projetos;
      if (data && data.beneficiarios) appState.beneficiarios = data.beneficiarios;
      if (data && data.parcerias) appState.parcerias = data.parcerias;
      saveState();
      renderProjects(); renderBeneficiarios(); renderParceriasList(); updateDashboard(); fillBeneficiarioProjetoSelects();
      toast('Dados importados.');
    }catch(err){ alert('JSON inválido.'); }
  };
  fr.readAsText(file);
}

/* Utils */
function toast(msg){
  const t = byId('toast'); t.textContent = msg; t.classList.add('is-visible');
  setTimeout(()=> t.classList.remove('is-visible'), 1800);
}
