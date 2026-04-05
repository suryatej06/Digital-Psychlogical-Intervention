# 🚀 How to Run the Mental Health Support Platform

Complete step-by-step guide to run the project from scratch.

---

## 📋 Prerequisites

- ✅ Node.js (v16+) — `node --version`
- ✅ MongoDB (v5+) — `mongod --version`
- ✅ npm — `npm --version`

---

## Step 1: Start MongoDB

**Windows:**
```bash
mongod --dbpath "C:\data\db"
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

Verify with `mongosh` — if you see the MongoDB shell, it's running.

---

## Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Windows: copy .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mental-health-platform
JWT_SECRET=any-random-string-for-development
OPENAI_API_KEY=optional
FRONTEND_URL=http://localhost:5173
```

---

## Step 3: Seed the Database

Run both seed commands — the first creates the default college and admin user, the second loads the PHQ-9 assessment data:
```bash
cd backend
npm run seed
node seed.js
```

Expected output from `node seed.js`:
```
✅ Connected to MongoDB
✅ PHQ-9 seeded successfully
```

---

## Step 4: Start Backend
```bash
npm run dev
```

Expected:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

Keep this terminal open.

---

## Step 5: Frontend Setup

Open a **new terminal:**
```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Step 6: Start Frontend
```bash
npm run dev
```

Expected:
```
➜  Local:   http://localhost:5173/
```

Keep this terminal open.

---

## Step 7: Access the App

Open: **http://localhost:5173**

Login as admin:
- Email: `admin@default.com`
- Password: `admin123`

---

## Step 8: Test the Assessment Feature

1. Register or log in as a **student** account
2. Click **Assessment** in the navbar
3. Complete the PHQ-9 quiz
4. Verify your score and severity label appear on the results screen
5. Check MongoDB — a `UserResult` document should be saved with your `userId` and `collegeId`

---

## 🔄 Restarting

1. Press `Ctrl+C` in both terminals
2. Restart MongoDB if stopped
3. `cd backend && npm run dev`
4. `cd frontend && npm run dev`

You do **not** need to re-run the seed commands unless you drop the database.

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Ensure MongoDB is running, check `MONGODB_URI` |
| Port 5000 in use | Change `PORT` in backend `.env` |
| Module not found | Run `npm install` again |
| Network Error in frontend | Check `VITE_API_URL`, verify backend is running |
| 401 Unauthorized | Token expired — logout and login again |
| Assessment not loading | Run `node seed.js` to ensure PHQ-9 data exists |