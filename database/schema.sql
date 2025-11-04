-- ============================================
-- GESTÃO FÁCIL - SCHEMA SQLite COMPLETO
-- Sistema de Gestão para Técnicos e Empreendedores
-- Versão 2.0 - Modelagem Completa de Todos os Módulos
-- ============================================

-- ============================================
-- 1. PROFISSIONAL (Dono do App)
-- ============================================
CREATE TABLE IF NOT EXISTS profissional (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  nome_negocio TEXT,
  segmento TEXT NOT NULL CHECK(segmento IN (
    'Informática', 'Eletrônica', 'Refrigeração', 'Elétrica', 
    'Hidráulica', 'Automotivo', 'Celulares', 'Eletrodomésticos', 'Outro'
  )),
  telefone TEXT,
  email TEXT,
  documento TEXT, -- CPF/CNPJ
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  logo_base64 TEXT,
  foto_perfil_base64 TEXT,
  dados_adicionais TEXT, -- JSON para campos específicos do segmento
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. CONFIGURAÇÕES DE TEMA
-- ============================================
CREATE TABLE IF NOT EXISTS configuracoes_tema (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cor_primaria TEXT NOT NULL DEFAULT '#007AFF',
  cor_secundaria TEXT NOT NULL DEFAULT '#5856D6',
  cor_destaque TEXT NOT NULL DEFAULT '#FF9500',
  modo_escuro INTEGER NOT NULL DEFAULT 0,
  paleta_id TEXT,
  paleta_nome TEXT,
  aplicado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configuração padrão
INSERT OR IGNORE INTO configuracoes_tema (id, cor_primaria, cor_secundaria, cor_destaque, modo_escuro)
VALUES (1, '#007AFF', '#5856D6', '#FF9500', 0);

-- ============================================
-- 3. CLIENTES
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  documento TEXT, -- CPF/CNPJ
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  latitude REAL,
  longitude REAL,
  observacoes TEXT,
  is_favorite INTEGER DEFAULT 0,
  data_aniversario DATE,
  ativo INTEGER DEFAULT 1,
  dados_adicionais TEXT, -- JSON
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_clientes_telefone ON clientes(telefone);
CREATE INDEX idx_clientes_ativo ON clientes(ativo);
CREATE INDEX idx_clientes_favorito ON clientes(is_favorite);

-- ============================================
-- 4. EQUIPAMENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS equipamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  type TEXT NOT NULL, -- Ex: Ar condicionado, Geladeira, Notebook, Veículo
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  year_manufacture INTEGER,
  placa TEXT, -- Para veículos
  chassi TEXT, -- Para veículos
  km_atual INTEGER, -- Para veículos
  capacidade TEXT, -- Ex: 12000 BTUs, 500L
  voltagem TEXT,
  dados_tecnicos TEXT, -- JSON com campos específicos do tipo/segmento
  notes TEXT,
  photos TEXT, -- JSON array de base64 ou URIs
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE INDEX idx_equipamentos_cliente ON equipamentos(client_id);
CREATE INDEX idx_equipamentos_tipo ON equipamentos(type);
CREATE INDEX idx_equipamentos_ativo ON equipamentos(ativo);

-- ============================================
-- 5. ORÇAMENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS orcamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_orcamento TEXT UNIQUE NOT NULL,
  cliente_id INTEGER NOT NULL,
  equipamento_id INTEGER,
  data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
  validade_dias INTEGER DEFAULT 30,
  data_validade DATETIME,
  status TEXT DEFAULT 'pendente' CHECK(status IN (
    'pendente', 'aprovado', 'rejeitado', 'expirado', 'convertido'
  )),
  problema_relatado TEXT,
  diagnostico_preliminar TEXT,
  valor_pecas REAL DEFAULT 0,
  valor_servicos REAL DEFAULT 0,
  valor_desconto REAL DEFAULT 0,
  valor_total REAL DEFAULT 0,
  observacoes TEXT,
  condicoes_pagamento TEXT,
  prazo_execucao TEXT,
  garantia TEXT,
  assinatura_cliente_base64 TEXT,
  data_assinatura DATETIME,
  convertido_os_id INTEGER, -- ID da OS gerada
  campos_personalizados TEXT, -- JSON dinâmico por segmento
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE SET NULL,
  FOREIGN KEY (convertido_os_id) REFERENCES ordens_servico(id) ON DELETE SET NULL
);

CREATE INDEX idx_orcamentos_cliente ON orcamentos(cliente_id);
CREATE INDEX idx_orcamentos_status ON orcamentos(status);
CREATE INDEX idx_orcamentos_numero ON orcamentos(numero_orcamento);
CREATE INDEX idx_orcamentos_validade ON orcamentos(data_validade);

-- ============================================
-- 6. ITENS DE ORÇAMENTO
-- ============================================
CREATE TABLE IF NOT EXISTS itens_orcamento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orcamento_id INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('peca', 'servico')),
  produto_id INTEGER, -- NULL se for item personalizado
  descricao TEXT NOT NULL,
  quantidade REAL DEFAULT 1,
  unidade_medida TEXT DEFAULT 'UN',
  valor_unitario REAL DEFAULT 0,
  valor_desconto REAL DEFAULT 0,
  valor_total REAL DEFAULT 0,
  observacoes TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE SET NULL
);

