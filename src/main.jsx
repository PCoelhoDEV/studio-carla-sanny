import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdminPage from './pages/AdminPage.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#FFF5F7', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#E11D48', marginBottom: 8 }}>Ops! Ocorreu um pequeno erro.</h2>
          <p style={{ color: '#4B5563', fontSize: 14, marginBottom: 16 }}>{this.state.error?.message || 'Erro inesperado'}</p>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{ padding: '12px 24px', backgroundColor: '#E11D48', color: 'white', border: 'none', borderRadius: 16, fontWeight: 'bold', cursor: 'pointer' }}
          >
            Limpar Dados e Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/cbarbosa" element={<AdminPage />} />
          <Route path="/admin" element={<Navigate to="/cbarbosa" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
