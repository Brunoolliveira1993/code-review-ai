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

## 📦 Dependências (npm)

Instale:

```bash
npm install electron dotenv node-fetch
