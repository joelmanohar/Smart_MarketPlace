import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Filters from './components/Filters';
import ProductCard from './components/ProductCard';
import PerfPanel from './components/PerfPanel';
import Footer from './components/Footer';
import { CartDrawer, ProductModal, SellModal } from './components/Modals';
import { baselineSearch, createProduct, fetchProducts, logEvent, purchaseProduct, sortResults } from './api/client';
import type { Product, SearchFilters, SearchMetrics } from './types';

const DEFAULT_FILTERS: SearchFilters = {
  q: '', category: 'ALL', maxPrice: null, inStockOnly: false, condition: 'ALL', sort: 'relevance',
};

interface Toast { id: number; msg: string; }

export default function App() {
  const [catalogue, setCatalogue] = useState<Product[]>([]);
  const [fromApi, setFromApi] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [metrics, setMetrics] = useState<SearchMetrics | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [sellOpen, setSellOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('sm_cart') || '{}'); } catch { return {}; }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('sm_wish') || '[]'); } catch { return []; }
  });
  const [ordered, setOrdered] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mobileFilters, setMobileFilters] = useState(false);

  const toast = (msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  useEffect(() => { localStorage.setItem('sm_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('sm_wish', JSON.stringify(wishlist)); }, [wishlist]);

  useEffect(() => {
    fetchProducts().then(({ products, fromApi: api }) => {
      setCatalogue(products);
      setFromApi(api);
      setLoading(false);
    });
  }, []);

  const { results, liveMetrics } = useMemo(() => {
    const { results, metrics } = baselineSearch(catalogue, filters);
    return { results: sortResults(results, filters.sort), liveMetrics: metrics };
  }, [catalogue, filters]);

  // Keep the performance panel in sync with the latest search.
  useEffect(() => { if (catalogue.length) setMetrics(liveMetrics); }, [liveMetrics, catalogue.length]);

  const cartItems = useMemo(
    () => Object.entries(cart)
      .map(([id, qty]) => ({ product: catalogue.find((p) => p.id === id), qty }))
      .filter((x): x is { product: Product; qty: number } => Boolean(x.product)),
    [cart, catalogue],
  );
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const addToCart = (p: Product, qty = 1) => {
    setCart((c) => ({ ...c, [p.id]: Math.min(p.stock, (c[p.id] ?? 0) + qty) }));
    toast(`Added to cart: ${p.title.slice(0, 42)}…`);
  };

  const buyNow = (p: Product, qty = 1) => {
    setCart((c) => ({ ...c, [p.id]: Math.min(p.stock, (c[p.id] ?? 0) + qty) }));
    setSelected(null);
    setOrdered(false);
    setCartOpen(true);
  };

  const checkout = async () => {
    for (const { product, qty } of cartItems) {
      await purchaseProduct(product.id, qty);
      logEvent('PURCHASE', undefined, product.id);
    }
    setCatalogue((list) => list.map((p) => {
      const inCart = cart[p.id];
      return inCart ? { ...p, stock: Math.max(0, p.stock - inCart) } : p;
    }));
    setCart({});
    setOrdered(true);
    toast('Order placed successfully 🎉');
  };

  const handleSell = async (payload: Partial<Product>) => {
    const created = await createProduct(payload);
    const now = new Date().toISOString();
    const product: Product = created ?? {
      id: 'P' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      title: payload.title ?? 'New product',
      description: payload.description ?? '',
      category: payload.category ?? 'OTHER',
      price: payload.price ?? 0,
      mrp: payload.mrp,
      stock: payload.stock ?? 1,
      version: 1,
      imageUrl: payload.imageUrl ?? '',
      location: payload.location ?? '',
      condition: payload.condition ?? 'NEW',
      sellerName: payload.sellerName ?? 'You · Verified Seller',
      rating: 4.0, ratingCount: 0, createdAt: now, updatedAt: now,
    };
    setCatalogue((list) => [product, ...list]);
    setSellOpen(false);
    setFilters(DEFAULT_FILTERS);
    toast('🎉 Your listing is live!');
    setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 150);
  };

  const shopLaptops = () => {
    setFilters({ ...DEFAULT_FILTERS, category: 'LAPTOP', maxPrice: 60000, inStockOnly: true });
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleWish = (id: string) =>
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));

  return (
    <div className="app">
      <Header
        query={filters.q}
        onQuery={(q) => setFilters((f) => ({ ...f, q }))}
        onSearch={() => { logEvent('SEARCH', filters.q); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
        category={filters.category}
        onCategory={(c) => setFilters((f) => ({ ...f, category: c }))}
        cartCount={cartCount}
        onOpenCart={() => { setOrdered(false); setCartOpen(true); }}
        onOpenSell={() => setSellOpen(true)}
        onHome={() => { setFilters(DEFAULT_FILTERS); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />

      <main>
        <Hero onShopLaptops={shopLaptops} onSell={() => setSellOpen(true)} />

        <section className="shop" id="products" aria-label="Products">
          <div className="shop-head">
            <h2>{filters.category === 'ALL' ? 'All Products' : filters.category} <span>· {results.length} found</span></h2>
            <button className="btn btn-light mobile-only" type="button" onClick={() => setMobileFilters((v) => !v)}>{mobileFilters ? 'Hide filters' : '⚙️ Filters'}</button>
          </div>
          <div className="shop-body">
            <div className={mobileFilters ? 'show' : ''} style={{ display: mobileFilters ? 'block' : undefined }}>
              <Filters filters={filters} onChange={setFilters} resultCount={results.length} totalCount={catalogue.length} />
            </div>
            <div className="shop-main">
              {loading ? (
                <div className="empty"><div className="spinner" aria-label="Loading products" /><p>Loading products…</p></div>
              ) : results.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">🔍</div>
                  <h3>No products match your filters</h3>
                  <p>Try a different search or clear the filters to see the full catalogue.</p>
                  <button className="btn btn-primary" type="button" onClick={() => setFilters(DEFAULT_FILTERS)}>Clear filters</button>
                </div>
              ) : (
                <div className="grid">
                  {results.map((p) => (
                    <ProductCard key={p.id} product={p} wished={wishlist.includes(p.id)} onWish={toggleWish}
                      onOpen={(prod) => { setSelected(prod); logEvent('VIEW', undefined, prod.id); }}
                      onAdd={(prod) => addToCart(prod)} />
                  ))}
                </div>
              )}
              <PerfPanel metrics={metrics} fromApi={fromApi} />
            </div>
          </div>
        </section>

        <section className="perks" aria-label="Why SmartMarket">
          <div className="perk"><span>🛡️</span><b>Buyer Protection</b><p>Full refund if your order doesn't arrive as described.</p></div>
          <div className="perk"><span>🚚</span><b>Fast Delivery</b><p>Free delivery above ₹499. 2–4 days across India.</p></div>
          <div className="perk"><span>💳</span><b>Secure Payments</b><p>UPI, cards, net banking &amp; cash on delivery.</p></div>
          <div className="perk"><span>↩️</span><b>Easy Returns</b><p>7-day no-questions-asked returns on most products.</p></div>
        </section>
      </main>

      <Footer />

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onAdd={(p, q) => { addToCart(p, q); setSelected(null); }} onBuy={buyNow} />}
      {sellOpen && <SellModal onClose={() => setSellOpen(false)} onSubmit={handleSell} />}
      {cartOpen && (
        <CartDrawer items={cartItems} onClose={() => setCartOpen(false)}
          onQty={(id, qty) => setCart((c) => ({ ...c, [id]: qty }))}
          onRemove={(id) => setCart((c) => { const n = { ...c }; delete n[id]; return n; })}
          onCheckout={checkout} ordered={ordered} />
      )}

      <div className="toasts" aria-live="polite">
        {toasts.map((t) => <div className="toast" key={t.id}>{t.msg}</div>)}
      </div>
    </div>
  );
}
