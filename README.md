# CareFlow EHR Backend

Electronic Health Records Management System - Backend API

## Features

- 🔐 Authentication & Authorization (JWT + Refresh Tokens)
- 👥 User & Role Management
- 🏥 Patient Management
- 📅 Appointment Scheduling
- 💊 Prescription Management
- 💉 Laboratory Orders & Results
- 📄 Medical Document Management (MinIO/S3)
- 🏥 Pharmacy Management
- 📊 Advanced Observability (Winston Logging)
- 🔍 Full API Documentation (Swagger/OpenAPI)

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **Cache**: Redis
- **Storage**: MinIO/S3
- **Testing**: Mocha, Chai, Supertest
- **Documentation**: Swagger/OpenAPI 3.1

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB
- Redis
- MinIO (optional, for production)

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/careflow-ehr-backend.git
cd careflow-ehr-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure .env file with your settings
```

### Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run coverage
```

### Docker Development Setup

### Prerequisites
- Docker and Docker Compose installed
- Ports 5000, 27017, 6379, 9000, 9001 available

### Quick Start

```bash
# Copy environment file
cp env.example .env

# Build and start all services (MongoDB, Redis, MinIO, API)
docker-compose up -d

# View logs
docker-compose logs -f

# View API logs only
docker-compose logs -f api

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Restart services
docker-compose restart

# Rebuild after code changes
docker-compose build
docker-compose up -d
```

### Services

- **API**: http://localhost:5000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **MinIO**: http://localhost:9000 (API) | http://localhost:9001 (Console)
- **Swagger Docs**: http://localhost:5000/api/docs

## API Documentation

Once the server is running, access the interactive API documentation at:

- **Swagger UI**: http://localhost:5000/api/docs
- **Health Check**: http://localhost:5000/api/v1/health

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `REDIS_HOST`: Redis host
- `JWT_ACCESS_SECRET`: JWT access token secret
- `JWT_REFRESH_SECRET`: JWT refresh token secret

## Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run E2E tests only
npm run test:e2e

# Run tests with coverage
npm run coverage
```

## Development Notes

This setup is configured for **local development only**. For production deployment, additional configuration and security measures are required.

## Project Structure

```
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middlewares/
│   │   └── Validators/
│   ├── Models/
│   ├── Repositories/
│   └── Services/
├── config/
├── routes/
├── tests/
│   ├── unit/
│   ├── e2e/
│   └── utils/
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## License

MIT

