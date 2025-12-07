// ===== TYPE CELL =====
export type Cell = {
  top: boolean      // Wall up
  right: boolean    // Wall right
  bottom: boolean   // Wall down
  left: boolean     // Wall left
  hasDot: boolean  // Has dot?
  powerPellet?: boolean 
  zone?: 'restricted' | 'ghost-house'  // The cell is outside of the labyrinth
  tunnel?: 'left' | 'right'  // ← TUNNEL - teleport to the other side of labyrinth
}

// ===== HELPER  =====
// Format: "TRBL" (Top, Right, Bottom, Left)
const createCell = (
  walls: string, 
  dot = false, 
  options?: {    // Cell options - is the cell part of the labyrinth?
    zone?: 'restricted' | 'ghost-house'
    tunnel?: 'left' | 'right'
    powerPellet?: boolean  
  }
): Cell => ({
  top: walls[0] === '1',
  right: walls[1] === '1',
  bottom: walls[2] === '1',
  left: walls[3] === '1',
  hasDot: dot,
  powerPellet: options?.powerPellet, 
  zone: options?.zone,
  tunnel: options?.tunnel  
})

// ===== MAP 15x15 =====
export const MAZE: Cell[][] = [ 

  // Row 1
  [
    createCell('1001', false, { powerPellet: true }), // [0,0] Left top corner
    createCell('1000',true), 
    createCell('1000',true), 
    createCell('1000',true), 
    createCell('1000',true),

    createCell('1000',true), 
    createCell('1000',true), 
    createCell('1000',true), 
    createCell('1000',true), 
    createCell('1000',true),

    createCell('1000',true), 
    createCell('1000',true), 
    createCell('1000',true), 
    createCell('1000',true), 
    createCell('1100',false, { powerPellet: true }),  // [14,0] Right top corner
  ],

  // Row 2
  [
    createCell('0001',true),
    createCell('1001', true),
    createCell('0000',true),
    createCell('1100',true),
    createCell('1000',true),

    createCell('1000',true), 
    createCell('1000',true), 
    createCell('0000',true), 
    createCell('1000',true), 
    createCell('1000',true),

    createCell('1000',true), 
    createCell('1001',true), 
    createCell('0000',true), 
    createCell('1100',true), 
    createCell('0100',true),
  ],

  // Row 3
  [
    createCell('0001',true), 
    createCell('0001',true), 
    createCell('1011',true), 
    createCell('0110',true), 
    createCell('0000',true),
    
    createCell('1011',true), 
    createCell('1100',true), 
    createCell('0000',true), 
    createCell('1001',true), 
    createCell('1110',true),

    createCell('0000',true), 
    createCell('0011',true), 
    createCell('1110',true), 
    createCell('0100',true), 
    createCell('0100',true),
  ],

  // Row 4 (upper corridors)
  [
    createCell('0001',true), 
    createCell('0011',true), 
    createCell('0010',true), 
    createCell('0000',true), 
    createCell('0010',true),

    createCell('0000',true), 
    createCell('0110',true), 
    createCell('0000',true), 
    createCell('0011',true), 
    createCell('0000',true),

    createCell('0010',true), 
    createCell('0000',true), 
    createCell('0010',true), 
    createCell('0110',true), 
    createCell('0100',true),
  ],

  // Row 5
  [
    createCell('0001',true), 
    createCell('0000',true), 
    createCell('0000',true), 
    createCell('0000',true), 
    createCell('0001',true),

    createCell('0000',true), 
    createCell('0011',true), 
    createCell('0010',true), 
    createCell('0110',true), 
    createCell('0000',true),

    createCell('0100',true), 
    createCell('0000',true), 
    createCell('0000',true), 
    createCell('0000',true), 
    createCell('0100',true),
  ],

  // Row 6 Empty spaces top
   [
    createCell('1000', false, { zone: 'restricted' }),
    createCell('1000', false, { zone: 'restricted' }),
    createCell('1100', false, { zone: 'restricted' }),
    createCell('0000',true),
    createCell('1100',true),

    createCell('0000',true), //8
    createCell('0000',true), //9
    createCell('0000',true), //10
    createCell('0000',true), //11
    createCell('0000',true), //12
     
    createCell('1001',true),
    createCell('0000',true),
    createCell('1001', false, { zone: 'restricted' }),
    createCell('1000', false, { zone: 'restricted' }),
    createCell('1000', false, { zone: 'restricted' }),
  ],

  // Row 7 Empty spaces top, start of the ghost cave
  [
    createCell('0000',  false, { zone: 'restricted' }),
    createCell('0000', false, { zone: 'restricted' }),
    createCell('0100', false, { zone: 'restricted' }),
    createCell('0000',true), 
    createCell('0101',true),

    createCell('0000',true), //8
    createCell('1001'), //9
    createCell('0000'), //10
    createCell('1100'), //11
    createCell('0000',true), //12

    createCell('0101',true),
    createCell('0000',true), 
    createCell('0001', false, { zone: 'restricted' }),
    createCell('0000', false, { zone: 'restricted' }),
    createCell('0000', false, { zone: 'restricted' }),
  ],

  // Row 8 Ghost cave middle, escape corridors
  [
    createCell('1010', false, { zone: 'ghost-house', tunnel: 'left' }),  // Left tunnel
    createCell('1010'),
    createCell('1010'),
    createCell('0000',true),
    createCell('0001',true),

    createCell('0000',true), 
    createCell('0001'), 
    createCell('0000'), 
    createCell('0100'), 
    createCell('0000',true),

    createCell('0100',true),
    createCell('0000',true),
    createCell('1000'),
    createCell('1000'),
    createCell('1000', false, { zone: 'ghost-house', tunnel: 'right' }),  // Right tunnel
  ],

  // Row 9 ghost cave bottom, empty space bottom
  [
    createCell('0000', false, { zone: 'restricted' }),
    createCell('0000', false, { zone: 'restricted' }),
    createCell('0100', false, { zone: 'restricted' }),
    createCell('0000',true),
    createCell('0101',true),

    createCell('0000',true),
    createCell('0011'),
    createCell('0010'),
    createCell('0110'),
    createCell('0000',true),

    createCell('0101',true),
    createCell('0000',true),
    createCell('1001', false, { zone: 'restricted' }),
    createCell('1000', false, { zone: 'restricted' }),
    createCell('1000', false, { zone: 'restricted' }),
  ],

  // Row 10 — empty space bottom
  [
    createCell('0010', false, { zone: 'restricted' }),
    createCell('0010', false, { zone: 'restricted' }),
    createCell('0110' , false, { zone: 'restricted' }),
    createCell('0000',true),
    createCell('0110',true),

    createCell('0000',true),
    createCell('0000',true),
    createCell('0000',false),
    createCell('0000',true),
    createCell('0000',true),

    createCell('0011',true), 
    createCell('0000',true), 
    createCell('0011', false, { zone: 'restricted' }),
    createCell('0010', false, { zone: 'restricted' }),
    createCell('0010', false, { zone: 'restricted' }),
  ],

  // Row 11
  [
    createCell('0001',true),
    createCell('0000',true),
    createCell('0000',true),
    createCell('0000',true), 
    createCell('0001',true),

    createCell('0000',true), 
    createCell('1001',true), 
    createCell('1000',true), 
    createCell('1100',true),
    createCell('0000',true),

    createCell('0100',true), 
    createCell('0000',true), 
    createCell('0000',true), 
    createCell('0000',true), 
    createCell('0100',true),
  ],

  // Row 12
  [
    createCell('0001',true),
    createCell('1001',true),
    createCell('1000',true),
    createCell('0000',true), 
    createCell('1000',true),

    createCell('0000',true), 
    createCell('1100',true), 
    createCell('0000',false), 
    createCell('1001',true), 
    createCell('0000',true),

    createCell('1000',true), 
    createCell('0000',true), 
    createCell('1000',true), 
    createCell('1100',true), 
    createCell('0100',true),
  ],

  // Row 13
  [
    createCell('0001',true),
    createCell('0001',true),
    createCell('1011',true),
    createCell('1100',true),
    createCell('0000',true),

    createCell('1011',true),
    createCell('0110',true),
    createCell('0000',true),
    createCell('0011',true),
    createCell('1110',true),

    createCell('0000',true),
    createCell('1001',true),
    createCell('1110',true),
    createCell('0100',true),
    createCell('0100',true),
  ],

  // Row 14
  [
    createCell('0001',true), 
    createCell('0011',true), 
    createCell('0000',true), 
    createCell('0110',true),
    createCell('0010',true), 

    createCell('0010',true), 
    createCell('0010',true), 
    createCell('0000',true), 
    createCell('0010',true),
    createCell('0010',true),

    createCell('0010',true), 
    createCell('0011',true), 
    createCell('0000',true), 
    createCell('0110',true), 
    createCell('0100',true),
  ],

  // Row 15
  [
    createCell('0011', false, { powerPellet: true }),  // [0,14] Left bottom corner
    createCell('0010',true),
    createCell('0010',true),
    createCell('0010',true),
    createCell('0010',true),

    createCell('0010',true),
    createCell('0010',true),
    createCell('0010',true),
    createCell('0010',true),
    createCell('0010',true),

    createCell('0010',true),
    createCell('0010',true),
    createCell('0010',true),
    createCell('0010',true),
    createCell('0110', false, { powerPellet: true }),  // [14,14] Right bottom corner
  ],
]

