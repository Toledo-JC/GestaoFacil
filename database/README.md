# 📊 GESTÃO FÁCIL - MODELAGEM DO BANCO DE DADOS

## 🎯 Visão Geral

Modelagem SQLite completa para aplicativo mobile individual de gestão para técnicos e empreendedores. O sistema é **offline-first** com dados 100% locais e backup opcional em nuvem.

---

## 📁 Estrutura de Tabelas (25 tabelas)

### 👤 **Perfil e Configuração**
1. **profissional** - Dados do dono do app
2. **configuracoes_tema** - Cores e aparência personalizadas
3. **configuracoes** - Configurações gerais do sistema

### 👥 **Gestão de Clientes**
4. **clientes** - Cadastro de clientes
5. **equipamentos** - Equipamentos dos clientes
6. **preventivas** - Manutenções preventivas agendadas
7. **historico_preventivas** - Histórico de execuções

### 📋 **Orçamentos e Ordens de Serviço**
8. **orcamentos** - Propostas comerciais
9. **itens_orcamento** - Itens detalhados dos orçamentos
10. **ordens_servico** - Ordens de serviço
11. **itens_os** - Itens detalhados das OS

### 📦 **Estoque e Produtos**
12. **produtos** - Peças e serviços
13. **estoque_movimentacoes** - Controle de entrada/saída

### 👨‍🔧 **Recursos Humanos**
14. **colaboradores** - Ajudantes e parceiros (sem login)
15. **comissoes** - Cálculo de comissões por serviço

### 💰 **Financeiro**
16. **contas_receber** - Valores a receber
17. **contas_pagar** - Despesas e pagamentos
18. **lancamentos_caixa** - Fluxo de caixa diário

### 🔔 **Comunicação e Alertas**
19. **notificacoes** - Sistema de alertas inteligentes
20. **whatsapp_mensagens** - Histórico de integração WhatsApp
21. **lembretes** - Anotações e lembretes

### 📎 **Anexos e Documentos**
22. **anexos** - Fotos, documentos, áudios

### 🔍 **Produtividade**
23. **busca_favoritos** - Filtros e buscas salvas

### 💾 **Backup e Auditoria**
24. **backups** - Controle de backups
25. **log_atividades** - Auditoria de operações

---

## 🔄 Diagrama de Relacionamentos Principais

```
profissional (1)
    └── configuracoes_tema (1)
    └── configuracoes (N)

clientes (1) ────┬── equipamentos (N)
                 │       └── preventivas (N)
                 │               └── historico_preventivas (N)
                 │       └── ordens_servico (N)
                 │               └── itens_os (N)
                 │       └── orcamentos (N)
                 │               └── itens_orcamento (N)
                 ├── contas_receber (N)
                 ├── whatsapp_mensagens (N)
                 └── anexos (N)

produtos (1) ────┬── estoque_movimentacoes (N)
                 ├── itens_os (N)
                 └── itens_orcamento (N)

colaboradores (1) ──┬── ordens_servico (N)
                    └── comissoes (N)

ordens_servico (1) ──┬── contas_receber (N)
                     ├── comissoes (N)
                     ├── lancamentos_caixa (N)
                     └── anexos (N)

notificacoes (N) ──── [referencia_tipo + referencia_id]
lembretes (N) ────── [referencia_tipo + referencia_id]
anexos (N) ────────── [referencia_tipo + referencia_id]
```

---

## 🔑 Relacionamentos Críticos

### **Hierarquia Cliente → Equipamento → OS**
```sql
clientes.id → equipamentos.client_id (ON DELETE CASCADE)
equipamentos.id → ordens_servico.equipamento_id (ON DELETE SET NULL)
clientes.id → ordens_servico.cliente_id (ON DELETE CASCADE)
```

### **Orçamento → OS (Conversão)**
```sql
orcamentos.id → ordens_servico.orcamento_id (ON DELETE SET NULL)
orcamentos.convertido_os_id → ordens_servico.id (ON DELETE SET NULL)
```

### **Estoque Automático**
```sql
produtos.id → estoque_movimentacoes.produto_id (ON DELETE CASCADE)
ordens_servico.id → estoque_movimentacoes.os_id (ON DELETE SET NULL)

TRIGGER: trigger_atualizar_estoque
  → Atualiza produtos.estoque_atual após cada movimentação
  → Cria notificação automática quando estoque fica abaixo do mínimo
```

