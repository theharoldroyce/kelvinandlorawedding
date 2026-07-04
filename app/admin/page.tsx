'use client'

import { useState } from 'react'

type Rsvp = {
  id: string
  name: string
  phone: string
  attending: string
  otherGuests: string
  message: string
  createdAt: string
}

export default function AdminPage() {
  const [key, setKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [rsvps, setRsvps] = useState<Rsvp[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function load(k: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/rsvp?key=${encodeURIComponent(k)}`, { cache: 'no-store' })
      if (res.status === 401) {
        setError('Incorrect password.')
        return
      }
      if (!res.ok) {
        setError('Failed to load responses.')
        return
      }
      const data = await res.json()
      setRsvps(Array.isArray(data.rsvps) ? data.rsvps : [])
      setAuthed(true)
    } catch {
      setError('Failed to load responses.')
    } finally {
      setLoading(false)
    }
  }

  if (!authed) {
    return (
      <main style={styles.gate}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            load(key)
          }}
          style={styles.gateCard}
        >
          <h1 style={styles.gateTitle}>RSVP Admin</h1>
          <p style={styles.gateSub}>Enter the admin password to view responses.</p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Password"
            style={styles.input}
            autoFocus
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Checking…' : 'View Responses'}
          </button>
        </form>
      </main>
    )
  }

  const attending = rsvps.filter((r) => r.attending === 'yes')
  const declined = rsvps.filter((r) => r.attending === 'no')
  // headcount = each attending response + any *named* additional guests
  // (ignore placeholders like "N/A", "none", "wala", "-", etc.)
  const extraGuests = attending.reduce((sum, r) => sum + countGuestNames(r.otherGuests), 0)
  const totalAttending = attending.length + extraGuests

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>RSVP Responses</h1>
        <button style={styles.refresh} onClick={() => load(key)} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div style={styles.stats}>
        <Stat label="Total Responses" value={rsvps.length} />
        <Stat label="Attending (guests)" value={totalAttending} accent="#2f7d32" />
        <Stat label="Responses: Yes" value={attending.length} />
        <Stat label="Responses: No" value={declined.length} accent="#b23b3b" />
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Attending</th>
              <th style={styles.th}>Other Guest(s)</th>
              <th style={styles.th}>Message</th>
              <th style={styles.th}>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.length === 0 && (
              <tr>
                <td style={styles.td} colSpan={7}>
                  No responses yet.
                </td>
              </tr>
            )}
            {rsvps.map((r, i) => (
              <tr key={r.id} style={i % 2 ? styles.rowAlt : undefined}>
                <td style={styles.td}>{i + 1}</td>
                <td style={{ ...styles.td, fontWeight: 600 }}>{r.name}</td>
                <td style={styles.td}>{r.phone || '—'}</td>
                <td style={styles.td}>
                  <span style={r.attending === 'yes' ? styles.badgeYes : styles.badgeNo}>
                    {r.attending === 'yes' ? 'Yes' : 'No'}
                  </span>
                </td>
                <td style={styles.td}>{r.otherGuests || '—'}</td>
                <td style={{ ...styles.td, maxWidth: 280, whiteSpace: 'normal' }}>{r.message || '—'}</td>
                <td style={styles.td}>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

// Values guests type when they have no additional guests — these should count as 0.
const NON_NAMES = new Set([
  '', 'n/a', 'na', 'n.a.', 'none', 'none.', 'no', 'nope', 'wala', 'wala po', 'none po',
  '-', '--', '—', 'x', 'xx', 'nil', 'nan', '0', 'self', 'me only', 'just me', 'solo',
])

function countGuestNames(raw: string): number {
  if (!raw) return 0
  // whole-field placeholder (e.g. "N/A", "none") counts as zero guests
  if (NON_NAMES.has(raw.trim().toLowerCase())) return 0
  return raw
    .split(/[,&\n;]|\band\b/i)
    .map((p) => p.trim())
    .filter((p) => p !== '' && !NON_NAMES.has(p.toLowerCase())).length
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={styles.statCard}>
      <p style={{ ...styles.statValue, color: accent ?? '#1f2937' }}>{value}</p>
      <p style={styles.statLabel}>{label}</p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  gate: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f4f4f5',
    fontFamily: 'system-ui, sans-serif',
    padding: 24,
  },
  gateCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 32,
    width: '100%',
    maxWidth: 360,
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  gateTitle: { fontSize: 22, fontWeight: 700, color: '#111827' },
  gateSub: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  page: {
    minHeight: '100vh',
    background: '#f4f4f5',
    fontFamily: 'system-ui, sans-serif',
    padding: 'clamp(16px, 4vw, 40px)',
    color: '#1f2937',
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 26, fontWeight: 700 },
  refresh: {
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 18px',
    fontSize: 14,
    cursor: 'pointer',
  },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 28 },
  statCard: { background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 4px 14px rgba(0,0,0,0.05)' },
  statValue: { fontSize: 32, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 13, color: '#6b7280', marginTop: 6 },
  tableWrap: { background: '#fff', borderRadius: 12, overflow: 'auto', boxShadow: '0 4px 14px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 760 },
  th: {
    textAlign: 'left',
    padding: '14px 16px',
    borderBottom: '2px solid #e5e7eb',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#6b7280',
    whiteSpace: 'nowrap',
  },
  td: { padding: '14px 16px', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap', verticalAlign: 'top' },
  rowAlt: { background: '#fafafa' },
  input: { padding: '12px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15 },
  button: { background: '#111827', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 18px', fontSize: 15, cursor: 'pointer', marginTop: 4 },
  error: { color: '#b23b3b', fontSize: 13 },
  badgeYes: { background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 },
  badgeNo: { background: '#fee2e2', color: '#991b1b', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 },
}
