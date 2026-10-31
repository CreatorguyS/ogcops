import { describe, expect, it } from 'vitest';
import type { TemplateField } from '@/templates/types';

function getSortedGroups(fields: TemplateField[]): Array<[string, TemplateField[]]> {
  const groups: Record<string, TemplateField[]> = {};
  for (const field of fields) {
    const group = field.group || 'Content';
    if (!groups[group]) groups[group] = [];
    groups[group].push(field);
  }

  const groupOrder = ['Content', 'Style', 'Brand'];
  const knownGroups = groupOrder.filter((g) => groups[g]).map((g) => [g, groups[g]] as [string, TemplateField[]]);
  const otherGroups = Object.keys(groups)
    .filter((g) => !groupOrder.includes(g))
    .map((g) => [g, groups[g]] as [string, TemplateField[]]);
  return [...knownGroups, ...otherGroups];
}

describe('CustomizePanel grouping', () => {
  it('orders standard groups in Content, Style, Brand order', () => {
    const fields: TemplateField[] = [
      { key: 'b', label: 'B', type: 'text', group: 'Brand' },
      { key: 's', label: 'S', type: 'text', group: 'Style' },
      { key: 'c', label: 'C', type: 'text', group: 'Content' },
    ];
    const sorted = getSortedGroups(fields);
    expect(sorted.map(([name]) => name)).toEqual(['Content', 'Style', 'Brand']);
  });

  it('includes custom or unrecognized groups after standard groups', () => {
    const fields: TemplateField[] = [
      { key: 'c', label: 'C', type: 'text', group: 'Content' },
      { key: 'adv', label: 'Advanced Setting', type: 'text', group: 'Advanced' },
      { key: 'lay', label: 'Layout Option', type: 'text', group: 'Layout' },
      { key: 's', label: 'S', type: 'text', group: 'Style' },
    ];
    const sorted = getSortedGroups(fields);
    const names = sorted.map(([name]) => name);

    expect(names.slice(0, 2)).toEqual(['Content', 'Style']);
    expect(names).toContain('Advanced');
    expect(names).toContain('Layout');
    expect(sorted.find(([name]) => name === 'Advanced')![1]).toHaveLength(1);
    expect(sorted.find(([name]) => name === 'Layout')![1]).toHaveLength(1);
  });

  it('defaults missing group to Content', () => {
    const fields: TemplateField[] = [
      { key: 't', label: 'Title', type: 'text' },
    ];
    const sorted = getSortedGroups(fields);
    expect(sorted[0][0]).toBe('Content');
    expect(sorted[0][1][0].key).toBe('t');
  });
});
