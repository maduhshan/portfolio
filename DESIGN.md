# Design plan — Madushan Chathuranga

Deliverable for Prompt 1. No code. Read alongside CLAUDE.md.

The premise: engineering and wildlife photography are the same discipline —
patient observation, then acting at the right moment. Everything below is
derived from photographic practice rather than from portfolio convention,
because the subject is a person who actually uses those tools.

---

## 1. Colour

The interface is monochrome. The ramp is not a generic grey scale — it is
anchored to the two greys a photographer actually references: **paper** (the
print base) and **18% grey** (the metering card). The dark ground is named for
the hide you sit in before dawn. Five values, each with one job.

| Token | Hex | Job |
|---|---|---|
| `--paper` | `#E7E8E5` | The lit ground. Base surface for every section about engineering: hero, about, career, work, writing, contact. Cool neutral, a hair of green so it never reads as cream. |
| `--ink` | `#141715` | Primary text on paper. Also the source of every hairline (`--ink` at 12–20% via `color-mix`), so rules and type belong to the same substance. |
| `--graphite` | `#5B615D` | Secondary text on paper: dates, organisations, captions, stack names, the parts you read second. |
| `--grey-18` | `#767B78` | The 18% reference. Secondary text **on the dark ground**, the cursor reticle stroke, and the active state of hairlines. The pivot value: it works on both grounds. |
| `--hide` | `#0B0D0C` | The dark ground. The field sections, `/field`, the lightbox scrim, the footer. Not `#000`, so a photograph's own blacks still separate from the page. |

Measured contrast: ink on paper **15.0:1**; graphite on paper **5.1:1**; paper
on hide **15.0:1**; grey-18 on hide **4.5:1**. `--grey-18` on paper is 3.5:1 and
is therefore restricted to hairlines, large type and non-text marks — never body
copy.

**Two grounds, one meaning.** Light where the work is engineering, dark where
the work is field. The site does not have a theme switch; the ground changes
because the subject changes. Section transitions between them are a hard edge,
not a gradient.

### How photographs introduce colour

There is no accent colour. There is no brand hue. The only saturated pixels the
site ever renders come out of an `<img>`. Three consequences, all deliberate:

1. **Nothing borrows colour except from a real photograph.** Where the UI needs
   a tint — the lightbox scrim, `::selection` inside a caption — it is sampled
   from the photograph currently on screen (Sanity's asset `metadata.palette`,
   or the LQIP average for Instagram media). If there is no photograph, there is
   no tint. Colour is always evidence of an image, never decoration.
2. **Photographs of the field are never desaturated, duotoned or overlaid.** No
   gradient scrims across images. If text must sit over an image it gets its own
   band of `--hide`. The one bold move only works if those photographs are
   untouched.

   Photographs *of him* are the exception, and they prove the rule: the opening
   portrait renders in greyscale with a little grain, because a picture of the
   author is part of the interface rather than part of the field. The only
   colour anywhere on the site is an animal.
3. **Colour is rationed by layout.** The work index shows one small plate per
   row. `/field` is where colour is allowed to fill the viewport. That
   escalation is the reward for scrolling.

---

## 2. Type

Two families. No sans-serif at all — that absence is the point. The site reads
as a field notebook and a terminal, which is precisely the two halves of the
person.

**Newsreader** (Production Type, variable 200–800 + italic, Google Fonts /
`@fontsource-variable/newsreader`) — display and body.
Low-contrast, large x-height, drawn for screen reading at length, with a
genuinely idiosyncratic italic. It descends from the transitional text faces of
scientific and natural-history printing: this is the type of a plate caption in
a field guide, not the high-contrast Didone of a fashion portfolio. It carries
case-study prose — which is long — without fatigue.

**IBM Plex Mono** (variable weights via `@fontsource/ibm-plex-mono`) — labels,
data, navigation, numerals.
A humanist mono with real drawing in it (the splayed `M`, the tailed `l`, the
single-storey `a`), from a type programme commissioned by an engineering
company. It holds up at 11px, which is where all of this site's metadata lives:
dates, tenure, stack, EXIF-shaped tables, plate numbers.

