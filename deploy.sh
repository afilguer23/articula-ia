#!/bin/bash
# 🚀 Script de Deploy Automático - ArticulaIA
# Bash Script para Linux/Mac

MESSAGE="${1:-Update: Automatic commit}"

echo "🚀 ArticulaIA - Deploy Automático"
echo "================================="
echo ""

# 1. Verificar se há mudanças
echo "📋 Verificando mudanças..."
if [[ -z $(git status --porcelain) ]]; then
    echo "✅ Nenhuma mudança detectada. Nada para fazer."
    exit 0
fi

echo "📝 Mudanças detectadas:"
git status --short

# 2. Adicionar todos os arquivos
echo ""
echo "➕ Adicionando arquivos..."
git add .

# 3. Fazer commit
echo ""
echo "💾 Criando commit..."
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
COMMIT_MESSAGE="$MESSAGE [$TIMESTAMP]"
git commit -m "$COMMIT_MESSAGE"

# 4. Verificar se remote existe
if ! git remote | grep -q "origin"; then
    echo ""
    echo "⚠️  Remote 'origin' não configurado!"
    echo ""
    echo "Para configurar:"
    echo "1. Crie um repositório em: https://github.com/new"
    echo "2. Execute: git remote add origin https://github.com/SEU-USUARIO/articula-ia.git"
    echo "3. Execute: git push -u origin main"
    exit 1
fi

# 5. Fazer push
echo ""
echo "🌐 Enviando para GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deploy concluído com sucesso!"
    echo "🎉 Suas mudanças estão no GitHub!"
else
    echo ""
    echo "❌ Erro no push. Verifique sua conexão e credenciais."
    exit 1
fi
