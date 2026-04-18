// Central product catalog data
const PRODUCTS = [
  {
    id: 'effort-2-rapid',
    name: 'Effort 2 Rapid',
    shortDesc: 'Lightweight text-based AI assistant for quick on-device tasks. Fast, efficient, and completely free.',
    description: 'Effort 2 Rapid is a lightweight, fast AI assistant designed for quick on-device tasks. Built for efficiency, it runs entirely offline with zero data collection. Perfect for users who need a no-frills AI companion that just works.',
    category: 'free',
    priceUSD: 0,
    priceIDR: 0,
    discountUSD: null,
    discountIDR: null,
    images: {
      logo: './assets/products/Free Products/Effort 2 Rapid/Effort2Rapid.png',
      splash: './assets/products/Free Products/Effort 2 Rapid/Effort2RapidSplash.png'
    },
    videoId: '6HAeelFf-5k',
    features: ['100% offline', 'Lightweight & fast', 'Zero data collection', 'Free forever', 'Windows only']
  },
  {
    id: 'sweet-juices-lite',
    name: 'Sweet Juices Lite',
    shortDesc: 'Free AI-powered creative tool for everyday use. Generate ideas and content on-device.',
    description: 'Sweet Juices Lite is a free AI-powered creative tool that runs entirely on your device. Generate ideas, draft content, and explore AI creativity — all without an internet connection. A taste of what Sweet Juices can do.',
    category: 'free',
    priceUSD: 0,
    priceIDR: 0,
    discountUSD: null,
    discountIDR: null,
    images: {
      logo: './assets/products/Free Products/Sweet Juices Lite/SJLite.png',
      splash: './assets/products/Free Products/Sweet Juices Lite/SJliteSplash.png'
    },
    features: ['100% offline', 'Creative AI assistant', 'On-device processing', 'Free forever', 'Windows only']
  },
  {
    id: 'effort-2-plus',
    name: 'Effort 2 Plus',
    shortDesc: 'Premium multimodal AI assistant with advanced capabilities and 3 built-in modes: Rapid, FastVL, ThinkVL.',
    description: 'Effort 2 Plus is the premium evolution of Effort 2 Rapid. Packed with advanced AI capabilities, enhanced model quality, and extended features — all running privately on your device. For users who demand more from their AI assistant.',
    category: 'premium',
    priceUSD: 9.36,
    priceIDR: 160000,
    discountUSD: null,
    discountIDR: null,
    images: {
      logo: './assets/products/Premium Products/Effort 2 Plus/Effort2Plus.png',
      splash: './assets/products/Premium Products/Effort 2 Plus/Effort2PlusSplash.png'
    },
    videoId2: '2IBtau9cnN8',
    dodoLink: 'https://checkout.dodopayments.com/buy/pdt_0NcXcoZDnziuqdKSBEiC0?quantity=1&redirect_url=https://ai.bangorinas.com', // Replace with Dodo Payment Link from dashboard
    features: ['Advanced AI model', '100% offline & private', 'Extended features', 'Priority updates', 'Windows only']
  },
  {
    id: 'sweet-juices-peak',
    name: 'Sweet Juices Peak',
    shortDesc: 'The ultimate AI creative & analytical suite. Maximum tools, maximum capability.',
    description: 'Sweet Juices Peak is the ultimate AI creative & analytical suite — the full power of Sweet Juices with maximum capability. Advanced generation, deeper creativity tools, and premium model quality to analyze and create. Everything runs on-device for complete privacy.',
    category: 'premium',
    priceUSD: 11.70,
    priceIDR: 200000,
    discountUSD: null,
    discountIDR: null,
    images: {
      logo: './assets/products/Premium Products/Sweet Juices Peak/SJPeak.png',
      splash: './assets/products/Premium Products/Sweet Juices Peak/SJSplash.png'
    },
    dodoLink: 'https://checkout.dodopayments.com/buy/pdt_0NcXd6oRSNiJ7JPGmQu4S?quantity=1&redirect_url=https://ai.bangorinas.com', // Replace with Dodo Payment Link from dashboard
    features: ['Premium AI model', 'Full creative suite', '100% offline & private', 'Priority updates', 'Windows only']
  },
  {
    id: 'nuclear-bundle',
    name: 'NuClear Bundle',
    shortDesc: 'The complete AI suite — Effort 2 Plus & Sweet Juices Peak together at 50% off, plus a free OutVibe bonus.',
    description: 'NuClear is the ultimate AI bundle. Get Effort 2 Plus and Sweet Juices Peak together at an incredible 50% discount — plus receive OutVibe, our AI-coding companion app, completely free. Three powerful offline AI apps for the price of one.',
    category: 'bundle',
    priceUSD: 21.00,
    priceIDR: 360000,
    discountUSD: 10.50,
    discountIDR: 180000,
    images: {
      logo: './assets/products/NuClear Bundle - AI Suite/NuClear Icon.png',
      splash: './assets/products/NuClear Bundle - AI Suite/NuClear_Teaser_1600x900.png'
    },
    dodoLink: 'https://checkout.dodopayments.com/buy/pdt_0NcXdOXkV8cLZSK3HAExJ?quantity=1&redirect_url=https://ai.bangorinas.com', // Replace with Dodo Payment Link from dashboard
    features: ['3 apps in 1 bundle', '50% discount', 'Free OutVibe bonus', 'Complete AI suite', 'Windows only'],
    includedProducts: [
      { id: 'effort-2-plus', name: 'Effort 2 Plus', desc: 'Premium AI assistant', bonus: false },
      { id: 'sweet-juices-peak', name: 'Sweet Juices Peak', desc: 'Premium creative suite', bonus: false },
      { id: 'outvibe', name: 'OutVibe', desc: 'AI-coding companion', bonus: true }
    ]
  }
];

// Helper: get product by ID
function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

// Helper: get products by category
function getProductsByCategory(category) {
  if (!category || category === 'all') return PRODUCTS;
  return PRODUCTS.filter(p => p.category === category);
}

// Helper: format price display
function formatPrice(product) {
  if (product.category === 'free') return 'Free';
  const usd = product.discountUSD ?? product.priceUSD;
  const idr = product.discountIDR ?? product.priceIDR;
  return `$${usd.toFixed(2)}`;
}

function formatPriceIDR(product) {
  if (product.category === 'free') return 'Gratis';
  const idr = product.discountIDR ?? product.priceIDR;
  return `Rp ${idr.toLocaleString('id-ID')}`;
}

// Helper: get badge class for category
function getBadgeClass(category) {
  const map = { free: 'badge-free', premium: 'badge-premium', bundle: 'badge-bundle' };
  return map[category] || 'badge-free';
}

// Helper: get badge label
function getBadgeLabel(category) {
  const map = { free: 'Free', premium: 'Premium', bundle: 'Bundle' };
  return map[category] || category;
}
