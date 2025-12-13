import type { FruitType } from './FruitTypes' 

// ===== GHOST TYPE DEFINITION ===== //
export type Ghost = {
  x: number
  y: number
  lastDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  personality: 'random' | 'patrol' | 'nervous' | 'shy'
}

export type GameStatus = 'ready' | 'playing' | 'gameOver' | 'won'

// ===== GRID SIZE ===== //
export const GRID_SIZE = 15

// ===== GHOST SPAWN POSITIONS ===== //
export const GHOST_SPAWNS: Ghost[] = [
  { x: 7, y: 5, lastDirection: 'DOWN', personality: 'patrol' },   // [0] Blinky
  { x: 7, y: 7, lastDirection: 'DOWN', personality: 'nervous' },  // [1] Pinky
  { x: 6, y: 7, lastDirection: 'DOWN', personality: 'random' },   // [2] Inky
  { x: 8, y: 7, lastDirection: 'DOWN', personality: 'shy' },      // [3] Clyde
]

// ===== SCATTER MODE SETTINGS ===== //
export type GhostMode = 'chase' | 'scatter' | 'frightened' | 'eaten'

// Scatter targets - each ghost goes to a specific corner
export const SCATTER_TARGETS = [
  { x: 14, y: 0 },   // [0] Blinky - top right
  { x: 0, y: 0 },    // [1] Pinky - top left  
  { x: 14, y: 14 },  // [2] Inky - bottom right
  { x: 0, y: 14 }    // [3] Clyde - bottom left
]

// Scatter/Chase wave timing (in seconds)
export const WAVE_TIMINGS = [
  { scatter: 7, chase: 20 },   // Wave 1
  { scatter: 7, chase: 20 },   // Wave 2
  { scatter: 5, chase: 20 },   // Wave 3
  { scatter: 5, chase: -1 }    // Wave 4 (chase forever)
]

// ===== POWER PELLETS STATE ===== //
export const POWER_PELLET_POSITIONS = [
  { x: 0, y: 0 },    // Top left
  { x: 14, y: 0 },   // Top right
  { x: 0, y: 14 },   // Bottom left
  { x: 14, y: 14 }   // Bottom right
]

// ===== GHOST SPEED CONFIGURATION ===== //
export const GHOST_SPEED_CONFIG = {
// Level 1: 500ms
// Level 2: 450ms
// Level 3: 400ms
// Level 4: 350ms
// Level 5: 300ms
  base: 500,        // Level 1 speed (ms)
  increase: 50,     // Speed increase per level
  max: 200          // Maximum speed (fastest)
}

// ===== INVICTIBILITY SETTINGS ===== //
export const INVINCIBILITY_DURATION = 2000  // 2 seconds after respawn


// ===== FRIGHTENED MODE SETTINGS ===== //
export const FRIGHTENED_DURATION = 8000  // 8 seconds

// ===== PACMAN SPAWN POSITION ===== //
export const PACMAN_SPAWN = { x: 7, y: 11 }

// ===== LEVEL FRUITS ===== //
// Level-specific fruit pairs
// Based on limited documentation - each level spawns 2 specific fruits
// May need adjustment if more official spawn data is found
export const LEVEL_FRUITS: [FruitType, FruitType][] = [
  ['cherry', 'strawberry'],
  ['orange', 'apple'],
  ['melon', 'galaxian'],
  ['cherry', 'melon'],
  ['strawberry', 'galaxian']
]
