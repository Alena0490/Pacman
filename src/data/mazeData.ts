// data/mazeData.ts

// ===== TYPE CELL =====
export type Cell = {
  top: boolean      // Wall up
  right: boolean    // Wall right
  bottom: boolean   // Wall down
  left: boolean     // Wall left
  hasCoin: boolean  // Has coin?
}

// ===== HELPER  =====
// Format: "TRBL" (Top, Right, Bottom, Left)
const createCell = (walls: string, coin = false): Cell => ({
  top: walls[0] === '1',
  right: walls[1] === '1',
  bottom: walls[2] === '1',
  left: walls[3] === '1',
  hasCoin: coin
})

// ===== MAP 15x15 =====
export const MAZE: Cell[][] = [ 

  // Row 0
  [
    createCell('1001'), createCell('1000'), createCell('1000'), createCell('1000'), createCell('1000'),
    createCell('1000'), createCell('1000'), createCell('1000'), createCell('1000'), createCell('1000'),
    createCell('1000'), createCell('1000'), createCell('1000'), createCell('1000'), createCell('1100'),
  ],

  // Row 1
  [
    createCell('0001'), createCell('0000'), createCell('0000'), createCell('0000'), createCell('0000'),
    createCell('0000'), createCell('0000'), createCell('0000'), createCell('0000'), createCell('0000'),
    createCell('0000'), createCell('0000'), createCell('0000'), createCell('0000'), createCell('0100'),
  ],

  // Row 2
  [
    createCell('0001'), createCell('0110'), createCell('0011'), createCell('0010'), createCell('0010'),
    createCell('0010'), createCell('0010'), createCell('0000'), createCell('0010'), createCell('0010'),
    createCell('0010'), createCell('0010'), createCell('0011'), createCell('0110'), createCell('0100'),
  ],

  // Row 3 (upper corridors)
  [
    createCell('0001'), createCell('0100'), createCell('0001'), createCell('0000'), createCell('0000'),
    createCell('0000'), createCell('0000'), createCell('0000'), createCell('0000'), createCell('0000'),
    createCell('0000'), createCell('0000'), createCell('0000'), createCell('0100'), createCell('0100'),
  ],

  // Row 4
  [
    createCell('0001'), createCell('0110'), createCell('0011'), createCell('0110'), createCell('0000'),
    createCell('1000'), createCell('1000'), createCell('0000'), createCell('1000'), createCell('1000'),
    createCell('0000'), createCell('0110'), createCell('0011'), createCell('0110'), createCell('0100'),
  ],

  // Row 5
  [
    createCell('0001'), createCell('0000'), createCell('0000'), createCell('0100'), createCell('0000'),
    createCell('0100'), createCell('0000'), createCell('0000'), createCell('0000'), createCell('0100'),
    createCell('0000'), createCell('0100'), createCell('0000'), createCell('0000'), createCell('0100'),
  ],

  // Row 6
  [
    createCell('0001'), createCell('0000'), createCell('1000'), createCell('1000'), createCell('0000'),
    createCell('0110'), createCell('0011'), createCell('0010'), createCell('0011'), createCell('0110'),
    createCell('0000'), createCell('1000'), createCell('1000'), createCell('0000'), createCell('0100'),
  ],

  // Row 7 (ghost row)
  [
    createCell('0001'), createCell('0000'), createCell('0000'), createCell('0100'), createCell('0000'),
    createCell('0100'), createCell('0000'), createCell('0000'), createCell('0000'), createCell('0100'),
    createCell('0000'), createCell('0100'), createCell('0000'), createCell('0000'), createCell('0100'),
  ],

  // Row 8 — mirror of Row 6
  [
    createCell('0001'), createCell('0000'), createCell('1000'), createCell('1000'), createCell('0000'),
    createCell('0110'), createCell('0011'), createCell('0010'), createCell('0011'), createCell('0110'),
    createCell('0000'), createCell('1000'), createCell('1000'), createCell('0000'), createCell('0100'),
  ],

  // Row 9 — mirror of Row 5
  [
    createCell('0001'), createCell('0000'), createCell('0000'), createCell('0100'), createCell('0000'),
    createCell('0100'), createCell('0000'), createCell('0000'), createCell('0000'), createCell('0100'),
    createCell('0000'), createCell('0100'), createCell('0000'), createCell('0000'), createCell('0100'),
  ],

  // Row 10 — mirror of Row 4
  [
    createCell('0001'), createCell('0110'), createCell('0011'), createCell('0110'), createCell('0000'),
    createCell('1000'), createCell('1000'), createCell('0000'), createCell('1000'), createCell('1000'),
    createCell('0000'), createCell('0110'), createCell('0011'), createCell('0110'), createCell('0100'),
  ],

  // Row 11 — mirror of Row 3
  [
    createCell('0001'), createCell('0100'), createCell('0001'), createCell('0000'), createCell('0000'),
    createCell('0000'), createCell('0000'), createCell('0000'), createCell('0000'), createCell('0000'),
    createCell('0000'), createCell('0000'), createCell('0000'), createCell('0100'), createCell('0100'),
  ],

  // Row 12 — mirror of Row 2
  [
    createCell('0001'), createCell('0110'), createCell('0011'), createCell('0010'), createCell('0010'),
    createCell('0010'), createCell('0010'), createCell('0000'), createCell('0010'), createCell('0010'),
    createCell('0010'), createCell('0010'), createCell('0011'), createCell('0110'), createCell('0100'),
  ],

  // Row 13 — mirror of Row 1
  [
    createCell('0001'), createCell('0000'), createCell('0000'), createCell('0000'), createCell('0000'),
    createCell('0000'), createCell('0000'), createCell('0000'), createCell('0000'), createCell('0000'),
    createCell('0000'), createCell('0000'), createCell('0000'), createCell('0000'), createCell('0100'),
  ],

  // Row 14 — bottom line
  [
    createCell('0011'), createCell('0010'), createCell('0010'), createCell('0010'), createCell('0010'),
    createCell('0010'), createCell('0010'), createCell('0000'), createCell('0010'), createCell('0010'),
    createCell('0010'), createCell('0010'), createCell('0010'), createCell('0010'), createCell('0110'),
  ],
]
