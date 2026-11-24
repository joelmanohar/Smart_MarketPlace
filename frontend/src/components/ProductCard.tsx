import { inr, type Product } from '../types';

interface Props {
  product: Product;
  wished: boolean;
  onWish: (id: string) => void;
  onOpen: (p: Product) => void;
  onAdd: (p: Product) => void;
}

export default function ProductCard({ product: p, wished, onWish, onOpen, onAdd }: Props) {
  const discount = p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  const out = p.stock <= 0;
  return (
    <article className={`p-card ${out ? 'out' : ''}`}>
      <div className="p-img" onClick={() => onOpen(p)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onOpen(p)} aria-label={`View ${p.title}`}>
        <img src={p.imageUrl} alt={p.title} loading="lazy" />
        {discount > 0 && <span className="p-off">{discount}% OFF</span>}
        <button
          className={`wish ${wished ? 'on' : ''}`}
          onClick={(e) => { e.stopPropagation(); onWish(p.id); }}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          type="button"
        >{wished ? '❤️' : '🤍'}</button>
        {out && <span className="p-out-badge">Out of stock</span>}
        <span className="p-cond">{p.condition}</span>
      </div>
      <div className="p-body">
        <div className="p-seller">✓ {p.sellerName} · {p.location}</div>
        <h3 className="p-title" onClick={() => onOpen(p)}>{p.title}</h3>
        <div className="p-rating">
          <span className="stars">{'★'.repeat(Math.round(p.rating))}<i>{'★'.repeat(5 - Math.round(p.rating))}</i></span>
          <small>{p.rating} ({p.ratingCount.toLocaleString('en-IN')})</small>
        </div>
        <div className="p-price">{inr(p.price)} {p.mrp && <s>{inr(p.mrp)}</s>}</div>
        <div className="p-stock">{out ? 'Notify me when available' : p.stock <= 5 ? `Only ${p.stock} left — order soon` : 'In stock · Free delivery'}</div>
        <div className="p-actions">
          <button className="btn btn-cart" disabled={out} onClick={() => onAdd(p)} type="button">🛒 Add to Cart</button>
          <button className="btn btn-buy" disabled={out} onClick={() => onOpen(p)} type="button">Buy Now</button>
        </div>
      </div>
    </article>
  );
}
