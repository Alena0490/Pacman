import "./Screen.css"

type GameOverProps = {
  score: number
  onRestart: () => void 
  announcement: string
}

const GameOver = ({score, onRestart, announcement}:GameOverProps) => {
    return (
        <div className="screen-wrapper">
            <main className="screen screen--game-over">
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
