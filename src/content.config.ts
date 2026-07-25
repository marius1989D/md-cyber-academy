import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The depth ladder. Every module declares the highest rung it reaches.
 * This is the pedagogical spine of the platform, so it lives in the schema
 * rather than in prose — it can be filtered, charted and gap-analysed.
 *
 *   1 concept  — what it is
 *   2 applied  — the commands, configs and syntax that actually work
 *   3 analysis — here is an artifact, diagnose it
 *   4 lab      — do it in the range, produce evidence
 */
export const RUNGS = {
  1: { label: 'Concept', blurb: 'Definitions and mental models' },
  2: { label: 'Applied', blurb: 'Working commands, configs and syntax' },
  3: { label: 'Analysis', blurb: 'Diagnose a real artifact' },
  4: { label: 'Lab', blurb: 'Hands-on in the cyber range' },
} as const;

export type Rung = keyof typeof RUNGS;

const modules = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/modules' }),
  schema: z.object({
    title: z.string(),
    course: z.enum([
      'ceh',
      'network',
      'ai-security',
      'detection',
      'secai',
      'forensics',
    ]),
    /** Ordering within the course. Use 0 for a foundations/ethics module. */
    order: z.number(),
    /** One line shown on course and home cards. Write it as a promise, not a topic. */
    summary: z.string(),
    /** Highest rung this module reaches. */
    rung: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    /** Realistic working time including the quiz, in minutes. */
    minutes: z.number(),
    /** MITRE ATT&CK technique IDs, e.g. T1003.001. Powers the coverage heatmap. */
    attack: z.array(z.string()).default([]),
    /** MITRE ATLAS IDs for the AI security material, e.g. AML.T0051. */
    atlas: z.array(z.string()).default([]),
    /** Certification objective refs, e.g. "CY0-001 2.4" or "CEH v13 M06". */
    objectives: z.array(z.string()).default([]),
    /** Free-text tags for search and cross-linking. */
    tags: z.array(z.string()).default([]),
    /** Set false to keep a work-in-progress module out of the build. */
    published: z.boolean().default(true),
    updated: z.coerce.date().optional(),
  }),
});

/**
 * Track 6 — SOC Analyst: Zero to Hired.
 *
 * A deliberately separate collection from `modules`. Courses are subject-matter
 * libraries you dip into; a track is a sequenced campaign with gates, costs,
 * deliverables and a finish line (an offer). Mixing the two would force one
 * schema to serve two very different jobs.
 */
const track = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/track' }),
  schema: z.object({
    title: z.string(),
    /** 0–8. See PHASES below. */
    phase: z.number(),
    /** Ordering within the phase. */
    order: z.number(),
    summary: z.string(),
    /** Indicative calendar position, e.g. "Weeks 2–3". Guidance, not a deadline. */
    weeks: z.string(),
    minutes: z.number(),
    /** What kind of work this step is — drives the icon and the dashboard split. */
    kind: z
      .enum(['learn', 'lab', 'exam', 'writing', 'campaign'])
      .default('learn'),
    /** Which readiness pillar this step feeds. */
    pillar: z.enum([
      'fundamentals',
      'siem',
      'triage',
      'evidence',
      'interview',
    ]),
    /** Real money required, in GBP. 0 for everything that can be done free. */
    cost: z.number().default(0),
    /** Step ids that should be finished first. */
    prereq: z.array(z.string()).default([]),
    /** Cross-links into the main course library, e.g. "ceh/06-system-hacking". */
    academy: z.array(z.string()).default([]),
    attack: z.array(z.string()).default([]),
    objectives: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    published: z.boolean().default(true),
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { modules, track };

/** Course registry. Adding a course means one entry here plus a content folder. */
export const COURSES = {
  ceh: {
    name: 'CEH v13 Full Certification Prep',
    icon: '🛡️',
    blurb:
      'The full offensive syllabus, rebuilt for operator depth rather than exam recall.',
  },
  network: {
    name: 'Network Security Fundamentals',
    icon: '🌐',
    blurb: 'Protocols, Active Directory and the traffic that gives an attacker away.',
  },
  'ai-security': {
    name: 'AI Security & LLM Red Teaming',
    icon: '🤖',
    blurb:
      'Attacking and defending model-backed systems: injection, agents, RAG and supply chain.',
  },
  detection: {
    name: 'Detection Engineering & SOAR',
    icon: '🔍',
    blurb: 'Writing rules that fire on real behaviour and stay quiet the rest of the time.',
  },
  secai: {
    name: 'CompTIA SecAI+ (CY0-001)',
    icon: '📘',
    blurb: 'Objective-mapped coverage with a weighted, timed exam simulator.',
  },
  forensics: {
    name: 'Incident Response & Forensics',
    icon: '🔬',
    blurb: 'Acquisition, timeline reconstruction and evidence that survives scrutiny.',
  },
} as const;

export type CourseId = keyof typeof COURSES;
