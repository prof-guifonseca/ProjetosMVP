// Dados do sistema
const sistemaDados = {
    tiposOSC: [
        {"id": "saude", "nome": "Saúde", "cor": "#e74c3c"},
        {"id": "educacao", "nome": "Educação", "cor": "#3498db"},
        {"id": "assistencia", "nome": "Assistência Social", "cor": "#2ecc71"},
        {"id": "cultura", "nome": "Cultura", "cor": "#9b59b6"},
        {"id": "meio_ambiente", "nome": "Meio Ambiente", "cor": "#27ae60"},
        {"id": "esporte", "nome": "Esporte", "cor": "#f39c12"}
    ],
    tiposParceria: [
        {"id": "colaboracao", "nome": "Termo de Colaboração", "descricao": "Parceria com transferência de recursos onde a iniciativa é do poder público"},
        {"id": "fomento", "nome": "Termo de Fomento", "descricao": "Parceria com transferência de recursos onde a iniciativa é da OSC"},
        {"id": "cooperacao", "nome": "Acordo de Cooperação", "descricao": "Parceria sem transferência de recursos financeiros"}
    ],
    categorias: [
        {"nome": "Recursos Humanos", "percentual": 40, "orcado": 60000, "executado": 35000},
        {"nome": "Materiais e Insumos", "percentual": 20, "orcado": 30000, "executado": 18000},
        {"nome": "Equipamentos", "percentual": 15, "orcado": 22500, "executado": 8500},
        {"nome": "Infraestrutura", "percentual": 10, "orcado": 15000, "executado": 12000},
        {"nome": "Capacitação", "percentual": 8, "orcado": 12000, "executado": 7500},
        {"nome": "Outras Despesas", "percentual": 7, "orcado": 10500, "executado": 8000}
    ]
};

// Estado global da aplicação
let appState = {
    oscConfigurada: false,
    dadosOSC: null,
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
            progresso: 65
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
            progresso: 15
        }
    ],
    atividades: [
        {"nome": "Prestação de Contas - Projeto Famílias", "data": "2025-08-15", "tipo": "prestacao_contas"},
        {"nome": "Reunião de Monitoramento", "data": "2025-08-02", "tipo": "monitoramento"},
        {"nome": "Capacitação de Voluntários", "data": "2025-08-10", "tipo": "capacitacao"}
    ],
    indicadores: [
        {"nome": "Famílias Atendidas", "atual": 156, "meta": 200, "unidade": "famílias"},
        {"nome": "Atendimentos Realizados", "atual": 489, "meta": 600, "unidade": "atendimentos"},
        {"nome": "Taxa de Satisfação", "atual": 4.2, "meta": 4.5, "unidade": "estrelas"}
    ],
    beneficiarios: [
        {"id": 1, "nome": "Maria das Graças Silva", "cpf": "123.456.789-00", "projeto": "Apoio às Famílias Vulneráveis", "cadastro": "2025-02-15"},
        {"id": 2, "nome": "João Santos Oliveira", "cpf": "987.654.321-00", "projeto": "Apoio às Famílias Vulneráveis", "cadastro": "2025-03-10"},
        {"id": 3, "nome": "Ana Paula Costa", "cpf": "456.789.123-00", "projeto": "Apoio às Famílias Vulneráveis", "cadastro": "2025-04-05"}
    ]
};

// Charts globais
let charts = {};

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', function() {
    initializeSystem();
});

function initializeSystem() {
    // Primeiro, sempre popular o dropdown
    populateOSCTypes();
    
    // Verificar se já existe uma OSC configurada no localStorage
    const savedOSC = localStorage.getItem('oscDados');
    if (savedOSC) {
        appState.dadosOSC = JSON.parse(savedOSC);
        appState.oscConfigurada = true;
        // Carrega interface principal com dados salvos
        showMainInterface();
    } else {
        // Em modo demonstração, criamos automaticamente uma OSC padrão e pulamos a tela de configuração
        const demoOSC = {
            nome: 'OSC Demonstração',
            cnpj: '00.000.000/0000-00',
            tipo: sistemaDados.tiposOSC[0] ? sistemaDados.tiposOSC[0].id : '',
            responsavel: 'Responsável Demo',
            email: 'demo@osc.org'
        };
        appState.dadosOSC = demoOSC;
        appState.oscConfigurada = true;
        // Salvar em localStorage para que a sessão persista
        localStorage.setItem('oscDados', JSON.stringify(demoOSC));
        console.log('Configurando OSC em modo demonstração:', demoOSC);
        // Mostrar interface principal diretamente
        showMainInterface();
    }

    // Registrar eventos após mostrar a interface
    setupEventListeners();
}

