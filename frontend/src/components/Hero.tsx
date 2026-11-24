import { useEffect, useState } from 'react';

interface Props {
  onShopLaptops: () => void;
  onSell: () => void;
}

function useCountdown() {
  const [left, setLeft] = useState({ h: 11, m: 42, s: 18 });
  useEffect(() => {
    const t = setInterval(() => {
      setLeft((v) => {
        let { h, m, s } = v;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 23; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(left.h)}:${pad(left.m)}:${pad(left.s)}`;
}

export default function Hero({ onShopLaptops, onSell }: Props) {
  const countdown = useCountdown();
  return (
    <section className="hero" aria-label="Featured offers">
      <div className="hero-main">
        <div className="hero-copy">
          <span className="hero-eyebrow">⚡ Grand Tech Fest · Ends in {countdown}</span>
          <h1>Laptops under ₹60,000.<br /><span>Phones, watches &amp; more.</span></h1>
          <p>India's trusted marketplace for new &amp; verified products. Best prices, genuine sellers, doorstep delivery.</p>
          <div className="hero-ctas">
            <button className="btn btn-primary btn-lg" onClick={onShopLaptops} type="button">Shop Laptops →</button>
            <button className="btn btn-outline btn-lg" onClick={onSell} type="button">Start Selling</button>
          </div>
          <div className="hero-trust">
            <span>⭐ 4.6/5 · 2M+ ratings</span>
            <span>🛡️ 100% buyer protection</span>
            <span>🚚 2–4 day delivery</span>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80"
            alt="Premium laptop on a desk"
            loading="eager"
          />
          <div className="hero-card-float">
            <b>AeroBook Pro 14"</b>
            <span>₹54,990 <s>₹64,990</s> <em>15% OFF</em></span>
          </div>
        </div>
      </div>

      <div className="promo-row">
        <button className="promo-card promo-a" onClick={onShopLaptops} type="button">
          <span className="promo-tag">Laptops</span>
          <b>From ₹38,990</b>
          <small>Programming-ready picks →</small>
        </button>
        <button className="promo-card promo-b" onClick={onShopLaptops} type="button">
          <span className="promo-tag">Mobiles</span>
          <b>5G from ₹42,999</b>
          <small>Latest launches →</small>
        </button>
        <button className="promo-card promo-c" onClick={onShopLaptops} type="button">
          <span className="promo-tag">Audio &amp; Wearables</span>
          <b>Up to 40% OFF</b>
          <small>Earbuds, watches &amp; more →</small>
        </button>
      </div>
    </section>
  );
}
