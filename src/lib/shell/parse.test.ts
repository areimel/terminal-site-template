import { describe, expect, it } from 'vitest';

import { parseLine } from './parse';

describe('parseLine', () => {
  it('returns an empty argv for an empty line', () => {
    expect(parseLine('')).toEqual([]);
  });

  it('returns an empty argv for a whitespace-only line', () => {
    expect(parseLine('   \t  ')).toEqual([]);
  });

  it('splits on whitespace', () => {
    expect(parseLine('cd projects')).toEqual(['cd', 'projects']);
  });

  it('collapses repeated whitespace between tokens', () => {
    expect(parseLine('echo   hello    world')).toEqual(['echo', 'hello', 'world']);
  });

  it('trims leading and trailing whitespace', () => {
    expect(parseLine('  echo hi  ')).toEqual(['echo', 'hi']);
  });

  it('keeps spaces inside double quotes as one token', () => {
    expect(parseLine('echo "hello world"')).toEqual(['echo', 'hello world']);
  });

  it('keeps spaces inside single quotes as one token', () => {
    expect(parseLine("echo 'hello world'")).toEqual(['echo', 'hello world']);
  });

  it('does not process escapes inside single quotes', () => {
    expect(parseLine("echo 'a\\nb'")).toEqual(['echo', 'a\\nb']);
  });

  it('processes \\" and \\\\ escapes inside double quotes', () => {
    expect(parseLine('echo "say \\"hi\\" \\\\ done"')).toEqual(['echo', 'say "hi" \\ done']);
  });

  it('processes backslash escapes outside quotes as literal next char', () => {
    expect(parseLine('echo hello\\ world')).toEqual(['echo', 'hello world']);
  });

  it('produces an empty-string token for an empty quoted argument', () => {
    expect(parseLine('echo ""')).toEqual(['echo', '']);
  });

  it('allows quotes to butt up against unquoted text in the same token', () => {
    expect(parseLine('echo foo"bar baz"qux')).toEqual(['echo', 'foobar bazqux']);
  });
});
