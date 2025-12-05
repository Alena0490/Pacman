export type FruitType = 'cherry' | 'strawberry' | 'orange' | 'apple' | 'melon' | 'galaxian'

export type Fruit = {
  type: FruitType | null
  position: { x: number, y: number } | null
  spawnTime: number | null
}

export const FRUIT_PROGRESSION: FruitType[] = [
  'cherry',      // 1. spawn (70 coins)
  'strawberry',  // 2. spawn (170 coins)
  'orange',      // 3. spawn (restart po smrti?)
  'apple',       // 4. spawn
  'melon',       // 5. spawn
  'galaxian'     // 6. spawn
]

export const FRUIT_SPAWN_COINS = {
  first: 70,
  second: 170
}

export const FRUIT_TIMEOUT = 10000  // 10s

// Spawn position (under the ghost house)
export const FRUIT_SPAWN_POSITION = { x: 7, y: 9 }