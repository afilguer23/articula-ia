# 🚀 Guia de Deploy Automático

Este projeto possui scripts para fazer deploy automático para o GitHub.

## 📋 Configuração Inicial (Só Fazer Uma Vez)

### 1. Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha:
   - **Nome**: `articula-ia`
   - **Descrição**: `Sistema de fonoaudiologia com IA para treinar pronúncia de crianças`
   - **Visibilidade**: Público ou Privado (sua escolha)
   - **⚠️ NÃO marque** "Add README" (já temos)
3. Clique em **"Create repository"**

### 2. Conectar ao GitHub

Após criar o repositório, execute:

**Windows (PowerShell):**
```powershell
git remote add origin https://github.com/SEU-USUARIO/articula-ia.git
git branch -M main
git push -u origin main
```

**Linux/Mac:**
```bash
git remote add origin https://github.com/SEU-USUARIO/articula-ia.git
git branch -M main
git push -u origin main
```

**Substitua `SEU-USUARIO` pelo seu username do GitHub!**

---

## 🔄 Uso do Deploy Automático

### Windows (PowerShell)

**Comando básico:**
```powershell
.\deploy.ps1
```

**Com mensagem customizada:**
```powershell
.\deploy.ps1 "Fix: Corrigido bug do microfone"
```

**Se der erro de política de execução:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\deploy.ps1
```

### Linux/Mac

**Tornar o script executável (só fazer uma vez):**
```bash
chmod +x deploy.sh
```

**Comando básico:**
```bash
./deploy.sh
```

**Com mensagem customizada:**
```bash
./deploy.sh "Fix: Corrigido bug do microfone"
```

---

## 🎯 O Que o Script Faz

1. ✅ Verifica se há mudanças nos arquivos
2. ➕ Adiciona todos os arquivos modificados (`git add .`)
3. 💾 Cria um commit com timestamp automático
4. 🌐 Envia para o GitHub (`git push`)
5. 🎉 Mostra mensagem de sucesso

---

## 📝 Padrões de Commit

Use mensagens descritivas ao chamar o script:

```powershell
# Adicionar nova funcionalidade
.\deploy.ps1 "Add: Sistema de relatórios"

# Corrigir bug
.\deploy.ps1 "Fix: Erro no cálculo de XP"

# Atualizar código
.\deploy.ps1 "Update: Melhorado design do chat"

# Documentação
.\deploy.ps1 "Docs: Atualizado README"
```

---

## ⚠️ Problemas Comuns

### Erro: "Remote 'origin' não configurado"
**Solução:** Execute o passo 2 da Configuração Inicial.

### Erro: "Permission denied"
**Solução (Linux/Mac):** Execute `chmod +x deploy.sh`

### Erro: "Authentication failed"
**Solução:** 
- Configure suas credenciais do GitHub
- Ou use SSH ao invés de HTTPS:
  ```bash
  git remote set-url origin git@github.com:SEU-USUARIO/articula-ia.git
  ```

### Erro: "Cannot be loaded because running scripts is disabled"
**Solução (Windows):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🔐 Segurança

⚠️ **NUNCA** adicione chaves API ou credenciais ao Git!

Certifique-se de que o `.gitignore` está ignorando:
- `.env`
- `.env.local`
- Arquivos de configuração sensíveis

---

## 📞 Ajuda

Se tiver problemas, abra uma [issue no GitHub](https://github.com/SEU-USUARIO/articula-ia/issues).

---

**Feito com ❤️ para facilitar seu workflow!**
