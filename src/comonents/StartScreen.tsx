import "./Screen.css"

type StartScreenProps = {
  onStart: () => void
}

const StartScreen = ({onStart}:StartScreenProps) => {
    return (
        <div className="screen-wrapper">
            <article className="screen screen--start">
                <h2>Pac Maze</h2>
                <p>Use arrow keys to eat all the coins and avoid the ghosts.</p>
                <button
                    className="new-game" 
                    onClick={onStart}
                >
                    Start game
                    </button>
            </article>
        </div>
    )
}

export default StartScreen