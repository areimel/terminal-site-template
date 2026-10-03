import { beforeEach, describe, expect, it } from 'vitest';

import { createShell } from './engine';
import type { ShellCommand, ShellHost, ShellTone } from './types';

type Call = unknown[];

interface FakeHost {
  host: ShellHost;
  calls: {
    print: Call[];
    clear: Call[];
    navigate: Call[];
    setTheme: Call[];
    setEffect: Call[];
  };
  printedLines: () => string[];
}

function createFakeHost(): FakeHost {
  const calls: FakeHost['calls'] = { print: [], clear: [], navigate: [], setTheme: [], setEffect: [] };
  let effectsState: Record<string, boolean> = { boot: true, noise: false, scanline: true };
  let currentTheme = 'green';

  const host: ShellHost = {
    print(out: string | string[], tone?: ShellTone) {
      calls.print.push([out, tone]);
    },
    clear() {
      calls.clear.push([]);
    },
    navigate(href: string) {
      calls.navigate.push([href]);
    },
    setTheme(id: string) {
      calls.setTheme.push([id]);
      currentTheme = id;
    },
    setEffect(name: string, on: boolean) {
      calls.setEffect.push([name, on]);
      effectsState = { ...effectsState, [name]: on };
    },
    getEffects() {
      return { ...effectsState };
    },
    routes: [
      { alias: 'projects', label: 'Projects', href: '/projects' },
      { alias: 'blog', label: 'Blog', href: '/blog' },
    ],
    themes: [
      { id: 'green', label: 'Green' },
      { id: 'amber', label: 'Amber' },
    ],
    currentTheme: () => currentTheme,
    identity: { name: 'Field Agent', handle: 'agent', role: 'Systems Engineer', org: 'ARDA' },
  };

  return {
    host,
    calls,
    printedLines() {
      return calls.print.flatMap(([out]) => (Array.isArray(out) ? (out as string[]) : [out as string]));
    },
  };
}

describe('createShell: parsing and history', () => {
  it('is a no-op for an empty line', async () => {
    const { host } = createFakeHost();
    const shell = createShell(host);
    await shell.run('   ');
    expect(shell.history).toEqual([]);
  });

  it('pushes non-empty lines to history', async () => {
    const { host } = createFakeHost();
    const shell = createShell(host);
    await shell.run('whoami');
    await shell.run('date');
    expect(shell.history).toEqual(['whoami', 'date']);
  });

  it('skips consecutive duplicate lines but keeps non-consecutive repeats', async () => {
    const { host } = createFakeHost();
    const shell = createShell(host);
    await shell.run('whoami');
    await shell.run('whoami');
    await shell.run('date');
    await shell.run('whoami');
    expect(shell.history).toEqual(['whoami', 'date', 'whoami']);
  });

  it('caps history at 100 entries', async () => {
    const { host } = createFakeHost();
    const shell = createShell(host);
    for (let i = 0; i < 105; i++) {
      await shell.run(`echo ${i}`);
    }
    expect(shell.history).toHaveLength(100);
    expect(shell.history[0]).toBe('echo 5');
    expect(shell.history[99]).toBe('echo 104');
  });
});

describe('createShell: dispatch', () => {
  it('resolves commands case-insensitively', async () => {
    const { host, calls } = createFakeHost();
    const shell = createShell(host);
    await shell.run('WHOAMI');
    expect(calls.print[0][0]).toBe('Field Agent (@agent), Systems Engineer at ARDA');
  });

  it('resolves aliases (clear via cls)', async () => {
    const { host, calls } = createFakeHost();
    const shell = createShell(host);
    await shell.run('cls');
    expect(calls.clear).toHaveLength(1);
  });

  it('prints a command-not-found message for unknown commands', async () => {
    const { host, calls } = createFakeHost();
    const shell = createShell(host);
    await shell.run('frobnicate');
    expect(calls.print).toHaveLength(1);
    expect(calls.print[0]).toEqual(['command not found: frobnicate. Type help to list commands.', 'err']);
  });

  it('catches thrown errors from a command and prints them, without throwing', async () => {
    const { host, calls } = createFakeHost();
    const boom: ShellCommand = {
      name: 'boom',
      description: 'Always throws.',
      run() {
        throw new Error('kaboom');
      },
    };
    const shell = createShell(host, [boom]);
    await expect(shell.run('boom')).resolves.toBeUndefined();
    expect(calls.print[0]).toEqual(['error: kaboom', 'err']);
  });

  it('lets user commands override a builtin of the same name', async () => {
    const { host, calls } = createFakeHost();
    const override: ShellCommand = {
      name: 'clear',
      description: 'Overridden clear.',
      run(ctx) {
        ctx.print('overridden');
      },
    };
    const shell = createShell(host, [override]);
    await shell.run('clear');
    expect(calls.clear).toHaveLength(0);
    expect(calls.print[0][0]).toBe('overridden');
  });
});

describe('builtin: help', () => {
  it('lists all non-hidden commands and excludes hidden ones', async () => {
    const { host } = createFakeHost();
    let captured: string[] = [];
    host.print = (out) => {
      captured = Array.isArray(out) ? out : [out];
    };
    const shell = createShell(host);
    await shell.run('help');
    const joined = captured.join('\n');
    for (const name of ['help', 'ls', 'cd', 'open', 'theme', 'effects', 'clear', 'whoami', 'echo', 'date', 'history']) {
      expect(joined).toContain(name);
    }
    expect(joined).not.toContain('sudo');
  });

  it('shows usage and aliases for a specific command', async () => {
    const { host } = createFakeHost();
    let captured: string[] = [];
    host.print = (out) => {
      captured = Array.isArray(out) ? out : [out];
    };
    const shell = createShell(host);
    await shell.run('help clear');
    const joined = captured.join('\n');
    expect(joined).toContain('usage: clear');
    expect(joined).toContain('cls');
  });
});

