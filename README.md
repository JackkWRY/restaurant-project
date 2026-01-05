# 🍽️ Restaurant Management System

A full-stack restaurant management system built with **Next.js**, **Node.js**, **Express**, **Prisma**, and **PostgreSQL**.

## 📋 Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (Admin, Staff, Kitchen)
- Protected API routes with middleware

### 👨‍💼 Admin Dashboard

- Manage menus (Create, Read, Update, Delete)
- Manage categories
- Manage tables
- View analytics and sales reports
- View order history with pagination
- Update restaurant settings

### 👨‍🍳 Staff Dashboard

- View and manage tables
- Take orders
- Update order status
- Process payments
- Close tables

### 🍳 Kitchen Dashboard

- View active orders in real-time
- Update food preparation status
- Mark items as ready

### 👥 Customer Order System

- Browse menu by categories
- Place orders without login
- Call staff assistance
- View order history

### 📊 Analytics

- Daily sales summary
- Sales trends (7-day chart)
- Top-selling items
- Order history with filters

### ⚡ Real-time Features

- Socket.IO for live order updates
- Real-time table status
- Live kitchen notifications

### 🎯 Additional Features

- **QR Code Generation** - Automatic QR code for each table
- **Soft Delete** - Menu items can be recovered
- **Image Upload** - Cloudinary integration for menu images
- **Bill History** - Complete transaction history with pagination
- **Order Tracking** - Real-time status updates for each item
- **FIFO Queue** - Kitchen orders processed in order
- **N+1 Prevention** - Optimized database queries with eager loading
- **Atomic Operations** - Race condition prevention for bill totals

---

## 🛠️ Tech Stack

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 14+
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** Zod
- **Real-time:** Socket.IO
- **Security:** Helmet, CORS, express-rate-limit
- **Logging:** Winston
- **Image Upload:** Cloudinary
- **Input Sanitization:** DOMPurify

### Frontend

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** SWR
- **Real-time:** Socket.IO Client
- **Internationalization:** i18n (Thai/English)
- **Icons:** Lucide React
- **Image Optimization:** next/image
- **Notifications:** Sonner

---

## 📦 Project Structure

### Backend

```
restaurant-backend/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeding
├── src/
│   ├── config/                 # Configuration & env validation
│   ├── controllers/            # Request handlers (HTTP layer)
│   ├── services/               # Business logic layer
│   ├── repositories/           # Data access layer (Prisma)
│   ├── dtos/                   # Data Transfer Objects
│   ├── middlewares/            # Auth, validation, logging
│   ├── routes/                 # API route definitions
│   ├── schemas/                # Zod validation schemas
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Utility functions
│   ├── errors/                 # Custom error classes
│   ├── prisma.ts               # Prisma client singleton
│   └── server.ts               # Express app entry point
├── uploads/                    # Uploaded files (local storage)
├── .env.example                # Environment variables template
└── package.json
```

### Frontend

```
restaurant-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [lang]/            # i18n routing
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── kitchen/       # Kitchen dashboard
│   │   │   ├── staff/         # Staff dashboard
│   │   │   ├── order/         # Customer order page
│   │   │   ├── login/         # Login page
│   │   │   └── page.tsx       # Landing page
│   │   └── layout.tsx
│   ├── components/             # React components
│   │   ├── admin/             # Admin components
│   │   ├── customer/          # Customer components
│   │   ├── kitchen/           # Kitchen components
│   │   ├── staff/             # Staff components
│   │   ├── common/            # Shared components
│   │   └── ui/                # UI primitives
│   ├── store/                 # Zustand state stores
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API service layer
│   ├── types/                 # TypeScript types
│   ├── lib/                   # Utilities
│   ├── config/                # Configuration
│   ├── locales/               # i18n translations
│   └── middleware.ts          # Next.js middleware
├── public/                     # Static assets
├── .env.example                # Environment variables template
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone the repository

```bash
git clone <repository-url>
cd restaurant-project
```

### 2. Backend Setup

```bash
cd restaurant-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and configure:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET (generate a strong secret)
# - CLOUDINARY credentials (for image uploads)

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database with sample data
npx prisma db seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd restaurant-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local if needed (default: http://localhost:3001)

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## 🔑 Default Credentials

After seeding the database, you can login with:

**Admin Account:**

- Username: `admin`
- Password: `password123`

**Note:** Change these credentials in production!

---

## 📚 API Documentation

### Authentication

- `POST /api/login` - User login

### Menus

- `GET /api/menus` - Get all menus (public)
- `GET /api/menus?scope=all&page=1&limit=100` - Get all menus with pagination (admin)
- `POST /api/menus` - Create menu (admin only)
- `PUT /api/menus/:id` - Update menu (admin only)
- `DELETE /api/menus/:id` - Delete menu (admin only)

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Orders

- `POST /api/orders` - Create order (public)
- `GET /api/orders/active` - Get active orders (staff/admin)
- `PATCH /api/orders/:id/status` - Update order status (staff/admin)
- `PATCH /api/orders/items/:itemId/status` - Update item status (staff/admin)

### Tables

- `GET /api/tables/status` - Get all tables status (public)
- `GET /api/tables/:id` - Get table details (public)
- `POST /api/tables` - Create table (admin only)
- `PUT /api/tables/:id` - Update table (admin only)
- `DELETE /api/tables/:id` - Delete table (admin only)
- `PATCH /api/tables/:id/availability` - Toggle availability (staff/admin)
- `POST /api/tables/:id/close` - Close table (staff/admin)
- `PATCH /api/tables/:id/call` - Call staff (public)

### Bills

- `GET /api/bills/table/:tableId` - Get table bill (staff/admin)
- `POST /api/bills/checkout` - Process checkout (staff/admin)

### Analytics

- `GET /api/analytics/summary` - Get sales summary (admin only)
- `GET /api/analytics/orders` - Get daily orders (admin only)
- `GET /api/analytics/history` - Get bill history with pagination (admin only)

### Settings

- `GET /api/settings/name` - Get restaurant name (admin only)
- `POST /api/settings/name` - Update restaurant name (admin only)

---

## 🔒 Security Features

- ✅ JWT authentication with secure token validation
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Rate limiting on API endpoints
- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma ORM)
- ✅ Error boundaries in frontend

