# MERN Template - Clean Architecture Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Design Patterns](#design-patterns)
- [Best Practices](#best-practices)

---

## 🎯 Overview

This is a production-ready MERN (MongoDB, Express, React, Node.js) template following clean architecture principles with TypeScript support.

### Tech Stack

**Backend:**
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- Redis (Session & Caching)
- JWT Authentication
- Swagger API Documentation

**Frontend:**
- React 19
- TypeScript
- Redux Toolkit + Redux Persist
- Material-UI (MUI)
- React Router v6
- TanStack Query
- Vite

---

## 📁 Project Structure

```
mern-template/
├── api/                          # Backend application
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   │   ├── database.ts      # MongoDB connection
│   │   │   ├── redis.ts         # Redis connection
│   │   │   ├── rabbitmq.ts      # RabbitMQ (optional)
│   │   │   └── index.ts         # Environment variables
│   │   ├── microservices/       # Feature modules
│   │   │   ├── auth-service/    # Authentication module
│   │   │   ├── user-service/    # User management
│   │   │   └── permission-services/ # RBAC
│   │   ├── middlewares/         # Express middlewares
│   │   │   ├── error.ts         # Error handling
│   │   │   └── session.ts       # Session management
│   │   ├── routes/              # Route definitions
│   │   ├── services/            # Business logic
│   │   ├── utils/               # Utility functions
│   │   ├── types/               # TypeScript types
│   │   ├── libs/                # Shared libraries
│   │   └── server.ts            # Application entry point
│   ├── uploads/                 # File uploads directory
│   ├── logs/                    # Application logs
│   └── package.json
│
└── client/                      # Frontend application
    ├── src/
    │   ├── components/          # Reusable components
    │   │   ├── common/          # Common components
    │   │   │   ├── layout/      # Layout components
    │   │   │   └── icons/       # Icon components
    │   │   └── ui/              # UI components
    │   ├── pages/               # Page components
    │   │   ├── Auth/            # Authentication pages
    │   │   ├── users/           # User management pages
    │   │   └── SuperAdmin/      # Admin pages
    │   ├── redux/               # State management
    │   │   ├── slices/          # Redux slices
    │   │   ├── api/             # API integration
    │   │   └── store.ts         # Store configuration
    │   ├── routes/              # Route configuration
    │   ├── hooks/               # Custom React hooks
    │   ├── service/             # API services
    │   ├── utils/               # Utility functions
    │   ├── types/               # TypeScript types
    │   ├── config/              # Configuration
    │   └── main.tsx             # Application entry point
    └── package.json
```

---

## 🔧 Backend Architecture

### Layered Architecture

The backend follows a **microservices-inspired modular architecture**:

```
Request → Middleware → Routes → Controller → Service → Model → Database
```

### 1. **Configuration Layer** (`config/`)
- Centralized environment configuration
- Database connections (MongoDB, Redis)
- External service connections (RabbitMQ - optional)

### 2. **Middleware Layer** (`middlewares/`)
- **Authentication**: JWT token verification
- **Session Management**: Redis-backed sessions
- **Error Handling**: Centralized error handling
- **Validation**: Request validation using Zod
- **Security**: Helmet, CORS, Rate limiting

### 3. **Microservices Layer** (`microservices/`)
Each microservice is self-contained with:
- **Controller**: Request handling and response formatting
- **Model**: Database schema and business logic
- **Validation**: Input validation schemas
- **Routes**: API endpoint definitions
- **Types**: TypeScript interfaces

**Example Structure:**
```
auth-service/
├── auth.controller.ts    # Request handlers
├── user.model.ts         # Mongoose model
├── session.model.ts      # Session model
├── auth.validation.ts    # Zod schemas
├── route.ts              # Route definitions
├── types.ts              # TypeScript types
└── config.json           # Service configuration
```

### 4. **Services Layer** (`services/`)
- **Business Logic**: Reusable business logic
- **RBAC**: Role-based access control
- **Swagger**: API documentation generation
- **Session Store**: Redis session management

### 5. **Utils Layer** (`utils/`)
- **Logger**: Winston-based logging
- **Pagination**: Pagination utilities
- **CORS**: CORS configuration
- **Cluster**: Cluster mode support (optional)

### Key Features

#### Authentication & Authorization
- JWT-based authentication
- Refresh token mechanism
- Role-based access control (RBAC)
- Session management with Redis

#### API Documentation
- Auto-generated Swagger documentation
- Available at `/api-docs`
- Schema validation with Zod

#### Error Handling
- Centralized error handling middleware
- Custom error classes
- Proper HTTP status codes
- Detailed error messages in development

#### Security
- Helmet for security headers
- CORS configuration
- Rate limiting
- Input validation
- Password hashing with bcrypt

---

## 🎨 Frontend Architecture

### Component-Based Architecture

The frontend follows **atomic design principles** with Redux for state management:

```
User Interaction → Component → Redux Action → API Call → State Update → Re-render
```

### 1. **Component Layer** (`components/`)

#### Common Components (`components/common/`)
- **Layout**: Header, Sidebar, Layout wrapper
- **ErrorBoundary**: Error boundary for error handling
- **LoadingSpinner**: Loading states
- **Icons**: Custom icon components

#### UI Components (`components/ui/`)
- Reusable form inputs
- Date pickers
- File upload components
- Pagination components

### 2. **Pages Layer** (`pages/`)
- **Auth**: Login, Forgot Password, Reset Password
- **Users**: User listing, User form
- **SuperAdmin**: Menu management, Role management

### 3. **State Management** (`redux/`)

#### Redux Store Structure
```typescript
{
  sidebar: {
    isOpen: boolean,
    activeMenu: string
  },
  user: {
    currentUser: User | null,
    isAuthenticated: boolean
  },
  toast: {
    message: string,
    type: 'success' | 'error' | 'info'
  }
}
```

#### Features:
- **Redux Toolkit**: Modern Redux with less boilerplate
- **Redux Persist**: State persistence with IndexedDB
- **Encryption**: Encrypted state storage
- **TypeScript**: Fully typed state and actions

### 4. **Routing** (`routes/`)

#### Route Configuration
- **Public Routes**: Login, Forgot Password, 404
- **Protected Routes**: Dashboard, Users, Settings
- **Dynamic Routes**: Role-based route access
- **Lazy Loading**: Code splitting for better performance

#### Route Protection
```typescript
lazyWithAuth(
  () => import('@/pages/users'),
  "GET",           // HTTP method
  "Read All",      // Action
  "users"          // Resource
)
```

### 5. **API Layer** (`service/`)
- **Axios Interceptors**: Request/response interceptors
- **Error Handling**: Centralized API error handling
- **Token Management**: Automatic token refresh
- **Base Configuration**: API base URL and headers

### 6. **Hooks** (`hooks/`)
- **ProtectedRoute**: Route protection with RBAC
- **Custom Hooks**: Reusable logic extraction

### Key Features

#### State Management
- Redux Toolkit for predictable state
- Redux Persist for offline support
- Encrypted storage for sensitive data
- TypeScript for type safety

#### Routing
- React Router v6
- Lazy loading for code splitting
- Protected routes with RBAC
- Dynamic route generation

#### UI/UX
- Material-UI components
- Responsive design
- Dark/Light theme support
- Toast notifications
- Loading states

#### Performance
- Code splitting
- Lazy loading
- Memoization
- Optimized re-renders

---

## 🏗️ Design Patterns

### Backend Patterns

#### 1. **Module Pattern**
Each microservice is a self-contained module with its own:
- Models
- Controllers
- Routes
- Validation
- Types

#### 2. **Middleware Pattern**
Reusable middleware for:
- Authentication
- Error handling
- Validation
- Logging

#### 3. **Repository Pattern**
Mongoose models act as repositories:
```typescript
// Model with business logic
userModel.findByEmail(email)
userModel.createUser(userData)
```

#### 4. **Singleton Pattern**
Database connections and services:
```typescript
// Single Redis connection instance
export default redisClient;
```

### Frontend Patterns

#### 1. **Container/Presenter Pattern**
- **Container**: Logic and state management
- **Presenter**: Pure UI components

#### 2. **Higher-Order Components (HOC)**
```typescript
lazyWithAuth(Component, method, action, resource)
```

#### 3. **Custom Hooks Pattern**
Reusable logic extraction:
```typescript
const useAuth = () => {
  // Authentication logic
}
```

#### 4. **Atomic Design**
- **Atoms**: Basic UI elements (buttons, inputs)
- **Molecules**: Simple component groups
- **Organisms**: Complex components
- **Templates**: Page layouts
- **Pages**: Complete pages

---

## ✅ Best Practices

### Backend Best Practices

#### 1. **Environment Configuration**
```typescript
// ✅ Good: Centralized configuration
import { PORT, MONGO_URI } from 'config';

// ❌ Bad: Direct process.env access
const port = process.env.PORT;
```

#### 2. **Error Handling**
```typescript
// ✅ Good: Custom error classes
throw new AppError('User not found', 404);

// ❌ Bad: Generic errors
throw new Error('Error');
```

#### 3. **Validation**
```typescript
// ✅ Good: Zod validation
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// ❌ Bad: Manual validation
if (!email || !password) throw new Error();
```

#### 4. **Async/Await**
```typescript
// ✅ Good: Proper error handling
try {
  const user = await User.findById(id);
} catch (error) {
  throw new AppError('User not found', 404);
}

// ❌ Bad: Unhandled promises
User.findById(id).then(user => { /* ... */ });
```

### Frontend Best Practices

#### 1. **Component Structure**
```typescript
// ✅ Good: Typed functional component
const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return <div>{user.name}</div>;
};

// ❌ Bad: Untyped component
const UserCard = (props) => {
  return <div>{props.user.name}</div>;
};
```

#### 2. **State Management**
```typescript
// ✅ Good: Redux Toolkit slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
    }
  }
});

// ❌ Bad: Direct state mutation
state.currentUser = newUser;
```

#### 3. **API Calls**
```typescript
// ✅ Good: Centralized API service
import { apiService } from '@/service/apiService';
const users = await apiService.get('/users');

// ❌ Bad: Direct axios calls
axios.get('http://localhost:3000/users');
```

#### 4. **Route Protection**
```typescript
// ✅ Good: HOC with RBAC
const Users = lazyWithAuth(
  () => import('@/pages/users'),
  "GET", "Read All", "users"
);

// ❌ Bad: Manual checks in component
if (!user.hasPermission('users')) return <Redirect />;
```

---

## 🚀 Getting Started

### Backend Setup

1. **Install dependencies:**
```bash
cd api
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
npm start
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd client
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

---

## 📝 Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGO_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret
JWT_EXPIRE=1h

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Frontend
FRONTEND_URL=http://localhost:5174
```

### Frontend (.env)
```env
# API
VITE_API_URL=http://localhost:3000

# Storage Encryption
VITE_API_INDEX_DB_STORAGE=your-encryption-key
```

---

## 🔒 Security Considerations

### Backend Security
- ✅ JWT token expiration
- ✅ Password hashing with bcrypt
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS prevention

### Frontend Security
- ✅ Encrypted state storage
- ✅ Token storage in memory
- ✅ HTTPS only in production
- ✅ Content Security Policy
- ✅ XSS prevention
- ✅ CSRF protection

---

## 📚 Additional Resources

### Backend
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Redis Documentation](https://redis.io/documentation)
- [Zod Documentation](https://zod.dev/)

### Frontend
- [React Documentation](https://react.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Material-UI Documentation](https://mui.com/)
- [React Router Documentation](https://reactrouter.com/)

---

## 🤝 Contributing

1. Follow the existing code structure
2. Write TypeScript types for all functions
3. Add proper error handling
4. Write meaningful commit messages
5. Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License.
