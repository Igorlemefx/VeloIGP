import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VeloigpLayout from './components/VeloigpLayout';
import VeloigpHome from './pages/VeloigpHome';
import VeloigpDashboard from './pages/VeloigpDashboard';
import VeloigpRealTime from './pages/VeloigpRealTime';
import VeloigpReports from './pages/VeloigpReports';
import VeloigpSpreadsheet from './pages/VeloigpSpreadsheet';
import VeloigpConfig from './pages/VeloigpConfig';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <VeloigpLayout>
        <Routes>
          <Route path="/" element={<VeloigpHome />} />
          <Route path="/dashboard" element={<VeloigpDashboard />} />
          <Route path="/planilhas" element={<VeloigpSpreadsheet />} />
          <Route path="/relatorios" element={<VeloigpReports />} />
          <Route path="/tempo-real" element={<VeloigpRealTime />} />
          <Route path="/config" element={<VeloigpConfig />} />
        </Routes>
      </VeloigpLayout>
    </Router>
  );
};

export default App;