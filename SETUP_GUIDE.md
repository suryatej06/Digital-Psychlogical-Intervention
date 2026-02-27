# 🚀 Complete Setup & Run Guide

Follow these steps in order to get your Mental Health Support Platform running correctly.

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- ✅ Node.js installed (v16 or higher) - Check with: `node --version`
- ✅ MongoDB installed and running - Check with: `mongod --version`
- ✅ npm or yarn installed - Check with: `npm --version`
- ✅ Code editor (VS Code recommended)
- ✅ Terminal/Command Prompt access

---

## 🔧 Step-by-Step Setup

### Step 1: Verify MongoDB is Running

**Windows:**
```bash
# Option 1: Check if MongoDB service is running
# Open Services (services.msc) and look for "MongoDB"

# Option 2: Start MongoDB manually
# Navigate to MongoDB installation folder and run:
mongod --dbpath "C:\data\db"
# (Create C:\data\db folder if it doesn't exist)
```

**macOS/Linux:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# If not running, start it:
sudo systemctl start mongod

# Or run directly:
mongod
```

**Verify MongoDB is accessible:**
- Open MongoDB Compass (GUI) or
- Run: `mongosh` or `mongo` in terminal
- If connected, you'll see MongoDB shell prompt

---

### Step 2: Backend Setup

1. **Navigate to backend folder:**
```bash
cd backend
```

2. **Install backend dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Windows CMD
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

4. **Edit `.env` file** (open in any text editor):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mental-health-platform
JWT_SECRET=change-this-to-a-random-secret-key-in-production-12345
OPENAI_API_KEY=your-openai-api-key-here
FRONTEND_URL=http://localhost:5173
```

**Important Notes:**
- `MONGODB_URI`: Default is fine if MongoDB runs on localhost:27017
- `JWT_SECRET`: Use a random string (can be anything for development)
- `OPENAI_API_KEY`: Optional - leave empty if you don't have one (mock responses will be used)

5. **Start the backend server:**
```bash
npm run dev
```

**Expected Output:**
```
✅ MongoDB connected
🚀 Server running on port 5000
```

**If you see errors:**
- **MongoDB connection error**: Make sure MongoDB is running (Step 1)
- **Port already in use**: Change PORT in .env to 5001 or another port
- **Module not found**: Run `npm install` again

**Keep this terminal open!** The backend must stay running.

---

### Step 3: Frontend Setup

**Open a NEW terminal window** (keep backend running)

1. **Navigate to frontend folder:**
```bash
cd frontend
```

2. **Install frontend dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Windows CMD
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

4. **Edit `.env` file:**
```env
VITE_API_URL=http://localhost:5000/api
```

5. **Start the frontend development server:**
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

### Step 4: Access the Application

Open your browser and go to:
```
http://localhost:5173
```

You should see the **Landing Page** with "Mental Health Support Platform"

---

## 👤 Step 5: Create Your First College (Admin Required)

**IMPORTANT:** You need an admin user to create colleges. Follow this sequence:

### Option A: Create Admin via MongoDB (Recommended for First Setup)

