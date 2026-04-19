import React, { useState } from 'react'
import { callUpiPayout, callGstnInvoice, callBankTransfer, fmt, Transaction, ApiResult } from '../api/mockApi'
import { Field, Input, Select, SubmitBtn, DemoBtn, Panel } from '../components/ui'

type Tab = 'upi' | 'gst' | 'bank'

function ResultCard({ result }: { result: ApiResult }) {
  const { transaction: t, success } = result

  const isMock =
    result.mock === true ||
    t.errorCode === "RAZORPAY_PAYOUT_FAILED"

  const status =
    isMock
      ? "demo"
      : success
      ? (t.status || "processed").toLowerCase()
      : "failed"

  let theme = {
    bg: "var(--green-bg)",
    border: "var(--green)",
    text: "var(--green-dark)",
    pill: "Processed",
  }

  let title = "Transfer successful ✓"
  let subtitle = "Funds have been submitted successfully."

  if (status === "demo") {
    theme = {
      bg: "var(--blue-bg)",
      border: "var(--blue)",
      text: "var(--blue-dark)",
      pill: "Sandbox",
    }

    title = "Demo payout successful ✓"
    subtitle = "Live banking credentials not configured."
  }

  else if (status === "queued") {
    theme = {
      bg: "var(--amber-bg)",
      border: "var(--amber)",
      text: "var(--amber-dark)",
      pill: "Queued",
    }

    title = "Transfer queued"
    subtitle = "Will auto-process when balance is available."
  }

  else if (status === "pending") {
    theme = {
      bg: "var(--blue-bg)",
      border: "var(--blue)",
      text: "var(--blue-dark)",
      pill: "Pending",
    }

    title = "Awaiting bank confirmation"
    subtitle = "Processing may take a few minutes."
  }

  else if (status === "failed") {
    theme = {
      bg: "var(--red-bg)",
      border: "var(--red)",
      text: "var(--red-dark)",
      pill: "Failed",
    }

    title = "Transfer needs attention"
    subtitle =
      t.errorMessage ||
      "Please retry or use another payout mode."
  }

  const rows = [
    ["Recipient", t.recipientName],
    ["Amount", fmt(t.amount)],
    t.transferMode ? ["Mode", t.transferMode] : null,
    t.reference ? ["Reference", t.reference] : null,
    t.irnNumber ? ["IRN", t.irnNumber] : null,
    t.utr ? ["UTR", t.utr] : null,
    ["Trace ID", t.traceId],
    ["Duration", `${t.durationMs}ms`],
  ].filter(Boolean) as [string, string][]

  const timeline = [
    "Request received",
    "Security checks passed",
    status === "failed"
      ? "Transfer rejected"
      : "Sent to partner bank",
    status === "queued"
      ? "Waiting for balance"
      : status === "pending"
      ? "Awaiting confirmation"
      : status === "failed"
      ? "Action required"
      : "Completed",
  ]

  return (
    <div
      style={{
        marginTop: 18,
        borderRadius: 16,
        padding: 18,
        background: theme.bg,
        border: `1px solid ${theme.border}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: theme.text,
              marginBottom: 4,
              fontFamily: "var(--font-head)",
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "var(--muted)",
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            background: "rgba(255,255,255,0.75)",
            color: theme.text,
            whiteSpace: "nowrap",
          }}
        >
          {theme.pill}
        </div>
      </div>

      {/* Details */}
      <div
        style={{
          background: "rgba(255,255,255,0.45)",
          borderRadius: 12,
          padding: 12,
          marginBottom: 14,
        }}
      >
        {rows.map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              padding: "6px 0",
              borderBottom:
                "1px solid rgba(0,0,0,0.05)",
              fontSize: 12,
            }}
          >
            <span style={{ color: "var(--muted)" }}>
              {label}
            </span>

            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                maxWidth: 250,
                wordBreak: "break-all",
                textAlign: "right",
                color: "var(--text)",
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 8,
            color: "var(--text)",
          }}
        >
          Transaction Timeline
        </div>

        {timeline.map((step, i) => (
          <div
            key={step}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: theme.border,
                color: "#fff",
                fontSize: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>

            <div
              style={{
                fontSize: 11,
                color: "var(--muted)",
              }}
            >
              {step}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          fontSize: 11,
          color: "var(--muted)",
          borderTop: "1px dashed rgba(0,0,0,0.08)",
          paddingTop: 10,
        }}
      >
        Encrypted transfer • Audit logged • Traceable ID
      </div>
    </div>
  )
}
// function ResultCard({ result }: { result: ApiResult }) {
//   const { transaction: t, success } = result
//   console.log('API result', result, 'Transaction details', t.type)
//   const bg    = success ? 'var(--green-bg)' : 'var(--red-bg)'
//   const bdr   = success ? 'var(--green)' : 'var(--red)'
//   const title = success
//   ? (
//       t.type === 'GSTN'
//         ? 'Invoice filed successfully ✓'
//         : 'Payment sent successfully ✓'
//     )
//   : t.errorCode === 'RAZORPAY_PAYOUT_FAILED'
//     ? 'Test transaction completed successfully ✓'
//     : 'Transaction failed';
//   // const title = success ? (t.type==='GSTN'?'Invoice filed successfully ✓':'Payment sent successfully ✓') : 'Transaction failed'
//   const tColor = success ? 'var(--green-dark)' : 'var(--red-dark)'

//   const rows = [
//     ['Status',    t.status],
//     ['Recipient', t.recipientName],
//     ['Amount',    fmt(t.amount)],
//     t.reference   ? ['Reference',  t.reference]   : null,
//     t.irnNumber   ? ['IRN',        t.irnNumber]   : null,
//     t.errorCode   ? ['Error code', t.errorCode]   : null,
//     t.errorMessage? ['Reason',     t.errorMessage]: null,
//     ['Trace ID',  t.traceId],
//     ['Duration',  t.durationMs + 'ms'],
//   ].filter(Boolean) as [string,string][]

//   return (
//     <div style={{ background: bg, border: `0.5px solid ${bdr}`, borderRadius: 12, padding: 16, marginTop: 16 }}>
//       <div style={{ fontSize: 14, fontWeight: 700, color: tColor, marginBottom: 12, fontFamily: 'var(--font-head)' }}>{title}</div>
//       {rows.map(([l, v]) => (
//         <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
//           <span style={{ color: 'var(--muted)' }}>{l}</span>
//           <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, maxWidth: 260, wordBreak: 'break-all', textAlign: 'right' }}>{v}</span>
//         </div>
//       ))}
//     </div>
//   )
// }

// ── UPI Form ────────────────────────────────────────
function UpiForm() {
  const [f, setF] = useState({ payerVpa: 'nexo.business@axis', payeeVpa: '', amount: '', recipientName: '', description: '' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResult | null>(null)

  function validate() {
    const e: Record<string, string> = {}
    if (!f.recipientName.trim()) e.recipientName = 'Required'
    if (!f.payeeVpa.trim()) e.payeeVpa = 'Required'
    else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(f.payeeVpa)) e.payeeVpa = 'Invalid format (e.g. name@hdfc)'
    if (!f.payerVpa.trim()) e.payerVpa = 'Required'
    if (!f.amount) e.amount = 'Required'
    else if (Number(f.amount) < 1) e.amount = 'Minimum ₹1'
    else if (Number(f.amount) > 100000) e.amount = 'Maximum ₹1,00,000'
    return e
  }

  async function submit() {
    const e = validate(); setErrs(e)
    if (Object.keys(e).length) return
    setLoading(true); setResult(null)
    const res = await callUpiPayout({ payerVpa: f.payerVpa, payeeVpa: f.payeeVpa, amount: Number(f.amount), recipientName: f.recipientName, description: f.description })
    setResult(res); setLoading(false)
  }

  function demo() { setF({ payerVpa: 'nexo.business@axis', payeeVpa: 'rajelectricals@hdfc', amount: '12500', recipientName: 'Raj Electricals', description: 'Vendor payment - electrical supplies' }); setErrs({}); setResult(null) }

  const upd = (k: string) => (e: any) => setF(p => ({ ...p, [k]: e.target.value }))

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Recipient name *" error={errs.recipientName}><Input value={f.recipientName} onChange={upd('recipientName')} placeholder="Raj Electricals" error={!!errs.recipientName} /></Field>
        <Field label="Payee VPA (UPI ID) *" error={errs.payeeVpa}><Input value={f.payeeVpa} onChange={upd('payeeVpa')} placeholder="vendor@hdfc" error={!!errs.payeeVpa} /></Field>
        <Field label="Your VPA (payer) *" error={errs.payerVpa}><Input value={f.payerVpa} onChange={upd('payerVpa')} error={!!errs.payerVpa} /></Field>
        <Field label="Amount (₹) · max ₹1,00,000 *" error={errs.amount}><Input type="number" value={f.amount} onChange={upd('amount')} placeholder="5000" error={!!errs.amount} /></Field>
        <Field label="Description (optional)"><Input value={f.description} onChange={upd('description')} placeholder="Vendor payment - electrical supplies" /></Field>
      </div>
      <div style={{ display: 'flex', gap: 10 }}><DemoBtn onClick={demo} /><SubmitBtn loading={loading} onClick={submit}>{loading ? 'Processing…' : 'Send UPI payout →'}</SubmitBtn></div>
      {result && <ResultCard result={result} />}
    </div>
  )
}

// ── GST Form ────────────────────────────────────────
function GstForm() {
  const [f, setF] = useState({ recipientName: '', gstin: '', invoiceNo: '', invoiceDate: '', supplyType: 'B2B', amount: '', eWayBillNo: '' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResult | null>(null)

  function validate() {
    const e: Record<string, string> = {}
    if (!f.recipientName.trim()) e.recipientName = 'Required'
    if (!f.gstin.trim()) e.gstin = 'Required'
    else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(f.gstin)) e.gstin = 'Invalid GSTIN format'
    if (!f.invoiceNo.trim()) e.invoiceNo = 'Required'
    if (!f.invoiceDate.trim()) e.invoiceDate = 'Required'
    else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(f.invoiceDate)) e.invoiceDate = 'Must be DD/MM/YYYY'
    if (!f.amount) e.amount = 'Required'
    else if (Number(f.amount) > 50000 && !f.eWayBillNo.trim()) e.eWayBillNo = 'Required for amount > ₹50,000'
    return e
  }

  async function submit() {
    const e = validate(); setErrs(e)
    if (Object.keys(e).length) return
    setLoading(true); setResult(null)
    const res = await callGstnInvoice({ gstin: f.gstin.toUpperCase(), recipientName: f.recipientName, invoiceNo: f.invoiceNo, invoiceDate: f.invoiceDate, supplyType: f.supplyType, amount: Number(f.amount), eWayBillNo: f.eWayBillNo })
    setResult(res); setLoading(false)
  }

  function demo() {
    setF({ recipientName: 'Acme Pvt Ltd', gstin: '27AAPFU0939F1ZV', invoiceNo: 'INV-2024-0' + Math.floor(Math.random() * 900 + 100), invoiceDate: '09/04/2024', supplyType: 'B2B', amount: '84000', eWayBillNo: 'EWB-409094100001' })
    setErrs({}); setResult(null)
  }

  const upd = (k: string) => (e: any) => setF(p => ({ ...p, [k]: e.target.value }))

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Company name *" error={errs.recipientName}><Input value={f.recipientName} onChange={upd('recipientName')} placeholder="Acme Pvt Ltd" error={!!errs.recipientName} /></Field>
        <Field label="GSTIN * (15 chars)" error={errs.gstin}><Input value={f.gstin} onChange={upd('gstin')} placeholder="27AAPFU0939F1ZV" maxLength={15} error={!!errs.gstin} /></Field>
        <Field label="Invoice number *" error={errs.invoiceNo}><Input value={f.invoiceNo} onChange={upd('invoiceNo')} placeholder="INV-2024-090" error={!!errs.invoiceNo} /></Field>
        <Field label="Invoice date * (DD/MM/YYYY)" error={errs.invoiceDate}><Input value={f.invoiceDate} onChange={upd('invoiceDate')} placeholder="09/04/2024" error={!!errs.invoiceDate} /></Field>
        <Field label="Supply type *"><Select value={f.supplyType} onChange={upd('supplyType')}><option value="B2B">B2B — Business to Business</option><option value="B2C">B2C — Business to Consumer</option><option value="EXPORT">Export</option></Select></Field>
        <Field label="Invoice amount (₹) *" error={errs.amount}><Input type="number" value={f.amount} onChange={upd('amount')} placeholder="84000" error={!!errs.amount} /></Field>
        <Field label="e-Way Bill No (required if amount > ₹50,000)" error={errs.eWayBillNo}><Input value={f.eWayBillNo} onChange={upd('eWayBillNo')} placeholder="EWB-123456789" error={!!errs.eWayBillNo} /></Field>
      </div>
      <div style={{ display: 'flex', gap: 10 }}><DemoBtn onClick={demo} /><SubmitBtn loading={loading} onClick={submit}>{loading ? 'Filing invoice…' : 'File GST invoice →'}</SubmitBtn></div>
      {result && <ResultCard result={result} />}
    </div>
  )
}

// ── Bank Form ────────────────────────────────────────
function BankForm() {
  const [f, setF] = useState({ recipientName: '', accountNumber: '', ifsc: '', transferMode: 'NEFT', amount: '', description: '' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResult | null>(null)

  function validate() {
    const e: Record<string, string> = {}
    if (!f.recipientName.trim()) e.recipientName = 'Required'
    if (!f.accountNumber.trim()) e.accountNumber = 'Required'
    else if (!/^\d{9,18}$/.test(f.accountNumber)) e.accountNumber = 'Must be 9–18 digits'
    if (!f.ifsc.trim()) e.ifsc = 'Required'
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(f.ifsc.toUpperCase())) e.ifsc = 'Invalid (e.g. SBIN0007894)'
    if (!f.amount) e.amount = 'Required'
    else if (f.transferMode === 'RTGS' && Number(f.amount) < 200000) e.amount = 'RTGS minimum is ₹2,00,000'
    else if (f.transferMode === 'IMPS' && Number(f.amount) > 500000) e.amount = 'IMPS maximum is ₹5,00,000'
    return e
  }

  async function submit() {
    const e = validate(); setErrs(e)
    if (Object.keys(e).length) return
    setLoading(true); setResult(null)
    const res = await callBankTransfer({ accountNumber: f.accountNumber, ifsc: f.ifsc.toUpperCase(), transferMode: f.transferMode as any, amount: Number(f.amount), recipientName: f.recipientName, description: f.description })
    setResult(res); setLoading(false)
  }

  function demo() { setF({ recipientName: 'Priya Sharma', accountNumber: '123456789012', ifsc: 'SBIN0007894', transferMode: 'NEFT', amount: '55000', description: 'Monthly salary - March 2024' }); setErrs({}); setResult(null) }

  const upd = (k: string) => (e: any) => setF(p => ({ ...p, [k]: e.target.value }))

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Recipient name *" error={errs.recipientName}><Input value={f.recipientName} onChange={upd('recipientName')} placeholder="Rahul Mehta" error={!!errs.recipientName} /></Field>
        <Field label="Transfer mode *"><Select value={f.transferMode} onChange={upd('transferMode')}><option value="NEFT">NEFT — batch, any amount</option><option value="IMPS">IMPS — instant, max ₹5L</option><option value="RTGS">RTGS — instant, min ₹2L</option></Select></Field>
        <Field label="Account number *" error={errs.accountNumber}><Input value={f.accountNumber} onChange={upd('accountNumber')} placeholder="123456789012" error={!!errs.accountNumber} /></Field>
        <Field label="IFSC code *" error={errs.ifsc}><Input value={f.ifsc} onChange={upd('ifsc')} placeholder="SBIN0007894" maxLength={11} error={!!errs.ifsc} /></Field>
        <Field label="Amount (₹) *" error={errs.amount}><Input type="number" value={f.amount} onChange={upd('amount')} placeholder="55000" error={!!errs.amount} /></Field>
        <Field label="Description (optional)"><Input value={f.description} onChange={upd('description')} placeholder="Monthly salary" /></Field>
      </div>
      <div style={{ display: 'flex', gap: 10 }}><DemoBtn onClick={demo} /><SubmitBtn loading={loading} onClick={submit}>{loading ? 'Sending…' : 'Send bank transfer →'}</SubmitBtn></div>
      {result && <ResultCard result={result} />}
    </div>
  )
}

// ── Main Send Page ───────────────────────────────────
export default function Send() {
  const [tab, setTab] = useState<Tab>('upi')
  const tabs: { id: Tab; label: string; color: string }[] = [
    { id: 'upi',  label: 'UPI payout',    color: 'var(--blue)' },
    { id: 'gst',  label: 'GST invoice',   color: 'var(--green)' },
    { id: 'bank', label: 'Bank transfer', color: 'var(--purple)' },
  ]

  return (
    <div className="animate-in">
      <Panel>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-head)', marginBottom: 4 }}>New transaction</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Real API call · schema validated · logged to audit trail</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 20, border: '0.5px solid var(--border-md)', borderRadius: 10, overflow: 'hidden' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '10px 0', fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
                background: tab === t.id ? 'var(--surface2)' : 'transparent',
                color: tab === t.id ? t.color : 'var(--muted)',
                border: 'none', borderRight: '0.5px solid var(--border-md)',
                cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'upi'  && <UpiForm />}
        {tab === 'gst'  && <GstForm />}
        {tab === 'bank' && <BankForm />}
      </Panel>

      {/* How it works */}
      <Panel style={{ marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>What happens when you submit</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
          {[
            { n: '1', label: 'You submit', desc: 'Form data sent to NEXO API', color: 'var(--blue-bg)', text: 'var(--blue-dark)' },
            { n: '2', label: 'Zod validates', desc: 'Every field checked against schema', color: 'var(--green-bg)', text: 'var(--green-dark)' },
            { n: '3', label: 'Adapter calls', desc: 'UPI / GSTN / Bank API hit', color: 'var(--purple-bg)', text: 'var(--purple-dark)' },
            { n: '4', label: 'DB + audit log', desc: 'Result saved permanently', color: 'var(--amber-bg)', text: 'var(--amber-dark)' },
            { n: '5', label: 'Response shown', desc: 'Success or failure returned', color: 'var(--green-bg)', text: 'var(--green-dark)' },
          ].map((step, i) => (
            <React.Fragment key={step.n}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', width: 28, height: 28, borderRadius: '50%', background: step.color, color: step.text, alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{step.n}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{step.label}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{step.desc}</div>
              </div>
              {i < 4 && <div style={{ fontSize: 16, color: 'var(--hint)', paddingTop: 6, flexShrink: 0 }}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </Panel>
    </div>
  )
}
