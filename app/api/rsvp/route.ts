import { NextResponse, type NextRequest } from 'next/server'
import { addRsvp, readRsvps, updateRsvp, deleteRsvp } from '@/lib/rsvp-store'

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

// Admin edits an existing RSVP (protected by ?key=).
export async function PATCH(request: NextRequest) {
  if (request.nextUrl.searchParams.get('key') !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const id = String(body.id ?? '').trim()
  const name = String(body.name ?? '').trim()
  const attending = String(body.attending ?? '').trim()
  if (!id || !name || !attending) {
    return NextResponse.json({ error: 'ID, name and attendance are required.' }, { status: 400 })
  }

  try {
    const rsvp = await updateRsvp(id, {
      name,
      phone: String(body.phone ?? '').trim(),
      attending,
      otherGuests: String(body.otherGuests ?? '').trim(),
      message: String(body.message ?? '').trim(),
      checkedIn: Boolean(body.checkedIn),
      checkedInAt: body.checkedInAt ? String(body.checkedInAt) : null,
    })
    return NextResponse.json({ ok: true, rsvp })
  } catch (err) {
    console.error('RSVP update failed:', err)
    return NextResponse.json({ error: 'Could not update the RSVP.' }, { status: 500 })
  }
}

// Admin deletes an RSVP (protected by ?key=).
export async function DELETE(request: NextRequest) {
  if (request.nextUrl.searchParams.get('key') !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
  }

  try {
    await deleteRsvp(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('RSVP delete failed:', err)
    return NextResponse.json({ error: 'Could not delete the RSVP.' }, { status: 500 })
  }
}
