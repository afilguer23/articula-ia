# 🔐 Guia de Segurança - ArticulaIA

## ✅ Melhorias Implementadas

### 1. Firestore Security Rules (`firestore.rules`)

**O que faz:**
Protege o banco de dados Firestore contra acesso não autorizado.

**Regras Implementadas:**

- ✅ **Perfis de Usuários**: Qualquer pessoa pode ler (para ranking/chat), mas só pode criar/editar seu próprio perfil
- ✅ **Mensagens**: Apenas usuários autenticados podem ler. Só pode enviar se for o próprio usuário.
- ✅ **Histórico de Exercícios**: Dados imutáveis. Apenas o dono ou admin pode ler.
- ❌ **Tudo o mais**: Bloqueado por padrão

**Como aplicar:**

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Vá para **Firestore Database** → **Regras**
3. Copie o conteúdo de `firestore.rules` e cole lá
4. Clique em **Publicar**

---

### 2. Criptografia de Chaves API (`crypto.js`)

**O que faz:**
Criptografa as chaves da API Gemini antes de salvar no Firestore usando AES-256-GCM.

**Como funciona:**

1. **Ao salvar**: Chave é criptografada usando o email do usuário como senha
2. **Ao ler**: Chave é descriptografada automaticamente
3. **Formato**: Base64 (seguro para armazenamento)

**Segurança:**

- ✅ Usa Web Crypto API (nativo do navegador)
- ✅ AES-256-GCM (padrão militar)
- ✅ PBKDF2 com 100.000 iterações
- ⚠️ Salt fixo (não ideal, mas OK para MVP)

**Melhoria Futura:**
- Usar salt único por usuário
- Permitir o usuário definir senha mestre

---

## 🚀 Como Usar

### Para Desenvolvedores

**As chaves agora são salvas automaticamente criptografadas.**

Ao cadastrar um aluno:
```javascript
// ANTES (Inseguro)
apiKey: "AIzaSyC_50qtJ-bbH7vllDFqsxdFjjNGkQ3x8jc"

// DEPOIS (Seguro)
apiKey: "SGVsbG8gV29ybGQhCg==" // Criptografado
```

Ao usar a chave:
```javascript
// A descriptografia acontece automaticamente
const key = await CryptoHelper.decrypt(user.apiKey, user.email);
// key agora contém a chave real
```

**IMPORTANTE:** Este sistema NÃO protege contra:
- Admins do Firebase (eles sempre vão ver os dados)
- Ataques de engenharia social
- Keyloggers no dispositivo do usuário

---

## 📋 Checklist de Segurança

Antes de lançar para produção:

- [ ] Aplicar `firestore.rules` no console do Firebase
- [ ] Testar criptografia (cadastrar aluno e verificar Firestore)
- [ ] Habilitar autenticação com email/senha
- [ ] Configurar domínios autorizados no Firebase
- [ ] Habilitar 2FA para a conta de admin do Firebase
- [ ] Revisar logs de acesso regularmente
- [ ] Implementar rate limiting (futuro)
- [ ] Adicionar CAPTCHA no cadastro (futuro)

---

## ⚠️ Limitações Conhecidas

1. **Client-Side Encryption**: A criptografia acontece no navegador. Um atacante com acesso físico ao dispositivo pode interceptar.

2. **Salt Fixo**: Todos os usuários usam o mesmo salt. Ideal seria ter salt único por usuário.

3. **Sem Backend**: Sem Firebase Functions, não podemos validar requests server-side.

---

## 🔮 Melhorias Futuras (v2)

1. **Firebase Functions como Proxy**
   - Chaves ficam no

 backend
   - Cliente nunca vê a chave real
   - Custo: Firebase Blaze Plan (pago)

2. **Autenticação Forte**
   - 2FA obrigatório
   - OAuth (Google, Facebook)
   - Senha mestre para chaves

3. **Auditoria**
   - Log de todos os acessos às chaves
   - Alertas de atividade suspeita
   - Relatório de segurança mensal

---

## 🆘 FAQ

**Q: Minhas chaves antigas estão seguras?**
A: Não. Você precisa re-cadastrar os alunos ou rodar um script de migração.

**Q: Posso desabilitar a criptografia?**
A: Sim, mas NÃO recomendado. Basta não usar o `CryptoHelper`.

**Q: Como migrar chaves antigas?**
A: Vamos criar um script de migração em breve.

---

**Segurança é um processo contínuo. Revise regularmente!** 🔐
