# Restaurant Reservation Management System

A full-stack restaurant reservation application built with React, Node.js/Express, MongoDB, and JWT authentication. It supports customer bookings and an administrative dashboard with role-based access control.

## Live Demo

> Update these URLs after deployment:
> - **Frontend:** `https://your-frontend-url.vercel.app`
> - **Backend API:** `https://your-backend-url.onrender.com`

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (jsonwebtoken + bcryptjs) |

## Features

### Customer
- Register and log in
- Create reservations with date, time slot, guest count, and table
- View own past and upcoming reservations
- Cancel active reservations

### Administrator
- View all reservations with optional date filter
- Update or cancel any reservation
- Manage restaurant tables (create, activate/deactivate, delete)

### Validation Logic
- Prevents overlapping bookings for the same table, date, and time slot
- Ensures table capacity meets guest count
- Blocks past-date reservations
- Returns meaningful HTTP error messages

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Environment & DB connection
│   │   ├── constants/      # Roles, time slots, statuses
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── scripts/        # Seed scripts
│   │   ├── services/       # Business logic (overlap/capacity)
│   │   ├── validators/     # express-validator rules
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, ProtectedRoute
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Login, Dashboard, Admin views
│   │   ├── services/       # API client
│   │   └── utils/
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the repository

```bash
git clone <repository-url>
cd restaurant-reservation-management-system
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restaurant-reservations
JWT_SECRET=your_secure_random_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Seed the database:

```bash
npm run seed:tables
npm run seed:admin
```

Default admin credentials (change after first login in production):
- Email: `admin@restaurant.com`
- Password: `admin123`

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register customer |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Authenticated | Current user |

### Reservations
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/reservations/my` | Customer | Own reservations |
| GET | `/api/reservations` | Admin | All reservations (`?date=YYYY-MM-DD`) |
| GET | `/api/reservations/availability` | Authenticated | Available tables |
| POST | `/api/reservations` | Customer | Create reservation |
| PUT | `/api/reservations/:id` | Owner/Admin | Update reservation |
| DELETE | `/api/reservations/:id` | Owner/Admin | Cancel reservation |

### Tables
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tables` | Authenticated | List tables |
| POST | `/api/tables` | Admin | Create table |
| PUT | `/api/tables/:id` | Admin | Update table |
| DELETE | `/api/tables/:id` | Admin | Delete table |

## Assumptions

1. **Single restaurant** with a fixed set of tables seeded at startup.
2. **Time slots** are predefined: `12:00-14:00`, `18:00-20:00`, `20:00-22:00`.
3. **One reservation per table per slot** — no partial overlaps within a slot.
4. **Customers self-register**; administrators are seeded via script (not public registration).
5. **Dates** are stored in UTC midnight; the UI uses ISO date strings.
6. **Cancelled reservations** free the table slot (partial unique index excludes cancelled records).

## Reservation & Availability Logic

When creating or updating a reservation, the backend:

1. **Validates the date** — rejects past dates.
2. **Checks table capacity** — `table.capacity >= guestCount`.
3. **Checks for overlap** — queries active reservations with the same `table`, `date`, and `timeSlot`. If found, returns `409 Conflict`.
4. **Database constraint** — a partial unique index on `(table, date, timeSlot)` where `status = 'active'` provides a second layer of protection.

The availability endpoint returns all active tables that:
- Have `capacity >= guestCount`
- Are not booked for the given date and time slot

## Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **customer** | Register, login, create/view/cancel own reservations, check availability |
| **admin** | All customer permissions plus view all reservations, filter by date, update/cancel any reservation, manage tables |

JWT tokens are sent via `Authorization: Bearer <token>`. The `protect` middleware verifies the token; `restrictTo('admin')` guards admin-only routes. Frontend routes use `ProtectedRoute` with `allowedRoles` to redirect unauthorized users.

## Deployment

### Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repo; set root directory to `backend`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Set environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (frontend URL), `NODE_ENV=production`.

Alternatively, use the included `render.yaml` blueprint.

### Frontend (Vercel)

1. Import the repo on [Vercel](https://vercel.com).
2. Set root directory to `frontend`.
3. Set environment variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`
4. Deploy.

### MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Whitelist `0.0.0.0/0` (or Render's IP) for cloud access.
3. Use the connection string as `MONGODB_URI`.
4. Run seed scripts locally against the Atlas URI before going live.

## Known Limitations

- No email notifications or payment processing.
- No real-time updates (manual refresh required).
- Fixed time slots; no custom start/end times.
- Admin accounts cannot be created via the UI.
- No pagination on reservation lists.
- Minimal UI styling (functional, not polished).

## Future Improvements

- Email confirmation and reminder notifications
- Waitlist for fully booked slots
- Custom time slot configuration per restaurant
- Admin user management UI
- Pagination and search for reservations
- Unit and integration tests
- Real-time availability updates via WebSockets

## Git Branch History

| Branch | Phase |
|--------|-------|
| `setup/initial-configuration` | Project scaffolding |
| `feature/database-and-auth` | Models, JWT, seed scripts |
| `feature/core-api-logic` | REST API & validation |
| `feature/frontend-routing-auth` | React Router & auth |
| `feature/ui-integration` | Customer & admin UI |
| `chore/deployment-and-docs` | README & deployment config |

## License

ISC
