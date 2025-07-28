// Improved Gestão OSC MVP script
// Este script centraliza toda a lógica de interface do MVP de gestão.
// Ele remove duplicações, adiciona manipulação dinâmica de dados e mantém
// uma versão simplificada para demonstração sem necessidade de login.

// Dados estáticos do sistema utilizados para referência de categorias, tipos e cores.
const sistemaDados = {
    tiposOSC: [
        { id: "saude", nome: "Saúde", cor: "#e74c3c" },
        { id: "educacao", nome: "Educação", cor: "#3498db" },
        { id: "assistencia", nome: "Assistência Social", cor: "#2ecc71" },
        { id: "cultura", nome: "Cultura", cor: "#9b59b6" },
        { id: "meio_ambiente", nome: "Meio Ambiente", cor: "#27ae60" },
        { id: "esporte", nome: "Esporte", cor: "#f39c12" }
    ],
    tiposParceria: [
        { id: "colaboracao", nome: "Termo de Colaboração", descricao: "Parceria com transferência de recursos onde a iniciativa é do poder público" },
        { id: "fomento", nome: "Termo de Fomento", descricao: "Parceria com transferência de recursos onde a iniciativa é da OSC" },
        { id: "cooperacao", nome: "Acordo de Cooperação", descricao: "Parceria sem transferência de recursos financeiros" }
    ],
    categorias: [
        { nome: "Recursos Humanos", percentual: 40, orcado: 60000, executado: 35000 },
        { nome: "Materiais e Insumos", percentual: 20, orcado: 30000, executado: 18000 },
        { nome: "Equipamentos", percentual: 15, orcado: 22500, executado: 8500 },
        { nome: "Infraestrutura", percentual: 10, orcado: 15000, executado: 12000 },
        { nome: "Capacitação", percentual: 8, orcado: 12000, executado: 7500 },
        { nome: "Outras Despesas", percentual: 7, orcado: 10500, executado: 8000 }
    ]
};

// Estado global da aplicação. Aqui definimos todos os dados que serão
// manipulados pela interface. Novos registros são adicionados a estas estruturas.
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
    // Próximas atividades na agenda
    atividades: [
        { nome: "Prestação de Contas - Projeto Famílias", data: "2025-08-15", tipo: "prestacao_contas" },
        { nome: "Reunião de Monitoramento", data: "2025-08-02", tipo: "monitoramento" },
        { nome: "Capacitação de Voluntários", data: "2025-08-10", tipo: "capacitacao" }
    ],
    // Indicadores de desempenho
    indicadores: [
        { nome: "Famílias Atendidas", atual: 156, meta: 200, unidade: "famílias" },
        { nome: "Atendimentos Realizados", atual: 489, meta: 600, unidade: "atendimentos" },
        { nome: "Taxa de Satisfação", atual: 4.2, meta: 4.5, unidade: "estrelas" }
    ],
    // Beneficiários cadastrados
    beneficiarios: [
        { id: 1, nome: "Maria das Graças Silva", cpf: "123.456.789-00", projeto: "Apoio às Famílias Vulneráveis", cadastro: "2025-02-15" },
        { id: 2, nome: "João Santos Oliveira", cpf: "987.654.321-00", projeto: "Apoio às Famílias Vulneráveis", cadastro: "2025-03-10" },
        { id: 3, nome: "Ana Paula Costa", cpf: "456.789.123-00", projeto: "Apoio às Famílias Vulneráveis", cadastro: "2025-04-05" }
    ],
    // Parcerias celebradas (inicialmente estáticas, mas adicionadas dinamicamente)
    parcerias: [
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
    ],
    // Cronograma de relatórios de prestação de contas
    reports: [
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
    ]
};

// Armazenaremos instâncias dos gráficos do Chart.js para que possam ser
// destruidos e recriados quando necessário (ex. ao atualizar dados).
let charts = {};

// Inicializa a aplicação após o carregamento do DOM.
document.addEventListener('DOMContentLoaded', initializeSystem);

/**
 * Função principal que inicializa o sistema.
 * - Popula dropdown de tipos de OSC.
 * - Verifica se há dados salvos no localStorage para definir uma OSC.
 * - Caso contrário, utiliza dados de demonstração.
 * - Registra os eventos da interface.
 */
