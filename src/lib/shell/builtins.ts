import type { ShellCommand, ShellContext, ShellRoute } from './types';

function findCommand(commands: ShellCommand[], name: string): ShellCommand | undefined {
  const lower = name.toLowerCase();
  return commands.find(
    (command) =>
      command.name.toLowerCase() === lower || (command.aliases ?? []).some((alias) => alias.toLowerCase() === lower)
  );
}

function findRoute(routes: ShellRoute[], alias: string): ShellRoute | undefined {
  const lower = alias.toLowerCase();
  return routes.find((route) => route.alias.toLowerCase() === lower);
}

function completeAlias(args: string[], ctx: ShellContext): string[] {
  const partial = (args[0] ?? '').toLowerCase();
  return ctx.routes.map((route) => route.alias).filter((alias) => alias.toLowerCase().startsWith(partial));
}

function padTable(rows: [string, string][]): string[] {
  const width = rows.reduce((max, [left]) => Math.max(max, left.length), 0);
  return rows.map(([left, right]) => `${left.padEnd(width + 2)}${right}`);
}

const help: ShellCommand = {
  name: 'help',
  description: 'List available commands, or show usage for one command.',
  usage: 'help [command]',
  run(ctx, args) {
    const [name] = args;
    if (name) {
      const command = findCommand(ctx.commands, name);
      if (!command) {
        ctx.print(`command not found: ${name}. Type help to list commands.`, 'err');
        return;
      }
      const lines = [`usage: ${command.usage ?? command.name}`];
      if (command.aliases?.length) lines.push(`aliases: ${command.aliases.join(', ')}`);
      lines.push(command.description);
      ctx.print(lines);
      return;
    }
    const visible = ctx.commands
      .filter((command) => !command.hidden)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
    const rows: [string, string][] = visible.map((command) => [command.name, command.description]);
    ctx.print(['Available commands:', ...padTable(rows), '', 'Type help <command> for usage.']);
  },
};

const ls: ShellCommand = {
  name: 'ls',
  description: 'List available routes.',
  usage: 'ls',
  run(ctx) {
    if (ctx.routes.length === 0) {
      ctx.print('No routes available.');
      return;
    }
    const rows: [string, string][] = ctx.routes.map((route) => [`${route.alias}/`, route.label]);
    ctx.print(padTable(rows));
  },
};

const cd: ShellCommand = {
  name: 'cd',
  description: 'Change to a route by alias or path.',
  usage: 'cd <alias|path>',
  run(ctx, args) {
    const target = args[0];
    if (!target || target === '~' || target === '/' || target === '..') {
      ctx.navigate('/');
      return;
    }
    const route = findRoute(ctx.routes, target);
    if (route) {
      ctx.navigate(route.href);
      return;
    }
    if (target.startsWith('/')) {
      ctx.navigate(target);
      return;
    }
    ctx.print(`no such directory: ${target}`, 'err');
  },
  complete: completeAlias,
};

const open: ShellCommand = {
  name: 'open',
  description: 'Open a URL or route alias.',
  usage: 'open <url|alias>',
  run(ctx, args) {
    const target = args[0];
    if (!target) {
      ctx.print('usage: open <url|alias>', 'err');
      return;
    }
    if (/^https?:\/\//i.test(target)) {
      ctx.navigate(target);
      return;
    }
    const route = findRoute(ctx.routes, target);
    if (route) {
      ctx.navigate(route.href);
      return;
    }
    if (target.startsWith('/')) {
      ctx.navigate(target);
      return;
    }
    ctx.print(`no such directory: ${target}`, 'err');
  },
  complete: completeAlias,
};

