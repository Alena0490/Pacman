import PacmanIcon from '../img/pacman-icon.svg'  // Mini Pacman SVG

type LivesProp = {
  lives: number
}

const Lives = ({ lives }: LivesProp) => {
  return (
    <div className="lives">
      <p>
        Lives: 
        <span className="lives-img">
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