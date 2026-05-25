// Product catalog + routine builder

export type ProductCategory =
  | 'cleanser' | 'antiox' | 'serum' | 'exfoliant'
  | 'retinoid' | 'moisturizer' | 'spf';

export type Tone = 'AM' | 'PM' | 'both';

export interface ProductInfo {
  category: ProductCategory;
  actives: string[];
  tone: Tone;
  mins: number;
}

export interface RoutineStep {
  name: string;
  category: ProductCategory;
  actives: string[];
  tone: Tone;
  mins: number;
  freq?: string;
}

export interface GapWarning {
  key: ProductCategory;
  label: string;
  reason: string;
}

// Canonical AM layering order (thinnest → thickest)
const ORDER: ProductCategory[] = [
  'cleanser', 'antiox', 'serum', 'exfoliant', 'retinoid', 'moisturizer', 'spf',
];

export const STEP_LABEL: Record<ProductCategory, string> = {
  cleanser:   'Cleanser',
  antiox:     'Vitamin C / Antioxidant',
  serum:      'Treatment Serum',
  exfoliant:  'BHA Exfoliant',
  retinoid:   'Retinoid',
  moisturizer:'Moisturizer',
  spf:        'Mineral SPF 30+',
};

export const CATALOG: Record<string, ProductInfo> = {
  'CeraVe Hydrating Cleanser':     { category: 'cleanser',    actives: ['ceramides', 'hyaluronic acid'], tone: 'both', mins: 1 },
  'La Roche-Posay Toleriane':       { category: 'moisturizer', actives: ['glycerin', 'niacinamide'],      tone: 'both', mins: 1 },
  'EltaMD UV Clear SPF 46':         { category: 'spf',         actives: ['niacinamide', 'zinc oxide'],    tone: 'AM',   mins: 1 },
  'The Ordinary Niacinamide 10%':   { category: 'serum',       actives: ['niacinamide', 'zinc'],          tone: 'AM',   mins: 1 },
  'Differin (Adapalene 0.1%)':      { category: 'retinoid',    actives: ['adapalene'],                    tone: 'PM',   mins: 2 },
  'Paula\'s Choice BHA 2%':         { category: 'exfoliant',   actives: ['salicylic acid'],               tone: 'PM',   mins: 1 },
  'SkinCeuticals C E Ferulic':      { category: 'antiox',      actives: ['vitamin c', 'vitamin e'],       tone: 'AM',   mins: 1 },
  'Neutrogena Hydro Boost Gel':     { category: 'moisturizer', actives: ['hyaluronic acid'],              tone: 'both', mins: 1 },
  'The Ordinary AHA 30%+BHA 2%':    { category: 'exfoliant',   actives: ['glycolic acid', 'salicylic acid'], tone: 'PM', mins: 2 },
  'Cetaphil Gentle Cleanser':       { category: 'cleanser',    actives: ['glycerin'],                     tone: 'both', mins: 1 },
  'Kiehl\'s Midnight Recovery':     { category: 'serum',       actives: ['lavender oil', 'squalane'],     tone: 'PM',   mins: 2 },
  'La Roche-Posay Anthelios SPF 60':{ category: 'spf',         actives: ['mexoryl', 'tinosorb'],          tone: 'AM',   mins: 1 },
};

export function buildRoutine(owned: string[], when: Tone): RoutineStep[] {
  const matched = owned
    .map(name => {
      const info = CATALOG[name];
      return info ? { name, ...info } : null;
    })
    .filter((p): p is RoutineStep & { name: string } => p !== null);

  const filtered = matched.filter(p => p.tone === when || p.tone === 'both');

  // Skip retinoid in AM, skip SPF in PM
  const valid = filtered.filter(p => {
    if (when === 'AM' && p.category === 'retinoid') return false;
    if (when === 'PM' && p.category === 'spf') return false;
    return true;
  });

  // First product per category, in canonical order
  const seen = new Set<ProductCategory>();
  const result: RoutineStep[] = [];
  for (const cat of ORDER) {
    const match = valid.find(p => p.category === cat && !seen.has(p.category));
    if (match) {
      seen.add(cat);
      result.push(match);
    }
  }
  return result;
}

export function routineGaps(owned: string[]): GapWarning[] {
  const cats = owned
    .map(n => CATALOG[n]?.category)
    .filter(Boolean) as ProductCategory[];

  const gaps: GapWarning[] = [];
  if (!cats.includes('cleanser'))
    gaps.push({ key: 'cleanser', label: 'Cleanser', reason: 'Essential first step — removes overnight oil and preps skin for actives.' });
  if (!cats.includes('moisturizer'))
    gaps.push({ key: 'moisturizer', label: 'Moisturizer', reason: 'Locks in hydration and strengthens the barrier.' });
  if (!cats.some(c => c === 'spf'))
    gaps.push({ key: 'spf', label: 'Broad-Spectrum SPF', reason: 'UV is the #1 cause of premature aging. Non-negotiable.' });
  return gaps;
}
