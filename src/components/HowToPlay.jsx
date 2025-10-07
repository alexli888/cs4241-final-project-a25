import react from 'react';

export default function Rules({ open, onClose }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="rules-title">
      <div className="modal">
        <h2 id="rules-title">How to Play</h2>
        <ol className="rules">
          <li>You’re playing the classic 15-puzzle on a 4×4 grid.</li>
          <li>Only tiles adjacent to the empty space can move.</li>
          <li>Click a tile or use the arrow keys to slide tiles into the empty space.</li>
          <li>Goal: arrange tiles from <strong>1 → 15</strong> with the empty space at the end.</li>
        </ol>
        <div className="tips">
          <p><strong>Tips:</strong> Solve row by row; leave the last row/column for the endgame. Fewer moves = better score.</p>
        </div>
        <button className="btn primary" onClick={onClose}>Got it</button>
      </div>
    </div>
  )
}