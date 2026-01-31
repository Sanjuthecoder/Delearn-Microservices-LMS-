# DLMS Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the DLMS (Decentralized Learning Management System) to production.

## Prerequisites

### Required Services
1. **Eureka Server** - Service Discovery
2. **API Gateway** - Routes all requests
3. **Auth Service** - User authentication  
4. **Course Service** - Course management
5. **Media Service** - Media storage and streaming
6. **Enrollment Service** - Student enrollments
7. **ChatBot Service** - AI assistant
8. **Frontend** - React application

### External Dependencies
- **TiDB/MySQL Database** - Must be accessible from production servers
- **MongoDB** - Must be accessible from production servers  
- **Pinata (IPFS)** - For decentralized storage
- **Hugging Face API** - For chatbot AI model

## Environment Variables

### Frontend (React)
Create `.env` file in `DLMSFrontend/`:
```bash
REACT_APP_API_GATEWAY_URL=https://your-backend-domain.com
```

### API Gateway
Set these environment variables before starting:
```bash
EUREKA_SERVER_URL=http://eureka-server:8761/eureka/
AUTH_SERVICE_URL=http://auth-service:2000
ENROLLMENT_SERVICE_URL=http://enrollment-service:8082
COURSE_SERVICE_URL=http://course-service:8081
MEDIA_SERVICE_URL=http://media-service:8085
CHATBOT_SERVICE_URL=http://chatbot-service:8000
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### All Java Microservices
Set this variable for Auth, Course, Media, and Enrollment services:
```bash
EUREKA_SERVER_URL=http://eureka-server:8761/eureka/
```

### ChatBot Service (FastAPI)
Create `.env` file in `fast-api/`:
```bash
HF_TOKEN=your_actual_huggingface_token
EUREKA_SERVER_URL=http://eureka-server:8761/eureka
API_GATEWAY_URL=http://gateway:8080
```

### Database Configurations
These should already be set in your environment:
```bash
# TiDB/MySQL (for Auth and Enrollment services)
TIDB_URL=jdbc:mysql://your-tidb-host:4000/dlms?sslMode=VERIFY_IDENTITY
TIDB_USER=your_username
TIDB_PASSWORD=your_password

# MongoDB (for Course and Media services)
COURSE_MONGODB_URI=mongodb+srv://user:pass@cluster/course_db
MEDIA_MONGODB_URI=mongodb+srv://user:pass@cluster/media_db

# Pinata (for Media service)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
```

## Startup Order

**IMPORTANT**: Services must be started in this order to ensure proper registration with Eureka.

1. **Eureka Server** (port 8761)
   ```bash
   cd EurekaServer
   mvn spring-boot:run
   ```

2. **Wait 30 seconds** for Eureka to fully initialize

3. **Backend Microservices** (can start in parallel):
   ```bash
   # Auth Service (port 2000)
   cd AuthService
   mvn spring-boot:run
   
   # Course Service (port 8081)
   cd course-service
   mvn spring-boot:run
   
   # Media Service (port 8085)
   cd MediaService
   mvn spring-boot:run
   
   # Enrollment Service (port 8082)
   cd enrollment-service
   mvn spring-boot:run
   
   # ChatBot Service (port 8000)
   cd fast-api
   python main.py
   ```

4. **Wait 15 seconds** for all services to register

5. **API Gateway** (port 8080)
   ```bash
   cd Gateway
   mvn spring-boot:run
   ```

6. **Frontend** (port 3000 for dev, build for production)
   ```bash
   cd DLMSFrontend
   
   # Development:
   npm start
   
   # Production build:
   npm run build
   # Then serve the build folder with nginx or similar
   ```

## Production Deployment Options

### Option 1: Docker Containers (Recommended)
Create Dockerfiles for each service and use Docker Compose to orchestrate.

### Option 2: Cloud Platform (Vercel, Netlify, etc.)
- **Frontend**: Deploy to Vercel/Netlify
- **Backend Services**: Deploy to Railway, Render, or AWS

### Option 3: Traditional VPS
Deploy all services on a VPS with proper process management (systemd, PM2, etc.)

## CORS Configuration

Ensure your CORS_ALLOWED_ORIGINS includes your production frontend URL:
```bash
# For multiple origins, separate with commas
CORS_ALLOWED_ORIGINS=https://dlms.com,https://www.dlms.com
```

## Database Accessibility

Verify your databases are accessible from production:
```bash
# Test TiDB connection
mysql -h your-tidb-host -P 4000 -u username -p

# Test MongoDB connection
mongo "mongodb+srv://your-cluster-url"
```

## Security Checklist

- [ ] All `.env` files are in `.gitignore`
- [ ] No hardcoded passwords or tokens in source code
- [ ] Database credentials use environment variables
- [ ] HTTPS enabled for production (use Let's Encrypt)
- [ ] CORS properly configured for production domain
- [ ] Firewall rules configured (only necessary ports open)

## Feature Verification

After deployment, test these critical features:

1. **Authentication**
   - Student login
   - Admin/Instructor login
   - JWT token generation and validation

2. **Course Management**
   - Browse courses
   - View course details
   - Enroll in courses

3. **Media Operations**
   - Upload videos (Instructor)
   - Download media files
   - Stream videos in course player

4. **Chatbot**
   - Open chatbot interface
   - Ask questions about courses
   - Verify real-time course data integration

5. **Progress Tracking**
   - Mark lessons complete
   - View progress percentage
   - Complete course achievement

## Troubleshooting

### Services can't find Eureka
- Verify EUREKA_SERVER_URL is correct
- Check Eureka Server is running and accessible
- Check firewall rules

### CORS Errors
- Verify CORS_ALLOWED_ORIGINS matches your frontend URL
- Include protocol (https://) in the URL
- Check browser console for exact origin being blocked

### Database Connection Failures  
- Verify connection strings are correct
- Check network connectivity from server to database
- Verify credentials are correct

### Media Upload/Download Issues
- Verify Pinata API keys are valid
- Check file size limits (max 500MB configured)
- Test Pinata connectivity from server

## Monitoring

Monitor these endpoints for health:
- Eureka Dashboard: `http://your-server:8761`
- ChatBot Health: `http://your-server:8000/health`
- Gateway Routes: Check Eureka for registered services

## Support

For issues during deployment, check:
1. Service logs for error messages
2. Eureka dashboard for service registration status
3. Environment variables are correctly set
4. Database connectivity from production server
