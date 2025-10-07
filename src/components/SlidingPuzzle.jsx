import React, { useEffect, useState } from 'react'
import { solvePuzzle, generateSolvablePuzzle, isSolvable } from '../utils/NPuzzleSolver.js'

function range(n) { return [...Array(n).keys()] }

function isSolved(arr) {
    for (let i = 0; i < arr.length - 1; i++) if (arr[i] !== i + 1) return false
    return arr[arr.length - 1] === 0
}

function shuffled() {
    return generateSolvablePuzzle(4)
}

export default function SlidingPuzzle({ token, api, onSolved }) {
    const [tiles, setTiles] = useState(shuffled())
    const [moves, setMoves] = useState(0)
    const [startTime, setStartTime] = useState(Date.now())
    const [gameActive, setGameActive] = useState(true)
    const [isSolving, setIsSolving] = useState(false)
    const size = 4

    useEffect(() => {
        function onKey(e) {
            if (!gameActive || isSolving) return
            
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
    }, [tiles, gameActive, isSolving, moves, startTime, onSolved])

    function handleShuffle() {
        setTiles(shuffled())
        setMoves(0)
        setStartTime(Date.now())
        setGameActive(true)
        setIsSolving(false)
    }

    async function handleSolve() {
        if (!gameActive || isSolving || isSolved(tiles)) return
        
        // Check if puzzle is solvable first
        if (!isSolvable(tiles)) {
            alert('This puzzle configuration is not solvable!')
            return
        }
        
        setIsSolving(true)
        
        try {
            const solutionMoves = solvePuzzle(tiles)
            
            if (!solutionMoves || solutionMoves.length === 0) {
                alert('Unable to find a solution for this puzzle!')
                setIsSolving(false)
                return
            }
            
            console.log(`Found solution with ${solutionMoves.length} moves`)
            
            // Animate through each move with a delay
            let currentTiles = [...tiles]
            for (let i = 0; i < solutionMoves.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 150)) // Slightly faster animation
                
                const move = solutionMoves[i]
                const emptyIndex = currentTiles.indexOf(0)
                
                // Find the tile to move (it should be adjacent to empty space)
                let tileIndex = -1
                for (let j = 0; j < currentTiles.length; j++) {
                    if (currentTiles[j] === move.number) {
                        const row = Math.floor(j / size)
                        const col = j % size
                        const emptyRow = Math.floor(emptyIndex / size)
                        const emptyCol = emptyIndex % size
                        
                        const isAdjacent = (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
                                          (Math.abs(col - emptyCol) === 1 && row === emptyRow)
                        
                        if (isAdjacent) {
                            tileIndex = j
                            break
                        }
                    }
                }
                
                if (tileIndex !== -1) {
                    [currentTiles[tileIndex], currentTiles[emptyIndex]] = [currentTiles[emptyIndex], currentTiles[tileIndex]]
                    setTiles([...currentTiles])
                    setMoves(prev => prev + 1)
                } else {
                    console.warn('Could not find valid move for step', i, move)
                }
            }
            
            setGameActive(false)
            const timeSpent = Math.floor((Date.now() - startTime) / 1000)
            onSolved && onSolved(moves + solutionMoves.length, timeSpent)
            
        } catch (error) {
            console.error('Error during solving:', error)
            alert('An error occurred while solving the puzzle!')
        } finally {
            setIsSolving(false)
        }
    }

    function handleTileClick(index) {
        if (!gameActive || isSolving) return
        
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
            <div>Status: {isSolving ? 'Solving...' : gameActive ? 'Playing' : 'Solved!'}</div>
        </div>
            {tiles.map((t, i) => (
                <div 
                    key={i} 
                    className={`tile ${t === 0 ? 'empty' : ''} ${gameActive && !isSolving ? 'clickable' : ''}`}
                    onClick={() => handleTileClick(i)}
                >
                    {t === 0 ? '' : t}
                </div>
            ))}
            <div className="controls">
                <button onClick={handleShuffle} disabled={isSolving}>
                    Shuffle Puzzle
                </button>
                <button 
                    onClick={handleSolve} 
                    disabled={!gameActive || isSolving || isSolved(tiles)}
                >
                    {isSolving ? 'Solving...' : 'Auto Solve'}
                </button>
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
        .controls{ grid-column: 1 / -1; margin-top: 8px; text-align: center; display: flex; gap: 8px; justify-content: center; }
        .controls button{ padding: 8px 16px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .controls button:hover:not(:disabled){ background: #005999; }
        .controls button:disabled{ background: #ccc; cursor: not-allowed; }
      `}</style>
        </div>
    )
}