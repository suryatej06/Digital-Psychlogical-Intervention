# 🔧 Setup Guide

Detailed setup reference for developers picking up this project.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default: 5000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `OPENAI_API_KEY` | No | OpenAI key for chatbot (mock used if absent) |
| `FRONTEND_URL` | Yes | Frontend URL for CORS (default: http://localhost:5173) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API base URL (default: http://localhost:5000/api) |

---

## Database Seeding

Two seed commands are needed:
```bash
cd backend

# 1. Seeds default college + admin user
npm run seed

# 2. Seeds PHQ-9 assessment questionnaire
node seed.js
```

Run both once on first setup. Re-run `node seed.js` only if you drop the assessments collection.

**Default admin credentials after seeding:**
- Email: `admin@default.com`
- Password: `admin123`

---

## Key Architectural Decisions

### ES Modules
The entire backend uses ES module syntax. All files must use `import`/`export` — never `require`/`module.exports`.

### Multi-Tenancy
Every piece of data is scoped to a `collegeId`. The `authenticate` middleware attaches `req.user.collegeId` from the JWT — controllers must always filter by this value.

### Auth Middleware
The exported name is `authenticate` from `backend/middleware/auth.js`. It attaches:
```js
req.user = { userId, email, role, collegeId }
```

### Frontend API
All API calls go through the centralised axios instance in `frontend/src/services/api.js`. Never create separate axios instances in individual components or pages.

### Assessment Module
- Routes: `/api/assessments/:type`, `/api/assessments/results`
- All routes protected by `authenticate`
- Results saved with `userId` and `collegeId` from JWT
- Frontend page at `/assessment` — student role only

---

## Role Permissions

| Feature | Student | Counselor | Admin |
|---------|---------|-----------|-------|
| Assessment | ✅ | ❌ | ❌ |
| Resources | ✅ (view) | ❌ | ✅ (manage) |
| Community | ✅ | ❌ | ✅ (moderate) |
| Chatbot | ✅ | ❌ | ❌ |
| Bookings | ✅ (book) | ✅ (manage) | ❌ |
| Admin Panel | ❌ | ❌ | ✅ |

---

## Project Phase Tracker

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Standalone assessment module |
| Phase 2 | ✅ Complete | Integration into main platform |
| Phase 3 | ⬜ Upcoming | Results History Page |
| Phase 4 | ⬜ Upcoming | Multiple Assessment Types (GAD-7) |
| Phase 5 | ⬜ Upcoming | Polish — error boundaries, mobile, disclaimer |
| Phase 6 | ⬜ Upcoming | Resource Hub with severity-based recommendations |