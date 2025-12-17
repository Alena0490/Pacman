// ===== WIN SCREEN ===== //
// Victory screen displayed when player completes all 5 levels

type WinScreenProps = {
  score: number // Final score achieved
  onRestart: () => void // Callback to restart game from level 1
  announcement: string // Screen reader announcement
}

const WinScreen = ({score, onRestart, announcement}:WinScreenProps) => {
    return (
        <div className="screen-wrapper">
            <main
                className="screen screen--win"
            >
                {/* Screen reader announcement for accessibility */}
                <div 
                    aria-live="assertive"
                    aria-atomic="true"
                    className="visually-hidden"
                >
                    {announcement}
                </div>
                <h2>Winner</h2>
                <p>Well done, you've collected all the coins.</p>
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

export default WinScreen
