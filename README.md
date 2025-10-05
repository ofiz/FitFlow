# FitFlow - Comprehensive Fitness Tracking Application

A full-stack fitness tracking platform that helps users monitor their nutrition, workouts, progress photos, and fitness goals with advanced analytics and an AI-powered coach.

## Features

### Core Features
- **Dashboard Overview** - Real-time fitness summary with key metrics
- **Workout Tracking** - Log exercises, duration, difficulty, and track workout history
- **Nutrition Tracker** - Track daily meals, calories, and macronutrient breakdown (protein, carbs, fats)
- **Progress Gallery** - Upload and visualize transformation photos over time
- **Goals Management** - Set and track fitness milestones with progress bars
- **Analytics & Stats** - Comprehensive charts and insights (workout frequency, calorie intake, macros breakdown, duration trends)
- **BMR/TDEE Calculator** - Calculate daily calorie needs based on personal metrics
- **Nutrition Trivia** - Test your nutrition knowledge with an interactive quiz game
- **AI Fitness Coach** - Get personalized fitness and nutrition advice 24/7
- **Profile Management** - Update personal information, fitness goals, and change password

### Technical Features
- JWT-based authentication with secure password handling
- Responsive design optimized for mobile and desktop
- RESTful API architecture
- Comprehensive test coverage (90 tests)
- Docker containerization for easy deployment
- Date filtering (Today/Week/Month/Year) across all tracking features

## Tech Stack

### Frontend
- **React** 18 with Vite
- **Recharts** for data visualization
- **Lucide React** for icons
- **CSS3** with modern glassmorphism design
- **Nginx** for production serving

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Mistral AI** for AI Coach feature
- **Jest** & Supertest for testing
- **Multer** for file uploads

### DevOps
- **Docker** & Docker Compose
- **Nginx** reverse proxy
- Multi-stage builds for optimization

## Project Structure

```
FitFlow/
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Reusable components 
│   │   │   ├── modals/          # Add/Edit modals 
│   │   │   └── tabs/            # Main feature tabs 
│   │   ├── pages/
│   │   │   ├── Auth/            # Login & Register
│   │   │   ├── Dashboard.jsx
│   │   │   └── Home.jsx
│   │   ├── styles/              # CSS files
│   │   └── utils/               # API calls
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── server/                      # Backend Node.js application
│   ├── config/                  # Database configuration
│   ├── controllers/             # Business logic 
│   │   ├── aiCoachController.js
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── calculatorController.js
│   │   ├── dashboardController.js
│   │   ├── goalController.js
│   │   ├── nutritionController.js
│   │   ├── progressController.js
│   │   ├── triviaController.js
│   │   ├── userController.js
│   │   └── workoutController.js
│   ├── middleware/              # Auth, error handling, validation
│   ├── models/                  # Mongoose schemas 
│   │   ├── Calculator.js
│   │   ├── Goal.js
│   │   ├── Meal.js
│   │   ├── Progress.js
│   │   ├── TriviaQuestion.js
│   │   ├── TriviaScore.js
│   │   ├── User.js
│   │   └── Workout.js
│   ├── routes/                  # API endpoints 
│   ├── tests/                   # Jest test suites 
│   │   └── api/
│   │       ├── aiCoach.test.js
│   │       ├── analytics.test.js
│   │       ├── auth.test.js
│   │       ├── calculator.test.js
│   │       ├── dashboard.test.js
│   │       ├── goals.test.js
│   │       ├── nutrition.test.js
│   │       ├── progress.test.js
│   │       ├── trivia.test.js
│   │       ├── user.test.js
│   │       └── workouts.test.js
│   ├── uploads/                 # User uploaded files
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
├── docker-compose.yml
└── README.md
```

## Prerequisites

- **Node.js** 18+ 
- **Docker** & Docker Compose
- **MongoDB Atlas** account (or local MongoDB)
- **Mistral AI API Key** for AI Coach feature

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/fitflow.git
cd fitflow
```

### 2. Environment Variables

Create a `.env` file in the `server/` directory:

```env
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitflow?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here-minimum-32-characters-long
JWT_EXPIRE=30d
PORT=5000
MISTRAL_API_KEY=your-mistral-api-key-here
```

**Replace:**
- `username:password` with your MongoDB Atlas credentials
- `your-secret-key-here` with a strong random string (32+ characters)
- `your-mistral-api-key-here` with your Mistral AI API key (see below)

### 3. Run with Docker (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- **Frontend:** http://localhost
- **Backend API:** http://localhost:5000

### 4. Getting Mistral AI API Key

The AI Coach feature requires a Mistral AI API key:

1. **Sign up** at [Mistral AI Console](https://console.mistral.ai/)
2. Navigate to **API Keys** in the sidebar
3. Click **"Create new key"**
4. Give it a name (e.g., "FitFlow")
5. **Copy the API key immediately** (shown only once!)
6. Add it to your `.env` file as `MISTRAL_API_KEY`

**Pricing:**
- **Free Tier:** 1M tokens in first month
- **Pay-as-you-go:** After free tier expires
- **Estimates:** ~$0.25 per 1M tokens for Mistral-small

For more details, visit [Mistral AI Pricing](https://mistral.ai/technology/#pricing)

### 5. Run Locally (Without Docker)

#### Backend Setup
```bash
cd server
npm install
npm start
```

#### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Running Tests

```bash
cd server
npm install

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```

**Test Coverage:**
- 100+ comprehensive tests across all API endpoints
- Authentication, CRUD operations, analytics, calculations
- Edge cases and error handling

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/stats` - Get user statistics (BMI, weight progress)
- `PUT /api/user/change-password` - Change password

