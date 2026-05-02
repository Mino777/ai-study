/**
 * Harness Fitness Tests — Martin Fowler "Computational Sensor" 패턴
 *
 * 하네스의 구조적 건강 상태를 기계적으로 검증.
 * `npm test`에 포함되어 매 빌드/커밋 시 자동 실행.
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

  it('.claude/hooks/ 디렉토리에 최소 3개 훅이 존재해야 한다', () => {
    const hooksDir = join(ROOT, '.claude', 'hooks');
    expect(existsSync(hooksDir)).toBe(true);
    const hooks = readdirSync(hooksDir).filter(f => f.endsWith('.sh'));
    expect(hooks.length).toBeGreaterThanOrEqual(3);
  });

  it('.claude/rules/ 디렉토리가 존재하고 규칙 파일이 있어야 한다', () => {
    const rulesDir = join(ROOT, '.claude', 'rules');
    expect(existsSync(rulesDir)).toBe(true);
    const rules = readdirSync(rulesDir).filter(f => f.endsWith('.md'));
    expect(rules.length).toBeGreaterThanOrEqual(1);
  });

  it('.claude/commands/ 에 최소 5개 커맨드가 있어야 한다', () => {
    const cmdsDir = join(ROOT, '.claude', 'commands');
    expect(existsSync(cmdsDir)).toBe(true);
    const cmds = readdirSync(cmdsDir).filter(f => f.endsWith('.md'));
    expect(cmds.length).toBeGreaterThanOrEqual(5);
  });

  it('PostToolUse에 타입체크 훅이 설정되어 있어야 한다', () => {
    const settings = JSON.parse(readFileSync(join(ROOT, '.claude', 'settings.json'), 'utf-8'));
    const postHooks = settings.hooks?.PostToolUse || [];
    const hasTypeCheck = postHooks.some(h =>
      h.matcher?.includes('Edit') &&
      h.hooks?.some(hook => hook.command?.includes('tsc'))
    );
    expect(hasTypeCheck).toBe(true);
  });
});
