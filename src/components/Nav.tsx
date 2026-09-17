import { useEffect, useState } from 'react'
import { links } from '../config/links'
import { brand, nav } from '../data/copy'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner">
        <a href="#top" className="nav__logo" aria-label="Aurix home">
          {brand.name}
        </a>

        <nav className="nav__links" aria-label="Primary">
          {nav.links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <a className="btn btn--ghost btn--sm" href={links.demo}>
            {nav.secondaryCta}
          </a>
          <a className="btn btn--primary btn--sm" href={links.searchAudit}>
            {nav.primaryCta}
          </a>
        </div>
      </div>
    </header>
  )
}