### Workouts
- `GET /api/workouts?period=week` - Get workouts (filtered by period)
- `POST /api/workouts` - Create workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Nutrition
- `GET /api/nutrition/today?period=week` - Get meals (filtered by period)
- `POST /api/nutrition/meals` - Add meal
- `PUT /api/nutrition/meals/:id` - Update meal
- `DELETE /api/nutrition/meals/:id` - Delete meal

### Goals
- `GET /api/goals?period=week` - Get goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Analytics
- `GET /api/analytics/workouts?period=week` - Workout statistics
- `GET /api/analytics/nutrition?period=week` - Nutrition statistics
- `GET /api/analytics/overview` - Dashboard overview stats

### Progress Photos
- `POST /api/progress/upload` - Upload progress photo
- `GET /api/progress/photos` - Get all photos
- `DELETE /api/progress/photos/:id` - Delete photo

### Trivia
- `GET /api/trivia/question` - Get random question
- `POST /api/trivia/answer` - Submit answer
- `GET /api/trivia/stats` - Get trivia statistics

### Calculator
- `POST /api/calculator/calculate` - Calculate BMR/TDEE
- `GET /api/calculator/history` - Get calculation history

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## User Guide

### Getting Started
1. **Register** - Create an account with name, email, and password
2. **Complete Profile** - Add weight, height, age, and fitness goals
3. **Start Tracking** - Log your first workout or meal
4. **Monitor Progress** - Upload progress photos and track your journey

### Key Features Usage

#### Dashboard
View your daily summary including:
- Workouts this week
- Calories consumed today
- Current weight & BMI
- Active streak

#### Workouts
- Click "Add Workout" to log exercises
- Set duration, difficulty, and add notes
- Filter by Today/Week/Month/Year
- Edit or delete past workouts

#### Nutrition
- Track meals by type (Breakfast, Lunch, Dinner, Snack)
- Log calories and macros (protein, carbs, fats)
- View visual breakdown of daily macros
- Filter history by date range

#### Analytics
- View 4 interactive charts:
  - Workout Frequency (bar chart)
  - Calorie Intake (line chart)
  - Macros Breakdown (stacked bars)
  - Workout Duration Trend (line chart)
- Filter by Today/Week/Month/Year
- Get actionable insights from your data

#### Goals
- Set measurable fitness goals
- Track progress with visual bars
- Update current values as you progress
- Celebrate milestones

#### Profile
- Update personal information
- Change password securely
- Set daily calorie goals
- Configure activity level

## Password Requirements

Passwords must contain:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

## Docker Configuration

### Services
- **server** - Node.js backend (port 5000)
- **client** - Nginx serving React app (port 80)

### Volumes
- `./server/uploads` - Persistent storage for uploaded photos

### Health Checks
- Server health check runs every 30 seconds
- Client depends on server health

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Write tests for new features
- Follow existing code style
- Update documentation as needed
- Ensure all tests pass before submitting PR

## Testing

Run the test suite before committing:

```bash
cd server
npm test
```

Expected output: **90 tests passing** across:
- Authentication (6 tests)
- User management (16 tests)
- Workouts (15 tests)
- Nutrition (11 tests)
- Goals (10 tests)
- Analytics (11 tests)
- Progress photos (13 tests)
- Trivia (5 tests)
- Calculator (8 tests)
- Dashboard (4 tests)

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Verify MONGODB_URI in `.env`
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for testing)
- Ensure network connectivity
- Verify username/password are correct

**Mistral AI Not Working**
- Check API key is valid and copied correctly
- Verify you have credits/tokens available
- Check console for specific error messages
- Ensure MISTRAL_API_KEY is set in `.env`

**Docker Build Fails**
- Clear Docker cache: `docker-compose build --no-cache`
- Check Docker daemon is running
- Verify Docker Compose version

**Tests Failing**
- Ensure MongoDB test database is accessible
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (18+)

**Frontend Not Loading**
- Check if server is running (port 5000)
- Verify CORS configuration
- Clear browser cache

## Author

**Lir Chen**  
[GitHub](https://github.com/lirchen) • [Email](mailto:lirhen2000@gmail.com)

**Ofir Cohen**  
[GitHub](https://github.com/ofiz) • [Email](mailto:ofircohen599@gmail.com)

## Acknowledgments

- AI Coach powered by [Mistral AI](https://mistral.ai/)
- Nutrition data from comprehensive nutritional databases
- Icons by [Lucide React](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)
- UI inspiration from modern fitness applications

---

**Built with ❤️ for the fitness community**