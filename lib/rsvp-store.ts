import { getSupabaseAdmin } from './supabase'

export type Rsvp = {
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

const TABLE = 'rsvps'

type Row = {
  id: string
  name: string
  phone: string | null
  attending: string
  other_guests: string | null
  message: string | null
  checked_in: boolean | null
  checked_in_at: string | null
  created_at: string
}

function toRsvp(r: Row): Rsvp {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone ?? '',
    attending: r.attending,
    otherGuests: r.other_guests ?? '',
    message: r.message ?? '',
    checkedIn: r.checked_in ?? false,
    checkedInAt: r.checked_in_at ?? null,
    createdAt: r.created_at,
  }
}

export async function readRsvps(): Promise<Rsvp[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data as Row[]).map(toRsvp)
}

export async function addRsvp(
  entry: Omit<Rsvp, 'id' | 'createdAt' | 'checkedIn' | 'checkedInAt'>
): Promise<Rsvp> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      name: entry.name,
      phone: entry.phone || null,
      attending: entry.attending,
      other_guests: entry.otherGuests || null,
      message: entry.message || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return toRsvp(data as Row)
}

export async function updateRsvp(
  id: string,
  entry: Omit<Rsvp, 'id' | 'createdAt'>
): Promise<Rsvp> {
  const supabase = getSupabaseAdmin()
  // stamp the check-in time when checked in (keep the passed time if provided),
  // and clear it when unchecked
  const checkedInAt = entry.checkedIn ? entry.checkedInAt ?? new Date().toISOString() : null
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      name: entry.name,
      phone: entry.phone || null,
      attending: entry.attending,
      other_guests: entry.otherGuests || null,
      message: entry.message || null,
      checked_in: entry.checkedIn,
      checked_in_at: checkedInAt,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return toRsvp(data as Row)
}

export async function deleteRsvp(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw new Error(error.message)
}
