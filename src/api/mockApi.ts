// ── Types ──────────────────────────────────────────
export type TxnStatus = 'SUCCESS' | 'PENDING' | 'FAILED'
export type ApiType   = 'UPI' | 'GSTN' | 'BANK'
export type BankMode  = 'NEFT' | 'IMPS' | 'RTGS'

export interface Transaction {
  id: string
  traceId: string
  type: ApiType
  status: TxnStatus
  amount: number
  recipientName: string
  recipientId: string
  reference: string
  description: string
  durationMs: number
  createdAt: string
  errorCode?: string
  errorMessage?: string
  payerVpa?: string
  payeeVpa?: string
  gstin?: string
  invoiceNo?: string
  invoiceType?: string
  irnNumber?: string
  itcEligible?: boolean
  bankMode?: BankMode
  ifsc?: string
  accountNumber?: string
}

export interface AuditLog {
  id: string
  traceId: string
  timestamp: string
  api: ApiType
  endpoint: string
  actorId: string
  statusCode: number
  durationMs: number
  errorCode?: string
  requestHash: string
}

export interface Stats {
  totalSent: number
  upiRate: number
  upiCount: number
  gstnFiled: number
  gstnValue: number
  bankAmt: number
  bankNeft: number
  bankImps: number
  failedCount: number
  pendingCount: number
  itcClaimable: number
  gstnMismatch: number
  needsAttention: Transaction[]
}

