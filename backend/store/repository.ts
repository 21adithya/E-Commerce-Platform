import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  IUser,
  IProduct,
  IOrder,
  UserModel,
  ProductModel,
  OrderModel,
} from '../models/schemas.js';

const IMG_HERO_WORKSPACE = '/src/assets/images/hero_flagship_workspace_1793882040414.jpg';
const IMG_HEADPHONES = '/src/assets/images/product_headphones_pro_1793882040985.jpg';
const IMG_ESPRESSO = '/src/assets/images/product_espresso_machine_1793882043467.jpg';
const IMG_SMARTWATCH = '/src/assets/images/product_smartwatch_titanium_1793882043708.jpg';
const IMG_CHAIR = '/src/assets/images/product_ergonomic_chair_1793882044259.jpg';

const customerPasswordHash = bcrypt.hashSync('password123', 10);
const adminPasswordHash = bcrypt.hashSync('admin123', 10);

export const SEED_USERS: IUser[] = [
  {
    id: 'usr-customer-1',
    name: 'Alex Rivera',
    email: 'customer@amazona.com',
    passwordHash: customerPasswordHash,
    role: 'customer',
    shippingAddress: {
      fullName: 'Alex Rivera',
      street: '742 Evergreen Terrace, Apt 4B',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'United States',
      phone: '(206) 555-0194',
    },
    createdAt: '2026-08-14T10:15:00.000Z',
  },
  {
    id: 'usr-admin-1',
    name: 'Elena Vance (Admin)',
    email: 'admin@amazona.com',
    passwordHash: adminPasswordHash,
    role: 'admin',
    shippingAddress: {
      fullName: 'Elena Vance',
      street: '410 Terry Ave N, Suite 900',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98109',
      country: 'United States',
      phone: '(206) 555-0101',
    },
    createdAt: '2026-06-01T08:00:00.000Z',
  },
  {
    id: 'usr-customer-2',
    name: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    passwordHash: customerPasswordHash,
    role: 'customer',
    shippingAddress: {
      fullName: 'Marcus Chen',
      street: '1280 Market Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'United States',
      phone: '(415) 555-0182',
    },
    createdAt: '2026-09-20T14:22:00.000Z',
  },
  {
    id: 'usr-customer-3',
    name: 'Sophia Lindqvist',
    email: 'sophia.l@example.com',
    passwordHash: customerPasswordHash,
    role: 'customer',
    shippingAddress: {
      fullName: 'Sophia Lindqvist',
      street: '85 Broad Street, Floor 18',
      city: 'New York',
      state: 'NY',
      postalCode: '10004',
      country: 'United States',
      phone: '(212) 555-0147',
    },
    createdAt: '2026-10-03T18:40:00.000Z',
  },
];

