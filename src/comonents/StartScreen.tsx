import "./Screen.css"

type StartScreenProps = {
  onStart: () => void
}

const StartScreen = ({onStart}:StartScreenProps) => {
    return (
        <div className="screen-wrapper">
            <article className="screen screen--start">
                <h2>Pac Maze</h2>
                <div 
                    className="instructions"
                    aria-label="Game controls"
                >
                    <p>Use arrow keys to move Pacman</p>
                    <p>Collect all coins to win!</p>
                    <p>Avoid the ghosts!</p>
                </div>
                <button
                    className="new-game" 
                    onClick={onStart}
                    aria-label="Start game" 
                >
                    Start game
                    </button>
            </article>
        </div>
    )
}

export default StartScreen