// ── Helpers ────────────────────────────────────────
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}
function shortId() { return Math.random().toString(36).slice(2, 9) }
function randMs(a: number, b: number) { return Math.floor(Math.random() * (b - a) + a) }
function pastTime(m: number) { return new Date(Date.now() - m * 60000).toISOString() }
function simpleHash(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0
  return 'sha256-' + Math.abs(h).toString(16).padStart(8, '0')
}
function delay(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// ── In-memory database ─────────────────────────────
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: uuid(), traceId: 'a7f3c1-upi', type: 'UPI', status: 'SUCCESS', amount: 12500, recipientName: 'Raj Electricals', recipientId: 'rajelectricals@hdfc', reference: 'UPI409094102314', description: 'Vendor payment - electrical supplies', durationMs: 487, createdAt: pastTime(2), payerVpa: 'nexo.business@axis', payeeVpa: 'rajelectricals@hdfc' },
  { id: uuid(), traceId: 'b8e2d4-gst', type: 'GSTN', status: 'SUCCESS', amount: 84000, recipientName: 'Acme Pvt Ltd', recipientId: '27AAPFU0939F1ZV', reference: 'IRN20240409089', description: 'B2B invoice - consulting services Q1', durationMs: 712, createdAt: pastTime(8), gstin: '27AAPFU0939F1ZV', invoiceNo: 'INV-2024-089', invoiceType: 'B2B', irnNumber: 'IRN20240409089', itcEligible: true },
  { id: uuid(), traceId: 'c9f1e5-bank', type: 'BANK', status: 'SUCCESS', amount: 55000, recipientName: 'Priya Sharma', recipientId: '****4821', reference: 'NEFT409094102001', description: 'Monthly salary - March 2024', durationMs: 934, createdAt: pastTime(12), bankMode: 'NEFT', ifsc: 'SBIN0007894', accountNumber: '****4821' },
  { id: uuid(), traceId: 'd0g2f6-upi', type: 'UPI', status: 'PENDING', amount: 8000, recipientName: 'Amit Design Studio', recipientId: 'amitdesign@okicici', reference: 'UPI409094118001', description: 'Freelancer payment - logo design', durationMs: 312, createdAt: pastTime(18), payerVpa: 'nexo.business@axis', payeeVpa: 'amitdesign@okicici' },
  { id: uuid(), traceId: 'e1h3g7-bank', type: 'BANK', status: 'FAILED', amount: 31200, recipientName: 'Sharma Traders', recipientId: '****9012', reference: '', description: 'Vendor payment - raw materials', durationMs: 203, createdAt: pastTime(25), bankMode: 'IMPS', ifsc: 'HDFC0001234', accountNumber: '****9012', errorCode: 'BANK_IFSC_STALE', errorMessage: 'IFSC HDFC0001234 belongs to merged branch' },
  { id: uuid(), traceId: 'f2i4h8-gst', type: 'GSTN', status: 'FAILED', amount: 120000, recipientName: 'Beta Corp', recipientId: '06BZAHM9999P6Z2', reference: '', description: 'B2B invoice - software license', durationMs: 601, createdAt: pastTime(35), gstin: '06BZAHM9999P6Z2', invoiceNo: 'INV-2024-085', invoiceType: 'B2B', itcEligible: false, errorCode: 'GSTN_MISMATCH', errorMessage: 'GSTIN not found in GSTR-2B for period Mar-24' },
  { id: uuid(), traceId: 'g3j5i9-upi', type: 'UPI', status: 'SUCCESS', amount: 3200, recipientName: 'Kumar Stores', recipientId: 'kumarstores@paytm', reference: 'UPI409094108002', description: 'Office supplies purchase', durationMs: 389, createdAt: pastTime(42), payerVpa: 'nexo.business@axis', payeeVpa: 'kumarstores@paytm' },
  { id: uuid(), traceId: 'h4k6j0-bank', type: 'BANK', status: 'SUCCESS', amount: 72000, recipientName: 'Rahul Mehta', recipientId: '****9203', reference: 'NEFT409094102002', description: 'Monthly salary - March 2024', durationMs: 841, createdAt: pastTime(55), bankMode: 'NEFT', ifsc: 'UTIB0001234', accountNumber: '****9203' },
  { id: uuid(), traceId: 'i5l7k1-gst', type: 'GSTN', status: 'SUCCESS', amount: 210000, recipientName: 'Zeta Traders', recipientId: '06BZAHM6385P6Z2', reference: 'IRN20240409081', description: 'B2B invoice - machinery parts', durationMs: 577, createdAt: pastTime(68), gstin: '06BZAHM6385P6Z2', invoiceNo: 'INV-2024-081', invoiceType: 'B2B', irnNumber: 'IRN20240409081', itcEligible: true },
  { id: uuid(), traceId: 'j6m8l2-upi', type: 'UPI', status: 'SUCCESS', amount: 25000, recipientName: 'Tech Solutions', recipientId: 'techsol@ybl', reference: 'UPI409094102003', description: 'IT support - monthly retainer', durationMs: 421, createdAt: pastTime(90), payerVpa: 'nexo.business@axis', payeeVpa: 'techsol@ybl' },
]

class Store {
  transactions: Transaction[] = [...INITIAL_TRANSACTIONS]
  auditLogs: AuditLog[] = INITIAL_TRANSACTIONS.map(t => this.makeLog(t))
  listeners: Set<() => void> = new Set()

  makeLog(t: Transaction): AuditLog {
    return {
      id: uuid(), traceId: t.traceId, timestamp: t.createdAt, api: t.type,
      endpoint: t.type === 'UPI' ? '/api/upi/payout' : t.type === 'GSTN' ? '/api/gstn/invoice' : '/api/bank/transfer',
      actorId: 'merchant_nexo_001',
      statusCode: t.status === 'SUCCESS' ? (t.type === 'GSTN' ? 201 : 200) : t.status === 'FAILED' ? 422 : 202,
      durationMs: t.durationMs, errorCode: t.errorCode,
      requestHash: simpleHash(t.traceId + t.amount)
    }
  }