function initializeSystem() {
    populateOSCTypes();
    const savedOSC = localStorage.getItem('oscDados');
    if (savedOSC) {
        try {
            appState.dadosOSC = JSON.parse(savedOSC);
            appState.oscConfigurada = true;
            showMainInterface();
        } catch (e) {
            console.warn('Erro ao recuperar OSC do localStorage, usando demonstração.', e);
            configurarDemoOSC();
        }
    } else {
        configurarDemoOSC();
    }
    setupEventListeners();
}

/**
 * Cria uma OSC de demonstração e salva no localStorage para
 * persistência mínima durante a demonstração.
 */
function configurarDemoOSC() {
    const demoOSC = {
        nome: 'OSC Demonstração',
        cnpj: '00.000.000/0000-00',
        tipo: sistemaDados.tiposOSC[0] ? sistemaDados.tiposOSC[0].id : '',
        responsavel: 'Responsável Demo',
        email: 'demo@osc.org'
    };
    appState.dadosOSC = demoOSC;
    appState.oscConfigurada = true;
    localStorage.setItem('oscDados', JSON.stringify(demoOSC));
    showMainInterface();
}

/**
 * Preenche o select de tipos de OSC na tela de configuração.
 */
function populateOSCTypes() {
    const select = document.getElementById('oscTipo');
    if (!select) return;
    // Mantém a primeira opção (Selecione uma área)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    sistemaDados.tiposOSC.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.id;
        option.textContent = tipo.nome;
        select.appendChild(option);
    });
}

/**
 * Exibe a interface principal e atualiza todos os módulos com os dados atuais.
 */
function showMainInterface() {
    document.getElementById('setupModal').classList.add('hidden');
    document.getElementById('mainInterface').classList.remove('hidden');
    // Atualiza o cabeçalho com o nome da OSC.
    if (appState.dadosOSC) {
        document.getElementById('oscNameHeader').textContent = appState.dadosOSC.nome;
    }
    // Renderiza todos os módulos.
    updateDashboard();
    renderProjectsGrid();
    renderParceriasList();
    renderBudgetData();
    renderBeneficiarios();
    renderIndicators();
    renderReportsTimeline();
}

/**
 * Registra todos os eventos da interface (navegação, formulários, modais).
 */
function setupEventListeners() {
    // Formulário de configuração inicial
    const setupForm = document.getElementById('setupForm');
    if (setupForm) {
        setupForm.addEventListener('submit', handleSetupSubmit);
    }
    // Navegação lateral
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    // Formulário de novo projeto
    const novoProjetoForm = document.getElementById('novoProjetoForm');
    if (novoProjetoForm) {
        novoProjetoForm.addEventListener('submit', handleNewProject);
    }
    // Formulário de nova parceria
    const novaParceriaForm = document.getElementById('novaParceriaForm');
    if (novaParceriaForm) {
        novaParceriaForm.addEventListener('submit', handleNewParceria);
    }
    // Formulário de novo beneficiário
    const novoBeneficiarioForm = document.getElementById('novoBeneficiarioForm');
    if (novoBeneficiarioForm) {
        novoBeneficiarioForm.addEventListener('submit', handleNewBeneficiario);
    }

    // Formulário de edição de projeto
    const editProjetoForm = document.getElementById('editProjetoForm');
    if (editProjetoForm) {
        editProjetoForm.addEventListener('submit', handleEditProjeto);
    }
    // Formulário de edição de beneficiário
    const editBeneficiarioForm = document.getElementById('editBeneficiarioForm');
    if (editBeneficiarioForm) {
        editBeneficiarioForm.addEventListener('submit', handleEditBeneficiario);
    }
    // Botões de fechar modais
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) modal.classList.add('hidden');
        });
    });
    // Clique fora do modal fecha (exceto o de setup)
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal && modal.id !== 'setupModal') {
                modal.classList.add('hidden');
            }
        });
    });
    // Tecla ESC fecha modais (exceto setup)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                if (modal.id !== 'setupModal') modal.classList.add('hidden');
            });
        }
    });
}

/**
 * Trata o envio do formulário de configuração inicial da OSC.
 */
