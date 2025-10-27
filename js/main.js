/**
 * @file main.js
 * @game Stack Hero - Main Menu
 * @author Tiwalade Adegoke
 * @date May 16th - October 14th, 2025
 *
 * @description
 * Main menu functionality for the Stack Hero platform.
 * Handles game statistics loading and game info display.
 */

/**
 * Load and display game statistics from localStorage
 */
function loadGameStats() {
    const highScores = JSON.parse(localStorage.getItem('physicsStackTower_highScores') || '[]');
    const gamesPlayed = parseInt(localStorage.getItem('physicsStackTower_gamesPlayed') || '0');
    
    if (highScores.length > 0) {
        const bestScore = Math.max(...highScores.map(score => score.score));
        const bestLevel = Math.max(...highScores.map(score => score.level));
        
        document.getElementById('highScore').textContent = bestScore.toLocaleString();
        document.getElementById('bestLevel').textContent = bestLevel;
    }
    
    document.getElementById('gamesPlayed').textContent = gamesPlayed;
}

/**
 * Show/hide game info panel
 */
function showGameInfo() {
    const gameInfo = document.getElementById('gameInfo');
    if (!gameInfo) {
        console.error('Game info element not found');
        return;
    }
    
    if (gameInfo.style.display === 'none' || gameInfo.style.display === '') {
        gameInfo.style.display = 'block';
        // Scroll to game info smoothly
        gameInfo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        gameInfo.style.display = 'none';
    }
}

/**
 * Initialize main menu when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Main menu initialized');
    loadGameStats();
    
    // Add click event listener to game info button
    const gameInfoBtn = document.querySelector('.menu-btn-secondary');
    if (gameInfoBtn) {
        gameInfoBtn.addEventListener('click', showGameInfo);
    }
});
