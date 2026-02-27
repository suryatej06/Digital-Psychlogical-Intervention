# Mental Health Support Platform

A production-ready multi-tenant Mental Health Support Platform built with the MERN stack. This platform provides mental health resources, community support, AI-powered chatbot assistance, and counseling booking services for multiple colleges.

## 🚀 Features

### Core Features
- **Multi-Tenant Architecture**: College-based data isolation
- **Role-Based Access Control**: Student, Counselor, and Admin roles
- **Authentication**: JWT-based secure authentication
- **Resources Library**: Audio, video, and article resources
- **Community Forum**: Anonymous posting and commenting
- **AI Chatbot**: OpenAI-powered mental health support with risk detection
- **Counseling Booking**: Schedule and manage counseling sessions
- **Admin Dashboard**: Manage users, resources, and flagged content

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Multi-tenant data isolation with strict enforcement
- Input validation and sanitization (express-validator)
- Rate limiting on all endpoints (helmet, express-rate-limit)
- Request logging (morgan)
- Atomic booking operations (MongoDB transactions)
- First-user auto admin assignment
- Database seeding script

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn
- OpenAI API key (optional - platform works with mock responses if not provided)

## 🛠️ Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mental-health-platform
JWT_SECRET=your-super-secret-jwt-key-change-in-production
OPENAI_API_KEY=your-openai-api-key-here
FRONTEND_URL=http://localhost:5173
```

5. Start MongoDB (if not running):
```bash
# On macOS/Linux
mongod

# On Windows
# Start MongoDB service from Services panel or use MongoDB Compass
```

6. **Seed the database** (creates default college and admin user):
```bash
npm run seed
```

**Default Admin Credentials:**
- Email: `admin@default.com`
- Password: `admin123`
- ⚠️ **Change this password after first login!**

7. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```bash
cp .env.example .env
```

4. Update the `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🗄️ Database Setup

The database is automatically seeded when you run `npm run seed`. This creates:
- A default college (code: DEFAULT)
- A default admin user (email: admin@default.com, password: admin123)

**No manual database editing required!**

### First-User Auto Admin Logic

If you don't run the seed script, the first user to register will automatically become an admin. This ensures the platform always has at least one admin user.

### Creating Additional Colleges

After logging in as admin:
1. Go to Admin Panel
2. Use the API endpoint: `POST /api/colleges` (requires admin role)
3. Or use MongoDB Compass/Shell if preferred

## 📁 Project Structure

```
mental-health-platform/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── chatController.js
│   │   ├── collegeController.js
│   │   ├── commentController.js
│   │   ├── postController.js
│   │   └── resourceController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── roleCheck.js
│   ├── models/
│   │   ├── Booking.js
│   │   ├── ChatSession.js
│   │   ├── College.js
│   │   ├── Comment.js
│   │   ├── Message.js
│   │   ├── Post.js
│   │   ├── Report.js
│   │   ├── Resource.js
│   │   └── User.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── chat.js
│   │   ├── colleges.js
│   │   ├── posts.js
│   │   └── resources.js
│   ├── services/
│   │   ├── aiService.js
│   │   └── riskDetection.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── Bookings.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── Community.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Resources.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Colleges
- `GET /api/colleges` - Get all colleges
- `GET /api/colleges/:id` - Get college by ID
- `POST /api/colleges` - Create college (Admin only)

### Resources
- `GET /api/resources` - Get all resources (filtered by college)
- `GET /api/resources/:id` - Get resource by ID
- `POST /api/resources` - Create resource (Admin only)
- `PUT /api/resources/:id` - Update resource (Admin only)
- `DELETE /api/resources/:id` - Delete resource (Admin only)

### Posts
- `GET /api/posts` - Get all posts (filtered by college)
- `GET /api/posts/:id` - Get post with comments
- `POST /api/posts` - Create post (Student only)
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/report` - Report post
- `DELETE /api/posts/:id` - Delete post (Admin only)

