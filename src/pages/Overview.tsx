import React, { useState, useEffect } from 'react'
import { store, fmt, Stats, Transaction } from '../api/mockApi'
import { MetricCard, Panel, PanelHeader, TxnRow, TxnModal, Spinner } from '../components/ui'

export default function Overview({ onNav }: { onNav: (id: string) => void }) {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [txns, setTxns]     = useState<Transaction[]>([])
  const [modal, setModal]   = useState<Transaction | null>(null)
  const [tick, setTick]     = useState(0)

  useEffect(() => {
    const refresh = () => {
      setStats(store.getStats())
      setTxns(store.transactions.slice(0, 6))
      setTick(t => t + 1)
    }
    refresh()
    return () => { store.subscribe(refresh) }
  }, [])

  if (!stats) return <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 32 }}><Spinner />Loading…</div>

  return (
    <div className="animate-in">
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        <MetricCard label="Total sent today"    value={fmt(stats.totalSent)}    sub={`${store.transactions.filter(t=>t.status==='SUCCESS').length} transactions`} />
        <MetricCard label="UPI success rate"    value={`${stats.upiRate}%`}     sub={`${stats.upiCount} UPI calls`} accent="green" />
        <MetricCard label="GST invoices filed"  value={`${stats.gstnFiled}`}    sub={fmt(stats.gstnValue)+' total value'} />
        <MetricCard label="Failed transactions" value={`${stats.failedCount}`}  sub="needs attention" accent={stats.failedCount > 0 ? 'red' : undefined} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* Recent transactions */}
        <Panel>
          <PanelHeader title="Recent transactions" action="View all" onAction={() => onNav('all')} />
          {txns.length === 0
            ? <div style={{ textAlign: 'center', padding: 24, color: 'var(--hint)', fontSize: 13 }}>No transactions yet</div>
            : txns.map(t => <TxnRow key={t.id} txn={t} onClick={() => setModal(t)} />)
          }
        </Panel>

        {/* Needs attention */}
        <Panel>
          <PanelHeader
            title="Needs attention"
            action={stats.needsAttention.length > 0 ? `${stats.needsAttention.length} items` : undefined}
          />
          {stats.needsAttention.length === 0
            ? <div style={{ textAlign: 'center', padding: 24, color: 'var(--hint)', fontSize: 13 }}>All clear ✓</div>
            : stats.needsAttention.map(t => (
              <div key={t.id} onClick={() => setModal(t)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '0.5px solid var(--border)', cursor: 'pointer' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.recipientName}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{t.errorCode || 'Pending response'}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{fmt(t.amount)}</div>
                  <button onClick={e => { e.stopPropagation(); setModal(t) }} style={{
                    marginTop: 3, fontSize: 11, padding: '2px 8px', borderRadius: 6,
                    border: '0.5px solid var(--red)', color: 'var(--red)',
                    background: 'var(--red-bg)', cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>{t.status === 'FAILED' ? 'Fix' : 'Check'}</button>
                </div>
              </div>
            ))
          }
        </Panel>
      </div>

      {/* Today by type */}
      <Panel>
        <PanelHeader title="Today by type" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1 }}>
          {[
            ['UPI payouts', fmt(store.transactions.filter(t=>t.type==='UPI'&&t.status==='SUCCESS').reduce((s,t)=>s+t.amount,0))],
            ['Bank transfers', fmt(stats.bankAmt)],
            ['GST invoice value', fmt(stats.gstnValue)],
            ['ITC claimable (12%)', fmt(Math.round(stats.itcClaimable))],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: '12px 0' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-head)' }}>{value}</div>
            </div>
          ))}
        </div>
      </Panel>

      <TxnModal txn={modal} onClose={() => setModal(null)} />
    </div>
  )
}
