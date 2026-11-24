import { CATEGORY_LABELS, inr, type Category, type SearchFilters } from '../types';

interface Props {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  resultCount: number;
  totalCount: number;
}

const PRICE_STOPS = [5000, 10000, 25000, 50000, 60000, 100000];

export default function Filters({ filters, onChange, resultCount, totalCount }: Props) {
  const set = (patch: Partial<SearchFilters>) => onChange({ ...filters, ...patch });
  return (
    <aside className="filters" aria-label="Filters">
      <div className="filters-head">
        <h2>Filters</h2>
        <button type="button" className="clear" onClick={() => onChange({ q: '', category: 'ALL', maxPrice: null, inStockOnly: false, condition: 'ALL', sort: 'relevance' })}>Clear all</button>
      </div>

      <div className="f-group">
        <h3>Category</h3>
        {(Object.keys(CATEGORY_LABELS) as (Category | 'ALL')[]).map((c) => (
          <label key={c} className="f-check">
            <input type="radio" name="cat" checked={filters.category === c} onChange={() => set({ category: c })} />
            <span>{CATEGORY_LABELS[c]}</span>
          </label>
        ))}
      </div>

      <div className="f-group">
        <h3>Max price</h3>
        <div className="price-chips">
          {PRICE_STOPS.map((v) => (
            <button
              key={v}
              type="button"
              className={filters.maxPrice === v ? 'on' : ''}
              onClick={() => set({ maxPrice: filters.maxPrice === v ? null : v })}
            >{inr(v)}</button>
          ))}
        </div>
        {filters.maxPrice != null && (
          <button type="button" className="clear" onClick={() => set({ maxPrice: null })}>Remove price filter ✕</button>
        )}
      </div>

      <div className="f-group">
        <h3>Condition</h3>
        {(['ALL', 'NEW', 'USED'] as const).map((c) => (
          <label key={c} className="f-check">
            <input type="radio" name="cond" checked={filters.condition === c} onChange={() => set({ condition: c })} />
            <span>{c === 'ALL' ? 'New & Used' : c === 'NEW' ? 'New' : 'Used'}</span>
          </label>
        ))}
      </div>

      <div className="f-group">
        <label className="f-switch">
          <input type="checkbox" checked={filters.inStockOnly} onChange={(e) => set({ inStockOnly: e.target.checked })} />
          <span className="track" aria-hidden="true"><span className="thumb" /></span>
          <span>In stock only</span>
        </label>
      </div>

      <div className="f-group">
        <h3>Sort by</h3>
        <select value={filters.sort} onChange={(e) => set({ sort: e.target.value as SearchFilters['sort'] })} aria-label="Sort products">
          <option value="relevance">Relevance</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      <p className="f-count">Showing <b>{resultCount}</b> of <b>{totalCount}</b> products</p>
    </aside>
  );
}