### **Comissões**
```sql
colaboradores.id → comissoes.colaborador_id (ON DELETE CASCADE)
ordens_servico.id → comissoes.os_id (ON DELETE CASCADE)
```

### **Financeiro Automático**
```sql
ordens_servico.id → contas_receber.os_id (ON DELETE SET NULL)
contas_receber.id → lancamentos_caixa.conta_receber_id (ON DELETE SET NULL)
contas_pagar.id → lancamentos_caixa.conta_pagar_id (ON DELETE SET NULL)

TRIGGERS: 
  → trigger_atualizar_pendente_receber
  → trigger_atualizar_pendente_pagar
  → trigger_notificar_conta_receber_vencida
```

### **Preventivas Automáticas**
```sql
preventivas.id → historico_preventivas.preventiva_id (ON DELETE CASCADE)
ordens_servico.id → historico_preventivas.os_id (ON DELETE SET NULL)

TRIGGERS:
  → trigger_atualizar_proxima_preventiva (recalcula próxima execução)
  → trigger_notificar_preventiva_proxima (cria notificação)
```

---

## 📊 ENUMs e Status

### **Segmentos de Atuação**
```sql
'Informática', 'Eletrônica', 'Refrigeração', 'Elétrica', 
'Hidráulica', 'Automotivo', 'Celulares', 'Eletrodomésticos', 'Outro'
```

### **Status de Orçamento**
```sql
'pendente' → 'aprovado' | 'rejeitado' | 'expirado' → 'convertido'
```

### **Status de OS**
```sql
'aguardando' → 'em_andamento' → 'aguardando_pecas' → 'concluido' | 'cancelado'
'aguardando_aprovacao' (orçamento pendente)
```

### **Status de Pagamento**
```sql
'pendente' → 'pago_parcial' → 'pago' | 'cancelado'
```

### **Prioridade**
```sql
'baixa' < 'normal' < 'alta' < 'urgente'
```

### **Tipo de Notificação**
```sql
'vencimento', 'preventiva', 'estoque', 'aniversario', 
'os_atrasada', 'orcamento_expirado', 'lembrete', 'geral'
```

### **Tipo de Movimentação de Estoque**
```sql
'entrada' (+), 'saida' (-), 'ajuste' (±), 'devolucao' (+), 'inventario' (ajuste para valor absoluto)
```

### **Formas de Pagamento**
```sql
'dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 
'transferencia', 'boleto', 'cheque', 'outro'
```

---

## 🎨 Campos Dinâmicos (JSON)

### **equipamentos.dados_tecnicos**
Exemplos por segmento:
```json
// Refrigeração
{
  "tipo_gas": "R410A",
  "capacidade_btus": 12000,
  "tipo_instalacao": "split"
}

// Automotivo
{
  "placa": "ABC-1234",
  "chassi": "9BWAA45U08B123456",
  "km_atual": 50000,
  "cor": "Prata"
}

// Informática
{
  "processador": "Intel i7",
  "ram_gb": 16,
  "hd_tipo": "SSD",
  "hd_capacidade_gb": 512
}
```

### **produtos.caracteristicas**
```json
{
  "compatibilidade": ["Samsung", "LG"],
  "voltagem": "220V",
  "peso_kg": 2.5,
  "dimensoes": "10x5x3cm"
}
```

### **orcamentos.campos_personalizados**
```json
{
  "cor_equipamento": "Branco",
  "local_instalacao": "Sala",
  "acessorios_inclusos": ["Controle remoto", "Suporte de parede"]
}
```

---

## 🔍 Índices Otimizados

### **Busca Rápida**
```sql
idx_clientes_nome, idx_clientes_telefone
idx_equipamentos_tipo, idx_equipamentos_cliente
idx_produtos_nome, idx_produtos_codigo
idx_os_numero, idx_orcamentos_numero
```

### **Filtros Críticos**
```sql
idx_os_status, idx_os_status_pagamento
idx_contas_receber_status, idx_contas_receber_vencimento
idx_preventivas_proxima_execucao, idx_preventivas_ativo
idx_notificacoes_status, idx_notificacoes_prioridade
```

### **Índices Compostos (Performance)**
```sql
-- Contas vencidas
idx_contas_receber_vencidas (data_vencimento, status) 
  WHERE status = 'pendente' AND data_vencimento < date('now')

-- Estoque baixo
idx_produtos_estoque_baixo (estoque_atual, estoque_minimo)
  WHERE controla_estoque = 1 AND estoque_atual <= estoque_minimo

-- Preventivas próximas
idx_preventivas_proximas (proxima_execucao, ativo)
  WHERE ativo = 1 AND proxima_execucao <= date('now', '+30 days')

-- Notificações pendentes
idx_notificacoes_pendentes (status, prioridade, data_notificacao)
  WHERE status = 'pendente'
```

