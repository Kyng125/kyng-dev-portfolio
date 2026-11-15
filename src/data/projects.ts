export type Evidence = 'live' | 'verified' | 'written'

export interface StatusItem {
  state: Evidence
  label: string
  note: string
}

export interface Stage {
  name: string
  detail: string
}

export interface CaseFile {
  id: 'aquasense' | 'pocket' | 'cloudlearn' | 'wifiguard'
  name: string
  field: string
  summary: string
  problem: string
  stack: string[]
  stages: Stage[]
  decisions: { title: string; why: string }[]
  verified: { text: string; proof: 'verified' | 'written' | 'not-verified' }[]
  status: StatusItem
  github: {
    repo: string
    url: string
    blurb: string
    private?: boolean
    langs: { name: string; pct: number; tone: 'blue' | 'silver' | 'gold' | 'white' }[]
    commit: { hash: string; message: string; when: string }
  }
  notion: { title: string; url: string; notes: string[] }
  live: { host: string; url: string; caption: string }
}

export const projects: CaseFile[] = [
  {
    id: 'aquasense',
    name: 'AquaSense',
    field: 'IoT and water monitoring',
    summary:
      'A water tank monitor that reports from an ESP32 sensor to a hosted dashboard, with alerts and a level trend.',
    problem:
      'People who rely on a rooftop tank usually find out it is empty when the tap runs dry. AquaSense reads the level at the tank, sends reports to a server, and shows staff the level, the trend and any alert in one place.',
    stack: ['ESP32 + HC-SR04', 'Express', 'Postgres', 'React 19'],
    stages: [
      { name: 'Sensor', detail: 'An ESP32 with an ultrasonic sensor reads the level and posts a report.' },
      { name: 'Ingest API', detail: 'Validates each report and decides whether it is worth storing.' },
      { name: 'Postgres', detail: 'Keeps readings, device status and alert history.' },
      { name: 'Dashboard', detail: 'Passcode-protected view of level, trend and alerts.' },
    ],
    decisions: [
      {
        title: 'Write-throttled ingest',
        why: 'A tank changes slowly. Storing only meaningful changes plus a heartbeat keeps a free database inside its limits.',
      },
      {
        title: 'Separate device status reports',
        why: 'Silence from a sensor has to mean something. Periodic status reports tell a dead device apart from a steady tank.',
      },
      {
        title: 'Staff passcode on the dashboard',
        why: 'The smallest access control that fits a small deployment, without building a full account system.',
      },
    ],
    verified: [
      { text: 'Hosted API and dashboard are live, and passcode sign-in works.', proof: 'verified' },
      { text: '125 reports from the device emulator were received and shown as level, alert and trend.', proof: 'verified' },
      { text: 'Firmware is written, tested on a PC and compiled for the real chip, but has not run on a physical board.', proof: 'not-verified' },
    ],
    status: { state: 'live', label: 'AquaSense', note: '125 emulator reports in. Hardware not yet tested.' },
    github: {
      repo: 'Kyng125/aquasense',
      url: 'https://github.com/Kyng125/aquasense',
      blurb: 'Smart water tank monitoring: ESP32 firmware, Express ingest API and React dashboard.',
      private: true,
      langs: [
        { name: 'TypeScript', pct: 62, tone: 'blue' },
        { name: 'CSS', pct: 14, tone: 'silver' },
        { name: 'JavaScript', pct: 13, tone: 'gold' },
        { name: 'C++', pct: 6, tone: 'white' },
        { name: 'Other', pct: 5, tone: 'silver' },
      ],
      commit: { hash: '7400352', message: 'Brand favicon and remove Figma Make metadata', when: 'latest commit' },
    },
    notion: {
      title: 'AquaSense build log',
      url: 'https://notion.so/kyng/aquasense-build-log',
      notes: [
        'Phase gates: each phase ended with a verification report.',
        'Why the database writes are throttled.',
        'What changes when the sensor moves from emulator to hardware.',
      ],
    },
    live: { host: 'aquasense.example.app', url: 'https://aquasense.example.app', caption: 'Dashboard, level and trend' },
  },
  {
    id: 'pocket',
    name: 'Pocket Cloud',
    field: 'Offline-first collaboration',
    summary:
      'A collaboration app that keeps working with no connection and reconciles through a nearby lab node when it returns.',
    problem:
      'In a lab with unreliable internet, shared files and notes stop being shared. Pocket Cloud lets every device keep editing locally, then merges changes through one local node, and shows people exactly where two edits collided.',
    stack: ['React PWA', 'TypeScript', 'Fastify', 'SQLite', 'IndexedDB'],
    stages: [
      { name: 'Device', detail: 'Local-first store. Every edit works offline and is queued.' },
      { name: 'Sync engine', detail: 'Version vectors say what each side has seen.' },
      { name: 'Lab node', detail: 'One local hub that devices sync to, not to each other.' },
      { name: 'Conflict view', detail: 'Last-write-wins by default, with collisions made visible.' },
    ],
    decisions: [
      {
        title: 'Hub and node, not peer to peer',
        why: 'One lab node is easier to reason about, secure and demonstrate than a mesh, and it matches how a lab is actually set up.',
      },
      {
        title: 'Version vectors with last-write-wins',
        why: 'Vectors detect real concurrency. A simple, predictable rule resolves it, and the interface shows what was overwritten.',
      },
      {
        title: 'A PWA instead of a native app',
        why: 'It installs on phones and laptops from one codebase, and the service worker is what makes offline use possible.',
      },
    ],
    verified: [
      { text: '79 unit, API and sync-engine tests pass on the node server, client engine and shared core.', proof: 'verified' },
      { text: 'Five real-browser tests exercise the offline and sync flows.', proof: 'written' },
      { text: 'Scoped to a single lab node. Multi-node sync is out of scope.', proof: 'written' },
    ],
    status: { state: 'verified', label: 'Pocket Cloud', note: '79 tests plus real-browser tests.' },
    github: {
      repo: 'Kyng125/pocket-cloud',
      url: 'https://github.com/Kyng125/pocket-cloud',
      blurb: 'Offline-first lab collaboration: React PWA, Fastify lab node, version vectors and a conflict view.',
      langs: [
        { name: 'TypeScript', pct: 97, tone: 'blue' },
        { name: 'CSS', pct: 1, tone: 'silver' },
        { name: 'Other', pct: 2, tone: 'white' },
      ],
      commit: { hash: '089e8c1', message: 'pocket cloud v1 complete', when: 'latest commit' },
    },
    notion: {
      title: 'Sync design notes',
      url: 'https://notion.so/kyng/pocket-cloud-sync-notes',
      notes: [
        'How version vectors tell concurrent edits from ordered ones.',
        'Why last-write-wins is enough for this scope.',
        'What the conflict screen shows and why.',
      ],
    },
    live: { host: 'pocketcloud.example.app', url: 'https://pocketcloud.example.app', caption: 'Sync center' },
  },
  {
    id: 'cloudlearn',
    name: 'CloudLearn',
    field: 'Education platform',
    summary:
      'A hybrid-learning platform with courses, graded submissions and timed quizzes, split cleanly by role.',
    problem:
      'Hybrid classes need one place for materials, assignments and assessment. CloudLearn gives students, instructors and admins separate permissions, and keeps quiz timing on the server where a student cannot change it.',
    stack: ['React 19', 'Express', 'SQLite', 'Role-based access'],
    stages: [
      { name: 'Student', detail: 'Self-registers, joins courses, submits work, takes quizzes.' },
      { name: 'API', detail: 'Checks the role on every request, not just in the interface.' },
      { name: 'Quiz clock', detail: 'The server owns the timer and rejects late answers.' },
      { name: 'Instructor and admin', detail: 'Grade work. Admins create and promote instructors.' },
    ],
    decisions: [
      {
        title: 'The server owns the quiz timer',
        why: 'A client-side countdown can be paused or edited. The server records the start and judges the deadline.',
      },
      {
        title: 'Students only can self-register',
        why: 'Instructor rights are powerful. Admins grant them, so nobody can sign themselves up as staff.',
      },
      {
        title: 'Submissions lock when graded',
        why: 'Students can replace work until grading starts. Once a grade exists, the record is fixed.',
      },
    ],
    verified: [
      { text: '19 of 19 smoke checks pass against the hosted app.', proof: 'verified' },
      { text: 'Backup download and restore upload are built.', proof: 'written' },
      { text: 'Sign-in bursts are slower by design, so class quiz starts are staggered.', proof: 'written' },
    ],
    status: { state: 'live', label: 'CloudLearn', note: 'Live. 19 of 19 smoke checks.' },
    github: {
      repo: 'Kyng125/cloudlearn',
      url: 'https://github.com/Kyng125/cloudlearn',
      blurb: 'Hybrid learning platform with role-based access and server-timed quizzes.',
      langs: [
        { name: 'TypeScript', pct: 53, tone: 'blue' },
        { name: 'JavaScript', pct: 43, tone: 'gold' },
        { name: 'Other', pct: 4, tone: 'white' },
      ],
      commit: { hash: '35b8485', message: 'fix demo panel', when: 'latest commit' },
    },
    notion: {
      title: 'Phase reports',
      url: 'https://notion.so/kyng/cloudlearn-phase-reports',
      notes: [
        'Seven phases, each closed with a verification report.',
        'The permissions matrix: who can do what.',
        'Error handling beyond wrong passwords and bad files.',
      ],
    },
    live: { host: 'cloudlearn.example.app', url: 'https://cloudlearn.example.app', caption: 'Quiz in progress' },
  },
  {
    id: 'wifiguard',
    name: 'WiFiGuard',
    field: 'Network security',
    summary:
      'A wireless intrusion detection dashboard that applies four detection rules to captured traffic and raises alerts.',
    problem:
      'Small organisations rarely see unrecognised access points or attacks on their own wireless network. WiFiGuard processes wireless frames, applies detection rules, and shows alerts with the evidence behind them.',
    stack: ['Flask JSON API', 'SQLite', 'React dashboard', 'Replay engine'],
    stages: [
      { name: 'Capture or replay', detail: 'Frames come from a recorded file, so no wireless adapter is needed.' },
      { name: 'Packet processor', detail: 'Normalises frames into events.' },
      { name: 'Four rules', detail: 'Each rule is tuned and explained, not a black box.' },
      { name: 'Alerts and reports', detail: 'Alert history plus a test-run log with computed metrics.' },
    ],
    decisions: [
      {
        title: 'Portable replay instead of live capture first',
        why: 'The system has to run on any laptop, adapter or not. Live capture stays as a documented backup plan.',
      },
      {
        title: 'Rules over a model',
        why: 'Every alert can be traced to a rule and its threshold, which is what a reviewer needs to trust it.',
      },
      {
        title: 'Hardened for real hosting',
        why: 'TLS, secure cookies, a login throttle that survives restarts and proper secret handling.',
      },
    ],
    verified: [
      { text: 'Detection runs in replay mode, with evaluation tooling for test runs.', proof: 'verified' },
      { text: 'Backup, restore and upgrade paths are written.', proof: 'written' },
      { text: 'Live over-the-air capture has not been exercised.', proof: 'not-verified' },
    ],
    status: { state: 'live', label: 'WiFiGuard', note: 'Running in replay mode. Live capture not tested.' },
    github: {
      repo: 'Kyng125/wifiguard',
      url: 'https://github.com/Kyng125/wifiguard',
      blurb: 'Flask and SQLite wireless IDS with a four-rule detection engine, replay mode and an alert dashboard.',
      langs: [
        { name: 'Python', pct: 97, tone: 'gold' },
        { name: 'SQL', pct: 2, tone: 'blue' },
        { name: 'Other', pct: 1, tone: 'white' },
      ],
      commit: { hash: '62c946e', message: 'first commit', when: 'latest commit' },
    },
    notion: {
      title: 'Operation guide',
      url: 'https://notion.so/kyng/wifiguard-operation-guide',
      notes: [
        'How to trigger each attack in a test run.',
        'How to tune a rule and why detection works.',
        'Setup notes for moving between laptops.',
      ],
    },
    live: { host: 'wifiguard.example.app', url: 'https://wifiguard.example.app', caption: 'Alerts' },
  },
]