function populateOSCTypes() {
    const select = document.getElementById('oscTipo');
    if (!select) {
        console.error('Select element not found');
        return;
    }
    
    // Limpar opções existentes (exceto a primeira)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    // Adicionar opções dos tipos de OSC
    sistemaDados.tiposOSC.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.id;
        option.textContent = tipo.nome;
        select.appendChild(option);
    });
    
    console.log('OSC types populated:', select.children.length);
}

function showSetupModal() {
    const setupModal = document.getElementById('setupModal');
    const mainInterface = document.getElementById('mainInterface');
    
    setupModal.classList.remove('hidden');
    mainInterface.classList.add('hidden');
    
    // Re-popular dropdown para garantir que está preenchido
    setTimeout(() => {
        populateOSCTypes();
    }, 100);
}

function showMainInterface() {
    document.getElementById('setupModal').classList.add('hidden');
    document.getElementById('mainInterface').classList.remove('hidden');
    
    if (appState.dadosOSC) {
        document.getElementById('oscNameHeader').textContent = appState.dadosOSC.nome;
        updateDashboard();
        renderProjectsGrid();
        renderParceriasList();
        renderBudgetData();
        renderBeneficiarios();
        renderIndicators();
        renderReportsTimeline();
    }
}

function setupEventListeners() {
    // Setup form
    const setupForm = document.getElementById('setupForm');
    if (setupForm) {
        setupForm.addEventListener('submit', handleSetupSubmit);
    }
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Modal forms
    const novoProjetoForm = document.getElementById('novoProjetoForm');
    if (novoProjetoForm) {
        novoProjetoForm.addEventListener('submit', handleNewProject);
    }
    
    const novaParceriaForm = document.getElementById('novaParceriaForm');
    if (novaParceriaForm) {
        novaParceriaForm.addEventListener('submit', handleNewParceria);
    }
    
    const novoBeneficiarioForm = document.getElementById('novoBeneficiarioForm');
    if (novoBeneficiarioForm) {
        novoBeneficiarioForm.addEventListener('submit', handleNewBeneficiario);
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.add('hidden');
            }
        });
    });

    // ESC key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                if (modal.id !== 'setupModal') { // Não fechar o modal de setup com ESC
                    modal.classList.add('hidden');
                }
            });
        }
    });
}

function handleSetupSubmit(e) {
    e.preventDefault();
    
    const dadosOSC = {
        nome: document.getElementById('oscNome').value,
        cnpj: document.getElementById('oscCnpj').value,
        tipo: document.getElementById('oscTipo').value,
        responsavel: document.getElementById('oscResponsavel').value,
        email: document.getElementById('oscEmail').value
    };
    
    // Validar dados
    if (!dadosOSC.nome || !dadosOSC.cnpj || !dadosOSC.tipo || !dadosOSC.responsavel || !dadosOSC.email) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Salvar dados
    appState.dadosOSC = dadosOSC;
    appState.oscConfigurada = true;
    
    console.log('OSC configurada:', dadosOSC);
    
    // Mostrar interface principal
    showMainInterface();
}

function handleNavigation(e) {
    e.preventDefault();
    
    const module = e.currentTarget.dataset.module;
    
    // Atualizar navegação ativa
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
    
    // Mostrar módulo correspondente
    document.querySelectorAll('.module').forEach(mod => {
        mod.classList.remove('active');
    });
    
    const targetModule = document.getElementById(module + '-module');
    if (targetModule) {
        targetModule.classList.add('active');
    }
    
    // Atualizar dados específicos do módulo se necessário
    if (module === 'dashboard') {
        updateDashboard();
    }
}

