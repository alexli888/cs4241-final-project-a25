import React, { useState, useEffect } from 'react'
import SlidingPuzzle from './components/SlidingPuzzle'
import Leaderboard from './components/Leaderboard'
import Rules from './components/HowToPlay'

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [user, setUser] = useState(null)
    const [activeTab, setActiveTab] = useState('game')
    const [showRules, setShowRules] = useState(false)

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token)
            fetch('/api/progress', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(r => r.json())
                .then(data => setUser(data.user))
                .catch(() => { setToken(null); localStorage.removeItem('token') })
        }
    }, [token])

    async function register(e) {
        e.preventDefault();
        const username = e.target.username.value
        const password = e.target.password.value

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            if (response.ok) {
                const data = await response.json()
                setToken(data.token)
            } else {
                let errorMessage = 'Registration failed'
                try {
                    const data = await response.json()
                    errorMessage = data.error || errorMessage
                } catch {
                    errorMessage = `Registration failed (${response.status})`
                }
                alert(`Registration error: ${errorMessage}`)
            }
        } catch (error) {
            alert('Registration failed')
            console.error('Registration error:', error)
        }
    }

    async function login(e) {
        e.preventDefault();
        const username = e.target.username.value
        const password = e.target.password.value

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            if (response.ok) {
                const data = await response.json()
                setToken(data.token)
            } else {
                let errorMessage = 'Login failed'
                try {
                    const data = await response.json()
                    errorMessage = data.error || errorMessage
                } catch {
                    errorMessage = `Login failed (${response.status})`
                }
                alert(`Login error: ${errorMessage}`)
            }
        } catch (error) {
            alert('Login failed')
            console.error('Login error:', error)
        }
    }

    return (
        <div className="app">
            <header className="topbar">
                <div className="brand">
                    <img src="/vite.svg" alt="" width="28" height="28" />
                    <h1>Sliding Puzzle Challenge</h1>
        </div>
        <div className="instructions">
          <button className="btn" onClick={() => setShowRules(true)}>How to Play</button>
        </div>
      </header>
        <Rules open={showRules} onClose={() => setShowRules(false)} />
            {!token && (
                <div className="auth">
                    <form onSubmit={register}>
                        <h3>Register</h3>
                        <input name="username" placeholder="username" />
                        <input name="password" type="password" placeholder="password" />
                        <button type="submit">Register</button>
                    </form>
                    <form onSubmit={login}>
                        <h3>Login</h3>
                        <input name="username" placeholder="username" />
                        <input name="password" type="password" placeholder="password" />
                        <button type="submit">Login</button>
                    </form>
                </div>
            )}

            {token && (
                <div>
                    <div className="user-info">
                        <h2>Welcome {user?.username}!</h2>
                        <div className="stats">
                            <span>Puzzles solved: <strong>{user?.puzzlesSolved ?? 0}</strong></span>
                            <span>Best moves: <strong>{user?.bestMoves ?? 'N/A'}</strong></span>
                            <span>Average moves: <strong>{user?.averageMoves ?? 'N/A'}</strong></span>
                        </div>
                        <button onClick={() => { setToken(null); localStorage.removeItem('token'); setUser(null) }}>Logout</button>
                    </div>
                    
                    <div className="tabs">
                        <button 
                            className={activeTab === 'game' ? 'active' : ''}
                            onClick={() => setActiveTab('game')}
                        >
                            Play Game
                        </button>
                        <button 
                            className={activeTab === 'leaderboard' ? 'active' : ''}
                            onClick={() => setActiveTab('leaderboard')}
                        >
                            🏆 Leaderboard
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'game' && (
                            <SlidingPuzzle 
                                token={token} 
                                onSolved={async (moves, timeSpent) => {
                                    try {
                                        await fetch('/api/progress/solved', {
                                            method: 'POST',
                                            headers: {
                                                'Authorization': `Bearer ${token}`,
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({ moves, timeSpent })
                                        });
                                        
                                        // Refresh user data
                                        const r = await fetch('/api/progress', {
                                            headers: { Authorization: `Bearer ${token}` }
                                        });
                                        const data = await r.json();
                                        setUser(data.user);
                                        
                                        alert(`Puzzle solved in ${moves} moves! 🎉`);
                                    } catch (e) { 
                                        console.error(e);
                                        alert('Error saving progress');
                                    }
                                }} 
                            />
                        )}
                        
                        {activeTab === 'leaderboard' && (
                            <Leaderboard token={token} />
                        )}
                    </div>
                </div>
            )}
            
            <style>{`
                .app {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 20px;
                    text-align: center;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .auth {
                    display: flex;
                    gap: 40px;
                    justify-content: center;
                    margin: 40px 0;
                }
                
                .auth form {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background: #f9f9f9;
                }
                
                .auth input {
                    padding: 8px 12px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                
                .auth button {
                    padding: 10px;
                    background: #007acc;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .auth button:hover {
                    background: #005999;
                }
                
                .user-info {
                    background: #e6f3ff;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                
                .stats {
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                    margin: 15px 0;
                    flex-wrap: wrap;
                }
                
                .tabs {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                .tabs button {
                    padding: 12px 24px;
                    border: 2px solid #007acc;
                    background: white;
                    color: #007acc;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                }
                
                .tabs button.active {
                    background: #007acc;
                    color: white;
                }
                
                .tabs button:hover {
                    background: #007acc;
                    color: white;
                }
                
                .tab-content {
                    min-height: 400px;
                }
                
                @media (max-width: 600px) {
                    .auth {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .stats {
                        flex-direction: column;
                        gap: 10px;
                    }
                    
                    .tabs {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    )
}

export default App