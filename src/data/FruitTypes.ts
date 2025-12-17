// ===== FRUIT SYSTEM CONFIGURATION ===== //
// Defines fruit types, point values, spawn timing, and positions

export type FruitType = 'cherry' | 'strawberry' | 'orange' | 'apple' | 'melon' | 'galaxian'

// Fruit state - null values when no fruit is active
export type Fruit = {
  type: FruitType | null
  position: { x: number, y: number } | null
  spawnTime: number | null
}

// Point values for each fruit type
export const FRUIT_POINTS: Record<FruitType, number> = {
  cherry: 100,
  strawberry: 300,
  orange: 500,
  apple: 700,
  melon: 1000,
  galaxian: 2000
}

// Sequential fruit spawn order across levels
// Each level spawns 2 fruits (at 70 and 170 dots eaten)
// Level 1: cherry + strawberry | Level 2: orange + apple | Level 3: melon + galaxian
// Level 4: cherry + melon | Level 5: strawberry + galaxian
export const FRUIT_PROGRESSION: FruitType[] = [
  'cherry',      // 1. spawn (70 dots)
  'strawberry',  // 2. spawn (170 dots)
  'orange',      // 3. spawn (70 dots)
  'apple',       // 4. spawn (170 dots)
  'melon',       // 5. spawn (70 dots)
  'galaxian'     // 6. spawn (170 dots)
]

// Number of dots that must be eaten before fruit spawns
export const FRUIT_SPAWN_DOTS = {
  first: 70,   // First fruit appears after 70 dots eaten
  second: 170  // Second fruit appears after 170 dots eaten
}

export const FRUIT_TIMEOUT = 10000  // 10 seconds - fruit disappears if not collected

// Fruit spawn position (below ghost house, center of maze)
export const FRUIT_SPAWN_POSITION = { x: 7, y: 9 }
