# Amazon-Inspired Full-Stack E-Commerce Marketplace

A full-stack e-commerce marketplace inspired by Amazon, pairing a high-conversion retail storefront with JWT/bcrypt authentication, Redux Toolkit state management, an Express and Mongoose REST API, interactive Stripe checkout simulation, and a dedicated Admin operations console.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and product choices reflect your confirmed preferences from our initial review:

- **Visual Identity & Aesthetic**: Classic Amazon-inspired retail aesthetic featuring a deep navy navigation header (`#131921`), warm amber primary action accents (`#F59E0B`), crisp neutral canvas (`#F8FAFC`), and high-contrast tabular pricing.
- **Database & Persistence Strategy**: Mongoose models (`User`, `Product`, `Order`) configured to connect to `MONGODB_URI` via environment variables, paired with an automatic pre-seeded persistent store fallback when `MONGODB_URI` is unset so the marketplace, authentication, reviews, and admin workflows run immediately out of the box.
- **Checkout & Payment Processing**: Interactive simulated Stripe PaymentIntent checkout flow supporting test card presets, promotional coupon codes (`PRIME20`, `SAVE10`, `WELCOME15`), server-side inventory validation, and instant order confirmation.
- **Confirmed Feature Additions**: Customer product review and star rating submissions, a slim deals countdown banner with promo codes, and a one-click Customer/Admin demo account switcher alongside full JWT registration and login.

---

## 1. Overview & Core Concept

- **What It Does**: Enables shoppers to browse and filter products across categories, inspect detailed product specifications and customer reviews, manage a persistent shopping cart, apply promotional codes, complete checkout through an interactive Stripe payment experience, and track order fulfillment. Simultaneously empowers administrators to manage catalog inventory, monitor revenue metrics, view customers, and update order statuses.
- **Target Audience / Persona**: Online retail shoppers looking for fast product discovery and trustworthy checkout, and store administrators managing catalog stock and fulfillment pipelines.
- **Key Value**: Combines rapid multi-facet product discovery (search, category, price range, rating, sort, pagination) with end-to-end transactional integrity—from cart calculation and server-side stock verification to live order status tracking.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Storefront & Discovery Flow**: Users land on the storefront featuring a slim promotional deals banner with a live countdown timer, a split campaign hero showcase, and a curated product catalog grid. Users can search by keyword, filter by category, price range, and minimum star rating, sort by price or popularity, and paginate through results.
2. **Product Inspection & Review Flow**: Clicking any product opens the Product Detail View with a high-resolution gallery on the left and a contiguous purchase module on the right (title, tabular price, stock status, quantity selector, and primary Add to Cart / Buy Now actions). Below, customers can read verified reviews and submit their own star rating and written review.
3. **Cart & Promotional Checkout Flow**: Adding items updates the persistent cart badge and opens a quick-review cart drawer or full cart view where quantities can be stepped, items removed, and promo codes applied. Proceeding to checkout guides the user through shipping address entry and an interactive Stripe PaymentIntent simulation to instant order confirmation.
4. **Role Switching & Admin Operations Flow**: Using the one-click Demo Account Switcher (or standard login), users can switch between a Customer account (viewing order history and live delivery progress steps) and an Admin account (accessing the Admin Dashboard to create/edit/delete products, adjust stock levels, inspect registered users, and advance order fulfillment statuses).

### Visual Identity & Theme
- **Aesthetic Direction**: Utilitarian, trustworthy retail marketplace blended with modern editorial discipline—avoiding cluttered badge spam while preserving classic Amazon navy-and-amber clarity.
- **Color Palette & Mood**:
  - `--background`: `#F8FAFC` (Cool Alabaster 60% neutral canvas)
  - `--surface`: `#FFFFFF` (Pure White 30% structural product and table surfaces with `#E2E8F0` hairline borders)
  - `--header-bg`: `#131921` (Deep Amazon Navy primary navigation surface)
  - `--primary`: `#F59E0B` / `#D97706` (Warm Amber 10% accent budget for primary purchase CTAs, active filters, and star ratings)
  - `--status-nominal`: `#16A34A` (In Stock / Delivered / Paid)
  - `--status-warning`: `#D97706` (Low Stock / Processing / Shipped)
  - `--status-alert`: `#DC2626` (Out of Stock / Cancelled)
