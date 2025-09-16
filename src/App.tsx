import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import VeloigpHeader from './components/VeloigpHeader';
import VeloigpStacked from './pages/VeloigpStacked';
import MobileBottomNav from './components/MobileBottomNav';
import PWAInstallPrompt from './components/ui/PWAInstallPrompt';
import ConnectivityStatus from './components/ui/ConnectivityStatus';
import ToastContainer from './components/ui/ToastContainer';
import { useToast } from './hooks/useToast';
import './styles/veloigp-global.css';
import './styles/mobile-optimizations.css';

const AppContent = () => {
  const location = useLocation();
  const { toasts, removerToast } = useToast();
  
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'stacked';
    return 'stacked';
  };

  return (
    <>
      <ConnectivityStatus />
      <VeloigpHeader currentPage={getCurrentPage()} />
      <main>
        <div className="container main-container">
          <Routes>
            <Route path="/" element={<VeloigpStacked />} />
            <Route path="*" element={<VeloigpStacked />} />
          </Routes>
        </div>
      </main>
      <MobileBottomNav />
      <PWAInstallPrompt />
      <ToastContainer toasts={toasts} aoRemoverToast={removerToast} />
    </>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;