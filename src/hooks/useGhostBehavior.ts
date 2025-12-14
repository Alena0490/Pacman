import { useState, useEffect, useCallback } from 'react';
import { WAVE_TIMINGS, GHOST_SPEED_CONFIG } from '../data/gameConstants';
import type { GameStatus, Ghost } from '../data/gameConstants'; 
import type { Cell } from '../data/mazeData'  
import { findPossibleMoves, calculateGhostMove } from '../utils/ghostAI';

export const useGhostBehavior = (
    isFrightened: boolean,
    gameStatus: GameStatus,
    level: number,
    dotsRemaining: number
) => {
    const [currentMode, setCurrentMode] = useState<'chase' | 'scatter'>('scatter');
    const [currentWave, setCurrentWave] = useState(0);
    const [ghostsReleased, setGhostsReleased] = useState<boolean[]>([
        true, false, false, false
    ])
    const [isGateVisible, setIsGateVisible] = useState(true) 
    const [frightenedTimeRemaining, setFrightenedTimeRemaining] = useState(0)  

    // ===== SCATTER/CHASE MODE SWITCHING ===== //
    useEffect(() => {
        if (isFrightened) return  // ← Pause timer during frightened

    const wave = WAVE_TIMINGS[currentWave]  // ← Get current wave timings
    const duration = currentMode === 'scatter' ? wave.scatter : wave.chase  // ← Get duration for current mode
    
    if (duration === -1) return  // ← Chase forever
    
        const timer = setTimeout(() => {
            if (currentMode === 'scatter') {
                setCurrentMode('chase')
            } else {
                setCurrentMode('scatter')
                setCurrentWave(prev => prev + 1)
            }
        }, duration * 1000)
            
        return () => clearTimeout(timer)
    }, [currentMode, currentWave, isFrightened])

    // ===== GHOST RELEASE ===== //
    useEffect(() => {
    if (gameStatus !== 'playing') return
    
    // Pinky release (3s)
    const pinkyGateOut = setTimeout(() => {
        setIsGateVisible(false)
    }, 2800)
    
    const pinkyRelease = setTimeout(() => {
        setGhostsReleased([true, true, false, false])
    }, 3000)
    
    const pinkyGateIn = setTimeout(() => {
        setIsGateVisible(true)
    }, 4200)
    
    // Inky release (7s)
    const inkyGateOut = setTimeout(() => {
        setIsGateVisible(false)
    }, 6800)
    
    const inkyRelease = setTimeout(() => {
        setGhostsReleased([true, true, true, false])
    }, 7000)
    
    const inkyGateIn = setTimeout(() => {
        setIsGateVisible(true)
    }, 8200)
    
    // Clyde release (12s)
    const clydeGateOut = setTimeout(() => {
        setIsGateVisible(false)
    }, 11800)
    
    const clydeRelease = setTimeout(() => {
        setGhostsReleased([true, true, true, true])
    }, 12000)
    
    // Cleanup
    return () => {
        clearTimeout(pinkyGateOut)
        clearTimeout(pinkyRelease)
        clearTimeout(pinkyGateIn)
        clearTimeout(inkyGateOut)
        clearTimeout(inkyRelease)
        clearTimeout(inkyGateIn)
        clearTimeout(clydeGateOut)
        clearTimeout(clydeRelease)
    }
    }, [gameStatus])

    // ===== FRIGHTENED MODE ===== //
    useEffect(() => {
    if (!isFrightened) return
    
    const countdownInterval = setInterval(() => {
        setFrightenedTimeRemaining(prev => {
        const newValue = Math.max(0, prev - 100)
        return newValue
        })
    }, 100)
    
    return () => clearInterval(countdownInterval)
    }, [isFrightened])

    // GHOST BEHAVIOR OBJECT
    const ghostBehavior = isFrightened ? 'frightened' : currentMode

    // ===== GHOST SPEED CALCULATION ===== //
    const baseSpeed = Math.max(
        GHOST_SPEED_CONFIG.base - (level - 1) * GHOST_SPEED_CONFIG.increase,
        GHOST_SPEED_CONFIG.max
    )

    // ===== CRUISE ELROY ===== //
    let cruiseElroyLevel = 0
    if (dotsRemaining <= 10) {
    cruiseElroyLevel = 2
    } else if (dotsRemaining <= 20) {
    cruiseElroyLevel = 1
    }

    // ===== BLINKY SPEED (with Cruise Elroy) ===== //
    let blinkySpeed = baseSpeed
    if (cruiseElroyLevel === 1) {
    blinkySpeed = baseSpeed * 0.85  // 15% fastest
    } else if (cruiseElroyLevel === 2) {
    blinkySpeed = baseSpeed * 0.7  // 30% fastest
    }

    const ghostSpeed = isFrightened ? 500 : baseSpeed

    // ===== BLINKY MOVE FUNCTION ===== //
    const moveBlinky = useCallback((
        currentGhosts: Ghost[],
        pacmanPos: { x: number, y: number },
        maze: Cell[][],
        gridSize: number,
        scatterTargets: { x: number, y: number }[],
        eatenGhostsArray: number[]
        ) => {
        if (!ghostsReleased[0]) return currentGhosts
        
        if (eatenGhostsArray.includes(0)) {
            return currentGhosts
        }
        
        // ===== COPY ARRAY (don't mutate) ===== //
        const updated = [...currentGhosts]  // ← SHALLOW COPY
        const blinky = updated[0]
        
        const currentCell = maze[blinky.y][blinky.x]
        if (currentCell.tunnel && Math.random() < 0.5) {
            return currentGhosts  // ← Return ORIGINAL (no change)
        }
        
        const possibleMoves = findPossibleMoves(blinky, maze, gridSize)
        if (possibleMoves.length === 0) return currentGhosts
        
        const finalMove = calculateGhostMove(
            blinky,
            possibleMoves,
            pacmanPos,
            (ghostBehavior === 'frightened' ? 'scatter' : ghostBehavior) as 'chase' | 'scatter',
            scatterTargets[0]
        )

        // ===== CHECK COLLISION WITH OTHER GHOSTS ===== //
        const isOccupied = currentGhosts.some((ghost, index) => {
            if (index === 0) return false  // Skip Blinky
            return ghost.x === finalMove.x && ghost.y === finalMove.y
        })

        if (isOccupied) {
            return currentGhosts  // Stay in place
        }
                
        // ===== UPDATE ONLY BLINKY (index 0) ===== //
        updated[0] = {
            x: finalMove.x,
            y: finalMove.y,
            lastDirection: finalMove.direction,
            personality: blinky.personality
        }
        
        return updated  
        }, [ghostsReleased, ghostBehavior])
                    
    return {
        ghostBehavior,
        ghostsReleased,
        isGateVisible,
        frightenedTimeRemaining,
        setFrightenedTimeRemaining,
        ghostSpeed,
        blinkySpeed,
        moveBlinky 
    };
}