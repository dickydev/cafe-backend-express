# Cafe Lab Backend API

Backend API lengkap untuk Cafe Lab Web Application menggunakan Node.js, Express.js, dan PostgreSQL.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
Buat database PostgreSQL:
```bash
psql -U postgres
CREATE DATABASE cafe_lab_db;
\q
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env dengan database credentials Anda
```

### 4. Run Migrations
```bash
npm run migrate
```

### 5. Seed Database (Optional)
```bash
npm run seed
```

### 6. Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Endpoints

#### Authentication
- POST `/auth/register` - Register user baru
- POST `/auth/login` - Login user
- GET `/auth/profile` - Get user profile (requires auth)
- PUT `/auth/profile` - Update profile (requires auth)
- PUT `/auth/change-password` - Ubah password (requires auth)

#### Products
- GET `/products` - Get all products (dengan filter & pagination)
- GET `/products/featured` - Get featured products
- GET `/products/:id` - Get product by ID
- POST `/products` - Create product (admin only)
- PUT `/products/:id` - Update product (admin only)
- DELETE `/products/:id` - Delete product (admin only)

#### Categories
- GET `/categories` - Get all categories
- GET `/categories/:id` - Get category by ID
- POST `/categories` - Create category (admin only)
- PUT `/categories/:id` - Update category (admin only)
- DELETE `/categories/:id` - Delete category (admin only)

#### Orders
- POST `/orders` - Create order
- GET `/orders` - Get user orders (requires auth)
- GET `/orders/:id` - Get order detail (requires auth)
- PATCH `/orders/:id/status` - Update order status (staff/admin)
- POST `/orders/:id/cancel` - Cancel order (requires auth)
- GET `/orders/stats` - Get order statistics (admin)

#### Cart
- GET `/cart` - Get cart (session-based)
- POST `/cart` - Add to cart
- PUT `/cart/:item_id` - Update cart item
- DELETE `/cart/:item_id` - Remove from cart
- DELETE `/cart` - Clear cart
- POST `/cart/merge` - Merge guest cart with user cart (requires auth)

#### Reservations
- GET `/reservations/available-tables` - Check table availability
- POST `/reservations` - Create reservation
- GET `/reservations` - Get user reservations (requires auth)
- GET `/reservations/:id` - Get reservation detail (requires auth)
- PATCH `/reservations/:id/status` - Update status (staff/admin)
- POST `/reservations/:id/cancel` - Cancel reservation (requires auth)

#### Reviews
- POST `/reviews` - Create review (requires auth)
- GET `/reviews/product/:product_id` - Get product reviews
- GET `/reviews/user` - Get user reviews (requires auth)
- PUT `/reviews/:id` - Update review (requires auth)
- DELETE `/reviews/:id` - Delete review (requires auth)
- PATCH `/reviews/:id/approve` - Approve review (admin)
- GET `/reviews/pending` - Get pending reviews (admin)

## 🔐 Authentication

API menggunakan JWT untuk authentication. Sertakan token di header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## 🧪 Test Accounts

Setelah seeding, gunakan akun berikut untuk testing:

**Admin:**
- Email: admin@cafelab.com
- Password: password123

**Staff:**
- Email: staff@cafelab.com
- Password: password123

**Customer:**
- Email: customer@example.com
- Password: password123

## 📊 Database Schema

Database memiliki 13+ tables:
- users
- categories  
- products
- product_variants
- tables
- orders
- order_items
- reservations
- reviews
- carts
- cart_items
- promotions
- dan lainnya...

## 🛡️ Security Features

- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Input Validation
- ✅ SQL Injection Protection
- ✅ Rate Limiting
- ✅ CORS Protection
- ✅ Helmet Security Headers
- ✅ XSS Protection

## 📝 Environment Variables

Lihat `.env.example` untuk daftar lengkap environment variables yang diperlukan.

## 🚀 Deployment

Backend ini ready untuk deployment ke:
- Heroku
- Railway
- DigitalOcean App Platform
- VPS (Ubuntu/Debian)
- AWS, GCP, Azure

## 📄 License

MIT License

## 👨‍💻 Support

Untuk pertanyaan atau issue, silakan buat issue di repository.

---

**Happy Coding! ☕️**
