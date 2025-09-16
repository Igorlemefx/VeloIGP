# Regras React - VeloIGP Dashboard

## 🎯 **ESTRUTURA DE COMPONENTES**

### **1. NOMENCLATURA**
```typescript
// ✅ CORRETO - PascalCase para componentes
const VeloigpHeader = () => { /* ... */ };
const RelatoriosPage = () => { /* ... */ };
const BotaoPrimario = () => { /* ... */ };

// ✅ CORRETO - camelCase para hooks
const useDadosRelatorios = () => { /* ... */ };
const useCarregamento = () => { /* ... */ };

// ✅ CORRETO - PascalCase para arquivos de componentes
// VeloigpHeader.tsx
// RelatoriosPage.tsx
// BotaoPrimario.tsx
```

### **2. ESTRUTURA DE ARQUIVO**
```typescript
// ✅ CORRETO - Ordem de imports
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

// Imports locais
import { PropsUsuario } from '../types/Usuario';
import { useApi } from '../hooks/useApi';
import './Componente.css';

// Interface do componente
interface PropsComponente {
  id: string;
  titulo: string;
  aoClicar?: () => void;
}

// Componente principal
const MeuComponente: React.FC<PropsComponente> = ({
  id,
  titulo,
  aoClicar
}) => {
  // Estados
  const [carregando, setCarregando] = useState<boolean>(false);
  const [dados, setDados] = useState<PropsUsuario[]>([]);

  // Hooks personalizados
  const { dados: dadosApi, erro } = useApi<PropsUsuario[]>(`/api/usuarios/${id}`);

  // Efeitos
  useEffect(() => {
    if (dadosApi) {
      setDados(dadosApi);
    }
  }, [dadosApi]);

  // Callbacks
  const aoClicarBotao = useCallback(() => {
    if (aoClicar) {
      aoClicar();
    }
  }, [aoClicar]);

  // Renderização
  if (erro) {
    return <div>Erro ao carregar dados</div>;
  }

  return (
    <div className="meu-componente">
      <h2>{titulo}</h2>
      {carregando ? (
        <div>Carregando...</div>
      ) : (
        <div>
          {dados.map(usuario => (
            <div key={usuario.id}>{usuario.nome}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeuComponente;
```

## 🔧 **HOOKS E ESTADO**

### **3. USO DE HOOKS**
```typescript
// ✅ CORRETO - useState com tipos
const [usuario, setUsuario] = useState<PropsUsuario | null>(null);
const [lista, setLista] = useState<PropsUsuario[]>([]);
const [carregando, setCarregando] = useState<boolean>(false);

// ✅ CORRETO - useEffect com dependências
useEffect(() => {
  const carregarDados = async () => {
    setCarregando(true);
    try {
      const dados = await api.buscarUsuarios();
      setLista(dados);
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
    } finally {
      setCarregando(false);
    }
  };

  carregarDados();
}, []); // Dependências vazias para executar apenas uma vez

// ✅ CORRETO - useCallback para funções
const aoClicar = useCallback((id: string) => {
  setUsuario(lista.find(u => u.id === id) || null);
}, [lista]);

// ✅ CORRETO - useMemo para cálculos pesados
const total = useMemo(() => {
  return lista.reduce((acc, item) => acc + item.valor, 0);
}, [lista]);
```

### **4. HOOKS PERSONALIZADOS**
```typescript
// ✅ CORRETO - Hook personalizado
interface PropsUseApi<T> {
  url: string;
  dependencias?: any[];
}

function useApi<T>({ url, dependencias = [] }: PropsUseApi<T>) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);

  const buscarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    
    try {
      const resposta = await fetch(url);
      if (!resposta.ok) {
        throw new Error(`Erro ${resposta.status}: ${resposta.statusText}`);
      }
      
      const dados = await resposta.json();
      setDados(dados);
    } catch (erro) {
      setErro(erro instanceof Error ? erro.message : 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
  }, [url]);

  useEffect(() => {
    buscarDados();
  }, [buscarDados, ...dependencias]);

  return { dados, erro, carregando, recarregar: buscarDados };
}
```

## 🎨 **RENDERIZAÇÃO E JSX**