### Comments
- `POST /api/posts/:postId/comments` - Create comment
- `DELETE /api/posts/comments/:id` - Delete comment

### Chat
- `GET /api/chat/session` - Get or create chat session (Student only)
- `POST /api/chat/message` - Send message to chatbot (Student only)
- `POST /api/chat/session/:sessionId/close` - Close session (Student only)
- `GET /api/chat/history` - Get chat history (Student only)

### Bookings
- `POST /api/bookings/book` - Book counseling session (Student only)
- `GET /api/bookings/student` - Get student bookings
- `GET /api/bookings/counselor` - Get counselor bookings
- `POST /api/bookings/availability` - Set availability (Counselor only)
- `PUT /api/bookings/:bookingId/status` - Update booking status (Counselor only)

### Admin
- `GET /api/admin/users` - Get all users (Admin only)
- `PUT /api/admin/users/:userId/status` - Update user status (Admin only)
- `GET /api/admin/posts/flagged` - Get flagged posts (Admin only)
- `GET /api/admin/chat/flagged` - Get flagged chat sessions (Admin only)
- `GET /api/admin/stats` - Get dashboard statistics (Admin only)

## 🎯 Usage Guide

### For Students
1. Register with your college
2. Browse resources in the Resources section
3. Participate in the Community forum (optionally anonymous)
4. Use the AI Chatbot for instant support
5. Book counseling sessions with available counselors

### For Counselors
1. Register as a counselor
2. Set your availability slots
3. Review and approve/reject booking requests
4. Manage your counseling sessions

### For Admins
1. Create colleges
2. Manage users (activate/deactivate)
3. Create and manage resources
4. Monitor flagged posts and chat sessions
5. View dashboard statistics

## 🔒 Security Considerations

- **Never commit `.env` files** - They contain sensitive information
- **Change JWT_SECRET** in production
- **Use HTTPS** in production
- **Implement rate limiting** on all endpoints
- **Validate all inputs** on both frontend and backend
- **Use environment variables** for all configuration
- **Regular security audits** recommended

## 🧪 Testing

To test the platform:

1. Start both backend and frontend servers
2. Register a new user (student or counselor)
3. Create a college (as admin) or use existing one
4. Test each feature:
   - Browse resources
   - Create posts and comments
   - Use chatbot
   - Book counseling sessions
   - Admin functions

## 🚀 Quick Start Guide

### Complete Setup Sequence

1. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env` in both backend and frontend
   - Update MongoDB URI and JWT_SECRET

3. **Start MongoDB:**
   ```bash
   mongod
   ```

4. **Seed database:**
   ```bash
   cd backend
   npm run seed
   ```

5. **Start backend:**
   ```bash
   npm run dev
   ```

6. **Start frontend** (new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

8. **Login as admin:**
   - Email: `admin@default.com`
   - Password: `admin123`

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in `.env`
2. Update `MONGODB_URI` to production database
3. Set strong `JWT_SECRET`
4. Run `npm run seed` on production (or ensure admin exists)
5. Deploy to platforms like Heroku, Railway, or AWS

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to Vercel, Netlify, or similar
3. Update `VITE_API_URL` to production backend URL

## 📝 Notes

- The chatbot uses OpenAI API if `OPENAI_API_KEY` is provided, otherwise uses mock responses
- Risk detection scans for crisis keywords and calculates risk scores
- All data is isolated by `collegeId` for multi-tenant security
- Anonymous posts/comments store user ID but display alias/name based on `isAnonymous` flag

## 🤝 Contributing

This is a production-ready template. Feel free to extend it with:
- Email notifications
- File uploads for resources
- Video conferencing integration
- Advanced analytics
- Mobile app version

## 📄 License

This project is provided as-is for educational and production use.

## 🆘 Support

For issues or questions:
1. Check the API endpoints documentation above
2. Review the code comments
3. Check MongoDB connection and environment variables
4. Review server logs for errors

---

**Built with ❤️ using MERN Stack**
