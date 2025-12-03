type AnimatedPacmanProps = {
  direction: string;
  isDying?: boolean;
  isEating?: boolean;
  className?: string;
};

const AnimatedPacman = ({
  direction,
  isDying = false,
  isEating = false,
  className = "",
}: AnimatedPacmanProps) => {
  // mouth shapes for normal vs eating (upper + lower jaw)
  const upperValuesNormal = `
    M 50 50 L 95 35 L 95 50 Z;
    M 50 50 L 95 49 L 95 50 Z;
    M 50 50 L 95 35 L 95 50 Z
  `;

  const lowerValuesNormal = `
    M 50 50 L 95 50 L 95 65 Z;
    M 50 50 L 95 50 L 95 51 Z;
    M 50 50 L 95 50 L 95 65 Z
  `;

  // stronger bite when eating (more open + tighter close)
  const upperValuesEating = `
    M 50 50 L 95 5 L 95 50 Z;
    M 50 50 L 95 50 L 95 50 Z;
    M 50 50 L 95 5 L 95 50 Z
  `;

  const lowerValuesEating = `
    M 50 50 L 95 50 L 95 95 Z;
    M 50 50 L 95 50 L 95 50 Z;
    M 50 50 L 95 50 L 95 95 Z
  `;

  const upperValues = isEating ? upperValuesEating : upperValuesNormal;
  const lowerValues = isEating ? lowerValuesEating : lowerValuesNormal;

    // DYING SVG – separate animation, different from normal chomp
   if (isDying) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`animated-pacman dying ${className}`}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Yellow body - stays */}
      <circle cx="50" cy="50" r="45" fill="currentColor" />

      {/* Eye */}
      <circle cx="50" cy="30" r="6" fill="#a16910">
        <animate attributeName="r" values="6;0" dur="0.5s" fill="freeze" />
      </circle>

      {/* Black mouth gradually opens to full circle */}
        <path d="M 50 50 L 95 35 L 95 65 Z" fill="#050318">
        <animate
            attributeName="d"
            dur="1s"
            fill="freeze"
            values="M 50 50 L 95 35 L 95 65 Z; M 50 50 L 95 5 L 95 95 Z; M 50 5 A 45 45 0 1 1 50 95 A 45 45 0 1 1 50 5 Z"
        />
        </path>
    </svg>
  )
}

  // NORMAL CHOMP (with optional stronger bite on isEating)
  return (
    <svg
      viewBox="0 0 100 100"
      className={`animated-pacman ${isEating ? "eating" : ""} ${className}`}
      style={{ width: "100%", height: "100%" }}
      data-direction={direction.toLowerCase()}
    >
      {/* Body – static circle, rotation handled by your .pacman-* CSS */}
      <circle cx="50" cy="50" r="45" fill="currentColor" />

      {/* Upper jaw */}
      <path d="M 50 50 L 95 20 L 95 50 Z" fill="#050318">
        <animate
          attributeName="d"
          dur="0.32s"
          repeatCount="indefinite"
          values={upperValues}
          keyTimes="0;0.5;1"
          calcMode="spline"
          keySplines="0.42 0 1 1; 0 0 0.58 1"
        />
      </path>

      {/* Lower jaw */}
      <path d="M 50 50 L 95 50 L 95 80 Z" fill="#050318">
        <animate
          attributeName="d"
          dur="0.32s"
          repeatCount="indefinite"
          values={lowerValues}
          keyTimes="0;0.5;1"
          calcMode="spline"
          keySplines="0.42 0 1 1; 0 0 0.58 1"
        />
      </path>

      {/* Eye */}
      <circle cx="50" cy="30" r="6" fill="#a16910" />
    </svg>
  );
};

export default AnimatedPacman;
