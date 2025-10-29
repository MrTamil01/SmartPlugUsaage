# Smart Plug Backend

Express.js backend for Smart Plug Usage Management System with MongoDB.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your MongoDB URI and JWT secret.

4. Start MongoDB (if running locally).

5. Run the server:
   ```bash
   npm run dev  # for development with nodemon
   npm start    # for production
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

## Environment Variables

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
