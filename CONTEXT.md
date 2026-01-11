# ArticulaIA - Contexto do Projeto

## 📋 Visão Geral
Sistema de fonoaudiologia com IA para treinar pronúncia de crianças usando Google Gemini API.

## 🏗️ Arquitetura

### Frontend (Standalone HTML)
- **index.html**: Interface única com TailwindCSS inline
- **app.js**: Toda a lógica JavaScript
- **Sem build**: Roda direto no navegador

### Backend (Firebase)
- **Firestore**: Banco de dados
  - `artifacts/fonoaudiologo-33594/public/data/profiles_v2`: Perfis dos alunos
  - `artifacts/fonoaudiologo-33594/public/data/messages_v3`: Chat
- **Auth**: Autenticação anônima (para leitura) + Email/Senha (para admin)

### IA (Google Gemini)
- **TTS**: `gemini-2.5-flash-preview-tts` (Text-to-Speech)
- **Análise de Áudio**: `gemini-2.5-flash-preview-09-2025` (Multimodal)
- **Chave API**: Cada aluno tem sua própria chave (armazenada no Firestore)

## 🔑 Funcionalidades Principais

1. **Cadastro de Alunos**
   - Nome, Email, Idade, PIN
   - Chave API individual do Gemini

2. **Tutor IA**
   - Gera frases/palavras adequadas à idade
   - Converte texto em áudio (TTS)
   - Grava pronúncia do aluno via microfone
   - Analisa pronúncia e dá feedback com pontuação (0-100)
   - Gera dica em áudio

3. **Chat da Turma**
   - WhatsApp-style
   - Conversas privadas entre alunos
   - Chat global da turma

4. **Ranking de XP**
   - Gamificação (+10 XP por exercício)
   - Ordenação por pontuação

5. **Modo Claro/Escuro**
   - Toggle de tema

## ⚠️ Pontos de Atenção

### Segurança
- **Chaves API no Firestore**: Estão em texto puro. Ideal seria criptografar ou usar Firebase Functions como proxy.
- **Firestore Rules**: Verificar se estão configuradas corretamente (não deixar `allow read, write: if true`).

### Compatibilidade
- **Áudio WebM**: Safari iOS pode não suportar. Testar em diferentes navegadores.

### Performance
- **Loading Screen**: Timeout de 5 segundos. Se Firebase demorar mais, app abre sem dados.

## 📂 Estrutura de Dados (Firestore)

### Coleção: `profiles_v2`
```javascript
{
  name: "João Silva",
  email: "joao@example.com",
  age: 7,
  pin: "1234",
  apiKey: "AIza...",
  xp: 150
}
```

### Coleção: `messages_v3`
```javascript
{
  text: "Olá!",
  senderId: "joao@example.com",
  senderName: "João Silva",
  chatId: "global", // ou "email1_email2" para privado
  timestamp: Timestamp
}
```

## 🚀 Como Testar Localmente

1. Abra `index.html` no navegador (não precisa de servidor)
2. Cadastre um aluno de teste
3. Gere uma chave API em: https://aistudio.google.com/app/apikey
4. Cole a chave no cadastro
5. Teste o Tutor IA

## 🔧 Melhorias Futuras

1. **Segurança**: Criptografar chaves API ou usar Firebase Functions
2. **Histórico**: Salvar exercícios realizados para relatórios
3. **Relatórios**: Dashboard para fonoaudiólogos
4. **Offline**: Service Worker para funcionar 100% offline
5. **React**: Migrar para React/Vite para melhor manutenção

## 📝 Regras de Ouro

1. **Não hardcode chaves API** no código
2. **Sempre valide entrada do usuário** antes de enviar para a IA
3. **Trate erros da API Gemini** (quota, rate limit, etc)
4. **Teste em mobile** (é o público-alvo principal)
