// ===== AUDIO HOOK ===== //
// Custom hook for playing game sounds with global audio management
// Supports looping, volume control, and mute functionality

import { useRef, useCallback, useEffect } from "react";

// Global registry for tracking all active audio instances
// Used by stopAllSounds() to mute all game audio at once
const globalAudioRefs: HTMLAudioElement[] = []

// Hook options for configuring audio playback
type UseSoundOptions = {
  loop?: boolean // Whether audio should loop continuously
  volume?: number // Volume level (0.0 to 1.0)
}

export const useSound = (soundPath: string, options?: UseSoundOptions) => {

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isPlayingRef = useRef(false) // Track playing state to prevent overlapping

    // Stop audio playback and reset to beginning
    const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      isPlayingRef.current = false
    }
  }, [])

    useEffect(() => {
        // Initialize audio element
        audioRef.current = new Audio(soundPath)

            // Configure looping if specified
            if (options?.loop) {
            audioRef.current.loop = true
            }

            // Skip silent intro (start at 100ms to avoid audio artifacts)
            // audioRef.current.addEventListener('loadeddata', () => {
            //   if (audioRef.current) {
            //     audioRef.current.currentTime = 0.1  
            //   }
            // })
            
            // Set volume if specified
            if (options?.volume !== undefined) {
            audioRef.current.volume = options.volume
            }
        
        // Register audio in global list
        globalAudioRefs.push(audioRef.current)
        
        // Cleanup on unmount
        return () => {
            if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
            
            // Remove from global registry
            const index = globalAudioRefs.indexOf(audioRef.current)
            if (index > -1) {
                globalAudioRefs.splice(index, 1)
            }
            
            audioRef.current = null
            isPlayingRef.current = false
            }
        }
    }, [soundPath, options?.loop, options?.volume])

    const play = useCallback((isMuted: boolean) => {
    // Don't play if game is muted
    if (isMuted) {
      stop()  // ← Stop if muted
      return
    }

    if (audioRef.current) {
      // Prevent restarting already playing audio (important for loops)
      if (isPlayingRef.current && !audioRef.current.paused) {
        return
      }
      
      // Looping audio: reset to start if near end to ensure seamless loop
      const timeLeft = audioRef.current.duration - audioRef.current.currentTime
        if (timeLeft < 0.1 && !audioRef.current.paused) {
          audioRef.current.currentTime = 0

      }
      
      audioRef.current.play()
        .then(() => {
          isPlayingRef.current = true
        })
        .catch(err => {
          console.log('Audio play failed:', err)
          isPlayingRef.current = false
        })
    }
  }, [stop])


    return { play, stop }
}

// ===== GLOBAL AUDIO CONTROL ===== //
// Stops all registered audio instances (used by mute button)
export const stopAllSounds = () => {
  globalAudioRefs.forEach((audio) => {
    audio.pause()
    audio.currentTime = 0
  })
}
