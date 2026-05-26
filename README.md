# AI-RH: Triador de Currículos Inteligente 🚀

O **AI-RH** é um sistema web moderno e inteligente projetado para otimizar e automatizar o processo de triagem de currículos para recrutadores e profissionais de Recursos Humanos (RH). Ele combina o poder do **Next.js 15** no frontend com um servidor **FastAPI (Python)** e **Google Gemini IA (gemini-2.5-flash)** no backend para analisar currículos em formato PDF contra descrições de vagas específicas.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (React 19, TypeScript)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Banco de Dados & Autenticação**: [Supabase](https://supabase.com/) (com Auth Helpers para Next.js)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Extração de Texto**: [PyMuPDF](https://pymupdf.readthedocs.io/) (fitz)
- **Inteligência Artificial**: [Google GenAI SDK](https://github.com/google/generative-ai-python) (Modelo: `gemini-2.5-flash`)
- **Cliente Banco de Dados**: `supabase-py`

### Infraestrutura & DevOps
- **Containerização**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **CI/CD**: GitHub Actions (Pipeline para build de imagens Docker)

---

## ✨ Funcionalidades Principais

- **Autenticação Segura**: Login e gerenciamento de sessões com o Supabase Auth.
- **Painel de Recrutamento (Dashboard)**: Visualização de todas as vagas de emprego criadas pelo recrutador.
- **Gerenciamento de Vagas**: Criação de vagas e opção de pausar/ativar ou deletar vagas.
- **Extração Automatizada**: Upload de currículos em formato PDF com extração automática de dados de contato (Nome, E-mail e Telefone).
- **Análise Inteligente (IA)**:
  - **Match Score**: Pontuação de compatibilidade de 0 a 100%.
  - **Resumo de IA**: Um resumo conciso em 3 frases destacando os pontos fortes e o perfil do candidato.
  - **Habilidades Compatíveis**: Lista de requisitos/habilidades exigidas na vaga que foram encontradas no currículo.
  - **Habilidades Ausentes**: Lista de requisitos/habilidades desejadas que estão em falta no currículo.
- **Favoritos**: Possibilidade de favoritar candidatos promissores diretamente pelo painel.
- **Visualização Detalhada**: Modal com a análise completa do candidato gerada pela inteligência artificial.

---

## 📂 Estrutura do Projeto

```text
AI_RH/
├── .github/                # Configurações do GitHub (workflows de CI/CD)
│   └── workflows/
│       └── ci.yml          # Pipeline de integração contínua (GitHub Actions)
├── server/                 # Backend FastAPI (Python)
│   ├── ai_engine.py        # Integração com a API do Gemini
│   ├── extract.py          # Leitor e extrator de PDF (PyMuPDF)
│   ├── main.py             # Endpoints da API e lógica de salvamento
│   ├── requirements.txt    # Dependências do Python
│   └── Dockerfile          # Configuração de build do container backend
├── web/                    # Frontend Next.js (React + TypeScript)
│   ├── src/
│   │   ├── app/            # Páginas e rotas (Next.js App Router)
│   │   ├── components/     # Componentes React (Upload, Modais, Sidebar, etc.)
│   │   └── utils/          # Conexão com Supabase no lado do servidor/cliente
│   ├── Dockerfile          # Configuração de build do container frontend
│   └── package.json        # Dependências do Node.js
├── docker-compose.yml      # Configuração para rodar o projeto localmente com Docker
└── .env                    # Variáveis de ambiente (Necessário configurar)
```

---

## 🗄️ Modelagem do Banco de Dados (Supabase)

Para o correto funcionamento da aplicação, crie as tabelas abaixo no seu projeto Supabase através do **SQL Editor**:

```sql
-- 1. Tabela de Vagas (jobs)
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS e criar políticas se necessário
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 2. Tabela de Candidatos (candidates)
CREATE TABLE public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    raw_text TEXT,
    resume_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- 3. Tabela de Triagem/Resultados (screenings)
CREATE TABLE public.screenings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    ai_summary TEXT,
    matching_skills JSONB,
    missing_skills JSONB,
    is_favorite BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Evita duplicidade: o mesmo candidato só tem uma triagem por vaga
    CONSTRAINT unique_job_candidate UNIQUE (job_id, candidate_id)
);

ALTER TABLE public.screenings ENABLE ROW LEVEL SECURITY;
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto e configure as seguintes variáveis:

```env
# URL e Chave Pública do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sua-chave-anonima-supabase

# Chave de API da Google Gemini AI (Chave obtida no Google AI Studio)
GEMINI_API_KEY=sua-chave-api-gemini

# URL de comunicação com a API do Backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Como Executar o Projeto

Existem duas formas principais para executar o projeto localmente: usando **Docker Compose** (recomendado) ou de **forma manual**.

### Opção 1: Usando Docker Compose (Recomendado)

Esta opção instala e configura automaticamente o Frontend e o Backend com suporte a hot-reload (mapeamento de volumes locais).

1. Certifique-se de que o **Docker** e o **Docker Compose** estão instalados na sua máquina.
2. Certifique-se de que configurou o arquivo `.env` na raiz do projeto.
3. No terminal, execute o comando:
   ```bash
   docker-compose up --build
   ```
4. O frontend estará disponível em: [http://localhost:3000](http://localhost:3000)
5. A API do backend estará disponível em: [http://localhost:8000](http://localhost:8000) (documentação interativa da API disponível em `/docs`).

---

### Opção 2: Execução Manual (Sem Docker)

#### 1. Configurando o Backend (FastAPI)

1. Navegue até a pasta do servidor:
   ```bash
   cd server
   ```
2. Crie e ative um ambiente virtual Python:
   ```bash
   # No Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   
   # No Linux/macOS
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
4. Crie um arquivo `.env` na pasta `server` ou garanta que as variáveis globais estão exportadas.
5. Inicie o servidor FastAPI:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

#### 2. Configurando o Frontend (Next.js)

1. Em um novo terminal, navegue até a pasta web:
   ```bash
   cd web
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Garanta que o arquivo `.env.local` na pasta `web` ou o arquivo `.env` na raiz está configurado.
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Acesse a aplicação em: [http://localhost:3000](http://localhost:3000).

---

## 🛠️ CI/CD (Integração Contínua)

O repositório possui uma pipeline automatizada no GitHub Actions localizada em `.github/workflows/ci.yml`. Sempre que uma alteração é enviada (push) ou um Pull Request (PR) é aberto para a branch `main`, a pipeline é acionada para validar a integridade das imagens do Docker e garantir que o projeto builda perfeitamente sem erros.

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes (se disponível).
