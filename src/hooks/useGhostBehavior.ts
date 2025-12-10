import { useState, useEffect } from 'react';
import { WAVE_TIMINGS } from '../data/gameConstants';

export const useGhostBehavior = (isFrightened: boolean) => {
    const [currentMode, setCurrentMode] = useState<'chase' | 'scatter'>('scatter');
    const [currentWave, setCurrentWave] = useState(0);
  

        //  Scatter/Chase wave timer
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
            
                const ghostBehavior = isFrightened ? 'frightened' : currentMode
        
        return ghostBehavior;
    }