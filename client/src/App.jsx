import React, { useState, useEffect } from 'react'
import axios from 'axios'
import SlidingPuzzle from './components/SlidingPuzzle'

const API = import.meta.env.VITE_API || 'http://localhost:4000/api'

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [user, setUser] = useState(null)

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token)
            axios.get(`${API}/progress`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => setUser(r.data.user))
                .catch(() => { setToken(null); localStorage.removeItem('token') })
        }
    }, [token])

    async function register(e) {
        e.preventDefault();
        const username = e.target.username.value
        const password = e.target.password.value

        try {
            const response = await axios.post(`${API}/auth/register`, {
                username, password
            })
            setToken(response.data.token)
        } catch (error) {
            const message = error.response?.data?.error || 'Registration failed'
            alert(`Registration error: ${message}`)
            console.error('Registration error:', error)
        }
    }

    async function login(e) {
        e.preventDefault();
        const username = e.target.username.value
        const password = e.target.password.value

        try {
            const res = await axios.post(`${API}/auth/login`, { username, password })
            setToken(res.data.token)
        } catch (error) {
            const message = error.response?.data?.error || 'Login failed'
            alert(`Login error: ${message}`)
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
                    <SlidingPuzzle token={token} api={API} onSolved={(async () => {
                        try {
                            await axios.post(`${API}/progress/solved`, {}, { headers: { Authorization: `Bearer ${token}` } });
                            const r = await axios.get(`${API}/progress`, { headers: { Authorization: `Bearer ${token}` } });
                            setUser(r.data.user)
                        } catch (e) { console.error(e) }
                    })} />
                </div>
            )}
        </div>
    )
}

export default App