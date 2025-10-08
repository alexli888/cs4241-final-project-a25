import React, { useState, useEffect, useCallback } from 'react';

const SlidingPuzzle = ({ onSolved }) => {
    const EMPTY_TILE = 16;
    const SIZE = 4;

    const createInitialTiles = () => Array.from({ length: 16 }, (_, i) => i + 1);

    const isSolved = (tiles) => {
        for (let i = 0; i < tiles.length - 1; i++) {
            if (tiles[i] !== i + 1) return false;
        }
        return tiles[tiles.length - 1] === EMPTY_TILE;
    };

    const shuffleTiles = () => {
        let shuffledTiles;
        do {
            shuffledTiles = createInitialTiles().sort(() => Math.random() - 0.5);
        } while (isSolved(shuffledTiles));
        return shuffledTiles;
    };
    
    const [tiles, setTiles] = useState(shuffleTiles);
    const [moves, setMoves] = useState(0);
    const [status, setStatus] = useState('Playing');

    const moveTile = useCallback((tileIndex) => {
        if (status !== 'Playing') return;

        const emptyIndex = tiles.indexOf(EMPTY_TILE);
        const tileRow = Math.floor(tileIndex / SIZE);
        const tileCol = tileIndex % SIZE;
        const emptyRow = Math.floor(emptyIndex / SIZE);
        const emptyCol = emptyIndex % SIZE;

        const isAdjacent = Math.abs(tileRow - emptyRow) + Math.abs(tileCol - emptyCol) === 1;

        if (isAdjacent) {
            const newTiles = [...tiles];
            [newTiles[tileIndex], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[tileIndex]];
            
            setTiles(newTiles);
            const newMoves = moves + 1;
            setMoves(newMoves);

            if (isSolved(newTiles)) {
                setStatus('Solved!');
                onSolved(newMoves, 0);
            }
        }
    }, [tiles, moves, status, onSolved]);

    const handleKeyDown = useCallback((e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }

        const emptyIndex = tiles.indexOf(EMPTY_TILE);
        let targetIndex = -1;
        
        switch (e.key) {
            case 'ArrowUp':
                targetIndex = emptyIndex + SIZE;
                break;
            case 'ArrowDown':
                targetIndex = emptyIndex - SIZE;
                break;
            case 'ArrowLeft':
                targetIndex = emptyIndex + 1;
                break;
            case 'ArrowRight':
                targetIndex = emptyIndex - 1;
                break;
            default:
                return;
        }

        if (targetIndex >= 0 && targetIndex < SIZE * SIZE) {
            moveTile(targetIndex);
        }
    }, [tiles, moveTile]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const handleShuffle = () => {
        setTiles(shuffleTiles());
        setMoves(0);
        setStatus('Playing');
    };

    return (
        <div className="puzzle-container">
            <div className="puzzle-info">
                <span>Moves: <strong>{moves}</strong></span>
                <span>Status: <strong>{status}</strong></span>
            </div>
            <div className="puzzle-grid">
                {tiles.map((tile, index) => (
                    <div
                        key={index}
                        className={`puzzle-tile ${tile === EMPTY_TILE ? 'empty' : ''}`}
                        onClick={() => moveTile(index)}
                    >
                        {tile === EMPTY_TILE ? '' : tile}
                    </div>
                ))}
            </div>
            <button onClick={handleShuffle} className="shuffle-button">
                Shuffle Puzzle
            </button>
        </div>
    );
};


