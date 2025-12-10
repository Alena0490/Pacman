import { useRef, useCallback, useEffect } from "react";

// Global array for tracking audio
const globalAudioRefs: HTMLAudioElement[] = []

type UseSoundOptions = {
  loop?: boolean
  volume?: number
}

export const useSound = (soundPath: string, options?: UseSoundOptions) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        audioRef.current = new Audio(soundPath)

            // Set loop from options:
            if (options?.loop) {
            audioRef.current.loop = true
            }
            
            // Set volume from options:
            if (options?.volume !== undefined) {
            audioRef.current.volume = options.volume
            }

        globalAudioRefs.push(audioRef.current)
        
        return () => {
            if (audioRef.current) {
            audioRef.current.pause()
            
            const index = globalAudioRefs.indexOf(audioRef.current)
            if (index > -1) {
                globalAudioRefs.splice(index, 1)
            }
            
            audioRef.current = null
            }
        }
    }, [soundPath, options])

  const play = useCallback((isMuted: boolean) => {
    if (isMuted) return
    
    if (audioRef.current) {
        // Restart sound if not looping
        if (!audioRef.current.loop) {
            audioRef.current.currentTime = 0
        }
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(err => {
        console.log('Audio play failed:', err)
      })
    }
  }, [])

    // Stop function
    const stop = useCallback(() => {
        if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        }
    }, [])

  
    return { play, stop }
}

// Export function for mute button
export const stopAllSounds = () => {
  
  globalAudioRefs.forEach((audio) => {
    audio.pause()
    audio.currentTime = 0
  })
}
