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
let gamesCollection;
let leaderboardCollection;

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
        gamesCollection = getCollection("games");
        leaderboardCollection = getCollection("leaderboard");

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
                totalMoves: 0,
                bestMoves: null,
                averageMoves: 0,
                createdAt: new Date()
            };

            const result = await usersCollection.insertOne(user);
            const token = jwt.sign({ id: result.insertedId, username }, process.env.JWT_SECRET || 'dev-secret');
            res.json({ token, user: { 
                id: result.insertedId, 
                username, 
                puzzlesSolved: 0,
                totalMoves: 0,
                bestMoves: null,
                averageMoves: 0
            } });
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
            res.json({ token, user: { 
                id: user._id, 
                username: user.username, 
                puzzlesSolved: user.puzzlesSolved || 0,
                totalMoves: user.totalMoves || 0,
                bestMoves: user.bestMoves,
                averageMoves: user.averageMoves || 0
            } });
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
                    puzzlesSolved: user.puzzlesSolved || 0,
                    totalMoves: user.totalMoves || 0,
                    bestMoves: user.bestMoves,
                    averageMoves: user.averageMoves || 0
                }
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/progress/solved', authMiddleware, async (req, res) => {
        try {
            const { moves, timeSpent } = req.body;
            const userId = new ObjectId(req.user.id);
            
            if (!moves || moves < 0) {
                return res.status(400).json({ error: 'Invalid moves count' });
            }

            // Save the game record
            const gameRecord = {
                userId,
                username: req.user.username,
                moves,
                timeSpent: timeSpent || null,
                completedAt: new Date()
            };
            await gamesCollection.insertOne(gameRecord);

            // Update user statistics
            const user = await usersCollection.findOne({ _id: userId });
            const newPuzzlesSolved = (user.puzzlesSolved || 0) + 1;
            const newTotalMoves = (user.totalMoves || 0) + moves;
            const newBestMoves = user.bestMoves ? Math.min(user.bestMoves, moves) : moves;
            const newAverageMoves = Math.round(newTotalMoves / newPuzzlesSolved);

            await usersCollection.updateOne(
                { _id: userId },
                { 
                    $set: {
                        puzzlesSolved: newPuzzlesSolved,
                        totalMoves: newTotalMoves,
                        bestMoves: newBestMoves,
                        averageMoves: newAverageMoves,
                        lastPlayed: new Date()
                    }
                }
            );

            // Update or create leaderboard entry
            await leaderboardCollection.updateOne(
                { userId },
                {
                    $set: {
                        username: req.user.username,
                        puzzlesSolved: newPuzzlesSolved,
                        bestMoves: newBestMoves,
                        averageMoves: newAverageMoves,
                        totalMoves: newTotalMoves,
                        lastPlayed: new Date()
                    }
                },
                { upsert: true }
            );

            res.json({ 
                puzzlesSolved: newPuzzlesSolved,
                totalMoves: newTotalMoves,
                bestMoves: newBestMoves,
                averageMoves: newAverageMoves
            });
        } catch (err) {
            console.error('Error updating progress:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // Leaderboard Routes
    app.get('/api/leaderboard', async (req, res) => {
        try {
            const { sortBy = 'puzzlesSolved', order = 'desc', limit = 50 } = req.query;
            
            const sortOrder = order === 'asc' ? 1 : -1;
            const sortField = ['puzzlesSolved', 'bestMoves', 'averageMoves'].includes(sortBy) ? sortBy : 'puzzlesSolved';
            
            // For bestMoves, we want ascending order by default (lower is better)
            const finalSortOrder = sortField === 'bestMoves' && order === 'desc' ? 1 : sortOrder;
            
            const leaderboard = await leaderboardCollection
                .find({})
                .sort({ [sortField]: finalSortOrder })
                .limit(parseInt(limit))
                .toArray();

            res.json(leaderboard);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/leaderboard/user/:username', async (req, res) => {
        try {
            const { username } = req.params;
            const userStats = await leaderboardCollection.findOne({ username });
            
            if (!userStats) {
                return res.status(404).json({ error: 'User not found in leaderboard' });
            }

            // Get user's rank in different categories
            const puzzlesRank = await leaderboardCollection.countDocuments({
                puzzlesSolved: { $gt: userStats.puzzlesSolved }
            }) + 1;

            const bestMovesRank = await leaderboardCollection.countDocuments({
                bestMoves: { $lt: userStats.bestMoves },
                bestMoves: { $ne: null }
            }) + 1;

            const avgMovesRank = await leaderboardCollection.countDocuments({
                averageMoves: { $lt: userStats.averageMoves },
                averageMoves: { $gt: 0 }
            }) + 1;

            res.json({
                ...userStats,
                ranks: {
                    puzzlesSolved: puzzlesRank,
                    bestMoves: bestMovesRank,
                    averageMoves: avgMovesRank
                }
            });
        } catch (err) {
            console.error('Error fetching user leaderboard stats:', err);
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/games/recent', authMiddleware, async (req, res) => {
        try {
            const { limit = 10 } = req.query;
            const games = await gamesCollection
                .find({ userId: new ObjectId(req.user.id) })
                .sort({ completedAt: -1 })
                .limit(parseInt(limit))
                .toArray();

            res.json(games);
        } catch (err) {
            console.error('Error fetching recent games:', err);
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/stats/global', async (req, res) => {
        try {
            const totalPlayers = await usersCollection.countDocuments({});
            const totalGames = await gamesCollection.countDocuments({});
            
            const avgStats = await gamesCollection.aggregate([
                {
                    $group: {
                        _id: null,
                        avgMoves: { $avg: '$moves' },
                        minMoves: { $min: '$moves' },
                        maxMoves: { $max: '$moves' }
                    }
                }
            ]).toArray();

            const topPlayer = await leaderboardCollection
                .findOne({}, { sort: { puzzlesSolved: -1 } });

            res.json({
                totalPlayers,
                totalGames,
                globalStats: avgStats[0] || { avgMoves: 0, minMoves: 0, maxMoves: 0 },
                topPlayer: topPlayer ? {
                    username: topPlayer.username,
                    puzzlesSolved: topPlayer.puzzlesSolved
                } : null
            });
        } catch (err) {
            console.error('Error fetching global stats:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // API status route (moved to /api/status to avoid conflicts with frontend)
    app.get('/api/status', (req, res) => res.json({ ok: true, message: 'Sliding Puzzle API' }));
}

startServer();