CREATE INDEX idx_itens_orcamento_orcamento ON itens_orcamento(orcamento_id);
CREATE INDEX idx_itens_orcamento_produto ON itens_orcamento(produto_id);

-- ============================================
-- 7. ORDENS DE SERVIÇO
-- ============================================
CREATE TABLE IF NOT EXISTS ordens_servico (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_os TEXT UNIQUE NOT NULL,
  cliente_id INTEGER NOT NULL,
  equipamento_id INTEGER,
  orcamento_id INTEGER, -- Se foi gerada de um orçamento
  data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_previsao DATETIME,
  data_conclusao DATETIME,
  status TEXT DEFAULT 'aguardando' CHECK(status IN (
    'aguardando', 'em_andamento', 'aguardando_pecas', 'concluido', 'cancelado', 'aguardando_aprovacao'
  )),
  prioridade TEXT DEFAULT 'normal' CHECK(prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  tipo_servico TEXT CHECK(tipo_servico IN (
    'garantia', 'manutencao', 'instalacao', 'reparo', 'orcamento', 'preventiva'
  )),
  problema_relatado TEXT,
  diagnostico TEXT,
  solucao TEXT,
  tecnico_responsavel TEXT,
  colaborador_id INTEGER,
  valor_pecas REAL DEFAULT 0,
  valor_servicos REAL DEFAULT 0,
  valor_desconto REAL DEFAULT 0,
  valor_total REAL DEFAULT 0,
  valor_pago REAL DEFAULT 0,
  valor_pendente REAL DEFAULT 0,
  status_pagamento TEXT DEFAULT 'pendente' CHECK(status_pagamento IN (
    'pendente', 'pago_parcial', 'pago', 'cancelado'
  )),
  observacoes TEXT,
  observacoes_internas TEXT, -- Visível apenas para o técnico
  garantia_dias INTEGER,
  assinatura_cliente_base64 TEXT,
  data_assinatura DATETIME,
  avaliacao INTEGER CHECK(avaliacao >= 1 AND avaliacao <= 5),
  comentario_cliente TEXT,
  campos_personalizados TEXT, -- JSON dinâmico por segmento
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE SET NULL,
  FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id) ON DELETE SET NULL,
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE SET NULL
);

CREATE INDEX idx_os_cliente ON ordens_servico(cliente_id);
CREATE INDEX idx_os_equipamento ON ordens_servico(equipamento_id);
CREATE INDEX idx_os_status ON ordens_servico(status);
CREATE INDEX idx_os_numero ON ordens_servico(numero_os);
CREATE INDEX idx_os_data_abertura ON ordens_servico(data_abertura);
CREATE INDEX idx_os_status_pagamento ON ordens_servico(status_pagamento);

-- ============================================
-- 8. ITENS DE ORDEM DE SERVIÇO
-- ============================================
CREATE TABLE IF NOT EXISTS itens_os (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  os_id INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('peca', 'servico')),
  produto_id INTEGER,
  descricao TEXT NOT NULL,
  quantidade REAL DEFAULT 1,
  unidade_medida TEXT DEFAULT 'UN',
  valor_unitario REAL DEFAULT 0,
  valor_desconto REAL DEFAULT 0,
  valor_total REAL DEFAULT 0,
  aplicado INTEGER DEFAULT 0, -- Se a peça/serviço já foi aplicado
  observacoes TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (os_id) REFERENCES ordens_servico(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE SET NULL
);

CREATE INDEX idx_itens_os_os ON itens_os(os_id);
CREATE INDEX idx_itens_os_produto ON itens_os(produto_id);

-- ============================================
-- 9. PRODUTOS (Peças e Serviços)
-- ============================================
CREATE TABLE IF NOT EXISTS produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL CHECK(tipo IN ('peca', 'servico')),
  codigo TEXT UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  marca TEXT,
  unidade_medida TEXT DEFAULT 'UN',
  controla_estoque INTEGER DEFAULT 0,
  estoque_atual REAL DEFAULT 0,
  estoque_minimo REAL DEFAULT 0,
  valor_custo REAL DEFAULT 0,
  valor_venda REAL DEFAULT 0,
  margem_lucro REAL DEFAULT 0,
  fornecedor TEXT,
  codigo_barras TEXT,
  localizacao TEXT, -- Onde está armazenado
  caracteristicas TEXT, -- JSON dinâmico por segmento
  ativo INTEGER DEFAULT 1,
  observacoes TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_produtos_tipo ON produtos(tipo);
CREATE INDEX idx_produtos_nome ON produtos(nome);
CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);
CREATE INDEX idx_produtos_estoque_baixo ON produtos(estoque_atual, estoque_minimo) 
  WHERE controla_estoque = 1 AND estoque_atual <= estoque_minimo;

