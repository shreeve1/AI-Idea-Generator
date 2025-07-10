# AI Idea Generator

A sophisticated AI-powered idea generator built with modern architecture portfolio design. Generate creative ideas across various categories using advanced AI technology.

## 🚀 Features

- **AI-Powered Idea Generation**: Generate creative ideas using OpenAI's GPT models
- **Category-Based Organization**: Organize ideas by different categories (Business, Technology, Creative, etc.)
- **User Authentication**: Secure user registration and login system
- **Modern Design**: Beautiful, responsive UI with modern architecture portfolio aesthetic
- **Real-time Generation**: Fast, real-time idea generation with loading states
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast development build tool
- **Zustand** - State management
- **React Router** - Client-side routing
- **Custom CSS** - Modern architecture portfolio design system

### Backend
- **Node.js & Express** - RESTful API server
- **Supabase** - PostgreSQL database and authentication
- **OpenAI API** - AI idea generation
- **JWT** - Secure authentication tokens
- **bcrypt** - Password hashing

### Infrastructure
- **Docker** - Containerization for easy deployment
- **Docker Compose** - Multi-container orchestration
- **Alpine Linux** - Lightweight production images

## 📦 Quick Start

### Prerequisites
- Node.js 20+ and npm
- Docker and Docker Compose (for containerized deployment)
- OpenAI API key
- Supabase account

### Docker Deployment

1. **Setup environment variables**
   ```bash
   cp docker.env.template .env
   # Edit .env with your configuration
   ```

2. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build -d
   ```

3. **Access the application**
   - Open your browser to `http://localhost:3001`

For detailed Docker instructions, see `DOCKER_README.md`.

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-idea-generator.git
   cd ai-idea-generator
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client && npm install && cd ..
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup Supabase database**
   - Follow the guide in `SUPABASE_SETUP.md`
   - Run the SQL migrations in `src/migrations/`

5. **Start development servers**
   ```bash
   # Start backend (runs on port 3001)
   npm run dev
   
   # Start frontend (runs on port 5173)
   cd client && npm run dev
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `OPENAI_API_KEY` | OpenAI API key for idea generation | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 3001) | No |

### Database Setup

Follow the comprehensive guide in `SUPABASE_SETUP.md` to:
- Create a Supabase project
- Configure authentication
- Run database migrations
- Set up row-level security

## 🎨 Design System

The application features a **Modern Architecture Portfolio** design system with:

- **Typography**: Helvetica Neue with wide letter spacing and uppercase emphasis
- **Color Palette**: Sophisticated dark theme with gold accents
- **Layout**: CSS Grid with geometric spacing and asymmetric layouts
- **Components**: Minimalist, clean aesthetic with smooth transitions
- **Responsive**: Mobile-first design with proper breakpoints

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/verify-email` - Email verification
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### AI Endpoints
- `POST /api/ai/generate-ideas` - Generate ideas (authenticated)
- `POST /api/ai/generate-ideas-guest` - Generate ideas (guest)
- `GET /api/ai/config` - Get AI configuration

### Utility Endpoints
- `GET /api/health` - Health check
- `GET /api/categories` - Get idea categories
- `GET /api/db-test` - Database connection test

## 🚀 Deployment

### Production Deployment with Docker

1. **Build production image**
   ```bash
   docker build -t ai-idea-generator .
   ```

2. **Deploy to cloud platform**
   - AWS ECS/EKS
   - Google Cloud Run
   - Azure Container Instances
   - DigitalOcean App Platform

3. **Set up environment variables** in your cloud platform

4. **Configure domain and SSL** for production access

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the `LICENSE` file for details.

## 🆘 Support

For issues and questions:
- Check the application logs: `docker-compose logs -f`
- Verify environment variables are set correctly
- Test API endpoints directly
- Review the `DOCKER_README.md` for troubleshooting

## 📝 Changelog

### v1.0.0 (Latest)
- Initial release with AI-powered idea generation
- Modern architecture portfolio design system
- Docker containerization
- Comprehensive authentication system
- Real-time idea generation with category support
