// ===== GHOST AI SYSTEM ===== //
// Implements ghost movement logic, personality behaviors, and pathfinding
// Includes scatter/chase modes, tunnel handling, and ghost house escape logic

import type { Ghost } from '../data/gameConstants'
import { canMoveInDirection } from '../data/mazeData'
import type { Cell } from '../data/mazeData'

// Direction types for ghost movement
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

// Represents a possible move with new position and direction
type Move = {
  x: number
  y: number
  direction: Direction
}

// Position coordinates on the grid
type Position = {
  x: number
  y: number
}

// Find all possible moves for a ghost from current position
// Checks for walls, tunnel teleportation, and valid grid boundaries
export const findPossibleMoves = (
  ghost: Ghost,
  maze: Cell[][],
  gridSize: number
): Move[] => {
  const possibleMoves: Move[] = []
  const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT']

  // ===== TUNNEL TELEPORTATION ===== //
  // Ghosts in tunnel cells can teleport to opposite side
  const currentCell = maze[ghost.y][ghost.x]
  
  if (currentCell.tunnel === 'left') {
    // Teleport to right side
    possibleMoves.push({ x: gridSize - 1, y: ghost.y, direction: 'LEFT' })
  }
  
  if (currentCell.tunnel === 'right') {
    // Teleport to left side
    possibleMoves.push({ x: 0, y: ghost.y, direction: 'RIGHT' })
  }

  // ===== NORMAL MOVEMENT ===== //
  // Check each direction for valid moves (no walls)
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

// Check if ghost is in ghost house
// Ghost house boundaries: x: 6-8, y: 5-8
export const isInGhostHouse = (ghost: Ghost): boolean => {
  return (
    ghost.y >= 5 && ghost.y <= 8 &&
    ghost.x >= 6 && ghost.x <= 8
  )
}

// ===== RANDOM PERSONALITY ===== //
// Completely unpredictable movement
// Used by: Inky (cyan ghost) - index 2
export const randomPersonality = (possibleMoves: Move[]): Move => {
  return possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
}

// ===== PATROL PERSONALITY ===== //
// Prefers to continue in same direction - creates aggressive pursuit patterns
// Used by: Blinky (red ghost) - index 0 - spawns OUTSIDE ghost house
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

// ===== NERVOUS PERSONALITY ===== //
// Avoids backtracking unless forced - never reverses direction
// Used by: Pinky (pink ghost) - index 1
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

// ===== SHY PERSONALITY ===== //
// Flees when close to Pac-Man (within 3 tiles), moves randomly when farther
// Used by: Clyde (orange ghost) - index 3 - spawns right side of ghost house
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

// Calculate next move for a ghost based on current mode and personality
// Handles tunnel boosting, ghost house escape, scatter/chase modes
export const calculateGhostMove = (
  ghost: Ghost,
  possibleMoves: Move[],
  pacmanPosition: Position,
  mode?: 'chase' | 'scatter',  
  scatterTarget?: Position   
): Move => {

  // ===== TUNNEL ENTRANCE BOOST ===== //
  // 70% chance to prioritize entering tunnel when near entrance (row 7)
  if (ghost.y === 7) {
    if (ghost.x >= 1 && ghost.x <= 3) {
      const leftMove = possibleMoves.find(move => move.direction === 'LEFT')
      if (leftMove && Math.random() < 0.7) {
        return leftMove
      }
    }
    
    if (ghost.x >= 11 && ghost.x <= 13) {
      const rightMove = possibleMoves.find(move => move.direction === 'RIGHT')
      if (rightMove && Math.random() < 0.7) {
        return rightMove
      }
    }
  }

  // ===== GHOST HOUSE ESCAPE ===== //
  // Ghosts inside ghost house always move UP to exit
  if (isInGhostHouse(ghost)) {
    const upMove = possibleMoves.find(move => move.direction === 'UP')
    if (upMove) return upMove
    return randomPersonality(possibleMoves)
  }

  // ===== SCATTER MODE ===== //
  // Go to designated corner
  if (mode === 'scatter' && scatterTarget) {
    return scatterPersonality(possibleMoves, scatterTarget)
  }

  // ===== CHASE MODE - PERSONALITY-BASED MOVEMENT ===== //
  // Each ghost has unique behavior
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

// ===== SCATTER PERSONALITY ===== //
// Move toward designated corner target using Manhattan distance
// All ghosts use this behavior during scatter mode
export const scatterPersonality = (
  possibleMoves: Move[],
  target: Position
): Move => {
  // Find move that gets closest to target corner
  let bestMove = possibleMoves[0]
  let bestDistance = Infinity
  
  for (const move of possibleMoves) {
    const distance = 
      Math.abs(move.x - target.x) + 
      Math.abs(move.y - target.y)
    
    if (distance < bestDistance) {
      bestDistance = distance
      bestMove = move
    }
  }
  
  return bestMove
}