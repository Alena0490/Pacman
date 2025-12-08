type AnimatedGhostProps = {
  ghostIndex: 0 | 1 | 2 | 3
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  isScared?: boolean
  isFlashing?: boolean
  isEaten?: boolean
  className?: string
}

const AnimatedGhost = ({ 
  ghostIndex, 
  direction, 
  isScared = false, 
  isFlashing = false,
  isEaten = false,
  className = ''
}: AnimatedGhostProps) => {
  
  // Pupil possition - ghost move direction
  const pupilOffsets = {
    'UP': { x: 0, y: -5 },
    'DOWN': { x: 0, y: 5 },
    'LEFT': { x: -4, y: 0 },
    'RIGHT': { x: 4, y: 0 }
  }
  
  const offset = pupilOffsets[direction]
  
  // If eaten (eyes only)
  if (isEaten) {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={`animated-ghost ${className}`}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Left eye white */}
        <ellipse cx="30.5" cy="42" rx="11.5" ry="16" fill="white"/>
        {/* Left pupil */}
        <ellipse 
          cx={30.5 + offset.x} 
          cy={42 + offset.y} 
          rx="6" 
          ry="8.5" 
          fill="#0000ff"
          className="pupil"
        />
        
        {/* Right eye white */}
        <ellipse cx="69.5" cy="42" rx="11.5" ry="16" fill="white"/>
        {/* Right pupil*/}
        <ellipse 
          cx={69.5 + offset.x} 
          cy={42 + offset.y} 
          rx="6" 
          ry="8.5" 
          fill="#0000ff"
          className="pupil"
        />
      </svg>
    )
  }
  
/*** SCARED GHOST */
// Scared with flashing
  // Flashing version - white ghost
  if (isFlashing) {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={`animated-ghost frightened ending ${className}`}
      >
        {/* White ghost body */}
        <path 
            d="M15.37 91.09V41.18C15.37 23.65 29.81 9.45 47.62 9.45h4.76c17.81 0 32.25 14.2 32.25 31.73v49.91c0 3.55-4.42 5.19-6.82 2.53l-6.58-7.3c-1.36-1.51-3.68-1.51-5.04 0l-6.58 7.3c-1.36 1.51-3.68 1.51-5.04 0l-6.58-7.3c-1.36-1.51-3.68-1.51-5.04 0l-6.58 7.3c-1.36 1.51-3.68 1.51-5.04 0l-6.58-7.3c-2.4-2.66-6.82-1.02-6.82 2.53z" 
            fill="currentColor"
            className="ghost-body"
          />

           {/* Red ghost mouth */}
          <path 
            d="M25 70c2.76 0 5-2.21 5-4.94s-2.24-4.94-5-4.94-5 2.21-5 4.94 2.24 4.94 5 4.94zm15 0c2.76 0 5-2.21 5-4.94s-2.24-4.94-5-4.94-5 2.21-5 4.94 2.24 4.94 5 4.94zm15 0c2.76 0 5-2.21 5-4.94s-2.24-4.94-5-4.94-5 2.21-5 4.94 2.24 4.94 5 4.94zm15 0c2.76 0 5-2.21 5-4.94s-2.24-4.94-5-4.94-5 2.21-5 4.94 2.24 4.94 5 4.94z" 
            fill="currentColor"
            className="ghost-mouth"
          />
        
        {/* Red eyes */}
        <ellipse 
          cx="30.5" 
          cy="40" 
          rx="8" 
          ry="11" 
          fill="currentColor"
          className="ghost-eye"
        />

        <ellipse 
          cx="69.5" 
          cy="40" 
          rx="8" 
          ry="11" 
          fill="currentColor"
          className="ghost-eye"
        />
      </svg>
    )
  }

