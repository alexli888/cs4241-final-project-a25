import React, { useState, useEffect } from 'react'
import SlidingPuzzle from './components/SlidingPuzzle'

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [user, setUser] = useState(null)

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
            <h1>Sliding Puzzle</h1>
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
                    <p>Welcome {user?.username} — Puzzles solved: {user?.puzzlesSolved ?? 0}</p>
                    <button onClick={() => { setToken(null); localStorage.removeItem('token'); setUser(null) }}>Logout</button>
                    <SlidingPuzzle token={token} onSolved={(async () => {
                        try {
                            await fetch('/api/progress/solved', {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            const r = await fetch('/api/progress', {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            const data = await r.json();
                            setUser(data.user)
                        } catch (e) { console.error(e) }
                    })} />
                </div>
            )}
        </div>
    )
}

export default App