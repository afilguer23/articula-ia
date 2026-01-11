# 🚀 MIGRAÇÃO PARA BACKEND SEGURO (Vercel)

## 📋 STATUS GERAL: 🟡 EM PROGRESSO

---

## ✅ FASE 1: PREPARAÇÃO (CONCLUÍDO)
- [x] Projeto ArticulaIA criado
- [x] Firestore configurado
- [x] Sistema de histórico implementado
- [x] Gráficos de evolução criados

---

## 🔄 FASE 2: BACKEND VERCEL (✅ CONCLUÍDO!)

### 2.1. Estrutura de Pastas
- [x] Criar pasta `/api`
-[x] Criar endpoint `generate-audio.js`
- [x] Criar endpoint `analyze-speech.js`
- [x] Criar endpoint `generate-text.js`

### 2.2. Configuração
- [x] Criar `vercel.json`
- [x] Criar `.env.example`
- [x] Atualizar `.gitignore`

### 2.3. Endpoints (Detalhes)

#### `generate-audio.js` - Gera áudio via Gemini TTS
**Input:**
```json
{
  "userId": "user@example.com",
  "text": "Texto para converter em áudio",
  "voice": "Kore"
}
```

**Output:**
```json
{
  "audioUrl": "data:audio/wav;base64,..."
}
```

**Status:** ⏳ Aguardando criação

---

#### `analyze-speech.js` - Analisa pronúncia
**Input:**
```json
{
  "userId": "user@example.com",
  "audioBase64": "...",
  "targetText": "Texto esperado",
  "age": 5
}
```

**Output:**
```json
{
  "score": 85,
  "feedback": "Muito bom! Continue assim."
}
```

**Status:** ⏳ Aguardando criação

---

#### `generate-text.js` - Gera frases/palavras
**Input:**
```json
{
  "userId": "user@example.com",
  "mode": "sentence",
  "quantity": 3,
  "age": 5
}
```

**Output:**
```json
{
  "texts": ["Frase 1", "Frase 2", "Frase 3"]
}
```

**Status:** ⏳ Aguardando criação

---

### 2.4. Segurança
- [ ] Implementar rate limiting
- [ ] Validar requests (CORS)
- [ ] Descriptografar chaves API server-side

---

## 📝 FASE 3: ATUALIZAR FRONTEND (AGUARDANDO)
- [ ] Substituir chamadas diretas à API Gemini
- [ ] Usar endpoints Vercel
- [ ] Remover código de criptografia client-side
- [ ] Testar fluxo completo

---

## 🚀 FASE 4: DEPLOY (AGUARDANDO)
- [ ] Criar conta Vercel
- [ ] Conectar GitHub
- [ ] Fazer primeiro deploy
- [ ] Testar em produção

---

## 📊 RESUMO DE CUSTOS

| Serviço | Custo | Status |
|---------|-------|--------|
| **Vercel Free Tier** | $0/mês | ✅ Ativo |
| **Firebase Spark** | $0/mês | ✅ Ativo |
| **GitHub** | $0/mês | ✅ Ativo |
| **API Gemini** | BYOK* | ⚠️ User-paid |

*BYOK = Bring Your Own Key (cada usuário usa sua própria chave)

---

## 🎯 PRÓXIMOS PASSOS (AGORA)

1. ⏳ **Criando** pasta `/api`
2. ⏳ **Criando** `generate-audio.js`
3. ⏳ **Criando** `analyze-speech.js`
4. ⏳ **Criando** `generate-text.js`
5. ⏳ **Criando** `vercel.json`

---

## 🆘 SE DER ERRO

**Problema:** Vercel não aceita minha conta  
**Solução:** Usar GitHub Actions como alternativa (também grátis)

**Problema:** Deploy falha  
**Solução:** Logs estarão disponíveis no dashboard Vercel

**Problema:** Quota estourou  
**Solução:** Vercel avisa antes. Podemos otimizar ou migrar.

---

**Última atualização:** 2026-01-11 14:54
**Próxima ação:** Criar pasta `/api` e primeiro endpoint
