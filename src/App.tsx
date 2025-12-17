// ===== MAIN APP COMPONENT ===== //
// Core game logic - handles Pac-Man movement, ghost AI, collisions, scoring, and game states
// Manages sound effects, level progression, and screen transitions

import { useState, useEffect, useCallback } from "react"

// ===== COMPONENTS ===== //
import GameField from "./components/GameField"
import StartScreen from "./components/StartScreen"
import GameOver from "./components/GameOver"
import WinScreen from "./components/WinScreen"
import Lives from "./components/Lives"

// ===== DATA & TYPES ===== //
import { 
  MAZE, 
  generateDotsFromMaze, 
  canMoveInDirection 
} from './data/mazeData'
import type { Fruit, FruitType } from './data/FruitTypes'
import { 
  FRUIT_POINTS,
  FRUIT_SPAWN_DOTS,
  FRUIT_TIMEOUT,
  FRUIT_SPAWN_POSITION 
} from './data/FruitTypes'
import {
  findPossibleMoves,
  calculateGhostMove
} from './utils/ghostAI'
import { 
  GRID_SIZE, 
  GHOST_SPAWNS, 
  SCATTER_TARGETS,
  POWER_PELLET_POSITIONS,
  // GHOST_SPEED_CONFIG,
  INVINCIBILITY_DURATION,
  // FRIGHTENED_DURATION,
  PACMAN_SPAWN,
  LEVEL_FRUITS,
  type Ghost,
  type GameStatus
} from './data/gameConstants'

// ===== HOOKS ===== //
import { useSound, stopAllSounds } from "./hooks/useSound"
import { useGhostBehavior } from './hooks/useGhostBehavior'

// ===== ICONS & IMAGES ===== //
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import CherryImg from './img/cherries.png'
import StrawberryImg from './img/strawberry.svg'
import OrangeImg from './img/orange.svg'
import AppleImg from './img/apple.svg'
import MelonImg from './img/melon.svg'
import GalaxianImg from './img/galaxian.webp'

// ===== STYLES ===== //
import "./App.css"

