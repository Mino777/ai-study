/**
 * Harness Fitness Tests — 공통 하네스 적합성 검증
 * Martin Fowler "Computational Sensor" 패턴
 *
 * vitest로 실행: npx vitest run scripts/__tests__/harness-fitness.test.mjs
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..', '..');

describe('Harness Fitness', () => {
  it('CLAUDE.md는 250줄 이하여야 한다', () => {
    const content = readFileSync(join(ROOT, 'CLAUDE.md'), 'utf-8');
    const lines = content.split('\n').length;
    expect(lines).toBeLessThanOrEqual(250);
  });

  it('settings.json에 deny 규칙이 존재해야 한다', () => {
    const settings = JSON.parse(readFileSync(join(ROOT, '.claude', 'settings.json'), 'utf-8'));
    expect(settings.permissions?.deny).toBeDefined();
    expect(settings.permissions.deny.length).toBeGreaterThanOrEqual(4);
  });

  it('settings.json deny에 rm -rf 차단이 있어야 한다', () => {
    const settings = JSON.parse(readFileSync(join(ROOT, '.claude', 'settings.json'), 'utf-8'));
    const hasDeny = settings.permissions.deny.some(r => r.includes('rm -rf'));
    expect(hasDeny).toBe(true);
  });

  it('.claude/hooks/ 디렉토리에 최소 2개 훅이 존재해야 한다', () => {
    const hooksDir = join(ROOT, '.claude', 'hooks');
    expect(existsSync(hooksDir)).toBe(true);
    const hooks = readdirSync(hooksDir).filter(f => f.endsWith('.sh'));
    expect(hooks.length).toBeGreaterThanOrEqual(2);
  });

  it('.claude/rules/ 디렉토리가 존재하고 규칙 파일이 있어야 한다', () => {
    const rulesDir = join(ROOT, '.claude', 'rules');
    expect(existsSync(rulesDir)).toBe(true);
    const rules = readdirSync(rulesDir).filter(f => f.endsWith('.md'));
    expect(rules.length).toBeGreaterThanOrEqual(1);
  });

  it('.claude/commands/ 에 최소 2개 커맨드가 있어야 한다', () => {
    const cmdsDir = join(ROOT, '.claude', 'commands');
    expect(existsSync(cmdsDir)).toBe(true);
    const cmds = readdirSync(cmdsDir).filter(f => f.endsWith('.md'));
    expect(cmds.length).toBeGreaterThanOrEqual(2);
  });
});
