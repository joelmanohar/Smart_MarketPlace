import { CATEGORY_LABELS, type Category } from '../types';

interface Props {
  query: string;
  onQuery: (v: string) => void;
  onSearch: () => void;
  category: Category | 'ALL';
  onCategory: (c: Category | 'ALL') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSell: () => void;
  onHome: () => void;
}

const NAV_CATS: (Category | 'ALL')[] = ['ALL', 'LAPTOP', 'MOBILE', 'TABLET', 'WATCH', 'AUDIO', 'ACCESSORY', 'DISPLAY'];

export default function Header(p: Props) {
  return (
    <>
      <div className="top-strip">
        <span>🚚 Free delivery above ₹499</span>
        <span className="hide-sm">↩️ 7-day easy returns</span>
        <span className="hide-sm">🛡️ Buyer protection on every order</span>
        <span className="top-strip-cta">Sell in 60 seconds →</span>
      </div>

      <header className="header">
        <div className="header-inner">
          <button className="logo" onClick={p.onHome} aria-label="SmartMarket home">
            <span className="logo-mark">S</span>
            <span className="logo-text">Smart<b>Market</b></span>
          </button>

          <button className="location-btn" type="button" aria-label="Delivery location">
            <span className="loc-icon">📍</span>
            <span className="loc-text"><small>Deliver to</small><b>All India</b></span>
          </button>

          <form
            className="searchbar"
            onSubmit={(e) => { e.preventDefault(); p.onSearch(); }}
            role="search"
          >
            <select
              value={p.category}
              onChange={(e) => p.onCategory(e.target.value as Category | 'ALL')}
              aria-label="Search category"
            >
              {(Object.keys(CATEGORY_LABELS) as (Category | 'ALL')[]).map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
            <input
              value={p.query}
              onChange={(e) => p.onQuery(e.target.value)}
              placeholder="Search for laptops, phones, watches and more…"
              aria-label="Search products"
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            </button>
          </form>

          <nav className="header-actions" aria-label="Account">
            <button className="h-action" type="button"><span>👤</span><small>Account</small></button>
            <button className="h-action" type="button"><span>📦</span><small>Orders</small></button>
            <button className="h-action cart-btn" type="button" onClick={p.onOpenCart} aria-label={`Cart, ${p.cartCount} items`}>
              <span>🛒</span><small>Cart</small>
              {p.cartCount > 0 && <span className="cart-badge">{p.cartCount}</span>}
            </button>
            <button className="sell-btn" type="button" onClick={p.onOpenSell}>+ Sell</button>
          </nav>
        </div>

        <nav className="cat-nav" aria-label="Categories">
          {NAV_CATS.map((c) => (
            <button
              key={c}
              className={p.category === c ? 'active' : ''}
              onClick={() => p.onCategory(c)}
              type="button"
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
          <span className="cat-nav-right">Today's Deals ⚡</span>
        </nav>
      </header>
    </>
  );
}