- **Typography & Hierarchy**:
  - *Display & Section Headings*: `Outfit` (SemiBold 600 / Bold 700, `text-wrap: balance`) for crisp storefront headlines and category headers.
  - *Body & UI Controls*: `Plus Jakarta Sans` (Regular 400 / Medium 500 / SemiBold 600) for scannable product descriptions, reviews, and navigation links.
  - *Numeric & Tabular Data*: `JetBrains Mono` with `tabular-nums` for all product prices, discount calculations, countdown timers, SKU identifiers, stock counts, and admin revenue tables.
- **Component Styling & Layout**:
  - *Top Bar Contract*: Clean 3-zone navigation bar (Brand wordmark left, concise category/view navigation links center, primary Cart & Account action zone right), supplemented by a contextual filter/search bar in the main workspace below the header.
  - *Contiguous Purchase Module*: Product detail view keeps gallery and purchase controls aligned side-by-side (`items-stretch`), with unboxed metadata separated by middle dots (`·`).
  - *Admin Workspace*: Structured sidebar/tabbed data tables with 40px row heights, right-aligned numeric columns, and single-elevation bordered surfaces.
- **Interactive Feedback & Motion**:
  - Immediate cart count increment and non-intrusive toast confirmation on "Add to Cart" ($\le 150\text{ms}$ transition).
  - Subtle $2\text{px}$ vertical hover lift on product cards using compositor-only `transform` and `opacity`.
  - Skeleton loading states and explicit empty-state recovery actions when search filters match zero products.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Hybrid Mongoose + Pre-Seeded Store Persistence**
  - *Chosen Approach*: Full Mongoose schema definitions (`User`, `Product`, `Order`) that connect to `process.env.MONGODB_URI` when provided, backed by a synchronized repository layer pre-seeded with realistic products, reviews, orders, and hashed demo accounts when no external MongoDB URI is present.
  - *Why*: Satisfies the requirement for external MongoDB configuration via environment variables while guaranteeing that the live preview works immediately with zero broken API calls.
  - *Alternatives Considered*: Failing hard when `MONGODB_URI` is empty—rejected because it renders the live preview unusable until external credentials are supplied.
- **Decision 2: Interactive Simulated Stripe PaymentIntent Gateway**
  - *Chosen Approach*: Backend endpoints (`/api/payments/create-intent` and `/api/orders`) generate a deterministic PaymentIntent client secret and verify server-side item prices, coupon discounts, and stock availability before committing the order.
  - *Why*: Replicates the real Stripe PaymentIntent lifecycle and server-side security validation without requiring live secret keys or exposing the user to iframe popup restrictions.
  - *Alternatives Considered*: Static client-only checkout—rejected because server-side price/stock verification and order persistence are core architectural requirements.