const App = () => {
  // ===== CORE GAME STATE ===== //
  const [gameStatus, setGameStatus] = useState<GameStatus>('ready')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [nextExtraLifeAt, setNextExtraLifeAt] = useState(10000)
  const [isInvincible, setIsInvincible] = useState(false) // Post-death invincibility
  const [isPacmanDying, setIsPacmanDying] = useState(false) // Death animation active
  const [highScore, setHighScore] = useState(0)
  const [announcement, setAnnouncement] = useState('') // Screen reader announcements
  const [isMuted, setIsMuted] = useState(false)

  // ===== COLLECTIBLES STATE ===== //
  const [dots, setDots] = useState(() => generateDotsFromMaze())
  const [powerPellets, setPowerPellets] = useState<{x: number, y: number}[]>(POWER_PELLET_POSITIONS)
  
  // ===== POSITIONS ===== //
  const [pacmanPosition, setPacmanPosition]  = useState(PACMAN_SPAWN)
  const [ghosts, setGhosts] = useState<Ghost[]>(GHOST_SPAWNS)

  // ===== GHOST BEHAVIOR ===== //
  const [eatenGhosts, setEatenGhosts] = useState<number[]>([]) // Ghosts returning to spawn

  // ===== LEVEL PROGRESSION ===== //
  const [level, setLevel] = useState(1)
  const [isIntroPlaying, setIsIntroPlaying] = useState(false)

  // ===== FRIGHTENED MODE ===== //
  const [isFrightened, setIsFrightened] = useState(false)
  const [frightenedTimer, setFrightenedTimer] = useState<number | null>(null)
  const [ghostsEatenCount, setGhostsEatenCount] = useState(0) // Multiplier for ghost points
  
  // ===== GHOST BEHAVIOR HOOK ===== //
  // Manages ghost AI, release timing, scatter/chase modes, and Cruise Elroy
  const { 
    ghostBehavior, 
    ghostsReleased, 
    isGateVisible, 
    frightenedTimeRemaining, 
    setFrightenedTimeRemaining,
    ghostSpeed,
    blinkySpeed,
    moveBlinky,
    frightenedDuration
  } = useGhostBehavior(
    isFrightened,
    gameStatus,
    level,
    dots.length
  )

  // ===== FLOATING SCORE POPUPS ===== //
  // Display score points and messages (READY!, LEVEL UP!) above grid
  const [floatingScores, setFloatingScores] = useState<Array<{
    x: number
    y: number
    points?: number    // Score value (200, 400, 800, 1600)
    text?: string      // Text message (READY!, LEVEL UP!)
    id: number
  }>>([])

  // ===== SOUND EFFECTS ===== //
  // Initialize all game sound players
  const { play: playEating }  = useSound("/sounds/pac-man-waka-waka.mp3")
  const { play: playDie }  = useSound("/sounds/audio_die.mp3")
  const { play: playWon }  = useSound("/sounds/audio_victory.mp3")
  const { play: playStart }  = useSound("/sounds/audio_opening_song.mp3")
  const { play: playEatGhost}  = useSound("/sounds/audio_eatghost.mp3")
  const { play: playFrightened }  = useSound("/sounds/audio_intermission.mp3")
  const { play: playEatPellet }  = useSound("/sounds/audio_eatpill.mp3")
  const { play: playEatFruit }  = useSound("/sounds/pacman_eatfruit.wav")
  const { play: playExtraLife }  = useSound("/public/sounds/audio_extra lives.mp3")
  const { play: playSiren1, stop: stopSiren1 }  = useSound("/sounds/Voicy_Ghost Siren sound.mp3", { loop: true })
  const { play: playSiren2, stop: stopSiren2 } = useSound("/sounds/Voicy_Ghost Siren sound2.mp3", { loop: true })
  const { play: playGhostRetreat }  = useSound("/sounds/ghost-retreat.mp3")

// ===== FRUIT SYSTEM ===== //
const [fruit, setFruit] = useState<Fruit>({
  type: null,
  position: null,
  spawnTime: null
})

// Get fruit types for current level
const currentLevelFruits = LEVEL_FRUITS[level - 1]

// Spawn fruit at designated position
const spawnFruit = useCallback((fruitType: FruitType) => {
  setFruit({
    type: fruitType,
    position: FRUIT_SPAWN_POSITION,
    spawnTime: Date.now()
  })
}, []) 

  // ===== HIGH SCORE MANAGEMENT ===== //
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('highScore')
    if (saved) setHighScore(parseInt(saved))
  }, [])

  // Save to localStorage when score increases
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('highScore', score.toString())
    }
  }, [score, highScore])

  // ===== LEVEL UP TRANSITION ===== //
  const levelUp = useCallback(() => {
    // Increase level
    setLevel(prev => prev + 1)
    // Stop all current souds
    stopAllSounds()

    // Play intro sequence
    setIsIntroPlaying(true) 
    playStart(isMuted)
    setGameStatus('playing')
    
    // End intro after 4 seconds
    setTimeout(() => {
      setIsIntroPlaying(false)
    }, 4000)
 
    // Respawn all collectibles
    setDots(generateDotsFromMaze())
    setPowerPellets(POWER_PELLET_POSITIONS)
    
    // Reset positions
    setPacmanPosition(PACMAN_SPAWN)
    setGhosts(GHOST_SPAWNS)
    setEatenGhosts([])
    
    // Clear fruit
    setFruit({ type: null, position: null, spawnTime: null })
    
    // Reset frightened mode
    setIsFrightened(false)
    if (frightenedTimer) clearTimeout(frightenedTimer)
    setFrightenedTimer(null)
    setGhostsEatenCount(0)
    
    // Show level up message
    setFloatingScores([{
      x: 7,
      y: 7,
      text: 'LEVEL UP!',
      id: Date.now()
    }])
    
  setTimeout(() => setFloatingScores([]), 2000)
}, [frightenedTimer, playStart, isMuted]) 

// ===== EXTRA LIFE SYSTEM ===== //
// Award extra life every 10,000 points
useEffect(() => {
  if (score >= nextExtraLifeAt) {
    setLives(prev => prev + 1)
    setNextExtraLifeAt(prev => prev + 10000) // Set next threshold
    setAnnouncement('Extra life! 10,000 points reached!')
    playExtraLife(isMuted)
  }
}, [score, nextExtraLifeAt, isMuted, playExtraLife])

