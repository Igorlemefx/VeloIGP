# Regras de Segurança - VeloIGP Dashboard

## 🛡️ **PRINCÍPIOS DE SEGURANÇA**

### **1. VALIDAÇÃO E SANITIZAÇÃO**
```typescript
// ✅ CORRETO - Validação de entrada
function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) && email.length <= 254;
}

// ✅ CORRETO - Sanitização de dados
function sanitizarString(entrada: unknown): string {
  if (typeof entrada !== 'string') {
    return '';
  }
  
  return entrada
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['"]/g, '') // Remove aspas
    .substring(0, 1000); // Limita tamanho
}

// ✅ CORRETO - Validação de objeto
function validarUsuario(dados: unknown): dados is PropsUsuario {
  return (
    typeof dados === 'object' &&
    dados !== null &&
    'id' in dados &&
    'nome' in dados &&
    'email' in dados &&
    typeof (dados as any).id === 'string' &&
    typeof (dados as any).nome === 'string' &&
    typeof (dados as any).email === 'string'
  );
}
```

### **2. TRATAMENTO DE ERROS SEGURO**
```typescript
// ✅ CORRETO - Tratamento de erro sem exposição de dados
try {
  const dados = await api.buscarDadosSensiveis();
  return dados;
} catch (erro) {
  // Log interno para debugging
  console.error('Erro interno:', erro);
  
  // Retorna erro genérico para o usuário
  throw new Error('Erro ao carregar dados. Tente novamente.');
}

// ❌ ERRADO - Exposição de detalhes internos
try {
  const dados = await api.buscarDadosSensiveis();
  return dados;
} catch (erro) {
  // Exposição de stack trace e detalhes internos
  throw new Error(`Erro: ${erro.message} - Stack: ${erro.stack}`);
}
```

### **3. AUTENTICAÇÃO E AUTORIZAÇÃO**
```typescript
// ✅ CORRETO - Verificação de autenticação
function useAutenticacao() {
  const [usuario, setUsuario] = useState<PropsUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const verificarAutenticacao = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setCarregando(false);
          return;
        }

        const resposta = await fetch('/api/verificar-token', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (resposta.ok) {
          const dadosUsuario = await resposta.json();
          setUsuario(dadosUsuario);
        } else {
          localStorage.removeItem('token');
        }
      } catch (erro) {
        console.error('Erro na autenticação:', erro);
        localStorage.removeItem('token');
      } finally {
        setCarregando(false);
      }
    };

    verificarAutenticacao();
  }, []);

  return { usuario, carregando };
}

// ✅ CORRETO - Componente protegido
const RotaProtegida: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario, carregando } = useAutenticacao();

  if (carregando) {
    return <div>Verificando autenticação...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

## 🔒 **PROTEÇÃO DE DADOS**

### **4. DADOS SENSÍVEIS**
```typescript
// ✅ CORRETO - Não armazenar dados sensíveis no localStorage
const useConfiguracoes = () => {
  const [configuracoes, setConfiguracoes] = useState<PropsConfiguracoes>(() => {
    const salvas = localStorage.getItem('configuracoes');
    if (salvas) {
      try {
        const parsed = JSON.parse(salvas);
        // Remove dados sensíveis antes de usar
        const { senha, token, ...configuracoesSeguras } = parsed;
        return configuracoesSeguras;
      } catch {
        return configuracoesPadrao;
      }
    }
    return configuracoesPadrao;
  });

  const salvarConfiguracoes = (novasConfiguracoes: PropsConfiguracoes) => {
    // Remove dados sensíveis antes de salvar
    const { senha, token, ...configuracoesSeguras } = novasConfiguracoes;
    setConfiguracoes(configuracoesSeguras);
    localStorage.setItem('configuracoes', JSON.stringify(configuracoesSeguras));
  };

  return { configuracoes, salvarConfiguracoes };
};

// ❌ ERRADO - Armazenar dados sensíveis
const useConfiguracoes = () => {
  const [configuracoes, setConfiguracoes] = useState(() => {
    const salvas = localStorage.getItem('configuracoes');
    return salvas ? JSON.parse(salvas) : {}; // Pode conter senhas!
  });
  // ...
};
```

### **5. REQUISIÇÕES SEGURAS**
```typescript
// ✅ CORRETO - Requisição segura com headers
const api = {
  async buscarDados(endpoint: string, opcoes: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const configuracao: RequestInit = {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...opcoes.headers,
      },
    };

    try {
      const resposta = await fetch(`/api${endpoint}`, configuracao);
      
      if (!resposta.ok) {
        throw new Error(`Erro ${resposta.status}: ${resposta.statusText}`);
      }

      return await resposta.json();
    } catch (erro) {
      console.error('Erro na requisição:', erro);
      throw new Error('Erro ao carregar dados');
    }
  }
};

