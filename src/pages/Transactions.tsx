import React, { useState, useEffect } from 'react'
import { store, Transaction, fmt } from '../api/mockApi'
import { MetricCard, Panel, PanelHeader, TxnRow, TxnModal, FilterPills, Spinner } from '../components/ui'

type PageType = 'upi' | 'gst' | 'bank' | 'all'

const FILTER_OPTIONS: Record<PageType, { label: string; value: string }[]> = {
  upi:  [{ label:'All', value:'all' }, { label:'Sent', value:'SUCCESS' }, { label:'Pending', value:'PENDING' }, { label:'Failed', value:'FAILED' }],
  gst:  [{ label:'All', value:'all' }, { label:'Filed', value:'SUCCESS' }, { label:'Failed', value:'FAILED' }],
  bank: [{ label:'All', value:'all' }, { label:'Sent', value:'SUCCESS' }, { label:'Failed', value:'FAILED' }],
  all:  [{ label:'All', value:'all' }, { label:'UPI', value:'UPI' }, { label:'GST', value:'GST' }, { label:'Bank', value:'BANK' }, { label:'Failed only', value:'FAILED' }],
}

export default function Transactions({ pageType }: { pageType: PageType }) {
  const [txns, setTxns]   = useState<Transaction[]>([])
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState<Transaction | null>(null)

  useEffect(() => {
    setFilter('all')
    const refresh = () => {
      const apiMap: Record<PageType, string | null> = { upi: 'UPI', gst: 'GSTN', bank: 'BANK', all: null }
      const apiFilter = apiMap[pageType]
      setTxns(apiFilter ? store.transactions.filter(t => t.type === apiFilter) : store.transactions)
    }
    refresh()
    return () => { store.subscribe(refresh) }
  }, [pageType])

  const filtered = txns.filter(t => {
    if (filter === 'all') return true
    if (filter === 'SUCCESS' || filter === 'PENDING' || filter === 'FAILED') return t.status === filter
    if (filter === 'UPI' || filter === 'GST' || filter === 'BANK') return t.type === (filter === 'GST' ? 'GSTN' : filter)
    return true
  })

  // Metrics for each page
  const Metrics = () => {
    if (pageType === 'upi') {
      const ok = txns.filter(t => t.status === 'SUCCESS')
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
          <MetricCard label="UPI sent today"  value={fmt(ok.reduce((s,t)=>s+t.amount,0))} />
          <MetricCard label="Successful"      value={`${ok.length}`} accent="green" />
          <MetricCard label="Pending"         value={`${txns.filter(t=>t.status==='PENDING').length}`} accent="amber" />
          <MetricCard label="Failed"          value={`${txns.filter(t=>t.status==='FAILED').length}`} accent="red" />
        </div>
      )
    }
    if (pageType === 'gst') {
      const ok = txns.filter(t => t.status === 'SUCCESS')
      const itc = ok.filter(t => t.itcEligible).reduce((s,t) => s + t.amount * 0.12, 0)
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
          <MetricCard label="Invoices filed"    value={`${ok.length}`} />
          <MetricCard label="Total value"       value={fmt(ok.reduce((s,t)=>s+t.amount,0))} />
          <MetricCard label="ITC claimable"     value={fmt(Math.round(itc))} accent="green" />
          <MetricCard label="Mismatches"        value={`${txns.filter(t=>t.status==='FAILED').length}`} accent="red" />
        </div>
      )
    }
    if (pageType === 'bank') {
      const ok = txns.filter(t => t.status === 'SUCCESS')
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
          <MetricCard label="Transfers today" value={fmt(ok.reduce((s,t)=>s+t.amount,0))} />
          <MetricCard label="NEFT"            value={`${ok.filter(t=>t.bankMode==='NEFT').length} transfers`} />
          <MetricCard label="IMPS"            value={`${ok.filter(t=>t.bankMode==='IMPS').length} transfers`} />
          <MetricCard label="Failed"          value={`${txns.filter(t=>t.status==='FAILED').length}`} accent="red" />
        </div>
      )
    }
    return null
  }

  return (
    <div className="animate-in">
      <Metrics />
      <Panel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {pageType === 'all' ? 'All transactions' : pageType === 'upi' ? 'UPI payout transactions' : pageType === 'gst' ? 'GST invoice transactions' : 'Bank transfer transactions'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--hint)' }}>{filtered.length} results</div>
        </div>
        <FilterPills options={FILTER_OPTIONS[pageType]} value={filter} onChange={setFilter} />
        {filtered.length === 0
          ? <div style={{ textAlign: 'center', padding: 32, color: 'var(--hint)', fontSize: 13 }}>No transactions match this filter.</div>
          : filtered.map(t => <TxnRow key={t.id} txn={t} onClick={() => setModal(t)} />)
        }
      </Panel>
      <TxnModal txn={modal} onClose={() => setModal(null)} />
    </div>
  )
}
