import { useState, useEffect, useCallback } from "react"
import GameField from "./comonents/GameField"
import StartScreen from "./comonents/StartScreen"
import GameOver from "./comonents/GameOver"
import WinScreen from "./comonents/WinScreen"
import Lives from "./comonents/Lives"
import "./App.css"

type GameStatus = 'ready' | 'playing' | 'gameOver' | 'won'

const App = () => {
  // ===== GAME STATE =====
  const [gameStatus, setGameStatus] = useState<GameStatus>('ready')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const GRID_SIZE = 15
  
  // ===== POSITION =====
  const [pacmanPosition, setPacmanPosition] = useState({ x: 1, y: 1 })
  
  const [ghosts, setGhosts] = useState([
    { x: 7, y: 7 },
    { x: 8, y: 7 },
    { x: 9, y: 7 }
  ])

  // ===== GENERATE COINS =====//
  const generateCoins = () => {
    const coins = []
    const COIN_COUNT = 30
    
    while (coins.length < COIN_COUNT) {
      const x = Math.floor(Math.random() * GRID_SIZE)
      const y = Math.floor(Math.random() * GRID_SIZE)
        // Do not add coin to the Pacman's start position
        if (x === 1 && y === 1) continue
        
        // Do not add coins where the ghosts are
        if ((x === 7 && y === 7) || (x === 8 && y === 7) || (x === 9 && y === 7)) continue
        
        // Add coin randomly
            coins.push({ x, y })
    }
    return coins
  }
  
  const [coins, setCoins] = useState(generateCoins)

  // ===== MOVE PACMAN =====//
  const movePacman = useCallback((direction: string) => {

    let newX = pacmanPosition.x
    let newY = pacmanPosition.y
    
    if (direction === 'UP') newY -= 1
    if (direction === 'DOWN') newY += 1
    if (direction === 'LEFT') newX -= 1
    if (direction === 'RIGHT') newX += 1
    
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
      return
    }
        
    setPacmanPosition({ x: newX, y: newY })

      // ===== COLECTING COINS =====//
      const hasCoin = coins.some(coin => coin.x === newX && coin.y === newY)
        if (hasCoin) {
          const newCoins = coins.filter(coin => {
            return !(coin.x === newX && coin.y === newY)
          })
          setCoins(newCoins)
          setScore(score + 1)
            //Check the win
            if (newCoins.length === 0) {
              setGameStatus('won')
            }
        }
      
    // ===== GHOST COLISION =====//
    const hitGhost = ghosts.some(ghost => ghost.x === newX && ghost.y === newY)
      
      if (hitGhost) {
        // Ghost colision
        setLives(lives - 1) // Lose live
        
        // Move back to the start position
        setPacmanPosition({ x: 1, y: 1 })
        
        // If lives = 0, game over
        if (lives - 1 <= 0) {
          setGameStatus('gameOver')
        }
      }
          
  }, [pacmanPosition, coins, score, ghosts, lives, GRID_SIZE])

  // ===== GHOSTS =====//
  const moveGhosts = useCallback(() => {
  setGhosts(prevGhosts => {
    const newGhosts = prevGhosts.map(ghost => {
      // Random move: 0=up, 1=down, 2=left, 3=right
      const direction = Math.floor(Math.random() * 4)
      
      let newX = ghost.x
      let newY = ghost.y
      
      if (direction === 0) newY -= 1 // Up
      if (direction === 1) newY += 1 // Down
      if (direction === 2) newX -= 1 // Left
      if (direction === 3) newX += 1 // Right
      
      // ===== CHECK BORDERS =====//
      if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
        return ghost // Stays in the same position
      }
      
       return { x: newX, y: newY }
    })

    // ===== CHECK COLISION =====//
    const hitGhost = newGhosts.some(
      ghost => ghost.x === pacmanPosition.x && ghost.y === pacmanPosition.y
    )
    
    if (hitGhost) {
      setLives(prev => {
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
  }, [GRID_SIZE, pacmanPosition]) 

 // ===== GAME OVER =====//
 //Restart the game
 const onRestart = () => {
  setLives(3)
  setScore(0)
  setGameStatus('playing')
  setPacmanPosition({ x: 1, y: 1 })  // Go back to start
  setGhosts([  
    { x: 7, y: 7 },
    { x: 8, y: 7 },
    { x: 9, y: 7 }
  ])
  setCoins(generateCoins())  //Return all coins
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
      <article className="game">
        {/* <h1 className="game-title">Pac Maze</h1> */}
         <header className="game-hud">           
            <div className="game-stats">
            <div className="game-score">Score: {score}</div>
            <Lives lives={lives} />
            </div>
        </header>
        <GameField
          pacmanPosition={pacmanPosition}
          coins={coins}
          ghosts={ghosts}
          gridSize={GRID_SIZE}
          />
      </article>
    ) }
  if (gameStatus === 'gameOver') {
      return (
        <GameOver score={score} onRestart={onRestart} ></GameOver>
      )
  } 
  if (gameStatus === 'won') {
    return <WinScreen score={score} onRestart={onRestart} />
  }
  return (
    <StartScreen onStart={() => setGameStatus('playing')}></StartScreen>
  )
}

export default App