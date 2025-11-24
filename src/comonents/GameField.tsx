import { useState } from "react"

import Pacman from "../img/pacman.svg"
import Coin from "../img/skull-game-coin.png"
import Ghost1 from "../img/ghost1.svg"
import Ghost2 from "../img/ghost2.svg"
import Ghost3 from "../img/ghost3.svg"

type GameFieldProps = {
  pacmanPosition: { x: number, y: number }
  coins: { x: number, y: number }[]
  ghosts: { x: number, y: number }[]
  gridSize: number
}

const GameField = ({ pacmanPosition, coins, ghosts, gridSize }: GameFieldProps) => {
    // ===== WATCH POSITION CHANGES =====//
    // Remember the last position
  const [prevPosition, setPrevPosition] = useState(pacmanPosition)
  const [lastDirection, setLastDirection] = useState('right')
  
  // If position changed set the new direction
    if (pacmanPosition.x !== prevPosition.x || pacmanPosition.y !== prevPosition.y) {
    if (pacmanPosition.x > prevPosition.x) setLastDirection('right')
    if (pacmanPosition.x < prevPosition.x) setLastDirection('left')
    if (pacmanPosition.y > prevPosition.y) setLastDirection('down')
    if (pacmanPosition.y < prevPosition.y) setLastDirection('up')
    
    setPrevPosition(pacmanPosition)
  }
   
    const getCellContent = (x: number, y: number) => {
        // 1. Pacman
        if (x === pacmanPosition.x && y === pacmanPosition.y) {
        return (
            <img 
            src={Pacman} 
            alt="Pacman" 
            className={`pacman pacman-${lastDirection}`}
            />
        )
    }

    // 2. Ghosts
    const ghostIndex = ghosts.findIndex(ghost => ghost.x === x && ghost.y === y)
        if (ghostIndex !== -1) {
    const ghostImages = [Ghost1, Ghost2, Ghost3]
    return <img 
        src={ghostImages[ghostIndex]} 
        alt="Ghost" 
        className="ghost" 
        data-ghost={ghostIndex}
    />
    }

    // 3. Coins
    const isCoin = coins.some(coin => coin.x === x && coin.y === y)
    if (isCoin) {
    return <img src={Coin} alt="Coin" className="coin" />
    }

    // 4. Empty field
    return null
    }

    // Create rows
    const rows = []
    for (let y = 0; y < gridSize; y++) {
        const cells = []

    // For every row create cells
    for (let x = 0; x < gridSize; x++) {
        cells.push(
            <div key={`${x}-${y}`} className="cell">
                {getCellContent(x, y)}
            </div>
        )
    }

        rows.push(
        <div key={y} className="row">
            {cells}
        </div>
        )
    }

    return (
    <div className="game-field">
        {rows}
    </div>
    )
}

export default GameField