export interface OtherWork {
  repo?: { name: string; url: string; private?: boolean }
  name: string
  field: string
  what: string
  state: string
}

export const others: OtherWork[] = [
  { repo: { name: 'Kyng125/bimba-mvp', url: 'https://github.com/Kyng125/bimba-mvp', private: true }, name: 'Bimba', field: 'Fintech', what: 'Mobile app for gift card and crypto conversion with NGN withdrawals, built around a strict transaction state machine.', state: 'System design complete' },
  { repo: { name: 'Kyng125/nexus-intelligence', url: 'https://github.com/Kyng125/nexus-intelligence' }, name: 'NEXUS', field: 'Web3', what: 'Intelligence platform front end with a WebGL hero, a live signal feed and an assistant interface.', state: 'Front end delivered' },
  { repo: { name: 'Kyng125/flowai-studio', url: 'https://github.com/Kyng125/flowai-studio' }, name: 'FlowAI Studio', field: 'SaaS', what: 'Next.js dashboard with typed services, analytics, task management and live theming.', state: 'Build delivered' },
  { repo: { name: 'Kyng125/nova-studio', url: 'https://github.com/Kyng125/nova-studio' }, name: 'Nova Studio', field: 'Marketing', what: 'Conversion-focused Next.js marketing site with a content layer and SEO groundwork.', state: 'Build delivered' },
  { name: 'eko360 upgrade', field: 'Public data', what: 'Upgrade proposal for the Lagos Bureau of Statistics platform.', state: 'Proposal written' },
  { repo: { name: 'Kyng125/netwatch', url: 'https://github.com/Kyng125/netwatch' }, name: 'Netwatch', field: 'Network monitoring', what: 'Cloud network monitor for a small organisation, with real public targets and simulated devices.', state: 'Hosting files written' },
]

export const statusStrip: StatusItem[] = [
  ...projects.map((p) => p.status),
]