### **5. ESTRUTURA JSX**
```typescript
// ✅ CORRETO - JSX limpo e legível
const ListaUsuarios: React.FC<PropsListaUsuarios> = ({ usuarios, aoSelecionar }) => {
  if (usuarios.length === 0) {
    return (
      <div className="lista-vazia">
        <p>Nenhum usuário encontrado</p>
      </div>
    );
  }

  return (
    <div className="lista-usuarios">
      <h3>Usuários ({usuarios.length})</h3>
      <ul className="lista">
        {usuarios.map(usuario => (
          <li key={usuario.id} className="item-lista">
            <button
              className="botao-usuario"
              onClick={() => aoSelecionar(usuario.id)}
              type="button"
            >
              <span className="nome">{usuario.nome}</span>
              <span className="email">{usuario.email}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ❌ ERRADO - JSX confuso
const ListaUsuarios = ({ usuarios, aoSelecionar }) => {
  return <div>{usuarios.map(u => <div key={u.id}><button onClick={() => aoSelecionar(u.id)}>{u.nome}</button></div>)}</div>;
};
```

### **6. CONDICIONAIS E LOOPS**
```typescript
// ✅ CORRETO - Renderização condicional
const ComponenteCondicional = ({ mostrar, dados }) => {
  return (
    <div>
      {mostrar && <div>Conteúdo visível</div>}
      
      {dados.length > 0 ? (
        <ul>
          {dados.map(item => (
            <li key={item.id}>{item.nome}</li>
          ))}
        </ul>
      ) : (
        <p>Nenhum item encontrado</p>
      )}
    </div>
  );
};

// ✅ CORRETO - Fragment para múltiplos elementos
const ComponenteMultiplo = () => {
  return (
    <>
      <header>Cabeçalho</header>
      <main>Conteúdo principal</main>
      <footer>Rodapé</footer>
    </>
  );
};
```

## 🚀 **PERFORMANCE E OTIMIZAÇÃO**

### **7. MEMOIZAÇÃO**
```typescript
// ✅ CORRETO - React.memo para componentes
const ItemLista = React.memo<PropsItemLista>(({ item, aoClicar }) => {
  return (
    <div onClick={() => aoClicar(item.id)}>
      {item.nome}
    </div>
  );
});

// ✅ CORRETO - useMemo para cálculos
const ListaFiltrada = ({ itens, filtro }) => {
  const itensFiltrados = useMemo(() => {
    return itens.filter(item => 
      item.nome.toLowerCase().includes(filtro.toLowerCase())
    );
  }, [itens, filtro]);

  return (
    <div>
      {itensFiltrados.map(item => (
        <ItemLista key={item.id} item={item} />
      ))}
    </div>
  );
};

// ✅ CORRETO - useCallback para funções
const ComponenteComCallback = ({ dados }) => {
  const aoClicar = useCallback((id: string) => {
    console.log('Item clicado:', id);
  }, []);

  return (
    <div>
      {dados.map(item => (
        <button key={item.id} onClick={() => aoClicar(item.id)}>
          {item.nome}
        </button>
      ))}
    </div>
  );
};
```

### **8. LAZY LOADING**
```typescript
// ✅ CORRETO - Lazy loading de componentes
const RelatoriosPage = React.lazy(() => import('./pages/RelatoriosPage'));
const ConfiguracoesPage = React.lazy(() => import('./pages/ConfiguracoesPage'));

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div>Carregando...</div>}>
        <Routes>
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
};
```

## 🧪 **TESTES E DEBUGGING**

### **9. ESTRUTURA DE TESTES**
```typescript
// ✅ CORRETO - Teste de componente
import { render, screen, fireEvent } from '@testing-library/react';
import { BotaoPrimario } from './BotaoPrimario';

describe('BotaoPrimario', () => {
  it('deve renderizar o texto correto', () => {
    render(<BotaoPrimario texto="Clique aqui" />);
    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  it('deve chamar aoClicar quando clicado', () => {
    const aoClicar = jest.fn();
    render(<BotaoPrimario texto="Teste" aoClicar={aoClicar} />);
    
    fireEvent.click(screen.getByText('Teste'));
    expect(aoClicar).toHaveBeenCalledTimes(1);
  });
});
```

## 📋 **CHECKLIST REACT**

### **Antes de cada commit:**
- [ ] Componente em PascalCase
- [ ] Props tipadas com interface
- [ ] Hooks usados corretamente
- [ ] JSX limpo e legível
- [ ] Performance otimizada
- [ ] Testes implementados
- [ ] Acessibilidade verificada

### **Padrões obrigatórios:**
- [ ] Um componente por arquivo
- [ ] Exports nomeados para componentes
- [ ] Imports organizados
- [ ] Comentários para lógica complexa
- [ ] Tratamento de erros implementado

---

**Projeto:** VeloIGP Dashboard
**Versão:** 1.0.0


