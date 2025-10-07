# Sliding Tile Puzzle

A 4x4 sliding tile puzzle game with user authentication and progress tracking.

## Structure
- **server**: Express + MongoDB backend with JWT authentication
- **client**: Vite + React frontend

## Features
- ✅ User registration and login with JWT tokens
- ✅ 4x4 sliding puzzle with arrow key controls  
- ✅ Progress tracking (puzzles solved count)
- ✅ MongoDB user data persistence
- ✅ Clean, responsive UI

## Run Locally

### 1) Server
```bash
cd server
cp .env.example .env  # Edit MONGO_URI and JWT_SECRET
npm install
npm run dev  # Runs on port 4000
```

### 2) Client
```bash
cd client
npm install
npm run dev  # Runs on port 3000 (or 3001 if 3000 is busy)
```

The client expects the API at `http://localhost:4000/api` by default. You can override with `VITE_API` in an `.env` file in the `client` folder.

## Environment Variables

Create `server/.env` with:
```
MONGO_URI=mongodb://localhost:27017/sliding
JWT_SECRET=your-secure-secret-here
PORT=4000
```
