import "./Screen.css"

type GameOverProps = {
  score: number
  onRestart: () => void 
}

const GameOver = ({score, onRestart}:GameOverProps) => {
    return (
        <div className="screen-wrapper">
            <article className="screen screen--game-over">
                <h2>Game over!</h2>
                <p className="score-status">Your score is: <span>{score}</span></p>
                <button
                    className="new-game" 
                    onClick={onRestart}
                >
                    Play again
                </button>
            </article>
        </div>
    )
}

export default GameOver