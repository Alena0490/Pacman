import { useState, useEffect } from "react"
import "./CoffeeBreak.css"
import PacMan from "../svg/AnimatedPacman"
import Ghost from "../svg/AnimatedGhosts"

type CoffeeBreakProps = {
  isMuted: boolean
  playIntermission: (muted: boolean) => void
}

const CoffeeBreak = ({ isMuted, playIntermission }: CoffeeBreakProps) => {
    const [phase, setPhase] = useState<'chase' | 'reverse'>('chase')

    useEffect(() => {
        playIntermission(isMuted)
        // Switch to reverse phase after 4 seconds
        const timer = setTimeout(() => {
            setPhase('reverse')
        }, 4000)

        return () => clearTimeout(timer)
    }, [playIntermission, isMuted])

    return (
        <div className="coffee-break-wrapper">
            <div className="coffee-break">
                {/* Phase 1: Blinky chases Pac-Man */}
                {phase === 'chase' && (
                    <>
                        <div className="pacman-container chase">
                            <PacMan 
                                direction="right"
                                isDying={false}
                                isEating={false}
                            />
                        </div>
                        <div className="ghost-container chase">
                            <Ghost 
                                ghostIndex={0}
                                direction="RIGHT"
                                isScared={false}
                                isFlashing={false}
                                isEaten={false}
                                className="cutscene-ghost"
                            />
                        </div>
                    </>
                )}

                {/* Phase 2: Super Pac-Man chases frightened Blinky */}
                {phase === 'reverse' && (
                    <>
                        <div className="ghost-container reverse frightened">
                            <Ghost 
                                ghostIndex={0}
                                direction="LEFT"
                                isScared={true}
                                isFlashing={false}
                                isEaten={false}
                                className="cutscene-ghost"
                            />
                        </div>
                        <div className="pacman-container reverse large">
                            <PacMan 
                                direction="left"
                                isDying={false}
                                isEating={true}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default CoffeeBreak