describe('builtin: cd', () => {
  let fake: FakeHost;
  beforeEach(() => {
    fake = createFakeHost();
  });

  it('navigates to a route alias', async () => {
    const shell = createShell(fake.host);
    await shell.run('cd projects');
    expect(fake.calls.navigate).toEqual([['/projects']]);
  });

  it('treats ~ and / as home', async () => {
    const shell = createShell(fake.host);
    await shell.run('cd ~');
    await shell.run('cd /');
    expect(fake.calls.navigate).toEqual([['/'], ['/']]);
  });

  it('treats .. as home', async () => {
    const shell = createShell(fake.host);
    await shell.run('cd ..');
    expect(fake.calls.navigate).toEqual([['/']]);
  });

  it('errors for an unknown alias', async () => {
    const shell = createShell(fake.host);
    await shell.run('cd nowhere');
    expect(fake.calls.print[0]).toEqual(['no such directory: nowhere', 'err']);
  });
});

describe('builtin: open', () => {
  let fake: FakeHost;
  beforeEach(() => {
    fake = createFakeHost();
  });

  it('navigates directly for http(s) URLs', async () => {
    const shell = createShell(fake.host);
    await shell.run('open https://example.com');
    expect(fake.calls.navigate).toEqual([['https://example.com']]);
  });

  it('resolves an alias like cd', async () => {
    const shell = createShell(fake.host);
    await shell.run('open blog');
    expect(fake.calls.navigate).toEqual([['/blog']]);
  });

  it('errors for an unknown alias', async () => {
    const shell = createShell(fake.host);
    await shell.run('open nowhere');
    expect(fake.calls.print[0]).toEqual(['no such directory: nowhere', 'err']);
  });
});

describe('builtin: theme', () => {
  let fake: FakeHost;
  beforeEach(() => {
    fake = createFakeHost();
  });

  it('lists themes marking the current one with *', async () => {
    const shell = createShell(fake.host);
    await shell.run('theme');
    const lines = fake.calls.print[0][0] as string[];
    expect(lines.some((line) => line.includes('*') && line.includes('green'))).toBe(true);
  });

  it('cycles to the next theme', async () => {
    const shell = createShell(fake.host);
    await shell.run('theme next');
    expect(fake.calls.setTheme).toEqual([['amber']]);
  });

  it('sets a theme by id', async () => {
    const shell = createShell(fake.host);
    await shell.run('theme amber');
    expect(fake.calls.setTheme).toEqual([['amber']]);
  });

  it('errors for an unknown theme, listing valid ids', async () => {
    const shell = createShell(fake.host);
    await shell.run('theme neon');
    expect(fake.calls.print[0]).toEqual(['unknown theme: neon. Valid themes: green, amber', 'err']);
  });
});

describe('builtin: effects', () => {
  let fake: FakeHost;
  beforeEach(() => {
    fake = createFakeHost();
  });

  it('prints a status table with no args', async () => {
    const shell = createShell(fake.host);
    await shell.run('effects');
    const lines = fake.calls.print[0][0] as string[];
    expect(lines.some((line) => line.includes('boot') && line.includes('ON'))).toBe(true);
    expect(lines.some((line) => line.includes('noise') && line.includes('OFF'))).toBe(true);
  });

  it('turns a single effect on', async () => {
    const shell = createShell(fake.host);
    await shell.run('effects on noise');
    expect(fake.calls.setEffect).toEqual([['noise', true]]);
  });

  it('turns all effects off when no name is given', async () => {
    const shell = createShell(fake.host);
    await shell.run('effects off');
    expect(fake.calls.setEffect.length).toBeGreaterThan(1);
    expect(fake.calls.setEffect.every(([, on]) => on === false)).toBe(true);
  });

  it('errors for an unknown effect name', async () => {
    const shell = createShell(fake.host);
    await shell.run('effects on glitter');
    expect(fake.calls.print[0][1]).toBe('err');
  });
});

describe('completion', () => {
  it('completes command names (and aliases) on the first word, excluding hidden', () => {
    const { host } = createFakeHost();
    const shell = createShell(host);
    const candidates = shell.complete('cl');
    expect(candidates).toContain('clear');
    expect(candidates).toContain('cls');
    expect(candidates).not.toContain('sudo');
  });

  it('does not suggest hidden commands even with a matching prefix', () => {
    const { host } = createFakeHost();
    const shell = createShell(host);
    expect(shell.complete('su')).toEqual([]);
  });

  it('delegates to cd for route alias completion', () => {
    const { host } = createFakeHost();
    const shell = createShell(host);
    expect(shell.complete('cd pro')).toEqual(['projects']);
  });

  it('delegates to theme for theme id completion', () => {
    const { host } = createFakeHost();
    const shell = createShell(host);
    expect(shell.complete('theme am')).toEqual(['amber']);
  });

  it('offers all route aliases once the command name is finished with a trailing space', () => {
    const { host } = createFakeHost();
    const shell = createShell(host);
    expect(shell.complete('cd ')).toEqual(['blog', 'projects']);
  });
});
