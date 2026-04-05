# 🚀 Quick Start Guide

Get the Mental Health Support Platform running in minutes.

## Prerequisites

- ✅ Node.js (v16+)
- ✅ MongoDB installed and running
- ✅ Terminal / Command Prompt

---

## Setup Steps

### 1️⃣ Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2️⃣ Configure Environment Variables

**Backend `.env`:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mental-health-platform
JWT_SECRET=your-random-secret-key-here
OPENAI_API_KEY=your-openai-key-optional
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3️⃣ Start MongoDB

**Windows:** Open Services → Start MongoDB, or run `mongod --dbpath "C:\data\db"`

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

### 4️⃣ Seed Database
```bash
cd backend
npm run seed    # creates default college + admin user
node seed.js    # seeds PHQ-9 assessment data
```

**Default admin credentials:**
- Email: `admin@default.com`
- Password: `admin123`
- ⚠️ Change this after first login!

### 5️⃣ Start Backend
```bash
cd backend
npm run dev
```

Expected: `🚀 Server running on port 5000` — keep this terminal open.

### 6️⃣ Start Frontend

Open a **new terminal:**
```bash
cd frontend
npm run dev
```

Expected: `➜ Local: http://localhost:5173/` — keep this terminal open.

### 7️⃣ Open the App
```
http://localhost:5173
```

---

## ✅ Verification Checklist

- [ ] MongoDB running
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can log in with admin credentials
- [ ] Health check: http://localhost:5000/api/health
- [ ] Assessment loads at http://localhost:5173/assessment (log in as student first)

---

## 🐛 Quick Fixes

| Problem | Fix |
|---------|-----|
| MongoDB connection error | Ensure MongoDB is running, check `MONGODB_URI` |
| Port already in use | Change `PORT` in backend `.env` |
| Seeding fails | Check MongoDB connection, drop DB if conflicting data |
| Frontend can't reach backend | Check `VITE_API_URL`, verify backend is running |

---

## 📝 Default Credentials

- **Email:** admin@default.com
- **Password:** admin123
- **College:** Default College (DEFAULT)