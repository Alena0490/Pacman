import { useState, useEffect, useCallback } from "react"
import GameField from "./components/GameField"
import StartScreen from "./components/StartScreen"
import GameOver from "./components/GameOver"
import WinScreen from "./components/WinScreen"
import Lives from "./components/Lives"
import { 
  MAZE, 
  generateDotsFromMaze, 
  canMoveInDirection 
} from './data/mazeData'
import type { Fruit, FruitType } from './data/FruitTypes'
import { 
  FRUIT_POINTS,
  // FRUIT_PROGRESSION,
  FRUIT_SPAWN_DOTS,
  FRUIT_TIMEOUT,
  FRUIT_SPAWN_POSITION 
} from './data/FruitTypes'
import { useSound, stopAllSounds } from "./hooks/useSound"
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import CherryImg from './img/cherries.png'
import StrawberryImg from './img/strawberry.svg'
import OrangeImg from './img/orange.svg'
import AppleImg from './img/apple.svg'
import MelonImg from './img/melon.svg'
import GalaxianImg from './img/galaxian.webp'
import "./App.css"

// Ghost type definition
type Ghost = {
  x: number
  y: number
  lastDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  personality: 'random' | 'patrol' | 'nervous' | 'shy'
}

type GameStatus = 'ready' | 'playing' | 'gameOver' | 'won'

/*** GHOST SPAWN - SAVE THE LAST POSITIONS */
const GHOST_SPAWNS: Ghost[] = [
  { x: 6, y: 7, lastDirection: 'DOWN', personality: 'random' },
  { x: 7, y: 7, lastDirection: 'DOWN', personality: 'nervous' },
  { x: 7, y: 5, lastDirection: 'DOWN', personality: 'patrol' },
  { x: 8, y: 7, lastDirection: 'DOWN', personality: 'shy' },
]

