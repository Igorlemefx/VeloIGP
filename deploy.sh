#!/bin/bash

# Script para deploy automático no GitHub Pages
# Desenvolvido para o projeto Dashboard 55PBX

echo "🚀 Iniciando deploy para GitHub Pages..."

# Verificar se está em um repositório git
if [ ! -d ".git" ]; then
    echo "❌ Erro: Este não é um repositório Git. Execute 'git init' primeiro."
    exit 1
fi

# Verificar se todas as mudanças estão commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Existem alterações não commitadas. Commitando automaticamente..."
    git add .
    git commit -m "Deploy: Atualização automática para GitHub Pages"
fi

# Verificar se o remote origin está configurado
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Erro: Remote 'origin' não configurado."
    echo "Configure com: git remote add origin https://github.com/SEU_USUARIO/meu-projeto-react.git"
    exit 1
fi

# Verificar se gh-pages está instalado
if ! npm list gh-pages > /dev/null 2>&1; then
    echo "📦 Instalando gh-pages..."
    npm install --save-dev gh-pages
fi

# Fazer push das mudanças para o repositório
echo "📡 Enviando mudanças para o repositório..."
git push origin main

# Fazer o deploy
echo "🔄 Executando deploy..."
npm run deploy

if [ $? -eq 0 ]; then
    echo "✅ Deploy realizado com sucesso!"
    echo "🌐 Seu site estará disponível em: https://SEU_USUARIO.github.io/meu-projeto-react"
    echo "⏱️  Pode levar alguns minutos para as mudanças aparecerem online."
else
    echo "❌ Erro durante o deploy. Verifique os logs acima."
fi