-- ============================================
-- 10. MOVIMENTAÇÕES DE ESTOQUE
-- ============================================
CREATE TABLE IF NOT EXISTS estoque_movimentacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produto_id INTEGER NOT NULL,
  tipo_movimentacao TEXT NOT NULL CHECK(tipo_movimentacao IN (
    'entrada', 'saida', 'ajuste', 'devolucao', 'inventario'
  )),
  quantidade REAL NOT NULL,
  estoque_anterior REAL DEFAULT 0,
  estoque_novo REAL DEFAULT 0,
  motivo TEXT,
  os_id INTEGER, -- Se foi usado em uma OS
  valor_unitario REAL DEFAULT 0,
  valor_total REAL DEFAULT 0,
  documento TEXT, -- Nota fiscal, etc
  observacoes TEXT,
  data_movimentacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  FOREIGN KEY (os_id) REFERENCES ordens_servico(id) ON DELETE SET NULL
);

CREATE INDEX idx_movimentacoes_produto ON estoque_movimentacoes(produto_id);
CREATE INDEX idx_movimentacoes_data ON estoque_movimentacoes(data_movimentacao);
CREATE INDEX idx_movimentacoes_tipo ON estoque_movimentacoes(tipo_movimentacao);

-- ============================================
-- 11. COLABORADORES
-- ============================================
CREATE TABLE IF NOT EXISTS colaboradores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  documento TEXT,
  funcao TEXT,
  percentual_comissao REAL DEFAULT 0,
  salario REAL DEFAULT 0,
  data_admissao DATE,
  data_demissao DATE,
  ativo INTEGER DEFAULT 1,
  observacoes TEXT,
  dados_adicionais TEXT, -- JSON
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_colaboradores_nome ON colaboradores(nome);
CREATE INDEX idx_colaboradores_ativo ON colaboradores(ativo);

-- ============================================
-- 12. COMISSÕES
-- ============================================
CREATE TABLE IF NOT EXISTS comissoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  colaborador_id INTEGER NOT NULL,
  os_id INTEGER NOT NULL,
  tipo_calculo TEXT DEFAULT 'percentual' CHECK(tipo_calculo IN (
    'percentual', 'valor_fixo'
  )),
  valor_base REAL DEFAULT 0, -- Valor sobre o qual incide a comissão
  percentual REAL DEFAULT 0,
  valor_comissao REAL DEFAULT 0,
  data_servico DATETIME,
  status_pagamento TEXT DEFAULT 'pendente' CHECK(status_pagamento IN (
    'pendente', 'pago', 'cancelado'
  )),
  data_pagamento DATETIME,
  forma_pagamento TEXT,
  observacoes TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE,
  FOREIGN KEY (os_id) REFERENCES ordens_servico(id) ON DELETE CASCADE
);

CREATE INDEX idx_comissoes_colaborador ON comissoes(colaborador_id);
CREATE INDEX idx_comissoes_os ON comissoes(os_id);
CREATE INDEX idx_comissoes_status ON comissoes(status_pagamento);

-- ============================================
-- 13. CONTAS A RECEBER
-- ============================================
CREATE TABLE IF NOT EXISTS contas_receber (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER,
  os_id INTEGER,
  orcamento_id INTEGER,
  descricao TEXT NOT NULL,
  numero_documento TEXT,
  valor REAL NOT NULL,
  valor_recebido REAL DEFAULT 0,
  valor_pendente REAL DEFAULT 0,
  data_emissao DATE DEFAULT CURRENT_DATE,
  data_vencimento DATE NOT NULL,
  data_recebimento DATE,
  status TEXT DEFAULT 'pendente' CHECK(status IN (
    'pendente', 'recebido', 'atrasado', 'cancelado'
  )),
  forma_pagamento TEXT CHECK(forma_pagamento IN (
    'dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 
    'transferencia', 'boleto', 'cheque', 'outro'
  )),
  categoria TEXT,
  observacoes TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
  FOREIGN KEY (os_id) REFERENCES ordens_servico(id) ON DELETE SET NULL,
  FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id) ON DELETE SET NULL
);

CREATE INDEX idx_contas_receber_cliente ON contas_receber(cliente_id);
CREATE INDEX idx_contas_receber_status ON contas_receber(status);
CREATE INDEX idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX idx_contas_receber_vencidas ON contas_receber(data_vencimento, status) 
  WHERE status = 'pendente' AND data_vencimento < date('now');

-- ============================================
-- 14. CONTAS A PAGAR
-- ============================================
CREATE TABLE IF NOT EXISTS contas_pagar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categoria TEXT NOT NULL CHECK(categoria IN (
    'aluguel', 'energia', 'agua', 'telefone', 'internet',
    'fornecedor', 'salario', 'comissao', 'impostos', 
    'equipamento', 'manutencao', 'marketing', 'outros'
  )),
  descricao TEXT NOT NULL,
  fornecedor TEXT,
  numero_documento TEXT,
  valor REAL NOT NULL,
  valor_pago REAL DEFAULT 0,
  valor_pendente REAL DEFAULT 0,
  data_emissao DATE DEFAULT CURRENT_DATE,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT DEFAULT 'pendente' CHECK(status IN (
    'pendente', 'pago', 'atrasado', 'cancelado'
  )),
  forma_pagamento TEXT CHECK(forma_pagamento IN (
    'dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 
    'transferencia', 'boleto', 'cheque', 'outro'
  )),
  recorrente INTEGER DEFAULT 0, -- Se é uma despesa fixa mensal
  observacoes TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contas_pagar_categoria ON contas_pagar(categoria);
