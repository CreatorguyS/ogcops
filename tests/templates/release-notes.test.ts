import { describe, expect, it } from 'vitest';
import releaseNotes from '@/templates/github/release-notes';

function walk(node: unknown, visit: (el: { type: string; props: Record<string, unknown> }) => void): void {
  if (Array.isArray(node)) { node.forEach((c) => walk(c, visit)); return; }
  if (!node || typeof node !== 'object' || !('type' in node)) return;
  const el = node as { type: string; props: Record<string, unknown> };
  visit(el);
  walk(el.props.children, visit);
}

function textContent(node: unknown): string[] {
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(textContent);
  if (node && typeof node === 'object' && 'props' in node)
    return textContent((node as { props: { children: unknown } }).props.children);
  return [];
}

const render = (overrides: Record<string, unknown> = {}) =>
  releaseNotes.render({ ...releaseNotes.defaults, ...overrides });

describe('github-release-notes', () => {
  it('renders all three default changes', () => {
    const text = textContent(render()).join(' ');
    expect(text).toContain('New plugin system');
    expect(text).toContain('Performance improvements');
    expect(text).toContain('Breaking: Updated API');
  });

  it('hides change2 and change3 when they are cleared to an empty string', () => {
    const text = textContent(render({ change2: '', change3: '' })).join(' ');
    expect(text).toContain('New plugin system');
    expect(text).not.toContain('Performance improvements');
    expect(text).not.toContain('Breaking: Updated API');
  });

  it('hides change3 only when it is cleared', () => {
    const text = textContent(render({ change3: '' })).join(' ');
    expect(text).toContain('New plugin system');
    expect(text).toContain('Performance improvements');
    expect(text).not.toContain('Breaking: Updated API');
  });

  it('shows a custom single change when the others are cleared', () => {
    const text = textContent(render({ change1: 'Fix login redirect', change2: '', change3: '' })).join(' ');
    expect(text).toContain('Fix login redirect');
    expect(text).not.toContain('Performance improvements');
    expect(text).not.toContain('Breaking: Updated API');
  });
});