export const SEED_PRODUCTS: IProduct[] = [
  {
    id: 'prd-101',
    sku: 'AMZ-AUD-901',
    title: 'Noir Studio Pro Wireless Noise-Canceling Headphones',
    slug: 'noir-studio-pro-wireless-headphones',
    category: 'Audio & Tech',
    brand: 'Noir Audio',
    price: 279.00,
    originalPrice: 349.00,
    rating: 4.9,
    numReviews: 3,
    stock: 28,
    image: IMG_HEADPHONES,
    features: [
      'Adaptive 8-microphone hybrid active noise cancellation (-45dB)',
      'Custom 45mm beryllium-coated dynamic acoustic drivers',
      '42-hour continuous battery runtime with USB-C rapid charge',
      'Multipoint Bluetooth 5.4 with lossless LDAC and aptX Adaptive',
    ],
    description:
      'Engineered for audiophiles and studio professionals, the Noir Studio Pro combines precision matte-black acoustics with brushed bronze anodized hinges. Memory-foam protein leather earcups isolate ambient noise while preserving studio-grade sub-bass and vocal clarity.',
    isFeatured: true,
    reviews: [
      {
        id: 'rev-1',
        userId: 'usr-customer-1',
        userName: 'Alex Rivera',
        rating: 5,
        title: 'Best noise isolation I have ever tested on a cross-country flight',
        comment:
          'The brushed bronze hardware feels extraordinarily solid and the acoustic staging rivals wired studio monitors twice the price. Battery easily lasts a full work week.',
        verifiedPurchase: true,
        createdAt: '2026-10-12T09:30:00.000Z',
      },
      {
        id: 'rev-2',
        userId: 'usr-customer-2',
        userName: 'Marcus Chen',
        rating: 5,
        title: 'Multipoint switching between MacBook and phone is instant',
        comment:
          'Zero clamping fatigue during 6-hour coding sessions. The tactile physical controls on the earcup are far better than finicky touch panels.',
        verifiedPurchase: true,
        createdAt: '2026-10-18T16:45:00.000Z',
      },
      {
        id: 'rev-3',
        userId: 'usr-customer-3',
        userName: 'Sophia Lindqvist',
        rating: 4.7,
        title: 'Rich warm sound signature right out of the box',
        comment:
          'Love the carrying case and USB-C DAC mode. Highly recommended for open-office work.',
        verifiedPurchase: true,
        createdAt: '2026-10-24T11:10:00.000Z',
      },
    ],
    createdAt: '2026-07-01T00:00:00.000Z',
  },
  {
    id: 'prd-102',
    sku: 'AMZ-HOM-402',
    title: 'Barista Linea Dual-Boiler Commercial Espresso Machine',
    slug: 'barista-linea-dual-boiler-espresso-machine',
    category: 'Home & Kitchen',
    brand: 'Milano Craft',
    price: 649.00,
    originalPrice: 799.00,
    rating: 4.8,
    numReviews: 2,
    stock: 14,
    image: IMG_ESPRESSO,
    features: [
      'Independent PID-regulated brew and steam stainless steel boilers',
      'Commercial 58mm walnut portafilter with precision 15-bar Italian pump',
      'Analog brew-pressure manometer and cool-touch articulating steam wand',
      'Pre-infusion profiling for balanced extraction and rich crema',
    ],
    description:
      'Bring authentic Italian cafe extraction to your kitchen counter. Crafted from heavy-gauge brushed 304 stainless steel with a solid walnut portafilter handle, the Barista Linea maintains thermal stability within 0.5°C shot after shot.',
    isFeatured: true,
    reviews: [
      {
        id: 'rev-4',
        userId: 'usr-customer-3',
        userName: 'Sophia Lindqvist',
        rating: 5,
        title: 'Cafe-grade microfoam and rock-solid temperature control',
        comment:
          'Upgraded from an entry-level appliance and the difference in espresso sweetness and steam power is night and day. The pressure gauge makes dialing in beans effortless.',
        verifiedPurchase: true,
        createdAt: '2026-10-15T08:20:00.000Z',
      },
      {
        id: 'rev-5',
        userId: 'usr-customer-1',
        userName: 'Alex Rivera',
        rating: 4.6,
        title: 'Built like a tank with gorgeous walnut accents',
        comment:
          'Heats up in under 4 minutes and looks incredible on our kitchen stone countertop.',
        verifiedPurchase: true,
        createdAt: '2026-10-22T13:05:00.000Z',
      },
    ],
    createdAt: '2026-07-05T00:00:00.000Z',
  },
  {
    id: 'prd-103',
    sku: 'AMZ-FIT-710',
    title: 'Axiom Apex Grade-5 Titanium GPS Multisport Smartwatch',
    slug: 'axiom-apex-titanium-gps-smartwatch',
    category: 'Fitness & Outdoors',
    brand: 'Axiom Chronos',
    price: 389.00,
    originalPrice: 449.00,
    rating: 4.9,
    numReviews: 2,
    stock: 35,
    image: IMG_SMARTWATCH,
    features: [
      'Aerospace Grade-5 Titanium bezel with scratch-proof sapphire crystal',
      'Dual-frequency L1+L5 satellite GPS with offline topographic maps',
      '18-day endurance battery life with continuous HRV & SpO2 telemetry',
      '10 ATM water resistance and breathable fluoroelastomer sport strap',
    ],
    description:
      'Built for alpine endurance athletes and everyday precision, the Axiom Apex pairs a 1,500-nit LTPO AMOLED sapphire display with multi-band satellite positioning and comprehensive recovery analytics.',
    isFeatured: true,
    reviews: [
      {
        id: 'rev-6',
        userId: 'usr-customer-2',
        userName: 'Marcus Chen',
        rating: 5,
        title: 'Locked GPS signal in deep canyon trails where my old watch failed',
        comment:
          'Only charged it twice in the past month despite running 40 miles a week with GPS enabled. The sapphire crystal is completely untouched.',
        verifiedPurchase: true,
        createdAt: '2026-10-19T19:00:00.000Z',
      },
      {
        id: 'rev-7',
        userId: 'usr-customer-1',
        userName: 'Alex Rivera',
        rating: 4.8,
        title: 'Lightweight titanium casing and super legible OLED screen',
        comment:
          'The amber sport band is very comfortable and the knurled crown makes scrolling metrics with gloves easy.',
        verifiedPurchase: true,
        createdAt: '2026-10-28T07:50:00.000Z',
      },
    ],
    createdAt: '2026-07-10T00:00:00.000Z',
  },
  {
    id: 'prd-104',
    sku: 'AMZ-WRK-205',
    title: 'Zenith ErgoPro Architectural Mesh Task Chair',
    slug: 'zenith-ergopro-architectural-mesh-chair',
    category: 'Workspace & Office',
    brand: 'Zenith Seating',
    price: 529.00,
    originalPrice: 649.00,
    rating: 4.7,
    numReviews: 2,
    stock: 19,
    image: IMG_CHAIR,
    features: [
      'Dynamic dual-zone lumbar suspension that adapts to spinal posture',
      'Breathable elastomeric pellicle mesh seat and 3D headrest',
      'Die-cast polished aluminum 5-star base with silent hardwood casters',
      '4D synchronized armrests and weight-activated synchro-tilt mechanism',
    ],
    description:
      'Designed for 12-hour ergonomic support without pressure points, the Zenith ErgoPro distributes weight evenly across high-tensile elastomeric mesh while providing independent lumbar and cervical articulation.',
    isFeatured: true,
    reviews: [
      {
        id: 'rev-8',
        userId: 'usr-customer-1',
        userName: 'Alex Rivera',
        rating: 5,
        title: 'Eliminated my lower back stiffness within the first week',
        comment:
          'Assembly took 15 minutes and the polished aluminum frame feels institutional-grade. Best home office investment I have made.',
        verifiedPurchase: true,
        createdAt: '2026-10-14T15:12:00.000Z',
      },
      {
        id: 'rev-9',
        userId: 'usr-customer-3',
        userName: 'Sophia Lindqvist',
        rating: 4.5,
        title: 'Cool breathable mesh and smooth recline tension',
        comment:
          'Love the headrest articulation when leaning back during calls.',
        verifiedPurchase: true,
        createdAt: '2026-10-25T10:40:00.000Z',
      },
    ],
    createdAt: '2026-07-15T00:00:00.000Z',
  },
  {
    id: 'prd-105',
    sku: 'AMZ-ELC-880',
    title: 'Ambient Pro 16" Workstation Dock & Spatial Audio Bundle',
    slug: 'ambient-pro-workstation-dock-audio-bundle',
    category: 'Electronics',
    brand: 'Ambient Tech',
    price: 419.00,
    originalPrice: 499.00,
    rating: 4.8,
    numReviews: 1,
    stock: 22,
    image: IMG_HERO_WORKSPACE,
    features: [
      'Thunderbolt 4 14-port aluminum workstation hub with 100W Power Delivery',
      '360-degree omnidirectional Wi-Fi & AirPlay 2 room acoustic speaker',
      'Dual 4K 144Hz or single 8K 60Hz display output with 2.5Gb Ethernet',
      'Integrated UHS-II SD 4.0 card reader and 10Gbps NVMe enclosure bay',
    ],
    description:
      'Transform any laptop into a clutter-free flagship studio desk. The Ambient Pro bundle pairs a single-cable 100W Thunderbolt 4 aluminum dock with a calibrated spatial smart speaker for uncompromising productivity and sound.',
    isFeatured: true,
    reviews: [
      {
        id: 'rev-10',
        userId: 'usr-customer-2',
        userName: 'Marcus Chen',
        rating: 4.8,
        title: 'Single cable powers my 16-inch laptop and dual 4K displays effortlessly',
        comment:
          'Runs cool under load and the matching matte black speaker fills my entire study with crisp audio.',
        verifiedPurchase: true,
        createdAt: '2026-10-21T17:30:00.000Z',
      },
    ],
    createdAt: '2026-07-20T00:00:00.000Z',
  },
  {
    id: 'prd-106',
    sku: 'AMZ-AUD-915',
    title: 'Noir Reference Desktop DAC & Balanced Headphone Amplifier',
    slug: 'noir-reference-desktop-dac-headphone-amp',
    category: 'Audio & Tech',
    brand: 'Noir Audio',
    price: 199.00,
    originalPrice: 249.00,
    rating: 4.7,
    numReviews: 1,
    stock: 41,
    image: IMG_HEADPHONES,
    features: [
      '32-bit/768kHz ESS Sabre Reference DAC architecture with DSD512',
      'Fully balanced 4.4mm Pentaconn and 6.35mm single-ended outputs',
      'CNC-machined anodized aluminum chassis with analog stepped attenuator',
      'Ultra-low noise floor (-132dB SINAD) for sensitive IEMs and planar cans',
    ],
    description:
      'Unlock the full dynamic headroom of your studio headphones and powered monitors. Featuring an analog volume potentiometer and discrete Class-A output stage.',
    isFeatured: false,
    reviews: [
      {
        id: 'rev-11',
        userId: 'usr-customer-1',
        userName: 'Alex Rivera',
        rating: 4.7,
        title: 'Dead-silent background and weighted volume knob',
        comment: 'Pairs wonderfully with the Noir Studio Pro headphones in wired mode.',
        verifiedPurchase: true,
        createdAt: '2026-10-16T12:00:00.000Z',
      },
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'prd-107',
    sku: 'AMZ-HOM-418',
    title: 'Milano Conical Burr Precision Coffee Grinder (64mm Flat Burrs)',
    slug: 'milano-precision-coffee-grinder-64mm',
    category: 'Home & Kitchen',
    brand: 'Milano Craft',
    price: 229.00,
    originalPrice: 279.00,
    rating: 4.6,
    numReviews: 1,
    stock: 30,
    image: IMG_ESPRESSO,
    features: [
      '64mm titanium-coated commercial flat steel burrs for uniform particle size',
      'Stepless micrometric grind collar with 0.01mm precision markings',
      'Low-retention anti-static plasma ionizer chute and magnetic dosing cup',
      'Whisper-quiet 400 RPM brushless DC motor with auto-stop timer',
    ],
    description:
      'Engineered to pair seamlessly with the Barista Linea espresso machine, delivering zero-clump single-dose grinding from Turkish fine to cold brew coarse.',
    isFeatured: false,
    reviews: [
      {
        id: 'rev-12',
        userId: 'usr-customer-3',
        userName: 'Sophia Lindqvist',
        rating: 4.6,
        title: 'Zero static mess on the counter',
        comment: 'Consistent grind distribution and super quiet morning operation.',
        verifiedPurchase: true,
        createdAt: '2026-10-26T09:15:00.000Z',
      },
    ],
    createdAt: '2026-08-05T00:00:00.000Z',
  },
  {
    id: 'prd-108',
    sku: 'AMZ-WRK-229',
    title: 'Zenith Dual-Motor Standing Desk Frame & Acoustic Desk Mat Set',
    slug: 'zenith-dual-motor-standing-desk-set',
    category: 'Workspace & Office',
    brand: 'Zenith Seating',
    price: 349.00,
    originalPrice: 429.00,
    rating: 4.5,
    numReviews: 1,
    stock: 16,
    image: IMG_CHAIR,
    features: [
      'Dual-stage whisper motors with 355 lb lift capacity at 1.6"/sec',
      '4 programmable memory height presets with OLED digital readout',
      'Integrated under-desk steel cable management tray and power strip mount',
      'Includes merino wool felt and full-grain leather desk pad',
    ],
    description:
      'Transition effortlessly between sitting and standing throughout the workday with rock-solid steel stability and integrated cable routing.',
    isFeatured: false,
    reviews: [
      {
        id: 'rev-13',
        userId: 'usr-customer-2',
        userName: 'Marcus Chen',
        rating: 4.5,
        title: 'Zero wobble even at maximum standing height',
        comment: 'The cable management tray hides every power brick cleanly.',
        verifiedPurchase: true,
        createdAt: '2026-10-27T14:10:00.000Z',
      },
    ],
    createdAt: '2026-08-12T00:00:00.000Z',
  },
  {
    id: 'prd-109',
    sku: 'AMZ-FIT-744',
    title: 'Axiom Chest-Strap ECG Heart Rate Monitor & Cadence Pod Bundle',
    slug: 'axiom-ecg-heart-rate-cadence-bundle',
    category: 'Fitness & Outdoors',
    brand: 'Axiom Chronos',
    price: 89.00,
    originalPrice: 119.00,
    rating: 4.4,
    numReviews: 1,
    stock: 54,
    image: IMG_SMARTWATCH,
    features: [
      'Medical-grade 1000Hz ECG beat-to-beat RR interval accuracy',
      'Triple-channel ANT+ and Bluetooth 5.3 simultaneous broadcasting',
      'Onboard memory stores up to 48 hours of swim or team training sessions',
      'Includes shoe-lace running dynamics pod for ground contact balance',
    ],
    description:
      'Capture clinical-grade heart rate variability and running biomechanics during high-intensity interval training where optical wrist sensors lag.',
    isFeatured: false,
    reviews: [
      {
        id: 'rev-14',
        userId: 'usr-customer-1',
        userName: 'Alex Rivera',
        rating: 4.4,
        title: 'Instant response during track repeats',
        comment: 'Connects automatically to my Axiom watch and Peloton bike at the same time.',
        verifiedPurchase: true,
        createdAt: '2026-10-29T18:00:00.000Z',
      },
    ],
    createdAt: '2026-08-19T00:00:00.000Z',
  },
  {
    id: 'prd-110',
    sku: 'AMZ-ELC-895',
    title: 'Ambient KeyPro 75% Gasket-Mount Wireless Mechanical Keyboard',
    slug: 'ambient-keypro-75-wireless-mechanical-keyboard',
    category: 'Electronics',
    brand: 'Ambient Tech',
    price: 169.00,
    originalPrice: 199.00,
    rating: 4.9,
    numReviews: 1,
    stock: 33,
    image: IMG_HERO_WORKSPACE,
    features: [
      'CNC 6063 aluminum top and bottom case with silicone gasket mount',
      'Hot-swappable PCB with factory-lubed tactile pom switches',
      'QMK/VIA programmable rotary encoder knob and PBT double-shot keycaps',
      'Tri-mode 2.4GHz 1000Hz wireless, Bluetooth 5.2, and braided USB-C',
    ],
    description:
      'Engineered for an acoustic marbly typing feel and zero-latency wireless performance across macOS, Windows, and Linux workstations.',
    isFeatured: false,
    reviews: [
      {
        id: 'rev-15',
        userId: 'usr-customer-2',
        userName: 'Marcus Chen',
        rating: 5,
        title: 'Custom-grade acoustics right out of the box without modding',
        comment: 'Stabilizers are zero-rattle and the rotary volume knob is super tactile.',
        verifiedPurchase: true,
        createdAt: '2026-10-30T21:15:00.000Z',
      },
    ],
    createdAt: '2026-08-25T00:00:00.000Z',
  },
];

export const SEED_ORDERS: IOrder[] = [
  {
    id: 'ord-9001',
    orderNumber: 'AMZ-2026-88412',
    userId: 'usr-customer-1',
    customerName: 'Alex Rivera',
    customerEmail: 'customer@amazona.com',
    items: [
      {
        productId: 'prd-101',
        title: 'Noir Studio Pro Wireless Noise-Canceling Headphones',
        brand: 'Noir Audio',
        sku: 'AMZ-AUD-901',
        price: 279.00,
        quantity: 1,
        image: IMG_HEADPHONES,
      },
      {
        productId: 'prd-109',
        title: 'Axiom Chest-Strap ECG Heart Rate Monitor & Cadence Pod Bundle',
        brand: 'Axiom Chronos',
        sku: 'AMZ-FIT-744',
        price: 89.00,
        quantity: 1,
        image: IMG_SMARTWATCH,
      },
    ],
    shippingAddress: {
      fullName: 'Alex Rivera',
      street: '742 Evergreen Terrace, Apt 4B',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'United States',
      phone: '(206) 555-0194',
    },
    subtotal: 368.00,
    discountAmount: 36.80,
    couponCode: 'SAVE10',
    taxAmount: 29.81,
    shippingCost: 0,
    totalAmount: 361.01,
    paymentIntentId: 'pi_3Q8xL2Amazona9001',
    paymentMethodSummary: 'Visa ending in 4242',
    paymentStatus: 'paid',
    orderStatus: 'Delivered',
    trackingNumber: '1Z999AA10123456784',
    estimatedDelivery: 'Delivered Oct 18, 2026',
    createdAt: '2026-10-15T14:22:10.000Z',
    updatedAt: '2026-10-18T11:05:00.000Z',
  },
  {
    id: 'ord-9002',
    orderNumber: 'AMZ-2026-89104',
    userId: 'usr-customer-1',
    customerName: 'Alex Rivera',
    customerEmail: 'customer@amazona.com',
    items: [
      {
        productId: 'prd-104',
        title: 'Zenith ErgoPro Architectural Mesh Task Chair',
        brand: 'Zenith Seating',
        sku: 'AMZ-WRK-205',
        price: 529.00,
        quantity: 1,
        image: IMG_CHAIR,
      },
    ],
    shippingAddress: {
      fullName: 'Alex Rivera',
      street: '742 Evergreen Terrace, Apt 4B',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'United States',
      phone: '(206) 555-0194',
    },
    subtotal: 529.00,
    discountAmount: 0,
    taxAmount: 47.61,
    shippingCost: 0,
    totalAmount: 576.61,
    paymentIntentId: 'pi_3Q9aM8Amazona9002',
    paymentMethodSummary: 'Visa ending in 4242',
    paymentStatus: 'paid',
    orderStatus: 'Out for Delivery',
    trackingNumber: '1Z999AA10198812301',
    estimatedDelivery: 'Arriving Today by 8:00 PM',
    createdAt: '2026-11-02T19:10:00.000Z',
    updatedAt: '2026-11-05T06:30:00.000Z',
  },
  {
    id: 'ord-9003',
    orderNumber: 'AMZ-2026-89550',
    userId: 'usr-customer-2',
    customerName: 'Marcus Chen',
    customerEmail: 'marcus.chen@example.com',
    items: [
      {
        productId: 'prd-103',
        title: 'Axiom Apex Grade-5 Titanium GPS Multisport Smartwatch',
        brand: 'Axiom Chronos',
        sku: 'AMZ-FIT-710',
        price: 389.00,
        quantity: 1,
        image: IMG_SMARTWATCH,
      },
      {
        productId: 'prd-110',
        title: 'Ambient KeyPro 75% Gasket-Mount Wireless Mechanical Keyboard',
        brand: 'Ambient Tech',
        sku: 'AMZ-ELC-895',
        price: 169.00,
        quantity: 1,
        image: IMG_HERO_WORKSPACE,
      },
    ],
    shippingAddress: {
      fullName: 'Marcus Chen',
      street: '1280 Market Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'United States',
      phone: '(415) 555-0182',
    },
    subtotal: 558.00,
    discountAmount: 111.60,
    couponCode: 'PRIME20',
    taxAmount: 40.18,
    shippingCost: 0,
    totalAmount: 486.58,
    paymentIntentId: 'pi_3Q9dK1Amazona9003',
    paymentMethodSummary: 'Mastercard ending in 8819',
    paymentStatus: 'paid',
    orderStatus: 'Shipped',
    trackingNumber: '1Z999AA10177451902',
    estimatedDelivery: 'Nov 7, 2026',
    createdAt: '2026-11-03T11:45:00.000Z',
    updatedAt: '2026-11-04T16:20:00.000Z',
  },
  {
    id: 'ord-9004',
    orderNumber: 'AMZ-2026-89912',
    userId: 'usr-customer-3',
    customerName: 'Sophia Lindqvist',
    customerEmail: 'sophia.l@example.com',
    items: [
      {
        productId: 'prd-102',
        title: 'Barista Linea Dual-Boiler Commercial Espresso Machine',
        brand: 'Milano Craft',
        sku: 'AMZ-HOM-402',
        price: 649.00,
        quantity: 1,
        image: IMG_ESPRESSO,
      },
    ],
    shippingAddress: {
      fullName: 'Sophia Lindqvist',
      street: '85 Broad Street, Floor 18',
      city: 'New York',
      state: 'NY',
      postalCode: '10004',
      country: 'United States',
      phone: '(212) 555-0147',
    },
    subtotal: 649.00,
    discountAmount: 15.00,
    couponCode: 'WELCOME15',
    taxAmount: 57.06,
    shippingCost: 0,
    totalAmount: 691.06,
    paymentIntentId: 'pi_3Q9fP9Amazona9004',
    paymentMethodSummary: 'Amex ending in 1004',
    paymentStatus: 'paid',
    orderStatus: 'Processing',
    trackingNumber: '1Z999AA10166390211',
    estimatedDelivery: 'Nov 8, 2026',
    createdAt: '2026-11-04T22:15:00.000Z',
    updatedAt: '2026-11-04T22:15:00.000Z',
  },
];

// In-memory store initialized with deep-cloned seed data
let memoryUsers: IUser[] = structuredClone(SEED_USERS);
let memoryProducts: IProduct[] = structuredClone(SEED_PRODUCTS);
let memoryOrders: IOrder[] = structuredClone(SEED_ORDERS);

let isMongoConnected = false;

export async function initDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('your_mongodb_connection_string') || uri.includes('localhost')) {
    // Attempt connection if a non-placeholder URI is provided, otherwise run seeded hybrid repository
    if (uri && !uri.includes('your_mongodb_connection_string')) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
        isMongoConnected = true;
        console.log('[Database] Connected to external MongoDB via MONGODB_URI');
        const count = await ProductModel.countDocuments();
        if (count === 0) {
          await UserModel.insertMany(SEED_USERS);
          await ProductModel.insertMany(SEED_PRODUCTS);
          await OrderModel.insertMany(SEED_ORDERS);
        }
        return;
      } catch {
        console.warn('[Database] External MongoDB unreachable — using pre-seeded persistent store');
      }
    }
  }
  isMongoConnected = false;
}

