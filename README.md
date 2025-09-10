# Dashboard 55PBX - React

Dashboard em React para visualização de relatórios e métricas do sistema 55PBX.

## 🚀 Funcionalidades

- Dashboard responsivo para métricas PBX
- Integração com API 55PBX
- Busca automática de dados dos últimos 3 meses
- Tratamento de estados de carregamento e erro
- Interface limpa e moderna

## 🛠️ Tecnologias

- **React 18** - Biblioteca para interfaces de usuário
- **Axios** - Cliente HTTP para requisições à API
- **CSS3** - Estilização moderna e responsiva

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Token de acesso à API 55PBX

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/SEU_USUARIO/meu-projeto-react.git
cd meu-projeto-react
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o token da API:
   - Abra o arquivo `src/services/api55pbx.js`
   - Substitua `SEU_TOKEN_AQUI` pelo seu token real da API 55PBX

4. Execute o projeto:
```bash
npm start
```

O projeto estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── components/
│   └── Dashboard.jsx      # Componente principal do dashboard
├── services/
│   └── api55pbx.js       # Serviços de comunicação com a API
├── App.js                 # Componente raiz da aplicação
├── index.js              # Ponto de entrada da aplicação
└── index.css             # Estilos globais
```

## 🔌 Configuração da API

O projeto está configurado para consumir a API 55PBX:
- **URL Base**: `https://reportapi02.55pbx.com:50500/api/pbx/reports/metrics`
- **Endpoint**: `/report_01` para métricas gerais
- **Autenticação**: Bearer Token

## 📊 Uso

Após a configuração, o dashboard irá:
1. Carregar automaticamente ao ser aberto
2. Buscar dados dos últimos 3 meses
3. Exibir métricas e relatórios em tempo real
4. Mostrar indicadores de carregamento e tratamento de erros

## 🚀 Deploy

Para fazer o build de produção:

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `build/`.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através das issues do GitHub.

---

**Desenvolvido com ❤️ usando React**
