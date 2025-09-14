# Hotel Booking Cancellation Prediction - Fullstack Application

A complete fullstack application for predicting hotel booking cancellations with user authentication, admin dashboard, and ML predictions.

## 🚀 Live Demo

- **Frontend**: [https://hotel-cancellations-prediction-main.vercel.app/login](https://hotel-cancellations-prediction-main.vercel.app/login)
- **Backend API**: [https://hotel-b-cancel-v3.onrender.com](https://hotel-b-cancel-v3.onrender.com)
- **Docker Image**: [https://hub.docker.com/r/ronalsy/hotel-b-cancel/tags](https://hub.docker.com/r/ronalsy/hotel-b-cancel/tags)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Testing Locally](#testing-locally)
- [Docker Setup](#docker-setup)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **User Authentication**: JWT-based login/registration system
- **Role-based Access**: Admin and User dashboards
- **ML Predictions**: Real-time hotel cancellation prediction using trained models
- **Admin Dashboard**: User management and booking analytics
- **Responsive UI**: Modern React frontend with Tailwind CSS
- **RESTful API**: FastAPI backend with comprehensive endpoints
- **Database**: SQLite for development, easily configurable for production databases

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Router** for navigation

### Backend
- **FastAPI** with Python 3.11+
- **SQLAlchemy** ORM with SQLite
- **JWT** authentication
- **Scikit-learn** for ML predictions
- **Uvicorn** ASGI server

### DevOps
- **Docker** for containerization
- **Vercel** for frontend deployment
- **Render** for backend hosting
- **Docker Hub** for image registry

## 🔧 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Docker** and Docker Compose (for containerization)
- **Git** for version control

## 🏃‍♂️ Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/rolansy/Hotel_cancellations_prediction-main.git
cd Hotel_cancellations_prediction-main/fullstack-hotel-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv hotel_env
# Windows
hotel_env\Scripts\activate
# macOS/Linux
source hotel_env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_db.py

# Start the backend server
uvicorn main:app --reload --port 8000
```

The backend will be available at: `http://localhost:8000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## 🧪 Testing Locally

### Backend Testing

1. **API Health Check**:
   ```bash
   curl http://localhost:8000/
   ```

2. **API Documentation**:
   Visit `http://localhost:8000/docs` for interactive Swagger documentation

3. **Test Authentication**:
   ```bash
   # Register a new user
   curl -X POST "http://localhost:8000/auth/register" \
   -H "Content-Type: application/json" \
   -d '{"email": "test@example.com", "password": "testpass123", "full_name": "Test User"}'
   
   # Login
   curl -X POST "http://localhost:8000/auth/login" \
   -H "Content-Type: application/json" \
   -d '{"username": "test@example.com", "password": "testpass123"}'
   ```

### Frontend Testing

1. **Access the Application**: Open `http://localhost:5173`
2. **Register/Login**: Create a new account or login
3. **Test Predictions**: Use the booking form to test ML predictions
4. **Admin Features**: Login with admin credentials to access admin dashboard

### Test Credentials

- **Admin**: 
  - Email: `admin@hotel.com`
  - Password: `admin123`

## 🐳 Docker Setup

### Building the Docker Image

```bash
# Navigate to backend directory
cd backend

# Build Docker image
docker build -t hotel-booking-backend .

# Or build with tag for Docker Hub
docker build -t ronalsy/hotel-b-cancel:v4 .
```

### Running with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Management Scripts

Use the provided scripts for easier Docker management:

**Windows**:
```bash
# Build and run
./docker-manager.bat build
./docker-manager.bat run

# Push to Docker Hub
./docker-manager.bat push
```

**Linux/macOS**:
```bash
# Make script executable
chmod +x docker-manager.sh

# Build and run
./docker-manager.sh build
./docker-manager.sh run

# Push to Docker Hub
./docker-manager.sh push
```

## 🚀 Deployment

### Frontend Deployment to Vercel

1. **Prepare for Deployment**:
   ```bash
   cd frontend
   
   # Build the project
   npm run build
   
   # Test production build locally
   npm run preview
   ```

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Set the build directory to `fullstack-hotel-app/frontend`
   - Vercel will automatically detect Vite configuration
   - Environment variables are configured in `.env.production`

3. **Manual Deployment**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

### Backend Deployment to Render

1. **Push Docker Image to Docker Hub**:
   ```bash
   # Login to Docker Hub
   docker login
   
   # Build and tag image
   docker build -t ronalsy/hotel-b-cancel:v4 .
   
   # Push to Docker Hub
   docker push ronalsy/hotel-b-cancel:v4
   ```

2. **Deploy on Render**:
   - Create a new Web Service on Render
   - Use Docker image: `ronalsy/hotel-b-cancel:v4`
   - Set environment variables as needed
   - Configure health check endpoint: `/`

### Environment Variables

**Frontend** (`.env.production`):
```env
VITE_API_URL=https://hotel-b-cancel-v3.onrender.com
```

**Backend** (`.env`):
```env
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 📁 Project Structure

```
fullstack-hotel-app/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── auth.py              # JWT authentication logic
│   ├── database.py          # Database configuration
│   ├── ml_model.py          # ML prediction logic
│   ├── schemas.py           # Pydantic models
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Docker configuration
│   ├── docker-compose.yml   # Multi-container setup
│   └── init_db.py           # Database initialization
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   └── hooks/           # Custom React hooks
│   ├── package.json         # Node.js dependencies
│   ├── vite.config.ts       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS config
│   └── vercel.json          # Vercel deployment config
└── README-Fullstack.md     # This file
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Booking Endpoints
- `POST /predict` - ML prediction for booking cancellation
- `GET /bookings` - Get user bookings (authenticated)
- `POST /bookings` - Create new booking (authenticated)

### Admin Endpoints
- `GET /admin/users` - Get all users (admin only)
- `GET /admin/bookings` - Get all bookings (admin only)
- `DELETE /admin/users/{user_id}` - Delete user (admin only)

### Health Check
- `GET /` - API health status

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure backend CORS settings include your frontend domain
   - Check that the backend is running and accessible

2. **Database Issues**:
   ```bash
   # Reset database
   cd backend
   rm hotel_bookings.db
   python init_db.py
   ```

3. **Docker Build Issues**:
   ```bash
   # Clear Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker build --no-cache -t ronalsy/hotel-b-cancel:v4 .
   ```

4. **Node.js Package Issues**:
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Environment-Specific Issues

**Development**:
- Ensure both frontend and backend are running on different ports
- Check that environment variables are properly set

**Production**:
- Verify that environment variables are set in deployment platforms
- Ensure CORS origins include production domains
- Check that the database is properly initialized

### Performance Optimization

1. **Frontend**:
   - Use `npm run build` for production builds
   - Enable compression in Vercel settings
   - Optimize images and assets

2. **Backend**:
   - Use appropriate server workers for production
   - Implement database connection pooling for high traffic
   - Add caching for ML predictions

## 📞 Support

If you encounter any issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the logs for detailed error messages
3. Ensure all prerequisites are properly installed
4. Verify environment variables are correctly set

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

**Note**: This application is designed for educational and demonstration purposes. For production use, consider implementing additional security measures, error handling, and performance optimizations.
