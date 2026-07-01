'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

/* ─────────────────────────────────────────────
   SVG Helpers
───────────────────────────────────────────── */

type FlowerProps = {
  cx: number; cy: number; r: number; color: string; center?: string; petals?: number
}

function Flower({ cx, cy, r, color, center = '#FFD700', petals = 6 }: FlowerProps) {
  return (
    <g>
      {Array.from({ length: petals }, (_, i) => {
        const angle = (i * 360) / petals
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy - r * 0.68}
            rx={r * 0.32}
            ry={r * 0.6}
            fill={color}
            opacity={0.88}
            transform={`rotate(${angle} ${cx} ${cy})`}
          />
        )
      })}
      <circle cx={cx} cy={cy} r={r * 0.22} fill={center} />
    </g>
  )
}

function Leaf({ cx, cy, rx, ry, angle, color = '#5A7A3A' }: {
  cx: number; cy: number; rx: number; ry: number; angle: number; color?: string
}) {
  return (
    <ellipse
      cx={cx} cy={cy} rx={rx} ry={ry}
      fill={color} opacity={0.8}
      transform={`rotate(${angle} ${cx} ${cy})`}
    />
  )
}

function FloralTopRight() {
  return (
    <div style={{ position: 'absolute', top: 0, right: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <svg width="210" height="190" viewBox="0 0 210 190">
        <Flower cx={165} cy={42} r={48} color="#E8642A" center="#F5C842" petals={8} />
        <Flower cx={95} cy={75} r={36} color="#F5C842" center="#E8A025" petals={7} />
        <Flower cx={185} cy={108} r={26} color="#F5893D" center="#FFD700" />
        <circle cx={130} cy={25} r={6} fill="#E8642A" opacity={0.7} />
        <circle cx={145} cy={15} r={4} fill="#F5C842" opacity={0.6} />
        <circle cx={155} cy={30} r={5} fill="#F5893D" opacity={0.65} />
        <Leaf cx={125} cy={60} rx={8} ry={22} angle={-35} />
        <Leaf cx={145} cy={80} rx={7} ry={18} angle={15} color="#3D6B2F" />
        <Leaf cx={105} cy={40} rx={6} ry={16} angle={-60} />
      </svg>
    </div>
  )
}

function FloralBottomLeft() {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <svg width="220" height="210" viewBox="0 0 220 210">
        <Flower cx={55} cy={170} r={52} color="#E8426A" center="#FFD700" petals={8} />
        <Flower cx={110} cy={155} r={38} color="#E8642A" center="#F5C842" petals={7} />
        <Flower cx={22} cy={130} r={30} color="#9B5EA5" center="#FFD700" />
        <Flower cx={80} cy={195} r={22} color="#F8E0E6" center="#FFB6C1" petals={5} />
        <circle cx={130} cy={170} r={7} fill="#E8642A" opacity={0.7} />
        <circle cx={140} cy={180} r={5} fill="#F5C842" opacity={0.6} />
        <Leaf cx={75} cy={140} rx={8} ry={24} angle={30} />
        <Leaf cx={45} cy={148} rx={7} ry={20} angle={-20} color="#3D6B2F" />
        <Leaf cx={100} cy={130} rx={6} ry={18} angle={55} />
      </svg>
    </div>
  )
}

function FloralBottomRight() {
  return (
    <div style={{ position: 'absolute', bottom: 0, right: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <svg width="190" height="200" viewBox="0 0 190 200">
        <Flower cx={130} cy={165} r={50} color="#F5C842" center="#C4802A" petals={10} />
        <Flower cx={175} cy={130} r={28} color="#FFF8DC" center="#F5C842" petals={6} />
        <circle cx={160} cy={170} r={6} fill="#5A7A3A" opacity={0.6} />
        <circle cx={150} cy={158} r={4} fill="#5A7A3A" opacity={0.5} />
        <line x1="155" y1="165" x2="160" y2="175" stroke="#5A7A3A" strokeWidth="2" opacity="0.5" />
        <line x1="148" y1="158" x2="152" y2="168" stroke="#5A7A3A" strokeWidth="1.5" opacity="0.5" />
        <Leaf cx={110} cy={148} rx={8} ry={22} angle={-25} />
        <Leaf cx={155} cy={148} rx={7} ry={18} angle={40} color="#3D6B2F" />
      </svg>
    </div>
  )
}

function FloralTopLeft() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <Flower cx={35} cy={38} r={38} color="#F5893D" center="#F5C842" petals={7} />
        <Flower cx={90} cy={55} r={24} color="#E8642A" center="#FFD700" />
        <Leaf cx={60} cy={55} rx={7} ry={20} angle={20} />
        <Leaf cx={30} cy={65} rx={6} ry={16} angle={-40} color="#3D6B2F" />
      </svg>
    </div>
  )
}

function Divider({ symbol = '✦' }: { symbol?: string }) {
  return (
    <div className="ornament-divider" style={{ margin: '0 auto' }}>
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 12, color: '#C8BEA4' }}>{symbol}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Countdown
───────────────────────────────────────────── */

const WEDDING_DATE_ISO = '2026-08-10T15:30:00+08:00'

const STORY_PHOTOS = Array.from({ length: 10 }, (_, i) => `/our-story-${i + 1}.jpg`)

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number }

