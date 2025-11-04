# 📱 Gestão Fácil - Sistema de Gestão para Técnicos

Sistema mobile completo para gestão individual de negócios técnicos, desenvolvido com React Native, Expo e SQLite.

## 🎯 Visão Geral

O **Gestão Fácil** é um aplicativo mobile individual para técnicos e microempresários gerenciarem seus negócios de forma profissional e organizada. NÃO é um sistema multi-usuário - cada profissional tem seu próprio app com dados locais no dispositivo.

## 👤 Público-Alvo

- Técnicos autônomos
- Microempresários
- Profissionais liberais
- Prestadores de serviços

## ✨ Funcionalidades Principais

### 📋 Gestão de Clientes
- Cadastro completo com validação CPF/CNPJ
- Busca automática de CEP
- Geolocalização com mapa
- Galeria de fotos
- Histórico completo de atendimentos

### 🔧 Gestão de Equipamentos
- Dados técnicos dinâmicos por segmento
- Múltiplas fotos por equipamento
- Histórico de manutenções
- Vinculação com clientes

### 👥 Gestão de Equipe
- 4 tipos de colaboradores (Sócio, Funcionário, Terceirizado, Auxiliar)
- Cálculo automático de comissões
- Dados bancários e PIX
- Controle de pagamentos

### 💰 Orçamentos e OSs
- Geração de orçamentos profissionais
- Conversão automática para OS
- Status tracking completo
- Fotos antes/durante/depois
- Checklists de atividades
- Assinatura digital
- Integração WhatsApp

### 💵 Financeiro Completo
- Dashboard com KPIs em tempo real
- Contas a receber/pagar
- Gestão de contas bancárias
- Fluxo de caixa
- Relatórios mensais
- Alertas de vencimento

### 📦 Estoque
- Controle de produtos e serviços
- Movimentações automáticas
- Alertas de estoque baixo
- Gestão de fornecedores
- Cálculo de custo médio

### 🔄 Manutenções Preventivas
- 4 tipos de recorrência
- Notificações programadas
- Templates por segmento
- Conversão automática para OS
- Histórico de execuções

### 📊 Dashboard Executivo
- Métricas em tempo real
- Gráficos e análises
- Alertas críticos
- Ações rápidas

### 💾 Backup e Restauração
- 3 tipos de backup (Completo, Dados, Configurações)
- Histórico de backups
- Compartilhamento
- Migração entre dispositivos

### 🎨 Personalização Avançada
- Editor de temas completo
- 8 temas pré-definidos por segmento
- Gerador de paletas harmoniosas
- Teste de contraste WCAG
- Configurações de acessibilidade

### 🔔 Notificações Inteligentes
- Sistema de alertas automáticos
- Priorização inteligente
- Configurações granulares
- Modo silencioso

### 🔍 Busca Avançada
- Busca global em todos módulos
- Filtros complexos
- Buscas salvas
- Histórico de buscas

### 📈 Relatórios Especiais
- Análise de clientes
- Eficiência operacional
- Sazonalidade

### 📞 Integração WhatsApp
- Templates de mensagens
- Envio de orçamentos
- Lembretes automáticos
- Histórico de mensagens

### 🛠️ Ferramentas Técnicas
- Calculadora técnica (Elétrica, Refrigeração, Hidráulica)
- Catálogo de códigos de erro
- Conversor de unidades

## 🏗️ Arquitetura Técnica

### Stack Tecnológica
- **Framework**: React Native + Expo
- **Linguagem**: TypeScript
- **Navegação**: Expo Router (file-based)
- **Banco de Dados**: SQLite (local)
- **Estado Global**: Context API + Hooks
- **Estilo**: StyleSheet + Design Tokens

### Estrutura de Arquitetura
```
Data-Logic-UI Architecture
├── Services (Camada de Dados)
│   ├── Pure functions
│   ├── API calls
│   └── Data processing
├── Hooks (Camada de Lógica)
│   ├── State management
│   ├── Business rules
│   └── Side effects
└── Components (Camada de UI)
    ├── UI rendering
    ├── User interaction
    └── Visual feedback
```

