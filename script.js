document.addEventListener('DOMContentLoaded', () => {
    // Game configuration
    const config = {
        gridSize: 8,
        mineCount: 10,
        safeTile: '🍊',
        mineTile: '💣',
        flagTile: '🚩'
    };
    
    // Game state
    let gameState = {
        grid: [],
        mines: [],
        revealed: [],
        flagged: [],
        safeTiles: 0,
        gameOver: false
    };
    
    // DOM elements
    const gameGrid = document.getElementById('game-grid');
    const safeFoundElement = document.getElementById('safe-found');
    const safeTotalElement = document.getElementById('safe-total');
    const restartBtn = document.getElementById('restart-btn');
    const tryAgainBtn = document.getElementById('try-again-btn');
    const gameOverScreen = document.getElementById('game-over');
    const clickSound = document.getElementById('click-sound');
    const flagSound = document.getElementById('flag-sound');
    const explosionSound = document.getElementById('explosion-sound');
    const bgMusic = document.getElementById('bg-music');
    
    // Initialize game
    initGame();
    
    // Event listeners
    restartBtn.addEventListener('click', initGame);
    tryAgainBtn.addEventListener('click', initGame);
    
    // Set background music volume
    bgMusic.volume = 0.2;
    bgMusic.play().catch(e => console.log("Autoplay prevented, user interaction needed"));
    
    function initGame() {
        // Reset game state
        gameState = {
            grid: Array(config.gridSize * config.gridSize).fill(0),
            mines: [],
            revealed: Array(config.gridSize * config.gridSize).fill(false),
            flagged: Array(config.gridSize * config.gridSize).fill(false),
            safeTiles: 0,
            gameOver: false
        };
        
        // Hide game over screen
        gameOverScreen.classList.remove('show');
        
        // Calculate total safe tiles
        const totalSafeTiles = (config.gridSize * config.gridSize) - config.mineCount;
        safeTotalElement.textContent = totalSafeTiles;
        safeFoundElement.textContent = '0';
        
        // Generate mines
        generateMines();
        
        // Create grid
        createGrid();
    }
    
    function generateMines() {
        const totalTiles = config.gridSize * config.gridSize;
        gameState.mines = [];
        
        while (gameState.mines.length < config.mineCount) {
            const randomIndex = Math.floor(Math.random() * totalTiles);
            if (!gameState.mines.includes(randomIndex)) {
                gameState.mines.push(randomIndex);
                gameState.grid[randomIndex] = 1; // 1 represents mine
            }
        }
    }
    
    function createGrid() {
        gameGrid.innerHTML = '';
        gameGrid.style.gridTemplateColumns = `repeat(${config.gridSize}, 1fr)`;
        
        for (let i = 0; i < config.gridSize * config.gridSize; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.index = i;
            
            // Add event listeners
            tile.addEventListener('click', handleTileClick);
            tile.addEventListener('contextmenu', handleRightClick);
            tile.addEventListener('touchstart', handleTouchStart, { passive: false });
            tile.addEventListener('touchend', handleTouchEnd, { passive: false });
            
            gameGrid.appendChild(tile);
        }
    }
    
    function handleTileClick(e) {
        if (gameState.gameOver) return;
        
        const tile = e.currentTarget;
        const index = parseInt(tile.dataset.index);
        
        // Don't process if tile is flagged or already revealed
        if (gameState.flagged[index] || gameState.revealed[index]) return;
        
        // Play click sound
        clickSound.currentTime = 0;
        clickSound.play();
        
        // Reveal tile
        revealTile(tile, index);
    }
    
    function handleRightClick(e) {
        e.preventDefault();
        if (gameState.gameOver) return;
        
        const tile = e.currentTarget;
        const index = parseInt(tile.dataset.index);
        
        // Don't process if tile is already revealed
        if (gameState.revealed[index]) return;
        
        // Toggle flag
        gameState.flagged[index] = !gameState.flagged[index];
        
        // Play flag sound
        flagSound.currentTime = 0;
        flagSound.play();
        
        // Update tile appearance
        if (gameState.flagged[index]) {
            tile.textContent = config.flagTile;
        } else {
            tile.textContent = '';
        }
    }
    
    // For mobile long-press to flag
    let touchTimer;
    function handleTouchStart(e) {
        if (gameState.gameOver) return;
        
        const tile = e.currentTarget;
        const index = parseInt(tile.dataset.index);
        
        // Don't process if tile is already revealed
        if (gameState.revealed[index]) return;
        
        touchTimer = setTimeout(() => {
            // Toggle flag
            gameState.flagged[index] = !gameState.flagged[index];
            
            // Play flag sound
            flagSound.currentTime = 0;
            flagSound.play();
            
            // Update tile appearance
            if (gameState.flagged[index]) {
                tile.textContent = config.flagTile;
            } else {
                tile.textContent = '';
            }
        }, 500); // 500ms for long press
    }
    
    function handleTouchEnd(e) {
        clearTimeout(touchTimer);
    }
    
    function revealTile(tile, index) {
        // Mark tile as revealed
        gameState.revealed[index] = true;
        tile.classList.add('revealed');
        
        // Check if it's a mine
        if (gameState.grid[index] === 1) {
            // It's a mine - game over
            tile.textContent = config.mineTile;
            tile.classList.add('mine');
            
            // Play explosion sound
            explosionSound.currentTime = 0;
            explosionSound.play();
            
            // Show all mines
            revealAllMines();
            
            // Game over
            gameOver();
            return;
        }
        
        // It's a safe tile
        tile.textContent = config.safeTile;
        tile.classList.add('safe');
        gameState.safeTiles++;
        safeFoundElement.textContent = gameState.safeTiles;
        
        // Check for win condition
        const totalSafeTiles = (config.gridSize * config.gridSize) - config.mineCount;
        if (gameState.safeTiles === totalSafeTiles) {
            // Player won
            gameOver(true);
        }
    }
    
    function revealAllMines() {
        gameState.mines.forEach(index => {
            if (!gameState.revealed[index]) {
                const tile = gameGrid.children[index];
                tile.textContent = config.mineTile;
                tile.classList.add('revealed', 'mine');
            }
        });
    }
    
    function gameOver(isWin = false) {
        gameState.gameOver = true;
        
        if (isWin) {
            gameOverScreen.querySelector('h2').textContent = 'YOU WIN!';
            gameOverScreen.querySelector('h2').style.color = '#4CAF50';
        } else {
            gameOverScreen.querySelector('h2').textContent = 'GAME OVER';
            gameOverScreen.querySelector('h2').style.color = '#ff5200';
        }
        
        gameOverScreen.classList.add('show');
    }
});
