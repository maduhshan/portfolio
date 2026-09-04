import type { Project } from '@/lib/types'

import { pt } from './portable-text'

/**
 * The eight case studies, built only from facts that were given. Where an
 * outcome was not stated it is not asserted — see the TODOs.
 */
export const seedProjects: Project[] = [
  {
    _id: 'project-eventstream',
    title: 'EventStream 2.0',
    slug: 'eventstream-2',
    organisation: 'Techlabs Global, with Sportserve',
    period: '2025 to present',
    featured: true,
    order: 1,
    stack: ['Go', 'GCP Cloud Run', 'BigQuery', 'Pub/Sub', 'Cloud SQL', 'Kafka', 'Terraform'],
    problem: pt(
      'Alerting ran through a PL/pgSQL engine that evaluated **261 rules** sequentially against **189M rows**. From event to alert took over **4 minutes** — long enough that an alert was a record of something that had already finished happening.',
      'Every new integration was also written by hand, so the cost of connecting another source was another codebase to keep.',
    ),
    whatIDid: pt(
      'Built an event processing platform in Go on GCP that handles millions of events a day. The design is borrowed from NiFi: every integration is a configurable graph of processors, so a new source is assembled rather than written.',
      'While tracing the data path, found and accounted for BigQuery spend that no team owned.',
    ),
    impact: pt(
      'Alerts now fire in **seconds** rather than over four minutes.',
      'Roughly **$7.5k a month** of unaccounted BigQuery spend traced and removed.',
    ),
  },
  {
    _id: 'project-agentic',
    title: 'Agentic Workflow Builder',
    slug: 'agentic-workflow-builder',
    organisation: 'Techlabs Global',
    period: '2025 to present',
    featured: false,
    order: 2,
    stack: ['Vertex AI', 'Gemini', 'RAG', 'Go', 'GCP'],
    problem: pt(
      'Building a workflow on the platform meant assembling it in a visual DAG editor — an engineering tool, in the hands of the business users who knew what the workflow should do.',
    ),
    whatIDid: pt(
      'A RAG and agentic layer on Vertex AI and Gemini, grounded in the platform’s live processor registry so the model answers from what the platform can actually do rather than from what it has read.',
    ),
    impact: pt(
      'Business users describe a workflow in natural language instead of drawing it.',
    ),
  },
  {
    _id: 'project-backoffice',
    title: 'B2B Back Office Platform',
    slug: 'b2b-back-office-platform',
    organisation: 'Techlabs Global',
    period: '2025 to present',
    featured: false,
    order: 3,
    stack: [
      'Spring Boot',
      'gRPC',
      'React',
      'TypeScript',
      'Node.js',
      'PostgreSQL',
      'BigQuery',
      'Redis',
      'Cloud Run',
      'Pub/Sub',
    ],
    problem: pt(
      'Betting vendors needed their own reporting: daily turnover, gross margin, the top winning and losing bettors and events, and player profiles.',
    ),
    whatIDid: pt(
      'Selected the stack and built the platform, choosing gRPC over REST on the paths where latency mattered.',
    ),
    // TODO(madushan): add the adoption or performance numbers here if you have them.
    impact: pt(
      'Vendors read the day’s turnover, margin and player profiles from one place.',
    ),
  },
  {
    _id: 'project-visa-flex',
    title: 'Visa Flexible Credentials',
    slug: 'visa-flexible-credentials',
    organisation: 'Visa Inc, Singapore',
    period: '2023 to 2025',
    featured: true,
    order: 4,
    stack: [
      'Java',
      'Spring Boot',
      'Kafka',
      'Kafka Admin API',
      'Prometheus',
      'Grafana',
      'MongoDB',
    ],
    productUrl: 'https://visa.com/en-us/products/flex-credential',
    productName: 'Visa Flexible Credentials',
    problem: pt(
      'Payment acknowledgements travelled over TCP socket connections carrying raw byte streams. The connections were unreliable, and the traffic was **40M transactions a day** against a **5-second SLA**.',
    ),
    whatIDid: pt(
      'Architected a Kafka-driven acknowledgement system to replace the sockets.',
      'Built observability for it directly on the Kafka Admin API, surfacing consumption per partition through Prometheus and Grafana — so a lagging partition is visible before it becomes a breached SLA.',
    ),
    impact: pt(
      'Acknowledgements for **40M transactions a day** now run over Kafka rather than raw sockets, inside the **5-second** SLA, with per-partition consumption visible while it happens.',
    ),
  },
  {
    _id: 'project-genie',
    title: 'Genie',
    slug: 'genie',
    organisation: 'Axiata Digital Labs',
    period: '2019',
    featured: false,
    order: 5,
    stack: ['Java', 'Spring MVC', 'Oracle 12g', 'PL/SQL', 'Mastercard MPGS'],
    productUrl: 'https://genie.lk/genie-services',
    productName: 'Genie',
    problem: pt(
      'A national digital wallet has to take card payments, which means card data, which means PCI-DSS.',
    ),
    whatIDid: pt(
      'Integrated Mastercard MPGS with **AES-256** encryption of card data.',
      'Led the Lanka QR payments integration into the PickMe taxi app.',
    ),
    impact: pt('Genie shipped as a PCI-DSS certified digital wallet.'),
  },
  {
    _id: 'project-core-enterprise',
    title: 'Core Enterprise Services',
    slug: 'core-enterprise-services',
    organisation: 'Sysco LABS',
    period: '2022 to 2023',
    featured: false,
    order: 6,
    stack: [
      'Java 17',
      'Spring Boot',
      'Confluent Kafka',
      'AWS Kinesis',
      'ECS Fargate',
      'Aurora PostgreSQL',
    ],
    productUrl: 'https://shop.sysco.com',
    productName: 'shop.sysco.com',
    problem: pt(
      'Active data still lived on a legacy AS400 database, and the streaming layer ran on Amazon Kinesis — which tied it to one cloud.',
    ),
    whatIDid: pt(
      'Moved active data onto PostgreSQL using change data capture, so the legacy system stayed authoritative until it did not need to be.',
      'Migrated the streaming layer from Amazon Kinesis to Confluent Kafka.',
    ),
    impact: pt(
      'Active data served from PostgreSQL, and a streaming layer that is no longer bound to a single cloud.',
    ),
  },
  {
    _id: 'project-wiley-bpm',
    title: 'Book Publication Automation',
    slug: 'book-publication-automation',
    organisation: 'John Wiley & Sons',
    period: '2019 to 2022',
    featured: false,
    order: 7,
    stack: ['Java 11', 'Flowable BPMN', 'Spring Boot', 'TIBCO EMS', 'Spring JMS', 'MySQL'],
    problem: pt(
      'Publishing a book or an article moves through many steps across several systems, and the record of what had happened lived in each of them separately.',
    ),
    whatIDid: pt(
      'Modelled publication as a Flowable BPMN workflow, with asynchronous message-driven integration between the systems it touches.',
    ),
    impact: pt('An audit trail at every step of publication.'),
  },
  {
    _id: 'project-threat-modelling',
    title: 'Threat Modelling Platform',
    slug: 'threat-modelling-platform',
    organisation: 'Virtusa, for Dell SecureWorks',
    period: '2015 to 2019',
    featured: false,
    order: 8,
    stack: ['Java', 'Angular', 'Python', 'Ansible', 'MySQL'],
    problem: pt(
      'Vulnerability data arrived from Splunk, Fortinet, Palo Alto Networks and CrowdStrike, each describing the same threats in its own shape.',
    ),
    whatIDid: pt(
      'Built a threat intelligence ontology that normalises all four into a single queryable model.',
    ),
    impact: pt('One model to query, rather than four vendors to reconcile.'),
  },
]
