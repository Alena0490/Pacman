import { useState } from "react"
import { type Cell } from '../data/mazeData'

// import Pacman from "../img/pacman.svg"
import Coin from "../img/skull-game-coin.png"
import Dot from "../img/PacmanDot.svg"
import AnimatedGhost from '../svg/AnimatedGhosts'
import AnimatedPacman from '../svg/AnimatedPacman'

type GameFieldProps = {
  pacmanPosition: { x: number, y: number }
  
    coins: { x: number, y: number }[]
    powerPellets: { x: number, y: number }[] 
    ghosts: Array<{                          // ← GHOST ARRAY
        x: number
        y: number
        lastDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'  // ← Ghost direction
    }>
    gridSize: number
    maze: Cell[][]  
    isFrightened: boolean
    eatenGhosts: number[]
    floatingScores: Array<{ 
        x: number
        y: number
        points?: number
        text?: string | undefined
        id: number
    }>
    isPacmanDying: boolean
}

const GameField = ({ 
    pacmanPosition, 
    coins, 
    powerPellets,
    ghosts, 
    gridSize, 
    maze, 
    isFrightened, 
    eatenGhosts,
    floatingScores,
    isPacmanDying ,
}: GameFieldProps) => {

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

            // Detect if eating coin
                const isEatingCoin = coins.some(
                    coin => coin.x === pacmanPosition.x && coin.y === pacmanPosition.y
                )

            return (
                <div className={`pacman pacman-${lastDirection}`}>
                    <AnimatedPacman 
                        direction={lastDirection}
                        isDying={isPacmanDying} 
                        isEating={isEatingCoin} 
                    />
                </div>
            )
        }

    // 2. Ghosts
    const ghostIndex = ghosts.findIndex(ghost => ghost.x === x && ghost.y === y)
        if (ghostIndex !== -1) {
            const isEaten = eatenGhosts.includes(ghostIndex)
            const currentGhost = ghosts[ghostIndex]
            
            return (
                <div className="ghost" data-ghost={ghostIndex}>
                <AnimatedGhost
                    ghostIndex={ghostIndex as 0 | 1 | 2 | 3}
                    direction={currentGhost.lastDirection}
                    isScared={isFrightened && !isEaten}
                    isEaten={isEaten}
                />
                </div>
            )
        }

    // 3. Dots & Power Pellets

    // Power pellet (large coin)
    // Power pellet (check STATE, not maze)
    const hasPowerPellet = powerPellets.some(
        pellet => pellet.x === x && pellet.y === y
    )

    if (hasPowerPellet) {
    return <img 
        src={Coin} 
        alt="Power Pellet" 
        className="coin large"
    />
    }

    // Regular coin
    const isCoin = coins.some(coin => coin.x === x && coin.y === y)
    if (isCoin) {
        return <img 
            src={Dot} // ←  Changed from coin to dot
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
 
        {/* Floating messages (scores + READY) */}
        {floatingScores.map(item => (
            <div
                key={item.id}
                className={`floating-score ${item.text ? 'ready-message' : ''}`}
                style={{
                left: `calc(${item.x} * var(--cell-size) + var(--cell-size) / 2)`,
                top: `calc(${item.y} * var(--cell-size) + var(--cell-size) / 2)`,
                }}
            >
                {item.text || item.points}
            </div>
        ))}
    </div>
    )
}

export default GameField