---

## ⚙️ Triggers Automáticos

### **Atualização de Timestamps**
```sql
trigger_profissional_updated, trigger_clientes_updated,
trigger_equipamentos_updated, trigger_os_updated,
trigger_orcamentos_updated, trigger_produtos_updated
```

### **Controle de Estoque**
```sql
trigger_calcular_estoque_movimentacao (BEFORE INSERT)
  → Calcula estoque_anterior e estoque_novo

trigger_atualizar_estoque (AFTER INSERT)
  → Atualiza produtos.estoque_atual
  → Cria notificação de estoque baixo
```

### **Cálculo de Valores**
```sql
trigger_calcular_total_orcamento (AFTER INSERT em itens_orcamento)
  → Recalcula valor_pecas, valor_servicos, valor_total

trigger_calcular_total_os (AFTER INSERT em itens_os)
  → Recalcula valor_pecas, valor_servicos, valor_total, valor_pendente
```

### **Status Financeiro**
```sql
trigger_atualizar_pendente_receber (AFTER UPDATE OF valor_recebido)
  → Recalcula valor_pendente
  → Atualiza status (pendente/recebido/atrasado)

trigger_atualizar_pendente_pagar (AFTER UPDATE OF valor_pago)
  → Recalcula valor_pendente
  → Atualiza status (pendente/pago/atrasado)

trigger_notificar_conta_receber_vencida (AFTER UPDATE OF status)
  → Cria notificação quando status = 'atrasado'
```

### **Manutenções Preventivas**
```sql
trigger_atualizar_proxima_preventiva (AFTER INSERT em historico_preventivas)
  → Atualiza ultima_execucao
  → Calcula proxima_execucao baseado na periodicidade

trigger_notificar_preventiva_proxima (AFTER UPDATE OF proxima_execucao)
  → Cria notificação quando preventiva se aproxima
```

---

## 📈 Views Úteis

### **view_dashboard_financeiro**
```sql
SELECT 
  total_receber, total_pagar,
  recebido_hoje, pago_hoje,
  atrasado_receber, atrasado_pagar
FROM view_dashboard_financeiro;
```

### **view_os_por_status**
```sql
SELECT status, quantidade, valor_total, valor_pendente
FROM view_os_por_status;
```

### **view_estoque_baixo**
```sql
SELECT *, quantidade_repor
FROM view_estoque_baixo
ORDER BY quantidade_repor DESC;
```

### **view_preventivas_proximas**
```sql
SELECT 
  cliente_nome, equipamento_tipo, 
  proxima_execucao, dias_ate_execucao
FROM view_preventivas_proximas
WHERE dias_ate_execucao <= 7;
```

### **view_comissoes_pendentes**
```sql
SELECT 
  colaborador_nome, quantidade_servicos, total_comissoes
FROM view_comissoes_pendentes;
```

---

## 💾 Backup Seletivo

### **Tipos de Backup**
```sql
'completo' → Todas as tabelas
'apenas_dados' → Exclui configuracoes, log_atividades, notificacoes
'apenas_configuracoes' → profissional, configuracoes_tema, configuracoes
```

### **Tabelas por Categoria**

**Dados de Negócio (prioridade alta)**
- clientes, equipamentos, ordens_servico, orcamentos
- produtos, contas_receber, contas_pagar
- preventivas, colaboradores, comissoes

**Configurações**
- profissional, configuracoes_tema, configuracoes

**Transitórios (podem ser excluídos no backup)**
- notificacoes, lembretes, log_atividades
- whatsapp_mensagens, busca_favoritos

**Anexos (opcional)**
- anexos (pode ser grande, backup separado)

---

## 🔐 Segurança e Auditoria

### **Log de Atividades**
```sql
INSERT INTO log_atividades (tabela, registro_id, acao, dados_anteriores, dados_novos)
VALUES ('ordens_servico', 123, 'update', '{"status":"em_andamento"}', '{"status":"concluido"}');
```

### **Dados Sensíveis**
- Senhas: Apenas hash armazenado em `configuracoes.valor`
- Assinaturas: Base64 em campos específicos
- Documentos: CPF/CNPJ não validados (responsabilidade do app)