  add(data: Omit<Transaction, 'id' | 'traceId' | 'createdAt'>): Transaction {
    const txn: Transaction = { ...data, id: uuid(), traceId: shortId() + '-' + data.type.toLowerCase(), createdAt: new Date().toISOString() }
    this.transactions.unshift(txn)
    this.auditLogs.unshift(this.makeLog(txn))
    this.listeners.forEach(l => l())
    return txn
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  getStats(): Stats {
    const txns = this.transactions
    const upi  = txns.filter(t => t.type === 'UPI')
    const gstn = txns.filter(t => t.type === 'GSTN')
    const bank = txns.filter(t => t.type === 'BANK')
    const upiOk = upi.filter(t => t.status === 'SUCCESS')
    return {
      totalSent:    txns.filter(t => t.status === 'SUCCESS').reduce((s, t) => s + t.amount, 0),
      upiRate:      upi.length ? Math.round(upiOk.length / upi.length * 1000) / 10 : 100,
      upiCount:     upi.length,
      gstnFiled:    gstn.filter(t => t.status === 'SUCCESS').length,
      gstnValue:    gstn.filter(t => t.status === 'SUCCESS').reduce((s, t) => s + t.amount, 0),
      bankAmt:      bank.filter(t => t.status === 'SUCCESS').reduce((s, t) => s + t.amount, 0),
      bankNeft:     bank.filter(t => t.bankMode === 'NEFT' && t.status === 'SUCCESS').length,
      bankImps:     bank.filter(t => t.bankMode === 'IMPS' && t.status === 'SUCCESS').length,
      failedCount:  txns.filter(t => t.status === 'FAILED').length,
      pendingCount: txns.filter(t => t.status === 'PENDING').length,
      itcClaimable: gstn.filter(t => t.itcEligible && t.status === 'SUCCESS').reduce((s, t) => s + t.amount * 0.12, 0),
      gstnMismatch: gstn.filter(t => t.status === 'FAILED').length,
      needsAttention: txns.filter(t => t.status === 'FAILED' || t.status === 'PENDING').slice(0, 5),
    }
  }
}

export const store = new Store()

// ── API calls (simulate network) ──────────────────
const VALID_VPA_DOMAINS = ['hdfc', 'sbi', 'axis', 'icici', 'okicici', 'ybl', 'paytm', 'upi', 'kotak', 'ibl']
const VALID_GSTINS      = ['27AAPFU0939F1ZV', '06BZAHM6385P6Z2', '29AAGCB5311D1ZF', '33AABCT1332L1ZR', '07AAACM0192A1ZI', '19AAHCM2716A1Z8']
const VALID_IFSC        = ['SBIN', 'HDFC', 'ICIC', 'UTIB', 'KKBK', 'PUNB', 'BARB', 'CNRB']
const STALE_IFSC        = ['HDFC0001234', 'SBIN0001234']

export type ApiResult = { success: boolean; transaction: Transaction; validationErrors?: Record<string, string> }

export async function callUpiPayout(input: { payerVpa: string; payeeVpa: string; amount: number; recipientName: string; description: string }): Promise<ApiResult> {
  await delay(randMs(400, 900))
  const domain = input.payeeVpa.split('@')[1]
  if (!VALID_VPA_DOMAINS.includes(domain)) {
    const t = store.add({ type: 'UPI', status: 'FAILED', amount: input.amount, recipientName: input.recipientName, recipientId: input.payeeVpa, payerVpa: input.payerVpa, payeeVpa: input.payeeVpa, reference: '', description: input.description || 'UPI payout', durationMs: randMs(100, 300), errorCode: 'UPI_VPA_INVALID', errorMessage: `VPA '${input.payeeVpa}' not registered on NPCI` })
    return { success: false, transaction: t }
  }
  if (Math.random() < 0.05) {
    const t = store.add({ type: 'UPI', status: 'FAILED', amount: input.amount, recipientName: input.recipientName, recipientId: input.payeeVpa, payerVpa: input.payerVpa, payeeVpa: input.payeeVpa, reference: '', description: input.description || 'UPI payout', durationMs: randMs(100, 400), errorCode: 'UPI_BANK_DECLINE', errorMessage: 'Declined by issuing bank' })
    return { success: false, transaction: t }
  }
  const t = store.add({ type: 'UPI', status: 'SUCCESS', amount: input.amount, recipientName: input.recipientName, recipientId: input.payeeVpa, payerVpa: input.payerVpa, payeeVpa: input.payeeVpa, reference: 'UPI' + Date.now(), description: input.description || 'UPI payout', durationMs: randMs(300, 900) })
  return { success: true, transaction: t }
}

export async function callGstnInvoice(input: { gstin: string; recipientName: string; invoiceNo: string; invoiceDate: string; supplyType: string; amount: number; eWayBillNo?: string }): Promise<ApiResult> {
  await delay(randMs(500, 1200))
  if (!VALID_GSTINS.includes(input.gstin)) {
    const t = store.add({ type: 'GSTN', status: 'FAILED', amount: input.amount, recipientName: input.recipientName, recipientId: input.gstin, gstin: input.gstin, invoiceNo: input.invoiceNo, invoiceType: input.supplyType, itcEligible: false, reference: '', description: `Invoice ${input.invoiceNo}`, durationMs: randMs(300, 700), errorCode: 'GSTN_MISMATCH', errorMessage: `GSTIN ${input.gstin} not found in GSTR-2B` })
    return { success: false, transaction: t }
  }
  const irn = 'IRN' + Date.now() + Math.floor(Math.random() * 9999)
  const t = store.add({ type: 'GSTN', status: 'SUCCESS', amount: input.amount, recipientName: input.recipientName, recipientId: input.gstin, gstin: input.gstin, invoiceNo: input.invoiceNo, invoiceType: input.supplyType, irnNumber: irn, itcEligible: input.supplyType === 'B2B', reference: irn, description: `Invoice ${input.invoiceNo}`, durationMs: randMs(500, 1200) })
  return { success: true, transaction: t }
}

export async function callBankTransfer(input: { accountNumber: string; ifsc: string; transferMode: BankMode; amount: number; recipientName: string; description: string }): Promise<ApiResult> {
  await delay(randMs(600, 1500))
  const prefix = input.ifsc.slice(0, 4)
  if (!VALID_IFSC.includes(prefix)) {
    const t = store.add({ type: 'BANK', status: 'FAILED', amount: input.amount, recipientName: input.recipientName, recipientId: '****' + input.accountNumber.slice(-4), bankMode: input.transferMode, ifsc: input.ifsc, accountNumber: '****' + input.accountNumber.slice(-4), reference: '', description: input.description || `${input.transferMode} transfer`, durationMs: randMs(100, 300), errorCode: 'BANK_IFSC_INVALID', errorMessage: `IFSC ${input.ifsc} not in RBI master list` })
    return { success: false, transaction: t }
  }
  if (STALE_IFSC.includes(input.ifsc)) {
    const t = store.add({ type: 'BANK', status: 'FAILED', amount: input.amount, recipientName: input.recipientName, recipientId: '****' + input.accountNumber.slice(-4), bankMode: input.transferMode, ifsc: input.ifsc, accountNumber: '****' + input.accountNumber.slice(-4), reference: '', description: input.description || `${input.transferMode} transfer`, durationMs: randMs(100, 300), errorCode: 'BANK_IFSC_STALE', errorMessage: `IFSC ${input.ifsc} belongs to merged branch` })
    return { success: false, transaction: t }
  }
  const utr = input.transferMode + Date.now()
  const t = store.add({ type: 'BANK', status: 'SUCCESS', amount: input.amount, recipientName: input.recipientName, recipientId: '****' + input.accountNumber.slice(-4), bankMode: input.transferMode, ifsc: input.ifsc, accountNumber: '****' + input.accountNumber.slice(-4), reference: utr, description: input.description || `${input.transferMode} transfer`, durationMs: randMs(600, 1500) })
  return { success: true, transaction: t }
}

// ── Formatters ────────────────────────────────────
export const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')
export function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); return `${h}h ${m % 60}m ago`
}
export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