function handleSetupSubmit(e) {
    e.preventDefault();
    const dadosOSC = {
        nome: document.getElementById('oscNome').value.trim(),
        cnpj: document.getElementById('oscCnpj').value.trim(),
        tipo: document.getElementById('oscTipo').value,
        responsavel: document.getElementById('oscResponsavel').value.trim(),
        email: document.getElementById('oscEmail').value.trim()
    };
    // Validação simples
    if (!dadosOSC.nome || !dadosOSC.cnpj || !dadosOSC.tipo || !dadosOSC.responsavel || !dadosOSC.email) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    appState.dadosOSC = dadosOSC;
    appState.oscConfigurada = true;
    // Salva no localStorage para persistência
    localStorage.setItem('oscDados', JSON.stringify(dadosOSC));
    showMainInterface();
}

/**
 * Navega entre os módulos do menu lateral.
 */
function handleNavigation(e) {
    e.preventDefault();
    const module = e.currentTarget.dataset.module;
    // Atualiza classe active na navegação
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    e.currentTarget.classList.add('active');
    // Mostra módulo selecionado e oculta os demais
    document.querySelectorAll('.module').forEach(mod => mod.classList.remove('active'));
    const target = document.getElementById(`${module}-module`);
    if (target) target.classList.add('active');
    // Atualiza dados específicos quando voltar ao dashboard
    if (module === 'dashboard') {
        updateDashboard();
    }
}

/**
 * Atualiza os cards do dashboard e agenda de atividades.
 */
function updateDashboard() {
    // Atualiza contagem de projetos
    const totalProjetosEl = document.getElementById('totalProjetos');
    if (totalProjetosEl) totalProjetosEl.textContent = appState.projetos.length;
    // Soma orçamentos totais
    const orcamentoTotal = appState.projetos.reduce((acc, p) => acc + p.orcamento_total, 0);
    const orcamentoTotalEl = document.getElementById('orcamentoTotal');
    if (orcamentoTotalEl) orcamentoTotalEl.textContent = formatCurrency(orcamentoTotal);
    // Soma beneficiários atendidos
    const beneficiariosTotal = appState.projetos.reduce((acc, p) => acc + (p.beneficiarios_atual || 0), 0);
    const beneficiariosTotalEl = document.getElementById('beneficiariosTotal');
    if (beneficiariosTotalEl) beneficiariosTotalEl.textContent = beneficiariosTotal;
    // Calcula progresso médio
    const progressoMedio = appState.projetos.length > 0 ?
        Math.round(appState.projetos.reduce((acc, p) => acc + (p.progresso || 0), 0) / appState.projetos.length)
        : 0;
    const progressoMedioEl = document.getElementById('progressoMedio');
    if (progressoMedioEl) progressoMedioEl.textContent = `${progressoMedio}%`;
    // Desenha gráficos e próximas atividades
    renderDashboardCharts();
    renderProximasAtividades();
}

/**
 * Renderiza os gráficos do dashboard utilizando Chart.js.
 */