Not Inter, not a neutral grotesque, and not the cream-serif-plus-terracotta
pairing the brief bans.

### Rules that come with the faces

- **Italic Newsreader is reserved for binomial names and photographic
  captions.** Field-guide convention: *Panthera pardus kotiya* is italic because
  that is how species are set, not because italics look nice. Nothing else on the
  site is italic — not emphasis in prose, not pull quotes.
- **Mono is for anything a machine produced or a calendar fixed**: dates, tenure
  in months, transaction counts, stack names, plate numbers, the reticle
  read-out. Prose never uses it.
- **Numbers inside case-study prose switch to mono at the same optical size**,
  with tabular figures. That is how "40M transactions a day against a 5-second
  SLA" becomes readable at a glance without a big-number stat block.
- Labels are **lowercase mono**, never ALL-CAPS tracked eyebrows.

### Scale

Minor third (1.2), fluid where it matters. Declared as CSS custom properties.

| Step | Size | Face | Use |
|---|---|---|---|
| `--t-display` | `clamp(3rem, 1.2rem + 7.5vw, 8rem)` | Newsreader 300 | The name in the hero. One instance per site. |
| `--t-1` | `clamp(2.1rem, 1.5rem + 2.4vw, 3.25rem)` | Newsreader 350 | Section headings, case-study title |
| `--t-2` | `clamp(1.55rem, 1.3rem + 1vw, 2rem)` | Newsreader 400 | Project titles, role companies |
| `--t-3` | `1.3rem` | Newsreader 400 | Sub-headings inside case studies |
| `--t-body` | `1.0625rem` / 1.6 | Newsreader 400 | Body copy. Measure capped at 68ch. |
| `--t-small` | `0.9375rem` | Newsreader 400 | Captions, secondary prose |
| `--t-meta` | `0.8125rem` | Plex Mono 450 | Dates, organisations, stack |
| `--t-label` | `0.6875rem` / 0.09em tracking | Plex Mono 500 | Field labels, plate numbers, nav |

Weight range used: 300, 350, 400, 500 only. Nothing bold — emphasis comes from
size and colour, which suits a monochrome system.

---

## 3. Layout

Baseline: a 12-column grid at ≥1024px, 6 at ≥640px, 1 below. Gutter 24px,
max content width 1280px, prose measure 68ch. Vertical rhythm on an 8px scale.

**Alignment principle: everything hangs from a single left datum.** One vertical
line at the content edge that the name, every section heading, every row and
every paragraph start from. Centred type appears nowhere. The reason is the
subject: a contact sheet, a log, a field notebook and a stack trace are all
left-registered, and the eye reading down a left edge is doing exactly what the
site is about — scanning a column patiently for the frame that matters.

The right side is deliberately ragged. Photographic plates hang off the right
datum at varying widths so the page has a soft edge on one side and a hard edge
on the other.

### 3.1 Hero — type leads, the plate supports

```
┌──────────────────────────────────────────────────────────────────┐
│ Madushan Chathuranga        Career  Work  Field  Writing  Contact│
│                                                                  │
│                                                                  │
│  Java and Go. AWS and GCP.                    ┌ ┐                │
│  Twelve years of systems                    ┌──────────┐         │
│  that stay up.                              │          │         │
│                                             │ greyscale│         │
│  ─────                                      │  340px   │         │
│                                             │          │         │
│  The rest of the time I am out with         └──────────┘         │
│  a camera waiting for something               ┘ └                │
│  wild to move.                                Florence           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**No name, no title, no tagline.** The name is set small in the navigation, at
the same size as the nav items. There is no job title anywhere in the opening —
a role label answers "what is he called", and the opening should answer "what
does he do". The career section is where someone goes for the CV.

**The opening sentence is the `<h1>`, and it is the largest thing on the page.**
It is set as fragments rather than prose, which is the same rhythm the site
already uses for data: mono labels, plate numbers, stack lists with no
connectives. A spec plate for a person.

Under it, a hairline, then a second quieter line for the other half of the work.
Both come from Sanity (`headline` and `heroNote`), so neither needs a deploy.

**The portrait is 340px and greyscale.** It was full-bleed and in colour, and it
was wrong twice over: it made a photograph of the author the loudest thing on a
site whose argument is about photographs of animals, and it spent the colour
rationing of §1 on the first screen. At plate size and in greyscale it reads as
a document, the type carries the opening, and `/field` gets its payoff back.

The greyscale, the contrast lift and the grain are applied in CSS rather than
baked into the file, so a portrait swapped in through Studio is treated the same
way. The plate is deliberately **not** a focus-pull target: that effect belongs
where a frame sharpening under the cursor means something.

**Parallax** is one layer at half strength — the plate is over-scaled 5% and
drifts up to 5px against the pointer. The brackets sit outside the clip so they
frame the plate rather than being cropped by it.

**With no photograph** the plate becomes an empty bracketed frame with a mono
line marking what is missing, and the type is unaffected.

### 3.2 Career

Not a stack of cards. A **tenure scale** — a single honest time axis with the
roles read alongside it.

```
   scale rail (sticky)        roles (the readable column)
   ┌──┐
