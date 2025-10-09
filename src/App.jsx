import React, { useState, useEffect } from 'react'
import SlidingPuzzle from './components/SlidingPuzzle'
import Leaderboard from './components/Leaderboard'
import Rules from './components/HowToPlay'

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [user, setUser] = useState(null)
    const [activeTab, setActiveTab] = useState('game')
    const [authPage, setAuthPage] = useState('login') // 'login' or 'register'
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
            <header className="topbar">
                <div className="brand">
                    <h1>Sliding Puzzle Challenge</h1>
                </div>
                <div className="instructions">
                    <button className="btn" onClick={() => setShowRules(true)}>How to Play</button>
                </div>
            </header>
            <Rules open={showRules} onClose={() => setShowRules(false)} />

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
                :root { --primary-color: #007acc; --primary-hover: #005999; --border-color: #ddd; }
                
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
                .auth-container { display: flex; flex-direction: column; align-items: center; margin-top: 40px; }
                .auth-form { display: flex; flex-direction: column; gap: 15px; padding: 30px; border: 1px solid var(--border-color); border-radius: 8px; background: white; width: 100%; max-width: 350px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                .auth-form h3 { margin-top: 0; margin-bottom: 10px; font-size: 24px; }
                .auth-form input { padding: 12px 15px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; }
                .auth-form button { padding: 12px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; }
                .auth-switch { margin-top: 20px; }

                .auth input {
                    padding: 8px 12px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
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
                
                /* Modal Styles */
                .modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease-out;
                }
                
                .modal {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    padding: 32px;
                    position: relative;
                    animation: slideIn 0.3s ease-out;
                }
                
                .modal h2 {
                    margin: 0 0 24px 0;
                    color: #1a1a1a;
                    font-size: 28px;
                    font-weight: 700;
                    text-align: center;
                    border-bottom: 2px solid #007acc;
                    padding-bottom: 12px;
                }
                
                .rules {
                    margin: 0 0 24px 0;
                    padding: 0;
                    list-style: none;
                    counter-reset: rule-counter;
                }
                
                .rules li {
                    counter-increment: rule-counter;
                    margin-bottom: 16px;
                    padding: 16px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border-left: 4px solid #007acc;
                    position: relative;
                    line-height: 1.6;
                }
                
                .rules li::before {
                    content: counter(rule-counter);
                    position: absolute;
                    left: -12px;
                    top: 8px;
                    background: #007acc;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 12px;
                }
                
                .tips {
                    background: linear-gradient(135deg, #e8f4fd, #d1e7dd);
                    border: 1px solid #b3d7ff;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                    position: relative;
                }
                

                
                .tips p {
                    margin: 0;
                    color: #2c5530;
                    font-weight: 500;
                    line-height: 1.6;
                }
                
                .btn {
                    background: #007acc;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 24px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: block;
                    margin: 0 auto;
                    min-width: 120px;
                }
                
                .btn:hover {
                    background: #005999;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 122, 204, 0.3);
                }
                
                .btn:active {
                    transform: translateY(0);
                }
                
                .btn.primary {
                    background: linear-gradient(135deg, #007acc, #0056b3);
                }
                
                .btn.primary:hover {
                    background: linear-gradient(135deg, #005999, #004085);
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-50px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @media (max-width: 600px) {
                    .modal {
                        padding: 24px;
                        border-radius: 12px;
                        width: 95%;
                    }
                    
                    .modal h2 {
                        font-size: 24px;
                    }
                    
                    .rules li {
                        padding: 12px 12px 12px 24px;
                    }
                    
                    .tips {
                        padding: 16px;
                    }
                    
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