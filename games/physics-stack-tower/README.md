# Physics Stack Tower

A casual stacking game where players drop moving blocks to build the tallest tower possible. Perfect alignments grant bonus points, while misaligned drops shrink blocks and make the challenge harder!

![Game Screenshot](assets/game-preview.png)

## Game Features

- **Physics-based stacking**: Realistic block physics with collision detection
- **Progressive difficulty**: Speed and precision requirements increase with each level
- **Perfect alignment system**: Precise drops reward bonus points and maintain block size
- **Visual feedback**: Smooth animations, particle effects, and visual cues
- **Score tracking**: Comprehensive scoring system with combo multipliers
- **Progress saving**: Game state automatically saved between sessions
- **Responsive design**: Works on desktop, tablet, and mobile devices

## How to Play

1. **Watch the moving block**: A block will move horizontally across the screen
2. **Time your drop**: Click or press SPACE when the block is positioned over the tower
3. **Aim for perfect alignment**: Perfect drops (80%+ overlap) give bonus points and keep block size
4. **Avoid misalignment**: Poor drops shrink the block, making future drops harder
5. **Build higher**: Keep stacking blocks to reach new heights and unlock levels
6. **Don't let it fall**: If a block misses the tower or becomes too small, the game ends

### Controls

- **Left Mouse Click / Touch**: Drop the current block
- **SPACE Key**: Drop the current block
- **P Key**: Pause/Resume game
- **R Key**: Reset current game
- **ESC Key**: Return to main menu

## Technical Implementation

### Architecture

The game follows a modular architecture with:

- `game.js`: Core game logic and state management
- `physics.js`: Physics engine for collision detection and tower stability
- `renderer.js`: Canvas-based rendering system with animations
- `levels.js`: Level definitions and difficulty progression

### Key Technical Features

- **HTML5 Canvas rendering** with high DPI support
- **Real-time physics simulation** for block interactions
- **Collision detection** with overlap calculations
- **Tower stability system** that determines when the tower collapses
- **localStorage integration** for saving game progress and high scores
- **Responsive canvas scaling** for different screen sizes
- **Particle effects** for visual feedback

### Game Mechanics

#### Block Physics
- Blocks move horizontally at increasing speeds
- Collision detection determines overlap with the tower
- Perfect alignment threshold (80%) determines block size reduction
- Tower stability calculated based on center of mass and support base

#### Scoring System
- **Base points**: 10 + (level × 5) per block placed
- **Perfect drop bonus**: 100 × combo streak for perfect alignments
- **Combo system**: Consecutive perfect drops multiply bonus points
- **Level progression**: Every 10 blocks placed advances to next level

#### Difficulty Progression
- **Speed increase**: Block movement speed increases with each level
- **Block size reduction**: Starting block width decreases over time
- **Precision requirements**: Perfect alignment threshold increases
- **Tower stability**: More sensitive to misalignment in higher levels

## Code Structure

```
physics-stack-tower/
├── index.html              # Main game HTML
├── README.md               # This documentation
└── assets/                 # Game assets
    ├── images/             # Game images and sprites
    └── audio/              # Sound effects and music
```

Integration files:
```
css/games/physics-stack-tower.css    # Game-specific styles
js/games/physics-stack-tower/
├── game.js                          # Core game logic
├── physics.js                       # Physics engine
├── renderer.js                      # Rendering system
└── levels.js                        # Level definitions
```

## Development Notes

### Design Decisions

- **Canvas-based rendering**: Chosen for smooth animations and precise control over visual effects
- **Modular architecture**: Separated concerns for better maintainability and testing
- **Physics-based gameplay**: Realistic physics make the game more engaging and challenging
- **Progressive difficulty**: Gradual increase in challenge keeps players engaged

### Performance Optimizations

- **Object pooling**: Reuse particle objects to reduce garbage collection
- **Efficient collision detection**: Only check relevant block pairs
- **Canvas optimization**: Use requestAnimationFrame for smooth 60 FPS rendering
- **Memory management**: Clean up event listeners and animations properly

### Known Issues

- **Mobile performance**: May experience frame drops on older mobile devices with many particles
- **Touch responsiveness**: Touch events may have slight delay compared to mouse clicks
- **Browser compatibility**: Some visual effects may not work in older browsers

### Future Improvements

- **Power-ups system**: Special blocks with unique abilities
- **Multiplayer mode**: Competitive stacking challenges
- **Custom themes**: Different visual styles and block designs
- **Achievement system**: Unlockable rewards for various accomplishments
- **Sound effects**: Audio feedback for better game feel
- **Leaderboards**: Global high score tracking

## Browser Compatibility

- **Chrome**: 88+ (Recommended)
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 88+

## Accessibility Features

- **Keyboard navigation**: Full game control via keyboard
- **High contrast mode**: Enhanced visibility for visual impairments
- **Screen reader support**: Proper ARIA labels and semantic HTML
- **Focus indicators**: Clear visual focus for keyboard users
- **Reduced motion**: Respects user's motion preferences

## Installation and Setup

1. Ensure all required files are in the correct directory structure
2. Open `index.html` in a modern web browser
3. The game will automatically initialize and be ready to play
4. No additional setup or dependencies required

## License

This game is part of the Rise Arena platform and follows the project's licensing terms.