const theme: ShellCommand = {
  name: 'theme',
  description: 'View or change the color theme.',
  usage: 'theme [id|list|next]',
  run(ctx, args) {
    const [arg] = args;
    if (!arg || arg === 'list') {
      const current = ctx.currentTheme();
      const rows: [string, string][] = ctx.themes.map((t) => [`${t.id === current ? '*' : ' '} ${t.id}`, t.label]);
      ctx.print(padTable(rows));
      return;
    }
    if (arg === 'next') {
      const ids = ctx.themes.map((t) => t.id);
      const currentIndex = ids.indexOf(ctx.currentTheme());
      const next = ids[(currentIndex + 1) % ids.length] ?? ids[0];
      if (next) {
        ctx.setTheme(next);
        ctx.print(`Theme set to ${next}.`, 'ok');
      }
      return;
    }
    const match = ctx.themes.find((t) => t.id.toLowerCase() === arg.toLowerCase());
    if (!match) {
      ctx.print(`unknown theme: ${arg}. Valid themes: ${ctx.themes.map((t) => t.id).join(', ')}`, 'err');
      return;
    }
    ctx.setTheme(match.id);
    ctx.print(`Theme set to ${match.id}.`, 'ok');
  },
  complete(args, ctx) {
    const partial = (args[0] ?? '').toLowerCase();
    return ctx.themes.map((t) => t.id).filter((id) => id.toLowerCase().startsWith(partial));
  },
};

const effects: ShellCommand = {
  name: 'effects',
  description: 'View or toggle terminal effects.',
  usage: 'effects [on|off|status] [name]',
  run(ctx, args) {
    const [action, name] = args;
    const state = ctx.getEffects();
    if (!action || action === 'status') {
      const rows: [string, string][] = Object.entries(state).map(([n, on]) => [n, on ? 'ON' : 'OFF']);
      ctx.print(padTable(rows));
      return;
    }
    if (action !== 'on' && action !== 'off') {
      ctx.print(`unknown option: ${action}. usage: effects [on|off|status] [name]`, 'err');
      return;
    }
    const on = action === 'on';
    if (!name) {
      for (const effectName of Object.keys(state)) ctx.setEffect(effectName, on);
      return;
    }
    if (!(name in state)) {
      ctx.print(`unknown effect: ${name}. Valid effects: ${Object.keys(state).join(', ')}`, 'err');
      return;
    }
    ctx.setEffect(name, on);
  },
  complete(args, ctx) {
    const state = ctx.getEffects();
    if (args.length <= 1) {
      const partial = (args[0] ?? '').toLowerCase();
      return ['on', 'off', 'status'].filter((option) => option.startsWith(partial));
    }
    const partial = (args[1] ?? '').toLowerCase();
    return Object.keys(state).filter((n) => n.toLowerCase().startsWith(partial));
  },
};

const clear: ShellCommand = {
  name: 'clear',
  aliases: ['cls'],
  description: 'Clear the terminal output.',
  usage: 'clear',
  run(ctx) {
    ctx.clear();
  },
};

const whoami: ShellCommand = {
  name: 'whoami',
  description: 'Show the current identity.',
  usage: 'whoami',
  run(ctx) {
    const { name, handle, role, org } = ctx.identity;
    ctx.print(`${name} (@${handle}), ${role} at ${org}`);
  },
};

const echo: ShellCommand = {
  name: 'echo',
  description: 'Print text back to the terminal.',
  usage: 'echo <text...>',
  run(ctx, args) {
    ctx.print(args.join(' '));
  },
};

const date: ShellCommand = {
  name: 'date',
  description: 'Show the current local date and time.',
  usage: 'date',
  run(ctx) {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    ctx.print(stamp);
  },
};

const history: ShellCommand = {
  name: 'history',
  description: 'Show command history.',
  usage: 'history',
  run(ctx) {
    if (ctx.history.length === 0) {
      ctx.print('No history yet.');
      return;
    }
    ctx.print(ctx.history.map((line, index) => `${index + 1}  ${line}`));
  },
};

const sudo: ShellCommand = {
  name: 'sudo',
  description: 'Run a command as another user.',
  hidden: true,
  run(ctx) {
    ctx.print('Permission denied. Nice try.', 'warn');
  },
};

export const builtins: ShellCommand[] = [help, ls, cd, open, theme, effects, clear, whoami, echo, date, history, sudo];
