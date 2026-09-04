import type { SiteSettings } from '@/lib/types'

import { pt } from './portable-text'

/**
 * Seed for the siteSettings singleton. Everything here is editable at /studio
 * once Sanity is wired up; nothing on the site reads this module directly.
 *
 * TODO(madushan): add your LinkedIn and GitHub URLs, and upload a CV, in
 * Studio. They are left empty rather than guessed — the contact section simply
 * omits whatever is missing.
 */
export const seedSettings: SiteSettings = {
  name: 'Madushan Chathuranga',
  // The opening statement, set in the hero under the figures. Search and social
  // take the first 155 characters of it, so the first sentence has to stand on
  // its own.
  headline:
    'I have been building enterprise grade software since 2015. Most of it is backend work in Java, Python and Go on AWS and GCP. Much of that has been event driven systems moving data in near real time on Kafka, Kinesis and Pub/Sub. I have also built the web applications that sit on top of them, in Node.js, React and TypeScript. More recently the work has been RAG and agentic AI with Vertex AI and LangChain. I am based in Colombo, Sri Lanka.',
  heroNote: 'The rest of the time I am out with a camera waiting for something wild to move.',
  bio: pt(
    'The domains have moved around a lot. The problems underneath do not change much.',
    'Right now I lead a team of seven at Techlabs Global. We are embedded with Sportserve. Before this I spent two years at Visa in Singapore building a payment acknowledgement system that carries 40M transactions a day inside a 5 second SLA. Before that I was at Sysco LABS building the ecommerce software behind a Fortune 500 modernisation. Earlier still, John Wiley & Sons, Axiata Digital Labs and Virtusa.',
    'I am an AWS Certified Solutions Architect. Also a SAFe® Agilist and a Certified ScrumMaster.',
    'On my own time I am usually out with a camera. Wildlife mostly. I like the waiting as much as the photograph. Every frame on this site is mine. They go up on Instagram as @_wild_diary.',
    'I care about how animals are treated. I read philosophy and history when I get the time. I want to know how the world got from one age to the next.',
  ),
  // Shipped in public/ so the site opens with a real photograph before Sanity
  // exists. Replace it at /studio and this stops being used.
  heroImage: {
    alt: 'Madushan Chathuranga on a terrace above Florence, the Arno and the Palazzo Vecchio behind him.',
    credit: '- Piazzale Michelangelo, Florence [05.05.25]',
    asset: {
      url: '/hero.jpg',
      metadata: {
        lqip: 'data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAWABQDASIAAhEBAxEB/8QAGQABAAMBAQAAAAAAAAAAAAAAAAMEBQEG/8QAJhAAAQMDAgYDAQAAAAAAAAAAAQACAwQREgUTITFRUpGhIzOBwf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDdMJ6LmyeirS6wyH7m4t7hxHpVqfWXbkkcx+S+TWluNmnl6sg0dg9EUB1F/b44og8zV1Us0OEhBAc0A24/vlWKihjpq8xGWR2cTTm4Am/L+IiCQUVTGLbkbxzBNwiIg//Z',
        dimensions: { width: 1838, height: 2000 },
      },
    },
  },
  // TODO(madushan): you listed two figures and said three. These are the two
  // you gave. Add a third in Studio if you had one in mind.
  stats: [
    { value: '10+', label: 'years building enterprise grade software' },
    { value: '6', label: 'industries' },
  ],
  industries: [
    'Payments',
    'iGaming',
    'Ecommerce',
    'Education and publishing technology',
    'Insurance',
    'Information security',
  ],
  positioning: pt(
    'I have worked in two modes. Embedded with a client organisation as a forward deployed and consulting engineer, inside their team and their codebase. And in house as a product engineer, on systems that have to keep working for years after the project closes.',
  ),
  // The three headings on every case study page. Editable at /studio.
  caseStudyLabels: {
    problem: 'The problem',
    whatIDid: 'What I did',
    impact: 'What changed',
  },
  competencies: [
    {
      area: 'Languages',
      items: ['Java (8/17/21/25)', 'Go', 'Python', 'JavaScript', 'TypeScript'],
    },
    {
      area: 'Data & Event Platforms',
      items: ['Apache Kafka (Confluent)', 'GCP Pub/Sub', 'BigQuery', 'AWS Kinesis'],
    },
    {
      area: 'Cloud',
      items: [
        'GCP (Cloud Run, BigQuery, Pub/Sub, Cloud SQL, Secret Manager, IAM)',
        'AWS (Lambda, Aurora, DynamoDB, CloudWatch, ECS, Fargate)',
        'Certified Solutions Architect',
      ],
    },
    {
      area: 'AI & LLM Delivery',
      items: [
        'RAG pipelines',
        'agentic workflows',
        'Vertex AI / Gemini',
        'Claude Code',
        'AI assisted SDLC and CI/CD authoring',
      ],
    },
    {
      area: 'Backend & Data Stores',
      items: [
        'Spring Boot',
        'REST',
        'OpenAPI',
        'gRPC',
        'microservices',
        'event-driven architecture',
        'BPMN orchestration',
        'PostgreSQL',
        'MongoDB',
        'Oracle',
        'Redis',
        'BigQuery',
      ],
    },
    { area: 'Frontend', items: ['React', 'Next.js', 'Node.js', 'Vue 3', 'Angular'] },
    {
      area: 'Delivery & Observability',
      items: [
        'GitLab CI',
        'Jenkins',
        'Docker',
        'Kubernetes',
        'Terraform',
        'ArgoCD',
        'Datadog',
        'Dynatrace',
        'Prometheus',
        'Grafana',
        'Splunk',
        'ELK',
      ],
    },
  ],
  // TODO(madushan): confirm these two in Studio. The status drives the
  // indicator in the navigation, and the detail is a claim about what you want
  // to be asked for, which only you can make.
  availabilityStatus: 'Open to selected work',
  availabilityDetail:
    'The work that suits me is backend and platform engineering. Event driven systems, cloud migrations, and teams that need a technical lead.',
  calendarLink: undefined,
  email: 'mchathuranga4@gmail.com',
  // Instagram exposes neither highlights nor pinned posts through its API, so
  // the order is chosen here. These come first, in this order.
  pinnedPosts: [
    'https://www.instagram.com/p/Cq3PRx_BKXP',
    'https://www.instagram.com/p/CoAKXorPShe',
    'https://www.instagram.com/p/CqA2vnIPvMJ',
    'https://www.instagram.com/p/CwmeJCihkDX',
    'https://www.instagram.com/p/DWCFRjtD0wQ',
    'https://www.instagram.com/p/Cx0mMWsRDSZ',
    'https://www.instagram.com/p/CxIbWMNBwLi',
  ],
  whatsapp: '+65 9396 0940',
  linkedin: 'https://www.linkedin.com/in/madushan-chathuranga',
  github: 'https://github.com/maduhshan',
  instagram: 'https://instagram.com/_wild_diary',
  mediumHandle: 'mchathuranga4',
  cvUrl: null,
}
