import React, { useState, useEffect, useRef } from 'react'
import { Transaction, fmt, timeAgo, store, AuditLog } from '../api/mockApi'

// ── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid rgba(0,0,0,0.1)`,
      borderTopColor: 'var(--blue)',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      flexShrink: 0,
    }} />
  )
}

// ── Badge ────────────────────────────────────────────────────────────────────
export function StatusBadge({ status, type }: { status: Transaction['status']; type?: Transaction['type'] }) {
  const label = status === 'SUCCESS' ? (type === 'GSTN' ? 'Filed' : 'Sent') : status === 'PENDING' ? 'Pending' : 'Failed'
  const colors: Record<string, [string, string]> = {
    SUCCESS: ['var(--green-bg)', 'var(--green)'],
    PENDING: ['var(--amber-bg)', 'var(--amber)'],
    FAILED:  ['var(--red-bg)',   'var(--red)'],
  }
  const [bg, color] = colors[status]
  return (
    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: bg, color, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

export function TypeIcon({ type }: { type: Transaction['type'] }) {
  const cfg: Record<string, [string, string, string]> = {
    UPI:  ['var(--blue-bg)',   'var(--blue-dark)',   'UPI'],
    GSTN: ['var(--green-bg)',  'var(--green-dark)',  'GST'],
    BANK: ['var(--purple-bg)', 'var(--purple-dark)', 'Bank'],
  }
  const [bg, color, label] = cfg[type]
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10, background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, flexShrink: 0, letterSpacing: 0.3,
    }}>
      {label}
    </div>
  )
}

// ── Transaction Row ──────────────────────────────────────────────────────────
export function TxnRow({ txn, onClick }: { txn: Transaction; onClick: () => void }) {
  const sub = txn.type === 'UPI'
    ? `${txn.recipientId} · ${timeAgo(txn.createdAt)}`
    : txn.type === 'GSTN'
    ? `${txn.recipientId} · ${txn.invoiceNo || ''} · ${timeAgo(txn.createdAt)}`
    : `${txn.bankMode || ''} · ${txn.ifsc || ''} · ${timeAgo(txn.createdAt)}`

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
        borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s',
        borderBottom: '0.5px solid var(--border)',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <TypeIcon type={txn.type} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {txn.recipientName}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
          {sub}
          {txn.errorCode && <span style={{ color: 'var(--red)', marginLeft: 6 }}>{txn.errorCode}</span>}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{fmt(txn.amount)}</div>
        <div style={{ marginTop: 3 }}><StatusBadge status={txn.status} type={txn.type} /></div>
      </div>
    </div>
  )
}

// ── Metric Card ──────────────────────────────────────────────────────────────
export function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: 'green' | 'red' | 'amber' }) {
  const color = accent === 'green' ? 'var(--green)' : accent === 'red' ? 'var(--red)' : accent === 'amber' ? 'var(--amber)' : 'var(--text)'
  return (
    <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, fontWeight: 500, letterSpacing: 0.3 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color, lineHeight: 1, fontFamily: 'var(--font-head)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--hint)', marginTop: 5 }}>{sub}</div>}
    </div>
  )
}

// ── Panel ────────────────────────────────────────────────────────────────────
export function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '0.5px solid var(--border)',
      borderRadius: 14, padding: '16px 18px',
      boxShadow: 'var(--shadow-sm)', ...style
    }}>
      {children}
    </div>
  )
}

export function PanelHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
      {action && <button onClick={onAction} style={{ fontSize: 12, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}>{action} →</button>}
    </div>
  )
}