- **Decision 3: One-Click Role Switcher + Full JWT Auth**
  - *Chosen Approach*: Standard bcrypt/JWT registration and login endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/demo-switch`) paired with a quick role switcher bar allowing instant toggling between Demo Customer and Demo Admin sessions.
  - *Why*: Lets evaluators test protected Admin routes and Customer order tracking in one click while still supporting custom account creation.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REACT + REDUX TOOLKIT FRONTEND                       │
│                                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
│  │    Top Navigation Bar  │  │  Deals Countdown Bar  │  │ Demo Role Bar   │  │
│  └───────────┬───────────┘  └───────────┬───────────┘  └────────┬────────┘  │
│              └──────────────────────────┼───────────────────────┘           │
│                                         ▼                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         REACT ROUTER VIEWS                            │  │
│  │                                                                       │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────────────┐  │  │
│  │  │ Storefront Home │  │ Product Detail  │  │  Cart & Promo Drawer  │  │  │
│  │  │ & Filter Grid   │  │ & Review Form   │  │  + Stripe Checkout    │  │  │
│  │  └────────┬────────┘  └────────┬────────┘  └───────────┬───────────┘  │  │
│  │           │                    │                       │              │  │
│  │  ┌────────┴────────┐  ┌────────┴────────┐  ┌───────────┴───────────┐  │  │
│  │  │ Customer Orders │  │ Auth Login /    │  │    Admin Dashboard    │  │  │
│  │  │ & Live Tracker  │  │ Register Modal  │  │ (Products/Orders/KPI) │  │  │
│  │  └────────┬────────┘  └────────┬────────┘  └───────────┬───────────┘  │  │
│  └───────────┼────────────────────┼───────────────────────┼──────────────┘  │
│              └────────────────────┼───────────────────────┘                 │
│                                   ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │           REDUX STORE (authSlice, cartSlice, catalogSlice)            │  │
│  └────────────────────────────────┬──────────────────────────────────────┘  │
└───────────────────────────────────┼─────────────────────────────────────────┘
                                    │ Axios REST Client (Bearer JWT)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXPRESS.JS BACKEND SERVER                           │
│                                                                             │
│  ┌────────────────────────────┐        ┌─────────────────────────────────┐  │
│  │ JWT & RBAC Auth Middleware │───────▶│   REST API Route Controllers    │  │
│  │ (verifyToken, requireAdmin)│        │ /auth /products /orders /stripe │  │
│  └────────────────────────────┘        └────────────────┬────────────────┘  │
│                                                         ▼                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │         DATA REPOSITORY LAYER (Mongoose Models + Seeded Store)        │  │
│  │       ┌──────────────┐      ┌────────────────┐      ┌──────────────┐  │  │
│  │       │  User Model  │      │ Product Model  │      │ Order Model  │  │  │
│  │       └──────────────┘      └────────────────┘      └──────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State
- **User Entity**: `id`, `name`, `email`, `passwordHash` (bcrypt), `role` (`customer` | `admin`), `shippingAddress`, `createdAt`.
- **Product Entity**: `id`, `title`, `slug`, `category` (`Electronics`, `Home & Kitchen`, `Audio & Tech`, `Accessories`, `Fitness & Outdoors`), `brand`, `price`, `originalPrice`, `rating`, `numReviews`, `stock`, `image`, `features[]`, `description`, `isFeatured`, `reviews[]` (`userId`, `userName`, `rating`, `comment`, `createdAt`).
- **Order Entity**: `id`, `orderNumber`, `userId`, `customerName`, `customerEmail`, `items[]` (`productId`, `title`, `price`, `quantity`, `image`), `shippingAddress`, `subtotal`, `discountAmount`, `couponCode`, `taxAmount`, `shippingCost`, `totalAmount`, `paymentIntentId`, `paymentStatus` (`paid` | `pending` | `failed`), `orderStatus` (`Processing` | `Shipped` | `Out for Delivery` | `Delivered` | `Cancelled`), `createdAt`, `updatedAt`.
- **Redux Slices**:
  - `authSlice`: Current user profile, JWT token persisted in `localStorage`, role status, and one-click demo switcher actions.
  - `cartSlice`: Cart line items persisted in `localStorage`, active promo code, computed subtotal, discount, tax, and shipping totals.
  - `catalogSlice`: Search query, active category, price range bounds, minimum star rating, sort order (`featured`, `price-asc`, `price-desc`, `rating`), current page, and pagination metadata.

### Interactive Component & State Mapping
- **Discovery & Filtering Toolbar**: Typing in the search input or selecting category/price/rating/sort filters dispatches Redux catalog filter actions and queries `GET /api/products` with query parameters, updating the product grid and pagination controls.
- **Product Detail & Reviews**: Selecting quantity and clicking "Add to Cart" dispatches `addToCart` with stock ceiling validation; submitting the review form calls `POST /api/products/:id/reviews` (protected route), appending the review and recalculating the product's average rating.
- **Checkout & Simulated Stripe Modal**: Applying a coupon code (`PRIME20` for 20% off, `SAVE10` for 10% off, `WELCOME15` for $15 off) validates and recalculates order totals. Submitting shipping details calls `POST /api/payments/create-intent` to initialize the simulated Stripe PaymentIntent, and confirming payment calls `POST /api/orders`, decrementing product stock on the server, clearing the cart, and redirecting to the Order Confirmation & Tracking view.
- **Admin Console**:
  - *Products Tab*: Modal form to create or edit products (`POST /api/products`, `PUT /api/products/:id`), inline stock stepper, and product deletion (`DELETE /api/products/:id`).
  - *Orders Tab*: Filterable table of all customer orders with a status selector (`PUT /api/orders/:id/status`) that immediately updates customer-facing delivery progress bars.
  - *Customers Tab*: Directory of registered customer and admin accounts with order count and total spend metrics.
