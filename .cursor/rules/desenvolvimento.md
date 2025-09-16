# Regras de Desenvolvimento - VeloIGP Dashboard

## 🎯 **PRINCÍPIOS FUNDAMENTAIS**

### **1. LINGUAGEM E COMUNICAÇÃO**
- **SEMPRE responda em português brasileiro**
- Seja objetivo, conciso e evite repetições desnecessárias
- Use terminologia técnica precisa e clara
- Documente decisões importantes no código

### **2. SEGURANÇA E QUALIDADE**
- **NUNCA execute comandos automáticos sem autorização explícita**
- Valide e sanitize TODAS as entradas externas antes do processamento
- Implemente tratamento de erros robusto com try-catch e logs claros
- Proíba bibliotecas vulneráveis ou desatualizadas
- Mantenha backups frequentes e utilize desfazer (Ctrl+Z) para reverter propostas ruins

## 🔧 **PADRÕES DE CÓDIGO**

### **3. TYPESCRIPT**
- **Use tipos estritos, EVITE o uso de `any`**
- Defina interfaces claras para todas as props e estados
- Use enums para valores constantes
- Implemente validação de tipos em runtime quando necessário

### **4. REACT E COMPONENTES**
- **Nomeie componentes em PascalCase**: `MeuComponente.tsx`
- **Nomeie variáveis em camelCase**: `minhaVariavel`
- **Proíba o uso de `var`**, prefira `let` e `const` adequadamente
- Use hooks personalizados para lógica reutilizável
- Mantenha componentes pequenos e focados em uma responsabilidade

### **5. ESTRUTURA DE ARQUIVOS**
```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de interface
│   └── pages/          # Páginas específicas
├── hooks/              # Hooks personalizados
├── services/           # Serviços e APIs
├── utils/              # Funções utilitárias
├── types/              # Definições de tipos
└── styles/             # Estilos globais
```

### **6. CSS E ESTILOS**
- **Evite estilos inline**, privilegie classes CSS
- Use variáveis CSS para cores e espaçamentos
- Implemente design responsivo mobile-first
- Mantenha consistência visual com o design system

## 🚀 **BOAS PRÁTICAS**

### **7. PERFORMANCE**
- Implemente lazy loading para componentes pesados
- Use memoização (useMemo, useCallback) quando apropriado
- Otimize imagens e assets
- Minimize re-renders desnecessários

### **8. TESTES**
- **Exija cobertura de testes unitários para funções críticas**
- Use Jest para testes unitários
- Implemente testes de integração para fluxos importantes
- Mantenha testes atualizados com mudanças no código

### **9. GIT E VERSIONAMENTO**
- **Mantenha commits pequenos e frequentes** para facilitar revisão
- Use mensagens de commit descritivas em português
- Crie branches para features específicas
- Faça code review antes de merge

## ⚠️ **RESTRIÇÕES E LIMITAÇÕES**

### **10. MODIFICAÇÕES**
- **NÃO modifique funções críticas ou código legado sem permissão explícita**
- Limite o escopo das mudanças para os arquivos indicados
- Sempre pergunte antes de deletar arquivos importantes
- Mantenha compatibilidade com versões anteriores quando possível

### **11. BIBLIOTECAS E DEPENDÊNCIAS**
- **Prefira bibliotecas e frameworks aprovados no projeto**
- Verifique licenças antes de adicionar novas dependências
- Mantenha dependências atualizadas e seguras
- Documente razões para escolhas de bibliotecas

## 🎨 **DESIGN E UX**

### **12. INTERFACE DO USUÁRIO**
- Mantenha consistência com o design system Velotax
- Implemente feedback visual para ações do usuário
- Garanta acessibilidade (ARIA labels, contraste, etc.)
- Teste em diferentes dispositivos e navegadores

### **13. RESPONSIVIDADE**
- Desenvolva mobile-first
- Teste em diferentes tamanhos de tela
- Use breakpoints consistentes
- Otimize para touch em dispositivos móveis

## 🔍 **MONITORAMENTO E DEBUGGING**

### **14. LOGS E DEBUGGING**
- Use console.log de forma inteligente (remover em produção)
- Implemente logging estruturado para erros
- Use ferramentas de debugging do navegador
- Mantenha logs de performance para otimização

### **15. MANUTENÇÃO**
- Documente código complexo com comentários
- Mantenha README atualizado
- Crie guias para novos desenvolvedores
- Revise e refatore código regularmente

## 📋 **CHECKLIST DE DESENVOLVIMENTO**

### **Antes de cada commit:**
- [ ] Código compila sem erros
- [ ] Testes passam
- [ ] Linting está limpo
- [ ] Tipos TypeScript estão corretos
- [ ] Responsividade testada
- [ ] Acessibilidade verificada
- [ ] Performance otimizada

### **Antes de cada deploy:**
- [ ] Build de produção testado
- [ ] Variáveis de ambiente configuradas
- [ ] Assets otimizados
- [ ] Cache configurado
- [ ] Monitoramento ativo

## 🚨 **ALERTAS IMPORTANTES**

- **NUNCA commite senhas ou chaves de API**
- **SEMPRE valide dados de entrada**
- **MANTENHA o código legível e documentado**
- **TESTE antes de fazer deploy**
- **BACKUP antes de mudanças grandes**

---

**Última atualização:** $(date)
**Versão:** 1.0.0
**Projeto:** VeloIGP Dashboard