---

## 🎨 Features Highlights

### Enhanced Validation

- Price must be positive
- Quantity limits (1-99)
- String length limits
- Trim whitespace automatically

### Pagination

- Menu list pagination (100 items/page)
- Order history pagination (20 items/page)
- Optimized database queries

### Error Handling

- Global error boundary
- Graceful error recovery
- User-friendly error messages

### Real-time Updates

- Live order notifications
- Table status updates
- Kitchen order updates

---

## 🌐 Internationalization

The app supports:

- 🇹🇭 Thai (default)
- 🇬🇧 English

Switch languages using the globe icon in the navigation.

---

## 📱 Pages

### Public Pages

- `/[lang]/order?tableId=X` - Customer order page
- `/[lang]/login` - Login page

### Protected Pages

- `/[lang]/admin` - Admin dashboard
- `/[lang]/staff` - Staff dashboard
- `/[lang]/kitchen` - Kitchen dashboard

---

## 🧪 Database Schema

### Main Tables

- `User` - System users (admin, staff, kitchen)
- `Category` - Menu categories
- `Menu` - Menu items
- `Table` - Restaurant tables
- `Order` - Customer orders
- `OrderItem` - Individual order items
- `Bill` - Payment bills

### Enums

- `OrderStatus`: PENDING, COOKING, READY, SERVED, COMPLETED, CANCELLED
- `BillStatus`: OPEN, PAID

---

## 🔧 Development

### Run Prisma Studio

```bash
cd restaurant-backend
npx prisma studio
```

### Reset Database

```bash
cd restaurant-backend
npx prisma migrate reset
```

### Build for Production

**Backend:**

```bash
cd restaurant-backend
npm run build
npm start
```

**Frontend:**

```bash
cd restaurant-frontend
npm run build
npm start
```

---

## 📝 Environment Variables

### Backend (.env)

```env
DATABASE_URL=          # PostgreSQL connection string
JWT_SECRET=            # JWT secret key (REQUIRED)
PORT=3001              # Server port
NODE_ENV=development   # Environment
CORS_ORIGIN=           # Frontend URL
CLOUDINARY_CLOUD_NAME= # Cloudinary cloud name
CLOUDINARY_API_KEY=    # Cloudinary API key
CLOUDINARY_API_SECRET= # Cloudinary API secret
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=   # Backend API URL
```

---

## 🐛 Known Issues

- Frontend dictionary missing some pagination keys (using fallback text)
- Customer view can't access `/api/settings/name` and `/api/bills/table/:id` (protected routes)

---

## 🚧 Future Improvements

- [ ] Unit and integration tests
- [ ] E2E tests with Playwright
- [ ] API documentation with Swagger
- [ ] Redis caching for performance
- [ ] Print receipt functionality
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Inventory management
- [ ] Employee scheduling

---

## 📄 License

This project is for educational purposes.

---

## 👨‍💻 Author

Created with ❤️ for restaurant management

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- All open-source contributors

---

**Happy Coding! 🎉**
