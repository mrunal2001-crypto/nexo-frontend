import React, { useState, useEffect } from 'react'
import { store, AuditLog } from '../api/mockApi'
import { MetricCard, Panel } from '../components/ui'

function LogCodeBadge({ code }: { code: number }) {
  const ok = code === 200 || code === 201
  const pend = code === 202
  const [bg, color] = ok ? ['var(--green-bg)', 'var(--green)'] : pend ? ['var(--amber-bg)', 'var(--amber)'] : ['var(--red-bg)', 'var(--red)']
  return <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 5, background: bg, color, fontFamily: 'var(--font-mono)', fontWeight: 600, flexShrink: 0 }}>{code}</span>
}

function ApiBadge({ api }: { api: AuditLog['api'] }) {
  const cfg = { UPI: ['var(--blue-bg)', 'var(--blue-dark)', 'UPI'], GSTN: ['var(--green-bg)', 'var(--green-dark)', 'GST'], BANK: ['var(--purple-bg)', 'var(--purple-dark)', 'Bank'] }
  const [bg, color, label] = cfg[api]
  return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: bg, color, fontWeight: 600, minWidth: 38, textAlign: 'center', flexShrink: 0 }}>{label}</span>
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    const refresh = () => setLogs([...store.auditLogs])
    refresh()
    return () => { store.subscribe(refresh) }
  }, [])

  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

  return (
    <div className="animate-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        <MetricCard label="Log entries"     value={`${logs.length}`} />
        <MetricCard label="Tamper checks"   value="100%" accent="green" />
        <MetricCard label="Retention"       value="7 yrs" />
        <MetricCard label="Append-only"     value="Yes" accent="green" />
      </div>

      <Panel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Audit log stream</div>
          <div style={{ fontSize: 11, color: 'var(--hint)' }}>Immutable · SHA-256 hashed · append-only</div>
        </div>

        {logs.map(log => (
          <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border)', fontSize: 12 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--hint)', minWidth: 78, paddingTop: 2, flexShrink: 0 }}>{fmtTime(log.timestamp)}</div>
            <ApiBadge api={log.api} />
            <div style={{ flex: 1, color: 'var(--muted)', lineHeight: 1.6 }}>
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>{log.endpoint}</span>
              {' · '}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{log.traceId}</span>
              {log.errorCode && <span style={{ color: 'var(--red)', marginLeft: 6 }}>{log.errorCode}</span>}
              <div style={{ fontSize: 10, color: 'var(--hint)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{log.requestHash} · {log.durationMs}ms</div>
            </div>
            <LogCodeBadge code={log.statusCode} />
          </div>
        ))}
      </Panel>
    </div>
  )
}