CREATE INDEX idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX idx_contas_pagar_recorrente ON contas_pagar(recorrente);
CREATE INDEX idx_contas_pagar_vencidas ON contas_pagar(data_vencimento, status) 
  WHERE status = 'pendente' AND data_vencimento < date('now');

-- ============================================
-- 15. LANÇAMENTOS DE CAIXA
-- ============================================
CREATE TABLE IF NOT EXISTS lancamentos_caixa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL CHECK(tipo IN ('entrada', 'saida')),
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  forma_pagamento TEXT,
  conta_receber_id INTEGER,
  conta_pagar_id INTEGER,
  os_id INTEGER,
  data_lancamento DATE DEFAULT CURRENT_DATE,
  observacoes TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conta_receber_id) REFERENCES contas_receber(id) ON DELETE SET NULL,
  FOREIGN KEY (conta_pagar_id) REFERENCES contas_pagar(id) ON DELETE SET NULL,
  FOREIGN KEY (os_id) REFERENCES ordens_servico(id) ON DELETE SET NULL
);

CREATE INDEX idx_lancamentos_tipo ON lancamentos_caixa(tipo);
CREATE INDEX idx_lancamentos_data ON lancamentos_caixa(data_lancamento);
CREATE INDEX idx_lancamentos_categoria ON lancamentos_caixa(categoria);

-- ============================================
-- 16. MANUTENÇÕES PREVENTIVAS
-- ============================================
CREATE TABLE IF NOT EXISTS preventivas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  equipamento_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  periodicidade TEXT NOT NULL CHECK(periodicidade IN (
    'mensal', 'bimestral', 'trimestral', 'semestral', 'anual', 'personalizado'
  )),
  dias_intervalo INTEGER, -- Para periodicidade personalizada
  ultima_execucao DATE,
  proxima_execucao DATE NOT NULL,
  notificar_dias_antes INTEGER DEFAULT 7,
  ativo INTEGER DEFAULT 1,
  observacoes TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE
);

CREATE INDEX idx_preventivas_cliente ON preventivas(cliente_id);
CREATE INDEX idx_preventivas_equipamento ON preventivas(equipamento_id);
CREATE INDEX idx_preventivas_proxima_execucao ON preventivas(proxima_execucao);
CREATE INDEX idx_preventivas_ativo ON preventivas(ativo);
CREATE INDEX idx_preventivas_proximas ON preventivas(proxima_execucao, ativo) 
  WHERE ativo = 1 AND proxima_execucao <= date('now', '+30 days');

-- ============================================
-- 17. HISTÓRICO DE PREVENTIVAS
-- ============================================
CREATE TABLE IF NOT EXISTS historico_preventivas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  preventiva_id INTEGER NOT NULL,
  os_id INTEGER, -- OS gerada para executar a preventiva
  data_execucao DATE NOT NULL,
  executado_por TEXT,
  observacoes TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (preventiva_id) REFERENCES preventivas(id) ON DELETE CASCADE,
  FOREIGN KEY (os_id) REFERENCES ordens_servico(id) ON DELETE SET NULL
);

CREATE INDEX idx_historico_preventivas_preventiva ON historico_preventivas(preventiva_id);
CREATE INDEX idx_historico_preventivas_data ON historico_preventivas(data_execucao);

-- ============================================
-- 18. NOTIFICAÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS notificacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL CHECK(tipo IN (
    'vencimento', 'preventiva', 'estoque', 'aniversario', 
    'os_atrasada', 'orcamento_expirado', 'lembrete', 'geral'
  )),
  prioridade TEXT DEFAULT 'media' CHECK(prioridade IN (
    'baixa', 'media', 'alta', 'urgente'
  )),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK(status IN (
    'pendente', 'lida', 'arquivada'
  )),
  referencia_tipo TEXT, -- cliente, os, orcamento, equipamento, etc
  referencia_id INTEGER,
  data_notificacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_leitura DATETIME,
  acao_tipo TEXT, -- abrir_os, abrir_cliente, etc
  acao_dados TEXT, -- JSON com dados da ação
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notificacoes_tipo ON notificacoes(tipo);
CREATE INDEX idx_notificacoes_status ON notificacoes(status);
CREATE INDEX idx_notificacoes_prioridade ON notificacoes(prioridade);
CREATE INDEX idx_notificacoes_data ON notificacoes(data_notificacao);
CREATE INDEX idx_notificacoes_pendentes ON notificacoes(status, prioridade, data_notificacao) 
  WHERE status = 'pendente';