function updateDashboard() {
    // Atualizar cards do dashboard
    const totalProjetosEl = document.getElementById('totalProjetos');
    if (totalProjetosEl) {
        totalProjetosEl.textContent = appState.projetos.length;
    }
    
    const orcamentoTotal = appState.projetos.reduce((total, projeto) => total + projeto.orcamento_total, 0);
    const orcamentoTotalEl = document.getElementById('orcamentoTotal');
    if (orcamentoTotalEl) {
        orcamentoTotalEl.textContent = formatCurrency(orcamentoTotal);
    }
    
    const beneficiariosTotal = appState.projetos.reduce((total, projeto) => total + projeto.beneficiarios_atual, 0);
    const beneficiariosTotalEl = document.getElementById('beneficiariosTotal');
    if (beneficiariosTotalEl) {
        beneficiariosTotalEl.textContent = beneficiariosTotal;
    }
    
    const progressoMedio = Math.round(appState.projetos.reduce((total, projeto) => total + projeto.progresso, 0) / appState.projetos.length);
    const progressoMedioEl = document.getElementById('progressoMedio');
    if (progressoMedioEl) {
        progressoMedioEl.textContent = progressoMedio + '%';
    }
    
    // Renderizar gráficos
    setTimeout(() => {
        renderDashboardCharts();
    }, 100);
    
    // Renderizar atividades
    renderProximasAtividades();
}

