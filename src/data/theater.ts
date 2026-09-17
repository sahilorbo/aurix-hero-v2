export const beautyQuery =
  'lightweight vitamin C serum for oily, acne-prone skin under ₹1500';

export type TheaterBeat = 0 | 1 | 2 | 3 | 4;

export const parseChips = [
  { id: 'skin', label: 'oily + acne-prone', tone: 'mint' as const },
  { id: 'goal', label: 'pigmentation · brightening', tone: 'mint' as const },
  { id: 'price', label: 'under ₹1500', tone: 'coral' as const },
  { id: 'texture', label: 'lightweight serum', tone: 'mint' as const },
];

export type ProductCard = {
  id: string;
  name: string;
  price: string;
  rating: number;
  fit: number;
  tag?: string;
  highlight?: boolean;
  failReason?: string;
};

/** Ordinary keyword results — wrong texture / price / concern */
export const failProducts: ProductCard[] = [
  {
    id: 'f1',
    name: 'Heavy Vitamin C Cream',
    price: '₹2,490',
    rating: 4.1,
    fit: 22,
    failReason: 'Too rich for oily skin',
  },
  {
    id: 'f2',
    name: 'Oil-Based C Glow Oil',
    price: '₹1,890',
    rating: 3.9,
    fit: 18,
    failReason: 'Oil base · over budget',
  },
  {
    id: 'f3',
    name: 'Brightening Body Lotion',
    price: '₹799',
    rating: 4.0,
    fit: 12,
    failReason: 'Wrong category',
  },
  {
    id: 'f4',
    name: 'Retinol Night Serum',
    price: '₹1,650',
    rating: 4.4,
    fit: 28,
    failReason: 'Not vitamin C · over ₹1500',
  },
];

/** Aurix-ranked shelf */
export const aurixProducts: ProductCard[] = [
  {
    id: 'a1',
    name: 'Clarity Vit C Serum 15%',
    price: '₹1,240',
    rating: 4.8,
    fit: 96,
    tag: 'Best fit',
    highlight: true,
  },
  {
    id: 'a2',
    name: 'Aqua Bright C Gel',
    price: '₹980',
    rating: 4.6,
    fit: 91,
    tag: 'Oil-free',
  },
  {
    id: 'a3',
    name: 'Nimble C + Niacinamide',
    price: '₹1,150',
    rating: 4.7,
    fit: 88,
  },
  {
    id: 'a4',
    name: 'Lumen Drop Serum',
    price: '₹1,390',
    rating: 4.5,
    fit: 84,
  },
];

export const explainPanel = {
  title: 'Why this ranks first',
  product: 'Clarity Vit C Serum 15%',
  attributes: [
    { label: 'Texture', value: 'Water-gel · non-comedogenic' },
    { label: 'Actives', value: '15% L-ascorbic · stabilized' },
    { label: 'Skin type', value: 'Oily · acne-prone' },
    { label: 'Price', value: '₹1,240 · under ₹1500' },
  ],
  compatibility: 'Pairs with niacinamide; skip with strong acids same AM',
  sentiment: '4.8★ · “didn’t clog pores” · “faded dark spots in 3 weeks”',
  fitScore: 96,
};

export const beatLabels = [
  'Keyword search fails',
  'She types what she means',
  'Aurix parses intent',
  'Shelf re-ranks + explains',
  'Moment recovered',
] as const;
