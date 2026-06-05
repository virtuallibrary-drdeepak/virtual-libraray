const HERO_LIVE_ROOM_IMAGE = '/img/v2/hero_asset/hero_section.png'

type VirtualStudyHeroProps = {
  primaryHref?: string
  googlePlayHref: string
  appStoreHref: string
}

const PROOF_CHIPS = [
  { value: '235', label: 'studying now', tone: 'live' },
  { value: '24/7', label: 'rooms open', tone: 'purple' },
  { value: '3,000+', label: 'aspirants', tone: 'blue' },
]

const HERO_STATS = [
  { value: '24/7', label: 'Active Study Rooms' },
  { value: '3,000+', label: 'Active Members' },
  { value: '60% +', label: 'Female Members' },
  { value: '8 Hrs +', label: 'Study Time' },
]

export default function VirtualStudyHero({
  primaryHref = '#plans',
  googlePlayHref,
  appStoreHref,
}: VirtualStudyHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(145deg,#f6f2ff_0%,#f2f8ff_46%,#fff7fb_100%)]">
      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl items-center gap-8 px-4 py-7 sm:px-6 sm:py-9 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:gap-12 lg:py-10">
        <div className="relative z-20 mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#c9ddff] bg-white/80 px-4 py-2 text-[0.78rem] font-bold text-[#185cff] shadow-[0_12px_28px_rgba(37,92,255,0.08)] backdrop-blur sm:text-sm">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00d7a0] opacity-40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00d7a0]" />
            </span>
            India's 24/7 Virtual Library
          </p>

          <h1 className="mt-5 text-[2.75rem] font-extrabold leading-[0.98] tracking-normal text-[#070711] sm:text-[4.35rem] lg:max-w-[40rem] lg:text-[5.15rem] xl:text-[5.7rem]">
            24/7 Virtual{' '}
            <span className="block bg-[linear-gradient(90deg,#265cff_0%,#7c3aed_52%,#8b22ff_100%)] bg-clip-text text-transparent">
              Study Rooms
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-7 text-[#625b74] sm:text-xl sm:leading-8 lg:mx-0">
            Study from home with serious aspirants in always-on live rooms built for focus, discipline, and accountability.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:max-w-xl sm:gap-3 lg:max-w-lg">
            {PROOF_CHIPS.map((chip) => (
              <ProofChip key={chip.label} {...chip} />
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:max-w-xl">
            <a
              href={primaryHref}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-[18px] bg-[#6d28d9] px-6 text-base font-bold text-white shadow-[0_18px_38px_rgba(109,40,217,0.24)] transition hover:bg-[#5b21b6] sm:rounded-[22px] sm:text-lg"
            >
              Join Virtual Library Now
              <ArrowRightIcon className="h-5 w-5" />
            </a>
            <DownloadStoreButton googlePlayHref={googlePlayHref} appStoreHref={appStoreHref} />
          </div>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[24rem] justify-center lg:max-w-[34rem]">
          <div className="relative h-[19rem] w-full overflow-hidden sm:h-[30rem] lg:h-[38rem]">
            <img
              src={HERO_LIVE_ROOM_IMAGE}
              alt="Virtual Library app live study room with students studying together"
              className="pointer-events-none absolute left-1/2 top-0 h-[35rem] -translate-x-1/2 object-contain drop-shadow-[0_28px_80px_rgba(69,31,149,0.24)] sm:h-[48rem] lg:h-[53rem]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(250,247,255,0)_0%,rgba(250,247,255,0.92)_72%,#faf7ff_100%)] sm:h-24" />
          </div>

          <div className="absolute -left-1 top-7 hidden rounded-2xl border border-[#d8ccff] bg-white/95 px-4 py-3 shadow-[0_18px_42px_rgba(48,31,90,0.12)] backdrop-blur sm:block lg:left-0 lg:top-12">
            <p className="flex items-center gap-2 text-xs font-bold uppercase text-[#0f9f91]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#00d7a0]" />
              Live now
            </p>
            <p className="mt-1 text-lg font-extrabold text-[#171322]">235 studying</p>
          </div>

          <div className="absolute -right-1 bottom-14 hidden rounded-2xl border border-[#ebe2ff] bg-white/95 px-4 py-3 shadow-[0_18px_42px_rgba(48,31,90,0.10)] backdrop-blur sm:block lg:right-1 lg:bottom-20">
            <p className="text-xs font-bold uppercase text-[#7c3aed]">Always open</p>
            <p className="mt-1 text-lg font-extrabold text-[#171322]">24/7 rooms</p>
          </div>
        </div>
      </div>

      <div className="relative z-20 border-y border-[#ebe2ff] bg-white/90 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-2 text-center sm:grid-cols-4">
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-[1.75rem] font-extrabold leading-none text-[#171322] sm:text-3xl">{stat.value}</p>
              <p className="mt-1.5 text-sm font-semibold leading-5 text-[#6a6278] sm:mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProofChip({ value, label, tone }: { value: string; label: string; tone: string }) {
  const toneClass =
    tone === 'live'
      ? 'border-[#b7f4df] bg-[#f1fff8] text-[#0f9f91]'
      : tone === 'blue'
        ? 'border-[#c9ddff] bg-[#f3f8ff] text-[#185cff]'
        : 'border-[#d8ccff] bg-white text-[#6d28d9]'

  return (
    <div className={`rounded-2xl border px-3 py-3 text-center shadow-[0_12px_26px_rgba(35,24,70,0.05)] ${toneClass}`}>
      <p className="text-lg font-extrabold leading-none sm:text-2xl">{value}</p>
      <p className="mt-1 text-[0.72rem] font-bold leading-4 text-[#575069] sm:text-sm">{label}</p>
    </div>
  )
}

function DownloadStoreButton({
  googlePlayHref,
  appStoreHref,
}: {
  googlePlayHref: string
  appStoreHref: string
}) {
  return (
    <div className="flex h-14 w-full items-center justify-center gap-4 rounded-[18px] border border-[#e2ddea] bg-white px-6 text-sm font-bold text-[#070711] shadow-[0_12px_26px_rgba(35,24,70,0.05)] sm:gap-5 sm:rounded-[22px] sm:text-lg">
      <span>Download on</span>
      <a href={googlePlayHref} target="_blank" rel="noreferrer" aria-label="Download on Google Play">
        <PlayStoreIcon className="h-5 w-5 sm:h-7 sm:w-7" />
      </a>
      <span aria-hidden="true" className="h-6 w-px bg-[#d8d3df] sm:h-7" />
      <a href={appStoreHref} target="_blank" rel="noreferrer" aria-label="Download on App Store">
        <AppleIcon className="h-5 w-5 text-[#8b8b8b] sm:h-7 sm:w-7" />
      </a>
    </div>
  )
}

function PlayStoreIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="#00D4FF" d="M4.3 2.5c-.4.3-.6.8-.6 1.5v16c0 .7.2 1.2.6 1.5l.1.1 9-9.5v-.2l-9-9.5-.1.1Z" />
      <path fill="#00F076" d="m16.5 15.2-3.1-3.2v-.2l3.1-3.2.1.1 3.7 2.1c1 .6 1 1.5 0 2.1l-3.7 2.1-.1.2Z" />
      <path fill="#FFCE00" d="m16.6 15-3.2-3.3-9 9.5c.6.6 1.5.6 2.5.1L16.6 15Z" />
      <path fill="#FF3A44" d="m16.6 8.9-9.7-5.6c-1-.6-1.9-.5-2.5.1l9 9.5 3.2-3.3Z" />
    </svg>
  )
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.8 12.8c0-2.4 2-3.6 2.1-3.7-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.1-2.8.8-3.6.8-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.1 1.2 9.4.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.8 3.1-.8s1.9.8 3.2.8 2.2-1.1 2.9-2.3c.9-1.3 1.3-2.6 1.3-2.7-.1-.1-2.7-1.1-2.7-4.6ZM14.5 5.8c.7-.8 1.1-1.9 1-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2-.5 2.7-1.3Z" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" className={className}>
      <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  )
}
