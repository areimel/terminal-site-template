// STUB (C2): replaced by C1's implementation at merge
//
// Minimal, DOM-free engine so `components/shell/TerminalShell.astro` has a real
// `createShell` to build against. Supports only `help`, `clear`, `echo` and an
// unknown-command error. C1's implementation replaces this file (and adds
// `ls`, `cd`, `open`, `theme`, `effects`, `whoami`, `date`, `history`, parsing,
// and completion) at merge.
import type { ShellCommand, ShellContext, ShellEngine, ShellHost } from './types';

function builtinCommands(): ShellCommand[] {
  return [
    {
      name: 'help',
      description: 'List available commands.',
      run(ctx) {
        const lines = ctx.commands
          .filter((command) => !command.hidden)
          .map((command) => `${command.name.padEnd(12)}${command.description}`);
        ctx.print(lines);
      },
    },
    {
      name: 'clear',
      description: 'Clear the terminal output.',
      run(ctx) {
        ctx.clear();
      },
    },
    {
      name: 'echo',
      description: 'Print the given text.',
      usage: 'echo <text>',
      run(ctx, args) {
        ctx.print(args.join(' '));
      },
    },
  ];
}

/** Parses and dispatches command lines against `host` plus any `extraCommands`. */
export function createShell(host: ShellHost, extraCommands: ShellCommand[] = []): ShellEngine {
  const history: string[] = [];
  const commands: ShellCommand[] = [...builtinCommands(), ...extraCommands];

  const context: ShellContext = {
    ...host,
    history,
    commands,
  };

  function findCommand(name: string): ShellCommand | undefined {
    return commands.find((command) => command.name === name || command.aliases?.includes(name));
  }

  async function run(line: string): Promise<void> {
    const trimmed = line.trim();
    if (!trimmed) return;
    history.push(trimmed);

    const [name, ...args] = trimmed.split(/\s+/);
    const command = findCommand(name);
    if (!command) {
      context.print(`command not found: ${name}`, 'err');
      return;
    }
    await command.run(context, args);
  }

  function complete(line: string): string[] {
    const [name = ''] = line.trim().split(/\s+/);
    if (!name) return [];
    return commands.map((command) => command.name).filter((commandName) => commandName.startsWith(name));
  }

  return { run, complete, history, commands };
}
