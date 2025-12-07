import { useRef, useCallback, useEffect } from "react";

// Global array for tracking audio
const globalAudioRefs: HTMLAudioElement[] = []

export const useSound = (soundPath: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        audioRef.current = new Audio(soundPath)
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
    }, [soundPath])

  const play = useCallback((isMuted: boolean) => {
    if (isMuted) return
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(err => {
        console.log('Audio play failed:', err)
      })
    }
  }, [])
  
  return play
}

// Export function for mute button
// Export function for mute button
export const stopAllSounds = () => {
  
  globalAudioRefs.forEach((audio) => {
    audio.pause()
    audio.currentTime = 0
  })
}
