import Link from 'next/link'
import { useState } from 'react'

export type SiteNavbarItem = {
  href: string
  label: string
}

type SiteNavbarProps = {
  ctaHref?: string
  ctaLabel?: string
  items?: SiteNavbarItem[]
}

const DEFAULT_ITEMS: SiteNavbarItem[] = [
  { href: '#features', label: 'Features' },
  { href: '#plans', label: 'Plans' },
  { href: '#steps', label: 'How it works' },
  { href: '/rankings', label: 'Rankings' },
]

export default function SiteNavbar({
  ctaHref = '#plans',
  ctaLabel = 'Join now',
  items = DEFAULT_ITEMS,
}: SiteNavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <header className="sticky top-0 z-[9999] border-b border-[#ece7f4] bg-white shadow-[0_8px_24px_rgba(48,32,88,0.06)]">
      <div className="relative z-[10000] mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 bg-white px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Virtual Library home" onClick={closeMenu}>
          <img src="/img/logo.svg" alt="Virtual Library" className="h-8 w-auto" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-bold text-[#575069] lg:flex">
          {items.map((item) => (
            <a key={`${item.href}-${item.label}`} href={item.href} className="transition hover:text-[#6d35df]">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <a
            href={ctaHref}
            className="hidden h-10 items-center justify-center rounded-lg bg-[#6d35df] px-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(109,53,223,0.18)] transition hover:bg-[#5b25c9] sm:inline-flex"
          >
            {ctaLabel}
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5deee] bg-white text-[#171322] shadow-[0_10px_22px_rgba(48,32,88,0.06)] transition hover:border-[#cbbcff] hover:text-[#6d35df] lg:hidden"
            aria-controls="mobile-site-nav"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-site-nav"
        className={`fixed inset-x-0 top-16 z-[9998] lg:hidden ${
          isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
        }`}
      >
        <button
          type="button"
          aria-label="Close navigation menu"
          className={`fixed inset-x-0 bottom-0 top-16 bg-[#171322]/18 transition duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMenu}
        />

        <div
          className={`relative mx-3 mt-3 overflow-hidden rounded-[28px] border border-[#ece7f4] bg-white shadow-[0_24px_70px_rgba(48,32,88,0.18)] transition duration-300 ease-out sm:mx-6 ${
            isOpen ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
          }`}
        >
          <nav className="grid gap-2 p-3 text-base font-bold text-[#575069]">
            {items.map((item) => (
              <a
                key={`${item.href}-${item.label}-mobile`}
                href={item.href}
                className="flex h-[3.25rem] items-center justify-between rounded-[18px] border border-[#eee8f7] bg-[#fdfcff] px-4 shadow-[0_8px_22px_rgba(48,32,88,0.04)] transition hover:border-[#d6c8ff] hover:bg-[#f6f1ff] hover:text-[#6d35df]"
                onClick={closeMenu}
              >
                <span>{item.label}</span>
                <ChevronRightIcon className="h-4 w-4 text-[#b4a8c8]" />
              </a>
            ))}
          </nav>
          <div className="border-t border-[#eee8f7] bg-[linear-gradient(180deg,#ffffff,#fbf8ff)] p-3 pt-4">
            <a
              href={ctaHref}
              className="inline-flex h-12 w-full items-center justify-center rounded-[18px] bg-[#6d35df] px-4 text-base font-bold text-white shadow-[0_16px_34px_rgba(109,53,223,0.22)] transition hover:bg-[#5b25c9]"
              onClick={closeMenu}
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" className={className}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" className={className}>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}
