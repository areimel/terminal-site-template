/**
 * Plausible, persona-neutral fake mainframe log lines for `LogStream`'s `demo` mode:
 * job scheduler, disk, network and auth events. No real hostnames, users or products.
 */
import type { LogLevel } from './log-levels';

export interface DemoLogLine {
  time: string;
  level: LogLevel;
  text: string;
}

const HOSTS = ['node-04', 'node-11', 'node-22', 'ctrl-01', 'edge-03'];
const JOBS = ['batch-report', 'index-rebuild', 'backup-nightly', 'cache-warm', 'metrics-rollup'];
const SERVICES = ['reporting', 'ingest', 'sync', 'api'];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

const TEMPLATES: { level: LogLevel; text(): string }[] = [
  { level: 'info', text: () => `job scheduler: dispatched ${pick(JOBS)} to ${pick(HOSTS)}` },
  { level: 'ok', text: () => `job scheduler: ${pick(JOBS)} completed in ${randInt(1, 40)}s` },
  { level: 'info', text: () => `job scheduler: queued ${pick(JOBS)}, ${randInt(1, 9)} pending` },
  { level: 'warn', text: () => `disk: ${pick(HOSTS)} volume /data at ${randInt(80, 94)}% capacity` },
  { level: 'err', text: () => `disk: read retry on ${pick(HOSTS)} sector ${randInt(1000, 9999)}` },
  { level: 'ok', text: () => `disk: scrub completed on ${pick(HOSTS)}, 0 errors` },
  { level: 'info', text: () => `network: link up eth${randInt(0, 3)} on ${pick(HOSTS)}` },
  { level: 'warn', text: () => `network: latency spike ${randInt(120, 480)}ms to ${pick(HOSTS)}` },
  { level: 'ok', text: () => `auth: session established for svc-${pick(SERVICES)}` },
  { level: 'err', text: () => `auth: rejected key for svc-${pick(SERVICES)}` },
];

function timestamp(): string {
  return new Date().toTimeString().slice(0, 8);
}

export function generateDemoLogLine(): DemoLogLine {
  const template = pick(TEMPLATES);
  return { time: timestamp(), level: template.level, text: template.text() };
}
