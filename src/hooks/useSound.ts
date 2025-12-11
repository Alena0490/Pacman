import { useRef, useCallback, useEffect } from "react";

// Global array for tracking audio
const globalAudioRefs: HTMLAudioElement[] = []

type UseSoundOptions = {
  loop?: boolean
  volume?: number
}

export const useSound = (soundPath: string, options?: UseSoundOptions) => {

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isPlayingRef = useRef(false) 

    const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      isPlayingRef.current = false
    }
  }, [])

    useEffect(() => {
        audioRef.current = new Audio(soundPath)

            // Set loop from options:
            if (options?.loop) {
            audioRef.current.loop = true
            }

            // ✅ Skip the silent part at the beginning of the audio
            audioRef.current.addEventListener('loadeddata', () => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0.1  // Start from 100ms 
              }
            })
            
            // Set volume from options:
            if (options?.volume !== undefined) {
            audioRef.current.volume = options.volume
            }

        globalAudioRefs.push(audioRef.current)
        
        return () => {
            if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
            
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
    if (isMuted) {
      stop()  // ← Stop if muted
      return
    }

    if (audioRef.current) {
      // Don't restart if already playing (important for loops!)
      if (isPlayingRef.current && !audioRef.current.paused) {
        return
      }
      
        // If there is left less than 0.05 seconds, restart from beginning
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

// Export function for mute button
export const stopAllSounds = () => {
  globalAudioRefs.forEach((audio) => {
    audio.pause()
    audio.currentTime = 0
  })
}
