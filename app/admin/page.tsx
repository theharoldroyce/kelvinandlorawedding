'use client'

import { useEffect, useState } from 'react'

type Rsvp = {
  id: string
  name: string
  phone: string
  attending: string
  otherGuests: string
  message: string
  checkedIn: boolean
  checkedInAt: string | null
  createdAt: string
}

type FormState = {
  id?: string
  name: string
  phone: string
  attending: string
  otherGuests: string
  message: string
  checkedIn: boolean
  checkedInAt: string | null
}

const EMPTY_FORM: FormState = { name: '', phone: '', attending: 'yes', otherGuests: '', message: '', checkedIn: false, checkedInAt: null }

// Key sent to the admin API. The password gate has been removed, so this is
// used automatically. Note: this makes /admin openly viewable.
const ADMIN_KEY = 'kelvinandlora2026'

export default function AdminPage() {
  const [rsvps, setRsvps] = useState<Rsvp[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [editing, setEditing] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/rsvp?key=${encodeURIComponent(ADMIN_KEY)}`, { cache: 'no-store' })
      if (!res.ok) {
        setError('Failed to load responses.')
        return
      }
      const data = await res.json()
      setRsvps(Array.isArray(data.rsvps) ? data.rsvps : [])
    } catch {
      setError('Failed to load responses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // defer so setState isn't called synchronously inside the effect body
    const id = setTimeout(load, 0)
    return () => clearTimeout(id)
  }, [])

  async function save() {
    if (!editing) return
    if (!editing.name.trim() || !editing.attending) {
      setFormError('Name and attendance are required.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const isEdit = Boolean(editing.id)
      const url = isEdit ? `/api/rsvp?key=${encodeURIComponent(ADMIN_KEY)}` : '/api/rsvp'
      // stamp a check-in time if newly checked in; clear it if unchecked
      const payload = {
        ...editing,
        checkedInAt: editing.checkedIn ? editing.checkedInAt ?? new Date().toISOString() : null,
      }
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      setEditing(null)
      await load()
    } catch {
      setFormError('Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!editing?.id) return
    if (!window.confirm(`Delete the RSVP from "${editing.name}"? This cannot be undone.`)) return
    setSaving(true)
    setFormError('')
    try {
      const res = await fetch(`/api/rsvp?key=${encodeURIComponent(ADMIN_KEY)}&id=${encodeURIComponent(editing.id)}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error()
      setEditing(null)
      await load()
    } catch {
      setFormError('Could not delete. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleCheckIn(r: Rsvp) {
    const nextChecked = !r.checkedIn
    const nextAt = nextChecked ? new Date().toISOString() : null
    // optimistic update
    setRsvps((list) =>
      list.map((x) => (x.id === r.id ? { ...x, checkedIn: nextChecked, checkedInAt: nextAt } : x))
    )
    try {
      const res = await fetch(`/api/rsvp?key=${encodeURIComponent(ADMIN_KEY)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: r.id,
          name: r.name,
          phone: r.phone,
          attending: r.attending,
          otherGuests: r.otherGuests,
          message: r.message,
          checkedIn: nextChecked,
          checkedInAt: nextAt,
        }),
      })
      if (!res.ok) throw new Error()
    } catch {
      // revert on failure
      setRsvps((list) =>
        list.map((x) => (x.id === r.id ? { ...x, checkedIn: r.checkedIn, checkedInAt: r.checkedInAt } : x))
      )
      setError('Could not update check-in. Please try again.')
    }
  }

  const attending = rsvps.filter((r) => r.attending === 'yes')
  const declined = rsvps.filter((r) => r.attending === 'no')
  const extraGuests = attending.reduce((sum, r) => sum + countGuestNames(r.otherGuests), 0)
  const totalAttending = attending.length + extraGuests
  const checkedInCount = rsvps.filter((r) => r.checkedIn).length

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>RSVP Responses</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={styles.addBtn} onClick={() => { setFormError(''); setEditing({ ...EMPTY_FORM }) }}>
            + Add RSVP
          </button>
          <button style={styles.refresh} onClick={() => load()} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <p style={{ ...styles.error, marginBottom: 16 }}>{error}</p>}

      <div style={styles.stats}>
        <Stat label="Total Responses" value={rsvps.length} />
        <Stat label="Attending (guests)" value={totalAttending} accent="#2f7d32" />
        <Stat label="Checked In" value={checkedInCount} accent="#1d4ed8" />
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
              <th style={styles.th}>Arrival Time</th>
              <th style={styles.th}>Other Guest(s)</th>
              <th style={styles.th}>Message</th>
              <th style={styles.th}>Check-In</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.length === 0 && (
              <tr>
                <td style={styles.td} colSpan={9}>
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
                <td style={styles.td}>
                  {r.checkedIn && r.checkedInAt
                    ? new Date(r.checkedInAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                    : '—'}
                </td>
                <td style={styles.td}>{r.otherGuests || '—'}</td>
                <td style={{ ...styles.td, maxWidth: 280, whiteSpace: 'normal' }}>{r.message || '—'}</td>
                <td style={styles.td}>
                  <button
                    style={r.checkedIn ? styles.checkedInBtn : styles.checkInBtn}
                    onClick={() => toggleCheckIn(r)}
                  >
                    {r.checkedIn ? '✓ Checked In' : 'Check In'}
                  </button>
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.editBtn}
                    onClick={() => {
                      setFormError('')
                      setEditing({
                        id: r.id,
                        name: r.name,
                        phone: r.phone,
                        attending: r.attending,
                        otherGuests: r.otherGuests,
                        message: r.message,
                        checkedIn: r.checkedIn,
                        checkedInAt: r.checkedInAt,
                      })
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div style={styles.overlay} onClick={() => !saving && setEditing(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{editing.id ? 'Edit RSVP' : 'Add RSVP'}</h2>

            <label style={styles.label}>Name *</label>
            <input
              style={styles.input}
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Full name"
            />

            <label style={styles.label}>Phone</label>
            <input
              style={styles.input}
              value={editing.phone}
              onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
              placeholder="Phone number"
            />

            <label style={styles.label}>Attending *</label>
            <select
              style={styles.input}
              value={editing.attending}
              onChange={(e) => setEditing({ ...editing, attending: e.target.value })}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>

            <label style={styles.label}>Other Guest(s)</label>
            <input
              style={styles.input}
              value={editing.otherGuests}
              onChange={(e) => setEditing({ ...editing, otherGuests: e.target.value })}
              placeholder="e.g. Maria Cruz, Juan Cruz"
            />

            <label style={styles.label}>Message</label>
            <textarea
              style={{ ...styles.input, minHeight: 80, resize: 'vertical' }}
              value={editing.message}
              onChange={(e) => setEditing({ ...editing, message: e.target.value })}
              placeholder="Optional"
            />

            {editing.id && (
              <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={editing.checkedIn}
                  onChange={(e) => setEditing({ ...editing, checkedIn: e.target.checked })}
                  style={{ width: 16, height: 16 }}
                />
                Checked in (arrived at the event)
              </label>
            )}

            {formError && <p style={styles.error}>{formError}</p>}

            <div style={styles.modalActions}>
              {editing.id ? (
                <button style={styles.deleteBtn} onClick={remove} disabled={saving}>
                  Delete
                </button>
              ) : (
                <span />
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={styles.cancelBtn} onClick={() => setEditing(null)} disabled={saving}>
                  Cancel
                </button>
                <button style={styles.button} onClick={save} disabled={saving}>
                  {saving ? 'Saving…' : editing.id ? 'Save Changes' : 'Add RSVP'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
    background: '#e5e7eb',
    color: '#111827',
    border: 'none',
    borderRadius: 8,
    padding: '10px 18px',
    fontSize: 14,
    cursor: 'pointer',
  },
  addBtn: {
    background: '#2f7d32',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 28 },
  statCard: { background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 4px 14px rgba(0,0,0,0.05)' },
  statValue: { fontSize: 32, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 13, color: '#6b7280', marginTop: 6 },
  tableWrap: { background: '#fff', borderRadius: 12, overflow: 'auto', boxShadow: '0 4px 14px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 860 },
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
  input: { padding: '12px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15, width: '100%', boxSizing: 'border-box' },
  button: { background: '#111827', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 18px', fontSize: 15, cursor: 'pointer', marginTop: 4 },
  error: { color: '#b23b3b', fontSize: 13 },
  badgeYes: { background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 },
  badgeNo: { background: '#fee2e2', color: '#991b1b', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 },
  editBtn: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    padding: '6px 14px',
    fontSize: 13,
    cursor: 'pointer',
  },
  checkInBtn: {
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: 6,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  checkedInBtn: {
    background: '#1d4ed8',
    color: '#fff',
    border: '1px solid #1d4ed8',
    borderRadius: 6,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 50,
  },
  modal: {
    background: '#fff',
    borderRadius: 14,
    padding: 28,
    width: '100%',
    maxWidth: 460,
    maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
  modalTitle: { fontSize: 20, fontWeight: 700, marginBottom: 10 },
  label: { fontSize: 12, fontWeight: 600, color: '#6b7280', marginTop: 8 },
  modalActions: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, gap: 8 },
  cancelBtn: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    padding: '12px 18px',
    fontSize: 15,
    cursor: 'pointer',
    marginTop: 4,
  },
  deleteBtn: {
    background: '#fee2e2',
    color: '#991b1b',
    border: 'none',
    borderRadius: 8,
    padding: '12px 18px',
    fontSize: 15,
    cursor: 'pointer',
    marginTop: 4,
  },
}
