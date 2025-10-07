import { MongoClient } from 'mongodb';

let db = null;
let client = null;

export async function connectDB() {
    if (db) return db;

    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sliding';
        client = new MongoClient(uri);
        await client.connect();
        db = client.db('FinalProj'); // Specify the FinalProj database
        console.log('Connected to MongoDB - FinalProj database');
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

export function getCollection(name) {
    if (!db) throw new Error('Database not connected');
    return db.collection(name);
}

export async function closeDB() {
    if (client) {
        await client.close();
        db = null;
        client = null;
    }
}