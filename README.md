# 🚀 Code Review AI

Aplicação desktop (Electron + Node.js) para análise automática de código usando IA.

Permite analisar:
- Pull Requests (GitHub)
- Merge Requests (GitLab)

A aplicação coleta o diff, envia para IA e retorna:
- Problemas encontrados
- Sugestões
- Severidade (HIGH, MEDIUM, LOW)
- Tipo (BUG, PERFORMANCE, etc)

---

## 🧠 Tecnologias

- Node.js
- Electron
- OpenRouter (IA)
- HTML + CSS

---

## � Instalação e Execução

### Pré-requisitos

- Node.js (versão 14 ou superior) - [Download aqui](https://nodejs.org/)

### Passos para Executar o Projeto

1. **Clone ou baixe o repositório:**
   - Clone: `git clone <url-do-repositorio>`
   - Ou baixe o ZIP e extraia.

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o ambiente (opcional):**
   - Copie o arquivo `.env.example` para `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edite `.env` se necessário (as chaves de API são configuradas via interface da aplicação).

4. **Execute o projeto:**
   ```bash
   npm start
   ```

A aplicação desktop será aberta. Configure as chaves de API nas configurações da aplicação.

---