export const dbRepository = {
  isMongoActive: () => isMongoConnected,

  // USERS
  async findUsers(): Promise<IUser[]> {
    if (isMongoConnected) {
      return UserModel.find().lean();
    }
    return memoryUsers;
  },

  async findUserByEmail(email: string): Promise<IUser | null> {
    const normalized = email.trim().toLowerCase();
    if (isMongoConnected) {
      return UserModel.findOne({ email: normalized }).lean();
    }
    return memoryUsers.find((u) => u.email.toLowerCase() === normalized) || null;
  },

  async findUserById(id: string): Promise<IUser | null> {
    if (isMongoConnected) {
      return UserModel.findOne({ id }).lean();
    }
    return memoryUsers.find((u) => u.id === id) || null;
  },

  async createUser(user: IUser): Promise<IUser> {
    if (isMongoConnected) {
      const created = await UserModel.create(user);
      return created.toObject();
    }
    memoryUsers.push(user);
    return user;
  },

  async updateUserAddress(userId: string, shippingAddress: IUser['shippingAddress']): Promise<IUser | null> {
    if (isMongoConnected) {
      return UserModel.findOneAndUpdate(
        { id: userId },
        { $set: { shippingAddress } },
        { new: true }
      ).lean();
    }
    const idx = memoryUsers.findIndex((u) => u.id === userId);
    if (idx === -1) return null;
    memoryUsers[idx] = { ...memoryUsers[idx], shippingAddress };
    return memoryUsers[idx];
  },

  // PRODUCTS
  async findProducts(): Promise<IProduct[]> {
    if (isMongoConnected) {
      return ProductModel.find().lean();
    }
    return memoryProducts;
  },

  async findProductById(id: string): Promise<IProduct | null> {
    if (isMongoConnected) {
      return ProductModel.findOne({ id }).lean();
    }
    return memoryProducts.find((p) => p.id === id) || null;
  },

  async createProduct(product: IProduct): Promise<IProduct> {
    if (isMongoConnected) {
      const created = await ProductModel.create(product);
      return created.toObject();
    }
    memoryProducts.unshift(product);
    return product;
  },

  async updateProduct(id: string, updates: Partial<IProduct>): Promise<IProduct | null> {
    if (isMongoConnected) {
      return ProductModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    }
    const idx = memoryProducts.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    memoryProducts[idx] = { ...memoryProducts[idx], ...updates, id };
    return memoryProducts[idx];
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isMongoConnected) {
      const res = await ProductModel.deleteOne({ id });
      return res.deletedCount > 0;
    }
    const initialLen = memoryProducts.length;
    memoryProducts = memoryProducts.filter((p) => p.id !== id);
    return memoryProducts.length < initialLen;
  },

  // ORDERS
  async findOrders(): Promise<IOrder[]> {
    if (isMongoConnected) {
      return OrderModel.find().sort({ createdAt: -1 }).lean();
    }
    return [...memoryOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async findOrdersByUser(userId: string): Promise<IOrder[]> {
    if (isMongoConnected) {
      return OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
    }
    return memoryOrders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findOrderById(id: string): Promise<IOrder | null> {
    if (isMongoConnected) {
      return OrderModel.findOne({ id }).lean();
    }
    return memoryOrders.find((o) => o.id === id) || null;
  },

  async createOrder(order: IOrder): Promise<IOrder> {
    if (isMongoConnected) {
      const created = await OrderModel.create(order);
      return created.toObject();
    }
    memoryOrders.unshift(order);
    return order;
  },

  async updateOrderStatus(
    id: string,
    orderStatus: IOrder['orderStatus'],
    estimatedDelivery?: string
  ): Promise<IOrder | null> {
    const updatedAt = new Date().toISOString();
    const patch: Partial<IOrder> = { orderStatus, updatedAt };
    if (estimatedDelivery) {
      patch.estimatedDelivery = estimatedDelivery;
    } else if (orderStatus === 'Delivered') {
      patch.estimatedDelivery = `Delivered ${new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    }
    if (isMongoConnected) {
      return OrderModel.findOneAndUpdate({ id }, { $set: patch }, { new: true }).lean();
    }
    const idx = memoryOrders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    memoryOrders[idx] = { ...memoryOrders[idx], ...patch };
    return memoryOrders[idx];
  },
};