function renderDashboardCharts() {
    // Execução orçamentária por projeto (gráfico de barras)
    const orcamentoCanvas = document.getElementById('orcamentoChart');
    if (orcamentoCanvas) {
        const ctx = orcamentoCanvas.getContext('2d');
        if (charts.orcamento) {
            charts.orcamento.destroy();
        }
        charts.orcamento = new Chart(ctx, {
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
                            callback: value => 'R$ ' + value.toLocaleString('pt-BR')
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: context => {
                                return `${context.dataset.label}: R$ ${context.parsed.y.toLocaleString('pt-BR')}`;
                            }
                        }
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    }
    // Beneficiários por projeto (gráfico de rosca)
    const beneficiariosCanvas = document.getElementById('beneficiariosChart');
    if (beneficiariosCanvas) {
        const ctx2 = beneficiariosCanvas.getContext('2d');
        if (charts.beneficiarios) {
            charts.beneficiarios.destroy();
        }
        charts.beneficiarios = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: appState.projetos.map(p => p.nome),
                datasets: [
                    {
                        data: appState.projetos.map(p => p.beneficiarios_atual || 0),
                        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545']
                    }
                ]
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
}

/**
 * Renderiza a lista de próximas atividades.
 */
function renderProximasAtividades() {
    const container = document.getElementById('proximas-atividades');
    if (!container) return;
    container.innerHTML = '';
    // Ordena atividades por data
    const sorted = [...appState.atividades].sort((a, b) => new Date(a.data) - new Date(b.data));
    sorted.forEach(atividade => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-info">
                <div class="activity-name">${atividade.nome}</div>
                <div class="activity-type">${getTipoAtividadeLabel(atividade.tipo)}</div>
            </div>
            <div class="activity-date">${formatDate(atividade.data)}</div>
        `;
        container.appendChild(item);
    });
}

/**
 * Renderiza o grid de projetos, permitindo visualizar métricas básicas.
 */
function renderProjectsGrid() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    appState.projetos.forEach(projeto => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        const statusClass = (projeto.status || '').toLowerCase().replace(/\s+/g, '-');
        projectCard.innerHTML = `
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
        grid.appendChild(projectCard);
    });
}

/**
 * Renderiza a lista de parcerias utilizando os dados em appState.parcerias.
 */
function renderParceriasList() {
    const list = document.getElementById('parceriasList');
    if (!list) return;
    list.innerHTML = '';
    appState.parcerias.forEach(parceria => {
        const item = document.createElement('div');
        item.className = 'parceria-item';
        const tipoLabel = sistemaDados.tiposParceria.find(t => t.id === parceria.tipo)?.nome || parceria.tipo;
        item.innerHTML = `
            <div>
                <h4>${parceria.orgao}</h4>
                <p><strong>Tipo:</strong> ${tipoLabel}</p>
                <p><strong>Objeto:</strong> ${parceria.objeto}</p>
            </div>
            <div>
                <span class="status status--success">${parceria.status}</span>
            </div>
        `;
        list.appendChild(item);
    });
}

/**
 * Renderiza o gráfico de orçamento por categoria e a tabela detalhada.
 */
function renderBudgetData() {
    const budgetCanvas = document.getElementById('budgetChart');
    if (budgetCanvas) {
        const ctx = budgetCanvas.getContext('2d');
        if (charts.budget) charts.budget.destroy();
        charts.budget = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: sistemaDados.categorias.map(c => c.nome),
                datasets: [
                    {
                        data: sistemaDados.categorias.map(c => c.orcado),
                        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545']
                    }
                ]
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
                            label: context => {
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
    }
    // Tabela com detalhamento por categoria
    const tbody = document.getElementById('budgetTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    sistemaDados.categorias.forEach(categoria => {
        const row = document.createElement('tr');
        const percentExecutado = ((categoria.executado / categoria.orcado) * 100).toFixed(1);
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

/**
 * Renderiza as estatísticas e a tabela de beneficiários.
 */
function renderBeneficiarios() {
    // Atualiza estatísticas de beneficiários
    const totalBeneficiariosEl = document.getElementById('totalBeneficiarios');
    if (totalBeneficiariosEl) totalBeneficiariosEl.textContent = appState.beneficiarios.length;
    const atendimentosMesEl = document.getElementById('atendimentosMes');
    if (atendimentosMesEl) atendimentosMesEl.textContent = '47';
    const novosBeneficiariosEl = document.getElementById('novosBeneficiarios');
    if (novosBeneficiariosEl) novosBeneficiariosEl.textContent = '12';
    // Preenche a tabela com os beneficiários
    const tbody = document.getElementById('beneficiariosTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    appState.beneficiarios.forEach(beneficiario => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${beneficiario.nome}</td>
            <td>${beneficiario.cpf}</td>
            <td>${beneficiario.projeto}</td>
            <td>${formatDate(beneficiario.cadastro)}</td>
            <td>
                <button class="btn btn--outline btn--sm" onclick="editBeneficiario(${beneficiario.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Renderiza os cartões de indicadores de desempenho.
 */
function renderIndicators() {
    const grid = document.getElementById('indicatorsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    appState.indicadores.forEach(indicador => {
        const progress = ((indicador.atual / indicador.meta) * 100).toFixed(1);
        const card = document.createElement('div');
        card.className = 'indicator-card';
        card.innerHTML = `
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
        grid.appendChild(card);
    });
}

/**
 * Renderiza a linha do tempo de relatórios de prestação de contas.
 */
function renderReportsTimeline() {
    const timeline = document.getElementById('reportsTimeline');
    if (!timeline) return;
    timeline.innerHTML = '';
    // Ordena relatórios por data
    const sorted = [...appState.reports].sort((a, b) => new Date(a.data) - new Date(b.data));
    sorted.forEach(report => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="timeline-date">${formatDate(report.data)}</div>
            <div class="timeline-content">
                <h5 class="timeline-title">${report.titulo}</h5>
                <p class="timeline-description">${report.descricao}</p>
            </div>
            <button class="btn btn--primary btn--sm">
                <i class="fas fa-download"></i> Baixar
            </button>
        `;
        timeline.appendChild(item);
    });
}

/**
 * Exibe um modal e realiza preenchimentos necessários (ex. lista de projetos).
 * @param {string} modalId ID do modal a ser exibido.
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('hidden');
    // Para o modal de beneficiário, preencher o select com projetos
    if (modalId === 'novoBeneficiarioModal') {
        const select = modal.querySelector('select');
        if (select) {
            select.innerHTML = '<option value="">Selecione um projeto</option>';
            appState.projetos.forEach(projeto => {
                const opt = document.createElement('option');
                opt.value = projeto.id;
                opt.textContent = projeto.nome;
                select.appendChild(opt);
            });
        }
    }
}

/**
 * Oculta um modal específico.
 * @param {string} modalId ID do modal a ser ocultado.
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

/**
 * Manipula o envio do formulário de novo projeto. Cria um novo projeto
 * com base nos dados inseridos e atualiza o dashboard e a lista de projetos.
 */
function handleNewProject(e) {
    e.preventDefault();
    const form = e.target;
    const nome = form.querySelector('input[type="text"]').value.trim();
    const tipo = form.querySelector('select').value;
    const numberInputs = form.querySelectorAll('input[type="number"]');
    const orcamento = numberInputs[0] ? Number(numberInputs[0].value) : 0;
    const metaBeneficiarios = numberInputs[1] ? Number(numberInputs[1].value) : 0;
    if (!nome || !tipo || !orcamento || !metaBeneficiarios) {
        alert('Preencha todos os campos para criar um projeto.');
        return;
    }
    const newProject = {
        id: Date.now(),
        nome,
        tipo_parceria: tipo,
        status: 'Planejamento',
        orcamento_total: orcamento,
        orcamento_executado: 0,
        beneficiarios_meta: metaBeneficiarios,
        beneficiarios_atual: 0,
        inicio: new Date().toISOString().split('T')[0],
        fim: '',
        progresso: 0
    };
    appState.projetos.push(newProject);
    hideModal('novoProjetoModal');
    // Limpa o formulário
    form.reset();
    renderProjectsGrid();
    updateDashboard();
}

/**
 * Manipula o envio do formulário de nova parceria. Adiciona a parceria ao estado.
 */
function handleNewParceria(e) {
    e.preventDefault();
    const form = e.target;
    const inputs = form.querySelectorAll('input[type="text"]');
    const orgao = inputs[0] ? inputs[0].value.trim() : '';
    const tipo = form.querySelector('select') ? form.querySelector('select').value : '';
    const objeto = form.querySelector('textarea') ? form.querySelector('textarea').value.trim() : '';
    if (!orgao || !tipo || !objeto) {
        alert('Preencha todos os campos para criar uma parceria.');
        return;
    }
    const newParceria = {
        id: Date.now(),
        orgao,
        tipo,
        objeto,
        status: 'Em análise'
    };
    appState.parcerias.push(newParceria);
    hideModal('novaParceriaModal');
    form.reset();
    renderParceriasList();
}

/**
 * Manipula o envio do formulário de novo beneficiário. Adiciona o beneficiário
 * ao estado e atualiza o número de beneficiários do projeto correspondente.
 */
function handleNewBeneficiario(e) {
    e.preventDefault();
    const form = e.target;
    const inputs = form.querySelectorAll('input[type="text"]');
    const nome = inputs[0] ? inputs[0].value.trim() : '';
    const cpf = inputs[1] ? inputs[1].value.trim() : '';
    const projetoId = form.querySelector('select') ? form.querySelector('select').value : '';
    if (!nome || !cpf || !projetoId) {
        alert('Preencha todos os campos para cadastrar o beneficiário.');
        return;
    }
    const projeto = appState.projetos.find(p => p.id == projetoId);
    const newBenef = {
        id: Date.now(),
        nome,
        cpf,
        projeto: projeto ? projeto.nome : '',
        cadastro: new Date().toISOString().split('T')[0]
    };
    appState.beneficiarios.push(newBenef);
    // Atualiza contagem de beneficiários no projeto
    if (projeto) {
        projeto.beneficiarios_atual = (projeto.beneficiarios_atual || 0) + 1;
        // Atualiza progresso do projeto (exemplo simples: percentual de beneficiários atendidos)
        if (projeto.beneficiarios_meta > 0) {
            const novoProgresso = Math.min(100, Math.round((projeto.beneficiarios_atual / projeto.beneficiarios_meta) * 100));
            projeto.progresso = novoProgresso;
        }
    }
    hideModal('novoBeneficiarioModal');
    form.reset();
    renderBeneficiarios();
    renderProjectsGrid();
    updateDashboard();
}

/**
 * Formata um número como moeda brasileira.
 * @param {number} value Valor a ser formatado.
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

/**
 * Formata uma string de data no formato AAAA-MM-DD para DD/MM/AAAA.
 * @param {string} dateString Data no formato ISO.
 */
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

/**
 * Retorna um label legível para o tipo de atividade.
 * @param {string} tipo Tipo de atividade (prestacao_contas, monitoramento, capacitacao).
 */
function getTipoAtividadeLabel(tipo) {
    const labels = {
        prestacao_contas: 'Prestação de Contas',
        monitoramento: 'Monitoramento',
        capacitacao: 'Capacitação'
    };
    return labels[tipo] || tipo;
}

/**
 * Ações de edição e visualização de projetos e beneficiários.
 * Para fins de demonstração, exibem apenas alertas simples.
 */
function editProject(id) {
    // Abre o modal de edição com os dados preenchidos
    openEditProject(id);
}
function viewProject(id) {
    const projeto = appState.projetos.find(p => p.id === id);
    if (projeto) {
        alert(`Detalhes do projeto:\n${projeto.nome}\nTipo de parceria: ${projeto.tipo_parceria}\nBeneficiários atendidos: ${projeto.beneficiarios_atual}/${projeto.beneficiarios_meta}`);
    }
}
function editBeneficiario(id) {
    // Abre o modal de edição com os dados do beneficiário
    openEditBeneficiario(id);
}

/**
 * Mostra notificações de exemplo na interface.
 */
function showNotifications() {
    alert('3 notificações:\n- Prestação de contas em 5 dias\n- Nova capacitação disponível\n- Reunião de monitoramento amanhã');
}

/**
 * Mostra configurações do sistema (placeholder).
 */
function showSettings() {
    alert('Configurações do sistema');
}

/**
 * Gera um relatório fictício de prestação de contas.
 */
function generateReport() {
    alert('Relatório gerado com sucesso! O download iniciará em breve.');
}

/**
 * Abre o modal de edição de projeto e pré-preenche os campos com os dados
 * do projeto selecionado. O identificador é salvo no dataset do formulário.
 * @param {number|string} id Identificador do projeto a ser editado
 */
function openEditProject(id) {
    const projeto = appState.projetos.find(p => p.id == id);
    if (!projeto) return;
    const form = document.getElementById('editProjetoForm');
    if (!form) return;
    // Armazena o ID em edição para uso no submit
    form.dataset.id = id;
    // Preenche campos
    form.elements['nome'].value = projeto.nome;
    form.elements['tipo'].value = projeto.tipo_parceria;
    form.elements['status'].value = projeto.status;
    form.elements['orcamento_total'].value = projeto.orcamento_total;
    form.elements['orcamento_executado'].value = projeto.orcamento_executado;
    form.elements['beneficiarios_meta'].value = projeto.beneficiarios_meta;
    form.elements['beneficiarios_atual'].value = projeto.beneficiarios_atual || 0;
    showModal('editProjetoModal');
}

/**
 * Trata o envio do formulário de edição de projeto, atualizando os dados
 * do projeto no estado global e recalculando o progresso com base nas
 * métricas de orçamento e beneficiários.
 * @param {Event} e Evento de submit
 */
function handleEditProjeto(e) {
    e.preventDefault();
    const form = e.target;
    const id = form.dataset.id;
    const projeto = appState.projetos.find(p => p.id == id);
    if (!projeto) return;
    // Atualiza valores do projeto com base no formulário
    projeto.nome = form.elements['nome'].value.trim();
    projeto.tipo_parceria = form.elements['tipo'].value;
    projeto.status = form.elements['status'].value;
    projeto.orcamento_total = Number(form.elements['orcamento_total'].value) || 0;
    projeto.orcamento_executado = Number(form.elements['orcamento_executado'].value) || 0;
    projeto.beneficiarios_meta = Number(form.elements['beneficiarios_meta'].value) || 0;
    projeto.beneficiarios_atual = Number(form.elements['beneficiarios_atual'].value) || 0;
    // Recalcula progresso como média simples entre execução orçamentária e atendimento de beneficiários
    const benefRatio = projeto.beneficiarios_meta > 0 ? projeto.beneficiarios_atual / projeto.beneficiarios_meta : 0;
    const budgetRatio = projeto.orcamento_total > 0 ? projeto.orcamento_executado / projeto.orcamento_total : 0;
    projeto.progresso = Math.min(100, Math.round((benefRatio + budgetRatio) * 50));
    // Fecha modal e atualiza telas
    hideModal('editProjetoModal');
    form.reset();
    renderProjectsGrid();
    updateDashboard();
}

/**
 * Abre o modal de edição de beneficiário, preenchendo dados atuais e
 * listando os projetos disponíveis. O ID do beneficiário fica salvo
 * no dataset do formulário.
 * @param {number|string} id Identificador do beneficiário
 */
function openEditBeneficiario(id) {
    const benef = appState.beneficiarios.find(b => b.id == id);
    if (!benef) return;
    const form = document.getElementById('editBeneficiarioForm');
    if (!form) return;
    form.dataset.id = id;
    // Preenche campos básicos
    form.elements['nome'].value = benef.nome;
    form.elements['cpf'].value = benef.cpf;
    // Preenche lista de projetos
    const select = form.elements['projeto'];
    select.innerHTML = '';
    appState.projetos.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.nome;
        select.appendChild(opt);
    });
    // Seleciona projeto atual
    const currentProject = appState.projetos.find(p => p.nome === benef.projeto);
    if (currentProject) {
        select.value = currentProject.id;
    }
    showModal('editBeneficiarioModal');
}

/**
 * Trata o envio do formulário de edição de beneficiário. Atualiza o
 * registro do beneficiário e, se o projeto for alterado, ajusta as
 * contagens de beneficiários de cada projeto, recalculando seus
 * progressos.
 * @param {Event} e Evento de submit
 */
function handleEditBeneficiario(e) {
    e.preventDefault();
    const form = e.target;
    const id = form.dataset.id;
    const benef = appState.beneficiarios.find(b => b.id == id);
    if (!benef) return;
    const oldProjectName = benef.projeto;
    // Atualiza campos
    benef.nome = form.elements['nome'].value.trim();
    benef.cpf = form.elements['cpf'].value.trim();
    const newProjectId = form.elements['projeto'].value;
    const newProject = appState.projetos.find(p => p.id == newProjectId);
    if (newProject) {
        benef.projeto = newProject.nome;
    }
    // Ajusta contagens de beneficiários se o projeto mudou
    if (oldProjectName !== benef.projeto) {
        const oldProj = appState.projetos.find(p => p.nome === oldProjectName);
        if (oldProj) {
            oldProj.beneficiarios_atual = Math.max(0, (oldProj.beneficiarios_atual || 0) - 1);
            const benefRatioOld = oldProj.beneficiarios_meta > 0 ? oldProj.beneficiarios_atual / oldProj.beneficiarios_meta : 0;
            const budgetRatioOld = oldProj.orcamento_total > 0 ? oldProj.orcamento_executado / oldProj.orcamento_total : 0;
            oldProj.progresso = Math.min(100, Math.round((benefRatioOld + budgetRatioOld) * 50));
        }
        if (newProject) {
            newProject.beneficiarios_atual = (newProject.beneficiarios_atual || 0) + 1;
            const benefRatioNew = newProject.beneficiarios_meta > 0 ? newProject.beneficiarios_atual / newProject.beneficiarios_meta : 0;
            const budgetRatioNew = newProject.orcamento_total > 0 ? newProject.orcamento_executado / newProject.orcamento_total : 0;
            newProject.progresso = Math.min(100, Math.round((benefRatioNew + budgetRatioNew) * 50));
        }
    }
    hideModal('editBeneficiarioModal');
    form.reset();
    renderBeneficiarios();
    renderProjectsGrid();
    updateDashboard();
}
