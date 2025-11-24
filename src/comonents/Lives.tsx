type LivesProp = {
  lives: number
}

const Lives = ({lives}:LivesProp) => {
    return (
        <div className="lives">
            <p>Lives: <span>{'❤️'.repeat(lives)}</span></p>
        </div>
    )
}

export default Lives