function computeTimeLeft(): TimeLeft {
  const diff = Math.max(0, new Date(WEDDING_DATE_ISO).getTime() - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function useCountdown(): TimeLeft | null {
  const [time, setTime] = useState<TimeLeft | null>(null)

  useEffect(() => {
    setTime(computeTimeLeft())
    const id = setInterval(() => setTime(computeTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  return time
}

function CountdownBox({ value, label }: { value: number | null; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p className="countdown-num">{value === null ? '–' : String(value).padStart(2, '0')}</p>
      <p className="countdown-label">{label}</p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   RSVP form (front-end only — not wired to a backend yet)
───────────────────────────────────────────── */

function RSVPForm() {
  const [submitted, setSubmitted] = useState(false)

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
      onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420, margin: '0 auto', textAlign: 'left' }}
    >
      <input className="rsvp-field" type="text" name="name" placeholder="Full Name" required />
      <input className="rsvp-field" type="email" name="email" placeholder="Email Address" required />
      <select className="rsvp-field" name="attending" defaultValue="" required>
        <option value="" disabled>Will you be attending?</option>
        <option value="yes">Joyfully Accepts</option>
        <option value="no">Regretfully Declines</option>
      </select>
      <input className="rsvp-field" type="number" name="guests" placeholder="Number of Guests" min={1} />
      <textarea className="rsvp-field" name="message" placeholder="Message for the couple (optional)" rows={4} />
      <button
        type="submit"
        style={{
          fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500,
          letterSpacing: '2px', textTransform: 'uppercase',
          color: '#F5F0E8', background: '#3D4A28',
          border: 'none', borderRadius: 2, padding: '14px 24px',
          cursor: 'pointer', marginTop: 4,
        }}
      >
        Send RSVP
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
  const countdown = useCountdown()

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
          src="/hero.jpg"
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
        <FloralTopRight />
        <FloralBottomLeft />
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

   

    

      {/* ── GIFTS ── */}
      <section className="scroll-reveal section-pad" style={{ background: '#EDE8DC', borderTop: '1px solid #C8BEA4', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 className="t-script-lg" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 24 }}>
            Gifts
          </h2>
          <p className="t-body-serif">
            We are already truly blessed in many ways.<br />
            Your presence and prayers mean the most to us.<br />
            If you feel led to give, a monetary gift<br />
            would be received with heartfelt gratitude.
          </p>
        </div>
      </section>

      {/* ── ENTOURAGE ── */}
      <section className="scroll-reveal section-pad" style={{ background: '#F5F0E8', borderTop: '1px solid #C8BEA4' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
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
                <p className="entourage-name">MRS. SHEENA NATADA</p>
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
                'MS. PATRICIA KAHN',
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
              {['LIAN AGENA', 'ZOEY CANDOLESAS', 'JLEE CANDOLESAS', 'HARPER NATADA'].map((n) => (
                <p key={n} className="entourage-name">{n}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RSVP ── */}
      <section className="scroll-reveal section-pad" style={{ background: '#EDE8DC', borderTop: '1px solid #C8BEA4', textAlign: 'center' }}>
        <h2 className="t-script-rsvp" style={{ fontFamily: 'var(--font-script)', color: '#3D4A28', marginBottom: 20 }}>
          RSVP
        </h2>
        <p className="t-body-serif" style={{ color: '#3D4A28', marginBottom: 16 }}>
          It is our joy to reserve your seat
        </p>
        <p className="t-body-serif" style={{ maxWidth: 480, margin: '0 auto 40px' }}>
          Especially for you on our wedding day.<br />
          As we have chosen to keep our celebration close-knit,<br />
          we are unable to accommodate additional guests.<br />
          Kindly let us know if you&apos;ll be joining us below.
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
