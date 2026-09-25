export type ShellTone = 'default' | 'ok' | 'warn' | 'err';

export interface ShellRoute {
  alias: string;
  label: string;
  href: string;
}

export interface ShellContext {
  print(out: string | string[], tone?: ShellTone): void;
  clear(): void;
  navigate(href: string): void;
  setTheme(id: string): void;
  setEffect(name: string, on: boolean): void;
  getEffects(): Record<string, boolean>;
  history: string[];
  commands: ShellCommand[];
  routes: ShellRoute[];
  themes: { id: string; label: string }[];
  currentTheme: () => string;
  identity: { name: string; handle: string; role: string; org: string };
}

export interface ShellCommand {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  hidden?: boolean;
  run(ctx: ShellContext, args: string[]): void | Promise<void>;
  complete?(args: string[], ctx: ShellContext): string[];
}

export type ShellHost = Omit<ShellContext, 'history' | 'commands'>;

export interface ShellEngine {
  run(line: string): Promise<void>;
  complete(line: string): string[];
  readonly history: string[];
  readonly commands: ShellCommand[];
}
