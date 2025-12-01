import { useState } from "react"
import { type Cell } from '../data/mazeData'

import Pacman from "../img/pacman.svg"
import Coin from "../img/skull-game-coin.png"
import Ghost1 from "../img/ghost1.svg"
import Ghost2 from "../img/ghost2.svg"
import Ghost3 from "../img/ghost3.svg"
import Ghost4 from "../img/ghost4.svg"
import GhostScared from "../img/ghost-scared.svg"
import GhostEyes from "../img/eyes.svg"

type GameFieldProps = {
  pacmanPosition: { x: number, y: number }
  
    coins: { x: number, y: number }[]
    ghosts: { x: number, y: number }[]
    gridSize: number
    maze: Cell[][]  
    isFrightened: boolean
}

const GameField = ({ pacmanPosition, coins, ghosts, gridSize, maze, isFrightened }: GameFieldProps) => {
    // ===== WATCH POSITION CHANGES =====//
    // Remember the last position
  const [prevPosition, setPrevPosition] = useState(pacmanPosition)
  const [lastDirection, setLastDirection] = useState('right')
  
    // If position changed set the new direction
    if (pacmanPosition.x !== prevPosition.x || pacmanPosition.y !== prevPosition.y) {
        const dx = pacmanPosition.x - prevPosition.x
        const dy = pacmanPosition.y - prevPosition.y

        if (dx !== 0) {
            if (dx === 1) {
            setLastDirection('right')
            } else if (dx === -1) {
            setLastDirection('left')
            } else if (dx > 1) {
            // teleport from left to right → he walked left into tunnel
            setLastDirection('left')
            } else if (dx < -1) {
            // teleport from right to left → he walked right into tunnel
            setLastDirection('right')
            }
        } else if (dy !== 0) {
            if (dy > 0) setLastDirection('down')
            if (dy < 0) setLastDirection('up')
        }
    
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
    const ghostImages = [Ghost1, Ghost2, Ghost3, Ghost4]
    
    return <img 
        src={isFrightened ? GhostScared : ghostImages[ghostIndex]}  // ← Scared ghost if frightened
        alt="Ghost" 
        className={`ghost ${isFrightened ? 'frightened' : ''}`}  // ← Add class frightened
        data-ghost={ghostIndex}
    />
    }

    // 3. Coins & Power Pellets
    const cell = maze[y][x]

    // Power pellet (large coin)
    if (cell.powerPellet) {
    return <img 
        src={Coin}  // ←  Same source as coin
        alt="Power Pellet" 
        className="coin large"  // ←  CSS  .large
    />
    }

    // Regular coin
    const isCoin = coins.some(coin => coin.x === x && coin.y === y)
    if (isCoin) {
    return <img 
        src={Coin} // ←  Same source as Power Pellet
        alt="Coin" 
        className="coin" 
    />
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
            const cell = maze[y][x]  // ← Get the cell from map
            
            // CSS classes for walls
            const wallClasses = [
                cell.top && 'wall-top',
                cell.right && 'wall-right',
                cell.bottom && 'wall-bottom',
                cell.left && 'wall-left'
            ].filter(Boolean).join(' ')
                                             
            // Zone class (restricted / ghost-house)
            const zoneClass = cell.zone || '' 
            
            cells.push(
                <div className={`cell ${wallClasses} ${zoneClass}`}>
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
    <div 
        className="game-field"
        role="application"
        aria-label={`Pacman game grid, ${gridSize} by ${gridSize} cells`}
    >
        {rows}
    </div>
    )
}

export default GameField