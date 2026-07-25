/**
 * Track 6 — SOC Analyst: Zero to Hired.
 *
 * The registry is deliberately separate from the MDX content. Steps that have
 * been written exist as files; steps that haven't still appear on the map with
 * their brief, resources and cost. That way the roadmap is complete and honest
 * from day one, and authoring is just filling in the gaps rather than
 * redesigning the plan every time.
 */

export const PHASES = {
  0: {
    name: 'Orientation',
    icon: '◎',
    weeks: 'Week 1',
    blurb:
      'Find out exactly where you stand and what the job actually involves before spending a single hour studying the wrong thing.',
  },
  1: {
    name: 'Foundations',
    icon: '▦',
    weeks: 'Weeks 2–7',
    blurb:
      'Networking, Windows, Linux and Active Directory. The part CEH skipped and every interview probes.',
  },
  2: {
    name: 'Defensive Core',
    icon: '◈',
    weeks: 'Weeks 6–12',
    blurb:
      'The incident lifecycle, ATT&CK as a working tool, logging architecture and why false positives are the actual job.',
  },
  3: {
    name: 'Microsoft & KQL',
    icon: '⌘',
    weeks: 'Weeks 10–18',
    blurb:
      'Sentinel, Defender XDR and query fluency. Highest hiring return of anything in this track.',
  },
  4: {
    name: 'Applied Triage',
    icon: '⚑',
    weeks: 'Weeks 16–24',
    blurb:
      'Phishing, endpoint, network and malware triage against real artifacts. Where studying becomes doing.',
  },
  5: {
    name: 'Lab & Detection Engineering',
    icon: '⚙',
    weeks: 'Weeks 8–30',
    blurb:
      'Runs in parallel with phases 2–4. Build the lab, attack it, detect the attack, tune the detection. This produces your portfolio.',
  },
  6: {
    name: 'BTL1 & Portfolio',
    icon: '◆',
    weeks: 'Weeks 24–34',
    blurb:
      'The credential that proves you can investigate, plus turning 30 weeks of work into public evidence.',
  },
  7: {
    name: 'Job Campaign',
    icon: '➤',
    weeks: 'Weeks 28–42',
    blurb:
      'CV, LinkedIn, interview drills, the career-change narrative, and a tracked application campaign.',
  },
  8: {
    name: 'Sustain',
    icon: '∞',
    weeks: 'Ongoing',
    blurb:
      'The weekly rhythm that keeps you sharp while you apply, and keeps you employable once you land.',
  },
} as const;

export type PhaseId = keyof typeof PHASES;

export const PILLARS = {
  fundamentals: { label: 'Fundamentals', blurb: 'Networking, OS, AD, identity' },
  siem: { label: 'SIEM & Query', blurb: 'Sentinel, KQL, Defender, hunting' },
  triage: { label: 'Triage', blurb: 'Alerts, phishing, endpoint, malware, network' },
  evidence: { label: 'Lab Evidence', blurb: 'Built, attacked, detected, written up' },
  interview: { label: 'Interview', blurb: 'CV, narrative, drills, applications' },
} as const;

export type PillarId = keyof typeof PILLARS;

export const KIND_ICON = {
  learn: '▸',
  lab: '⚙',
  exam: '◆',
  writing: '✎',
  campaign: '➤',
} as const;

/**
 * The complete step map. `id` matches the MDX slug when the step is written.
 * Unwritten steps still render on the roadmap with their brief and cost, so
 * the plan is legible end to end from the first day.
 */
export interface PlannedStep {
  id: string;
  title: string;
  phase: PhaseId;
  weeks: string;
  pillar: PillarId;
  kind: keyof typeof KIND_ICON;
  cost: number;
  brief: string;
}

