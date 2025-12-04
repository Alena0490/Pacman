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

    // dying mouth – symetricky rostoucí koláč (výseč kruhu), R o kousek větší než tělo
    const dyingMouthValues = `
    M 50 50 L 97.271 41.665 A 55 55 0 1 1 97.271 58.335 Z;
    M 50 50 L 89.319 22.468 A 55 55 0 1 1 89.319 77.532 Z;
    M 50 50 L 66.417  4.895 A 55 55 0 1 1 66.417 95.105 Z;
    M 50 50 L 33.583  4.895 A 55 55 0 1 1 33.583 95.105 Z;
    M 50 50 L  8.431 26.000 A 55 55 0 1 1  8.431 74.000 Z;
    M 50 50 L  2.000 50.000 A 55 55 0 1 1  2.000 50.000 Z
  `;

  const upperValues = isEating ? upperValuesEating : upperValuesNormal;
  const lowerValues = isEating ? lowerValuesEating : lowerValuesNormal;

// DYING SVG – mouth opens wider (no scale), similar to arcade
// DYING SVG – koláčový graf, který zakryje celé tělo

  if (isDying) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`animated-pacman dying ${className}`}
        data-direction={direction.toLowerCase()}
        style={{ width: "100%", height: "100%" }}
      >
        {/* žluté tělo */}
        <circle cx="50" cy="50" r="45" fill="currentColor">
          <animate
            attributeName="fill-opacity"
            dur="1.5s"
            values="1;1;0"
            fill="freeze"
          />
        </circle>

        {/* tmavý koláč – výřez, který se symetricky otevírá */}
        <path
          d="M 50 50 L 97.271 41.665 A 55 55 0 0 1 97.271 58.335 Z"
          fill="#050318"
        >
          <animate
            attributeName="d"
            dur="1.5s"
            fill="freeze"
            values={dyingMouthValues}
          />
        </path>

        {/* oko – rychle zmizí */}
        <circle cx="50" cy="30" r="6" fill="#a16910">
          <animate
            attributeName="r"
            dur="0.25s"
            values="6;0"
            keyTimes="0;1"
            fill="freeze"
          />
        </circle>
      </svg>
    );
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