// ===== SIREN SOUND MANAGEMENT ===== //
// Switch between scatter and chase sirens based on game state
useEffect(() => {
  // Stop sirens if game not active or Pac-Man is dying
  if (gameStatus !== 'playing' || isPacmanDying) {
    stopSiren1()
    stopSiren2()
    return
  }

  // Stop sirens during frightened mode
  if (isFrightened) {
    stopSiren1()
    stopSiren2()
    return
  }

  // Delay siren start during intro (wait for start sound ~4s)
  const delay = isIntroPlaying ? 4000 : 0

  const sirenStartDelay = setTimeout(() => {
    if (ghostBehavior === 'scatter') {
      stopSiren2()  // Stop chase siren
      playSiren1(isMuted)
    } else if (ghostBehavior === 'chase') {
      stopSiren1()  // Stop scatter siren
      playSiren2(isMuted)
    }
  }, delay)

  return () => {
    clearTimeout(sirenStartDelay)
    stopSiren1()
    stopSiren2()
  }
}, [gameStatus, isFrightened, isPacmanDying, ghostBehavior, isMuted, playSiren1, playSiren2, stopSiren1, stopSiren2,isIntroPlaying])

  // ===== PAC-MAN MOVEMENT LOGIC ===== //
  // Handles movement, collision detection, dot/fruit/pellet collection, and ghost interactions
  const movePacman = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    
    // ===== VALIDATE MOVEMENT ===== //
    // Check if Pac-Man can move in requested direction
    if (!canMoveInDirection(
      MAZE, 
      pacmanPosition.x, 
      pacmanPosition.y, 
      direction as 'UP' | 'DOWN' | 'LEFT' | 'RIGHT',
      GRID_SIZE
    )) {

    // ===== TUNNEL TELEPORTATION ===== //
    const currentCell = MAZE[pacmanPosition.y][pacmanPosition.x]
      
      // Teleport to opposite side if exiting through tunnel
      if (currentCell.tunnel === 'left' && direction === 'LEFT') {
        setPacmanPosition(prev => ({ x: GRID_SIZE - 1, y: prev.y }))
        return
      } else if (currentCell.tunnel === 'right' && direction === 'RIGHT') {
        setPacmanPosition(prev => ({ x: 0, y: prev.y }))
        return
      }

      return  // Blocked by wall or border
    }
   
    // ===== CALCULATE NEW POSITION ===== //
    let newX = pacmanPosition.x
    let newY = pacmanPosition.y
    
    if (direction === 'UP') newY -= 1
    if (direction === 'DOWN') newY += 1
    if (direction === 'LEFT') newX -= 1
    if (direction === 'RIGHT') newX += 1
        
    setPacmanPosition({ x: newX, y: newY })

  // ===== FRUIT COLLECTION ===== //
  if (fruit.position && newX === fruit.position.x && newY === fruit.position.y) {
    const points = FRUIT_POINTS[fruit.type!] 
    
    setScore(prev => prev + points)
    playEatFruit(isMuted)

    // Show floating score popup
    setFloatingScores(prev => [...prev, {
      x: newX,
      y: newY,
      points: points,
      id: Date.now()
    }])
    
    setTimeout(() => {
      setFloatingScores(prev => prev.slice(1))
    }, 1200)
    
    // Remove collected fruit
    setFruit({ type: null, position: null, spawnTime: null })
    
    setAnnouncement(`Fruit collected! +${points} points!`)
  }

  // ===== DOT COLLECTION ===== //
  const hasDot = dots.some(dot => dot.x === newX && dot.y === newY)

    if (hasDot) {
      // Remove collected dot
      const newDots = dots.filter(dot => {
        return !(dot.x === newX && dot.y === newY)
      })
      setDots(newDots)
      setScore(score + 10)
 
      playEating(isMuted)
      setAnnouncement(`Dot collected. Score: ${score + 10}`)
      

      // ===== FRUIT SPAWN TRIGGERS ===== //
      const totalDots = 181
      const dotsEaten = totalDots - newDots.length
      
      // First fruit spawns after 70 dots eaten
      if (dotsEaten === FRUIT_SPAWN_DOTS.first && !fruit.type) {
        spawnFruit(currentLevelFruits[0])
      }

      // Second fruit spawns after 170 dots eaten
      if (dotsEaten === FRUIT_SPAWN_DOTS.second && !fruit.type) {
        spawnFruit(currentLevelFruits[1])
      }

      // ===== LEVEL COMPLETION CHECK ===== //
      if (newDots.length === 0) {
        if (level < 5) { 
          // Advance to next level
          levelUp()
        } else {
          // Final victory - show win screen after level 5
          playWon(isMuted)
          setGameStatus('won')
        }
      }
    }

    // ===== POWER PELLET COLLECTION ===== //
    const hasPowerPellet = powerPellets.some(
      pellet => pellet.x === newX && pellet.y === newY
    )

    if (hasPowerPellet && !isFrightened) {
      // Remove collected power pellet
      setPowerPellets(prev => 
        prev.filter(pellet => !(pellet.x === newX && pellet.y === newY))
      )
      setScore(score + 50)
      setIsFrightened(true)
      setGhostsEatenCount(0) // Reset ghost eating multiplier
      playEatPellet(isMuted)

      setFrightenedTimeRemaining(frightenedDuration)
      
      // Clear existing frightened timer if any
      if (frightenedTimer) {
        clearTimeout(frightenedTimer)
      }
    
      // Set duration timer (varies by level: 8s, 7s, 6s, 5s, 3s)
      const timer = setTimeout(() => {
        setIsFrightened(false)
        setGhostsEatenCount(0) 
        setFrightenedTimeRemaining(0) 
      }, frightenedDuration)

      setFrightenedTimer(timer)
      
    // Play frightened sound after pellet sound finishes
    setTimeout(() => {
      playFrightened(isMuted)
    }, 400)
    
      setAnnouncement('Power pellet! Ghosts are scared!')
    }

    // ===== GHOST COLLISION DETECTION ===== //
    const collidedIndex = ghosts.findIndex(
      ghost => ghost.x === newX && ghost.y === newY
    )

    if (collidedIndex !== -1 && !isInvincible) { 
      const isAlreadyEaten = eatenGhosts.includes(collidedIndex) 

      // ----- FRIGHTENED MODE: EAT GHOST ----- //
      if (isFrightened && !isAlreadyEaten) {
        playEatGhost(isMuted)

        // Calculate points with multiplier: 200, 400, 800, 1600
        const points = 200 * Math.pow(2, ghostsEatenCount)
        
        // Show floating score popup
        setFloatingScores(prev => [
          ...prev,
          {
            x: newX,
            y: newY,
            points: points,
            id: Date.now()
          }
        ])
        
        // Remove popup after animation
        setTimeout(() => {
          setFloatingScores(prev => prev.slice(1))
        }, 1200)

      // Update score
      setScore(prev => {
          const newScore = prev + points
          setAnnouncement(`Ghost eaten! +${points} points! Score: ${newScore}`) // Double the received points after each ghost eaten
          return newScore
        })
        
        // Send ghost back to spawn
        setGhostsEatenCount(prev => prev + 1)
        setEatenGhosts(prev => [...prev, collidedIndex])

        // Play retreat sound after gulp sound
        setTimeout(() => {
          playGhostRetreat(isMuted)  
        }, 500)

       // ----- NORMAL MODE: LOSE LIFE ----- //
       } else if (!isAlreadyEaten) {  
        setIsPacmanDying(true)
        setIsInvincible(true) // Prevent double death
        playDie(isMuted)

        // Wait for death animation, then respawn
        setTimeout(() => {
          setIsPacmanDying(false)
          setPacmanPosition(PACMAN_SPAWN)

          // Deactivate invincibility after respawn delay
          setTimeout(() => {
            setIsInvincible(false)
          }, INVINCIBILITY_DURATION)

          const remainingLives = lives - 1
          setAnnouncement(`Hit by ghost! ${remainingLives} lives remaining`)
          setLives(remainingLives)
        
          if (remainingLives <= 0) {
            // Game over
            setFloatingScores([])
            setGameStatus('gameOver')  
            setLevel(1)
            setLives(3)
          } else {
          // Show "READY!" message after respawn
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
        }, 1500)  // Death animation duration
      }
    }
  }, [
    // Position and collision data
    pacmanPosition,
    dots,
    powerPellets,  
    score,
    ghosts,
    eatenGhosts,
    lives,
    
    // Sound effects
    playEating,
    playWon,
    playDie,
    playEatGhost,
    playFrightened,
    playEatPellet,
    playEatFruit,
    playGhostRetreat,
    
    // Game state
    ghostsEatenCount,
    isFrightened,
    frightenedTimer,
    isMuted,
    isInvincible,
    
    // Fruit data
    fruit.type,
    fruit.position,
    spawnFruit,
    
    // Level progression
    level,
    levelUp,
    currentLevelFruits,
    
    // Frightened mode
    setFrightenedTimeRemaining,
    frightenedDuration
  ])

  // ===== FRIGHTENED TIMER CLEANUP ===== //
  // Clear timer when component unmounts
  useEffect(() => {
    return () => {
      if (frightenedTimer) {
        clearTimeout(frightenedTimer)
      }
    }
  }, [frightenedTimer])

  // ===== GHOST MOVEMENT LOGIC ===== //
  // Handles all ghost movement including eaten ghost returns and normal AI behavior
  const moveGhosts = useCallback(() => {

  // ===== RETURN EATEN GHOSTS TO SPAWN ===== //
  // Move ghosts in "eyes only" state back to ghost house
  setEatenGhosts(prevEaten => {
    const stillReturning: number[] = []

    prevEaten.forEach(ghostIndex => {
      const ghost = ghosts[ghostIndex]
      const spawn = GHOST_SPAWNS[ghostIndex]

      // Check if ghost has reached spawn point
      if (ghost.x === spawn.x && ghost.y === spawn.y) {
        // Ghost is home - respawn normally (remove from eatenGhosts)
        return
      }
      
      // Move toward spawn using simple pathfinding
      setGhosts(prevGhosts => {
        const updated = [...prevGhosts]
        const current = updated[ghostIndex]

        // Priority 1: Fix X coordinate first
        if (current.x !== spawn.x) {
          if (current.x < spawn.x) {
            updated[ghostIndex] = {
              ...current,
              x: current.x + 1,
              lastDirection: 'RIGHT'
            }
          } else {
            updated[ghostIndex] = {
              ...current,
              x: current.x - 1,
              lastDirection: 'LEFT'
            }
          }
        }

        // Priority 2: Fix Y coordinate (only after X is correct)
        else if (current.y !== spawn.y) {
          if (current.y < spawn.y) {
            updated[ghostIndex] = {
              ...current,
              y: current.y + 1,
              lastDirection: 'DOWN'
            }
          } else {
            updated[ghostIndex] = {
              ...current,
              y: current.y - 1,
              lastDirection: 'UP'
            }
          }
        }
        return updated
      })

      // Ghost still returning - keep in array
      stillReturning.push(ghostIndex)
    })

    return stillReturning
  })

  // ===== NORMAL GHOST MOVEMENT ===== //
  // Process AI-controlled movement for all active ghosts
  setGhosts(prevGhosts => {
    const newGhosts: Ghost[] = []  // Empty array for ghost positions

    for (let currentIndex = 0; currentIndex < prevGhosts.length; currentIndex++) {
      const ghost = prevGhosts[currentIndex]

      // ===== SKIP BLINKY IF CRUISE ELROY IS ACTIVE ===== //
      // Blinky moves separately when faster (handled in separate effect)
        if (currentIndex === 0 && blinkySpeed !== ghostSpeed) {
          newGhosts.push(ghost)
          continue 
        }

        // ===== SKIP EATEN GHOSTS ===== //
        // Eaten ghosts are handled by return logic above
        if (eatenGhosts.includes(currentIndex)) {
          newGhosts.push(ghost)
          continue
        }

      // ===== SKIP UNRELEASED GHOSTS ===== //
      // Ghosts stay in ghost house until released
      if (!ghostsReleased[currentIndex]) {
        newGhosts.push(ghost)
        continue
      }

      // ===== TUNNEL SLOWDOWN ===== //
      // 50% chance to skip movement in tunnel
      const currentCell = MAZE[ghost.y][ghost.x]
      if (currentCell.tunnel) {
        if (Math.random() < 0.5) {
          newGhosts.push(ghost)
          continue
        }
      }

    // ===== CALCULATE VALID MOVES ===== //
    const possibleMoves = findPossibleMoves(ghost, MAZE, GRID_SIZE)
  
    // No valid moves - stay in place
    if (possibleMoves.length === 0) {
      newGhosts.push(ghost)
      continue
    }
    
    // ===== APPLY AI PERSONALITY ===== //
    // Use scatter/chase behavior or personality-based movement
    const finalMove = calculateGhostMove(
      ghost, 
      possibleMoves, 
      pacmanPosition,
      (ghostBehavior === 'frightened' ? 'scatter' : ghostBehavior) as 'chase' | 'scatter', 
      SCATTER_TARGETS[currentIndex]  
    )
    
  // ===== GHOST COLLISION AVOIDANCE ===== //
  // Check if another ghost already occupies target position
  const isOccupied = newGhosts.some((otherGhost, otherIndex) => {
    // Only check already-moved ghosts (lower indices)
    if (otherIndex >= currentIndex) return false
    
    return otherGhost.x === finalMove.x && otherGhost.y === finalMove.y
  })
  
  if (isOccupied) {
    // Try to find alternative move from possible moves
    for (const move of possibleMoves) {
      const moveIsOccupied = newGhosts.some((otherGhost) => {
        return otherGhost.x === move.x && otherGhost.y === move.y
      })
      
      if (!moveIsOccupied) {
        // Found available alternative
        newGhosts.push({
        x: move.x,
        y: move.y,
        lastDirection: move.direction,
        personality: ghost.personality
      })
        break
      }
    }
      
    // No available moves - stay in place
    if (newGhosts.length === currentIndex) {
      newGhosts.push(ghost)
    }
  } else {
    // Target position is free - move there
    newGhosts.push({
      x: finalMove.x,
      y: finalMove.y,
      lastDirection: finalMove.direction,
      personality: ghost.personality
    })
  }
} 

  // ===== CHECK COLLISION WITH PAC-MAN ===== //
  const collidedIndex = newGhosts.findIndex(
    ghost => ghost.x === pacmanPosition.x && ghost.y === pacmanPosition.y
  )

  if (collidedIndex !== -1 && !isInvincible)  {
    const isAlreadyEaten = eatenGhosts.includes(collidedIndex)  

    // ----- PAC-MAN EATS GHOST (FRIGHTENED MODE) ----- //
    if (isFrightened&& !isAlreadyEaten) {
      playEatGhost(isMuted)
      const points = 200 * Math.pow(2, ghostsEatenCount)

      const ghost = newGhosts[collidedIndex]
      
      // Show floating score popup
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

      // Send ghost to spawn
      setGhostsEatenCount(prev => prev + 1)
      setEatenGhosts(prev => [...prev, collidedIndex])

      // ----- GHOST CATCHES PAC-MAN (NORMAL MODE) ----- //
      } else if (!isAlreadyEaten) { 
        setIsPacmanDying(true)  
        setIsInvincible(true)
        playDie(isMuted)
        
        // Wait for death animation before respawning
        setTimeout(() => { 
          setIsPacmanDying(false)
          setPacmanPosition(PACMAN_SPAWN)

          // Deactivate invincibility after respawn
          setTimeout(() => {
            setIsInvincible(false)
          }, INVINCIBILITY_DURATION) 
          
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
        }, 1200)
      }
    }         
      return newGhosts
    })
  }, [
    // Position data
    pacmanPosition,
    ghosts,
    eatenGhosts,
    
    // Sound effects
    playDie,
    playEatGhost,
    
    // Game state
    isFrightened,
    ghostsEatenCount,
    isMuted,
    isInvincible,
    
    // Ghost behavior
    ghostsReleased,
    ghostBehavior,
    blinkySpeed, 
    ghostSpeed
  ])

