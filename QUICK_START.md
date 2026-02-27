# 🚀 Quick Start Guide

Follow these steps to get the Mental Health Support Platform running in minutes.

## Prerequisites

- ✅ Node.js (v16+)
- ✅ MongoDB installed and running
- ✅ Terminal/Command Prompt

---

## Step-by-Step Setup

### 1️⃣ Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

---

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

---

### 3️⃣ Start MongoDB

**Windows:**
- Open Services → Start MongoDB service
- OR run: `mongod --dbpath "C:\data\db"`

**macOS/Linux:**
```bash
sudo systemctl start mongod
# OR
mongod
```

**Verify:** Open MongoDB Compass or run `mongosh` to test connection.

---

### 4️⃣ Seed Database

```bash
cd backend
npm run seed
```

**Output:**
```
✅ Connected to MongoDB
✅ Created default college: Default College
✅ Created default admin user: admin@default.com
   Password: admin123
```

---

### 5️⃣ Start Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ MongoDB connected
🚀 Server running on port 5000
```

**Keep this terminal open!**

---

### 6️⃣ Start Frontend Server

**Open a NEW terminal:**

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

**Keep this terminal open too!**

---

### 7️⃣ Access Application

Open browser: **http://localhost:5173**

---

### 8️⃣ Login as Admin

- **Email:** `admin@default.com`
- **Password:** `admin123`

**⚠️ IMPORTANT:** Change the password after first login!

---

## ✅ Verification Checklist

- [ ] MongoDB is running
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Can login with admin credentials
- [ ] Health check works: http://localhost:5000/api/health

---

## 🎯 Next Steps

1. **Change admin password** (via profile or admin panel)
2. **Create additional colleges** (Admin Panel → Colleges)
3. **Register test users:**
   - Students
   - Counselors
4. **Test features:**
   - Resources
   - Community posts
   - Chatbot
   - Bookings

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Test with: `mongosh`

### Port Already in Use
- Change `PORT` in backend `.env`
- Kill process using port: `lsof -ti:5000 | xargs kill` (macOS/Linux)

### Seeding Fails
- Check MongoDB connection
- Ensure database doesn't have conflicting data
- Delete existing data if needed

### Frontend Can't Connect to Backend
- Verify backend is running
- Check `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend

---

## 📝 Default Credentials

After seeding:
- **Email:** admin@default.com
- **Password:** admin123
- **College:** Default College (DEFAULT)

---

## 🎉 You're Ready!

The platform is now running. Start exploring features and customizing for your needs!
