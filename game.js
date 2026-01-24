// ========================================
// GAME CONFIGURATION
// ========================================
const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// ========================================
// GAME VARIABLES
// ========================================
let player;
let stars;
let bombs;
let score = 0;
let scoreText;
let gameOver = false;
let cursors;
let wasd;

// ========================================
// PRELOAD - Load Images
// ========================================
function preload() {
    // Load images from a free CDN (placeholder images)
    this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    this.load.image('star', 'https://labs.phaser.io/assets/sprites/star.png');
    this.load.image('bomb', 'https://labs.phaser.io/assets/sprites/bomb.png');
}

// ========================================
// CREATE - Setup the Game
// ========================================
function create() {
    // Add background
    this.add.image(400, 300, 'sky');
    
    // Add title
    this.add.text(400, 50, 'COLLECT THE STARS!', {
        fontSize: '40px',
        fill: '#fff',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 4
    }).setOrigin(0.5);
    
    // Create the player
    player = this.physics.add.sprite(400, 500, 'player');
    player.setCollideWorldBounds(true);
    player.setScale(0.15);
    
    // Create stars group
    stars = this.physics.add.group();
    
    // Create bombs group
    bombs = this.physics.add.group();
    
    // Setup keyboard controls (both Arrow keys and WASD)
    cursors = this.input.keyboard.createCursorKeys();
    wasd = this.input.keyboard.addKeys({
        up: 'W',
        left: 'A',
        down: 'S',
        right: 'D'
    });
    
    // Score display
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 3
    });
    
    // Instructions
    this.add.text(400, 570, 'Arrow Keys or WASD to Move', {
        fontSize: '20px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 2
    }).setOrigin(0.5);
    
    // Spawn stars every 1.5 seconds
    this.time.addEvent({
        delay: 1500,
        callback: spawnStar,
        callbackScope: this,
        loop: true
    });
    
    // Spawn bombs every 3 seconds
    this.time.addEvent({
        delay: 3000,
        callback: spawnBomb,
        callbackScope: this,
        loop: true
    });
    
    // Check collisions
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.overlap(player, bombs, hitBomb, null, this);
}

// ========================================
// SPAWN STAR
// ========================================
function spawnStar() {
    if (gameOver) return;
    
    let x = Phaser.Math.Between(50, 750);
    let star = stars.create(x, 0, 'star');
    star.setScale(0.5);
    star.setVelocityY(150);
}

// ========================================
// SPAWN BOMB
// ========================================
function spawnBomb() {
    if (gameOver) return;
    
    let x = Phaser.Math.Between(50, 750);
    let bomb = bombs.create(x, 0, 'bomb');
    bomb.setScale(0.8);
    bomb.setVelocityY(200 + score * 3);
}

// ========================================
// COLLECT STAR
// ========================================
function collectStar(player, star) {
    star.destroy();
    
    // Add points
    score += 10;
    scoreText.setText('Score: ' + score);
    
    // Play a simple scale animation
    this.tweens.add({
        targets: player,
        scaleX: 0.18,
        scaleY: 0.18,
        duration: 100,
        yoyo: true
    });
}

// ========================================
// HIT BOMB - Game Over
// ========================================
function hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    gameOver = true;
    
    showGameOver.call(this);
}

// ========================================
// GAME OVER SCREEN
// ========================================
function showGameOver() {
    // Dark overlay
    let overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    
    // Game Over Box
    let box = this.add.rectangle(400, 300, 500, 350, 0x222222);
    box.setStrokeStyle(6, 0xffffff);
    
    // Game Over Text
    this.add.text(400, 180, 'GAME OVER!', {
        fontSize: '60px',
        fill: '#ff4444',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Final Score
    this.add.text(400, 260, 'Final Score: ' + score, {
        fontSize: '36px',
        fill: '#ffffff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Play Again Button
    let playAgainButton = this.add.text(400, 360, 'PLAY AGAIN', {
        fontSize: '32px',
        fill: '#ffffff',
        backgroundColor: '#4CAF50',
        padding: { x: 30, y: 15 }
    }).setOrigin(0.5);
    
    playAgainButton.setInteractive({ useHandCursor: true });
    
    playAgainButton.on('pointerdown', () => {
        score = 0;
        gameOver = false;
        this.scene.restart();
    });
    
    playAgainButton.on('pointerover', () => {
        playAgainButton.setStyle({ backgroundColor: '#45a049' });
    });
    
    playAgainButton.on('pointerout', () => {
        playAgainButton.setStyle({ backgroundColor: '#4CAF50' });
    });
}

// ========================================
// UPDATE - Runs Every Frame
// ========================================
function update() {
    if (gameOver) return;
    
    // Move player left
    if (cursors.left.isDown || wasd.left.isDown) {
        player.setVelocityX(-300);
    }
    // Move player right
    else if (cursors.right.isDown || wasd.right.isDown) {
        player.setVelocityX(300);
    }
    // Stop moving
    else {
        player.setVelocityX(0);
    }
    
    // Clean up stars and bombs that fall off screen
    stars.children.entries.forEach(star => {
        if (star.y > 620) star.destroy();
    });
    
    bombs.children.entries.forEach(bomb => {
        if (bomb.y > 620) bomb.destroy();
    });
}

// ========================================
// START THE GAME
// ========================================
const game = new Phaser.Game(config);
