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
    const size = 4

    useEffect(() => {
        function onKey(e) {
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
                if (isSolved(next)) onSolved && onSolved()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [tiles])

    return (
        <div className="puzzle">
            {tiles.map((t, i) => (
                <div key={i} className={`tile ${t === 0 ? 'empty' : ''}`}>{t === 0 ? '' : t}</div>
            ))}
            <div className="controls">
                <button onClick={() => setTiles(shuffled())}>Shuffle</button>
            </div>
            <style>{`
        .puzzle{ display:grid; grid-template-columns: repeat(${size}, 60px); gap:6px; margin-top:12px }
        .tile{ width:60px; height:60px; display:flex; align-items:center; justify-content:center; background:#eee; border-radius:6px }
        .tile.empty{ background:transparent }
      `}</style>
        </div>
    )
}