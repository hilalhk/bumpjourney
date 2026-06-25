// Multiple-pregnancy support. Baby details live in prep_data (kind
// 'pregnancy_details') as a jsonb payload — no DB migration needed. The shape
// evolved from a single `{ sex }` to `{ count, babies: [{ sex, name }] }`;
// readBabies() transparently upgrades the legacy shape.

export type BabySex = 'girl' | 'boy' | 'surprise';
export type Baby = { sex: BabySex | null; name: string };
export type BabiesInfo = { count: number; babies: Baby[] };

export const MAX_BABIES = 4;

export const SEX_LABEL: Record<BabySex, string> = {
  girl: 'Girl',
  boy: 'Boy',
  surprise: 'Surprise',
};

/** Read babies from a pregnancy_details payload, upgrading the legacy `{ sex }` shape. */
export function readBabies(payload: any): BabiesInfo {
  if (payload && Array.isArray(payload.babies) && payload.babies.length > 0) {
    const babies: Baby[] = payload.babies.slice(0, MAX_BABIES).map((b: any) => ({
      sex: (b?.sex ?? null) as BabySex | null,
      name: typeof b?.name === 'string' ? b.name : '',
    }));
    return { count: babies.length, babies };
  }
  // Legacy single-baby shape (or nothing set yet).
  const sex = (payload?.sex ?? null) as BabySex | null;
  return { count: 1, babies: [{ sex, name: '' }] };
}

/** Pad/trim the babies array to `count`, preserving existing entries. */
export function resizeBabies(babies: Baby[], count: number): Baby[] {
  const n = Math.min(MAX_BABIES, Math.max(1, count));
  const next = babies.slice(0, n);
  while (next.length < n) next.push({ sex: null, name: '' });
  return next;
}

/** Persistable payload (trims names, syncs count to the babies array). */
export function babiesPayload(info: BabiesInfo): { count: number; babies: Baby[] } {
  const babies = resizeBabies(info.babies, info.count).map((b) => ({ sex: b.sex, name: b.name.trim() }));
  return { count: babies.length, babies };
}

export function countLabel(count: number): string {
  return count === 1 ? 'One baby'
    : count === 2 ? 'Twins'
    : count === 3 ? 'Triplets'
    : count === 4 ? 'Quadruplets'
    : `${count} babies`;
}

/** Short summary for Settings, e.g. "Twins · Girl, Boy" or "Girl". */
export function babiesSummary(info: BabiesInfo): string {
  const sexes = info.babies.map((b) => (b.sex ? SEX_LABEL[b.sex] : 'Not set'));
  if (info.count === 1) return sexes[0] ?? 'Not set';
  return `${countLabel(info.count)} · ${sexes.join(', ')}`;
}

export const isMultiple = (count: number) => count > 1;
