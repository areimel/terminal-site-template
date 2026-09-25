import { builtins } from './builtins';
import { parseLine } from './parse';
import type { ShellCommand, ShellContext, ShellEngine, ShellHost } from './types';

const MAX_HISTORY = 100;

function mergeCommands(base: ShellCommand[], extra: ShellCommand[]): ShellCommand[] {
  const byName = new Map<string, ShellCommand>();
  for (const command of base) byName.set(command.name.toLowerCase(), command);
  for (const command of extra) byName.set(command.name.toLowerCase(), command);
  return [...byName.values()];
}

function resolveCommand(commands: ShellCommand[], name: string): ShellCommand | undefined {
  const lower = name.toLowerCase();
  return commands.find(
    (command) =>
      command.name.toLowerCase() === lower || (command.aliases ?? []).some((alias) => alias.toLowerCase() === lower)
  );
}

/**
 * Builds a DOM-free shell engine from a host (the UI-side implementation of
 * navigation/theming/etc.) and optional user-defined commands. User commands
 * with the same `name` as a builtin override it.
 */
export function createShell(host: ShellHost, extraCommands: ShellCommand[] = []): ShellEngine {
  const history: string[] = [];
  const commands = mergeCommands(builtins, extraCommands);

  const ctx: ShellContext = {
    ...host,
    history,
    commands,
  };

  async function run(line: string): Promise<void> {
    const trimmed = line.trim();
    if (trimmed && history[history.length - 1] !== trimmed) {
      history.push(trimmed);
      if (history.length > MAX_HISTORY) history.shift();
    }

    const args = parseLine(line);
    if (args.length === 0) return;

    const [name, ...rest] = args;
    const command = resolveCommand(commands, name);
    if (!command) {
      ctx.print(`command not found: ${name}. Type help to list commands.`, 'err');
      return;
    }

    try {
      await command.run(ctx, rest);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      ctx.print(`error: ${message}`, 'err');
    }
  }

  function complete(line: string): string[] {
    const args = parseLine(line);
    const endsWithSpace = /\s$/.test(line);
    const completingFirstWord = args.length === 0 || (args.length === 1 && !endsWithSpace);

    if (completingFirstWord) {
      const partial = (args[0] ?? '').toLowerCase();
      const names = new Set<string>();
      for (const command of commands) {
        if (command.hidden) continue;
        if (command.name.toLowerCase().startsWith(partial)) names.add(command.name);
        for (const alias of command.aliases ?? []) {
          if (alias.toLowerCase().startsWith(partial)) names.add(alias);
        }
      }
      return [...names].sort();
    }

    const [name, ...rest] = args;
    const command = resolveCommand(commands, name);
    if (!command?.complete) return [];
    const argsForCompletion = endsWithSpace ? [...rest, ''] : rest;
    return [...new Set(command.complete(argsForCompletion, ctx))].sort();
  }

  return {
    run,
    complete,
    get history() {
      return history;
    },
    get commands() {
      return commands;
    },
  };
}
