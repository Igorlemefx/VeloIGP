import React, { useState, useEffect } from 'react';
import { fetchReport01, formatarDataParaAPI } from '../services/api55pbx';

function Dashboard() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);
      setErro(null);

      const dataFim = new Date();
      const dataInicio = new Date();
      dataInicio.setMonth(dataInicio.getMonth() - 3);

      try {
        const res = await fetchReport01(formatarDataParaAPI(dataInicio), formatarDataParaAPI(dataFim));
        setDados(res.dados || res);
      } catch (e) {
        setErro(e.message || 'Erro desconhecido');
      }

      setCarregando(false);
    }

    carregarDados();
  }, []);

  if (carregando) {
    return (
      <div className="glass-panel fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spin" style={{ display: 'inline-block', marginBottom: '1rem' }}>🔄</div>
        <h3>Carregando dados do Dashboard 55PBX...</h3>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="glass-panel fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: '#ff6b6b', marginBottom: '1rem' }}>❌</div>
        <h3>Erro ao carregar dados</h3>
        <p style={{ color: '#ff6b6b' }}>{erro}</p>
        <p style={{ marginTop: '1rem', fontSize: '0.9em', opacity: '0.8' }}>
          Verifique se o token da API está configurado corretamente em src/services/api55pbx.js
        </p>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="glass-panel fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1rem' }}>📊</div>
        <h3>Nenhum dado disponível</h3>
        <p style={{ opacity: '0.8' }}>Aguardando dados da API 55PBX...</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '1rem', textAlign: 'center' }}>
          📊 Dashboard 55PBX
        </h1>
        <p style={{ textAlign: 'center', opacity: '0.8' }}>
          Relatório dos últimos 3 meses
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>📈 Dados da API</h2>
        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '1rem', 
          borderRadius: '8px',
          overflow: 'auto',
          maxHeight: '400px'
        }}>
          <pre style={{ color: '#00ff88', fontSize: '0.9em' }}>
            {JSON.stringify(dados, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;