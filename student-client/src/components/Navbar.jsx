import React from 'react';

export default function Navbar({ onRefresh, isConnected }) {
  return (
    <header className="glass-card" style={{ padding: '16px 24px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
          🎓
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Student Portal</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DA-IICT Web Services & SOA — Lab 4</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className={`badge ${isConnected ? 'badge-success' : 'badge-warning'}`} style={{ padding: '6px 12px' }}>
          {isConnected ? '🟢 API Connected' : '🟡 API Offline / Connecting'}
        </span>
        <button onClick={onRefresh} className="btn btn-secondary" title="Refresh List">
          🔄 Refresh
        </button>
      </div>
    </header>
  );
}
