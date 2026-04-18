import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import './index.css';
import RegistrationPage from './pages/RegistrationPage';
import ScannerPage from './pages/ScannerPage';

function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav style={{
      background: '#083459',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 60,
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <span style={{ color: '#fff', fontWeight: 700, fontSize: 20, letterSpacing: -0.5 }}>
        Event<span style={{ color: '#f97316' }}>MS</span>
      </span>
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { to: '/', label: 'Register' },
          { to: '/scanner', label: 'Scanner' },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={{
              color: pathname === to ? '#fff' : '#94a3b8',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: pathname === to ? 600 : 400,
              padding: '6px 14px',
              borderRadius: 8,
              background: pathname === to ? 'rgba(255,255,255,0.1)' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<RegistrationPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
      </Routes>
    </BrowserRouter>
  );
}
