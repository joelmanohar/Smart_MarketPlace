import type { Product, SearchFilters, SearchMetrics } from '../types';
import { SEED_PRODUCTS, ORACLE_IDS } from '../data/products';

const API_BASE = '/api';
const BLOCK_SIZE = 4;
const PROCESSORS = 8;

function anonId(): string {
  let id = localStorage.getItem('sm_anon');
  if (!id) {
    id = 'anon-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('sm_anon', id);
  }
  return id;
}

/**
 * Exact linear-search baseline (mirrors backend BaselineSearchService).
 * Scans once, applies filters in order, counts comparisons and blocks.
 */
export function baselineSearch(catalogue: Product[], f: SearchFilters): { results: Product[]; metrics: SearchMetrics } {
  const t0 = performance.now();
  const q = f.q.trim().toLowerCase();
  const results: Product[] = [];
  let comparisons = 0;
  let scanned = 0;

  for (const p of catalogue) {
    scanned++;
    comparisons++; // category
    if (f.category !== 'ALL' && p.category !== f.category) continue;
    comparisons++; // stock
    if (f.inStockOnly && p.stock <= 0) continue;
    comparisons++; // price
    if (f.maxPrice != null && p.price > f.maxPrice) continue;
    comparisons++; // condition
    if (f.condition !== 'ALL' && p.condition !== f.condition) continue;
    if (q) {
      const hay = `${p.title} ${p.description} ${p.category}`.toLowerCase();
      if (!hay.includes(q)) continue;
    }
    results.push(p);
  }

  const elapsedMs = Math.max(1, Math.round(performance.now() - t0));
  const matchedIds = results.map((r) => r.id);
  const n = scanned;
  const metrics: SearchMetrics = {
    scanned,
    comparisons,
    blocksRead: Math.ceil(n / BLOCK_SIZE),
    elapsedMs,
    matchedIds,
    costModel: {
      ramOps: 3 * n,
      blockTransfers: Math.ceil(n / BLOCK_SIZE),
      pramSteps: Math.ceil(n / PROCESSORS),
      work: n,
      span: Math.ceil(n / PROCESSORS),
      blockSize: BLOCK_SIZE,
      processors: PROCESSORS,
    },
    oraclePass: JSON.stringify(matchedIds) === JSON.stringify(ORACLE_IDS),
  };
  return { results, metrics };
}

export function sortResults(list: Product[], sort: SearchFilters['sort']): Product[] {
  const arr = [...list];
  switch (sort) {
    case 'price-asc': return arr.sort((a, b) => a.price - b.price);
    case 'price-desc': return arr.sort((a, b) => b.price - a.price);
    case 'rating': return arr.sort((a, b) => b.rating - a.rating);
    case 'newest': return arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    default: return arr;
  }
}

export async function fetchProducts(): Promise<{ products: Product[]; fromApi: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/products`, { headers: { 'X-Anonymous-User': anonId() } });
    if (!res.ok) throw new Error('api down');
    const data = (await res.json()) as Product[];
    return { products: data, fromApi: true };
  } catch {
    return { products: SEED_PRODUCTS, fromApi: false };
  }
}

export async function createProduct(payload: Partial<Product>): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Anonymous-User': anonId() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return (await res.json()) as Product;
  } catch {
    return null;
  }
}

export async function purchaseProduct(id: string, qty: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/products/${id}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Anonymous-User': anonId() },
      body: JSON.stringify({ qty }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function logEvent(type: 'SEARCH' | 'VIEW' | 'PURCHASE', query?: string, productId?: string) {
  // Fire-and-forget analytics event (anonymous). Ignored if API is offline.
  fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Anonymous-User': anonId() },
    body: JSON.stringify({ type, query, productId }),
  }).catch(() => undefined);
}
