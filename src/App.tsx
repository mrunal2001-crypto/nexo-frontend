import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Overview from './pages/Overview'
import Send from './pages/Send'
import Transactions from './pages/Transactions'
import AuditLogPage from './pages/AuditLog'

type Screen = 'overview' | 'send' | 'upi' | 'gst' | 'bank' | 'all' | 'audit'

const TITLES: Record<Screen, string> = {
  overview: 'Overview',
  send:     'New transaction',
  upi:      'UPI payouts',
  gst:      'GST invoices',
  bank:     'Bank transfers',
  all:      'All transactions',
  audit:    'Audit log',
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('overview')

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar current={screen} onNav={id => setScreen(id as Screen)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{
          background: 'var(--surface)', borderBottom: '0.5px solid var(--border)',
          padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-head)' }}>{TITLES[screen]}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, background: 'var(--green-bg)', color: 'var(--green)', fontWeight: 600 }}>● Live</span>
            <button
              onClick={() => setScreen('send')}
              style={{
                padding: '8px 18px', background: 'var(--blue)', color: '#fff', border: 'none',
                borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font)', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-dark)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--blue)')}
            >
              + New transaction
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {screen === 'overview' && <Overview onNav={id => setScreen(id as Screen)} />}
          {screen === 'send'     && <Send />}
          {screen === 'upi'      && <Transactions pageType="upi" />}
          {screen === 'gst'      && <Transactions pageType="gst" />}
          {screen === 'bank'     && <Transactions pageType="bank" />}
          {screen === 'all'      && <Transactions pageType="all" />}
          {screen === 'audit'    && <AuditLogPage />}
        </div>
      </div>
    </div>
  )
}
