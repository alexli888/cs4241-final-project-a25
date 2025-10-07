import React, { useState, useEffect } from 'react'

export default function Leaderboard({ token }) {
    const [leaderboard, setLeaderboard] = useState([])
    const [sortBy, setSortBy] = useState('puzzlesSolved')
    const [loading, setLoading] = useState(true)
    const [globalStats, setGlobalStats] = useState(null)

    useEffect(() => {
        fetchLeaderboard()
        fetchGlobalStats()
    }, [sortBy])

    async function fetchLeaderboard() {
        try {
            setLoading(true)
            const response = await fetch(`/api/leaderboard?sortBy=${sortBy}&limit=20`)
            const data = await response.json()
            setLeaderboard(data)
        } catch (error) {
            console.error('Error fetching leaderboard:', error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchGlobalStats() {
        try {
            const response = await fetch('/api/stats/global')
            const data = await response.json()
            setGlobalStats(data)
        } catch (error) {
            console.error('Error fetching global stats:', error)
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString()
    }

    return (
        <div className="leaderboard">
            <h2>🏆 Leaderboard</h2>
            
            {globalStats && (
                <div className="global-stats">
                    <h3>Global Statistics</h3>
                    <div className="stats-grid">
                        <div>Total Players: <strong>{globalStats.totalPlayers}</strong></div>
                        <div>Total Games: <strong>{globalStats.totalGames}</strong></div>
                        <div>Average Moves: <strong>{Math.round(globalStats.globalStats.avgMoves || 0)}</strong></div>
                        {globalStats.topPlayer && (
                            <div>Top Player: <strong>{globalStats.topPlayer.username}</strong> ({globalStats.topPlayer.puzzlesSolved} puzzles)</div>
                        )}
                    </div>
                </div>
            )}

            <div className="sort-controls">
                <label>Sort by: </label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="puzzlesSolved">Puzzles Solved</option>
                    <option value="bestMoves">Best Moves (Fewest)</option>
                    <option value="averageMoves">Average Moves</option>
                </select>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="leaderboard-table">
                    <table>
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
                            {leaderboard.map((player, index) => (
                                <tr key={player._id}>
                                    <td>
                                        {index === 0 && '🥇'}
                                        {index === 1 && '🥈'}
                                        {index === 2 && '🥉'}
                                        {index > 2 && `#${index + 1}`}
                                    </td>
                                    <td className="username">{player.username}</td>
                                    <td>{player.puzzlesSolved}</td>
                                    <td>{player.bestMoves || 'N/A'}</td>
                                    <td>{player.averageMoves || 'N/A'}</td>
                                    <td>{formatDate(player.lastPlayed)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <style>{`
                .leaderboard {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 20px;
                    background: #f9f9f9;
                    border-radius: 8px;
                }
                
                .global-stats {
                    background: white;
                    padding: 15px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    border: 1px solid #ddd;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 10px;
                    margin-top: 10px;
                }
                
                .sort-controls {
                    margin-bottom: 15px;
                }
                
                .sort-controls select {
                    padding: 5px 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    margin-left: 8px;
                }
                
                .leaderboard-table {
                    background: white;
                    border-radius: 6px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                th {
                    background: #007acc;
                    color: white;
                    padding: 12px 8px;
                    text-align: left;
                    font-weight: bold;
                }
                
                td {
                    padding: 10px 8px;
                    border-bottom: 1px solid #eee;
                }
                
                tr:nth-child(even) {
                    background: #f8f8f8;
                }
                
                tr:hover {
                    background: #e6f3ff;
                }
                
                .username {
                    font-weight: bold;
                    color: #007acc;
                }
                
                @media (max-width: 600px) {
                    .leaderboard-table {
                        overflow-x: auto;
                    }
                    
                    table {
                        min-width: 500px;
                    }
                }
            `}</style>
        </div>
    )
}