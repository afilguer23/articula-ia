# 🚀 GUIA DE DEPLOY - Vercel

## ✅ PASSO 1: Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repo: `articula-ia`
3. Descrição: `Sistema de fonoaudiologia com IA`
4. **NÃO** marque "Add README" (já temos)
5. Clique em **"Create repository"**

---

## ✅ PASSO 2: Conectar Git Local ao GitHub

Após criar o repo, o GitHub vai mostrar comandos. **Copie o link do repo** (será algo como: `https://github.com/SEU-USUARIO/articula-ia.git`)

Execute no terminal (dentro da pasta `articula-ia`):

```bash
# Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/articula-ia.git

# Renomear branch principal
git branch -M main

# Fazer primeiro push
git push -u origin main
```

---

## ✅ PASSO 3: Importar no Vercel

Agora sim, volte para: https://vercel.com/new?teamSlug=afilguers-projects

1. Clique em **"Import Git Repository"**
2. Se o repo não aparecer, clique em **"Adjust GitHub App Permissions"**
3. Selecione `articula-ia`
4. Clique em **"Import"**

**Configurações do Deploy:**
- **Framework Preset:** Other (já detecta automático)
- **Root Directory:** `./` (padrão)
- **Build Command:** (deixe vazio)
- **Output Directory:** (deixe vazio)

Clique em **"Deploy"** (vai falhar, mas é esperado - falta a env var)

---

## ✅ PASSO 4: Configurar Variável de Ambiente

Após o primeiro deploy (mesmo que falhe):

1. No Vercel Dashboard → **Settings** → **Environment Variables**

2. Adicionar variável:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** 
     1. Acesse: https://console.firebase.google.com/project/fonoaudiologo-33594/settings/serviceaccounts/adminsdk
     2. Clique em **"Gerar nova chave privada"**
     3. Baixe o arquivo JSON
     4. Abra o arquivo e **copie TODO o conteúdo**
     5. Cole aqui (JSON completo)
   - **Environments:** Production, Preview, Development (marcar todos)

3. Clique em **"Save"**

4. Volte para **Deployments** e clique em **"Redeploy"**

---

## ✅ PASSO 5: Testar

Após deploy bem-sucedido, suas URLs serão:

```
https://articula-ia.vercel.app/api/generate-audio
https://articula-ia.vercel.app/api/analyze-speech
https://articula-ia.vercel.app/api/generate-text
```

Teste com `curl` ou Postman:

```bash
curl -X POST https://articula-ia.vercel.app/api/generate-audio \
  -H "Content-Type: application/json" \
  -d '{"userId":"teste@example.com","text":"Olá mundo","voice":"Kore"}'
```

---

## 🎯 ONDE VOCÊ ESTÁ AGORA

Você está em: **PASSO 1** (Criar repo no GitHub)

Depois de criar, me avisa que eu te ajudo com os comandos! 🚀
