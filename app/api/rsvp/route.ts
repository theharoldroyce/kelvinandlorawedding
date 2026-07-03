import { NextResponse, type NextRequest } from 'next/server'
import { addRsvp, readRsvps } from '@/lib/rsvp-store'

const ADMIN_KEY = process.env.ADMIN_KEY || 'kelvinandlora2026'

// Guests submit their RSVP here (public).
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const name = String(body.name ?? '').trim()
  const attending = String(body.attending ?? '').trim()

  if (!name || !attending) {
    return NextResponse.json({ error: 'Name and attendance are required.' }, { status: 400 })
  }

  try {
    const rsvp = await addRsvp({
      name,
      phone: String(body.phone ?? '').trim(),
      attending,
      otherGuests: String(body.otherGuests ?? '').trim(),
      message: String(body.message ?? '').trim(),
    })
    return NextResponse.json({ ok: true, id: rsvp.id })
  } catch (err) {
    console.error('RSVP save failed:', err)
    return NextResponse.json({ error: 'Could not save your RSVP. Please try again.' }, { status: 500 })
  }
}

// Admin reads the list (protected by ?key=).
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  if (key !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const rsvps = await readRsvps()
    return NextResponse.json({ rsvps })
  } catch (err) {
    console.error('RSVP read failed:', err)
    return NextResponse.json({ error: 'Could not load responses.' }, { status: 500 })
  }
}
