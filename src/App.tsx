import { useState, useEffect, useCallback } from "react"
import GameField from "./comonents/GameField"
import StartScreen from "./comonents/StartScreen"
import GameOver from "./comonents/GameOver"
import WinScreen from "./comonents/WinScreen"
import Lives from "./comonents/Lives"
import { MAZE, generateCoinsFromMaze, canMoveInDirection } from './data/mazeData'
import { useSound } from "./hooks/useSound"
import "./App.css"

// Ghost type definition
type Ghost = {
  x: number
  y: number
  lastDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  personality: 'random' | 'patrol' | 'nervous'
}

type GameStatus = 'ready' | 'playing' | 'gameOver' | 'won'

const App = () => {
// ===== GAME STATE ===== //
  const [gameStatus, setGameStatus] = useState<GameStatus>('ready')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const GRID_SIZE = 15
  const [announcement, setAnnouncement] = useState('')
  
  // ===== POSITION ===== //
  const [pacmanPosition, setPacmanPosition] = useState({ x: 1, y: 1 }) 
  const [ghosts, setGhosts] = useState<Ghost[]>([
    { x: 6, y: 7, lastDirection: 'DOWN', personality: 'random' },   // ← Random
    { x: 7, y: 7, lastDirection: 'DOWN', personality: 'patrol' },   // ← Patrol
    { x: 8, y: 7, lastDirection: 'DOWN', personality: 'nervous' }   // ← Nervous
  ])

  const [coins, setCoins] = useState(() => generateCoinsFromMaze())

    // Create sound players
    const playEating = useSound("/sounds/audio_eating.mp3")
    const playDie = useSound("/sounds/audio_die.mp3")
    const playWon = useSound("/sounds/audio_victory.mp3")
    const playStart = useSound("/sounds/audio_opening_song.mp3")

  // ===== MOVE PACMAN ===== //
 
  const movePacman = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    // ===== CHECK IF MOVE IS VALID =====
    if (!canMoveInDirection(
      MAZE, 
      pacmanPosition.x, 
      pacmanPosition.y, 
      direction as 'UP' | 'DOWN' | 'LEFT' | 'RIGHT',
      GRID_SIZE
    )) {

      // ===== CHECK FOR TUNNEL TELEPORTATION ===== //
      const currentCell = MAZE[pacmanPosition.y][pacmanPosition.x]
      
      // Only teleport if trying to exit through tunnel
      if (currentCell.tunnel === 'left' && direction === 'LEFT') {
        // Teleport to right side
        setPacmanPosition(prev => ({ x: GRID_SIZE - 1, y: prev.y }))

        return
      } else if (currentCell.tunnel === 'right' && direction === 'RIGHT') {
        // Teleport to left side
        setPacmanPosition(prev => ({ x: 0, y: prev.y }))

        return
      }

      return  // Can't move - wall or border!
    }
    
    // ===== CALCULATE NEW POSITION =====
    let newX = pacmanPosition.x
    let newY = pacmanPosition.y
    
    if (direction === 'UP') newY -= 1
    if (direction === 'DOWN') newY += 1
    if (direction === 'LEFT') newX -= 1
    if (direction === 'RIGHT') newX += 1
        
    setPacmanPosition({ x: newX, y: newY })

    // ===== COLLECTING COINS =====
    const hasCoin = coins.some(coin => coin.x === newX && coin.y === newY)
    if (hasCoin) {
      const newCoins = coins.filter(coin => {
        return !(coin.x === newX && coin.y === newY)
      })
      setCoins(newCoins)
      setScore(score + 1)
      
      playEating()  // ← PLAY EATING SOUND
      setAnnouncement(`Coin collected. Score: ${score + 1}`)  // ← Announce

      //Check the win
      if (newCoins.length === 0) {
        playWon()  // ← PLAY WIN SOUND
        setGameStatus('won')
      }
    }
    
    // ===== GHOST COLLISION =====
    const hitGhost = ghosts.some(ghost => ghost.x === newX && ghost.y === newY)
    
    if (hitGhost) {
      playDie()  // ← PLAY DIE SOUND
      setAnnouncement(`Hit by ghost! ${lives - 1} lives remaining`)  // ← Announce
      setLives(lives - 1)
      setPacmanPosition({ x: 1, y: 1 })
      
      if (lives - 1 <= 0) {
        setGameStatus('gameOver')
      }
    }
        
  }, [pacmanPosition, coins, score, ghosts, lives, GRID_SIZE, playEating, playWon, playDie])

  // ===== GHOSTS MOVE =====//
  const moveGhosts = useCallback(() => {
    setGhosts(prevGhosts => {
      const newGhosts: Ghost[] = []  // Empty array for ghost positions

        for (let currentIndex = 0; currentIndex < prevGhosts.length; currentIndex++) {
          const ghost = prevGhosts[currentIndex]
  
      // ===== FIND ALL POSSIBLE DIRECTIONS =====
      const possibleMoves: Array<{
        x: number, 
        y: number, 
        direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
      }> = []
      
      // Try all 4 directions
      const directions: Array<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'> = ['UP', 'DOWN', 'LEFT', 'RIGHT']
      
      for (const dir of directions) {
        if (canMoveInDirection(MAZE, ghost.x, ghost.y, dir, GRID_SIZE)) {
          let newX = ghost.x
          let newY = ghost.y
          
          if (dir === 'UP') newY -= 1
          if (dir === 'DOWN') newY += 1
          if (dir === 'LEFT') newX -= 1
          if (dir === 'RIGHT') newX += 1
          
          possibleMoves.push({ 
            x: newX, 
            y: newY, 
            direction: dir  // ← SAVE THE DIRECTION
          })
        }
      }
      
      // No possible moves → stay in place
      if (possibleMoves.length === 0) {
        newGhosts.push(ghost)
        continue  // ✅ Continue to the next ghosr
      }
      
      // ===== PREFER UP IN GHOST HOUSE ===== //
      // Ghost house area - prefer UP to escape y >= 6 && y <= 8, x >= 6 && x <= 8
      const isInGhostHouse = (
        ghost.y >= 5 && ghost.y <= 8 &&
        ghost.x >= 6 && ghost.x <= 8
      )
      
      let finalMove
      
      if (isInGhostHouse) {
        // Try to find UP direction first
        const upMove = possibleMoves.find(move => move.direction === 'UP')
        
        if (upMove) {
          finalMove = upMove  // Prefer UP
        } else {
          // If UP not possible, choose random
          finalMove = possibleMoves[
            Math.floor(Math.random() * possibleMoves.length)
          ]
        }
      } else {
        // ===== PERSONALITY-BASED MOVEMENT ===== //
        // Different ghost behaviors outside the house
      
      if (ghost.personality === 'random') {
        // RANDOM: Completely unpredictable movement
        // Chooses any available direction with equal probability
        finalMove = possibleMoves[
          Math.floor(Math.random() * possibleMoves.length)
        ]
        
      } else if (ghost.personality === 'patrol') {
        // PATROL: Prefers to continue in the same direction
        // Only changes when hitting a wall (creates patrol patterns)
        const sameDirection = possibleMoves.find(
          move => move.direction === ghost.lastDirection
        )
        
        if (sameDirection) {
          finalMove = sameDirection  // Keep going same way
        } else {
          // Can't continue → pick random
          finalMove = possibleMoves[
            Math.floor(Math.random() * possibleMoves.length)
          ]
        }
        
      } else if (ghost.personality === 'nervous') {
        // NERVOUS: Avoids backtracking (doesn't like going backwards)
        // More decisive movement, less likely to get stuck
        const oppositeDir = {
          'UP': 'DOWN',
          'DOWN': 'UP',
          'LEFT': 'RIGHT',
          'RIGHT': 'LEFT'
        }[ghost.lastDirection] as 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
        
        // Try to avoid opposite direction
        const filteredMoves = possibleMoves.filter(
          move => move.direction !== oppositeDir
        )
        
        if (filteredMoves.length > 0) {
          // Choose from forward/side moves
          finalMove = filteredMoves[
            Math.floor(Math.random() * filteredMoves.length)
          ]
        } else {
          // Forced to go back (only option)
          finalMove = possibleMoves[0]
        }
        
      } else {
        // FALLBACK: Default to random if personality unknown
        finalMove = possibleMoves[
          Math.floor(Math.random() * possibleMoves.length)
        ]
      }
    }
      
      // ===== CHECK IF ANOTHER GHOST IS THERE ===== //
      const isOccupied = newGhosts.some((otherGhost, otherIndex) => {
        //  Check ONLY already moved spirits (lower index)
        if (otherIndex >= currentIndex) return false
        
        return otherGhost.x === finalMove.x && otherGhost.y === finalMove.y
      })
      
      if (isOccupied) {
        // Go through ALL possible moves
        for (const move of possibleMoves) {
          // Is THIS move available?
          const moveIsOccupied = newGhosts.some((otherGhost) => {
            return otherGhost.x === move.x && otherGhost.y === move.y
          })
          
          if (!moveIsOccupied) {
            // The available move found
            newGhosts.push({
            x: move.x,
            y: move.y,
            lastDirection: move.direction,
            personality: ghost.personality  // ← Preserve personality
          })
            break  // ← Breaf if found
          }
        }
        
        // No available move → stay in place
         if (newGhosts.length === currentIndex) {
          newGhosts.push(ghost)  // Stay in place
        }
      } else {
        newGhosts.push({  // Push 
          x: finalMove.x,
          y: finalMove.y,
          lastDirection: finalMove.direction,
          personality: ghost.personality  // ← Preserve personality
        })
      }
    } 

      // ===== CHECK COLLISION =====
      const hitGhost = newGhosts.some(
        ghost => ghost.x === pacmanPosition.x && ghost.y === pacmanPosition.y
      )
      
      if (hitGhost) {
        setLives(prev => {
          playDie()  // ← PLAY DIE SOUND
          setAnnouncement(`Hit by ghost! ${lives - 1} lives remaining`)  // ← Announce
          const newLives = prev - 1
          if (newLives <= 0) {
            setGameStatus('gameOver')
          }
          return newLives
        })
        setPacmanPosition({ x: 1, y: 1 })
      }
      
      return newGhosts
    })
  }, [GRID_SIZE, pacmanPosition, playDie, setAnnouncement, lives])

 // ===== GAME OVER ===== //
 //Restart the game
 const onRestart = () => {
  setLives(3)
  setScore(0)
  setGameStatus('playing')
  setPacmanPosition({ x: 1, y: 1 })
  setGhosts([
    { x: 6, y: 7, lastDirection: 'DOWN', personality: 'random' },
    { x: 7, y: 7, lastDirection: 'DOWN', personality: 'patrol' },
    { x: 8, y: 7, lastDirection: 'DOWN', personality: 'nervous' }
  ])
  setCoins(generateCoinsFromMaze())  // ← Generate new
  playStart() // ← PLAY START SOUND
}
 
  // Event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') movePacman('UP')
      if (event.key === 'ArrowDown') movePacman('DOWN')
      if (event.key === 'ArrowLeft') movePacman('LEFT')
      if (event.key === 'ArrowRight') movePacman('RIGHT')
    }
    
    window.addEventListener('keydown', handleKeyDown)
    
    // Cleanup - remove listener when unmounted
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [ movePacman])

  /** Random ghost movement */
  useEffect(() => {
    // When status = playing => move ghosts
    if (gameStatus !== 'playing') return
    
    const ghostInterval = setInterval(() => {
      moveGhosts()
    }, 500)
    
    return () => {
      clearInterval(ghostInterval)
    }
  }, [moveGhosts, gameStatus])

  if (gameStatus === 'playing') {
    return (
      <main 
        className="game"
        aria-label="Pac Maze – game screen"
      >
        <div 
          aria-live="assertive"  // Interrupts reading
          aria-atomic="true"
          className="visually-hidden"
        >
          {announcement}
        </div>
        {/* <h1 className="game-title">Pac Maze</h1> */}
         <header 
            className="game-hud"
            aria-label="Game heads-up display"
          >           
            <div 
              className="game-stats"
              aria-live="polite"
              aria-atomic="true"
            >

            <div className="game-score">
              <span className="visually-hidden">Current score: </span>
              Score: {score}
            </div>
            <Lives lives={lives} />
          </div>

        </header>
        <GameField
          pacmanPosition={pacmanPosition}
          coins={coins}
          ghosts={ghosts}
          gridSize={GRID_SIZE}
          maze={MAZE}
          />
      </main>
    ) }
  if (gameStatus === 'gameOver') {
      return (
        <GameOver 
        score={score} 
        onRestart={onRestart} 
        announcement={announcement}
      ></GameOver>
      )
  } 
  if (gameStatus === 'won') {
    return <WinScreen 
      score={score} 
      onRestart={onRestart} 
      announcement={announcement}

    />
  }

  const handleStart = () => {
    playStart() // ← PLAY START SOUND
    setGameStatus('playing') // ← START GAME
  }

  return (
    <StartScreen 
      onStart={handleStart} 
    />
  )
}

export default App