# Regras TypeScript - VeloIGP Dashboard

## 🎯 **CONFIGURAÇÕES OBRIGATÓRIAS**

### **1. TIPOS ESTRITOS**
```typescript
// ✅ CORRETO - Tipos explícitos
interface PropsUsuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
}

// ❌ ERRADO - Uso de any
function processarDados(dados: any): any {
  return dados;
}

// ✅ CORRETO - Tipos específicos
function processarDados(dados: PropsUsuario): PropsUsuario {
  return { ...dados, processado: true };
}
```

### **2. INTERFACES E TIPOS**
```typescript
// ✅ CORRETO - Interface para props de componente
interface PropsBotao {
  texto: string;
  onClick: () => void;
  variante?: 'primario' | 'secundario';
  desabilitado?: boolean;
}

// ✅ CORRETO - Type para união de valores
type StatusCarregamento = 'carregando' | 'sucesso' | 'erro' | 'vazio';

// ✅ CORRETO - Enum para constantes
enum TipoNotificacao {
  SUCESSO = 'sucesso',
  ERRO = 'erro',
  AVISO = 'aviso',
  INFO = 'info'
}
```

### **3. HOOKS E ESTADO**
```typescript
// ✅ CORRETO - Estado tipado
const [usuarios, setUsuarios] = useState<PropsUsuario[]>([]);
const [carregando, setCarregando] = useState<boolean>(false);
const [erro, setErro] = useState<string | null>(null);

// ✅ CORRETO - Hook personalizado tipado
function useApi<T>(url: string) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);
  
  return { dados, erro, carregando };
}
```

### **4. FUNÇÕES E CALLBACKS**
```typescript
// ✅ CORRETO - Função com tipos explícitos
function calcularTotal(
  itens: Array<{ preco: number; quantidade: number }>
): number {
  return itens.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

// ✅ CORRETO - Callback tipado
const aoClicar = useCallback((evento: React.MouseEvent<HTMLButtonElement>) => {
  console.log('Botão clicado');
}, []);

// ✅ CORRETO - Event handler tipado
const aoMudarInput = (evento: React.ChangeEvent<HTMLInputElement>) => {
  setValor(evento.target.value);
};
```

## 🔧 **PADRÕES DE COMPONENTES**

### **5. COMPONENTES REACT**
```typescript
// ✅ CORRETO - Componente funcional tipado
interface PropsCard {
  titulo: string;
  conteudo: string;
  acao?: {
    texto: string;
    aoClicar: () => void;
  };
}

const Card: React.FC<PropsCard> = ({ titulo, conteudo, acao }) => {
  return (
    <div className="card">
      <h3>{titulo}</h3>
      <p>{conteudo}</p>
      {acao && (
        <button onClick={acao.aoClicar}>
          {acao.texto}
        </button>
      )}
    </div>
  );
};

// ✅ CORRETO - Componente com children
interface PropsContainer {
  children: React.ReactNode;
  className?: string;
}

const Container: React.FC<PropsContainer> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};
```

### **6. GENERICS E REUTILIZAÇÃO**
```typescript
// ✅ CORRETO - Hook genérico
function useLocalStorage<T>(
  chave: string,
  valorInicial: T
): [T, (valor: T) => void] {
  const [valor, setValor] = useState<T>(() => {
    const item = localStorage.getItem(chave);
    return item ? JSON.parse(item) : valorInicial;
  });

  const definirValor = (novoValor: T) => {
    setValor(novoValor);
    localStorage.setItem(chave, JSON.stringify(novoValor));
  };

  return [valor, definirValor];
}

// ✅ CORRETO - Componente genérico
interface PropsLista<T> {
  itens: T[];
  renderizarItem: (item: T, index: number) => React.ReactNode;
  chave: keyof T;
}

function Lista<T>({ itens, renderizarItem, chave }: PropsLista<T>) {
  return (
    <ul>
      {itens.map((item, index) => (
        <li key={String(item[chave])}>
          {renderizarItem(item, index)}
        </li>
      ))}
    </ul>
  );
}
```

## 🚨 **REGRAS DE VALIDAÇÃO**

### **7. VALIDAÇÃO DE DADOS**
```typescript
// ✅ CORRETO - Validação de entrada
function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ✅ CORRETO - Type guard
function ehUsuario(valor: unknown): valor is PropsUsuario {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'id' in valor &&
    'nome' in valor &&
    'email' in valor
  );
}

// ✅ CORRETO - Sanitização
function sanitizarString(entrada: unknown): string {
  if (typeof entrada !== 'string') {
    return '';
  }
  return entrada.trim().replace(/[<>]/g, '');
}
```

### **8. TRATAMENTO DE ERROS**
```typescript
// ✅ CORRETO - Error boundary tipado
interface PropsErrorBoundary {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ erro: Error }>;
}

class ErrorBoundary extends React.Component<
  PropsErrorBoundary,
  { temErro: boolean; erro: Error | null }
> {
  constructor(props: PropsErrorBoundary) {
    super(props);
    this.state = { temErro: false, erro: null };
  }

  static getDerivedStateFromError(erro: Error) {
    return { temErro: true, erro };
  }

  componentDidCatch(erro: Error, info: React.ErrorInfo) {
    console.error('Erro capturado:', erro, info);
  }

  render() {
    if (this.state.temErro) {
      const Fallback = this.props.fallback || DefaultFallback;
      return <Fallback erro={this.state.erro!} />;
    }

    return this.props.children;
  }
}
```

## 📋 **CHECKLIST TYPESCRIPT**

### **Antes de cada commit:**
- [ ] Todos os tipos estão explícitos
- [ ] Nenhum uso de `any`
- [ ] Interfaces bem definidas
- [ ] Validação de dados implementada
- [ ] Tratamento de erros adequado
- [ ] Código compila sem erros TypeScript

### **Padrões obrigatórios:**
- [ ] PascalCase para componentes e interfaces
- [ ] camelCase para variáveis e funções
- [ ] snake_case para constantes
- [ ] Prefixos descritivos (Props, Tipo, etc.)
- [ ] Comentários JSDoc para funções complexas

---

**Projeto:** VeloIGP Dashboard
**Versão:** 1.0.0


