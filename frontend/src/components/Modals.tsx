import { useEffect, useState } from 'react';
import { CATEGORY_LABELS, inr, type Category, type Product } from '../types';

/* ---------------- Product detail ---------------- */
interface DetailProps {
  product: Product;
  onClose: () => void;
  onAdd: (p: Product, qty: number) => void;
  onBuy: (p: Product, qty: number) => void;
}

export function ProductModal({ product: p, onClose, onAdd, onBuy }: DetailProps) {
  const [qty, setQty] = useState(1);
  const discount = p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  const out = p.stock <= 0;
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={p.title}>
      <div className="modal detail" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close" type="button">✕</button>
        <div className="detail-img">
          <img src={p.imageUrl} alt={p.title} />
          {discount > 0 && <span className="p-off big">{discount}% OFF</span>}
        </div>
        <div className="detail-body">
          <div className="p-seller">✓ {p.sellerName} · {p.location} · {CATEGORY_LABELS[p.category]}</div>
          <h2>{p.title}</h2>
          <div className="p-rating"><span className="stars">{'★'.repeat(Math.round(p.rating))}<i>{'★'.repeat(5 - Math.round(p.rating))}</i></span><small>{p.rating} · {p.ratingCount.toLocaleString('en-IN')} ratings</small></div>
          <div className="detail-price">{inr(p.price)} {p.mrp && <><s>{inr(p.mrp)}</s> <em>{discount}% off</em></>}</div>
          <p className="detail-desc">{p.description}</p>
          <ul className="detail-meta">
            <li><b>Condition:</b> {p.condition}</li>
            <li><b>Stock:</b> {out ? 'Out of stock' : `${p.stock} available`}</li>
            <li><b>Delivery:</b> Free · 2–4 days · 7-day returns</li>
            <li><b>Product ID:</b> {p.id} · Version {p.version}</li>
          </ul>
          <div className="qty-row">
            <span>Qty</span>
            <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">−</button>
            <b>{qty}</b>
            <button type="button" onClick={() => setQty(Math.min(Math.max(1, p.stock), qty + 1))} aria-label="Increase quantity">+</button>
          </div>
          <div className="detail-actions">
            <button className="btn btn-cart btn-lg" disabled={out} onClick={() => onAdd(p, qty)} type="button">🛒 Add to Cart</button>
            <button className="btn btn-buy btn-lg" disabled={out} onClick={() => onBuy(p, qty)} type="button">⚡ Buy Now</button>
          </div>
          <p className="detail-note">🛡️ Buyer protection · Genuine product guaranteed · Secure checkout</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Sell ---------------- */
interface SellProps {
  onClose: () => void;
  onSubmit: (p: Partial<Product>) => void;
}

const SELL_CATS: Category[] = ['LAPTOP', 'MOBILE', 'TABLET', 'WATCH', 'AUDIO', 'ACCESSORY', 'DISPLAY', 'FASHION', 'HOME', 'VEHICLE', 'APPLIANCE', 'OTHER'];
const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80';

export function SellModal({ onClose, onSubmit }: SellProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('LAPTOP');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [stock, setStock] = useState('1');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState<'NEW' | 'USED'>('NEW');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(price);
    if (!title.trim()) return setError('Please add a product title.');
    if (!priceNum || priceNum <= 0) return setError('Please enter a valid price.');
    if (!location.trim()) return setError('Please add your location.');
    onSubmit({
      title: title.trim(),
      category,
      price: priceNum,
      mrp: mrp ? Number(mrp) : undefined,
      stock: Math.max(0, Number(stock) || 0),
      location: location.trim(),
      condition,
      description: description.trim() || 'Quality product listed by a verified seller. Message for details.',
      imageUrl: imageUrl.trim() || PLACEHOLDER_IMG,
      sellerName: 'You · Verified Seller',
    });
  };

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Sell a product">
      <div className="modal sell" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close" type="button">✕</button>
        <h2>📸 Sell your product</h2>
        <p className="modal-sub">Reach millions of buyers. Listing is free — you only pay when you sell.</p>
        <form onSubmit={submit} className="sell-form">
          <label>Product title *<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. AeroBook Pro 14 — i5 / 16GB / 512GB" /></label>
          <div className="sell-row">
            <label>Category
              <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {SELL_CATS.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </label>
            <label>Condition
              <select value={condition} onChange={(e) => setCondition(e.target.value as 'NEW' | 'USED')}>
                <option value="NEW">New</option><option value="USED">Used</option>
              </select>
            </label>
          </div>
          <div className="sell-row">
            <label>Your price (₹) *<input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="54990" /></label>
            <label>MRP (₹)<input type="number" min="0" value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="64990" /></label>
            <label>Stock<input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} /></label>
          </div>
          <label>Location *<input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bengaluru" /></label>
          <label>Photo URL<input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Paste an image link (optional — we add a cover photo)" /></label>
          {imageUrl.trim() && <img className="sell-preview" src={imageUrl.trim()} alt="Product preview" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
          <label>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Condition, specs, warranty, what's included…" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn-primary btn-lg" type="submit">Publish Listing →</button>
          <p className="modal-sub center">By publishing you agree to seller terms. Your listing goes live instantly.</p>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Cart ---------------- */
interface CartProps {
  items: { product: Product; qty: number }[];
  onClose: () => void;
  onQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  ordered: boolean;
}

export function CartDrawer({ items, onClose, onQty, onRemove, onCheckout, ordered }: CartProps) {
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const savings = items.reduce((s, i) => s + ((i.product.mrp ?? i.product.price) - i.product.price) * i.qty, 0);
  const delivery = subtotal === 0 || subtotal >= 499 ? 0 : 49;
  return (
    <div className="overlay right" onClick={onClose} role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>🛒 Your Cart ({items.reduce((s, i) => s + i.qty, 0)})</h2>
          <button className="modal-x static" onClick={onClose} aria-label="Close cart" type="button">✕</button>
        </div>
        {ordered ? (
          <div className="order-done">
            <div className="done-icon">✅</div>
            <h3>Order placed!</h3>
            <p>Thank you for shopping with SmartMarket. Your order is confirmed and will be delivered in 2–4 days. Track it from Orders.</p>
            <button className="btn btn-primary btn-lg" onClick={onClose} type="button">Continue Shopping</button>
          </div>
        ) : items.length === 0 ? (
          <div className="order-done">
            <div className="done-icon">🛍️</div>
            <h3>Your cart is empty</h3>
            <p>Add something you love — laptops, phones, watches and more are waiting.</p>
            <button className="btn btn-primary btn-lg" onClick={onClose} type="button">Browse Products</button>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {items.map(({ product: p, qty }) => (
                <div className="cart-item" key={p.id}>
                  <img src={p.imageUrl} alt={p.title} />
                  <div className="cart-info">
                    <b>{p.title}</b>
                    <span>{inr(p.price)} · {p.location}</span>
                    <div className="cart-qty">
                      <button type="button" onClick={() => onQty(p.id, Math.max(1, qty - 1))} aria-label="Decrease">−</button>
                      <b>{qty}</b>
                      <button type="button" onClick={() => onQty(p.id, Math.min(p.stock, qty + 1))} aria-label="Increase">+</button>
                      <button type="button" className="remove" onClick={() => onRemove(p.id)}>Remove</button>
                    </div>
                  </div>
                  <b className="cart-line">{inr(p.price * qty)}</b>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <div><span>Subtotal</span><b>{inr(subtotal)}</b></div>
              <div><span>Delivery</span><b>{delivery === 0 ? 'FREE' : inr(delivery)}</b></div>
              <div className="save"><span>You save</span><b>{inr(savings)}</b></div>
              <div className="total"><span>Total</span><b>{inr(subtotal + delivery)}</b></div>
              <button className="btn btn-primary btn-lg full" onClick={onCheckout} type="button">Proceed to Checkout →</button>
              <p className="modal-sub center">🔒 Secure payments · UPI, cards &amp; net banking</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
