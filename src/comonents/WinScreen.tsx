type WinScreenProps = {
  score: number
  onRestart: () => void
}

const WinScreen = ({score, onRestart}:WinScreenProps) => {
    return (
        <div className="screen-wrapper">
            <article
                className="screen screen--win"
            >
                <h2>You won</h2>
                <p>Well done, you've collected all the coins.</p>
                <p className="score-status">Your score is <span>{score}</span></p>
                <button
                    className="new-game" 
                    onClick={onRestart}
                    aria-label="Restart game"
                >
                    Play again
                </button>
            </article>
        </div>
    )
}

export default WinScreen