// Normal scared mode
  if (isScared) {
    return (
        <svg 
            viewBox="0 0 100 100" 
            className={`animated-ghost frightened ${className}`}
            style={{ 
                width: '100%', 
                height: '100%',
                filter: 'drop-shadow(0 0 0.5rem #2121FF90) drop-shadow(0 0 1rem #2121FF90)'
            }}
        >
        {/* Scared ghost - body */}
        <path 
          d="M15.37 91.09V41.18C15.37 23.65 29.81 9.45 47.62 9.45h4.76c17.81 0 32.25 14.2 32.25 31.73v49.91c0 3.55-4.42 5.19-6.82 2.53l-6.58-7.3c-1.36-1.51-3.68-1.51-5.04 0l-6.58 7.3c-1.36 1.51-3.68 1.51-5.04 0l-6.58-7.3c-1.36-1.51-3.68-1.51-5.04 0l-6.58 7.3c-1.36 1.51-3.68 1.51-5.04 0l-6.58-7.3c-2.4-2.66-6.82-1.02-6.82 2.53z" 
          fill="currentColor"  // Dark blue
        />
            {/* Wavy mouth */}
            <path 
                d="M25 70c2.76 0 5-2.21 5-4.94s-2.24-4.94-5-4.94-5 2.21-5 4.94 2.24 4.94 5 4.94zm15 0c2.76 0 5-2.21 5-4.94s-2.24-4.94-5-4.94-5 2.21-5 4.94 2.24 4.94 5 4.94zm15 0c2.76 0 5-2.21 5-4.94s-2.24-4.94-5-4.94-5 2.21-5 4.94 2.24 4.94 5 4.94zm15 0c2.76 0 5-2.21 5-4.94s-2.24-4.94-5-4.94-5 2.21-5 4.94 2.24 4.94 5 4.94z" 
                fill="#0000a0"  // Dark navy 
            />
        
        {/* Scared ghost eyes - no pupils */}
        <ellipse cx="30.5" cy="40" rx="8" ry="11" fill="white"/>  {/* Zmenšeno + posunuto nahoru */}
        <ellipse cx="69.5" cy="40" rx="8" ry="11" fill="white"/>
      </svg>
    )
  }

  /*** NORMAL GHOSTS */

    // Normal ghosts - body = ghostIndex
  const ghostBodies = [
    // Ghost 0 - Cyan (ghost1)
    <path 
      key="body"
      d="M15.37 91.09V41.18C15.37 23.65 29.81 9.45 47.62 9.45h4.76c17.81 0 32.25 14.2 32.25 31.73v49.91c0 3.55-4.42 5.19-6.82 2.53l-6.58-7.3c-1.36-1.51-3.68-1.51-5.04 0l-6.58 7.3c-1.36 1.51-3.68 1.51-5.04 0l-6.58-7.3c-1.36-1.51-3.68-1.51-5.04 0l-6.58 7.3c-1.36 1.51-3.68 1.51-5.04 0l-6.58-7.3c-2.4-2.66-6.82-1.02-6.82 2.53z" 
      fill="currentColor"
    />,
    
    // Ghost 1 - Pink (ghost2)
    <path 
      key="body"
      d="M15.37 91.09V41.18C15.37 23.65 29.81 9.45 47.62 9.45h4.76c17.81 0 32.25 14.2 32.25 31.73v49.91c0 3.55-4.42 5.19-6.82 2.53l-6.58-7.3c-1.36-1.51-3.68-1.51-5.04 0l-6.58 7.3c-1.36 1.51-3.68 1.51-5.04 0l-6.58-7.3c-1.36-1.51-3.68-1.51-5.04 0l-6.58 7.3c-1.36 1.51-3.68 1.51-5.04 0l-6.58-7.3c-2.4-2.66-6.82-1.02-6.82 2.53z" 
      fill="currentColor"
    />,
    
    // Ghost 2 - Red (ghost3)
    <path 
      key="body"
      d="M15.37 91.09V41.18C15.37 23.65 29.81 9.45 47.62 9.45h4.76c17.81 0 32.25 14.2 32.25 31.73v49.91c0 3.55-4.42 5.19-6.82 2.53l-6.58-7.3c-1.36-1.51-3.68-1.51-5.04 0l-6.58 7.3c-1.36 1.51-3.68 1.51-5.04 0l-6.58-7.3c-1.36-1.51-3.68-1.51-5.04 0l-6.58 7.3c-1.36 1.51-3.68 1.51-5.04 0l-6.58-7.3c-2.4-2.66-6.82-1.02-6.82 2.53z" 
      fill="currentColor"
    />,
    
    // Ghost 3 - Orange (ghost4)
    <path 
      key="body"
      d="M15.37 91.09V41.18C15.37 23.65 29.81 9.45 47.62 9.45h4.76c17.81 0 32.25 14.2 32.25 31.73v49.91c0 3.55-4.42 5.19-6.82 2.53l-6.58-7.3c-1.36-1.51-3.68-1.51-5.04 0l-6.58 7.3c-1.36 1.51-3.68 1.51-5.04 0l-6.58-7.3c-1.36-1.51-3.68-1.51-5.04 0l-6.58 7.3c-1.36 1.51-3.68 1.51-5.04 0l-6.58-7.3c-2.4-2.66-6.82-1.02-6.82 2.53z" 
      fill="currentColor"
    />
  ]


      return (
        <svg 
            viewBox="0 0 100 100" 
            className={`animated-ghost ${className}`}
            style={{ width: '100%', height: '100%' }}
            data-ghost={ghostIndex}
            data-direction={direction.toLowerCase()}
        >
      {/* Ghost body */}
      {ghostBodies[ghostIndex]}
      
      {/* Left eye - white */}
      <ellipse cx="30.5" cy="42" rx="11.5" ry="16" fill="white"/>
      {/* Left pupil - animated */}
      <ellipse 
        cx={30.5 + offset.x} 
        cy={42 + offset.y} 
        rx="6" 
        ry="8.5" 
        fill="#0000ff"
        className="pupil pupil-left"
      />
      
      {/* Right eye - white */}
      <ellipse cx="69.5" cy="42" rx="11.5" ry="16" fill="white"/>
      {/* Right pupil - animated */}
      <ellipse 
        cx={69.5 + offset.x} 
        cy={42 + offset.y} 
        rx="6" 
        ry="8.5" 
        fill="#0000ff"
        className="pupil pupil-right"
      />
    </svg>
  )
}

export default AnimatedGhost