// ===== GHOST MOVEMENT INTERVAL ===== //
// Controls ghost movement speed and handles Cruise Elroy extra moves
useEffect(() => {
  if (gameStatus !== 'playing') return

  const ghostInterval = setInterval(() => {
    moveGhosts()  // Move all ghosts
    
    // ===== CRUISE ELROY BONUS MOVE ===== //
    // Blinky moves twice per interval when Cruise Elroy is active
    if (blinkySpeed < ghostSpeed) {
      // Extra move halfway through interval
      setTimeout(() => {
        setGhosts(prev => 
          moveBlinky(prev, pacmanPosition, MAZE, GRID_SIZE, SCATTER_TARGETS, eatenGhosts)
        )
      }, ghostSpeed / 2)
    }
  }, ghostSpeed) 
  
  return () => clearInterval(ghostInterval)
}, [moveGhosts, gameStatus, ghostSpeed, blinkySpeed, moveBlinky, pacmanPosition, eatenGhosts])

// ===== GAME RESTART ===== //
// Reset all game state to initial values
const onRestart = () => {
  // Reset core state
  setLives(3)
  setScore(0)
  setLevel(1)  
  setGameStatus('playing')

  // Reset positions
  setPacmanPosition(PACMAN_SPAWN)
  setGhosts(GHOST_SPAWNS)
  setEatenGhosts([]) 

  // Reset collectibles
  setFruit({ type: null, position: null, spawnTime: null })
  setDots(generateDotsFromMaze())
  setPowerPellets(POWER_PELLET_POSITIONS)

  // Reset frightened mode
  setIsFrightened(false)
  if (frightenedTimer) {
    clearTimeout(frightenedTimer)
  }
setFrightenedTimer(null)   
setGhostsEatenCount(0) 

// Reset extra life threshold
setNextExtraLifeAt(10000)

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


playStart(isMuted)
}
 