-- ============================================
-- 19. MENSAGENS WHATSAPP
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_mensagens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN (
    'orcamento', 'lembrete', 'confirmacao', 'follow_up', 'aniversario', 'manual'
  )),
  mensagem TEXT NOT NULL,
  status TEXT DEFAULT 'enviada' CHECK(status IN (
    'enviada', 'entregue', 'lida', 'erro'
  )),
  referencia_tipo TEXT, -- os, orcamento, preventiva
  referencia_id INTEGER,
  data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_entrega DATETIME,
  data_leitura DATETIME,
  erro_mensagem TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE INDEX idx_whatsapp_cliente ON whatsapp_mensagens(cliente_id);
CREATE INDEX idx_whatsapp_tipo ON whatsapp_mensagens(tipo);
CREATE INDEX idx_whatsapp_status ON whatsapp_mensagens(status);
CREATE INDEX idx_whatsapp_data ON whatsapp_mensagens(data_envio);

-- ============================================
-- 20. BUSCA FAVORITOS (Filtros Salvos)
-- ============================================
CREATE TABLE IF NOT EXISTS busca_favoritos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  tipo_busca TEXT NOT NULL CHECK(tipo_busca IN (
    'clientes', 'equipamentos', 'os', 'orcamentos', 
    'produtos', 'financeiro', 'preventivas'
  )),
  filtros TEXT NOT NULL, -- JSON com os filtros aplicados
  ordem INTEGER DEFAULT 0,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_busca_favoritos_tipo ON busca_favoritos(tipo_busca);
CREATE INDEX idx_busca_favoritos_ordem ON busca_favoritos(ordem);

-- ============================================
-- 21. BACKUPS
-- ============================================
CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo_backup TEXT NOT NULL CHECK(tipo_backup IN (
    'completo', 'apenas_dados', 'apenas_configuracoes'
  )),
  tamanho_bytes INTEGER,
  arquivo_uri TEXT,
  destino TEXT DEFAULT 'local', -- local, google_drive, dropbox
  status TEXT DEFAULT 'concluido' CHECK(status IN (
    'em_andamento', 'concluido', 'erro'
  )),
  erro_mensagem TEXT,
  data_backup DATETIME DEFAULT CURRENT_TIMESTAMP,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_backups_data ON backups(data_backup);
CREATE INDEX idx_backups_tipo ON backups(tipo_backup);
CREATE INDEX idx_backups_status ON backups(status);

-- ============================================
-- 22. ANEXOS
-- ============================================
CREATE TABLE IF NOT EXISTS anexos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referencia_tipo TEXT NOT NULL CHECK(referencia_tipo IN (
    'os', 'orcamento', 'cliente', 'equipamento', 'produto', 'preventiva'
  )),
  referencia_id INTEGER NOT NULL,
  tipo_arquivo TEXT CHECK(tipo_arquivo IN (
    'foto', 'documento', 'audio', 'video', 'pdf', 'outro'
  )),
  nome_arquivo TEXT NOT NULL,
  caminho_arquivo TEXT NOT NULL, -- URI ou base64
  tamanho INTEGER,
  mime_type TEXT,
  descricao TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_anexos_referencia ON anexos(referencia_tipo, referencia_id);
CREATE INDEX idx_anexos_tipo ON anexos(tipo_arquivo);

-- ============================================
-- 23. LEMBRETES E ANOTAÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS lembretes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_lembrete DATETIME NOT NULL,
  tipo TEXT CHECK(tipo IN ('geral', 'cliente', 'os', 'equipamento', 'orcamento')),
  referencia_id INTEGER, -- ID da entidade relacionada
  concluido INTEGER DEFAULT 0,
  data_conclusao DATETIME,
  prioridade TEXT DEFAULT 'normal' CHECK(prioridade IN ('baixa', 'normal', 'alta')),
  observacoes TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lembretes_data ON lembretes(data_lembrete);
CREATE INDEX idx_lembretes_concluido ON lembretes(concluido);
CREATE INDEX idx_lembretes_tipo ON lembretes(tipo);
CREATE INDEX idx_lembretes_pendentes ON lembretes(concluido, data_lembrete) 
  WHERE concluido = 0 AND data_lembrete <= datetime('now', '+7 days');

