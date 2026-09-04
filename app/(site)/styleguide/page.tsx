import type { Metadata } from 'next'

import { FocusBrackets } from '@/components/FocusBrackets'

export const metadata: Metadata = {
  title: 'Style guide',
  robots: { index: false, follow: false },
}

const palette = [
  {
    name: 'paper',
    hex: '#E7E8E5',
    job: 'The lit ground. Every section about engineering.',
    contrast: 'ink on it: 15.0:1',
  },
  {
    name: 'ink',
    hex: '#141715',
    job: 'Primary text on paper, and the source of every hairline.',
    contrast: 'on paper: 15.0:1',
  },
  {
    name: 'graphite',
    hex: '#5B615D',
    job: 'Secondary text on paper: dates, organisations, captions.',
    contrast: 'on paper: 5.1:1',
  },
  {
    name: 'grey-18',
    hex: '#767B78',
    job: 'The 18% reference. Secondary text on the dark ground, reticle stroke.',
    contrast: 'on hide: 4.5:1 — on paper it is 3.5:1, so never body copy there',
  },
  {
    name: 'hide',
    hex: '#0B0D0C',
    job: 'The dark ground: field sections, lightbox, footer.',
    contrast: 'paper on it: 15.0:1',
  },
]

const scale = [
  { token: 'display', cls: 'display', face: 'Newsreader 300', size: 'clamp(3rem, 1.2rem + 7.5vw, 8rem)', sample: 'Madushan' },
  { token: 't1', cls: 'heading-1', face: 'Newsreader 350', size: 'clamp(2.1rem, 1.5rem + 2.4vw, 3.25rem)', sample: 'Selected work' },
  { token: 't2', cls: 'heading-2', face: 'Newsreader 400', size: 'clamp(1.55rem, 1.3rem + 1vw, 2rem)', sample: 'Visa Flexible Credentials' },
  { token: 't3', cls: 'heading-3', face: 'Newsreader 500', size: '1.3rem', sample: 'What changed' },
  { token: 'body', cls: 'text-body', face: 'Newsreader 400', size: '1.0625rem', sample: 'Alerts now fire in seconds rather than over four minutes.' },
  { token: 'small', cls: 'text-small', face: 'Newsreader 400', size: '0.9375rem', sample: 'Leopard at first light, Yala block one.' },
  { token: 'meta', cls: 'meta', face: 'Plex Mono 400', size: '0.8125rem', sample: 'May 2023 to May 2025' },
  { token: 'label', cls: 'label', face: 'Plex Mono 500', size: '0.6875rem', sample: 'now' },
]

