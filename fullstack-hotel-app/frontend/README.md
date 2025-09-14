# Hotel Booking Frontend

A modern React TypeScript frontend for the Hotel Booking System.

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add frontend for deployment"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Select the `fullstack-hotel-app/frontend` folder as the root directory
   - Add environment variable: `VITE_API_URL` with your backend URL
   - Deploy!

### Environment Variables

Set these in your Vercel dashboard:

```
VITE_API_URL=https://your-backend-api.com
```

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API service functions
└── types/          # TypeScript type definitions
```

## 🔧 Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling

## 📦 Build Output

The build process generates:
- Optimized static files in `dist/`
- TypeScript type checking
- CSS optimization
- Asset bundling and compression

## 🌐 API Integration

The frontend connects to the FastAPI backend through:
- Authentication endpoints (`/auth/login`, `/auth/register`)
- Booking management (`/bookings`)
- Admin functions (`/admin/*`)
- Room data (`/rooms`)

## 🔐 Features

- **Authentication**: Login/Register with JWT tokens
- **User Dashboard**: Book rooms, view bookings
- **Admin Dashboard**: Manage all bookings, analytics, predictions
- **Responsive Design**: Works on all device sizes
- **Real-time Updates**: Automatic data refresh
- **Type Safety**: Full TypeScript coverage
