import { useState, useEffect } from 'react';
import { WAVE_TIMINGS, GHOST_SPEED_CONFIG } from '../data/gameConstants';
import type { GameStatus } from '../data/gameConstants'; 

export const useGhostBehavior = (
    isFrightened: boolean,
    gameStatus: GameStatus,
    level: number
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
    const ghostSpeed = isFrightened ? 500 : baseSpeed
                    
    return {
        ghostBehavior,
        ghostsReleased,
        isGateVisible,
        frightenedTimeRemaining,
        setFrightenedTimeRemaining,
        ghostSpeed
    };
}