# 🚀 Quick Start Guide

## Prerequisites

- Node.js (v18+)
- MongoDB (v6+)
- Redis (v7+)
- npm or yarn

---

## 🔧 Installation

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd mern-template

# Install backend dependencies
cd api
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Setup

#### Backend (.env)
```bash
cd api
cp .env.example .env
```

Edit `api/.env`:
```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret-key
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
FRONTEND_URL=http://localhost:5174
```

#### Frontend (.env)
```bash
cd client
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_API_INDEX_DB_STORAGE=your-encryption-key-min-32-chars
```

### 3. Start Services

#### Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use local MongoDB installation
mongod
```

#### Start Redis
```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:latest

# Or use local Redis installation
redis-server
```

### 4. Run Applications

#### Backend (Terminal 1)
```bash
cd api
npm run dev
```
Server will start at: `http://localhost:3000`
Swagger docs at: `http://localhost:3000/api-docs`

#### Frontend (Terminal 2)
```bash
cd client
npm run dev
```
Client will start at: `http://localhost:5174`

---

## 👤 Default Users

After first run, default users are created:

### Super Admin
- **Email**: `superadmin@example.com`
- **Password**: `SuperAdmin@123`
- **Role**: Super Admin (Full Access)

### Admin
- **Email**: `admin@example.com`
- **Password**: `Admin@123`
- **Role**: Admin

### User
- **Email**: `user@example.com`
- **Password**: `User@123`
- **Role**: User

---

## 📁 Project Structure Overview

```
mern-template/
├── api/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── microservices/ # Feature modules
│   │   ├── middlewares/   # Express middlewares
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utilities
│   │   └── server.ts      # Entry point
│   └── package.json
│
└── client/                 # Frontend (React + TypeScript)
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── pages/         # Page components
    │   ├── redux/         # State management
    │   ├── routes/        # Route configuration
    │   ├── service/       # API services
    │   └── main.tsx       # Entry point
    └── package.json
```

---

## 🔑 Key Features

### Backend
- ✅ JWT Authentication with Refresh Tokens
- ✅ Role-Based Access Control (RBAC)
- ✅ Redis Session Management
- ✅ Auto-generated Swagger Documentation
- ✅ Input Validation with Zod
- ✅ Error Handling Middleware
- ✅ File Upload Support
- ✅ Email Service (Nodemailer)
- ✅ Logging with Winston
- ✅ Security (Helmet, CORS, Rate Limiting)

### Frontend
- ✅ React 19 with TypeScript
- ✅ Redux Toolkit + Redux Persist
- ✅ Material-UI Components
- ✅ Protected Routes with RBAC
- ✅ Encrypted State Storage
- ✅ Axios Interceptors
- ✅ Form Validation with Zod
- ✅ Toast Notifications
- ✅ Responsive Design
- ✅ Code Splitting & Lazy Loading

---

## 📝 Common Commands

### Backend

```bash
# Development
npm run dev              # Start with nodemon

# Production
npm run build           # Build TypeScript
npm start              # Start production server

# With PM2
npm run start:pm2      # Start with PM2
npm run restart:pm2    # Restart PM2
npm run log:pm2        # View logs

# Type checking
npm run type-check:watch
```

### Frontend

```bash
# Development
npm run dev            # Start dev server

# Production
npm run build         # Build for production
npm run preview       # Preview production build

# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run type-check    # TypeScript type checking
npm run validate      # Run all checks
```

---

## 🔍 API Endpoints

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login
POST   /api/auth/refresh-token     # Refresh access token
POST   /api/auth/logout            # Logout
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password
```

### Users
```
GET    /api/users                  # Get all users (Admin)
GET    /api/users/:id              # Get user by ID
POST   /api/users                  # Create user (Admin)
PUT    /api/users/:id              # Update user
DELETE /api/users/:id              # Delete user (Admin)
```

### Permissions
```
GET    /api/permissions            # Get all permissions
POST   /api/permissions            # Create permission (Super Admin)
PUT    /api/permissions/:id        # Update permission
DELETE /api/permissions/:id        # Delete permission
```

**Full API Documentation**: `http://localhost:3000/api-docs`

---

## 🛠️ Development Tips

### Adding a New Feature Module

1. **Backend**: Create in `api/src/microservices/`
```
your-service/
├── controller.ts      # Request handlers
├── model.ts          # Mongoose model
├── validation.ts     # Zod schemas
├── route.ts          # Routes
├── types.ts          # TypeScript types
└── config.json       # Service config
```

2. **Frontend**: Create in `client/src/pages/`
```
YourFeature/
├── index.tsx         # Main component
├── YourForm.tsx      # Form component
└── Schema/
    └── schema.ts     # Validation schema
```

### Adding a New API Endpoint

1. Define route in microservice
2. Add controller function
3. Add validation schema
4. Update Swagger documentation
5. Test in Swagger UI

### Adding a New Page

1. Create page component in `client/src/pages/`
2. Add route in `client/src/routes/index.tsx`
3. Add to navigation menu if needed
4. Configure permissions

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error**
```bash
# Check if MongoDB is running
mongosh
# or
docker ps | grep mongodb
```

**Redis Connection Error**
```bash
# Check if Redis is running
redis-cli ping
# or
docker ps | grep redis
```

**Port Already in Use**
```bash
# Find process using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Kill the process
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Mac/Linux
```

### Frontend Issues

**Module Not Found**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build Errors**
```bash
# Type check
npm run type-check

# Clear Vite cache
rm -rf node_modules/.vite
```

---

## 📚 Next Steps

1. ✅ Read [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture
2. ✅ Explore Swagger docs at `http://localhost:3000/api-docs`
3. ✅ Customize the template for your needs
4. ✅ Add your business logic
5. ✅ Deploy to production

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Update JWT secrets
- [ ] Configure CORS properly
- [ ] Enable HTTPS
- [ ] Set up rate limiting
- [ ] Configure CSP headers
- [ ] Enable Redis password
- [ ] Set up MongoDB authentication
- [ ] Review environment variables
- [ ] Enable production logging
- [ ] Set up monitoring

---

## 📞 Support

For issues and questions:
- Check [ARCHITECTURE.md](./ARCHITECTURE.md)
- Review API documentation at `/api-docs`
- Check the code comments
- Review TypeScript types

---

## 🎉 Happy Coding!

You're all set! Start building your amazing application.
