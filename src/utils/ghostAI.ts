import type { Ghost } from '../data/gameConstants'
import { canMoveInDirection } from '../data/mazeData'
import type { Cell } from '../data/mazeData'

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

type Move = {
  x: number
  y: number
  direction: Direction
}

type Position = {
  x: number
  y: number
}

/**
 * Find all possible moves for a ghost
 */
export const findPossibleMoves = (
  ghost: Ghost,
  maze: Cell[][],
  gridSize: number
): Move[] => {
  const possibleMoves: Move[] = []
  const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT']
  
  for (const dir of directions) {
    if (canMoveInDirection(maze, ghost.x, ghost.y, dir, gridSize)) {
      let newX = ghost.x
      let newY = ghost.y
      
      if (dir === 'UP') newY -= 1
      if (dir === 'DOWN') newY += 1
      if (dir === 'LEFT') newX -= 1
      if (dir === 'RIGHT') newX += 1
      
      possibleMoves.push({ x: newX, y: newY, direction: dir })
    }
  }
  
  return possibleMoves
}

/**
 * Check if ghost is in ghost house
 * Ghost house boundaries: x: 6-8, y: 5-8
 */
    export const isInGhostHouse = (ghost: Ghost): boolean => {
    return (
        ghost.y >= 5 && ghost.y <= 8 &&
        ghost.x >= 6 && ghost.x <= 8
    )
    }

    /**
     * RANDOM personality: Completely unpredictable movement
     * Used by: Cyan ghost (Inky) - index 0
     */
    export const randomPersonality = (possibleMoves: Move[]): Move => {
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
    }

    /**
     * PATROL personality: Prefers to continue in same direction
     * Creates aggressive, straight-line movement patterns
     * Used by: Red ghost (Blinky) - index 2 - spawns OUTSIDE ghost house
     */
    export const patrolPersonality = (
    ghost: Ghost,
    possibleMoves: Move[]
    ): Move => {
    const sameDirection = possibleMoves.find(
        move => move.direction === ghost.lastDirection
    )
    
    if (sameDirection) {
        return sameDirection
    }
    
    return randomPersonality(possibleMoves)
    }

    /**
     * NERVOUS personality: Avoids backtracking
     * Never reverses direction unless forced by walls
     * Used by: Pink ghost (Pinky) - index 1
     */
    export const nervousPersonality = (
    ghost: Ghost,
    possibleMoves: Move[]
    ): Move => {
    const oppositeDir: Record<Direction, Direction> = {
        'UP': 'DOWN',
        'DOWN': 'UP',
        'LEFT': 'RIGHT',
        'RIGHT': 'LEFT'
    }
    
    const filteredMoves = possibleMoves.filter(
        move => move.direction !== oppositeDir[ghost.lastDirection]
    )
    
    if (filteredMoves.length > 0) {
        return randomPersonality(filteredMoves)
    }
    
    // Forced to backtrack - only option available
    return possibleMoves[0]
    }

    /**
     * SHY personality: Runs away when close to Pacman
     * Flees when within 3 tiles of Pacman, otherwise moves randomly
     * Used by: Orange ghost (Clyde) - index 3 - spawns right side of ghost house
     */
    export const shyPersonality = (
    ghost: Ghost,
    possibleMoves: Move[],
    pacmanPosition: Position
    ): Move => {
    const distanceToPacman = 
        Math.abs(ghost.x - pacmanPosition.x) + 
        Math.abs(ghost.y - pacmanPosition.y)
    
    if (distanceToPacman <= 3) {
        // Too close - run away!
        const awayMoves = possibleMoves.filter(move => {
        const newDistance = 
            Math.abs(move.x - pacmanPosition.x) + 
            Math.abs(move.y - pacmanPosition.y)
        return newDistance > distanceToPacman
        })
        
        if (awayMoves.length > 0) {
        return randomPersonality(awayMoves)
        }
    }
    
    // Far away or cornered - move randomly
    return randomPersonality(possibleMoves)
    }

/**
 * Calculate next move for a ghost based on personality
 */
export const calculateGhostMove = (
  ghost: Ghost,
  possibleMoves: Move[],
  pacmanPosition: Position
): Move => {
  // In ghost house - prefer UP to escape
  if (isInGhostHouse(ghost)) {
    const upMove = possibleMoves.find(move => move.direction === 'UP')
    if (upMove) return upMove
    return randomPersonality(possibleMoves)
  }
  
  // Outside house - use personality
  switch (ghost.personality) {
    case 'random':
      return randomPersonality(possibleMoves)
    case 'patrol':
      return patrolPersonality(ghost, possibleMoves)
    case 'nervous':
      return nervousPersonality(ghost, possibleMoves)
    case 'shy':
      return shyPersonality(ghost, possibleMoves, pacmanPosition)
    default:
      return randomPersonality(possibleMoves)
  }
}