-- ============================================
-- 24. CONFIGURAÇÕES GERAIS
-- ============================================
CREATE TABLE IF NOT EXISTS configuracoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chave TEXT UNIQUE NOT NULL,
  valor TEXT,
  tipo TEXT CHECK(tipo IN ('string', 'number', 'boolean', 'json')),
  descricao TEXT,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT OR IGNORE INTO configuracoes (chave, valor, tipo, descricao) VALUES
  -- Numeração
  ('formato_numero_os', 'OS-{numero}', 'string', 'Formato da numeração de OS'),
  ('formato_numero_orcamento', 'ORC-{numero}', 'string', 'Formato da numeração de orçamentos'),
  ('ultimo_numero_os', '0', 'number', 'Último número de OS gerado'),
  ('ultimo_numero_orcamento', '0', 'number', 'Último número de orçamento gerado'),
  
  -- Padrões de negócio
  ('dias_validade_orcamento', '30', 'number', 'Dias de validade padrão para orçamentos'),
  ('dias_garantia_padrao', '90', 'number', 'Dias de garantia padrão'),
  ('prazo_execucao_padrao', '7', 'number', 'Prazo de execução padrão em dias'),
  
  -- Financeiro
  ('moeda', 'BRL', 'string', 'Moeda padrão'),
  ('metodo_pagamento_padrao', 'pix', 'string', 'Método de pagamento padrão'),
  
  -- Notificações
  ('notificar_vencimentos', 'true', 'boolean', 'Notificar vencimentos de contas'),
  ('notificar_preventivas', 'true', 'boolean', 'Notificar manutenções preventivas'),
  ('notificar_estoque', 'true', 'boolean', 'Notificar estoque baixo'),
  ('notificar_aniversarios', 'true', 'boolean', 'Notificar aniversários de clientes'),
  ('dias_antecedencia_vencimento', '3', 'number', 'Dias de antecedência para notificar vencimentos'),
  
  -- Backup
  ('backup_automatico', 'true', 'boolean', 'Habilitar backup automático'),
  ('backup_frequencia', 'semanal', 'string', 'Frequência de backup: diario, semanal, mensal'),
  ('backup_destino', 'local', 'string', 'Destino do backup: local, google_drive'),
  ('data_ultimo_backup', '', 'string', 'Data do último backup'),
  
  -- Segurança
  ('senha_habilitada', 'false', 'boolean', 'Senha de acesso habilitada'),
  ('biometria_habilitada', 'false', 'boolean', 'Biometria habilitada'),
  ('timeout_inatividade', '0', 'number', 'Tempo de inatividade para bloquear (minutos, 0=desabilitado)'),
  
  -- WhatsApp
  ('whatsapp_integrado', 'false', 'boolean', 'Integração WhatsApp habilitada'),
  ('whatsapp_mensagem_automatica', 'true', 'boolean', 'Enviar mensagens automáticas'),
  
  -- App
  ('primeiro_acesso', 'true', 'boolean', 'Indica se é o primeiro acesso ao app'),
  ('onboarding_completo', 'false', 'boolean', 'Onboarding foi completado'),
  ('versao_schema', '2.0', 'string', 'Versão do schema do banco de dados');

-- ============================================
-- 25. LOG DE ATIVIDADES (Auditoria)
-- ============================================
CREATE TABLE IF NOT EXISTS log_atividades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tabela TEXT NOT NULL,
  registro_id INTEGER NOT NULL,
  acao TEXT NOT NULL CHECK(acao IN ('insert', 'update', 'delete')),
  dados_anteriores TEXT, -- JSON
  dados_novos TEXT, -- JSON
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_log_tabela ON log_atividades(tabela, registro_id);
CREATE INDEX idx_log_data ON log_atividades(criado_em);
CREATE INDEX idx_log_acao ON log_atividades(acao);

-- ============================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ============================================

-- Atualizar timestamp em profissional
CREATE TRIGGER IF NOT EXISTS trigger_profissional_updated
AFTER UPDATE ON profissional
BEGIN
  UPDATE profissional SET atualizado_em = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Atualizar timestamp em clientes
CREATE TRIGGER IF NOT EXISTS trigger_clientes_updated
AFTER UPDATE ON clientes
BEGIN
  UPDATE clientes SET atualizado_em = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Atualizar timestamp em equipamentos
CREATE TRIGGER IF NOT EXISTS trigger_equipamentos_updated
AFTER UPDATE ON equipamentos
BEGIN
  UPDATE equipamentos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Atualizar timestamp em orçamentos
CREATE TRIGGER IF NOT EXISTS trigger_orcamentos_updated
AFTER UPDATE ON orcamentos
BEGIN
  UPDATE orcamentos SET atualizado_em = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Atualizar timestamp em ordens de serviço
CREATE TRIGGER IF NOT EXISTS trigger_os_updated
AFTER UPDATE ON ordens_servico
BEGIN
  UPDATE ordens_servico SET atualizado_em = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Atualizar timestamp em produtos
CREATE TRIGGER IF NOT EXISTS trigger_produtos_updated
AFTER UPDATE ON produtos
BEGIN
  UPDATE produtos SET atualizado_em = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Atualizar estoque após movimentação
CREATE TRIGGER IF NOT EXISTS trigger_atualizar_estoque
AFTER INSERT ON estoque_movimentacoes
BEGIN
  UPDATE produtos 
  SET estoque_atual = NEW.estoque_novo,
      atualizado_em = CURRENT_TIMESTAMP
  WHERE id = NEW.produto_id;
  
  -- Criar notificação se estoque ficar abaixo do mínimo
  INSERT INTO notificacoes (tipo, prioridade, titulo, mensagem, referencia_tipo, referencia_id)
  SELECT 
    'estoque',
    'alta',
    'Estoque baixo: ' || p.nome,
    'O produto ' || p.nome || ' está com estoque de ' || NEW.estoque_novo || ' ' || p.unidade_medida || '. Mínimo: ' || p.estoque_minimo,
    'produto',
    p.id
  FROM produtos p
  WHERE p.id = NEW.produto_id 
    AND p.controla_estoque = 1 
    AND NEW.estoque_novo <= p.estoque_minimo
    AND NEW.estoque_novo > 0;
END;

