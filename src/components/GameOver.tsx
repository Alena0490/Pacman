// ===== GAME OVER SCREEN ===== //
// Displays final score and restart option when player loses all lives

import "./Screen.css"

type GameOverProps = {
  score: number // Final score achieved
  onRestart: () => void // Callback to restart game
  announcement: string // Screen reader announcement
}

const GameOver = ({score, onRestart, announcement}:GameOverProps) => {
    return (
        <div className="screen-wrapper">
            <main className="screen screen--game-over">
                {/* Screen reader announcement for accessibility */}
                <div 
                    aria-live="assertive"
                    aria-atomic="true"
                    className="visually-hidden"
                >
                    {announcement}
                </div>
                <h2>Game over!</h2>
                <p>Better luck next time!</p>
                <p className="score-status">Your score is: <span>{score}</span></p>
                <button
                    className="new-game" 
                    onClick={onRestart}
                    aria-label="Restart game"
                >
                    Play again
                </button>
            </main>
        </div>
    )
}

export default GameOver
