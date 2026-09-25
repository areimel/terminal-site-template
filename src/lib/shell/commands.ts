import type { ShellCommand } from './types';

/**
 * User commands for the `<terminal-shell>`.
 *
 * This is the file a fork edits to add their own commands — it's passed as
 * `extraCommands` to `createShell(host, userCommands)`. A command needs a
 * unique `name`, a short `description`, a `run(ctx, args)` function, and
 * optionally `aliases`, `usage`, `hidden`, and `complete(args, ctx)` for Tab
 * completion. A command here overrides a builtin with the same `name` (see
 * `builtins.ts` for the built-in set, and `types.ts` for the full
 * `ShellCommand`/`ShellContext` contract).
 *
 * Example:
 *   {
 *     name: 'greet',
 *     description: 'Say hello to someone.',
 *     usage: 'greet <name>',
 *     run(ctx, args) {
 *       ctx.print(`Hello, ${args[0] ?? 'there'}!`);
 *     },
 *   }
 */
export const userCommands: ShellCommand[] = [
  {
    name: 'hello',
    description: 'Print a friendly greeting.',
    usage: 'hello [name]',
    run(ctx, args) {
      const [name] = args;
      ctx.print(`Hello, ${name ?? ctx.identity.name}!`);
    },
  },
];