function renderDashboardCharts() {
    // Gráfico de execução orçamentária
    const orcamentoCanvas = document.getElementById('orcamentoChart');
    if (!orcamentoCanvas) return;
    
    const ctxOrcamento = orcamentoCanvas.getContext('2d');
    if (charts.orcamento) {
        charts.orcamento.destroy();
    }
    
    charts.orcamento = new Chart(ctxOrcamento, {
        type: 'bar',
        data: {
            labels: appState.projetos.map(p => p.nome),
            datasets: [
                {
                    label: 'Orçado',
                    data: appState.projetos.map(p => p.orcamento_total),
                    backgroundColor: '#1FB8CD'
                },
                {
                    label: 'Executado',
                    data: appState.projetos.map(p => p.orcamento_executado),
                    backgroundColor: '#FFC185'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': R$ ' + context.parsed.y.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
    
    // Gráfico de beneficiários
    const beneficiariosCanvas = document.getElementById('beneficiariosChart');
    if (!beneficiariosCanvas) return;
    
    const ctxBeneficiarios = beneficiariosCanvas.getContext('2d');
    if (charts.beneficiarios) {
        charts.beneficiarios.destroy();
    }
    
    charts.beneficiarios = new Chart(ctxBeneficiarios, {
        type: 'doughnut',
        data: {
            labels: appState.projetos.map(p => p.nome),
            datasets: [{
                data: appState.projetos.map(p => p.beneficiarios_atual),
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderProximasAtividades() {
    const container = document.getElementById('proximas-atividades');
    if (!container) return;
    
    container.innerHTML = '';
    
    appState.atividades.forEach(atividade => {
        const activityDiv = document.createElement('div');
        activityDiv.className = 'activity-item';
        
        activityDiv.innerHTML = `
            <div class="activity-info">
                <div class="activity-name">${atividade.nome}</div>
                <div class="activity-type">${getTipoAtividadeLabel(atividade.tipo)}</div>
            </div>
            <div class="activity-date">${formatDate(atividade.data)}</div>
        `;
        
        container.appendChild(activityDiv);
    });
}

function renderProjectsGrid() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    appState.projetos.forEach(projeto => {
        const projectDiv = document.createElement('div');
        projectDiv.className = 'project-card';
        
        const statusClass = projeto.status.toLowerCase().replace(' ', '-');
        
        projectDiv.innerHTML = `
            <div class="project-header">
                <h3 class="project-title">${projeto.nome}</h3>
                <span class="project-status ${statusClass}">${projeto.status}</span>
            </div>
            
            <div class="project-meta">
                <div class="project-metric">
                    <span class="project-metric-value">${formatCurrency(projeto.orcamento_executado)}</span>
                    <div class="project-metric-label">de ${formatCurrency(projeto.orcamento_total)}</div>
                </div>
                <div class="project-metric">
                    <span class="project-metric-value">${projeto.beneficiarios_atual}</span>
                    <div class="project-metric-label">de ${projeto.beneficiarios_meta} beneficiários</div>
                </div>
            </div>
            
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${projeto.progresso}%"></div>
            </div>
            
            <div class="project-actions">
                <button class="btn btn--outline btn--sm" onclick="editProject(${projeto.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn--primary btn--sm" onclick="viewProject(${projeto.id})">
                    <i class="fas fa-eye"></i> Visualizar
                </button>
            </div>
        `;
        
        grid.appendChild(projectDiv);
    });
}

function renderParceriasList() {
    const list = document.getElementById('parceriasList');
    if (!list) return;
    
    list.innerHTML = '';
    
    // Dados de exemplo para parcerias
    const parcerias = [
        {
            id: 1,
            orgao: "Secretaria Municipal de Assistência Social",
            tipo: "colaboracao",
            objeto: "Atendimento a famílias em situação de vulnerabilidade social",
            status: "Ativo"
        },
        {
            id: 2,
            orgao: "Secretaria Estadual de Desenvolvimento Social",
            tipo: "fomento",
            objeto: "Programa de capacitação profissional para jovens",
            status: "Em análise"
        }
    ];
    
    parcerias.forEach(parceria => {
        const parceriaDiv = document.createElement('div');
        parceriaDiv.className = 'parceria-item';
        
        const tipoLabel = sistemaDados.tiposParceria.find(t => t.id === parceria.tipo)?.nome || parceria.tipo;
        
        parceriaDiv.innerHTML = `
            <div>
                <h4>${parceria.orgao}</h4>
                <p><strong>Tipo:</strong> ${tipoLabel}</p>
                <p><strong>Objeto:</strong> ${parceria.objeto}</p>
            </div>
            <div>
                <span class="status status--success">${parceria.status}</span>
            </div>
        `;
        
        list.appendChild(parceriaDiv);
    });
}

function renderBudgetData() {
    // Gráfico de distribuição orçamentária
    const budgetCanvas = document.getElementById('budgetChart');
    if (!budgetCanvas) return;
    
    const ctx = budgetCanvas.getContext('2d');
    if (charts.budget) {
        charts.budget.destroy();
    }
    
    charts.budget = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: sistemaDados.categorias.map(c => c.nome),
            datasets: [{
                data: sistemaDados.categorias.map(c => c.orcado),
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label;
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: R$ ${value.toLocaleString('pt-BR')} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Tabela detalhada
    const tbody = document.getElementById('budgetTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    sistemaDados.categorias.forEach(categoria => {
        const row = document.createElement('tr');
        const percentExecutado = (categoria.executado / categoria.orcado * 100).toFixed(1);
        
        let statusClass = 'status--success';
        let statusText = 'No prazo';
        
        if (percentExecutado < 50) {
            statusClass = 'status--warning';
            statusText = 'Atenção';
        } else if (percentExecutado > 90) {
            statusClass = 'status--error';
            statusText = 'Limite';
        }
        
        row.innerHTML = `
            <td>${categoria.nome}</td>
            <td>${formatCurrency(categoria.orcado)}</td>
            <td>${formatCurrency(categoria.executado)}</td>
            <td>${percentExecutado}%</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
        `;
        
        tbody.appendChild(row);
    });
}

function renderBeneficiarios() {
    // Atualizar estatísticas
    const totalBeneficiariosEl = document.getElementById('totalBeneficiarios');
    if (totalBeneficiariosEl) {
        totalBeneficiariosEl.textContent = appState.beneficiarios.length;
    }
    
    const atendimentosMesEl = document.getElementById('atendimentosMes');
    if (atendimentosMesEl) {
        atendimentosMesEl.textContent = '47';
    }
    
    const novosBeneficiariosEl = document.getElementById('novosBeneficiarios');
    if (novosBeneficiariosEl) {
        novosBeneficiariosEl.textContent = '12';
    }
    
    // Lista de beneficiários
    const list = document.getElementById('beneficiariosList');
    if (!list) return;
    
    list.innerHTML = '<h4>Beneficiários Cadastrados</h4>';
    
    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Projeto</th>
                <th>Data Cadastro</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    appState.beneficiarios.forEach(beneficiario => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${beneficiario.nome}</td>
            <td>${beneficiario.cpf}</td>
            <td>${beneficiario.projeto}</td>
            <td>${formatDate(beneficiario.cadastro)}</td>
            <td>
                <button class="btn btn--outline btn--sm" onclick="editBeneficiario(${beneficiario.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    list.appendChild(table);
}

function renderIndicators() {
    const grid = document.getElementById('indicatorsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    appState.indicadores.forEach(indicador => {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'indicator-card';
        
        const progress = (indicador.atual / indicador.meta * 100).toFixed(1);
        
        indicatorDiv.innerHTML = `
            <div class="indicator-header">
                <h4 class="indicator-name">${indicador.nome}</h4>
                <span class="indicator-unit">${indicador.unidade}</span>
            </div>
            
            <div class="indicator-values">
                <span class="indicator-current">${indicador.atual}</span>
                <span class="indicator-target">Meta: ${indicador.meta}</span>
            </div>
            
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${progress}%"></div>
            </div>
            
            <div class="indicator-progress">
                <small>Progresso: ${progress}%</small>
            </div>
        `;
        
        grid.appendChild(indicatorDiv);
    });
}

function renderReportsTimeline() {
    const timeline = document.getElementById('reportsTimeline');
    if (!timeline) return;
    
    timeline.innerHTML = '';
    
    const reports = [
        {
            data: "2025-08-15",
            titulo: "Prestação de Contas - Projeto Famílias",
            descricao: "Relatório trimestral de execução física e financeira"
        },
        {
            data: "2025-09-30",
            titulo: "Relatório de Indicadores",
            descricao: "Monitoramento de metas e resultados alcançados"
        },
        {
            data: "2025-10-15",
            titulo: "Prestação de Contas - Capacitação",
            descricao: "Relatório de atividades do programa de capacitação"
        }
    ];
    
    reports.forEach(report => {
        const timelineDiv = document.createElement('div');
        timelineDiv.className = 'timeline-item';
        
        timelineDiv.innerHTML = `
            <div class="timeline-date">${formatDate(report.data)}</div>
            <div class="timeline-content">
                <h5 class="timeline-title">${report.titulo}</h5>
                <p class="timeline-description">${report.descricao}</p>
            </div>
            <button class="btn btn--primary btn--sm">
                <i class="fas fa-download"></i> Baixar
            </button>
        `;
        
        timeline.appendChild(timelineDiv);
    });
}

// Funções para modais
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('hidden');
    
    // Preencher selects se necessário
    if (modalId === 'novoBeneficiarioModal') {
        const select = modal.querySelector('select');
        if (select) {
            select.innerHTML = '<option value="">Selecione um projeto</option>';
            appState.projetos.forEach(projeto => {
                const option = document.createElement('option');
                option.value = projeto.id;
                option.textContent = projeto.nome;
                select.appendChild(option);
            });
        }
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Handlers dos formulários
function handleNewProject(e) {
    e.preventDefault();
    hideModal('novoProjetoModal');
    alert('Projeto criado com sucesso!');
}

function handleNewParceria(e) {
    e.preventDefault();
    hideModal('novaParceriaModal');
    alert('Parceria criada com sucesso!');
}

function handleNewBeneficiario(e) {
    e.preventDefault();
    hideModal('novoBeneficiarioModal');
    alert('Beneficiário cadastrado com sucesso!');
}

// Funções auxiliares
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

function getTipoAtividadeLabel(tipo) {
    const labels = {
        'prestacao_contas': 'Prestação de Contas',
        'monitoramento': 'Monitoramento',
        'capacitacao': 'Capacitação'
    };
    return labels[tipo] || tipo;
}

// Funções de ação
function editProject(id) {
    alert(`Editando projeto ${id}`);
}

function viewProject(id) {
    alert(`Visualizando projeto ${id}`);
}

function editBeneficiario(id) {
    alert(`Editando beneficiário ${id}`);
}

function showNotifications() {
    alert('3 notificações:\n- Prestação de contas em 5 dias\n- Nova capacitação disponível\n- Reunião de monitoramento amanhã');
}

function showSettings() {
    alert('Configurações do sistema');
}

function generateReport() {
    alert('Relatório gerado com sucesso! O download iniciará em breve.');
}
