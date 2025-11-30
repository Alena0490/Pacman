type WinScreenProps = {
  score: number
  onRestart: () => void
  announcement: string
}

const WinScreen = ({score, onRestart, announcement}:WinScreenProps) => {
    return (
        <div className="screen-wrapper">
            <main
                className="screen screen--win"
            >
                <div 
                    aria-live="assertive"
                    aria-atomic="true"
                    className="visually-hidden"
                >
                    {announcement}
                </div>
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
            </main>
        </div>
    )
}

export default WinScreen