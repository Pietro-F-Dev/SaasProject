# FlowDesk

Plataforma SaaS de gerenciamento de projetos e tarefas com kanban, relatórios em tempo real, controle de acesso por cargos e painel administrativo.

## Visão geral

FlowDesk é uma aplicação full-stack construída como projeto de portfólio. Simula um produto SaaS real com autenticação, planos de assinatura, dashboard analítico, kanban com drag-and-drop, gerenciamento de equipes e painel de administração com dados reais do banco de dados.

**Demo:** [flowdesk.vercel.app](https://saas-flowdesk.vercel.app)  
**API:** [flowdesk-api.onrender.com](https://flowdesk-api.onrender.com)

---

## Funcionalidades

### Produto
- **Landing page** — hero, features, pricing, FAQ, testimonials, changelog e comparativo de planos
- **Autenticação** — cadastro, login e JWT com expiração de 7 dias
- **Onboarding** — wizard guiado para novos usuários após cadastro
- **Modo escuro/claro** — toggle persistido por preferência do usuário

### Dashboard
- **Visão geral** — KPIs em tempo real (tarefas, projetos, membros), gráficos de progresso e distribuição, feed de atividades derivadas de tarefas reais
- **Projetos** — CRUD completo, status (ativo, em espera, concluído), barra de progresso calculada pelas tarefas concluídas
- **Kanban** — 4 colunas (A fazer / Em andamento / Em revisão / Concluído), drag-and-drop entre colunas e dentro da mesma, modal de tarefa com comentários, etiquetas, prioridade e atribuição
- **Relatórios** — gráficos de tarefas por status, progresso por projeto, distribuição de prioridades e histórico mensal de criação
- **Equipe** — lista de membros, sistema de convites por email, atualização de cargos e remoção de membros
- **Configurações** — edição de perfil, alternância de tema, plano atual e método de pagamento simulado
- **Notificações** — derivadas de tarefas reais: prazos próximos, tarefas concluídas e revisões pendentes

### Controle de acesso (RBAC)
| Cargo | Criar projetos | Criar tarefas | Editar tarefas | Gerenciar equipe |
|---|:---:|:---:|:---:|:---:|
| Proprietário | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ |
| Membro | ❌ | ✅ | ✅ | ❌ |
| Visualizador | ❌ | ❌ | ❌ | ❌ |

> Visualizadores acessam o kanban em modo leitura — campos desabilitados, sem botões de salvar ou excluir, badge "Somente leitura" visível.

### Painel administrativo (`/admin`)
- KPIs globais: total de contas, MRR, usuários ativos e taxa de conversão para planos pagos
- Gráfico de novos cadastros dos últimos 6 meses
- Distribuição de planos (Free / Pro / Enterprise)
- Tabela de usuários com busca, troca de plano e suspensão em tempo real via API

### Extras
- **Command palette** — `Ctrl+K` / `Cmd+K` para navegação rápida por qualquer página
- **Atalhos de teclado** — `?` para exibir o painel de todos os atalhos
- **Exportação** — dados do workspace em CSV ou JSON
- **Rate limiting** — 20 requisições / 15 min por IP nas rotas de autenticação

---

## Stack tecnológica

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | UI |
| TypeScript | 6 | Tipagem estática |
| Vite | 8 | Build e dev server |
| Tailwind CSS | 4 | Estilização |
| Framer Motion | 12 | Animações |
| Zustand | 5 | Estado global |
| React Router | 7 | Roteamento SPA |
| Recharts | 3 | Gráficos (área, barra, pizza) |
| @dnd-kit | 6/10 | Drag-and-drop do kanban |
| React Hook Form + Zod | — | Formulários com validação |
| react-hot-toast | — | Notificações de feedback |

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 4 | HTTP server |
| TypeScript | 5 | Tipagem estática |
| Prisma | 6 | ORM |
| PostgreSQL (Neon) | — | Banco de dados cloud |
| JWT (jsonwebtoken) | — | Autenticação stateless |
| bcryptjs | — | Hash de senhas |
| Zod | 3 | Validação de schemas no servidor |
| Helmet | 8 | Headers HTTP de segurança |
| express-rate-limit | 8 | Rate limiting por IP |

---

## Contas de teste

### Super Admin — acesso ao painel `/admin`
| Email | Senha | Acesso |
|---|---|---|
| `admin@flowdesk.com` | `senha123` | Painel administrativo com dados reais de todos os usuários |

### Workspace compartilhado — "Demo Company Workspace"
Quatro contas no mesmo workspace para testar a hierarquia de permissões lado a lado:

| Email | Senha | Cargo | O que pode fazer |
|---|---|---|---|
| `owner@demo.com` | `senha123` | Proprietário | Tudo — cria projetos, gerencia equipe, altera cargos de qualquer membro |
| `admin@demo.com` | `senha123` | Admin | Mesmas permissões do proprietário, exceto alterar o cargo do dono |
| `member@demo.com` | `senha123` | Membro | Cria e edita tarefas, visualiza projetos e relatórios — não gerencia equipe |
| `viewer@demo.com` | `senha123` | Visualizador | Somente leitura — kanban bloqueado para edição, nenhum botão de ação visível |

> Alterações feitas por uma conta são refletidas nas demais ao recarregar — todas compartilham o mesmo workspace no banco.

---

## Rodando localmente

### Pré-requisitos
- Node.js 18+
- Backend rodando em `http://localhost:3001` (ver [README da API](../SaasServer/README.md))

### Instalação

```bash
git clone https://github.com/seu-usuario/flowdesk-frontend.git
cd flowdesk-frontend
npm install
```

### Variáveis de ambiente

Cria o arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3001
```

### Iniciar em desenvolvimento

```bash
npm run dev
# Acessa http://localhost:5173
```

### Build de produção

```bash
npm run build   # Compila TypeScript + gera dist/
npm run preview # Serve o build localmente para testar
```

---

## Estrutura do projeto

```
src/
├── components/
│   ├── router/
│   │   ├── ProtectedRoute.tsx   # Redireciona para /login se não autenticado
│   │   └── AdminRoute.tsx       # Redireciona para /dashboard se não for admin
│   ├── CommandPalette.tsx       # Palette de comandos (Ctrl+K)
│   ├── NotificationBell.tsx     # Notificações derivadas de tarefas reais
│   ├── OnboardingWizard.tsx     # Wizard pós-cadastro
│   ├── KeyboardShortcuts.tsx    # Modal de atalhos (?)
│   └── ...                      # Seções da landing page
├── context/
│   ├── AuthContext.tsx          # Login, signup, JWT, plano do usuário
│   └── ThemeContext.tsx         # Dark/light mode com persistência
├── lib/
│   └── api.ts                   # Wrapper fetch — Bearer token automático
├── pages/
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── AdminOverview.tsx    # KPIs e gráficos da plataforma
│   │   └── AdminUsers.tsx       # Gestão de usuários
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx  # Sidebar, navbar, notificações
│   │   ├── Overview.tsx         # Visão geral do workspace
│   │   ├── Projects.tsx         # Lista e criação de projetos
│   │   ├── KanbanPage.tsx       # Board com drag-and-drop
│   │   ├── Reports.tsx          # Gráficos e métricas
│   │   ├── Team.tsx             # Membros e convites
│   │   └── Settings.tsx         # Configurações da conta
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Checkout.tsx
│   └── NotFound.tsx
└── store/
    ├── projectStore.ts          # Projetos e tarefas — Zustand sem persist
    ├── teamStore.ts             # Membros e convites
    └── notificationStore.ts    # IDs lidos — Zustand com persist
```

---

## Atalhos de teclado

| Atalho | Ação |
|---|---|
| `Ctrl+K` / `Cmd+K` | Abrir command palette |
| `?` | Exibir painel de atalhos |
| `Esc` | Fechar modal, palette ou drawer |

---

## Deploy — Vercel

1. Faz push do repositório para o GitHub
2. Importa o projeto em [vercel.com](https://vercel.com)
3. Vercel detecta Vite automaticamente — nenhuma configuração de build necessária
4. Adiciona a variável de ambiente:

```
VITE_API_URL=https://seu-backend.onrender.com
```

5. Clica em **Deploy** — a cada novo push na branch `master` o redeploy é automático

---

## Segurança

- Senhas com hash bcrypt (rounds: 10)
- JWT com expiração de 7 dias e validação de assinatura no servidor
- Rate limiting nas rotas de autenticação (20 req / 15 min / IP)
- Headers HTTP seguros via Helmet (XSS, clickjacking, MIME sniffing)
- CORS restrito ao domínio do frontend via variável de ambiente
- Validação de inputs com Zod no servidor (tipos, mínimos e máximos)
- CSV export sanitizado contra injeção de fórmulas
- Stack traces não expostos em produção (`NODE_ENV=production`)
- `.env` excluído do git via `.gitignore`

---

## Licença

MIT