2025│▓▓│ ←open top       Techlabs Global                    Jun 2025 →
   │▓▓│                  Senior Technical Lead   Colombo
   │  │                  Embedded with Sportserve as technical lead on
   │▒▒│                  their payment data platform. Leads a team of
2023│▒▒│                  seven across backend, frontend, data
   │▒▒│                  warehousing and SRE.
   │▒▒│                  ──────────────────────────────────────────────
   │▒▒│                  Visa Inc, via Persolkelly           2023–2025
2021│  │                  Senior Software Consultant  Singapore
   │▒▒│                  Architected the Kafka-driven payment
   │▒▒│                  acknowledgement system behind Visa Flexible
2019│▒▒│                  Credentials. Team of four backend engineers
   │▒▒│                  and one QA.
   │▒▒│                  ──────────────────────────────────────────────
   │▒▒│                  ⋮
2015│▒▒│ ←closed bottom
   └──┘
```

The rail is drawn to scale from May 2015 to now: band height is proportional to
actual months served, so a four-year tenure is visibly four times a one-year
one. Year ticks in mono. The rail does not try to align pixel-for-pixel with the
prose — pointing at a role (hover, keyboard focus, or simply scrolling it into
view) raises its band from `--ink`/15% to solid `--ink`. Relationship by
highlight, not by adjacency, so nothing can drift out of register.

The current role reads as current because its band is **open at the top** — no
cap, fading into the paper — and because its date reads `Jun 2025 →` where every
other reads a closed range. Nothing pulses, nothing animates on its own.

Highlights render as a restrained nested list, mono bullets, one line each, only
under the role in view. Below 640px the rail collapses to a single leading
hairline with the year ticks retained.

### 3.3 Work

Not a grid of identical cards. A **list of plates**, the way a monograph indexes
its images.

```
01 ┌───────────────────────────────────────────────────┐  ┌──────────┐
   │ EventStream 2.0                                   │  │          │
   │ Techlabs Global, with Sportserve         current  │  │  plate   │
   │ Go   GCP   BigQuery   Pub/Sub   Kafka   Terraform │  │          │
   └───────────────────────────────────────────────────┘  └──────────┘
──────────────────────────────────────────────────────────────────────
02   Agentic Workflow Builder
     Techlabs Global                            current
     Vertex AI   Gemini   RAG   Go   GCP                     ┌─────┐
──────────────────────────────────────────────────────────── │plate│
03   B2B Back Office Platform                                └─────┘
     ⋮