// ── Transaction Detail Modal ──────────────────────────────────────────────────
export function TxnModal({ txn, onClose }: { txn: Transaction | null; onClose: () => void }) {
  const log = txn ? store.auditLogs.find(l => l.traceId === txn.traceId) : null

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!txn) return null

  const DetailItem = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
    <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontSize: 11, color: 'var(--hint)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, fontFamily: mono ? "var(--font-mono)" : "var(--font)", wordBreak: 'break-all' }}>{value}</div>
    </div>
  )

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{
        background: 'var(--surface)', borderRadius: 16, padding: 24, width: 540,
        maxHeight: '85vh', overflowY: 'auto', boxShadow: 'var(--shadow-md)',
        border: '0.5px solid var(--border-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-head)' }}>{txn.recipientName}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{fmt(txn.amount)}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusBadge status={txn.status} type={txn.type} />
            <button onClick={onClose} style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hint)', lineHeight: 1, padding: '0 4px' }}>×</button>
          </div>
        </div>

        {txn.errorMessage && (
          <div style={{ background: 'var(--red-bg)', border: '0.5px solid var(--red)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--red-dark)', marginBottom: 3 }}>{txn.errorCode}</div>
            <div style={{ fontSize: 12, color: 'var(--red-dark)' }}>{txn.errorMessage}</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <DetailItem label="Type" value={txn.type === 'GSTN' ? 'GST Invoice' : txn.type === 'UPI' ? 'UPI Payout' : 'Bank Transfer'} />
          <DetailItem label="Amount" value={fmt(txn.amount)} />
          <DetailItem label="Recipient" value={txn.recipientName} />
          <DetailItem label="Time" value={new Date(txn.createdAt).toLocaleString('en-IN')} />
          {txn.payeeVpa   && <DetailItem label="UPI VPA"      value={txn.payeeVpa}   mono />}
          {txn.gstin      && <DetailItem label="GSTIN"        value={txn.gstin}       mono />}
          {txn.invoiceNo  && <DetailItem label="Invoice No."  value={txn.invoiceNo}   mono />}
          {txn.irnNumber  && <DetailItem label="IRN"          value={txn.irnNumber}   mono />}
          {txn.bankMode   && <DetailItem label="Mode"         value={txn.bankMode} />}
          {txn.ifsc       && <DetailItem label="IFSC"         value={txn.ifsc}        mono />}
          {txn.itcEligible !== undefined && <DetailItem label="ITC Eligible" value={txn.itcEligible ? 'Yes ✓' : 'No'} />}
          {txn.reference  && <div style={{ gridColumn: '1/-1' }}><DetailItem label="Reference / UTR / IRN" value={txn.reference} mono /></div>}
        </div>

        {log && (
          <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', lineHeight: 1.9 }}>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6, fontFamily: 'var(--font)', fontSize: 12 }}>Audit trail</div>
            <div>traceId: {log.traceId}</div>
            <div>endpoint: {log.endpoint}</div>
            <div>statusCode: {log.statusCode} · durationMs: {log.durationMs}ms</div>
            <div>requestHash: {log.requestHash}</div>
            <div>actorId: {log.actorId}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Filter Pills ─────────────────────────────────────────────────────────────
export function FilterPills({ options, value, onChange }: { options: { label: string; value: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            fontSize: 11, padding: '4px 14px', borderRadius: 20,
            border: `0.5px solid ${value === opt.value ? 'var(--blue)' : 'var(--border-md)'}`,
            background: value === opt.value ? 'var(--blue-bg)' : 'transparent',
            color: value === opt.value ? 'var(--blue-dark)' : 'var(--muted)',
            cursor: 'pointer', fontWeight: value === opt.value ? 600 : 400,
            fontFamily: 'var(--font)', transition: 'all 0.15s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Form components ──────────────────────────────────────────────────────────
export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

const inputStyle = (error?: boolean): React.CSSProperties => ({
  width: '100%', padding: '9px 12px',
  border: `0.5px solid ${error ? 'var(--red)' : 'var(--border-md)'}`,
  borderRadius: 8, fontSize: 13, background: error ? 'var(--red-bg)' : 'var(--surface)',
  color: 'var(--text)', fontFamily: 'var(--font)', outline: 'none',
  transition: 'border-color 0.15s',
})

export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const { error, ...rest } = props
  return <input {...rest} style={inputStyle(error)} onFocus={e => e.target.style.borderColor = 'var(--blue)'} onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border-md)'} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={inputStyle()} />
}

export function SubmitBtn({ loading, children, onClick }: { loading?: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: '10px 24px', background: loading ? 'var(--blue-bg)' : 'var(--blue)',
        color: loading ? 'var(--blue)' : '#fff', border: 'none', borderRadius: 10,
        fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', gap: 8,
        transition: 'all 0.15s',
      }}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  )
}

export function DemoBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px', background: 'transparent', color: 'var(--muted)',
        border: '0.5px solid var(--border-md)', borderRadius: 10,
        fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      Try demo values
    </button>
  )
}
