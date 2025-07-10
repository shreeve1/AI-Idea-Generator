# Docker Deployment Guide for AI Idea Generator Application

This guide explains how to deploy the AI Idea Generator application using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-idea-generator
   ```

2. **Setup environment variables**
   ```bash
   cp docker.env.template .env
   # Edit .env with your actual values
   ```

3. **Build and run the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Open your browser and go to `http://localhost:3025`
   - The application serves both the API and the React frontend

## Environment Configuration

### Required Environment Variables

Copy `docker.env.template` to `.env` and configure the following:

#### Database (Supabase)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

#### Authentication
- `JWT_SECRET`: A long, random string for JWT token signing

#### AI Service
- `OPENAI_API_KEY`: Your OpenAI API key for idea generation

#### Email Service (Optional)
- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password
- `FROM_EMAIL`: Email address for sending emails

## Docker Commands

### Production Deployment

```bash
# Build and start the application
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Development Mode

```bash
# Run in development mode with hot reload
docker-compose --profile dev up --build

# Or run development service only
docker-compose run --service-ports app-dev
```

### Individual Commands

```bash
# Build the Docker image
docker build -t ai-idea-generator .

# Run the container
docker run -p 3025:3025 --env-file .env ai-idea-generator

# Run with custom port
docker run -p 8080:3025 --env-file .env ai-idea-generator
```

## Architecture

The Docker setup uses a multi-stage build process:

1. **Frontend Builder**: Builds the React application using Vite
2. **Backend Builder**: Installs Node.js dependencies for the API
3. **Production Image**: Combines the built frontend with the backend in a minimal Alpine Linux image

### Key Features

- **Multi-stage build**: Optimizes image size by separating build and runtime environments
- **Non-root user**: Runs the application as a non-privileged user for security
- **Health checks**: Monitors application health and restarts if needed
- **Signal handling**: Properly handles shutdown signals using dumb-init
- **Static file serving**: Serves the React build files directly from the Node.js server

## Networking

- **Port 3025**: Main application port (API + Frontend)
- **Internal networking**: Services communicate through Docker's internal network

## Volumes and Data

The application is stateless and doesn't require persistent volumes. All data is stored in Supabase.

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change the port mapping in docker-compose.yml
   ports:
     - "8080:3025"  # Use port 8080 instead of 3025
   ```

2. **Environment variables not loaded**
   ```bash
   # Ensure .env file exists and has correct values
   cat .env
   
   # Restart the containers
   docker-compose down && docker-compose up --build
   ```

3. **Database connection issues**
   ```bash
   # Check Supabase credentials
   docker-compose exec app node -e "console.log(process.env.SUPABASE_URL)"
   
   # Test database connection
   curl http://localhost:3025/api/db-test
   ```

4. **Build failures**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

### Debugging

```bash
# View application logs
docker-compose logs -f app

# Access container shell
docker-compose exec app sh

# Check environment variables
docker-compose exec app printenv

# Test health endpoint
curl http://localhost:3025/api/health
```

### Performance Optimization

1. **Use .dockerignore**: Excludes unnecessary files from build context
2. **Multi-stage builds**: Reduces final image size
3. **Layer caching**: Optimizes rebuild times
4. **Alpine Linux**: Uses minimal base image

## Security Considerations

- Application runs as non-root user
- Secrets are passed via environment variables
- Network isolation through Docker networks
- Health checks for monitoring

## Monitoring

The application includes health checks:
- **Endpoint**: `GET /api/health`
- **Interval**: Every 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts

## Scaling

For production scaling, consider:
- Using Docker Swarm or Kubernetes
- Load balancing multiple instances
- Implementing proper logging and monitoring
- Using secrets management for sensitive data

## Updating

To update the application:
```bash
# Pull latest changes
git pull origin master

# Rebuild and restart
docker-compose down && docker-compose up --build -d
```

## Support

For issues and questions:
1. Check the application logs
2. Verify environment variables
3. Test API endpoints directly
4. Check Docker and Docker Compose versions 