const App = () => {
// ===== GAME STATE ===== //
  const [gameStatus, setGameStatus] = useState<GameStatus>('ready')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [isPacmanDying, setIsPacmanDying] = useState(false)
  const GRID_SIZE = 15
  const [announcement, setAnnouncement] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  
  // ===== POSITION ===== //
  const [pacmanPosition, setPacmanPosition] = useState({ x: 7, y: 11 })
  const [ghosts, setGhosts] = useState<Ghost[]>(GHOST_SPAWNS)

  // ===== EATEN GHOSTS (returning to spawn) ===== //
  const [eatenGhosts, setEatenGhosts] = useState<number[]>([])  // Array of ghost indices

  // ===== FRIGHTENED MODE ===== //
  const [isFrightened, setIsFrightened] = useState(false)
  const [frightenedTimer, setFrightenedTimer] = useState<number | null>(null)
  const [ghostsEatenCount, setGhostsEatenCount] = useState(0)

  // ===== FLOATING SCORE POPUPS ===== //
  const [floatingScores, setFloatingScores] = useState<Array<{
    x: number
    y: number
    points?: number    // ← Optional (?)
    text?: string      // ← Optional
    id: number
  }>>([])

  // ===== DOTS STATE ===== //
  const [dots, setDots] = useState(() => generateDotsFromMaze())

  // ===== POWER PELLETS STATE ===== //
  const [powerPellets, setPowerPellets] = useState<{x: number, y: number}[]>([
    { x: 0, y: 0 },    // Top left
    { x: 14, y: 0 },   // Top right
    { x: 0, y: 14 },   // Bottom left
    { x: 14, y: 14 }   // Bottom right
  ])

 // ===== LEVEL ===== //
  const [level, setLevel] = useState(1)

  // Create sound players
  const playEating = useSound("/sounds/pac-man-waka-waka.mp3")
  const playDie = useSound("/sounds/audio_die.mp3")
  const playWon = useSound("/sounds/audio_victory.mp3")
  const playStart = useSound("/sounds/audio_opening_song.mp3")
  const playEatGhost = useSound("/sounds/audio_eatghost.mp3")
  const playFrightened = useSound("/sounds/audio_intermission.mp3")
  const playEatPellet = useSound("/sounds/audio_eatpill.mp3")
  const playEatFruit = useSound("../public/sounds/pacman_eatfruit.wav")

  // ===== FRUITS ===== //
const [fruit, setFruit] = useState<Fruit>({
  type: null,
  position: null,
  spawnTime: null
})

// Level-specific fruit pairs
// Based on limited documentation - each level spawns 2 specific fruits
// May need adjustment if more official spawn data is found
const LEVEL_FRUITS: [FruitType, FruitType][] = [
  ['cherry', 'strawberry'],    // Level 1
  ['orange', 'apple'],          // Level 2  
  ['melon', 'galaxian'],        // Level 3
  ['cherry', 'melon'],          // Level 4
  ['strawberry', 'galaxian']    // Level 5
]

// ===== TESTING ===== //

// const [fruit, setFruit] = useState<Fruit>({
//   type: 'cherry',  // ← Změň na: cherry, strawberry, orange, apple, melon, galaxian
//   position: FRUIT_SPAWN_POSITION,
//   spawnTime: Date.now()
// })
// ===== END TESTING ===== //

const [fruitIndex, setFruitIndex] = useState(0)
const currentLevelFruits = LEVEL_FRUITS[level - 1]

const spawnFruit = useCallback((fruitType: FruitType) => {
  setFruit({
    type: fruitType,
    position: FRUIT_SPAWN_POSITION,
    spawnTime: Date.now()
  })
}, []) 

  // ===== LEVEL UP ===== //
  const levelUp = useCallback(() => {
    // Increase level
    setLevel(prev => prev + 1)
    // Stop current souds
    stopAllSounds()
    // Play start for the new level
    playStart(isMuted)

    // Set level fruits
    setFruitIndex(0)
    
    // Respawn dots
    setDots(generateDotsFromMaze())
    
    // Respawn power pellets
    setPowerPellets([
      { x: 0, y: 0 },
      { x: 14, y: 0 },
      { x: 0, y: 14 },
      { x: 14, y: 14 }
    ])
    
  // Reset positions
  setPacmanPosition({ x: 7, y: 11 })
  setGhosts(GHOST_SPAWNS)
  setEatenGhosts([])
  
  // Reset fruit
  setFruit({ type: null, position: null, spawnTime: null })
  
  // Reset frightened
  setIsFrightened(false)
  if (frightenedTimer) clearTimeout(frightenedTimer)
  setFrightenedTimer(null)
  setGhostsEatenCount(0)
  
  // Show message
  setFloatingScores([{
    x: 7,
    y: 7,
    text: 'LEVEL UP!',
    id: Date.now()
  }])
  
  setTimeout(() => setFloatingScores([]), 2000)
}, [frightenedTimer, playStart, isMuted]) 

  // ===== MOVE PACMAN ===== //
  const movePacman = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    // ===== CHECK IF MOVE IS VALID ===== //
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

    // ===== COLLECTING DOTS AND FRUITS ===== //
    const hasDot = dots.some(dot => dot.x === newX && dot.y === newY)
    // V movePacman, PŘED "if (hasDot)" check:

  // 🍒 FRUIT COLLISION
  if (fruit.position && newX === fruit.position.x && newY === fruit.position.y) {
    const points = FRUIT_POINTS[fruit.type!] 
    
    setScore(prev => prev + points)
    playEatFruit(isMuted)

    // Floating score popup
    setFloatingScores(prev => [...prev, {
      x: newX,
      y: newY,
      points: points,
      id: Date.now()
    }])
    
    setTimeout(() => {
      setFloatingScores(prev => prev.slice(1))
    }, 1200)
    
    // Remove fruit
    setFruit({ type: null, position: null, spawnTime: null })
    
    setAnnouncement(`Fruit collected! +${points} points!`)
  }

    if (hasDot) {
      const newDots = dots.filter(dot => {
        return !(dot.x === newX && dot.y === newY)
      })
      setDots(newDots)
      setScore(score + 10)
 
      playEating(isMuted)  // ← PLAY EATING SOUND
      setAnnouncement(`Dot collected. Score: ${score + 10}`)  // ← Announce

      // 🍒 FRUIT SPAWN:
      const totalDots = 181
      const dotsEaten = totalDots - newDots.length
      
      // First spawn after 70 dots collected
      if (dotsEaten === FRUIT_SPAWN_DOTS.first && !fruit.type) {
        spawnFruit(currentLevelFruits[0])  // ← First level fruit
      }

      // Second spawn after 170 dots collected
      if (dotsEaten === FRUIT_SPAWN_DOTS.second && !fruit.type) {
        spawnFruit(currentLevelFruits[1])  // ← Second level fruit
      }

      //Check the win/ level up
      if (newDots.length === 0) {
        if (level < 5) {  // ← LEVEL UP
          // Level up!
          levelUp()
        } else { // ← WIN - SHOW WIN SCREEN
          // Final win
          playWon(isMuted)
          setGameStatus('won')
        }
      }
    }

    // ===== COLLECTING POWER PELLETS ===== //
    const hasPowerPellet = powerPellets.some(
      pellet => pellet.x === newX && pellet.y === newY
    )

    if (hasPowerPellet && !isFrightened) {
      // Remove this power pellet
      setPowerPellets(prev => 
        prev.filter(pellet => !(pellet.x === newX && pellet.y === newY))
      )
      setScore(score + 50)
      setIsFrightened(true)
      setGhostsEatenCount(0) // Reset count when new Power Pellet is eaten
      playEatPellet(isMuted)
        
        // Clear existing timer if any
        if (frightenedTimer) {
          clearTimeout(frightenedTimer)
        }
      
        // Set 8 second timer
        const timer = setTimeout(() => {
          setIsFrightened(false)
          setGhostsEatenCount(0)  // ← RESET when frightened mode ends
        }, 8000)  // 8 seconds
        
        setFrightenedTimer(timer)
        
          // ✅ Wait 400 ms then frightened sound:
          setTimeout(() => {
            playFrightened(isMuted)
          }, 400)  // Delay = eatPellet sound length
      
        setAnnouncement('Power pellet! Ghosts are scared!')
      }

    // ===== GHOST COLLISION ===== //
    const collidedIndex = ghosts.findIndex(
      ghost => ghost.x === newX && ghost.y === newY
    )

    /*** EATING GOSTS */ 
    if (collidedIndex !== -1) {
      const isAlreadyEaten = eatenGhosts.includes(collidedIndex) // Check if the ghost is already eaten

      // If ghosts are frightened - eat the ghost
      if (isFrightened && !isAlreadyEaten) {
        playEatGhost(isMuted)

        // Calculate points: 200, 400, 800, 1600
        const points = 200 * Math.pow(2, ghostsEatenCount)  // ← 200 * 2^n
        
        /*** POP UP SCREEN */ 
          // Add floating score popup
          setFloatingScores(prev => [
            ...prev,
            {
              x: newX,
              y: newY,
              points: points,
              id: Date.now()  // Unique ID
            }
          ])
          
          // Remove popup after animation (1 second)
          setTimeout(() => {
            setFloatingScores(prev => prev.slice(1))  // Remove first (oldest)
          }, 1200)

      // After eating the ghost -> increase the score
      setScore(prev => {
          const newScore = prev + points
          setAnnouncement(`Ghost eaten! +${points} points! Score: ${newScore}`) // Double the received points after each ghost eaten
          return newScore
        })
        // Send the eaten ghost back to the spawn position
        setGhostsEatenCount(prev => prev + 1)  // ← Increment counter
        setEatenGhosts(prev => [...prev, collidedIndex])

       } else if (!isAlreadyEaten) {  
        // Normal ghost - lose life
        setIsPacmanDying(true) // ← START death animation
        playDie(isMuted)

        // ⏱️ WAIT 1s (death animation), THEN teleport
        setTimeout(() => {
          setIsPacmanDying(false)  // ← END death animation
          setPacmanPosition({ x: 7, y: 11 })

          const remainingLives = lives - 1
          setAnnouncement(`Hit by ghost! ${remainingLives} lives remaining`)
          setLives(remainingLives)
        
          if (remainingLives <= 0) {
            setFloatingScores([])
            setGameStatus('gameOver')  
            setLevel(1)
            setLives(3)
          } else {
          // Show "READY!" after death (only if lives remain)
            setTimeout(() => {
              setFloatingScores([{
                x: 7,
                y: 7,
                text: 'READY!',
                id: Date.now()
              }])
              
              setTimeout(() => {
                setFloatingScores([])
              }, 2000)
            }, 300) // respawn
          }
        }, 1500)  // ← 1.5 s for death animation
      }
  }},[
        pacmanPosition,
        dots,
        powerPellets,  
        score,
        ghosts,
        eatenGhosts,
        lives,
        GRID_SIZE,
        playEating,
        playWon,
        playDie,
        playEatGhost,
        ghostsEatenCount,
        playFrightened,
        playEatPellet,
        playEatFruit,
        isFrightened,
        frightenedTimer,
        isMuted,
        // fruitIndex,
        fruit.type,
        fruit.position,
        spawnFruit,
        level,
        levelUp,
        currentLevelFruits,
      ])
  
  /*** 1. Cleanup frightened timer on unmount */
  useEffect(() => {
    return () => {
      if (frightenedTimer) {
        clearTimeout(frightenedTimer)
      }
    }
  }, [frightenedTimer])

  // ===== GHOSTS MOVE =====//
  const moveGhosts = useCallback(() => {

    // ===== MOVE EATEN GHOSTS (eyes) BACK TO SPAWN ===== //
    setEatenGhosts(prevEaten => {
      const stillReturning: number[] = []

      prevEaten.forEach(ghostIndex => {
        const ghost = ghosts[ghostIndex]
        const spawn = GHOST_SPAWNS[ghostIndex]

        // Check if ghost reached spawn
        if (ghost.x === spawn.x && ghost.y === spawn.y) {
          // Ghost is home - respawn normally
          // Don't add to stillReturning (remove from eatenGhosts)
        } else {
          // Move toward spawn (simple pathfinding)
          setGhosts(prevGhosts => {
            const updated = [...prevGhosts]
            const current = updated[ghostIndex]

            // Move horizontally first, then vertically
            if (current.x < spawn.x) {
              updated[ghostIndex] = {
                 ...current, 
                x: current.x + 1, 
                lastDirection: 'RIGHT' 
              }
            } else if (current.x > spawn.x) {
              updated[ghostIndex] = { 
                ...current, 
                x: current.x - 1, 
                lastDirection: 'LEFT' 
              }
            } else if (current.y < spawn.y) {
              updated[ghostIndex] = { 
                ...current, 
                y: current.y + 1, 
                lastDirection: 'DOWN' 
              }
            } else if (current.y > spawn.y) {
              updated[ghostIndex] = { 
                ...current, 
                y: current.y - 1, 
                lastDirection: 'UP' 
              }
            }

            return updated
          })

          stillReturning.push(ghostIndex)
        }
      })

      return stillReturning
    })

    // ===== NORMAL GHOST MOVEMENT ===== //
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

      } else if (ghost.personality === 'shy') { 
      // SHY: Gets scared when close to Pacman
        const distanceToPacman = Math.abs(ghost.x - pacmanPosition.x) + 
                                Math.abs(ghost.y - pacmanPosition.y)
        
        if (distanceToPacman <= 3) {
        // Too close! Run away
          const awayMoves = possibleMoves.filter(move => {
            const newDistance = Math.abs(move.x - pacmanPosition.x) + 
                              Math.abs(move.y - pacmanPosition.y)
            return newDistance > distanceToPacman
          })
          
          if (awayMoves.length > 0) {
            finalMove = awayMoves[
              Math.floor(Math.random() * awayMoves.length)
            ]
          } else {
            finalMove = possibleMoves[
              Math.floor(Math.random() * possibleMoves.length)
            ]
          }
        } else {
          // Far enough → random
          finalMove = possibleMoves[
            Math.floor(Math.random() * possibleMoves.length)
          ]
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
            break  // ← Break if found
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

    // ===== CHECK COLLISION ===== //
    const collidedIndex = newGhosts.findIndex(
      ghost => ghost.x === pacmanPosition.x && ghost.y === pacmanPosition.y
    )

    if (collidedIndex !== -1) {
      const isAlreadyEaten = eatenGhosts.includes(collidedIndex)  

      if (isFrightened&& !isAlreadyEaten) {
        // Pacman eats the ghost
        playEatGhost(isMuted)
        const points = 200 * Math.pow(2, ghostsEatenCount)  // ← 200 * 2^n

        const ghost = newGhosts[collidedIndex]
        
         /*** POP UP SCREEN */ 
        // Add floating score popup
        setFloatingScores(prev => [
          ...prev,
          {
            x: ghost.x,
            y: ghost.y,
            points: points,
            id: Date.now()
          }
        ])
        
        setTimeout(() => {
          setFloatingScores(prev => prev.slice(1))
        }, 1000)

        setScore(prev => {
          const newScore = prev + points
          setAnnouncement(`Ghost eaten! +${points} points! Score: ${newScore}`)
          return newScore
        })

        // Set ghost to the spawn position
        setGhostsEatenCount(prev => prev + 1)  // ← Increment
        setEatenGhosts(prev => [...prev, collidedIndex])

       } else if (!isAlreadyEaten) { 
        // Normal state → Pacman dies
        setIsPacmanDying(true)  
        playDie(isMuted)
        
        setTimeout(() => {  // ← adding timeout
          setIsPacmanDying(false)
          setPacmanPosition({ x: 7, y: 11 })
          
          setLives(prev => {
            const newLives = prev - 1
            setAnnouncement(`Hit by ghost! ${newLives} lives remaining`)
            if (newLives <= 0) {
              setGameStatus('gameOver')
              setLevel(1)
              setLives(3)
            }
            return newLives
          })
        }, 1200)  // ← 1.2s pro animaci
      }
    }
          
      return newGhosts
    })
  }, [
        GRID_SIZE,
        pacmanPosition,
        isFrightened,
        eatenGhosts,
        playDie,
        playEatGhost,
        ghosts,
        ghostsEatenCount,
        isMuted,
      ])

  // ===== GHOSTS SPEED =====//
  useEffect(() => {
  if (gameStatus !== 'playing') return
  
  // Calculate speed based on level
  const baseSpeed = 500  // Level 1
  const speedIncrease = 50  // Speed increase 50ms per level
  const maxSpeed = 200  // Maximum speed
  
  const ghostSpeed = Math.max(baseSpeed - (level - 1) * speedIncrease, maxSpeed)
  // Level 1: 500ms
  // Level 2: 450ms
  // Level 3: 400ms
  // Level 4: 350ms
  // Level 5: 300ms
  
  const ghostInterval = setInterval(() => {
    moveGhosts()
  }, ghostSpeed)  // ← Use calculated speed
  
  return () => {
    clearInterval(ghostInterval)
  }
}, [moveGhosts, gameStatus, level]) 