// ✅ CORRETO - Validação de resposta
const processarResposta = (resposta: unknown): PropsUsuario[] => {
  if (!Array.isArray(resposta)) {
    throw new Error('Resposta inválida do servidor');
  }

  return resposta.filter(item => validarUsuario(item));
};
```

## 🚨 **PREVENÇÃO DE VULNERABILIDADES**

### **6. XSS (Cross-Site Scripting)**
```typescript
// ✅ CORRETO - Sanitização de HTML
import DOMPurify from 'dompurify';

const ConteudoSeguro: React.FC<{ html: string }> = ({ html }) => {
  const htmlSeguro = DOMPurify.sanitize(html);
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: htmlSeguro }}
    />
  );
};

// ✅ CORRETO - Escape de caracteres especiais
const exibirTexto = (texto: string) => {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};
```

### **7. CSRF (Cross-Site Request Forgery)**
```typescript
// ✅ CORRETO - Token CSRF
const useTokenCSRF = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const obterToken = async () => {
      try {
        const resposta = await fetch('/api/csrf-token');
        const { token: novoToken } = await resposta.json();
        setToken(novoToken);
      } catch (erro) {
        console.error('Erro ao obter token CSRF:', erro);
      }
    };

    obterToken();
  }, []);

  return token;
};

// ✅ CORRETO - Requisição com token CSRF
const fazerRequisicao = async (dados: any) => {
  const tokenCSRF = useTokenCSRF();
  
  return fetch('/api/dados', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': tokenCSRF || '',
    },
    body: JSON.stringify(dados),
  });
};
```

### **8. INJEÇÃO DE CÓDIGO**
```typescript
// ✅ CORRETO - Validação de parâmetros de URL
const useParametrosSeguros = () => {
  const [parametros, setParametros] = useState<Record<string, string>>({});

  useEffect(() => {
    const url = new URL(window.location.href);
    const parametrosSeguros: Record<string, string> = {};

    for (const [chave, valor] of url.searchParams.entries()) {
      // Valida e sanitiza cada parâmetro
      if (typeof valor === 'string' && valor.length < 1000) {
        parametrosSeguros[chave] = sanitizarString(valor);
      }
    }

    setParametros(parametrosSeguros);
  }, []);

  return parametros;
};

// ❌ ERRADO - Uso direto de parâmetros sem validação
const useParametros = () => {
  const url = new URL(window.location.href);
  return Object.fromEntries(url.searchParams.entries()); // Perigoso!
};
```

## 🔐 **GERENCIAMENTO DE SESSÃO**

### **9. TOKENS E SESSÕES**
```typescript
// ✅ CORRETO - Gerenciamento seguro de tokens
class GerenciadorTokens {
  private static readonly CHAVE_TOKEN = 'veloigp_token';
  private static readonly CHAVE_REFRESH = 'veloigp_refresh';

  static obterToken(): string | null {
    return localStorage.getItem(this.CHAVE_TOKEN);
  }

  static definirToken(token: string): void {
    localStorage.setItem(this.CHAVE_TOKEN, token);
  }

  static removerTokens(): void {
    localStorage.removeItem(this.CHAVE_TOKEN);
    localStorage.removeItem(this.CHAVE_REFRESH);
  }

  static async renovarToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem(this.CHAVE_REFRESH);
      if (!refreshToken) return false;

      const resposta = await fetch('/api/renovar-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (resposta.ok) {
        const { token } = await resposta.json();
        this.definirToken(token);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}
```

## 📋 **CHECKLIST DE SEGURANÇA**

### **Antes de cada commit:**
- [ ] Todas as entradas são validadas
- [ ] Dados sensíveis não são expostos
- [ ] Tratamento de erros implementado
- [ ] Tokens gerenciados corretamente
- [ ] Sanitização de HTML aplicada
- [ ] Headers de segurança configurados
- [ ] Logs não expõem informações sensíveis

### **Verificações de segurança:**
- [ ] Nenhuma senha em código
- [ ] Tokens com expiração
- [ ] Validação de origem das requisições
- [ ] Sanitização de dados do usuário
- [ ] Tratamento seguro de erros
- [ ] Logs de auditoria implementados

---

**Projeto:** VeloIGP Dashboard
**Versão:** 1.0.0