1. **Open MongoDB Compass** or MongoDB shell
2. **Connect to:** `mongodb://localhost:27017`
3. **Select database:** `mental-health-platform`
4. **Go to `colleges` collection** → Click "INSERT DOCUMENT"
5. **Add this document:**
```json
{
  "name": "Test College",
  "code": "TC",
  "description": "Test College for initial setup",
  "isActive": true
}
```
6. **Save** and **copy the `_id`** (you'll need it)

7. **Go to `users` collection** → Click "INSERT DOCUMENT"
8. **Add this document** (replace `YOUR_COLLEGE_ID` with the ID from step 6):
```json
{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq",
  "role": "admin",
  "collegeId": ObjectId("YOUR_COLLEGE_ID"),
  "alias": "Admin",
  "isActive": true
}
```

**Wait!** The password above is a hash for `password123`. To create your own:
- Use an online bcrypt generator, OR
- Register normally first, then change role to admin

### Option B: Register First, Then Make Admin (Easier)

1. **Go to:** http://localhost:5173/register
2. **Fill the form:**
   - Name: Your Name
   - Email: admin@test.com
   - Role: Select "Counselor" (we'll change it)
   - College: You'll need to create one first (see Option A, steps 1-6)
   - Password: password123
   - Confirm Password: password123
3. **Click Register**
4. **Go to MongoDB Compass** → `users` collection
5. **Find your user** → Click "EDIT"
6. **Change `role` from `"counselor"` to `"admin"`**
7. **Save**

---

## 🎯 Step 6: Recommended User Flow Sequence

### Sequence 1: Admin Setup (Do This First)

1. **Login as Admin:**
   - Go to: http://localhost:5173/login
   - Email: admin@test.com
   - Password: password123

2. **Create Colleges:**
   - Go to Admin Panel (or use API/Postman)
   - Create at least 2-3 colleges for testing

3. **Create Resources:**
   - Go to Admin Panel → Resources section
   - Add some test resources (articles, videos, audio)

### Sequence 2: Create Test Users

**Open a new browser window in Incognito/Private mode** (to test multiple users)

1. **Register a Student:**
   - Go to: http://localhost:5173/register
   - Name: Student One
   - Email: student1@test.com
   - Role: Student
   - College: Select one you created
   - Password: password123
   - Register

2. **Register a Counselor:**
   - Go to: http://localhost:5173/register
   - Name: Counselor One
   - Email: counselor1@test.com
   - Role: Counselor
   - College: Select same college as student
   - Password: password123
   - Register

### Sequence 3: Test Student Features

**Login as Student** (student1@test.com)

1. **Dashboard:**
   - Should see 4 cards: Resources, Community, Chatbot, Bookings

2. **Resources:**
   - Click "Resources" in navbar
   - Should see resources created by admin
   - Filter by type/category

3. **Community:**
   - Click "Community"
   - Click "Create Post"
   - Create a test post (try with anonymous checkbox)
   - Add comments to posts
   - Like posts
   - Report a post (to test admin features)

4. **Chatbot:**
   - Click "Chatbot"
   - Send messages: "I'm feeling anxious"
   - Send crisis message: "I want to kill myself" (to test risk detection)
   - Check risk score updates

5. **Bookings:**
   - Click "Bookings"
   - Click "Book Session"
   - Select counselor (counselor1@test.com)
   - Set date/time
   - Submit booking

### Sequence 4: Test Counselor Features

**Login as Counselor** (counselor1@test.com)

1. **Set Availability:**
   - Go to Bookings page
   - Click "Set Availability"
   - Add time slots

2. **Manage Bookings:**
   - View pending bookings from students
   - Approve/Reject bookings
   - Mark as completed after sessions

### Sequence 5: Test Admin Features

**Login as Admin** (admin@test.com)

1. **Admin Panel:**
   - View dashboard statistics
   - Go to "Users" tab → Activate/Deactivate users
   - Go to "Flagged Posts" → Review reported posts
   - Go to "Flagged Sessions" → Review high-risk chat sessions

---

## 🧪 Quick Test Checklist

Run through this checklist to verify everything works:

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] Can access landing page
- [ ] Can register new user
- [ ] Can login
- [ ] Admin can access admin panel
- [ ] Student can see resources
- [ ] Student can create posts
- [ ] Student can use chatbot
- [ ] Student can book sessions
- [ ] Counselor can see bookings
- [ ] Counselor can approve/reject bookings
- [ ] Admin can see flagged content

---

## 🐛 Troubleshooting

### Problem: "MongoDB connection error"
**Solution:**
- Make sure MongoDB is running (Step 1)
- Check `MONGODB_URI` in backend `.env`
- Try: `mongosh` to test MongoDB connection

### Problem: "Cannot GET /api/..."
**Solution:**
- Backend not running - Start it with `npm run dev` in backend folder
- Check backend terminal for errors
- Verify backend is on port 5000

### Problem: "Network Error" in frontend
**Solution:**
- Backend not running
- Check `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend (should allow localhost:5173)

### Problem: "401 Unauthorized"
**Solution:**
- Token expired - Logout and login again
- Check if JWT_SECRET is set in backend `.env`
- Clear browser localStorage and login again

### Problem: "College not found" when registering
**Solution:**
- Create a college first (Step 5)
- Make sure college `isActive: true`

### Problem: "Cannot access admin panel"
**Solution:**
- User role must be "admin" in database
- Check user role in MongoDB Compass
- Logout and login again after changing role

### Problem: Chatbot not responding
**Solution:**
- If no OpenAI API key: Mock responses should work
- Check backend terminal for errors
- Check rate limiting (max 30 requests per 15 minutes)

---

## 📝 Quick Reference Commands

```bash
# Start MongoDB (if not running as service)
mongod

# Backend (Terminal 1)
cd backend
npm install
npm run dev

# Frontend (Terminal 2)
cd frontend
npm install
npm run dev

# Access Application
http://localhost:5173
```

---

## 🎉 You're All Set!

Once everything is running:
1. ✅ Backend on port 5000
2. ✅ Frontend on port 5173
3. ✅ At least one college created
4. ✅ At least one admin user created

You can now:
- Register users
- Test all features
- Customize the platform
- Deploy to production

**Happy Coding! 🚀**
