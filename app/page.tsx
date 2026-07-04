'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

/* ─────────────────────────────────────────────
   SVG Helpers
───────────────────────────────────────────── */

function Divider({ symbol = '✦' }: { symbol?: string }) {
  return (
    <div className="ornament-divider" style={{ margin: '0 auto' }}>
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 12, color: '#C8BEA4' }}>{symbol}</span>
    </div>
  )
}

const STORY_PHOTOS = [1, 2, 5, 6, 7, 8, 9, 10].map((n) => `/our-story-${n}.jpg`)

/* ─────────────────────────────────────────────
   Countdown
───────────────────────────────────────────── */

const WEDDING_DATE_ISO = '2026-08-10T15:30:00+08:00'

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number }

const ZERO_TIME: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 }

function computeTimeLeft(): TimeLeft {
  const diff = Math.max(0, new Date(WEDDING_DATE_ISO).getTime() - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function useCountdown(): TimeLeft {
  // start from zeros so server and first client render match, then tick live
  const [time, setTime] = useState<TimeLeft>(ZERO_TIME)

  useEffect(() => {
    // first update on the next frame keeps setState out of the effect body
    const raf = requestAnimationFrame(() => setTime(computeTimeLeft()))
    const id = setInterval(() => setTime(computeTimeLeft()), 1000)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(id)
    }
  }, [])

  return time
}

function CountdownSection() {
  const { days, hours, minutes, seconds } = useCountdown()

  const units: { value: number; label: string; pad: number }[] = [
    { value: days, label: 'Day(s)', pad: 2 },
    { value: hours, label: 'Hour(s)', pad: 2 },
    { value: minutes, label: 'Minute(s)', pad: 2 },
    { value: seconds, label: 'Second(s)', pad: 2 },
  ]

  return (
    <section className="scroll-reveal section-pad" style={{ background: '#F5F0E8', borderTop: '1px solid #C8BEA4', textAlign: 'center' }}>
      <h2 className="t-script-lg" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 20 }}>
        Countdown
      </h2>
      <p className="t-body-serif" style={{ maxWidth: 520, margin: '0 auto 44px' }}>
        Every day draws us closer to the moment we say &ldquo;I do.&rdquo;<br />
        We can&apos;t wait to celebrate with you.
      </p>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 'clamp(6px, 2vw, 22px)' }}>
        {units.map((u, i) => (
          <div key={u.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(6px, 2vw, 22px)' }}>
            <div style={{ textAlign: 'center', minWidth: 'clamp(48px, 12vw, 96px)' }}>
              <p className="countdown-num">{String(u.value).padStart(u.pad, '0')}</p>
              <p className="countdown-label">{u.label}</p>
            </div>
            {i < units.length - 1 && (
              <span className="countdown-num" style={{ color: '#C8BEA4' }} aria-hidden="true">:</span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Photo collage
───────────────────────────────────────────── */

const COLLAGE_PHOTOS = [
  // row 1
  { src: '/random 1.jpg', left: '4%', top: '2%', w: '30%', rot: -3, z: 1 },
  { src: '/random 2.jpg', left: '36%', top: '0%', w: '30%', rot: 3, z: 2 },
  { src: '/random 3.jpg', left: '67%', top: '3%', w: '29%', rot: -2, z: 1 },
  // row 2
  { src: '/random 4.jpg', left: '1%', top: '24%', w: '28%', rot: 4, z: 3 },
  { src: '/random 5.jpg', left: '30%', top: '22%', w: '32%', rot: -3, z: 4 },
  { src: '/random 6.jpg', left: '64%', top: '26%', w: '30%', rot: 2, z: 3 },
  // row 3
  { src: '/random 7.jpg', left: '5%', top: '48%', w: '29%', rot: -2, z: 5 },
  { src: '/random 8.jpg', left: '35%', top: '46%', w: '30%', rot: 3, z: 6 },
  { src: '/random 9.jpg', left: '66%', top: '49%', w: '28%', rot: -4, z: 5 },
  // row 4
  { src: '/random 10.jpg', left: '2%', top: '71%', w: '27%', rot: 2, z: 7 },
  { src: '/random 11.jpg', left: '28%', top: '73%', w: '30%', rot: -3, z: 8 },
  { src: '/random 12.jpg', left: '55%', top: '70%', w: '29%', rot: 3, z: 7 },
  { src: '/random 13.jpg', left: '72%', top: '72%', w: '26%', rot: -2, z: 6 },
]

function PhotoCollage() {
  const [active, setActive] = useState<string | null>(null)

  return (
    <section className="scroll-reveal section-pad" style={{ background: '#EDE8DC', borderTop: '1px solid #C8BEA4' }}>
      <div className="collage">
        {COLLAGE_PHOTOS.map((p) => (
          <div
            key={p.src}
            className="collage-item"
            style={{ left: p.left, top: p.top, width: p.w, '--rot': `${p.rot}deg`, '--z': p.z } as CSSProperties}
            tabIndex={0}
            onMouseEnter={() => setActive(p.src)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(p.src)}
            onBlur={() => setActive(null)}
          >
            <Image src={encodeURI(p.src)} alt="Kelvin and Lora" fill sizes="(max-width: 767px) 45vw, 40vw" style={{ objectFit: 'cover' }} />
          </div>
        ))}
      </div>

      {active && typeof document !== 'undefined' &&
        createPortal(
          <div className="collage-zoom" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={encodeURI(active)} alt="Kelvin and Lora" />
          </div>,
          document.body
        )}
    </section>
  )
}

/* ─────────────────────────────────────────────
   The Celebration
───────────────────────────────────────────── */

function CelebrationSection() {
  return (
    <section className="scroll-reveal section-pad" style={{ background: '#F5F0E8', borderTop: '1px solid #C8BEA4', textAlign: 'center' }}>
      <h2 className="t-script-lg" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 12 }}>
        The Celebration
      </h2>
      <p className="t-body-serif" style={{ maxWidth: 540, margin: '0 auto 40px' }}>
        Join us for a day of worship, love, and celebration<br />
        at Hillcreek Gardens Tagaytay.
      </p>

      <div className="celebration-grid">
        <div className="celebration-venue">
          <Image src="/Venue.jpg" alt="Hillcreek Gardens Tagaytay" fill sizes="(max-width: 767px) 100vw, 55vw" style={{ objectFit: 'cover' }} />
        </div>

        <div className="celebration-events">
          <div className="celebration-event">
            <Image src="/ceremony.jpg" alt="Ceremony" fill sizes="(max-width: 767px) 100vw, 45vw" style={{ objectFit: 'cover' }} />
            <div className="celebration-cap">
              <h3 style={{ fontFamily: 'var(--font-script)' }}>Ceremony</h3>
              <p>4:00 PM</p>
            </div>
          </div>
          <div className="celebration-event">
            <Image src="/reception.jpg" alt="Reception" fill sizes="(max-width: 767px) 100vw, 45vw" style={{ objectFit: 'cover' }} />
            <div className="celebration-cap">
              <h3 style={{ fontFamily: 'var(--font-script)' }}>Reception</h3>
              <p>5:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Timeline (order of the day)
───────────────────────────────────────────── */

const TIMELINE = [
  { time: '3:30 PM', title: 'Guest Arrival', desc: 'Find your seat and settle in' },
  { time: '4:00 PM', title: 'Ceremony', desc: 'The exchange of vows' },
  { time: '5:00 PM', title: 'Reception', desc: 'Cocktails and celebration' },
  { time: '6:00 PM', title: 'Dinner & Program', desc: 'Feasting, toasts, and speeches' },
  { time: '8:30 PM', title: 'Send-Off', desc: 'A sweet farewell to the newlyweds' },
]

function TimelineSection() {
  return (
    <section className="scroll-reveal section-pad" style={{ background: '#EDE8DC', borderTop: '1px solid #C8BEA4', textAlign: 'center' }}>
      <h2 className="t-script-lg" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 12 }}>
        The Timeline
      </h2>
      <p className="t-body-serif" style={{ maxWidth: 520, margin: '0 auto 48px' }}>
        A glimpse of how our special day will unfold.
      </p>

      <div className="timeline">
        {TIMELINE.map((t) => (
          <div key={t.title} className="timeline-item">
            <span className="timeline-dot" />
            <p className="timeline-time">{t.time}</p>
            <h3 className="timeline-title" style={{ fontFamily: 'var(--font-script)' }}>{t.title}</h3>
            <p className="timeline-desc">{t.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   The Finer Details (attire guide)
───────────────────────────────────────────── */

const PRINCIPAL_PALETTE = ['#F6D26A', '#F4C63D', '#F2A63C', '#EF823C', '#F0609A', '#E5157E']
const GUEST_PALETTE = ['#1E6FB6', '#6FA8DC', '#E8474F', '#F0728E', '#EE7E3B', '#F4A24C']

function ColorPalette({ colors }: { colors: string[] }) {
  return (
    <div>
      <p className="attire-palette-label" style={{ fontFamily: 'var(--font-script)' }}>Color Palette</p>
      <div className="attire-dots">
        {colors.map((c, i) => (
          <span key={i} className="attire-dot" style={{ background: c }} />
        ))}
      </div>
    </div>
  )
}

function DetailsSection() {
  return (
    <section className="scroll-reveal section-pad" style={{ background: '#F5F0E8', borderTop: '1px solid #C8BEA4', textAlign: 'center' }}>
      <h2 className="t-script-lg" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 12 }}>
        The Finer Details
      </h2>
      <p className="t-body-serif" style={{ maxWidth: 520, margin: '0 auto 44px' }}>
        A little guide to help you dress for our celebration.
      </p>

      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <h3 className="attire-title">Principal Sponsors</h3>
        <p className="attire-sub">Barong and Filipiniana or Modern Dress</p>
        <ColorPalette colors={PRINCIPAL_PALETTE} />

        <div className="attire-divider" />

        <h3 className="attire-title">Secondary Sponsors</h3>
        <div className="attire-two">
          <div>
            <p className="t-script-md" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28' }}>Team Groom</p>
            <p className="attire-sub">Beige Suit</p>
          </div>
          <div className="attire-vline" />
          <div>
            <p className="t-script-md" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28' }}>Team Bride</p>
            <p className="attire-sub">Any shade of yellow</p>
          </div>
        </div>

        <div className="attire-divider" />

        <h3 className="attire-title">Guest</h3>
        <p className="attire-sub">Casual Attire</p>
        <ColorPalette colors={GUEST_PALETTE} />
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Venue map
───────────────────────────────────────────── */

function VenueMapSection() {
  const query = 'Hillcreek Gardens Tagaytay'
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`

  return (
    <section className="scroll-reveal section-pad" style={{ background: '#EDE8DC', borderTop: '1px solid #C8BEA4', textAlign: 'center' }}>
      <h2 className="t-script-lg" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 12 }}>
        How to Get There
      </h2>
      <p className="t-body-serif" style={{ maxWidth: 520, margin: '0 auto 36px' }}>
        Hillcreek Gardens Tagaytay<br />
        Tap the map or the button below for directions.
      </p>

      <div className="venue-map">
        <iframe
          src={embedSrc}
          title="Map to Hillcreek Gardens Tagaytay"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <a className="map-directions-btn" href={directionsHref} target="_blank" rel="noopener noreferrer">
        Get Directions
      </a>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Phone Booth
───────────────────────────────────────────── */

function PhoneBoothSection() {
  return (
    <section className="scroll-reveal section-pad" style={{ background: '#F5F0E8', borderTop: '1px solid #C8BEA4', textAlign: 'center' }}>
      <h2 className="t-script-lg" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 16 }}>
        Phone Booth
      </h2>
      <p className="t-body-serif" style={{ maxWidth: 560, margin: '0 auto 14px' }}>
        Look for the phone booth and leave us a message.
      </p>
      <p className="t-body-serif" style={{ maxWidth: 560, margin: '0 auto 44px' }}>
        Leave us a short video message, wish, or advice &mdash; we can&apos;t wait to watch and
        cherish them forever.
      </p>

      <div className="phonebooth-photos">
        {['/Phone Booth 1.jpg', '/Phone Booth 2.jpg'].map((src) => (
          <div key={src} className="phonebooth-photo">
            <Image src={encodeURI(src)} alt="Leave a message phone booth" fill sizes="(max-width: 640px) 90vw, 380px" style={{ objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   RSVP form (front-end only — not wired to a backend yet)
───────────────────────────────────────────── */

function RSVPForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      name: fd.get('name'),
      phone: fd.get('phone'),
      attending: fd.get('attending'),
      otherGuests: fd.get('otherGuests'),
      message: fd.get('message'),
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <p className="t-body-serif" style={{ maxWidth: 420, margin: '0 auto' }}>
        Thank you for your response.<br />
        We can&apos;t wait to celebrate with you.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420, margin: '0 auto', textAlign: 'left' }}
    >
      <input className="rsvp-field" type="text" name="name" placeholder="Full Name" required />
      <input className="rsvp-field" type="tel" name="phone" placeholder="Phone Number" required />
      <select className="rsvp-field" name="attending" defaultValue="" required>
        <option value="" disabled>Will you be attending?</option>
        <option value="yes">Joyfully Accepts</option>
        <option value="no">Regretfully Declines</option>
      </select>
      <input className="rsvp-field" type="text" name="otherGuests" placeholder="Name of Other Guest(s)" />
      <textarea className="rsvp-field" name="message" placeholder="Message for the couple (optional)" rows={4} />
      {error && (
        <p style={{ color: '#B5673A', fontFamily: 'var(--font-serif)', fontSize: 14 }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        style={{
          fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500,
          letterSpacing: '2px', textTransform: 'uppercase',
          color: '#F5F0E8', background: '#3D4A28',
          border: 'none', borderRadius: 2, padding: '14px 24px',
          cursor: submitting ? 'default' : 'pointer', marginTop: 4,
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? 'Sending…' : 'Send RSVP'}
      </button>
    </form>
  )
}

/* ─────────────────────────────────────────────
   Arrow-controlled photo slider
───────────────────────────────────────────── */

function StoryGallery({ photos }: { photos: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)

  const scrollByOne = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const item = el.querySelector('.gallery-slide-item')
    const amount = item ? item.getBoundingClientRect().width + 16 : 220
    // loop back to the start once we reach the end
    if (dir === 1 && el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
      el.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      el.scrollBy({ left: dir * amount, behavior: 'smooth' })
    }
  }

  // auto-advance every 3s, pausing while the pointer is over the gallery
  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) scrollByOne(1)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="gallery-row"
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      <button
        type="button"
        onClick={() => scrollByOne(-1)}
        className="gallery-arrow"
        aria-label="Previous photo"
      >
        ‹
      </button>

      <div className="gallery-slider" ref={trackRef}>
        {photos.map((src, i) => (
          <div key={`${src}-${i}`} className="gallery-slide-item">
            <Image src={src} alt="Kelvin and Lora" fill sizes="200px" style={{ objectFit: 'cover' }} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByOne(1)}
        className="gallery-arrow"
        aria-label="Next photo"
      >
        ›
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.12 }
    )
    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>

      {/* ── HERO ── */}
      <section className="animate-page-enter" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
        <Image
          src={encodeURI('/random 10.jpg')}
          alt="Kelvin and Lora"
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(20,24,13,0.1) 0%, rgba(20,24,13,0.08) 40%, rgba(20,24,13,0.55) 68%, rgba(15,18,10,0.82) 100%)',
        }} />
        <div style={{
          position: 'absolute', left: '50%', bottom: '9%', transform: 'translateX(-50%)',
          zIndex: 1, textAlign: 'center', width: '100%', maxWidth: 640, padding: '0 24px',
        }}>
          <p style={{
            fontFamily: 'var(--font-sans)', fontWeight: 600,
            fontSize: 'clamp(16px, 3vw, 26px)', letterSpacing: '3px',
            textTransform: 'uppercase', color: '#FDFBF5', marginBottom: 12,
          }}>
            We&apos;re Getting Married!
          </p>
          <p className="t-script-xl" style={{ fontFamily: 'var(--font-script)', color: '#FDFBF5', lineHeight: 1.1, marginBottom: 20 }}>
            Kelvin &amp; Lora
          </p>
          <div style={{ width: 48, height: 1, background: 'rgba(245,240,232,0.5)', margin: '0 auto 18px' }} />
          <p className="t-date-main" style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#FDFBF5', marginBottom: 6, letterSpacing: '0.5px' }}>
            August 10, 2026
          </p>
          <p className="t-date-sub" style={{ fontFamily: 'var(--font-serif)', color: 'rgba(245,240,232,0.85)' }}>
            Monday, 3:30PM · Hillcreek Gardens Tagaytay
          </p>
        </div>
        <p className="animate-pulse-soft" style={{
          position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', zIndex: 1,
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 11, color: 'rgba(245,240,232,0.8)', letterSpacing: 1,
        }}>
          scroll to explore ↓
        </p>
      </section>

      {/* ── OUR STORY ── */}
      <section className="scroll-reveal section-pad" style={{ background: '#F5F0E8', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="t-script-lg" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 24 }}>
            Our Story
          </h2>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <p className="t-body-serif" style={{ marginBottom: 20 }}>
              Before our paths crossed, the Lord was faithfully working in each of our lives —
              pruning, shaping, and preparing our hearts in His perfect timing. We first got to
              know each other online and finally met in person when Lora came home to the
              Philippines for a vacation. As we spent time together, it became clear that it was
              Jesus who brought our lives together.
            </p>
            <p className="t-body-serif" style={{ marginBottom: 48 }}>
              Though our love story has been short, it has always been certain because it is
              founded on Christ. By God&apos;s grace, we will celebrate our first anniversary as a
              couple on the very day we say &ldquo;I do.&rdquo; We are filled with joy and gratitude
              as we gather with our families and loved ones to celebrate God&apos;s faithfulness
              and the covenant He has written for us.
            </p>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1400, margin: '48px auto 0' }}>
          <StoryGallery photos={STORY_PHOTOS} />
        </div>
      </section>

      {/* ── COUNTDOWN ── */}
      <CountdownSection />

      {/* ── PHOTO COLLAGE ── */}
      <PhotoCollage />

      {/* ── THE CELEBRATION ── */}
      <CelebrationSection />

      {/* ── VENUE MAP ── */}
      <VenueMapSection />

      {/* ── TIMELINE ── */}
      <TimelineSection />

      {/* ── THE FINER DETAILS ── */}
      <DetailsSection />

      {/* ── GIFTS ── */}
      <section className="scroll-reveal section-pad" style={{ background: '#EDE8DC', borderTop: '1px solid #C8BEA4', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 className="t-script-lg" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 24 }}>
            Gifts
          </h2>
          <p className="t-body-serif" style={{ marginBottom: 16 }}>
            We are already blessed in many ways. Your presence and prayers mean the most to us.
          </p>
          <p className="t-body-serif" style={{ marginBottom: 12 }}>
            If you feel led to bless us further, a monetary gift would be received with sincere
            gratitude as we begin this new chapter together.
          </p>
           <p className="t-body-serif" style={{ marginBottom: 12 }}>
            For your convenience, our QR options are provided below.
          </p>

          <div className="gift-qr-grid">
            {[
              { src: '/QR GCash.jpg', label: 'GCash' },
              { src: '/QR BDO.jpg', label: 'BDO' },
              { src: '/QR BPI.jpg', label: 'BPI' },
            ].map((qr) => (
              <div key={qr.label} className="gift-qr-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={encodeURI(qr.src)} alt={`${qr.label} QR code`} className="gift-qr-img" loading="lazy" />
                <p className="gift-qr-label">{qr.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHONE BOOTH ── */}
      <PhoneBoothSection />

      {/* ── ENTOURAGE ── */}
      <section className="scroll-reveal section-pad" style={{ background: '#F5F0E8', borderTop: '1px solid #C8BEA4' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <h2 className="t-script-lg" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', textAlign: 'center', marginBottom: 40 }}>
            The Entourage
          </h2>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="parents-grid">
              <div style={{ textAlign: 'center' }}>
                <h3 className="t-script-md" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 14 }}>Parents of the Groom</h3>
                <p className="entourage-name">† MR. LUDY AGENA</p>
                <p className="entourage-name">MRS. DORY AGENA</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 className="t-script-md" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 14 }}>Parents of the Bride</h3>
                <p className="entourage-name">MR. VICTOR CANDOLESAS</p>
                <p className="entourage-name">MRS. ERLINDA CANDOLESAS</p>
              </div>
            </div>
          </div>

          <Divider />

          <div style={{ textAlign: 'center', margin: '36px 0' }}>
            <h3 className="t-script-md" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 14 }}>Principal Sponsors</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              {[
                'PSTR. DAVE & KRIS PERICO',
                'PSTR. ALVIN & MICHELLE DELA PEÑA',
                'DR. LORDJIM & JIJI RICARDO',
                'PSTR. JOCEL & MYLENE EVANGELISTA',
                'HON. ALLAN & MERCE ROLDAN',
                'PSTR. RYAN & AMETHYST VERGARA',
                'HON. ROBERT & JACKIE CONCEPCION',
                'MR. ZALDY & FLOR ROMERO',
                'AMB. PEDRO JR. & CARI LAYLO',
                'MR. JOJO & BEA QUIOGUE',
                'HON. ARNAN PANALIGAN',
                'MRS. LUCY ROMERO',
                'MR. PERCIVAL & LYN MARTINEZ',
                'MS. LORIE ALAY',
              ].map((name) => (
                <p key={name} className="entourage-name">{name}</p>
              ))}
            </div>
          </div>

          <Divider />

          <div style={{ textAlign: 'center', margin: '36px 0' }}>
            <div className="parents-grid" style={{ maxWidth: 420 }}>
              <div style={{ textAlign: 'center' }}>
                <h3 className="t-script-md" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 14 }}>Man of Honor</h3>
                <p className="entourage-name">MR. KARLO AGENA</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 className="t-script-md" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 14 }}>Maid of Honor</h3>
                <p className="entourage-name">MS. PATRICIA KAHN</p>
              </div>
            </div>
          </div>

          <Divider />

          <div style={{ textAlign: 'center', margin: '36px 0' }}>
            <h3 className="t-script-md" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 14 }}>Secondary Sponsors</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              {[
                'MRS. FE NIEVERA',
                'MR. BRYCE ACUZAR',
                'MS. CARYL CANDOLESAS',
                'MR. IVAN NIEBLA',
                'MS. TRACEY ROJAS',
                'MR. KIM AGENA',
                'MS. JOAN CANIEDO',
                'MR. KENNETH AGENA',
              ].map((name) => (
                <p key={name} className="entourage-name">{name}</p>
              ))}
            </div>
          </div>

          <Divider />

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <h3 className="t-script-md" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 14 }}>Flower Girls</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {['LIAN AGENA', 'ZOEY CANDOLESAS', 'JLEE CANDOLESAS'].map((n) => (
                <p key={n} className="entourage-name">{n}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RSVP ── */}
      <section className="scroll-reveal section-pad" style={{ background: '#EDE8DC', borderTop: '1px solid #C8BEA4', textAlign: 'center' }}>
        <h2 className="t-script-rsvp" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 20 }}>
          A Small Celebration, A Grateful Heart
        </h2>
        <p className="t-body-serif" style={{ maxWidth: 560, margin: '0 auto 16px' }}>
          The Lord has blessed us with many wonderful people, and we wish we could celebrate with
          everyone. After much prayer and consideration, we&apos;ve chosen to keep our wedding an
          intimate gathering.
        </p>
        <p className="t-body-serif" style={{ maxWidth: 560, margin: '0 auto 40px' }}>
          We kindly ask that you RSVP according to the number of seats reserved for you, as
          personally communicated by the couple. Thank you for understanding and for helping us
          celebrate God&apos;s faithfulness with those closest to us.
        </p>

        <RSVPForm />

        <div style={{ width: 48, height: 1, background: '#C8BEA4', margin: '40px auto 24px' }} />
        <p className="t-script-sm" style={{ fontFamily: 'var(--font-script)', color: '#6B7C52' }}>
          See you on August 10!
        </p>
      </section>
    </div>
  )
}