// ===== GENERATE DOTS FROM MAZE =====
export const generateDotsFromMaze = (): { x: number, y: number }[] => {
  const dots: { x: number, y: number }[] = []
  const DOT_COUNT = 180  // ← genrate till there's 180 dots
  
  // Find fields with hasDot: true
  const allowedPositions: { x: number, y: number }[] = []
  
  for (let y = 0; y < MAZE.length; y++) {
    for (let x = 0; x < MAZE[y].length; x++) {
      if (MAZE[y][x].hasDot) {
        allowedPositions.push({ x, y })
      }
    }
  }
  
  // Chose 30 random positions from hasDot: true
  while (dots.length < DOT_COUNT && allowedPositions.length > 0) {
    const randomIndex = Math.floor(Math.random() * allowedPositions.length)
    const position = allowedPositions[randomIndex]
    
    dots.push(position)
    
    // Do not add dots to the position, where the dots are already added
    allowedPositions.splice(randomIndex, 1)
  }
  
  return dots
}

// ===== CHECK IF MOVE IS VALID (no walls) =====
export const canMoveInDirection = (
  maze: Cell[][],
  fromX: number,
  fromY: number,
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT',
  gridSize: number
): boolean => {
  // Calculate target position
  let targetX = fromX
  let targetY = fromY
  
  if (direction === 'UP') targetY -= 1
  if (direction === 'DOWN') targetY += 1
  if (direction === 'LEFT') targetX -= 1
  if (direction === 'RIGHT') targetX += 1
  
  // Check borders
  if (targetX < 0 || targetX >= gridSize || targetY < 0 || targetY >= gridSize) {
    return false
  }
  
  // Check walls - current cell
  const currentCell = maze[fromY][fromX]
  
  if (direction === 'UP' && currentCell.top) return false
  if (direction === 'DOWN' && currentCell.bottom) return false
  if (direction === 'LEFT' && currentCell.left) return false
  if (direction === 'RIGHT' && currentCell.right) return false
  
  // Check walls - target cell
  const targetCell = maze[targetY][targetX]
  
  if (direction === 'UP' && targetCell.bottom) return false
  if (direction === 'DOWN' && targetCell.top) return false
  if (direction === 'LEFT' && targetCell.right) return false
  if (direction === 'RIGHT' && targetCell.left) return false
  
  // All checks passed - move is valid!
  return true
}
