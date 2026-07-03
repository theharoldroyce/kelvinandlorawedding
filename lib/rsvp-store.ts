import { getSupabaseAdmin } from './supabase'

export type Rsvp = {
  id: string
  name: string
  phone: string
  attending: string
  otherGuests: string
  message: string
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

export async function addRsvp(entry: Omit<Rsvp, 'id' | 'createdAt'>): Promise<Rsvp> {
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
