# 🚀 Instruções para Deploy no GitHub Pages

## 📋 Pré-requisitos

1. **Conta no GitHub**: Certifique-se de ter uma conta ativa
2. **Node.js instalado**: Versão 14 ou superior
3. **Git configurado**: Com seu usuário e email

## 🛠️ Configuração Inicial

### 1. Criar Repositório no GitHub

1. Acesse [GitHub](https://github.com) e faça login
2. Clique em **"New repository"** (Novo repositório)
3. Nome do repositório: `meu-projeto-react`
4. Deixe **público** para usar GitHub Pages gratuito
5. **NÃO** inicialize com README, .gitignore ou licença
6. Clique em **"Create repository"**

### 2. Configurar o Projeto Local

No terminal, dentro da pasta do projeto:

```bash
# Inicializar Git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Primeiro commit: Dashboard 55PBX"

# Adicionar o repositório remoto (SUBSTITUA SEU_USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/meu-projeto-react.git

# Definir a branch principal
git branch -M main

# Enviar para o GitHub
git push -u origin main
```

### 3. Atualizar URL no package.json

Edite o arquivo `package.json` e substitua `SEU_USUARIO` pelo seu username do GitHub:

```json
{
  "homepage": "https://SEU_USUARIO.github.io/meu-projeto-react"
}
```

### 4. Configurar Token da API 55PBX

Edite o arquivo `src/services/api55pbx.js` e substitua `SEU_TOKEN_AQUI` pelo token real da API.

## 🚀 Fazendo o Deploy

### Opção 1: Script Automático (Recomendado)

```bash
# Executar o script de deploy
./deploy.sh
```

### Opção 2: Comandos Manuais

```bash
# Instalar dependência para deploy
npm install --save-dev gh-pages

# Fazer build e deploy
npm run deploy
```

## ⚙️ Configurar GitHub Pages

1. Vá para seu repositório no GitHub
2. Clique em **"Settings"** (Configurações)
3. Role para baixo até **"Pages"**
4. Em **"Source"**, selecione **"Deploy from a branch"**
5. Em **"Branch"**, selecione **"gh-pages"**
6. Clique em **"Save"**

## 🌐 Acessando o Site

Após o deploy, seu site estará disponível em:
```
https://SEU_USUARIO.github.io/meu-projeto-react
```

⏱️ **Nota**: Pode levar 5-10 minutos para aparecer online na primeira vez.

## 🔄 Fazendo Atualizações

Para atualizar o site após fazer mudanças:

```bash
# Adicionar mudanças
git add .

# Commit das mudanças
git commit -m "Descrição das mudanças"

# Enviar para GitHub e fazer deploy
./deploy.sh
```

## 🛠️ Solução de Problemas

### Problema: "Permission denied"
```bash
chmod +x deploy.sh
```

### Problema: "gh-pages not found"
```bash
npm install --save-dev gh-pages
```

### Problema: "Remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/meu-projeto-react.git
```

### Problema: Site não aparece
1. Verifique se o GitHub Pages está ativado nas configurações
2. Aguarde 5-10 minutos
3. Verifique se a branch `gh-pages` foi criada

## 📞 Suporte

- Se o token da API não funcionar, entre em contato com a 55PBX
- Para problemas com GitHub, consulte a [documentação oficial](https://docs.github.com/pt/pages)

## 🎯 Resumo Rápido

1. Criar repositório no GitHub
2. Configurar Git local
3. Atualizar `SEU_USUARIO` no package.json
4. Executar `./deploy.sh`
5. Configurar GitHub Pages
6. Acessar o link fornecido

**Seu chefe poderá acessar em**: `https://SEU_USUARIO.github.io/meu-projeto-react`