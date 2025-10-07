import React, { useEffect, useState } from 'react'

function range(n) { return [...Array(n).keys()] }

function isSolved(arr) {
    for (let i = 0; i < arr.length - 1; i++) if (arr[i] !== i + 1) return false
    return arr[arr.length - 1] === 0
}

function shuffled() {
    const arr = range(15).map(i => i + 1).concat([0])
    // simple Fisher-Yates
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

export default function SlidingPuzzle({ token, api, onSolved }) {
    const [tiles, setTiles] = useState(shuffled())
    const [moves, setMoves] = useState(0)
    const [startTime, setStartTime] = useState(Date.now())
    const [gameActive, setGameActive] = useState(true)
    const size = 4

    useEffect(() => {
        function onKey(e) {
            if (!gameActive) return
            
            const idx = tiles.indexOf(0)
            const row = Math.floor(idx / size)
            const col = idx % size
            let target = null
            if (e.key === 'ArrowUp' && row < size - 1) target = idx + size
            if (e.key === 'ArrowDown' && row > 0) target = idx - size
            if (e.key === 'ArrowLeft' && col < size - 1) target = idx + 1
            if (e.key === 'ArrowRight' && col > 0) target = idx - 1
            if (target != null) {
                const next = tiles.slice()
                    ;[next[idx], next[target]] = [next[target], next[idx]]
                setTiles(next)
                setMoves(prev => prev + 1)
                
                if (isSolved(next)) {
                    setGameActive(false)
                    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
                    onSolved && onSolved(moves + 1, timeSpent)
                }
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [tiles, gameActive, moves, startTime, onSolved])

    function handleShuffle() {
        setTiles(shuffled())
        setMoves(0)
        setStartTime(Date.now())
        setGameActive(true)
    }

    function handleTileClick(index) {
        if (!gameActive) return
        
        const emptyIndex = tiles.indexOf(0)
        const row = Math.floor(index / size)
        const col = index % size
        const emptyRow = Math.floor(emptyIndex / size)
        const emptyCol = emptyIndex % size
        
        // Check if tile is adjacent to empty space
        const isAdjacent = (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
                          (Math.abs(col - emptyCol) === 1 && row === emptyRow)
        
        if (isAdjacent) {
            const next = tiles.slice()
                ;[next[index], next[emptyIndex]] = [next[emptyIndex], next[index]]
            setTiles(next)
            setMoves(prev => prev + 1)
            
            if (isSolved(next)) {
                setGameActive(false)
                const timeSpent = Math.floor((Date.now() - startTime) / 1000)
                onSolved && onSolved(moves + 1, timeSpent)
            }
        }
    }

    return (
        <div className="puzzle">
            <div className="game-info">
                <div>Moves: {moves}</div>
                <div>Status: {gameActive ? 'Playing' : 'Solved!'}</div>
            </div>
            {tiles.map((t, i) => (
                <div 
                    key={i} 
                    className={`tile ${t === 0 ? 'empty' : ''} ${gameActive ? 'clickable' : ''}`}
                    onClick={() => handleTileClick(i)}
                >
                    {t === 0 ? '' : t}
                </div>
            ))}
            <div className="controls">
                <button onClick={handleShuffle}>Shuffle Puzzle</button>
            </div>
            <style>{`
        .puzzle{ 
            display:grid; 
            grid-template-columns: repeat(${size}, 60px); 
            gap:6px; 
            margin: 20px auto; 
            justify-content: center;
            max-width: fit-content;
        }
        .game-info{ grid-column: 1 / -1; display: flex; justify-content: space-between; padding: 8px; background: #f0f0f0; border-radius: 4px; margin-bottom: 8px; font-weight: bold; }
        .tile{ width:60px; height:60px; display:flex; align-items:center; justify-content:center; background:#eee; border-radius:6px; font-weight: bold; font-size: 18px; }
        .tile.empty{ background:transparent }
        .tile.clickable:not(.empty):hover{ background:#ddd; cursor:pointer; }
        .controls{ grid-column: 1 / -1; margin-top: 8px; text-align: center; }
        .controls button{ padding: 8px 16px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .controls button:hover{ background: #005999; }
      `}</style>
        </div>
    )
}