---

## 🚀 Otimizações de Performance

### **Estratégias Implementadas**

1. **Índices Compostos com WHERE** - Filtra diretamente no índice
2. **Triggers para Cálculos** - Evita recálculos em queries
3. **Views Materializadas** - Dashboard sem joins complexos
4. **Cascade Rules Inteligentes** - Limpeza automática de dados órfãos
5. **JSON para Dados Dinâmicos** - Flexibilidade sem ALTER TABLE

### **Boas Práticas**

- ✅ Use `date('now')` ao invés de `datetime('now')` quando possível
- ✅ Aproveite índices compostos com WHERE clause
- ✅ Use `COALESCE` para evitar NULL em somas
- ✅ Prefira `ON DELETE CASCADE` para dados dependentes
- ✅ Use `ON DELETE SET NULL` para referências opcionais

---

## 📝 Configurações Padrão

Ao inicializar o banco, estas configurações são inseridas automaticamente:

```sql
formato_numero_os = 'OS-{numero}'
formato_numero_orcamento = 'ORC-{numero}'
dias_validade_orcamento = 30
dias_garantia_padrao = 90
moeda = 'BRL'
backup_automatico = true
backup_frequencia = 'semanal'
primeiro_acesso = true
onboarding_completo = false
versao_schema = '2.0'
```

---

## 🔄 Migração e Versionamento

### **Controle de Versão**
```sql
SELECT valor FROM configuracoes WHERE chave = 'versao_schema';
-- Resultado: '2.0'
```

### **Scripts de Migração**
- v1.0 → v2.0: Adicionar novas tabelas sem destruir dados existentes
- Usar `CREATE TABLE IF NOT EXISTS` e `ALTER TABLE IF EXISTS`
- Triggers podem ser recriados com `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER`

---

## 📚 Casos de Uso Comuns

### **1. Criar Orçamento Completo**
```sql
-- 1. Inserir orçamento
INSERT INTO orcamentos (...) VALUES (...);

-- 2. Inserir itens
INSERT INTO itens_orcamento (...) VALUES (...);
-- Trigger atualiza automaticamente valor_total

-- 3. Cliente aprovou?
UPDATE orcamentos SET status = 'aprovado' WHERE id = ?;

-- 4. Converter para OS
INSERT INTO ordens_servico (orcamento_id, ...) VALUES (?, ...);
UPDATE orcamentos SET convertido_os_id = last_insert_rowid() WHERE id = ?;
```

### **2. Registrar Venda com Baixa de Estoque**
```sql
-- 1. Criar itens da OS
INSERT INTO itens_os (os_id, tipo, produto_id, quantidade, ...) VALUES (...);

-- 2. Baixar do estoque
INSERT INTO estoque_movimentacoes (
  produto_id, tipo_movimentacao, quantidade, os_id
) VALUES (?, 'saida', ?, ?);
-- Trigger atualiza automaticamente produtos.estoque_atual
-- Trigger cria notificação se estoque ficar baixo
```

### **3. Executar Preventiva**
```sql
-- 1. Criar OS para a preventiva
INSERT INTO ordens_servico (tipo_servico, ...) VALUES ('preventiva', ...);

-- 2. Registrar execução
INSERT INTO historico_preventivas (preventiva_id, os_id, data_execucao) 
VALUES (?, ?, date('now'));
-- Trigger recalcula automaticamente proxima_execucao
```

### **4. Receber Pagamento**
```sql
-- 1. Atualizar valor recebido
UPDATE contas_receber SET valor_recebido = valor_recebido + ? WHERE id = ?;
-- Trigger recalcula valor_pendente e atualiza status

-- 2. Registrar no caixa
INSERT INTO lancamentos_caixa (tipo, conta_receber_id, valor, ...)
VALUES ('entrada', ?, ?, ...);
```

---

## 🎯 Próximos Passos

1. ✅ Schema criado e documentado
2. ⏳ Criar services TypeScript para cada entidade
3. ⏳ Implementar Context providers
4. ⏳ Desenvolver componentes de CRUD
5. ⏳ Integrar sistema de notificações
6. ⏳ Implementar backup/restore
7. ⏳ Criar dashboards e relatórios

---

**Versão:** 2.0  
**Última Atualização:** 2025-01-04  
**Total de Tabelas:** 25  
**Total de Índices:** 48  
**Total de Triggers:** 15  
**Total de Views:** 5
