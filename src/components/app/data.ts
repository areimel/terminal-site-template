/**
 * Typed, persona-neutral fake data for the `/app` "MAINFRAME-7 operations console" demo.
 *
 * Pure data + pure math only (no `window`/`document` access), so this is safe to import
 * from Astro frontmatter (server, initial render) as well as from `<script>` tags (client,
 * for the health-check refresh and the ambient meter drift).
 */

export interface ProcessRow {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  mem: number;
  status: 'RUNNING' | 'SLEEPING' | 'STOPPED';
  started: string;
}

export interface ScheduledJob {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: 'scheduled' | 'running' | 'completed' | 'failed';
}

export interface RunningJob {
  id: string;
  name: string;
  /** 0-100, or `null` for an indeterminate `ProgressBar`. */
  progress: number | null;
}

export interface NodeInfo {
  id: string;
  region: string;
  cpu: number;
  mem: number;
  disk: number;
  status: 'OK' | 'WARN' | 'ERR';
}

export interface ConsoleStats {
  activeJobs: number;
  queueDepth: number;
  errorRate: number;
  errorDelta: number;
  p95Latency: number;
}

export const processes: ProcessRow[] = [
  { pid: 1024, name: 'sched-daemon', user: 'root', cpu: 1.8, mem: 64, status: 'RUNNING', started: '08:00:11' },
  { pid: 1102, name: 'api-gatewayd', user: 'svc-api', cpu: 14.2, mem: 512, status: 'RUNNING', started: '08:00:14' },
  { pid: 1187, name: 'index-worker', user: 'svc-ingest', cpu: 42.6, mem: 768, status: 'RUNNING', started: '08:01:02' },
  { pid: 1204, name: 'auth-broker', user: 'svc-auth', cpu: 3.1, mem: 128, status: 'RUNNING', started: '08:01:09' },
  { pid: 1231, name: 'cache-warmd', user: 'svc-cache', cpu: 0.6, mem: 96, status: 'SLEEPING', started: '08:02:40' },
  {
    pid: 1266,
    name: 'metrics-rollup',
    user: 'svc-metrics',
    cpu: 6.4,
    mem: 160,
    status: 'RUNNING',
    started: '08:03:02',
  },
  { pid: 1288, name: 'log-shipper', user: 'svc-logs', cpu: 2.3, mem: 88, status: 'RUNNING', started: '08:03:31' },
  { pid: 1310, name: 'backup-agent', user: 'root', cpu: 0.2, mem: 40, status: 'SLEEPING', started: '08:04:12' },
  { pid: 1345, name: 'sync-worker', user: 'svc-sync', cpu: 18.9, mem: 320, status: 'RUNNING', started: '08:05:50' },
  { pid: 1362, name: 'queue-runner', user: 'svc-queue', cpu: 9.7, mem: 210, status: 'RUNNING', started: '08:06:03' },
  { pid: 1401, name: 'webhookd', user: 'svc-hooks', cpu: 1.1, mem: 72, status: 'STOPPED', started: '07:40:22' },
  { pid: 1420, name: 'healthchkd', user: 'svc-ops', cpu: 0.4, mem: 32, status: 'RUNNING', started: '08:07:15' },
];

export const scheduledJobs: ScheduledJob[] = [
  {
    id: 'job-01',
    name: 'backup-nightly',
    schedule: '0 2 * * *',
    lastRun: 'today 02:00',
    nextRun: 'tomorrow 02:00',
    status: 'completed',
  },
  {
    id: 'job-02',
    name: 'index-rebuild',
    schedule: '*/30 * * * *',
    lastRun: '08:00',
    nextRun: '08:30',
    status: 'running',
  },
  {
    id: 'job-03',
    name: 'metrics-rollup',
    schedule: '*/5 * * * *',
    lastRun: '08:05',
    nextRun: '08:10',
    status: 'running',
  },
  {
    id: 'job-04',
    name: 'cache-warm',
    schedule: '0 * * * *',
    lastRun: '08:00',
    nextRun: '09:00',
    status: 'scheduled',
  },
  {
    id: 'job-05',
    name: 'report-export',
    schedule: '0 6 * * 1',
    lastRun: 'Mon 06:00',
    nextRun: 'next Mon 06:00',
    status: 'scheduled',
  },
  {
    id: 'job-06',
    name: 'session-gc',
    schedule: '*/15 * * * *',
    lastRun: '07:45',
    nextRun: '08:00',
    status: 'failed',
  },
  {
    id: 'job-07',
    name: 'audit-sync',
    schedule: '*/10 * * * *',
    lastRun: '08:00',
    nextRun: '08:10',
    status: 'running',
  },
];

export const runningJobs: RunningJob[] = [
  { id: 'job-02', name: 'index-rebuild', progress: 62 },
  { id: 'job-03', name: 'metrics-rollup', progress: 18 },
  { id: 'job-07', name: 'audit-sync', progress: null },
];

export const nodes: NodeInfo[] = [
  { id: 'node-01', region: 'sector-7a', cpu: 34, mem: 58, disk: 41, status: 'OK' },
  { id: 'node-02', region: 'sector-7a', cpu: 61, mem: 72, disk: 55, status: 'OK' },
  { id: 'node-03', region: 'sector-7b', cpu: 88, mem: 91, disk: 76, status: 'WARN' },
  { id: 'node-04', region: 'sector-7b', cpu: 22, mem: 44, disk: 38, status: 'OK' },
  { id: 'node-05', region: 'sector-9', cpu: 47, mem: 63, disk: 60, status: 'OK' },
];

export const stats: ConsoleStats = {
  activeJobs: 7,
  queueDepth: 23,
  errorRate: 0.42,
  errorDelta: -0.08,
  p95Latency: 184,
};

export const systemInfo: { key: string; value: string }[] = [
  { key: 'Cluster', value: 'MAINFRAME-7' },
  { key: 'Region', value: 'sector-7' },
  { key: 'Kernel', value: 'TERMOS 7.4.2' },
  { key: 'Nodes online', value: `${nodes.length}/${nodes.length}` },
  { key: 'Last deploy', value: '2026-09-24 21:12' },
];

/** Clamps `value` into `[min, max]`. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Nudges `value` by a small random amount (`+/- amount`), clamped to `[min, max]` and
 * rounded to a whole number. Used both for the periodic ambient meter drift and for the
 * "Run health check" refresh.
 */
export function drift(value: number, amount: number, min = 0, max = 100): number {
  const next = value + (Math.random() * 2 - 1) * amount;
  return Math.round(clamp(next, min, max));
}
