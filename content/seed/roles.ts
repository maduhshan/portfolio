import type { Role } from '@/lib/types'

/**
 * Career history, exactly as given. endDate null means the role is current —
 * the tenure rail draws that band open at the top.
 *
 * `highlights` carry the timeline: what was actually done, one line each. Only
 * the current role also gets a `summary`, because the rest do not need both.
 */
export const seedRoles: Role[] = [
  {
    _id: 'role-techlabs',
    company: 'Techlabs Global',
    companyUrl: 'https://sportserve.co',
    title: 'Senior Technical Lead',
    location: 'Colombo',
    startDate: '2025-06-01',
    endDate: null,
    summary: 'Embedded with Sportserve as technical lead on their data platform.',
    highlights: [
      'Leads a team of seven across backend, frontend, data warehousing and SRE',
      'Owns the design of a Go event processing platform on GCP end to end',
      'Selected the stack and built the B2B reporting application on Spring Boot, gRPC and React',
    ],
    order: 1,
  },
  {
    _id: 'role-visa',
    company: 'Visa Inc',
    companyUrl: 'https://visa.com.sg',
    title: 'Senior Software Consultant',
    location: 'Singapore',
    startDate: '2023-05-01',
    endDate: '2025-05-31',
    highlights: [
      'Architected the Kafka pipeline behind Visa Flexible Credentials',
      'Rebuilt message consumption off unreliable TCP socket connections',
      'Built custom observability on the Kafka Admin API with Prometheus and Grafana',
      'Team of four backend engineers and one QA',
    ],
    order: 2,
  },
  {
    _id: 'role-sysco',
    company: 'Sysco LABS',
    companyUrl: 'https://syscolabs.lk',
    title: 'Technical Lead',
    location: 'Sri Lanka',
    startDate: '2022-10-01',
    endDate: '2023-05-31',
    highlights: [
      'Led four developers and two QA moving active data off a legacy AS400 database onto PostgreSQL',
      'Migrated the streaming layer from Amazon Kinesis to Confluent Kafka for cloud portability',
      'Owned three Spring Boot microservices serving the e-commerce platform',
    ],
    order: 3,
  },
  {
    _id: 'role-wiley',
    company: 'John Wiley & Sons',
    companyUrl: 'https://wiley.com',
    title: 'Senior Engineer, then Technical Lead',
    location: 'Sri Lanka',
    startDate: '2019-11-01',
    endDate: '2022-10-31',
    highlights: [
      'Led the Sri Lanka offshore team of three developers and one QA',
      'Built BPMN process orchestration automating book and article publication',
      'Used Dynatrace for APM and performance work across the CMS platform',
    ],
    order: 4,
  },
  {
    _id: 'role-axiata',
    company: 'Axiata Digital Labs',
    companyUrl: 'https://axiatadigitallabs.com',
    title: 'Senior Software Engineer',
    location: 'Sri Lanka',
    startDate: '2019-02-01',
    endDate: '2019-10-31',
    highlights: [
      'Built the Mastercard MPGS gateway integration for a PCI-DSS certified digital wallet',
      'Led the Lanka QR payments integration into the PickMe taxi app end to end',
    ],
    order: 5,
  },
  {
    _id: 'role-virtusa',
    company: 'Virtusa',
    companyUrl: 'https://virtusa.com',
    title: 'Intern, then Engineer, then Senior Engineer',
    location: 'Sri Lanka',
    startDate: '2015-05-01',
    endDate: '2019-02-28',
    highlights: [
      'Client-facing delivery for MetLife and Dell SecureWorks',
      'Built a threat modelling platform in a team of six inside a 90-person programme',
      'Worked across Java, Angular, Python and Ansible',
    ],
    order: 6,
  },
]