```

Full-bleed rows on the left datum, separated by hairlines, numbered `01`–`08` in
mono. Featured projects render at larger type with their plate always visible;
the rest reveal a smaller plate on hover or keyboard focus, and it sharpens
under the focus-pull cursor. Stack names are individual mono elements separated
by space alone — no middle dots, no slashes, no pills.

Row heights vary with importance, so the index has rhythm rather than a metronome
of equal cards. Whole row is the link target; the title is the accessible name.

Case study (`/work/[slug]`) runs one column at 68ch on the left datum: title,
then `problem` / `what he did` / `what changed` as three plain sections. Numbers
inside the prose are set in tabular mono. No stat blocks, no dashboards.

---

## 4. The focus-pull cursor

The signature interaction. A camera does one thing when you turn the barrel:
what you point at resolves, and what you do not point at stays soft. That is the
whole idea, and it is applied to exactly one class of object — **photographs** —
so it reads as a lens, not as a hover effect.

**Behaviour**

- The native cursor is replaced by a **reticle**: a 28px ring in `--grey-18` with
  four corner ticks — the same brackets that frame the hero plate.
- The reticle follows the pointer through a spring (stiffness 420, damping 34,
  mass 0.6). It lags the pointer by a few frames, the way a focus motor lags
  your hand. Raw listeners feel mechanical; the spring is the point.
- Every photograph carries `data-focus-target` and renders at
  `filter: blur(2.4px)` by default. Blur is interpolated by distance from the
  reticle to the element's nearest edge: `0px` inside 120px, ramping to the full
  2.4px beyond 520px, eased. Nothing else on the site is ever blurred — never
  text, never UI.
- **Focus lock.** Inside the near radius the reticle's corner ticks step inward
  by 3px and its stroke goes to `--ink`. A confirmation, in monochrome, of the
  thing a green AF box tells you.
- The blur ceiling is 2.4px: soft enough to read as out of focus, never so soft
  that an image looks broken or unloaded.

**Performance** — this is a blur filter over large images, so it is capped hard.
One `requestAnimationFrame` loop reads a single pointer position and writes
`filter` and `transform` directly to element styles; React state is never
involved. Only elements currently intersecting the viewport are considered
(IntersectionObserver), and at most **eight** are soft at once — enough to cover what is
on screen in the common case, with the rest pinned to `filter: none` so the
compositor drops the layer entirely.
`will-change: filter` is added on entering the active set and removed on leaving.
The loop measures its own frame time; sustained frames over 24ms drop the active
cap 8 → 4 → 2 → 0, and the site quietly becomes a normal sharp site rather than
a janky one.

Nothing is soft before the pointer has moved. A visitor who lands and reads
without touching the mouse sees a page of sharp photographs — the effect answers
an action rather than greeting them with it.

**Degradation**

| Condition | Result |
|---|---|
| `prefers-reduced-motion: reduce` | Provider renders nothing. Native cursor. Images always sharp — the blur is never applied, not merely un-animated. No parallax, no smooth scroll. |
| `(pointer: coarse)` / touch | Same: native behaviour, images sharp. Tapping a plate opens the lightbox, which is the touch equivalent of looking closely. |
| Keyboard | Tabbing to a plate applies the sharp state and draws the reticle brackets around the focused element. Keyboard users get the same signal, with the visible focus ring on top of it, not instead of it. |
| No JS | Images render sharp. The blur is applied by the provider, never by static CSS. |

---

## 5. Principles

**One.** The site is built out of the instruments of its subject — an 18% grey
card, a focus frame, a plate index, a tenure scale — rather than out of the
conventions of portfolio design, so its structure could not be lifted onto
anybody else's work.

**Two.** Colour is treated as evidence: it appears only where a photograph
appears, which makes the engineering half and the field half legible as one
argument instead of two sections stapled together.

**Three.** Motion exists in one place and answers one question — where are you
pointing — because a site about patient observation cannot itself be fidgeting.

**Four.** Every claim on the site is a fact from the work, set plainly and
without a stat block around it, because the audience is senior enough to read a
sentence and the subject is not the sort to shout.

---

## 6. Critique of the above

For each item: *would I have produced this for any developer portfolio brief?*

**Colour — partly yes.** "Monochrome greys" is one of the most generic answers
in the category; a five-step neutral ramp is what any brief would have produced.
*Changed:* the ramp is now anchored to values a photographer references rather
than being invented (paper, 18% grey, the hide), and — the substantive change —
the site is given a rule that no generic portfolio has: **the UI may not invent
colour, it may only sample it from the photograph on screen**. The lightbox
scrim tint and caption `::selection` are sampled from the image's own palette.
That converts "monochrome" from a style choice into a mechanic.

**Type — yes on the pairing, no on the rules.** Serif display plus mono metadata
is a recognisable combination and I would have reached for it regardless.
*Changed:* rather than swap to a face chosen for novelty, I kept the pairing and
gave it two rules that only make sense here — italic is reserved for binomial
species names and photographic captions, per field-guide convention, and mono is
reserved for anything a machine produced or a calendar fixed. A generic
portfolio has no reason to hold either line. I also cut the weight range to
300–500 and removed bold entirely, because a monochrome system that shouts with
weight loses its only remaining variable.

**Layout — hero was generic, career and work were not.** "Huge name, big
photograph" is the default hero and my first pass was exactly that. *Changed:*
the tagline is deleted and the dual identity is carried by a three-row
label/value table set as a lens plate, with the two lives given identical
typographic weight — a portfolio for a person with one occupation would have
nothing to put in that table. The name now crops at the viewport edge as a
viewfinder crop rather than sitting politely inside the margin. The career rail
was originally a decorative vertical line with dots, which is the standard
timeline; it is now drawn *to scale in months*, which is honest, occasionally
unflattering, and something almost nobody does.

**Cursor — specific to the brief, but my first version was a gimmick.**
Blur-on-approach applied to everything is just an unusual hover effect, and it
would have made text unreadable and the site feel broken. *Changed:* the effect
is restricted to photographs only, which turns it from an effect into a lens;
the reticle gained a focus-lock state so the interaction *confirms* something
rather than merely reacting; and it now degrades on four axes rather than one,
including a self-measuring frame-time governor, because a signature interaction
that drops frames on a laptop is worse than no signature interaction.

**Principles — the first draft was four sentences that would fit any careful
engineer.** *Changed:* each one is now tied to a decision made above (the
instruments, the colour mechanic, the single locus of motion, the absence of
stat blocks), so they can be checked against the built site rather than admired.

**What I could not make specific, and am leaving alone.** The 12-column grid,
the 8px rhythm, the 68ch measure and the minor-third scale are generic — and
should be. They are the parts of the system that exist to be unnoticed, and
inventing novelty there would cost legibility for no gain.

---

## 7. Critique of the built site

Written after building it, against CLAUDE.md. Three things I would change.

**One — the one bold move is currently unproven.** "The interface is monochrome;
photographs are the only source of colour" is the whole argument, and there are
no photographs yet. A visitor today gets the restraint without the payoff: a
reserved frame in the hero, an empty state at `/field`, and the claim that
engineering and field work are the same discipline made in *words* rather than
shown. Everything else on this list is decoration next to it. **What I would
change:** the site should not go live until a dozen frames are in Sanity. The
build is finished; the argument is not.

**Two — the career section is the most conventional thing here.** The rail is
honest — band height is real months, and it is unflattering where the tenure was
short — but honesty is not the same as insight, and a scaled timeline is still a
timeline. The premise (patient observation, then acting at the right moment) has
no expression in this section beyond chronology. **What I would change:** let the
rail carry one fact a CV cannot, where the data exists — the size of the team
led at each point, as band width. Same content model, no new fields, and it
turns a timeline into something worth stopping on.

**Three — the focus-pull cursor costs more than it currently earns.** It is the
signature interaction and it runs a rAF loop, a MutationObserver, an
IntersectionObserver and a frame-time governor. On the home page, where most
visitors stop, there is exactly one photograph for it to act on; it only really
pays off on `/field`. That is machinery idling. **What I would change:** give the
work index real cover images so the effect has something to do above the fold —
or scope the provider to the routes that actually contain photographs, and let
the rest of the site not pay for it.

### Known gaps, not design decisions

- `siteSettings.linkedin` and `github` are empty. They were left out rather than
  guessed, so the contact section simply omits them. Add them in Studio.
- `availability` currently reads "Open to conversations" — that is a placeholder
  claim about a person's intentions and should be confirmed or changed.
- Two case studies (`B2B Back Office Platform`, and to a lesser extent the
  agentic builder) state what changed without a number, because no number was
  given. The seed file marks them with TODOs rather than inventing one.
