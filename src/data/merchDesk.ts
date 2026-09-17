export type MerchCard = {
  id: string;
  type: 'unmet' | 'zero' | 'ranking' | 'routine';
  typeLabel: string;
  title: string;
  problem: string;
  proposal: string;
  impact: string;
  tone: 'coral' | 'mint' | 'amber';
};

export const merchCards: MerchCard[] = [
  {
    id: 'm1',
    type: 'unmet',
    typeLabel: 'Unmet demand',
    title: 'Fragrance-free retinol',
    problem: '1,240 searches last 30 days with no strong match in catalog.',
    proposal: 'Pin “Quiet Retinol 0.3% (fragrance-free)” to top for this query cluster.',
    impact: '+est. 180 recoverable sessions / mo',
    tone: 'coral',
  },
  {
    id: 'm2',
    type: 'zero',
    typeLabel: 'Zero-result',
    title: 'Refillable foundation',
    problem: 'Zero-result rate spiked on “refillable foundation” and close variants.',
    proposal: 'Map synonyms → “refill pouch foundation” SKUs; surface refill companions.',
    impact: '−70% zero-result on cluster',
    tone: 'coral',
  },
  {
    id: 'm3',
    type: 'ranking',
    typeLabel: 'Ranking boost',
    title: 'Oil-free Vit C for acne-prone',
    problem: 'High-intent queries convert poorly; cream textures still rank above gels.',
    proposal: 'Boost oil-free vitamin C serums when skin-type = oily / acne-prone.',
    impact: '+12% CVR on cluster (pilot)',
    tone: 'mint',
  },
  {
    id: 'm4',
    type: 'routine',
    typeLabel: 'Routine gap',
    title: 'Serum without SPF companion',
    problem: 'Shoppers buy AM vitamin C but leave without SPF — routine incomplete.',
    proposal: 'Attach “complete the routine” SPF pair under serum PDP + search rail.',
    impact: '+₹180 AOV on attach rate',
    tone: 'amber',
  },
];
