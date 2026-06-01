# 🔗 URL Shortener

Um encurtador de URLs moderno, rápido e com um dashboard de analytics integrado, criado para simplificar o compartilhamento de links.

**🌐 Projeto em Produção:** [https://url-shortener-smoky-zeta.vercel.app/](https://url-shortener-smoky-zeta.vercel.app/)

---

## 🚀 Funcionalidades e Regras de Negócio

1. **Encurtamento Imediato:** Qualquer URL válida longa inserida gera um ID curto exclusivo de 6 caracteres na mesma hora, sem a necessidade de criar uma conta.
2. **Dashboard de Analytics:** Cada link encurtado possui sua própria página de métricas acessível pela rota `/:shortId/analytics`.
3. **Métricas Detalhadas:**
   - Visualização do volume de acessos totais, pico de interações e média.
   - Histórico gráfico de acessos agrupados por tempo (24h, 7 dias, 30 dias, 90 dias ou todo o tempo).
   - Tipos de dispositivos responsáveis pelo clique (Desktop, Mobile, Tablet, Bot) representados num gráfico de pizza.
   - Tabela detalhada e paginada dos últimos cliques recebidos (Data, IP mascarado, User Agent e Dispositivo).
4. **Troca de Temas Suave:** Aplicação conta com Dark Mode e Light Mode nativos. A transição entre os temas utiliza nativamente a **View Transitions API** do navegador para um efeito crossfade elegante e livre de gargalos.

---

## 🛠️ Stacks Utilizadas

### Frontend
- **React 19**
- **Vite**
- **Tailwind CSS v4** + **Shadcn UI** (Design system e componentes acessíveis)
- **Recharts** (Construção dos gráficos de Analytics)
- **Lucide React** (Ícones SVG)
- **React Router** (Navegação client-side)

### Backend
- **Fastify** (Micro-framework Node.js de alta performance)
- **Drizzle ORM** (Ferramenta moderna de comunicação com banco de dados via TypeScript)
- **PostgreSQL** (Banco de dados relacional principal)
- **Redis** (Gerenciamento de cache e motor atômico de geração de IDs únicos)
- **Zod** (Validação rigorosa de dados de entrada na API)

---

## ⚡ Arquitetura e Uso do Redis

O **Redis** desempenha um papel central na performance e funcionamento da aplicação, atuando em três frentes principais:

1. **Geração de IDs Curtos em Base62 (Counter):** 
   - Ao invés de gerar strings aleatórias e lidar com colisões, utilizamos o Redis como um contador atômico (`INCR`).
   - Na inicialização do servidor, o sistema recupera o maior ID já registrado no banco de dados e seta o contador do Redis para este valor.
   - Cada nova URL encurtada incrementa este contador. O número retornado é então codificado em **Base62** (formando o identificador curto final). Isso garante extrema rapidez e exclusividade sem precisar validar no banco relacional.

2. **Cache de Redirecionamento (TTL de 7 dias):**
   - Quando um usuário acessa um link curto, o sistema tenta recuperar a URL original primeiramente no cache do Redis.
   - Os links ficam em cache com uma política de expiração de **7 dias**. Se ocorrer um *cache hit*, o redirecionamento é instantâneo, poupando o banco de dados. Caso expire, é buscado novamente e o cache repovoado.

3. **Verificação de Duplicidade (Idempotência):**
   - Ao tentar encurtar um link, o sistema verifica no cache (e no banco) se aquela exata URL longa já foi encurtada.
   - Caso positivo, ele apenas devolve a URL curta existente, otimizando o armazenamento e evitando desperdício de IDs gerados.

---

## 💻 Como rodar o projeto localmente

### 1. Pré-requisitos
- Ter o **Node.js** (versão recomendada v20+) instalado na máquina.
- Ter o **Docker** e **Docker Compose** rodando para levantar o banco PostgreSQL e Redis (através do arquivo `docker-compose.yaml`).
- Gerenciador de pacotes **pnpm** ou **npm** instalado.

### 2. Instalação das dependências
```bash
npm install
# ou
pnpm install
```

### 3. Configuração do ambiente
Renomeie ou crie um arquivo `.env` na raiz do projeto contendo as credenciais de acesso locais ao banco de dados:
```env
DATABASE_URL=postgres://usuario:senha@localhost:5432/nome_do_banco
```

### 4. Preparando o Banco de Dados
Gere as migrações e atualize a estrutura do banco usando os scripts do Drizzle:
```bash
npm run db:generate
npm run db:push
```

### 5. Rodando as aplicações (Frontend e API)
Inicie simultaneamente o frontend pelo Vite e o backend Fastify através do script unificado:
```bash
npm run dev
```

- **Frontend disponível em:** `http://localhost:5173`
- **Backend (API) em:** `http://localhost:3000`

---
*Feito com 💜 para estudos e produtividade.*