export default function StyleguidePage() {
  return (
    <main className="shell py-24">
      <header className="border-rule border-b pb-10">
        <p className="label">style guide</p>
        <h1 className="heading-1 mt-3">The system, with nothing on top of it</h1>
        <p className="measure text-muted mt-4 text-small">
          Five greys, two faces, one modular scale. The full reasoning is in DESIGN.md. This page
          is not indexed and is not linked from the site.
        </p>
      </header>

      <Section n="01" title="The two grounds">
        <p className="measure text-muted text-small">
          The site does not have a theme switch. The ground changes because the subject changes:
          paper where the work is engineering, hide where the work is field. Sections carry{' '}
          <code>data-ground</code> and everything inside resolves through it.
        </p>
        <div className="mt-8 grid gap-px sm:grid-cols-2">
          <div data-ground="paper" className="bg-ground text-fg border-rule border p-8">
            <p className="label">paper</p>
            <p className="heading-3 mt-3">Engineering</p>
            <p className="text-muted mt-2 text-small">Secondary text sits at graphite.</p>
            <hr className="bg-rule mt-6 h-px border-0" />
          </div>
          <div data-ground="hide" className="bg-ground text-fg border-rule border p-8">
            <p className="label">hide</p>
            <p className="heading-3 mt-3">Field</p>
            <p className="text-muted mt-2 text-small">Secondary text sits at 18% grey.</p>
            <hr className="bg-rule mt-6 h-px border-0" />
          </div>
        </div>
      </Section>

      <Section n="02" title="Palette">
        <ul className="mt-2">
          {palette.map((swatch) => (
            <li
              key={swatch.name}
              className="border-rule grid grid-cols-[3rem_1fr] items-start gap-x-5 gap-y-1 border-b py-5 sm:grid-cols-[3rem_9rem_1fr_14rem]"
            >
              <span
                aria-hidden
                className="border-rule-strong h-12 w-12 border"
                style={{ backgroundColor: swatch.hex }}
              />
              <span className="meta text-fg">
                {swatch.name}
                <span className="text-muted block">{swatch.hex}</span>
              </span>
              <span className="text-small">{swatch.job}</span>
              <span className="meta">{swatch.contrast}</span>
            </li>
          ))}
        </ul>
        <p className="measure text-muted mt-6 text-small">
          There is no accent colour and no sixth grey. The only saturated pixels the site renders
          come out of a photograph.
        </p>
      </Section>

      <Section n="03" title="Type scale">
        <ul>
          {scale.map((step) => (
            <li key={step.token} className="border-rule border-b py-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <span className="label">{step.token}</span>
                <span className="meta">
                  {step.face} — {step.size}
                </span>
              </div>
              <p className={`mt-3 ${step.cls}`}>{step.sample}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section n="04" title="The two faces">
        <div className="mt-2 grid gap-10 md:grid-cols-2">
          <div>
            <p className="label">newsreader — display and body</p>
            <p className="mt-3 text-t2 leading-tight">
              Watch something patiently until you understand how it behaves, then act at the right
              moment.
            </p>
            <p className="text-muted mt-4 text-small">
              Italic is reserved for binomial names and photographic captions, field-guide
              convention: <em>Panthera pardus kotiya</em>, Yala, first light. Nothing else on the
              site is italic.
            </p>
          </div>
          <div>
            <p className="label">ibm plex mono — labels, data, numerals</p>
            <p className="meta mt-3 text-fg">
              0123456789 — tabular figures
              <br />
              Jun 2025 to present
              <br />
              Go GCP BigQuery Pub/Sub Kafka
            </p>
            <p className="text-muted mt-4 text-small">
              Mono carries anything a machine produced or a calendar fixed. Prose never uses it.
            </p>
          </div>
        </div>
      </Section>

      <Section n="05" title="Prose and figures">
        <div className="prose measure mt-2">
          <p>
            Payment acknowledgements travelled over TCP socket connections carrying raw byte
            streams. The connections were unreliable, and the traffic was{' '}
            <strong>40M transactions a day</strong> against a <strong>5-second SLA</strong>.
          </p>
          <h3>What changed</h3>
          <p>
            Alerts now fire in <strong>seconds</strong> rather than over four minutes, and roughly{' '}
            <strong>$7.5k a month</strong> of unaccounted BigQuery spend was traced and removed.
          </p>
          <ul>
            <li>Figures inside prose switch to tabular mono at the same optical size.</li>
            <li>No stat blocks, no big numbers in boxes.</li>
          </ul>
        </div>
      </Section>

      <Section n="06" title="Marks, rules and plates">
        <div className="mt-2 grid gap-10 md:grid-cols-3">
          <div>
            <p className="label">hairline</p>
            <div className="bg-rule mt-4 h-px w-full" />
            <p className="meta mt-2">ink at 14%</p>
            <div className="bg-rule-strong mt-6 h-px w-full" style={{ backgroundColor: 'var(--rule-strong)' }} />
            <p className="meta mt-2">ink at 40%, for the active state</p>
          </div>
          <div>
            <p className="label">focus brackets</p>
            <div className="relative mt-6 h-28">
              <FocusBrackets />
              <span className="meta absolute inset-0 grid place-items-center">the frame</span>
            </div>
          </div>
          <div>
            <p className="label">plate</p>
            <p className="text-muted mt-4 text-small">
              A photograph, framed. Rendered only where there is one — an empty frame reads as
              something missing rather than as something withheld.
            </p>
          </div>
        </div>
      </Section>

      <Section n="07" title="Links and labels">
        <div className="mt-2 flex flex-wrap items-baseline gap-x-10 gap-y-4">
          <a className="link" href="#top">
            A link is underlined and thickens on interaction
          </a>
          <span className="label">a lowercase mono label</span>
          <span className="meta">meta, tabular numerals: 2015 to 2019</span>
        </div>
        <p className="measure text-muted mt-6 text-small">
          No arrows appended to link text, no ALL-CAPS tracked eyebrows, no middle dots joining
          meta strings — the label column does the separating.
        </p>
      </Section>

      <Section n="08" title="Motion">
        <dl className="mt-2 grid gap-x-8 gap-y-3 sm:grid-cols-[10rem_1fr]">
          <dt className="label">tick — 120ms</dt>
          <dd className="text-small">State changes you should barely notice.</dd>
          <dt className="label">pull — 260ms</dt>
          <dd className="text-small">The focus-pull blur ramp.</dd>
          <dt className="label">shift — 480ms</dt>
          <dd className="text-small">Route transitions and the mobile overlay.</dd>
          <dt className="label">easing</dt>
          <dd className="text-small">cubic-bezier(0.2, 0.8, 0.2, 1) — everywhere, no exceptions.</dd>
        </dl>
        <p className="measure text-muted mt-6 text-small">
          Under prefers-reduced-motion every one of these collapses to nothing, the cursor provider
          does not mount, and photographs render sharp rather than merely un-animated.
        </p>
      </Section>
    </main>
  )
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-rule border-b py-14">
      <div className="flex items-baseline gap-4">
        <span className="label">{n}</span>
        <h2 className="heading-2">{title}</h2>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}
