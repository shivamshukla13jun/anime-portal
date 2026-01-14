### Prerequisites
- Node.js (>=18.x)
- MongoDB database
- npm or yarn
- React (frontend)
- Express.js (backend)
## Security Features
- Password hashing with bcrypt
- Session-based authentication
- Role-based access control
## Encryption

All API requests and responses are encrypted end-to-end. The client encrypts the request payload before sending, and the server responds with encrypted data. This ensures sensitive information is protected in transit.
Both request and response bodies must be decrypted on the client side for use.

## Key Features

1. **Role-Based Access Control**
   - Super Admin, Admin
   - Granular permissions per service

2. **Session Management**
   - Secure authentication
   - Activity tracking

### Model Workflows

#### Authentication Flow
1. **User Model**
   - Handles user registration and authentication
   - Manages role-based permissions (Super Admin, Admin, Dispatcher, Manager)
   - Tracks user status (isActive, isBlocked)
   - Password encryption using bcrypt
   - Session management with Sessions limit

2. **Session Model**
   - Tracks active user sessions
   - Manages session expiry (15 minutes inactive timeout)
   - Stores encryption keys for secure communication
   - Handles concurrent session limits based on user plan(Instead Of SuperAdmin)

### 10. Support Services
- **Note Services**: Internal notes and communications
- **Notification Services**: System notifications and alerts

## Role-Based Access Control (RBAC)

This documents the data visibility and permissions for different user roles within the system. The core logic is implemented in `src/utils/getServicesByCreatedBy.ts`, which dynamically constructs database queries based on the user's role.

### Data Visibility Rules by Role:

- **Super Admin (`superadmin`)**:
  - Has unrestricted access to all data.

- **Admin (`admin`)**:
  - Can access data they have created.
  - Can access data created by any user they have personally created (sub-users).