export const ROADMAP: PlannedStep[] = [
  // ── Phase 0 ────────────────────────────────────────────────────────
  { id: '00-orientation/01-baseline', title: 'Baseline Assessment', phase: 0, weeks: 'Week 1', pillar: 'fundamentals', kind: 'learn', cost: 0, brief: 'Diagnostic across all five pillars. Produces your personalised starting point and tells you what to skip.' },
  { id: '00-orientation/02-the-job', title: 'What Tier 1 Actually Does', phase: 0, weeks: 'Week 1', pillar: 'interview', kind: 'learn', cost: 0, brief: 'The UK SOC market, the shift-work reality, and five real job specs pulled apart line by line.' },

  // ── Phase 1 ────────────────────────────────────────────────────────
  { id: '01-foundations/01-networking', title: 'Networking for Defenders', phase: 1, weeks: 'Weeks 2–3', pillar: 'fundamentals', kind: 'learn', cost: 0, brief: 'TCP/IP, the handshake, the ports you must know cold, DNS, DHCP, NAT, VLANs — read through Wireshark, not slides.' },
  { id: '01-foundations/02-windows-internals', title: 'Windows Internals for Analysts', phase: 1, weeks: 'Week 3', pillar: 'fundamentals', kind: 'learn', cost: 0, brief: 'Processes, tokens, services, registry, LSASS and the event log architecture that everything else sits on.' },
  { id: '01-foundations/03-event-ids', title: 'The Event IDs That Matter', phase: 1, weeks: 'Week 4', pillar: 'fundamentals', kind: 'learn', cost: 0, brief: '4624/4625/4648/4672/4688/4720/7045 and the Sysmon set — what each proves and what it does not.' },
  { id: '01-foundations/04-active-directory', title: 'Active Directory & Authentication', phase: 1, weeks: 'Weeks 5–6', pillar: 'fundamentals', kind: 'learn', cost: 0, brief: 'Kerberos vs NTLM end to end, DCs, GPO, and why AD is the thing every intrusion is ultimately aiming at.' },
  { id: '01-foundations/05-linux', title: 'Linux for Analysts', phase: 1, weeks: 'Week 6', pillar: 'fundamentals', kind: 'learn', cost: 0, brief: 'auth.log, journald, cron and systemd persistence, and the triage one-liners you will actually type.' },
  { id: '01-foundations/06-cloud-identity', title: 'Cloud & Identity Basics', phase: 1, weeks: 'Week 7', pillar: 'fundamentals', kind: 'learn', cost: 0, brief: 'Entra ID, sign-in logs, conditional access, token theft and OAuth consent abuse.' },

  // ── Phase 2 ────────────────────────────────────────────────────────
  { id: '02-defensive-core/01-ir-lifecycle', title: 'The Incident Response Lifecycle', phase: 2, weeks: 'Weeks 6–7', pillar: 'triage', kind: 'learn', cost: 0, brief: 'NIST 800-61 as a working process: containment vs eradication, and exactly when a Tier 1 escalates.' },
  { id: '02-defensive-core/02-attack-framework', title: 'MITRE ATT&CK as a Tool', phase: 2, weeks: 'Week 8', pillar: 'triage', kind: 'learn', cost: 0, brief: 'Not the poster. Tactic vs technique vs procedure, and mapping a real intrusion report end to end.' },
  { id: '02-defensive-core/03-logging-architecture', title: 'Logging & Telemetry Architecture', phase: 2, weeks: 'Week 9', pillar: 'siem', kind: 'learn', cost: 0, brief: 'Sources, collection, normalisation, retention — and how to spot a blind spot before an attacker does.' },
  { id: '02-defensive-core/04-siem-concepts', title: 'SIEM Concepts & Alert Fatigue', phase: 2, weeks: 'Weeks 10–11', pillar: 'siem', kind: 'learn', cost: 0, brief: 'Correlation, use cases, tuning. Why the job is mostly false positives and what good tuning looks like.' },
  { id: '02-defensive-core/05-pyramid-of-pain', title: 'Pyramid of Pain & Detection Strategy', phase: 2, weeks: 'Week 12', pillar: 'triage', kind: 'learn', cost: 0, brief: 'Why hashes are worthless, behaviours are expensive, and where to aim your detections.' },

  // ── Phase 3 ────────────────────────────────────────────────────────
  { id: '03-microsoft-kql/01-sentinel-architecture', title: 'Sentinel Architecture', phase: 3, weeks: 'Weeks 10–11', pillar: 'siem', kind: 'learn', cost: 0, brief: 'Workspaces, data connectors, analytics rules, incidents, watchlists — the mental model before the syntax.' },
  { id: '03-microsoft-kql/02-kql-fundamentals', title: 'KQL Fundamentals', phase: 3, weeks: 'Weeks 12–13', pillar: 'siem', kind: 'learn', cost: 0, brief: 'where, project, summarize, extend, join. Written as query challenges, not reading.' },
  { id: '03-microsoft-kql/03-kql-hunting', title: 'KQL for Threat Hunting', phase: 3, weeks: 'Weeks 14–15', pillar: 'siem', kind: 'learn', cost: 0, brief: 'Time series, bin, arg_max, anomaly detection, cross-table joins. The queries that find what rules missed.' },
  { id: '03-microsoft-kql/04-defender-xdr', title: 'Defender XDR & Advanced Hunting', phase: 3, weeks: 'Weeks 16–17', pillar: 'siem', kind: 'learn', cost: 0, brief: 'Defender for Endpoint, Identity, Office 365 and Cloud Apps — and the hunting tables behind each.' },
  { id: '03-microsoft-kql/05-sc200-exam', title: 'SC-200 Exam Sprint', phase: 3, weeks: 'Week 18', pillar: 'siem', kind: 'exam', cost: 165, brief: 'Objective sweep, practice assessment, book and sit it. Check Virtual Training Days for a voucher first.' },

  // ── Phase 4 ────────────────────────────────────────────────────────
  { id: '04-applied-triage/01-phishing', title: 'Phishing Analysis', phase: 4, weeks: 'Weeks 16–17', pillar: 'triage', kind: 'learn', cost: 0, brief: 'Full header dissection, SPF/DKIM/DMARC, URL and attachment detonation, and the user-report workflow.' },
  { id: '04-applied-triage/02-endpoint', title: 'Endpoint Triage', phase: 4, weeks: 'Weeks 18–19', pillar: 'triage', kind: 'learn', cost: 0, brief: 'Process trees, encoded PowerShell, LOLBins, persistence hunting, and deciding isolate-or-not.' },
  { id: '04-applied-triage/03-network', title: 'Network Triage & pcap', phase: 4, weeks: 'Week 20', pillar: 'triage', kind: 'learn', cost: 0, brief: 'Beaconing, DNS tunnelling, C2 patterns and JA3/JA4 — found in real captures.' },
  { id: '04-applied-triage/04-malware', title: 'Malware Triage', phase: 4, weeks: 'Week 21', pillar: 'triage', kind: 'learn', cost: 0, brief: 'Static triage, strings, sandbox report reading, and knowing precisely when to stop and escalate.' },
  { id: '04-applied-triage/05-log-analysis', title: 'Log Analysis Under Pressure', phase: 4, weeks: 'Weeks 22–23', pillar: 'triage', kind: 'learn', cost: 0, brief: 'Brute force, password spray, impossible travel, lateral movement — the five alerts you will see most.' },
  { id: '04-applied-triage/06-report-writing', title: 'Writing the Investigation Report', phase: 4, weeks: 'Week 24', pillar: 'interview', kind: 'writing', cost: 0, brief: 'The skill that separates hired from not. Structure, tone, and an executive summary that survives contact.' },

  // ── Phase 5 ────────────────────────────────────────────────────────
  { id: '05-lab/01-build-detection-lab', title: 'Build the Detection Lab', phase: 5, weeks: 'Weeks 8–10', pillar: 'evidence', kind: 'lab', cost: 0, brief: 'Windows VM + Sysmon into Sentinel free tier, on the M5 and the Pi router network you already have.' },
  { id: '05-lab/02-attack-simulation', title: 'Attack Simulation', phase: 5, weeks: 'Weeks 14–16', pillar: 'evidence', kind: 'lab', cost: 0, brief: 'Atomic Red Team mapped to ATT&CK. Fire techniques, capture what telemetry they actually produce.' },
  { id: '05-lab/03-write-detections', title: 'Write Detections', phase: 5, weeks: 'Weeks 18–22', pillar: 'evidence', kind: 'lab', cost: 0, brief: 'Analytics rules in KQL, then the part everyone skips: tune out the false positives and prove it.' },
  { id: '05-lab/04-sigma', title: 'Sigma Rules', phase: 5, weeks: 'Weeks 24–26', pillar: 'evidence', kind: 'lab', cost: 0, brief: 'Portable detection format, conversion to backend queries, and contributing one upstream.' },
  { id: '05-lab/05-soar-automation', title: 'SOAR & Automation', phase: 5, weeks: 'Weeks 28–30', pillar: 'evidence', kind: 'lab', cost: 0, brief: 'Logic Apps enrichment playbooks. Ties directly into your existing Detection Engineering course.' },

  // ── Phase 6 ────────────────────────────────────────────────────────
  { id: '06-btl1-portfolio/01-btl1-prep', title: 'BTL1 Preparation', phase: 6, weeks: 'Weeks 24–30', pillar: 'triage', kind: 'learn', cost: 0, brief: 'Domain-by-domain readiness check against everything phases 1–5 already covered.' },
  { id: '06-btl1-portfolio/02-btl1-exam', title: 'BTL1 Exam', phase: 6, weeks: 'Weeks 31–32', pillar: 'triage', kind: 'exam', cost: 399, brief: 'The 24-hour practical investigation. Wait for a seasonal discount before buying.' },
  { id: '06-btl1-portfolio/03-portfolio', title: 'Build the Public Portfolio', phase: 6, weeks: 'Weeks 32–34', pillar: 'evidence', kind: 'writing', cost: 0, brief: 'GitHub Pages site, detection repo, and the four write-ups assembled into something a recruiter can skim.' },

  // ── Phase 7 ────────────────────────────────────────────────────────
  { id: '07-campaign/01-cv', title: 'The CV', phase: 7, weeks: 'Week 28', pillar: 'interview', kind: 'campaign', cost: 0, brief: 'Projects above work history. Injection moulding rewritten in SOC language without a word of spin.' },
  { id: '07-campaign/02-linkedin', title: 'LinkedIn & Visibility', phase: 7, weeks: 'Week 29', pillar: 'interview', kind: 'campaign', cost: 0, brief: 'Profile rebuild, and a posting rhythm that gets you known by UK cyber people rather than lurking.' },
  { id: '07-campaign/03-technical-drills', title: 'Technical Interview Drills', phase: 7, weeks: 'Weeks 30–36', pillar: 'interview', kind: 'campaign', cost: 0, brief: '120 questions in timed mock-interview mode. Spoken aloud, self-rated, repeated until fluent.' },
  { id: '07-campaign/04-narrative', title: 'The Career-Change Narrative', phase: 7, weeks: 'Week 31', pillar: 'interview', kind: 'campaign', cost: 0, brief: 'Your STAR bank, built from lab work and years of shift-floor problem solving.' },
  { id: '07-campaign/05-applications', title: 'The Application Campaign', phase: 7, weeks: 'Weeks 32–42', pillar: 'interview', kind: 'campaign', cost: 0, brief: 'Target list, tracker, follow-up cadence, and a rejection process that does not derail you.' },

  // ── Phase 8 ────────────────────────────────────────────────────────
  { id: '08-sustain/01-weekly-rhythm', title: 'The Weekly Rhythm', phase: 8, weeks: 'Ongoing', pillar: 'evidence', kind: 'learn', cost: 0, brief: 'One DFIR Report, one challenge, one detection, one application batch. Every week, indefinitely.' },
];

export const TOTAL_COST = ROADMAP.reduce((sum, s) => sum + s.cost, 0);

export function stepsByPhase(phase: PhaseId): PlannedStep[] {
  return ROADMAP.filter((s) => s.phase === phase);
}
