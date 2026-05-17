# 🚀 Code Review AI

Aplicação desktop baseada em Electron para análise automática de código usando IA.

## O que ela faz

- Analisa Pull Requests do GitHub
- Analisa Merge Requests do GitLab e GitLab CISS
- Coleta o diff do PR/MR ou commit
- Envia o código para IA via OpenRouter
- Exibe problemas encontrados e sugestões
- Mostra severidade (`HIGH`, `MEDIUM`, `LOW`) e tipo (`BUG`, `PERFORMANCE`, `SECURITY`, `STYLE`, `ARCHITECTURE`)
- Permite postar comentários diretamente no merge request/pull request

## Principais funcionalidades

- Análise de código automática a partir da URL do PR/MR
- Interface desktopleve para configurar chaves de API
- Comentários gerados automaticamente enviados para o GitHub ou GitLab
- Armazenamento seguro das credenciais usando o keytar

## Tecnologias

- Electron
- Node.js
- TypeScript
- OpenRouter
- Zod
- Keytar

## Pré-requisitos

- Node.js 18 ou superior
- npm

## Como iniciar

1. Clone o repositório ou baixe o ZIP:
   ```bash
   git clone <url-do-repositorio>
   cd code-review-ai
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Execute a aplicação:
   ```bash
   npm start
   ```

O comando `npm start` executa `npm run build` e em seguida inicia o Electron.

## Scripts úteis

- `npm install` — instala dependências
- `npm run build` — compila o TypeScript e copia os arquivos de interface para `dist/presentation`
- `npm start` — compila e abre o app Electron

## Configuração de credenciais

Após abrir o app, clique em **Configurações** e informe:

- `OPENROUTER_API_KEY`
- `GITHUB_TOKEN`
- `GITLAB_TOKEN`

As credenciais são salvas de forma segura no cofre do sistema.

## Observações

- O app suporta URLs de Pull Request do GitHub e Merge Request do GitLab/GitLab.
- Se ocorrerem erros de rede ou de API, verifique as credenciais e a conectividade.
