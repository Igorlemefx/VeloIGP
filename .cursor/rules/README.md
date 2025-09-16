# Regras do Cursor AI - VeloIGP Dashboard

## 📁 **ESTRUTURA DE REGRAS**

Este diretório contém as regras organizadas para o Cursor AI trabalhar com máxima qualidade no projeto VeloIGP Dashboard.

### **Arquivos de Regras:**

1. **`desenvolvimento.md`** - Regras gerais de desenvolvimento
2. **`typescript.md`** - Padrões específicos do TypeScript
3. **`react.md`** - Boas práticas do React
4. **`seguranca.md`** - Regras de segurança e proteção de dados

## 🎯 **COMO USAR**

### **1. Configuração do Cursor**
1. Abra o Cursor AI
2. Vá em Settings > Rules
3. Adicione o caminho: `.cursor/rules/`
4. Ative todas as regras

### **2. Uso das Regras**
- As regras são aplicadas automaticamente
- Sempre consulte antes de fazer mudanças grandes
- Use os checklists antes de cada commit
- Mantenha as regras atualizadas

## 🔧 **CONFIGURAÇÕES RECOMENDADAS**

### **Cursor AI Settings:**
```json
{
  "rules": {
    "enabled": true,
    "path": ".cursor/rules/",
    "language": "pt-BR",
    "strictMode": true,
    "autoApply": true
  },
  "codeStyle": {
    "typescript": "strict",
    "react": "functional",
    "naming": "camelCase"
  },
  "security": {
    "validateInputs": true,
    "sanitizeData": true,
    "noSecrets": true
  }
}
```

## 📋 **CHECKLIST GERAL**

### **Antes de cada sessão:**
- [ ] Regras carregadas
- [ ] Contexto do projeto atualizado
- [ ] Backup do código atual
- [ ] Objetivos claros definidos

### **Durante o desenvolvimento:**
- [ ] Seguir padrões de nomenclatura
- [ ] Validar tipos TypeScript
- [ ] Implementar tratamento de erros
- [ ] Testar em diferentes dispositivos
- [ ] Verificar acessibilidade

### **Antes de cada commit:**
- [ ] Código compila sem erros
- [ ] Testes passam
- [ ] Linting limpo
- [ ] Segurança verificada
- [ ] Performance otimizada

## 🚨 **ALERTAS IMPORTANTES**

- **NUNCA** execute comandos sem autorização
- **SEMPRE** valide dados de entrada
- **MANTENHA** o código legível e documentado
- **TESTE** antes de fazer deploy
- **BACKUP** antes de mudanças grandes

## 📞 **SUPORTE**

Para dúvidas sobre as regras ou sugestões de melhorias:
- Consulte a documentação específica de cada arquivo
- Verifique os exemplos de código
- Use os checklists como guia
- Mantenha as regras atualizadas

---

**Projeto:** VeloIGP Dashboard
**Versão:** 1.0.0
**Última atualização:** $(date)


