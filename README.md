# FitFlow - Your Ultimate Fitness Platform

## 📋 Project Overview
FitFlow is a full-stack web application for fitness tracking, training, and nutrition management built with React and Node.js.

## 🛠️ Tech Stack

### Frontend (Client)
- **React** 18.2.0
- **Vite** 5.0.0 (Build tool)
- **React Router DOM** 6.20.0 (Navigation)
- **Axios** (HTTP requests)

### Backend (Server)
- **Node.js** with **Express** 4.21.2
- **MongoDB** with **Mongoose** 7.8.7 (Database)
- **bcryptjs** 2.4.3 (Password hashing)
- **JWT** (Authentication - jsonwebtoken 9.0.2)
- **CORS** 2.8.5 (Cross-origin requests)

### Database
- **MongoDB Atlas** (Cloud database)

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd fitflow
```

### 2. Install Dependencies

#### Root Level
```bash
npm install concurrently --save-dev
```

#### Client Setup
```bash
cd client
npm install vite @vitejs/plugin-react react react-dom react-router-dom axios
npm install --save-dev @types/react @types/react-dom
```

#### Server Setup
```bash
cd ../server
npm install express mongoose bcryptjs jsonwebtoken cors helmet express-rate-limit dotenv joi multer cloudinary
npm install --save-dev nodemon
```

### 3. Environment Configuration

#### Create `server/.env`
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitflow?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
```

#### Replace in MONGODB_URI:
- `username` → Your MongoDB Atlas username
- `password` → Your MongoDB Atlas password
- `cluster` → Your actual cluster name

### 4. MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new project: **FitFlow**
3. Create cluster: **fitflow-cluster**
4. Setup Database Access:
   - Username: `fitflow-admin`
   - Strong password
5. Setup Network Access:
   - Add IP: `0.0.0.0/0` (for development)
6. Get connection string from **Connect → Drivers**

---

## 🏃‍♂️ Running the Application

### Development Mode

#### Option 1: Run Both (Recommended)
```bash
# From root directory
npm run dev
```

#### Option 2: Run Separately
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client  
cd client
npm run dev
```

### Production Mode
```bash
# Build client
cd client
npm run build

# Start server
cd ../server
npm start
```

---

## 📁 Project Structure

```
fitflow/
├── client/                     # Frontend (React + Vite)
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── Auth/
│   │   │       ├── Login.jsx
│   │   │       └── Register.jsx
│   │   ├── styles/
│   │   │   └── components/
│   │   │       ├── Home.css
│   │   │       └── Register.css
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend (Node.js + Express)
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
│   ├── utils/
│   ├── .env
│   ├── server.js
│   └── package.json
├── shared/
│   └── constants.js
├── .gitignore
├── README.md
└── package.json                # Root package.json (scripts)
```

---

## 🔧 Package Scripts

### Root Level
```bash
npm run dev          # Run both client and server
npm run client:dev   # Run only client
npm run server:dev   # Run only server
npm run install:all  # Install all dependencies
```

### Client
```bash
npm run dev          # Development server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Server
```bash
npm run dev          # Development with nodemon
npm start            # Production server
```

---

## ✨ Current Features

### Authentication System
- ✅ User registration with validation
- ✅ Password encryption (bcrypt)
- ✅ Email uniqueness check
- ✅ Form validation (client & server)
- ✅ Custom alert system
- ✅ Responsive design

### Database Models
- ✅ User model with MongoDB schema
- ✅ Automatic timestamps
- ✅ Data validation

### Frontend
- ✅ Modern React with hooks
- ✅ React Router navigation
- ✅ Responsive design with glassmorphism
- ✅ Form state management
- ✅ Custom CSS animations

---

## 🎯 Upcoming Features

- [ ] User login system
- [ ] JWT authentication middleware
- [ ] Dashboard with user stats
- [ ] Workout tracking
- [ ] Nutrition logging
- [ ] Progress photos
- [ ] Goal setting
- [ ] AI fitness coach integration

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (coming soon)

### User Management
- `GET /api/users/profile` - Get user profile (coming soon)
- `PUT /api/users/profile` - Update profile (coming soon)

---

## 🔒 Security Features

- Password hashing with bcrypt (salt rounds: 12)
- Input validation and sanitization
- CORS protection
- Rate limiting
- Environment variables for sensitive data
- MongoDB injection prevention

---

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 Development Notes

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Database Schema
```javascript
User {
  _id: ObjectId (auto-generated)
  name: String (required, trimmed)
  email: String (required, unique, lowercase)
  password: String (required, hashed)
  createdAt: Date (auto-generated)
}
```

---

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MONGODB_URI in .env
   - Verify Atlas Network Access settings
   - Ensure correct username/password

2. **CORS Errors**
   - Verify server CORS configuration
   - Check client/server ports

3. **React Double Alerts**
   - Remove React.StrictMode for development
   - Or implement alert deduplication

---

## 📞 Support

For support and questions, please open an issue in the repository.

---

## 📄 License

This project is licensed under the ISC License.
