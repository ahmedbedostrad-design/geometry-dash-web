class GeometryDashGame {
    constructor() {
        // DOM Elements
        this.container = document.getElementById('gameContainer');
        this.gameWorld = document.getElementById('gameWorld');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.scoreDisplay = document.getElementById('score');
        this.levelDisplay = document.getElementById('level');
        this.attemptsDisplay = document.getElementById('attempts');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.finalLevelDisplay = document.getElementById('finalLevel');
        this.finalCollectiblesDisplay = document.getElementById('finalCollectibles');

        // Game State
        this.isPlaying = false;
        this.isGameOver = false;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.attempts = 3;
        this.collectibles = 0;
        this.gameSpeed = 8;
        this.baseSpeed = 8;
        this.spawnDistance = 0;

        // Player
        this.player = null;
        this.playerY = 0;
        this.playerVelocityY = 0;
        this.isJumping = false;
        this.gravity = 0.7;
        this.jumpPower = -18;
        this.groundLevel = window.innerHeight - 150;

        // Game Objects
        this.obstacles = [];
        this.collectibles_list = [];
        this.grounds = [];
        this.particles = [];

        this.init();
        this.bindEvents();
        this.gameLoop();
    }

    init() {
        // Create ground
        this.createGround(0, this.groundLevel, window.innerWidth, 70);

        // Create player
        this.player = document.createElement('div');
        this.player.className = 'player';
        this.player.style.left = '50px';
        this.player.style.bottom = '150px';
        this.gameWorld.appendChild(this.player);
        this.playerY = this.groundLevel - 40;
    }

    bindEvents() {
        // Start button
        const startBtn = document.querySelector('.start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startGame();
            });
        }

        // Jump controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isPlaying && !this.isGameOver) {
                e.preventDefault();
                this.jump();
            }
        });

        this.gameWorld.addEventListener('click', () => {
            if (this.isPlaying && !this.isGameOver) {
                this.jump();
            }
        });

        // Restart button
        const restartBtn = document.querySelector('.restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                location.reload();
            });
        }
    }

    startGame() {
        console.log('Game Started');
        this.startScreen.classList.add('hidden');
        this.isPlaying = true;
        this.spawnLevel();
    }

    spawnLevel() {
        // Clear old obstacles
        this.obstacles.forEach(obs => {
            if (obs.element && obs.element.parentNode) {
                obs.element.remove();
            }
        });
        this.collectibles_list.forEach(col => {
            if (col.element && col.element.parentNode) {
                col.element.remove();
            }
        });
        this.obstacles = [];
        this.collectibles_list = [];

        // Spawn pattern based on level
        const patternCount = 5 + (this.level * 2);
        for (let i = 0; i < patternCount; i++) {
            const posX = 1500 + (i * 400);
            this.spawnObstacle(posX, Math.random() * 3);
            if (Math.random() > 0.5) {
                this.spawnCollectible(posX + 150, this.groundLevel - 100);
            }
        }
    }

    createGround(x, y, width, height) {
        const ground = document.createElement('div');
        ground.className = 'ground';
        ground.style.left = x + 'px';
        ground.style.top = y + 'px';
        ground.style.width = width + 'px';
        ground.style.height = height + 'px';
        this.gameWorld.appendChild(ground);
        this.grounds.push({ element: ground, x: x });
    }

    spawnObstacle(x, type) {
        const spike = document.createElement('div');
        const sizeOptions = ['spike-small', 'spike-medium', 'spike-large'];
        const size = sizeOptions[Math.floor(type)];
        spike.className = `spike ${size}`;
        spike.style.left = x + 'px';
        spike.style.bottom = (150 - (type === 2 ? 60 : type === 1 ? 40 : 30)) + 'px';

        this.gameWorld.appendChild(spike);
        
        const width = Math.floor(type) === 2 ? 50 : Math.floor(type) === 1 ? 40 : 30;
        this.obstacles.push({
            element: spike,
            x: x,
            width: width,
            type: Math.floor(type),
            passed: false
        });
    }

    spawnCollectible(x, y) {
        const collectible = document.createElement('div');
        collectible.className = 'collectible';
        collectible.style.left = x + 'px';
        collectible.style.top = y + 'px';
        this.gameWorld.appendChild(collectible);

        this.collectibles_list.push({
            element: collectible,
            x: x,
            y: y,
            collected: false
        });
    }

    jump() {
        if (!this.isJumping) {
            this.playerVelocityY = this.jumpPower;
            this.isJumping = true;
            this.player.classList.add('jumping');
            this.createJumpParticles();
        }
    }

    createJumpParticles() {
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle spark';
            particle.style.left = '70px';
            particle.style.bottom = '150px';
            this.gameWorld.appendChild(particle);

            const angle = (Math.PI * 2 * i) / 5;
            const velocity = { x: Math.cos(angle) * 5, y: Math.sin(angle) * 5 };
            let life = 0.5;

            const animate = () => {
                particle.style.left = (70 + velocity.x * (0.5 - life)) + 'px';
                particle.style.bottom = (150 + velocity.y * (0.5 - life)) + 'px';
                particle.style.opacity = life * 2;
                life -= 0.01;

                if (life > 0) {
                    requestAnimationFrame(animate);
                } else {
                    if (particle.parentNode) {
                        particle.remove();
                    }
                }
            };
            animate();
        }
    }

    updatePlayer() {
        // Apply gravity
        this.playerVelocityY += this.gravity;
        this.playerY += this.playerVelocityY;

        // Ground collision
        if (this.playerY >= this.groundLevel - 40) {
            this.playerY = this.groundLevel - 40;
            this.playerVelocityY = 0;
            this.isJumping = false;
            this.player.classList.remove('jumping');
        }

        // Update visual position
        const bottom = this.playerY - (this.groundLevel - 40) + 150;
        this.player.style.bottom = bottom + 'px';
    }

    checkCollisions() {
        const playerLeft = 50;
        const playerRight = 90;
        const playerTop = this.playerY;
        const playerBottom = this.playerY + 40;

        // Check obstacles
        for (let i = 0; i < this.obstacles.length; i++) {
            const obs = this.obstacles[i];
            const obsLeft = obs.x;
            const obsRight = obs.x + obs.width;
            const obsBottom = this.groundLevel - 60;
            const obsTop = obsBottom - obs.width;

            if (playerRight > obsLeft && playerLeft < obsRight &&
                playerBottom > obsTop && playerTop < obsBottom) {
                this.gameOver();
                return;
            }

            // Award points for passing
            if (!obs.passed && playerLeft > obsRight) {
                obs.passed = true;
                this.addScore(10);
            }
        }

        // Check collectibles
        for (let i = 0; i < this.collectibles_list.length; i++) {
            const col = this.collectibles_list[i];
            if (!col.collected) {
                const distance = Math.sqrt(
                    Math.pow(playerLeft - col.x, 2) + Math.pow(playerTop - col.y, 2)
                );

                if (distance < 50) {
                    col.collected = true;
                    if (col.element && col.element.parentNode) {
                        col.element.remove();
                    }
                    this.addScore(25);
                    this.collectibles++;
                    this.createCollectParticles(col.x, col.y);
                }
            }
        }
    }

    createCollectParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle spark';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.background = '#ffff00';
            particle.style.boxShadow = '0 0 5px #ffff00';
            this.gameWorld.appendChild(particle);

            const angle = (Math.PI * 2 * i) / 8;
            const velocity = { x: Math.cos(angle) * 4, y: Math.sin(angle) * 4 };
            let life = 0.6;

            const animate = () => {
                particle.style.left = (x + velocity.x * (0.6 - life)) + 'px';
                particle.style.top = (y + velocity.y * (0.6 - life)) + 'px';
                particle.style.opacity = life;
                life -= 0.01;

                if (life > 0) {
                    requestAnimationFrame(animate);
                } else {
                    if (particle.parentNode) {
                        particle.remove();
                    }
                }
            };
            animate();
        }
    }

    updateObstacles() {
        for (let i = 0; i < this.obstacles.length; i++) {
            const obs = this.obstacles[i];
            obs.x -= this.gameSpeed;
            obs.element.style.left = obs.x + 'px';

            // Remove if off screen
            if (obs.x < -100) {
                if (obs.element && obs.element.parentNode) {
                    obs.element.remove();
                }
                this.obstacles.splice(i, 1);
                i--;
            }
        }

        // Spawn new obstacles
        if (this.obstacles.length > 0) {
            const rightmostObstacle = Math.max(...this.obstacles.map(o => o.x));
            if (rightmostObstacle < window.innerWidth + 500) {
                this.spawnObstacle(window.innerWidth + 500, Math.random() * 3);
            }
        } else {
            this.spawnObstacle(window.innerWidth + 500, Math.random() * 3);
        }
    }

    updateCollectibles() {
        for (let i = 0; i < this.collectibles_list.length; i++) {
            const col = this.collectibles_list[i];
            col.x -= this.gameSpeed;
            col.element.style.left = col.x + 'px';

            if (col.x < -50) {
                if (col.element && col.element.parentNode) {
                    col.element.remove();
                }
                this.collectibles_list.splice(i, 1);
                i--;
            }
        }
    }

    addScore(points) {
        this.score += points;
        this.scoreDisplay.textContent = `SCORE: ${this.score}`;

        // Level progression
        if (this.score % 100 === 0 && this.score > 0) {
            this.nextLevel();
        }

        // Increase speed slightly
        this.gameSpeed = this.baseSpeed + (this.score / 200);
    }

    nextLevel() {
        this.level++;
        this.levelDisplay.textContent = `LEVEL: ${this.level}`;
        this.baseSpeed += 1;
        this.spawnLevel();
    }

    gameOver() {
        this.attempts--;
        this.attemptsDisplay.textContent = `ATTEMPTS: ${this.attempts}`;

        if (this.attempts <= 0) {
            this.isPlaying = false;
            this.isGameOver = true;
            this.showGameOverScreen();
        } else {
            // Reset player position
            this.playerY = this.groundLevel - 40;
            this.playerVelocityY = 0;
            this.isJumping = false;
            this.player.classList.remove('jumping');
        }
    }

    showGameOverScreen() {
        this.gameOverScreen.classList.add('show');
        this.finalScoreDisplay.textContent = this.score;
        this.finalLevelDisplay.textContent = this.level;
        this.finalCollectiblesDisplay.textContent = this.collectibles;
    }

    gameLoop() {
        if (this.isPlaying && !this.isGameOver) {
            this.updatePlayer();
            this.updateObstacles();
            this.updateCollectibles();
            this.checkCollisions();
        }

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    console.log('Page loaded, initializing game');
    new GeometryDashGame();
});