import express from 'express';
import ViteExpress from 'vite-express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { connectDB, getCollection } from './database.js';
import { ObjectId } from 'mongodb';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware (no CORS needed since same origin)
app.use(express.json());

// Database collections
let usersCollection;

// JWT middleware for authentication
async function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'missing auth' });
    const parts = auth.split(' ');
    if (parts.length !== 2) return res.status(401).json({ error: 'bad auth' });
    const token = parts[1];
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
        req.user = data;
        next();
    } catch (err) {
        res.status(401).json({ error: 'invalid token' });
    }
}

// Initialize database and start server
async function startServer() {
    try {
        const db = await connectDB();
        usersCollection = getCollection("users");

        // Set up routes after database connection
        setupRoutes();

        // Configure ViteExpress for production
        if (process.env.NODE_ENV === 'production') {
            // In production, serve built files
            ViteExpress.config({ mode: 'production' });
        }

        ViteExpress.listen(app, port, () => {
            console.log(`Server running at port:${port}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
    }
}

function setupRoutes() {
    // Auth Routes
    app.post('/api/auth/register', async (req, res) => {
        console.log('Registration request received:', req.body);
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'missing fields' });

        try {
            const existing = await usersCollection.findOne({ username });
            if (existing) return res.status(400).json({ error: 'user exists' });

            const passwordHash = await bcrypt.hash(password, 10);
            const user = {
                username,
                passwordHash,
                puzzlesSolved: 0,
                createdAt: new Date()
            };

            const result = await usersCollection.insertOne(user);
            const token = jwt.sign({ id: result.insertedId, username }, process.env.JWT_SECRET || 'dev-secret');
            res.json({ token, user: { id: result.insertedId, username } });
        } catch (err) {
            console.error('Registration error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/auth/login', async (req, res) => {
        console.log('Login request received:', req.body);
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'missing fields' });

        try {
            const user = await usersCollection.findOne({ username });
            if (!user || !user.passwordHash) return res.status(400).json({ error: 'invalid credentials' });

            const ok = await bcrypt.compare(password, user.passwordHash);
            if (!ok) return res.status(400).json({ error: 'invalid credentials' });

            const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'dev-secret');
            res.json({ token, user: { id: user._id, username: user.username, puzzlesSolved: user.puzzlesSolved } });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // Progress Routes
    app.get('/api/progress', authMiddleware, async (req, res) => {
        try {
            const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });
            if (!user) return res.status(404).json({ error: 'user not found' });

            res.json({
                user: {
                    id: user._id,
                    username: user.username,
                    puzzlesSolved: user.puzzlesSolved || 0
                }
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/progress/solved', authMiddleware, async (req, res) => {
        try {
            const result = await usersCollection.updateOne(
                { _id: new ObjectId(req.user.id) },
                { $inc: { puzzlesSolved: 1 } }
            );

            const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });
            res.json({ puzzlesSolved: user.puzzlesSolved });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // API status route (moved to /api/status to avoid conflicts with frontend)
    app.get('/api/status', (req, res) => res.json({ ok: true, message: 'Sliding Puzzle API' }));
}

startServer();
