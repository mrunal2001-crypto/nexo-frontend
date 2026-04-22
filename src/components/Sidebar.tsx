import React from 'react'

const NAV = [
  { section: 'Overview', items: [{ id: 'overview', label: 'Overview', color: '#888780' }] },
  { section: 'Send money', items: [{ id: 'send', label: 'New transaction', color: '#378add' }] },
  { section: 'Transactions', items: [
    { id: 'upi',  label: 'UPI payouts',    color: '#378add' },
    { id: 'gst',  label: 'GST invoices',   color: '#639922' },
    { id: 'bank', label: 'Bank transfers', color: '#7f77dd' },
  ]},
  { section: 'Records', items: [
    { id: 'all',   label: 'All transactions', color: '#ba7517' },
    { id: 'audit', label: 'Audit log',         color: '#888780' },
  ]},
]

export default function Sidebar({ current, onNav }: { current: string; onNav: (id: string) => void }) {
  return (
    <aside style={{
      width: 210, background: 'var(--surface)', borderRight: '0.5px solid var(--border)',
      display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100%',
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, background: 'var(--blue)', borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-head)', flexShrink: 0,
        }}>P</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-head)', letterSpacing: 0.5 }}>Payment Gateway</div>
          <div style={{ fontSize: 10, color: 'var(--hint)', marginTop: 1, letterSpacing: 0.3 }}>Finance hub</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '10px 8px', flex: 1, overflowY: 'auto' }}>
        {NAV.map(group => (
          <div key={group.section}>
            <div style={{ fontSize: 10, color: 'var(--hint)', padding: '10px 10px 4px', letterSpacing: .07, textTransform: 'uppercase', fontWeight: 600 }}>
              {group.section}
            </div>
            {group.items.map(item => {
              const active = current === item.id
              return (
                <div
                  key={item.id}
                  onClick={() => onNav(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
                    borderRadius: 9, cursor: 'pointer', fontSize: 13, marginBottom: 1,
                    background: active ? 'var(--blue-bg)' : 'transparent',
                    color: active ? 'var(--blue-dark)' : 'var(--muted)',
                    fontWeight: active ? 600 : 400, transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface2)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: active ? 'var(--blue)' : item.color, flexShrink: 0 }} />
                  {item.label}
                </div>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: 12, borderTop: '0.5px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
          borderRadius: 9, background: 'var(--surface2)', fontSize: 12, color: 'var(--muted)',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#639922', flexShrink: 0 }} />
          Sandbox · v1.0.0
        </div>
      </div>
    </aside>
  )
}
