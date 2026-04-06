# Mental Health Support Platform

A production-ready multi-tenant Mental Health Support Platform built with the MERN stack. This platform provides mental health resources, community support, AI-powered chatbot assistance, and counseling booking services for multiple colleges.

## 🚀 Features

### Core Features
- **Multi-Tenant Architecture**: College-based data isolation
- **Role-Based Access Control**: Student, Counselor, and Admin roles
- **Authentication**: JWT-based secure authentication
- **Mental Health Screenings**: Validated PHQ-9 and GAD-7 assessments 
- **Resources Library**: Audio, video, and article resources
- **Community Forum**: Anonymous posting and commenting
- **AI Chatbot**: OpenAI-powered mental health support with risk detection
- **Counseling Booking**: Schedule and manage counseling sessions
- **Admin Dashboard**: Manage users, resources, and flagged content
- **Stability & Polish**: React Error Boundaries, Disclaimer Consent Modals, Mobile-responsive UI 

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

6. **Seed the database**:
```bash
node seed.js
```
*Note: This single script creates the default college, default admin user, generates the clinical questionnaires, and seeds 35 expertly curated mental health resources tagged for the AI hub.*

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

The database is automatically provisioned and securely populated when you run `node seed.js`. This creates:
- A default college (code: DEFAULT)
- A default admin user (email: admin@default.com, password: admin123)
- GAD-7 and PHQ-9 Mental Health Questionnaires
- 35 Highly Curated clinical articles, videos, and crisis lines tagged for AI integration.

**No manual database editing required!**

### First-User Auto Admin Logic

If you do not run the seed script, the first user to register will automatically become an admin. However, failing to run the seed script means you will not have any clinical resources or assessments available. It is highly recommended to run `node seed.js`.

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
│   │   ├── assessmentController.js
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
│   │   ├── Questionnaire.js
│   │   ├── Report.js
│   │   ├── Resource.js
│   │   ├── User.js
│   │   └── UserResult.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── assessments.js
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
│   │   │   ├── DisclaimerModal.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── Assessment.jsx
│   │   │   ├── AssessmentHome.jsx
│   │   │   ├── Bookings.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── Community.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Resources.jsx
│   │   │   └── ResultsHistory.jsx
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

### Assessments
- `GET /api/assessments/results` - Get user's assessment history
- `POST /api/assessments/results` - Save a new assessment result
- `GET /api/assessments/:type` - Get questionnaire by type (phq9, gad7)

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
2. Take mental health screenings (PHQ-9 or GAD-7) to track your wellbeing
3. Browse resources in the Resources section
4. Participate in the Community forum (optionally anonymous)
5. Use the AI Chatbot for instant support
6. Book counseling sessions with available counselors

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
   node seed.js
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

## ✅ Phase 6 Completed: Smart Resource Hub & UI Overhaul
- **AI-Driven Recommendations**: Dynamically generates personalized resource tips via OpenAI based on the user's latest PHQ-9/GAD-7 assessment severities.
- **Smart Tag Ranking**: Automatically bumps priority resources (e.g. Anxiety/Crisis tags for high GAD-7 scores) to the top of the library grid.
- **Unified Glassmorphic UI**: The entire Assessment pipeline and Smart Resource Hub now feature a stunning, Tailwind-powered frosted glass aesthetic with vibrant gradients, micro-animations, and seamless responsiveness.
- **Refactoring to ES Modules**: Entire backend controllers, models, routes, and `seed.js` script successfully migrated to pure ES modules using modern middleware architecture.

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
