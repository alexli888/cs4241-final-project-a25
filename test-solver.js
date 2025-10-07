// Quick test of the NPuzzleSolver
import { solvePuzzle, arrayTo2D, isSolvable } from './src/utils/NPuzzleSolver.js';

// Test with a simple solvable configuration
const testPuzzle = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15];

console.log('Test puzzle:', testPuzzle);
console.log('Is solvable:', isSolvable(testPuzzle));

const grid = arrayTo2D(testPuzzle);
console.log('2D grid:');
grid.forEach(row => console.log(row));

try {
    const solution = solvePuzzle(testPuzzle);
    console.log('Solution found:', solution ? solution.length + ' moves' : 'null');
    if (solution) {
        console.log('First few moves:', solution.slice(0, 5));
    }
} catch (error) {
    console.error('Error:', error.message);
}