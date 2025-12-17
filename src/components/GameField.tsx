// ===== GAME FIELD COMPONENT ===== //
// Main game grid - renders maze, Pac-Man, ghosts, dots, fruits, and floating scores
// Handles dynamic content placement and directional animations

import { useState } from "react"
import { type Cell } from '../data/mazeData'

import Coin from "../img/skull-game-coin.png"
import Dot from "../img/PacmanDot.svg"
import AnimatedGhost from '../svg/AnimatedGhosts'
import AnimatedPacman from '../svg/AnimatedPacman'
import type { Fruit } from "../data/FruitTypes"
import CherryImg from '../img/cherries.png'
import StrawberryImg from '../img/strawberry.svg'
import OrangeImg from '../img/orange.svg'
import AppleImg from '../img/apple.svg'
import MelonImg from '../img/melon.svg'
import GalaxianImg from '../img/galaxian.webp'

type GameFieldProps = {
    pacmanPosition: { x: number, y: number }
    fruit: Fruit 
    dots: { x: number, y: number }[]
    powerPellets: { x: number, y: number }[] 
    ghosts: Array<{
        x: number
        y: number
        lastDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
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
    isInvincible: boolean
    frightenedTimeRemaining: number
    ghostsReleased: boolean[]
    isGateVisible: boolean 
}

const GameField = ({ 
    pacmanPosition, 
    fruit,
    dots, 
    powerPellets,
    ghosts, 
    gridSize, 
    maze, 
    frightenedTimeRemaining, 
    isFrightened, 
    eatenGhosts,
    floatingScores,
    isPacmanDying ,
    isInvincible,
    ghostsReleased,
    isGateVisible, 
}: GameFieldProps) => {

// ===== POSITION TRACKING FOR DIRECTION ===== //
// Track Pac-Man's last position to determine movement direction
// Handles normal movement and tunnel teleportation
const [prevPosition, setPrevPosition] = useState(pacmanPosition)
const [lastDirection, setLastDirection] = useState('right')
  
    // Detect direction change based on position delta
    if (pacmanPosition.x !== prevPosition.x || pacmanPosition.y !== prevPosition.y) {
        const dx = pacmanPosition.x - prevPosition.x
        const dy = pacmanPosition.y - prevPosition.y

        // Horizontal movement
        if (dx !== 0) {
            if (dx === 1) {
            setLastDirection('right')
            } else if (dx === -1) {
            setLastDirection('left')
            } else if (dx > 1) {
            // Teleport from left to right → went left into tunnel
            setLastDirection('left')
            } else if (dx < -1) {
            // Teleport from right to left → went right into tunnel
            setLastDirection('right')
            }

        // Vertical movement
        } else if (dy !== 0) {
            if (dy > 0) setLastDirection('down')
            if (dy < 0) setLastDirection('up')
        }
    
        setPrevPosition(pacmanPosition)
    }
   
    // ===== CELL CONTENT RENDERER ===== //
    // Determines what to render in each cell (Pac-Man, ghosts, dots, fruits)
    // Priority: Pac-Man > Ghosts > Fruits > Power Pellets > Dots > Empty
    const getCellContent = (x: number, y: number) => {

        // 1. PAC-MAN
        if (x === pacmanPosition.x && y === pacmanPosition.y) {

            // Detect if eating dot for enhanced animation
            const isEatingDot = dots.some(
                dot => dot.x === pacmanPosition.x && dot.y === pacmanPosition.y
            )

            return (
                <div className={`pacman pacman-${lastDirection}`}>
                    <AnimatedPacman 
                        direction={lastDirection}
                        isDying={isPacmanDying} 
                        isEating={isEatingDot} 
                        className={isInvincible ? 'invincible' : ''}
                    />
                </div>
            )
        }

    // 2. GHOSTS
    const ghostIndex = ghosts.findIndex(ghost => ghost.x === x && ghost.y === y)
        if (ghostIndex !== -1) {
            const isEaten = eatenGhosts.includes(ghostIndex)
            const currentGhost = ghosts[ghostIndex]
            const isWaiting = !ghostsReleased[ghostIndex] 

            // Bounce animation: Pinky & Clyde bounce down, Inky bounces up
            const bounceClass = isWaiting 
                ? (ghostIndex === 1 ? 'bounce-down' : 'bounce-up')  // Inky bounces opposite
                : ''
            
            return (
                <div 
                    className={`ghost 
                        ${isFrightened ? 'frightened' : ''} 
                        ${isFrightened && frightenedTimeRemaining <= 2000 ? 'ending' : ''}
                        ${isEaten ? 'eaten' : ''}
                        ${bounceClass}`} 
                    data-ghost={ghostIndex}
                    >
                    <AnimatedGhost
                        ghostIndex={ghostIndex as 0 | 1 | 2 | 3}
                        direction={currentGhost.lastDirection}
                        isScared={isFrightened && !isEaten}
                        isFlashing={isFrightened && frightenedTimeRemaining <= 2000} 
                        isEaten={isEaten}
                    />
                </div>
            )
        }

    // 3. POWER PELLETS
    // Check state array, not maze
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

    // 4. DOTS
    const isDot = dots.some(dot => dot.x === x && dot.y === y)
    if (isDot) {
        return <img 
            src={Dot}
            alt="Dot" 
            className="coin" 
        />
    }

    // 5. FRUITS
    if (fruit.position && x === fruit.position.x && y === fruit.position.y) {
        const fruitImages = {
        cherry: CherryImg,
        strawberry: StrawberryImg,
        orange: OrangeImg,
        apple: AppleImg,
        melon: MelonImg,
        galaxian: GalaxianImg
    }
        
        return <img 
            src={fruitImages[fruit.type!]} 
            alt="Fruit" 
            className="fruit" 
            data-fruit={fruit.type} 
        />
    }

    // 6. EMPTY CELL
    return null
    }

    // ===== RENDER MAZE GRID ===== //
    // Build rows and cells with appropriate wall classes
    const rows = []
    for (let y = 0; y < gridSize; y++) {
        const cells = []

        // Create cells for current row
        for (let x = 0; x < gridSize; x++) {
            const cell = maze[y][x]  // ← Get the cell from map
            
            // Build wall CSS classes
            const wallClasses = [
                cell.top && 'wall-top',
                cell.right && 'wall-right',
                cell.bottom && 'wall-bottom',
                cell.left && 'wall-left'
            ].filter(Boolean).join(' ')
                                             
            // Zone class (restricted / ghost-house / tunnel)
            const zoneClass = cell.zone || '' 
            
            // Gate visibility for ghost house entrance (x:7, y:6)
            const gateClass = (x === 7 && y === 6 && isGateVisible) ? 'gate-visible' : ''

            cells.push(
            <div className={`cell ${wallClasses} ${zoneClass} ${gateClass}`}>
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

    // ===== FINAL RENDER ===== //
    return (
    <div
        className="game-field"
        role="application"
        aria-label={`Pacman game grid, ${gridSize} by ${gridSize} cells`}
    >
        {rows}

        {/* Floating score popups and READY messages */}
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
