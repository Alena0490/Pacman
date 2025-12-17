// ===== LIVES DISPLAY COMPONENT ===== //
// Shows remaining lives as Pac-Man icons in the game HUD

import PacmanIcon from '../img/pacman-icon.svg'  // Mini Pacman SVG

type LivesProp = {
  lives: number // Current number of remaining lives
}

const Lives = ({ lives }: LivesProp) => {
  return (
    <div className="lives">
      <p> 
        <span className="lives-img">
        {/* Render Pac-Man icon for each remaining life */}
        {Array.from({ length: lives }).map((_, i) => (
            <img 
            key={i} 
            src={PacmanIcon} 
            alt="Life" 
            className="life-icon"
            />
        ))}
        </span>
      </p>
    </div>
  )
}

export default Lives