const Leaderboard = ({ token }) => {
    const [stats, setStats] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            setTimeout(() => {
                setStats({
                    totalPlayers: 10,
                    totalGames: 12,
                    averageMoves: 129,
                    topPlayer: { name: 'li888', puzzles: 5 }
                });
                setPlayers([
                    { rank: 1, name: 'li888', solved: 5, best: 87, avg: 123, lastPlayed: '10/7/2025' },
                    { rank: 2, name: 'eric2', solved: 3, best: 144, avg: 152, lastPlayed: '10/7/2025' },
                    { rank: 3, name: 'li88868', solved: 2, best: 136, avg: 136, lastPlayed: '10/7/2025' },
                    { rank: 4, name: 'wdwadawd', solved: 1, best: 139, avg: 139, lastPlayed: '10/7/2025' },
                    { rank: 5, name: '123', solved: 1, best: 61, avg: 61, lastPlayed: '10/7/2025' },
                ]);
                setLoading(false);
            }, 500);
        };
        fetchLeaderboard();
    }, [token]);

    const getRankIcon = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    if (loading) {
        return <div>Loading Leaderboard...</div>;
    }

    return (
        <div className="leaderboard-container">
            <h3>🏆 Leaderboard</h3>
            <div className="global-stats">
                <h4>Global Statistics</h4>
                <div className="stats-grid">
                    <span>Total Players: <strong>{stats.totalPlayers}</strong></span>
                    <span>Total Games: <strong>{stats.totalGames}</strong></span>
                    <span>Average Moves: <strong>{stats.averageMoves}</strong></span>
                    <span>Top Player: <strong>{stats.topPlayer.name}</strong> ({stats.topPlayer.puzzles} puzzles)</span>
                </div>
            </div>
            <div className="leaderboard-controls">
                <span>Sort by:</span>
                <select>
                    <option>Puzzles Solved</option>
                    <option>Best Moves</option>
                    <option>Average Moves</option>
                </select>
            </div>
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Puzzles Solved</th>
                        <th>Best Moves</th>
                        <th>Avg Moves</th>
                        <th>Last Played</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map(player => (
                        <tr key={player.rank}>
                            <td>{getRankIcon(player.rank)}</td>
                            <td>{player.name}</td>
                            <td>{player.solved}</td>
                            <td>{player.best}</td>
                            <td>{player.avg}</td>
                            <td>{player.lastPlayed}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Main App Component ---
function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('game');
    const [authPage, setAuthPage] = useState('login');
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'error', duration = 4000) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), duration);
    };

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            fetch('/api/progress', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.ok ? res.json() : Promise.reject('Session invalid'))
            .then(data => setUser(data.user))
            .catch(() => {
                setToken(null);
                localStorage.removeItem('token');
            });
        }
    }, [token]);

    async function register(e) {
        e.preventDefault();
        const { username, password } = e.target.elements;
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.value, password: password.value })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            showNotification('Registration successful! Please log in.', 'success');
            setAuthPage('login');
        } catch (error) {
            showNotification(error.message);
        }
    }

    async function login(e) {
        e.preventDefault();
        const { username, password } = e.target.elements;
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.value, password: password.value })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            setToken(data.token);
        } catch (error) {
            showNotification(error.message);
        }
    }
    
    const handlePuzzleSolved = async (moves, timeSpent) => {
        try {
            await fetch('/api/progress/solved', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ moves, timeSpent })
            });
            const r = await fetch('/api/progress', { headers: { Authorization: `Bearer ${token}` } });
            const data = await r.json();
            setUser(data.user);
            showNotification(`Puzzle solved in ${moves} moves! 🎉`, 'success');
        } catch (e) { 
            showNotification('Error saving progress');
        }
    };

    const LoginPage = () => (
        <div className="auth-container">
            <form onSubmit={login} className="auth-form">
                <h3>Login</h3>
                <input name="username" placeholder="username" required />
                <input name="password" type="password" placeholder="password" required />
                <button type="submit">Login</button>
            </form>
            <p className="auth-switch">
                Don't have an account?{' '}
                <button onClick={() => setAuthPage('register')} className="link-button">Register Here</button>
            </p>
        </div>
    );

    const RegisterPage = () => (
        <div className="auth-container">
            <form onSubmit={register} className="auth-form">
                <h3>Create Account</h3>
                <input name="username" placeholder="username" required />
                <input name="password" type="password" placeholder="password" required />
                <button type="submit">Register</button>
            </form>
            <p className="auth-switch">
                Already have an account?{' '}
                <button onClick={() => setAuthPage('login')} className="link-button">Login Here</button>
            </p>
        </div>
    );

    return (
        <div className="app">
            {notification && <div className={`notification ${notification.type}`}>{notification.message}</div>}
            <h1>Sliding Puzzle Challenge</h1>
            {!token ? (
                authPage === 'login' ? <LoginPage /> : <RegisterPage />
            ) : (
                <div>
                    <div className="user-info">
                        <h2>Welcome {user?.username}!</h2>
                        <div className="stats">
                            <span>Puzzles solved: <strong>{user?.puzzlesSolved ?? 0}</strong></span>
                            <span>Best moves: <strong>{user?.bestMoves ?? 'N/A'}</strong></span>
                            <span>Average moves: <strong>{user?.averageMoves ?? 'N/A'}</strong></span>
                        </div>
                        <button onClick={() => { setToken(null); localStorage.removeItem('token'); setUser(null); }}>Logout</button>
                    </div>
                    <div className="tabs">
                        <button className={activeTab === 'game' ? 'active' : ''} onClick={() => setActiveTab('game')}>Play Game</button>
                        <button className={activeTab === 'leaderboard' ? 'active' : ''} onClick={() => setActiveTab('leaderboard')}>🏆 Leaderboard</button>
                    </div>
                    <div className="tab-content">
                        {activeTab === 'game' ? <SlidingPuzzle onSolved={handlePuzzleSolved} /> : <Leaderboard token={token} />}
                    </div>
                </div>
            )}
            <style>{`
                :root { --primary-color: #007acc; --primary-hover: #005999; --border-color: #ddd; }
                .app { max-width: 900px; margin: 20px auto; padding: 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                .auth-container { display: flex; flex-direction: column; align-items: center; margin-top: 40px; }
                .auth-form { display: flex; flex-direction: column; gap: 15px; padding: 30px; border: 1px solid var(--border-color); border-radius: 8px; background: white; width: 100%; max-width: 350px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                .auth-form h3 { margin-top: 0; margin-bottom: 10px; font-size: 24px; }
                .auth-form input { padding: 12px 15px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; }
                .auth-form button { padding: 12px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; }
                .auth-switch { margin-top: 20px; }
                .link-button { background: none; border: none; color: var(--primary-color); text-decoration: underline; cursor: pointer; padding: 0; font-size: inherit; }
                .notification { padding: 15px 20px; border-radius: 8px; color: white; position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-weight: 500; animation: fadeInDown 0.5s ease; }
                @keyframes fadeInDown { from { top: -60px; opacity: 0; } to { top: 20px; opacity: 1; } }
                .notification.error { background-color: #e53e3e; }
                .notification.success { background-color: #48bb78; }
                .user-info { background: #e6f3ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                .stats { display: flex; gap: 20px; justify-content: center; margin: 15px 0; flex-wrap: wrap; }
                .tabs { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; }
                .tabs button { padding: 12px 24px; border: 2px solid var(--primary-color); background: white; color: var(--primary-color); border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; }
                .tabs button.active, .tabs button:hover { background: var(--primary-color); color: white; }
                .tab-content { padding-top: 20px; }
                .puzzle-container { display: flex; flex-direction: column; align-items: center; gap: 20px; }
                .puzzle-info { display: flex; gap: 30px; font-size: 18px; }
                .puzzle-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 10px; background: #9c9c9c; border-radius: 8px; width: 400px; height: 400px; }
                .puzzle-tile { display: flex; justify-content: center; align-items: center; background: #f0f0f0; border-radius: 6px; font-size: 24px; font-weight: bold; color: #333; cursor: pointer; user-select: none; }
                .puzzle-tile.empty { background: #555; cursor: default; }
                .shuffle-button { padding: 12px 25px; border: none; border-radius: 6px; background-color: #6c757d; color: white; font-size: 16px; cursor: pointer; }
                .leaderboard-container { width: 100%; max-width: 800px; margin: 0 auto; text-align: left; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); }
                .leaderboard-container h3 { text-align: center; margin-bottom: 20px; }
                .global-stats { background: #f7f7f7; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
                .global-stats h4 { text-align: center; margin-top: 0; }
                .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .leaderboard-controls { display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-bottom: 10px; }
                .leaderboard-table { width: 100%; border-collapse: collapse; }
                .leaderboard-table th, .leaderboard-table td { padding: 12px; text-align: left; }
                .leaderboard-table thead { background-color: var(--primary-color); color: white; }
                .leaderboard-table tbody tr:nth-child(even) { background-color: #f7f7f7; }
                .leaderboard-table td:first-child, .leaderboard-table th:first-child { text-align: center; }
            `}</style>
        </div>
    );
}

export default App;

