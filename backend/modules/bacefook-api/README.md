# Bacefook API

A NestJS-based REST API for a social media platform built with PostgreSQL and Prisma ORM.

## 🚀 Features

- **NestJS Framework**: Modern, scalable Node.js framework
- **PostgreSQL Database**: Robust relational database
- **Prisma ORM**: Type-safe database client
- **Validation**: Request validation with class-validator
- **Docker Support**: Containerized deployment
- **RESTful API**: Clean, RESTful endpoints

## 📋 Prerequisites

- Node.js 18+
- Yarn package manager
- PostgreSQL database
- Docker (optional)

## 🛠️ Installation

1. **Install dependencies:**

   ```bash
   yarn install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your database configuration
   ```

3. **Generate Prisma client:**

   ```bash
   npx prisma generate
   ```

4. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

## 🏃‍♂️ Running the Application

### Development

```bash
# Start in development mode
yarn start:dev

# Start in debug mode
yarn start:debug
```

### Production

```bash
# Build the application
yarn build

# Start in production mode
yarn start:prod
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📚 API Endpoints

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Example Request

```bash
# Create a new user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Software developer"
  }'
```

## 🗄️ Database Schema

The application includes the following models:

- **User**: User profiles with authentication
- **Post**: User posts and content
- **Comment**: Comments on posts
- **Like**: Post likes
- **Follow**: User following relationships

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## 📦 Project Structure

```
src/
├── prisma/           # Prisma configuration and service
├── users/            # Users module
│   ├── dto/         # Data Transfer Objects
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts
```

## 🔧 Configuration

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Application port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### Database Configuration

The application uses Prisma with PostgreSQL. Configure your database connection in the `.env` file:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

## 🚀 Deployment

### Docker Deployment

1. Build the Docker image:

   ```bash
   docker build -t bacefook-api .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 bacefook-api
   ```

### Production Considerations

- Use environment variables for sensitive data
- Set up proper logging
- Configure CORS for your domain
- Set up health checks
- Use a reverse proxy (nginx)
- Configure SSL/TLS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
