# E-Commerce-Platform
Developed a full-stack e-commerce web application enabling users to browse, search, and purchase products with a seamless checkout  experience
# 🛒 Full-Stack E-Commerce Platform

A full-stack E-Commerce web application built using the MERN stack, enabling users to browse products, search and filter items, manage shopping carts, and securely complete purchases through Stripe payment integration.

The platform also includes JWT-based authentication, role-based access control, and an admin dashboard for managing products, inventory, users, and customer orders.

## 🚀 Features

### 👤 User Authentication & Authorization
- User registration and login.
- JWT-based authentication.
- Secure password hashing using bcrypt.
- Role-Based Access Control (Customer and Admin).
- Protected routes and authorization middleware.

### 🛍️ Product Management
- Browse and view available products.
- Search products by name.
- Filter products by category and price.
- Sort products based on price and popularity.
- View detailed product information.
- Pagination for product listings.

### 🛒 Shopping Cart
- Add products to the shopping cart.
- Update product quantities.
- Remove products from the cart.
- Automatically calculate subtotal and total price.
- Persist cart information.

### 💳 Payment & Checkout
- Secure checkout using Stripe.
- Payment Intent integration.
- Payment status verification.
- Order creation and confirmation.
- Payment failure handling.

### 📦 Order Management
- View order history.
- Track order status.
- View individual order details.
- Manage order processing and delivery status.

### ⚙️ Admin Dashboard
- Admin-only dashboard access.
- Add, update, and delete products.
- Manage product inventory.
- View registered users.
- View and manage customer orders.
- Update order statuses.
- Monitor sales and order statistics.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Redux Toolkit | Global state management |
| React Router | Client-side navigation |
| Tailwind CSS | Responsive UI styling |
| Node.js | Backend runtime |
| Express.js | REST API development |
| MongoDB | Database |
| Mongoose | Database modeling |
| JWT | Authentication |
| bcrypt.js | Password hashing |
| Stripe | Payment integration |
| Axios | HTTP requests |
| Git & GitHub | Version control |

## 🏗️ Application Architecture

```text
             CLIENT SIDE
          React.js + Redux
                 |
                 | Axios / HTTP
                 |
                 ▼
           SERVER SIDE
         Node.js + Express
                 |
          ┌──────┴──────┐
          |             |
          ▼             ▼
     Middleware     Controllers
          |             |
          └──────┬──────┘
                 |
                 ▼
             MongoDB
          (Mongoose ODM)

                 |
                 ▼
          Stripe Payment
```

## 📂 Project Structure

```text
ecommerce-platform/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── redux/
│       │   ├── slices/
│       │   └── store.js
│       ├── services/
│       ├── hooks/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── app.js
│
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ecommerce-platform.git

cd ecommerce-platform
```

### 2. Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file inside the backend directory:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

STRIPE_SECRET_KEY=your_stripe_secret_key

CLIENT_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend

npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Start the frontend:

```bash
npm run dev
```

### 4. Access the Application

```text
Frontend: http://localhost:5173

Backend:  http://localhost:5000
```

*Note: Configure the actual environment variable names and npm scripts according to your implementation.*

## 🔗 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/products` | Create product (Admin) |
| PUT | `/api/products/:id` | Update product (Admin) |
| DELETE | `/api/products/:id` | Delete product (Admin) |

### Cart

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart` | Get user cart |
| POST | `/api/cart` | Add product to cart |
| PUT | `/api/cart/:productId` | Update cart quantity |
| DELETE | `/api/cart/:productId` | Remove product |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Create order |
| GET | `/api/orders/my-orders` | Get user orders |
| GET | `/api/orders/:id` | Get order details |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Dashboard statistics |
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/orders` | Get all orders |
| PUT | `/api/admin/orders/:id` | Update order status |

*The endpoints above describe the planned API structure. Adjust them to match your implemented routes.*

## 🔐 Security Implementation

- Passwords are hashed using bcrypt before storage.
- JWT tokens are used for user authentication.
- Role-based middleware restricts admin-only operations.
- Protected APIs prevent unauthorized access.
- Environment variables protect sensitive credentials.
- Backend validation ensures reliable data handling.
- Stripe webhook signature verification validates payment events.
- Product prices and payment amounts are verified on the backend.

## 🗄️ Database Collections

The application uses MongoDB with Mongoose schemas.

| Collection | Description |
|---|---|
| Users | Stores user information and roles |
| Products | Stores product details and inventory |
| Orders | Stores order and payment information |
| Carts | Stores customer shopping cart items |

Database indexing is used on relevant fields to improve product search and filtering performance.

## 🧪 Testing

Test the application using:

- Postman for REST API testing.
- MongoDB Compass for database inspection.
- Stripe Test Mode for payment testing.
- Browser Developer Tools for frontend debugging.

## 🔮 Future Enhancements

- Product reviews and ratings.
- Wishlist functionality.
- Email notifications for order updates.
- Coupon and discount management.
- Advanced sales analytics.
- Product recommendations.
- Docker-based deployment.
- Automated testing using Jest and React Testing Library.

## 👨‍💻 Author

**Your Name**

- GitHub: [@21adithya](https://github.com/21adithya)
- LinkedIn: [Your LinkedIn Profile](https://linkedin.com/)

## 📄 License

This project is developed for educational and portfolio purposes. You may add an MIT License if you intend to distribute it under those terms.