### Estrutura de Pastas
```
app/                    # Expo Router pages
├── (tabs)/            # Tab navigation
├── onboarding/        # First-time setup
└── [feature]/         # Feature screens

services/              # Data layer
├── client.service.ts
├── equipment.service.ts
├── financial.service.ts
└── ...

hooks/                 # Logic layer
├── useClients.tsx
├── useEquipments.tsx
├── useFinancial.tsx
└── ...

components/            # UI layer
├── ui/               # Basic elements
├── feature/          # Feature components
└── layout/           # Layout components

contexts/             # Global state
├── ClientContext.tsx
├── FinancialContext.tsx
└── ...

constants/            # Design tokens
├── theme.ts
├── styles.ts
└── segments.ts
```

## 📊 Banco de Dados

### SQLite Local
- **Tabelas**: 50+ tabelas otimizadas
- **Índices**: 48 índices para performance
- **Triggers**: 15 triggers automáticos
- **Views**: 5 views otimizadas

### Principais Tabelas
- `professional` - Dados do profissional
- `clients` - Clientes
- `equipments` - Equipamentos
- `service_orders` - Ordens de serviço
- `budgets` - Orçamentos
- `collaborators` - Colaboradores
- `products` - Produtos e serviços
- `accounts_receivable` - Contas a receber
- `accounts_payable` - Contas a pagar
- `preventive_maintenances` - Preventivas
- `backups` - Histórico de backups
- `notifications` - Sistema de notificações

## 🚀 Instalação e Execução

### Pré-requisitos
```bash
Node.js 18+
npm ou yarn
Expo CLI
```

### Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/gestao-facil.git

# Entre na pasta
cd gestao-facil

# Instale as dependências
npm install

# Inicie o projeto
npx expo start
```

### Executar no Dispositivo
```bash
# iOS
npx expo start --ios

# Android
npx expo start --android

# Web
npx expo start --web
```

## 📱 Recursos de Performance

### Otimizações Implementadas
- ✅ React.memo em componentes críticos
- ✅ useMemo para cálculos complexos
- ✅ useCallback para event handlers
- ✅ FlatList virtualizada
- ✅ Imagens otimizadas com expo-image
- ✅ Lazy loading de módulos
- ✅ Error boundaries globais
- ✅ Loading states elegantes
- ✅ Empty states informativos

### Monitoramento
- Performance hooks
- Analytics de uso
- Error tracking
- Offline detection

## 🔒 Segurança

- Bloqueio por PIN/Biometria
- Criptografia de dados sensíveis
- Backup automático
- Validações de dados
- Permissões granulares

## 🎨 Design System

### Temas Disponíveis
- 🧊 Refrigeração (Azul)
- 🚗 Automotivo (Vermelho)
- ⚡ Elétrica (Amarelo)
- 💧 Hidráulica (Azul Água)
- 💻 Informática (Roxo)
- 📱 Eletrônica (Verde)
- 🏠 Eletrodomésticos (Laranja)
- 🔧 Personalizado

### Acessibilidade
- ✅ Tamanhos de fonte ajustáveis
- ✅ Alto contraste
- ✅ Modo daltônico
- ✅ Redução de movimento
- ✅ Compatibilidade WCAG AA/AAA

## 📄 Licença

Este projeto é licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e processo de submissão de pull requests.

## 📞 Suporte

- **Email**: suporte@gestaofacil.com
- **Documentação**: https://docs.gestaofacil.com
- **Issues**: https://github.com/seu-usuario/gestao-facil/issues

## 🎯 Roadmap

### Versão 2.0 (Planejado)
- [ ] Sincronização em nuvem
- [ ] Multi-dispositivo
- [ ] Modo multi-usuário (opcional)
- [ ] Integração com marketplace
- [ ] API pública
- [ ] Plugins de terceiros

### Versão 1.1 (Próximo)
- [ ] Exportação avançada (Excel, CSV)
- [ ] Templates de relatórios
- [ ] Scanner OCR avançado
- [ ] Integração com email
- [ ] Modo colaborativo básico

---

**Desenvolvido com ❤️ para profissionais que querem crescer**
