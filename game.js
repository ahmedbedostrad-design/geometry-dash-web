class Game {
    constructor() {
        this.container = document.getElementById('gameContainer');
        this.scoreDisplay = document.getElementById('score');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.restartBtn = document.getElementById('restartBtn');

        this.score = 0;
        this.isGameOver = false;
        this.gameSpeed = 5;
        this.baseSpeed = 5;

        this.player = null;
        this.obstacles = [];
        this.coins = [];

        this.playerX = 400;
        this.playerY = 480;
        this.playerVelocityY = 0;
        this.playerJumping = false;
        this.gravity = 0.6;
        this.jumpPower = -15;

        this.init();
        this.bindEvents();
        this.gameLoop();
    }

    init() {
        // Create player
        this.player = document.createElement('div');
        this.player.className = 'player';
        this.player.style.left = this.playerX + 'px';
        this.player.style.top = this.playerY + 'px';
        this.container.appendChild(this.player);

        // Start spawning obstacles and coins
        this.spawnCycle = 0;
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.playerJump();
            }
        });

        document.addEventListener('click', () => {
            this.playerJump();
        });

        this.restartBtn.addEventListener('click', () => {
            location.reload();
        });
    }

    playerJump() {
        if (!this.playerJumping && !this.isGameOver) {
            this.playerVelocityY = this.jumpPower;
            this.playerJumping = true;
        }
    }

    updatePlayer() {
        // Apply gravity
        this.playerVelocityY += this.gravity;
        this.playerY += this.playerVelocityY;

        // Ground collision
        if (this.playerY >= 480) {
            this.playerY = 480;
            this.playerVelocityY = 0;
            this.playerJumping = false;
        }

        // Update player position
        this.player.style.top = this.playerY + 'px';
    }

    spawnObstacle() {
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        const randomX = Math.random() * 720 + 40;
        obstacle.style.left = randomX + 'px';
        obstacle.style.top = '-40px';
        this.container.appendChild(obstacle);
        
        this.obstacles.push({
            element: obstacle,
            x: randomX,
            y: -40
        });
    }

    spawnCoin() {
        const coin = document.createElement('div');
        coin.className = 'coin';
        const randomX = Math.random() * 760 + 20;
        coin.style.left = randomX + 'px';
        coin.style.top = '-20px';
        this.container.appendChild(coin);

        this.coins.push({
            element: coin,
            x: randomX,
            y: -20,
            collected: false
        });
    }

    updateObstacles() {
        this.obstacles.forEach((obs, index) => {
            obs.y += this.gameSpeed;
            obs.element.style.top = obs.y + 'px';

            // Collision detection
            if (this.checkCollision(this.playerX, this.playerY, obs.x, obs.y)) {
                this.endGame();
            }

            // Remove if off screen
            if (obs.y > 600) {
                obs.element.remove();
                this.obstacles.splice(index, 1);
            }
        });
    }

    updateCoins() {
        this.coins.forEach((coin, index) => {
            coin.y += this.gameSpeed;
            coin.element.style.top = coin.y + 'px';

            // Collision detection
            if (!coin.collected && this.checkCollision(this.playerX, this.playerY, coin.x, coin.y)) {
                coin.collected = true;
                coin.element.remove();
                this.coins.splice(index, 1);
                this.addScore(10);
            }

            // Remove if off screen
            if (coin.y > 600) {
                coin.element.remove();
                this.coins.splice(index, 1);
            }
        });
    }

    checkCollision(px, py, ox, oy) {
        return px < ox + 40 &&
               px + 30 > ox &&
               py < oy + 40 &&
               py + 30 > oy;
    }

    addScore(points) {
        this.score += points;
        this.scoreDisplay.textContent = 'Score: ' + this.score;

        // Increase difficulty
        this.gameSpeed = this.baseSpeed + (this.score / 100);
    }

    endGame() {
        this.isGameOver = true;
        this.gameOverScreen.classList.add('show');
        this.finalScoreDisplay.textContent = 'Final Score: ' + this.score;
    }

    gameLoop() {
        if (!this.isGameOver) {
            this.updatePlayer();
            this.updateObstacles();
            this.updateCoins();

            // Spawn new obstacles and coins
            this.spawnCycle++;
            if (this.spawnCycle % 40 === 0) {
                this.spawnObstacle();
            }
            if (this.spawnCycle % 60 === 0) {
                this.spawnCoin();
            }
        }

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    new Game();
});