export type Category =
  | 'LAPTOP' | 'MOBILE' | 'TABLET' | 'WATCH' | 'AUDIO'
  | 'ACCESSORY' | 'DISPLAY' | 'FASHION' | 'HOME' | 'VEHICLE' | 'APPLIANCE' | 'OTHER';

export type Condition = 'NEW' | 'USED';

export interface Product {
  id: string;
  title: string;
  description: string;
  category: Category;
  price: number;
  mrp?: number;
  stock: number;
  version: number;
  imageUrl: string;
  location: string;
  condition: Condition;
  sellerName: string;
  rating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  q: string;
  category: Category | 'ALL';
  maxPrice: number | null;
  inStockOnly: boolean;
  condition: Condition | 'ALL';
  sort: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

export interface SearchMetrics {
  scanned: number;
  comparisons: number;
  blocksRead: number;
  elapsedMs: number;
  matchedIds: string[];
  costModel: {
    ramOps: number;
    blockTransfers: number;
    pramSteps: number;
    work: number;
    span: number;
    blockSize: number;
    processors: number;
  };
  oraclePass: boolean;
}

export interface CartItem {
  productId: string;
  qty: number;
}

export const CATEGORY_LABELS: Record<Category | 'ALL', string> = {
  ALL: 'All Categories',
  LAPTOP: 'Laptops',
  MOBILE: 'Mobiles',
  TABLET: 'Tablets',
  WATCH: 'Watches',
  AUDIO: 'Audio',
  ACCESSORY: 'Accessories',
  DISPLAY: 'TVs & Displays',
  FASHION: 'Fashion',
  HOME: 'Home & Living',
  VEHICLE: 'Vehicles',
  APPLIANCE: 'Appliances',
  OTHER: 'Other',
};

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