// ===== GAME OVER ===== //
//Restart the game
const onRestart = () => {
  setLives(3)
  setScore(0)
  setGameStatus('playing')
  setPacmanPosition({ x: 7, y: 11 })
  setGhosts(GHOST_SPAWNS)
  setEatenGhosts([]) 
  setFruit({ type: null, position: null, spawnTime: null })
  setFruitIndex(0)  
  setDots(generateDotsFromMaze())  // ← Generate new dots
  // Reset power pellets
  setPowerPellets([
    { x: 0, y: 0 },
    { x: 14, y: 0 },
    { x: 0, y: 14 },
    { x: 14, y: 14 }
  ])
  // Reset frightened mode
  setIsFrightened(false)            // ← Remove frightened mode
    if (frightenedTimer) {             // ← Reset timer
      clearTimeout(frightenedTimer)
    }
  setFrightenedTimer(null)   
  setGhostsEatenCount(0) 
  // Show "READY!" message
  setFloatingScores([{
    x: 7,
    y: 7,
    text: 'READY!',
    id: Date.now()
  }])
  
  setTimeout(() => {
    setFloatingScores([])
  }, 2000)
  playStart(isMuted) // ← PLAY START SOUND
}
 
  /*** 2. Event listener */
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

  /** 3. Random ghost movement */
  useEffect(() => {
    // When status = playing => move ghosts
    if (gameStatus !== 'playing') return
    
    const ghostInterval = setInterval(() => {
      moveGhosts()
    }, 500)
    
    return () => {
      clearInterval(ghostInterval)
    }
  }, [
      moveGhosts, 
      gameStatus
    ])

  /*** 4. FRUIT TIMEOUT */
  useEffect(() => {
    if (!fruit.spawnTime) return
    
    const timeout = setTimeout(() => {
      setFruit({ type: null, position: null, spawnTime: null })
    }, FRUIT_TIMEOUT)
    
    return () => clearTimeout(timeout)
  }, [fruit.spawnTime])

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

            <div className="level">
              <span className="visually-hidden">Current level: </span>
              Level: {level}
            </div>
            <button 
              className="mute"
              onClick={() => {
                setIsMuted(!isMuted)
                stopAllSounds()
              }}
            >
              {isMuted ? <HiSpeakerXMark /> : <HiSpeakerWave />}
            </button>
          </div>
        </header>
        <GameField
          pacmanPosition={pacmanPosition}
          dots={dots}
          powerPellets={powerPellets} 
          ghosts={ghosts}
          gridSize={GRID_SIZE}
          maze={MAZE}
          isFrightened={isFrightened}
          eatenGhosts={eatenGhosts}
          floatingScores={floatingScores}
          isPacmanDying={isPacmanDying}
          fruit={fruit}
          />
          <div className="bottom-menu">
            <Lives lives={lives} />
            <div className="level-fruits">
                {level >= 1 && <img src={CherryImg} alt="level 1"/>}
                {level >= 2 && <img src={StrawberryImg} alt="level 2"/>}
                {level >= 3 && <img src={OrangeImg} alt="level 3"/>}
                {level >= 4 && <img src={OrangeImg} alt="level 4"/>}
                {level >= 5 && <img src={AppleImg} alt="level 5"/>}
                {level >= 6 && <img src={AppleImg} alt="level 6"/>}
                {level >= 7 && <img src={MelonImg} alt="level 7"/>}
                {level >= 8 && <img src={MelonImg} alt="level 8"/>}
                {level >= 9 && <img src={GalaxianImg} alt="level 1"/>}
                {level >= 10 && <img src={GalaxianImg} />}
            </div>
          </div>
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
    playStart(isMuted) // ← PLAY START SOUND
    setGameStatus('playing') // ← START GAME

    // Show "READY!" message
    setFloatingScores([{
      x: 7,           // Middle of the labyrinth
      y: 7,           // Middle of the labyrinth
      text: 'READY!',
      id: Date.now()
    }])
    
    // Remove after 2 seconds
    setTimeout(() => {
      setFloatingScores([])
    }, 2000)
  }

  return (
    <StartScreen 
      onStart={handleStart} 
    />
  )
}

export default App