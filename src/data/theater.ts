export const beautyQuery =
  'lightweight vitamin C serum for oily, acne-prone skin under ₹1500';

/** 6 beats: discovery suite → PDP / cart chapter */
export type TheaterBeat = 0 | 1 | 2 | 3 | 4 | 5;

export const BEAT_COUNT = 6;

export const beatLabels = [
  'Query',
  'Location + persona',
  'Scored fits',
  'Complete the routine',
  'PDP · similar + routine',
  'Cart · deals + urgency',
] as const;

export const parseChips = [
  { id: 'skin', label: 'oily + acne-prone', tone: 'mint' as const },
  { id: 'goal', label: 'pigmentation · brightening', tone: 'mint' as const },
  { id: 'price', label: 'under ₹1500', tone: 'coral' as const },
  { id: 'texture', label: 'lightweight serum', tone: 'mint' as const },
];

export const locationContext = {
  city: 'Mumbai',
  climate: 'Humid · 31°C',
  chips: [
    { id: 'loc', label: 'Mumbai · humid', tone: 'mint' as const },
    { id: 'weather', label: 'monsoon-ready textures', tone: 'mint' as const },
    { id: 'ship', label: 'same-day Bandra', tone: 'coral' as const },
  ],
};

export const persona = {
  name: 'Aisha',
  initials: 'A',
  traits: ['Oily T-zone', 'Acne-prone', 'SPF skipper'],
  note: 'Prefers water-gels · avoids fragrance',
};

export type ProductCard = {
  id: string;
  name: string;
  price: string;
  rating: number;
  fit: number;
  tag?: string;
  highlight?: boolean;
  failReason?: string;
  attrs?: string[];
};

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

export const aurixProducts: ProductCard[] = [
  {
    id: 'a1',
    name: 'Clarity Vit C Serum 15%',
    price: '₹1,240',
    rating: 4.8,
    fit: 96,
    tag: 'Best fit',
    highlight: true,
    attrs: ['Water-gel', 'Non-comedogenic', 'Humid-climate'],
  },
  {
    id: 'a2',
    name: 'Aqua Bright C Gel',
    price: '₹980',
    rating: 4.6,
    fit: 91,
    tag: 'Oil-free',
    attrs: ['Oil-free', 'Acne-safe'],
  },
  {
    id: 'a3',
    name: 'Nimble C + Niacinamide',
    price: '₹1,150',
    rating: 4.7,
    fit: 88,
    attrs: ['Barrier-friendly'],
  },
  {
    id: 'a4',
    name: 'Lumen Drop Serum',
    price: '₹1,390',
    rating: 4.5,
    fit: 84,
    attrs: ['Under ₹1500'],
  },
];

export const explainPanel = {
  title: 'Compatibility',
  product: 'Clarity Vit C Serum 15%',
  attributes: [
    { label: 'Texture', value: 'Water-gel · non-comedogenic' },
    { label: 'Actives', value: '15% L-ascorbic · stabilized' },
    { label: 'Persona', value: 'Oily · acne-prone · Aisha' },
    { label: 'Locale', value: 'Mumbai humidity match' },
  ],
  compatibility: 'Pairs with niacinamide; skip with strong acids same AM',
  sentiment: '4.8★ · “didn’t clog pores” · “faded dark spots in 3 weeks”',
  fitScore: 96,
};

export const routineItems = [
  {
    id: 'r1',
    step: 'AM',
    name: 'Clarity Vit C Serum 15%',
    role: 'Hero · brightening',
    price: '₹1,240',
    fit: 96,
    primary: true,
  },
  {
    id: 'r2',
    step: 'Seal',
    name: 'Airy Gel Moisturizer',
    role: 'Oil-free seal',
    price: '₹690',
    fit: 92,
  },
  {
    id: 'r3',
    step: 'SPF',
    name: 'Invisible Fluid SPF 50',
    role: 'Complete the routine',
    price: '₹850',
    fit: 94,
  },
];

export const similarItems = [
  {
    id: 's1',
    name: 'Aqua Bright C Gel',
    price: '₹980',
    fit: 91,
    why: 'Same concern · lighter',
  },
  {
    id: 's2',
    name: 'Nimble C + Niacinamide',
    price: '₹1,150',
    fit: 88,
    why: 'Barrier + brighten',
  },
  {
    id: 's3',
    name: 'Lumen Drop Serum',
    price: '₹1,390',
    fit: 84,
    why: 'Travel size vibe',
  },
];

export const pdpHero = {
  name: 'Clarity Vit C Serum 15%',
  price: '₹1,240',
  fit: 96,
  stock: 'Only 2 left',
  stockTone: 'urgent' as const,
  badges: ['Best fit', 'Persona match', 'Humidity-safe'],
};

export const cartState = {
  line: {
    name: 'Clarity Vit C Serum 15%',
    price: '₹1,240',
    qty: 1,
  },
  routineAttach: [
    { id: 'c1', name: 'Airy Gel Moisturizer', price: '₹690', added: true },
    { id: 'c2', name: 'Invisible Fluid SPF 50', price: '₹850', added: false },
  ],
  deals: [
    {
      id: 'd1',
      label: 'Go-wild Monday',
      offer: 'SPF −15% when paired with Vit C',
      timer: 'ends 11:59pm',
    },
    {
      id: 'd2',
      label: 'Deals for you',
      offer: 'Gel moisturizer free ship tonight',
      timer: 'Aisha · Mumbai',
    },
  ],
  urgency: [
    { id: 'u1', text: 'Only 2 left in Bandra hub', tone: 'urgent' as const },
    { id: 'u2', text: 'Out of stock in ~2 hours at this velocity', tone: 'warn' as const },
  ],
};

export const goWildMonday = {
  title: 'Go-wild Monday',
  subtitle: 'Persona deals unlock after fit',
  offer: 'Complete-the-routine SPF −15% · today only',
};