// ===== KEYBOARD CONTROLS ===== //
// Listen for arrow key presses to move Pac-Man
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowUp') movePacman('UP')
    if (event.key === 'ArrowDown') movePacman('DOWN')
    if (event.key === 'ArrowLeft') movePacman('LEFT')
    if (event.key === 'ArrowRight') movePacman('RIGHT')
  }
  
  window.addEventListener('keydown', handleKeyDown)
  
  // Cleanup listener on unmount
  return () => {
    window.removeEventListener('keydown', handleKeyDown)
  }
}, [ movePacman])

// ===== FRUIT TIMEOUT ===== //
// Remove fruit after 10 seconds if not collected
useEffect(() => {
  if (!fruit.spawnTime) return
  
  const timeout = setTimeout(() => {
    setFruit({ type: null, position: null, spawnTime: null })
  }, FRUIT_TIMEOUT)
  
  return () => clearTimeout(timeout)
}, [fruit.spawnTime])

  // ===== PLAYING STATE RENDER ===== //
  if (gameStatus === 'playing') {
    return (
      <main 
        className="game"
        aria-label="Pac Maze – game screen"
      >
        {/* Screen reader announcement area */}
        <div 
          aria-live="assertive"
          aria-atomic="true"
          className="visually-hidden"
        >
          {announcement}
        </div>
        {/* Game HUD - score, high score, mute button */}
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

              <div className="game-score high-score">
                <span className="visually-hidden">High score: </span>
                High score: {highScore}
              </div>

            {/* Mute/unmute button */}
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

        {/* Main game grid */}
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
          isInvincible={isInvincible}
          frightenedTimeRemaining={frightenedTimeRemaining}
          ghostsReleased={ghostsReleased} 
          isGateVisible={isGateVisible} 
        />

          {/* Bottom HUD - lives, level, fruit icons */}
          <div className="bottom-menu">
            <Lives lives={lives} />
            <div className="level">
              <span className="visually-hidden">Current level: </span>
              <p> Level: {level} </p>
            </div>

            {/* Level progression fruit icons */}
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

  // ===== GAME OVER STATE RENDER ===== //
  if (gameStatus === 'gameOver') {
      return (
        <GameOver 
          score={score} 
          onRestart={onRestart} 
          announcement={announcement}
        ></GameOver>
      )
  } 

  // ===== WIN STATE RENDER ===== //
  if (gameStatus === 'won') {
      return <WinScreen 
        score={score} 
        onRestart={onRestart} 
        announcement={announcement}
    />
  }

  // ===== START SCREEN HANDLER ===== //
  const handleStart = () => {
    setIsIntroPlaying(true)
    playStart(isMuted) 
    setGameStatus('playing')
  
    // Show "READY!" message
    setFloatingScores([{
      x: 7, // Center of maze
      y: 7, // Center of maze
      text: 'READY!',
      id: Date.now()
    }])
    
    // Remove message after 2 seconds
    setTimeout(() => {
      setFloatingScores([])
    }, 2000)

    // End intro after 4 seconds
    setTimeout(() => {
      setIsIntroPlaying(false)
    }, 4000)
  }

  // ===== START SCREEN RENDER ===== //
  return (
    <StartScreen 
      onStart={handleStart} 
    />
  )
}

export default App