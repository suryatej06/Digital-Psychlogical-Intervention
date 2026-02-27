# 🚀 How to Run the Mental Health Support Platform

Complete step-by-step guide to run the project from scratch.

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Node.js** (v16 or higher)
  - Check: `node --version`
  - Download: https://nodejs.org/

- ✅ **MongoDB** (v5 or higher)
  - Check: `mongod --version`
  - Download: https://www.mongodb.com/try/download/community

- ✅ **npm** (comes with Node.js)
  - Check: `npm --version`

- ✅ **Code Editor** (VS Code recommended)

---

## 🔧 Step-by-Step Setup

### Step 1: Start MongoDB

**Windows:**
```bash
# Option 1: Start MongoDB Service
# Open Services (Win+R → services.msc)
# Find "MongoDB" → Right-click → Start

# Option 2: Run manually
mongod --dbpath "C:\data\db"
# (Create C:\data\db folder if it doesn't exist)
```

**macOS:**
```bash
# Using Homebrew
brew services start mongodb-community

# Or manually
mongod --config /usr/local/etc/mongod.conf
```

**Linux:**
```bash
sudo systemctl start mongod
# OR
mongod
```

**Verify MongoDB is running:**
- Open MongoDB Compass (GUI)
- OR run: `mongosh` in terminal
- If connected, you'll see MongoDB shell

---

### Step 2: Backend Setup

**Open Terminal/Command Prompt:**

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
# Windows PowerShell:
Copy-Item .env.example .env

# Windows CMD:
copy .env.example .env

# macOS/Linux:
cp .env.example .env
```

**Edit `.env` file** (open in any text editor):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mental-health-platform
JWT_SECRET=change-this-to-a-random-secret-key-12345
OPENAI_API_KEY=your-openai-api-key-here
FRONTEND_URL=http://localhost:5173
```

**Important:**
- `MONGODB_URI`: Default is fine if MongoDB runs on localhost:27017
- `JWT_SECRET`: Use any random string (for development)
- `OPENAI_API_KEY`: Optional - leave empty if you don't have one

---

### Step 3: Seed Database

**Still in backend folder:**

```bash
npm run seed
```

**Expected Output:**
```
✅ Connected to MongoDB
✅ Created default college: Default College
✅ Created default admin user: admin@default.com
   Password: admin123
   ⚠️  Please change this password after first login!

✅ Seeding completed successfully!

📝 Default Credentials:
   Email: admin@default.com
   Password: admin123
   College: Default College (DEFAULT)
```

**If you see errors:**
- Check MongoDB is running (Step 1)
- Verify `MONGODB_URI` in `.env` is correct
- Check MongoDB connection with `mongosh`

---

### Step 4: Start Backend Server

**Still in backend folder:**

```bash
npm run dev
```

**Expected Output:**
```
✅ MongoDB connected
🚀 Server running on port 5000
```

**Keep this terminal open!** The backend must stay running.

**If you see errors:**
- **Port 5000 in use:** Change `PORT` in `.env` to 5001
- **MongoDB connection error:** Go back to Step 1
- **Module not found:** Run `npm install` again

---

### Step 5: Frontend Setup

**Open a NEW Terminal/Command Prompt** (keep backend running)

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file
# Windows PowerShell:
Copy-Item .env.example .env

# Windows CMD:
copy .env.example .env

# macOS/Linux:
cp .env.example .env
```

**Edit `.env` file:**

```env
VITE_API_URL=http://localhost:5000/api
```

---

### Step 6: Start Frontend Server

**Still in frontend folder:**

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Keep this terminal open too!**

---

### Step 7: Access Application

**Open your browser:**

```
http://localhost:5173
```

You should see the **Landing Page**!

---

### Step 8: Login as Admin

1. Click **"Login"** in the navbar
2. Enter credentials:
   - **Email:** `admin@default.com`
   - **Password:** `admin123`
3. Click **"Sign in"**

**⚠️ IMPORTANT:** Change the password after first login!

---

## ✅ Verification Checklist

Run through this checklist to verify everything works:

- [ ] MongoDB is running
- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 5173)
- [ ] Can access http://localhost:5173
- [ ] Can login with admin credentials
- [ ] Health check works: http://localhost:5000/api/health
- [ ] Admin panel is accessible
- [ ] Can create resources
- [ ] Can register new users

---

## 🎯 Quick Test Sequence

After logging in as admin:

1. **Create a College:**
   - Use API endpoint or MongoDB Compass
   - `POST /api/colleges` (requires admin token)

2. **Register Test Users:**
   - Go to Register page
   - Create a student user
   - Create a counselor user

3. **Test Student Features:**
   - Login as student
   - Browse resources
   - Create community post
   - Use chatbot
   - Book counseling session

4. **Test Counselor Features:**
   - Login as counselor
   - Set availability
   - Approve/reject bookings

5. **Test Admin Features:**
   - View dashboard stats
   - Manage users
   - View flagged content

---

## 🐛 Common Issues & Solutions

### Issue: "MongoDB connection error"

**Solution:**
- Ensure MongoDB is running (Step 1)
- Check `MONGODB_URI` in backend `.env`
- Test connection: `mongosh`
- Verify MongoDB service is started

---

### Issue: "Port 5000 already in use"

**Solution:**
- Change `PORT` in backend `.env` to 5001 (or another port)
- Update frontend `.env`: `VITE_API_URL=http://localhost:5001/api`
- Restart backend server

---

### Issue: "Cannot GET /api/..."

**Solution:**
- Backend not running - Start it (Step 4)
- Check backend terminal for errors
- Verify backend is on correct port

---

### Issue: "Network Error" in frontend

**Solution:**
- Backend not running
- Check `VITE_API_URL` in frontend `.env`
- Verify CORS settings (should allow localhost:5173)
- Check backend terminal for errors

---

### Issue: "401 Unauthorized"

**Solution:**
- Token expired - Logout and login again
- Check `JWT_SECRET` is set in backend `.env`
- Clear browser localStorage
- Check token in browser DevTools → Application → Local Storage

---

### Issue: Seeding fails

**Solution:**
- MongoDB not running
- Wrong `MONGODB_URI` in `.env`
- Database already has conflicting data
- Delete existing data: `mongosh` → `use mental-health-platform` → `db.dropDatabase()`

---

### Issue: "Module not found"

**Solution:**
- Run `npm install` again
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` fresh
- Check Node.js version: `node --version` (should be v16+)

---

## 📝 Quick Reference Commands

```bash
# Start MongoDB
mongod

# Backend (Terminal 1)
cd backend
npm install
npm run seed      # First time only
npm run dev

# Frontend (Terminal 2)
cd frontend
npm install
npm run dev

# Access
http://localhost:5173
```

---

## 🔄 Restarting the Project

If you need to restart:

1. **Stop servers:** Press `Ctrl+C` in both terminals
2. **Restart MongoDB** (if stopped)
3. **Start backend:** `cd backend && npm run dev`
4. **Start frontend:** `cd frontend && npm run dev`

**Note:** You don't need to run `npm run seed` again unless you drop the database.

---

## 🎉 Success!

If you see:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 5173
- ✅ Can login as admin
- ✅ Can access all features

**You're all set!** 🚀

---

## 📚 Next Steps

1. **Change admin password**
2. **Create additional colleges**
3. **Register test users**
4. **Customize the platform**
5. **Deploy to production**

---

## 🆘 Need Help?

- Check `README.md` for detailed documentation
- Check `CHANGES_SUMMARY.md` for recent changes
- Review backend terminal for error messages
- Check MongoDB logs for database errors

**Happy Coding!** 💻
