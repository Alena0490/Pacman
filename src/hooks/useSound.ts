import { useRef, useCallback, useEffect } from "react";

export const useSound = (soundPath: string) => {
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {

        // Initialize audio on first call
        audioRef.current = new Audio(soundPath)

        // ← CLEANUP
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()      // Stop playback
                audioRef.current = null        // Remove reference
            }
        }
    }, [soundPath])

      const play = useCallback(() => {
            if (audioRef.current) {
                // Reset to start if already playing
                audioRef.current.currentTime = 0
                audioRef.current.play().catch(err => {
                    console.log('Audio play failed:', err)
                })
            }
        }, [])
        return play
    }