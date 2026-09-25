/**
 * Shared level -> status string / color mapping for `LogStream`, used both server-side
 * (initial `lines` render) and client-side (lines appended after hydration), so the two
 * paths can never drift.
 */
import { TONE_TEXT_CLASS } from './tone';

export type LogLevel = 'info' | 'ok' | 'warn' | 'err';

/** Fixed-width status strings - the only place besides `Badge` that all-caps belongs. */
export const LOG_LEVEL_LABEL: Record<LogLevel, string> = {
  info: '[INFO]',
  ok: '[ OK ]',
  warn: '[WARN]',
  err: '[ERR ]',
};

export const LOG_LEVEL_CLASS: Record<LogLevel, string> = {
  info: TONE_TEXT_CLASS.default,
  ok: TONE_TEXT_CLASS.ok,
  warn: TONE_TEXT_CLASS.warn,
  err: TONE_TEXT_CLASS.err,
};