-- Calcular estoque antes de inserir movimentação
CREATE TRIGGER IF NOT EXISTS trigger_calcular_estoque_movimentacao
BEFORE INSERT ON estoque_movimentacoes
BEGIN
  SELECT 
    CASE NEW.estoque_anterior
      WHEN NULL THEN (SELECT COALESCE(estoque_atual, 0) FROM produtos WHERE id = NEW.produto_id)
      ELSE NEW.estoque_anterior
    END,
    CASE NEW.estoque_novo
      WHEN NULL THEN (
        SELECT COALESCE(estoque_atual, 0) + 
          CASE NEW.tipo_movimentacao
            WHEN 'entrada' THEN NEW.quantidade
            WHEN 'saida' THEN -NEW.quantidade
            WHEN 'ajuste' THEN NEW.quantidade
            WHEN 'devolucao' THEN NEW.quantidade
            WHEN 'inventario' THEN NEW.quantidade - COALESCE(estoque_atual, 0)
            ELSE 0
          END
        FROM produtos WHERE id = NEW.produto_id
      )
      ELSE NEW.estoque_novo
    END
  INTO NEW.estoque_anterior, NEW.estoque_novo;
END;

-- Atualizar valor pendente em contas a receber
CREATE TRIGGER IF NOT EXISTS trigger_atualizar_pendente_receber
AFTER UPDATE OF valor_recebido ON contas_receber
BEGIN
  UPDATE contas_receber 
  SET 
    valor_pendente = valor - valor_recebido,
    status = CASE 
      WHEN valor_recebido >= valor THEN 'recebido'
      WHEN date(data_vencimento) < date('now') AND valor_recebido < valor THEN 'atrasado'
      ELSE 'pendente'
    END,
    atualizado_em = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- Atualizar valor pendente em contas a pagar
CREATE TRIGGER IF NOT EXISTS trigger_atualizar_pendente_pagar
AFTER UPDATE OF valor_pago ON contas_pagar
BEGIN
  UPDATE contas_pagar 
  SET 
    valor_pendente = valor - valor_pago,
    status = CASE 
      WHEN valor_pago >= valor THEN 'pago'
      WHEN date(data_vencimento) < date('now') AND valor_pago < valor THEN 'atrasado'
      ELSE 'pendente'
    END,
    atualizado_em = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- Criar notificação para contas vencidas
CREATE TRIGGER IF NOT EXISTS trigger_notificar_conta_receber_vencida
AFTER UPDATE OF status ON contas_receber
WHEN NEW.status = 'atrasado' AND OLD.status != 'atrasado'
BEGIN
  INSERT INTO notificacoes (tipo, prioridade, titulo, mensagem, referencia_tipo, referencia_id)
  VALUES (
    'vencimento',
    'alta',
    'Conta vencida',
    'A conta "' || NEW.descricao || '" venceu em ' || date(NEW.data_vencimento, 'localtime') || '. Valor: R$ ' || printf('%.2f', NEW.valor_pendente),
    'conta_receber',
    NEW.id
  );
END;

-- Atualizar próxima execução de preventiva
CREATE TRIGGER IF NOT EXISTS trigger_atualizar_proxima_preventiva
AFTER INSERT ON historico_preventivas
BEGIN
  UPDATE preventivas
  SET 
    ultima_execucao = NEW.data_execucao,
    proxima_execucao = CASE periodicidade
      WHEN 'mensal' THEN date(NEW.data_execucao, '+1 month')
      WHEN 'bimestral' THEN date(NEW.data_execucao, '+2 months')
      WHEN 'trimestral' THEN date(NEW.data_execucao, '+3 months')
      WHEN 'semestral' THEN date(NEW.data_execucao, '+6 months')
      WHEN 'anual' THEN date(NEW.data_execucao, '+1 year')
      WHEN 'personalizado' THEN date(NEW.data_execucao, '+' || dias_intervalo || ' days')
      ELSE date(NEW.data_execucao, '+1 month')
    END,
    atualizado_em = CURRENT_TIMESTAMP
  WHERE id = NEW.preventiva_id;
END;

-- Criar notificação para preventiva próxima
CREATE TRIGGER IF NOT EXISTS trigger_notificar_preventiva_proxima
AFTER UPDATE OF proxima_execucao ON preventivas
WHEN NEW.ativo = 1 
  AND date(NEW.proxima_execucao) <= date('now', '+' || NEW.notificar_dias_antes || ' days')
  AND (OLD.proxima_execucao IS NULL OR date(OLD.proxima_execucao) != date(NEW.proxima_execucao))
BEGIN
  INSERT INTO notificacoes (tipo, prioridade, titulo, mensagem, referencia_tipo, referencia_id)
  SELECT 
    'preventiva',
    'media',
    'Manutenção preventiva próxima',
    'A manutenção "' || p.titulo || '" do cliente ' || c.nome || ' está agendada para ' || date(p.proxima_execucao, 'localtime'),
    'preventiva',
    p.id
  FROM preventivas p
  JOIN clientes c ON p.cliente_id = c.id
  WHERE p.id = NEW.id;
END;

-- Atualizar valor total do orçamento
CREATE TRIGGER IF NOT EXISTS trigger_calcular_total_orcamento
AFTER INSERT ON itens_orcamento
BEGIN
  UPDATE orcamentos
  SET 
    valor_pecas = (
      SELECT COALESCE(SUM(valor_total), 0) 
      FROM itens_orcamento 
      WHERE orcamento_id = NEW.orcamento_id AND tipo = 'peca'
    ),
    valor_servicos = (
      SELECT COALESCE(SUM(valor_total), 0) 
      FROM itens_orcamento 
      WHERE orcamento_id = NEW.orcamento_id AND tipo = 'servico'
    ),
    atualizado_em = CURRENT_TIMESTAMP
  WHERE id = NEW.orcamento_id;
  
  UPDATE orcamentos
  SET 
    valor_total = valor_pecas + valor_servicos - valor_desconto,
    atualizado_em = CURRENT_TIMESTAMP
  WHERE id = NEW.orcamento_id;
END;

-- Atualizar valor total da OS
CREATE TRIGGER IF NOT EXISTS trigger_calcular_total_os
AFTER INSERT ON itens_os
BEGIN
  UPDATE ordens_servico
  SET 
    valor_pecas = (
      SELECT COALESCE(SUM(valor_total), 0) 
      FROM itens_os 
      WHERE os_id = NEW.os_id AND tipo = 'peca'
    ),
    valor_servicos = (
      SELECT COALESCE(SUM(valor_total), 0) 
      FROM itens_os 
      WHERE os_id = NEW.os_id AND tipo = 'servico'
    ),
    atualizado_em = CURRENT_TIMESTAMP
  WHERE id = NEW.os_id;
  
  UPDATE ordens_servico
  SET 
    valor_total = valor_pecas + valor_servicos - valor_desconto,
    valor_pendente = valor_total - valor_pago,
    atualizado_em = CURRENT_TIMESTAMP
  WHERE id = NEW.os_id;
END;

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View de Dashboard Financeiro
CREATE VIEW IF NOT EXISTS view_dashboard_financeiro AS
SELECT
  date('now') as data,
  (SELECT COALESCE(SUM(valor), 0) FROM contas_receber WHERE status = 'pendente') as total_receber,
  (SELECT COALESCE(SUM(valor), 0) FROM contas_pagar WHERE status = 'pendente') as total_pagar,
  (SELECT COALESCE(SUM(valor_recebido), 0) FROM contas_receber WHERE date(data_recebimento) = date('now')) as recebido_hoje,
  (SELECT COALESCE(SUM(valor_pago), 0) FROM contas_pagar WHERE date(data_pagamento) = date('now')) as pago_hoje,
  (SELECT COALESCE(SUM(valor), 0) FROM contas_receber WHERE status = 'atrasado') as atrasado_receber,
  (SELECT COALESCE(SUM(valor), 0) FROM contas_pagar WHERE status = 'atrasado') as atrasado_pagar;

-- View de OS por Status
CREATE VIEW IF NOT EXISTS view_os_por_status AS
SELECT
  status,
  COUNT(*) as quantidade,
  COALESCE(SUM(valor_total), 0) as valor_total,
  COALESCE(SUM(valor_pendente), 0) as valor_pendente
FROM ordens_servico
GROUP BY status;

-- View de Produtos com Estoque Baixo
CREATE VIEW IF NOT EXISTS view_estoque_baixo AS
SELECT
  p.*,
  (p.estoque_minimo - p.estoque_atual) as quantidade_repor
FROM produtos p
WHERE p.controla_estoque = 1 
  AND p.ativo = 1
  AND p.estoque_atual <= p.estoque_minimo
ORDER BY (p.estoque_minimo - p.estoque_atual) DESC;

-- View de Preventivas Próximas
CREATE VIEW IF NOT EXISTS view_preventivas_proximas AS
SELECT
  p.*,
  c.nome as cliente_nome,
  c.telefone as cliente_telefone,
  e.type as equipamento_tipo,
  e.model as equipamento_modelo,
  julianday(p.proxima_execucao) - julianday('now') as dias_ate_execucao
FROM preventivas p
JOIN clientes c ON p.cliente_id = c.id
JOIN equipamentos e ON p.equipamento_id = e.id
WHERE p.ativo = 1 
  AND p.proxima_execucao <= date('now', '+30 days')
ORDER BY p.proxima_execucao;

-- View de Comissões Pendentes por Colaborador
CREATE VIEW IF NOT EXISTS view_comissoes_pendentes AS
SELECT
  col.id as colaborador_id,
  col.nome as colaborador_nome,
  COUNT(com.id) as quantidade_servicos,
  COALESCE(SUM(com.valor_comissao), 0) as total_comissoes
FROM colaboradores col
LEFT JOIN comissoes com ON col.id = com.colaborador_id AND com.status_pagamento = 'pendente'
WHERE col.ativo = 1
GROUP BY col.id, col.nome
HAVING total_comissoes > 0
ORDER BY total_comissoes DESC;

-- ============================================
-- FIM DO SCHEMA
-- ============================================
