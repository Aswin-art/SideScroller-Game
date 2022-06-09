/**@type {HTMLCanvasElement} */

const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

canvas.width = 800
canvas.height = 720

// function spawnEnemies(deltatime){
//     if(enemyInterval > nextEnemy){
//         enemies.push(new Enemy(canvas.width, canvas.height))
//         console.log(enemies)
//         enemyInterval = 0
//     }else{
//         enemyInterval += deltatime
//     }
    
//     enemies.forEach(enemy => {
//         enemy.update()
//         enemy.draw(ctx)
//     })
// }

// function displayStatusText(score){
//     ctx.fillStyle = 'black'
//     ctx.font = '40px Helvetica'
//     ctx.fillText('Score: ' + score, 20, 50)
// }

function drawGameOver(){
    ctx.font = '50px Impact'
    ctx.fillStyle = 'white'
    ctx.fillText('GAMEOVER!', canvas.width / 2 - 100, 200)
}

class Enemy{
    constructor(maxWidth, maxHeight){
        this.image = new Image()
        this.image.src = './assets/images/enemy_1.png'
        this.maxWidth = maxWidth
        this.maxHeight = maxHeight
        this.width = 160
        this.height = 119
        this.x = this.maxWidth
        this.y = this.maxHeight - this.height
        this.frame = 0
        this.frameInterval = 3
        this.speed = 8
    }

    draw(ctx){
        ctx.drawImage(this.image, this.frame * this.width, 0, this.width, this.height ,this.x, this.y, this.width, this.height)
    }

    update(){
        if(gameFrame % this.frameInterval == 0){
            if(this.frame <= 4){
                this.frame++
            }else{
                this.frame = 0
            }
        }
        this.x -= this.speed
    }
}

class Background{
    constructor(game){
        this.image = new Image()
        this.image.src = './assets/images/background_single.png'
        this.game = game
        this.width = 2400
        this.height = 720
        this.x = 0
        this.y = 0
        this.speed = 7
    }

    draw(ctx){
        ctx.drawImage(this.image, this.x, this.y)
        ctx.drawImage(this.image, this.x + this.width - this.speed, this.y)
    }

    update(){
        this.x -= this.speed
        if(this.x < 0 - this.width){
            this.x = 0
        }
    }
}

class Player{
    constructor(game){
        this.game = game
        this.width = 200
        this.height = 200
        this.x = 0
        this.y = this.game.gameHeight - this.height
        this.image = new Image()
        this.image.src = './assets/images/player.png'
        this.frameX = 0
        this.frameY = 0
        this.maxFrame = 7
        this.speedX = 0
        this.speedY = 0
        this.gravity = 3
    }

    onGround(){
        return this.y >= this.game.gameHeight - this.height
    }

    draw(ctx){
        ctx.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height)
    }

    update(){

        // Animation
        if(gameFrame % 3 == 0){
            if(this.frameX <= this.maxFrame){
                this.frameX++
            }else{
                this.frameX = 0
            }
        }

        // Horizontal Movement
        if(this.game.event.keys.indexOf('ArrowLeft') > -1){
            this.speedX = -10
        }else if(this.game.event.keys.indexOf('ArrowRight') > -1){
            this.speedX = 10
        }else{
            this.speedX = 0
        }

        // Change Position Horizontal
        this.x += this.speedX

        // Check for Boundaries Horizontal
        if(this.x < 0){
            this.x = 0
        }else if(this.x + this.width > this.game.gameWidth){
            this.x = this.game.gameWidth - this.width
        }

        // Vertical Movement
        if(this.game.event.keys.indexOf('ArrowUp') > -1 && this.onGround()){
            this.speedY -= 50
            this.frameY = 1
        }

        // Change Position
        this.y += this.speedY

        // Check for boundaries Vertical
        if(this.y > this.game.gameHeight - this.height){
            this.y = this.game.gameHeight - this.height
        }

        // Check if in the air
        if(!this.onGround()){
            this.speedY += this.gravity
            this.maxFrame = 5
        }else{
            this.speedY = 0
            this.frameY = 0
            this.maxFrame = 7
        }
    }
}


class EventHandler{
    constructor(){
        this.keys = []
        document.addEventListener('keydown', (e) => {
            if((e.key == 'ArrowUp' || e.key == 'ArrowDown' || e.key == 'ArrowRight' || e.key == 'ArrowLeft') && this.keys.indexOf(e.key) == -1){
                this.keys.push(e.key)
            }
        })

        document.addEventListener('keyup', (e) => {
            if(e.key == 'ArrowUp' || e.key == 'ArrowDown' || e.key == 'ArrowRight' || e.key == 'ArrowLeft'){
                this.keys.splice(this.keys.indexOf(e.key), 1)
            }
        })
    }
}

class Game{
    constructor(gameWidth, gameHeight){
        this.gameWidth = gameWidth
        this.gameHeight = gameHeight
        this.reset()
    }
    
    reset(){
        // Declare Score
        this.score = 0

        // Declare Enemies
        this.enemies = []

        // Declare player
        this.player = new Player(this)

        // Declare background
        this.background = new Background(this)

        // Declare objects
        this.objects = [this.background, this.player]

        // Input Event
        this.event = new EventHandler()
    }

    spawnEnemies(){
        this.enemies.push(new Enemy(this.gameWidth, this.gameHeight))
    }

    displayStatusText(){
        ctx.fillStyle = 'black'
        ctx.font = '40px Helvetica'
        ctx.fillText('Score: ' + this.score, 20, 50)
    }

    draw(ctx){
        this.objects.forEach(object => object.draw(ctx))
        this.enemies.forEach(enemy => enemy.draw(ctx))
        this.displayStatusText()
    }

    update(deltatime){
        if(enemyInterval > nextEnemy + nextRandomEnemy){
            this.spawnEnemies()
            enemyInterval = 0
        }else{
            enemyInterval += deltatime
        }
        this.objects.forEach(object => object.update())
        this.enemies.forEach(enemy => enemy.update(deltatime))

        // Remove enemy
        this.enemies.forEach((enemy, index) => {
            if(enemy.x + enemy.width < 0){
                this.enemies.splice(index, 1)
                this.score++
            }
        })

        // Check for collision
        this.enemies.forEach((enemy) => {
            const dx = enemy.x - this.player.x
            const dy = enemy.y - this.player.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if(distance < enemy.width / 2 + this.player.width / 2){
                gameover = true
            }
        })
    }
}

const game = new Game(canvas.width, canvas.height)

// let score = 0
let gameover = false
let gameFrame = 0
let lastTime = 0
let enemyInterval = 0
let nextEnemy = 1000
let nextRandomEnemy = Math.random() * 1000 + 500
let enemies = []

function animate(timeStamp = 0){
    if(!gameover){
        let deltatime = timeStamp - lastTime
        lastTime = timeStamp
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        game.update(deltatime)
        game.draw(ctx)
        // spawnEnemies(deltatime)
        // displayStatusText(score)
        gameFrame++
        requestAnimationFrame(animate)
    }else{
        drawGameOver()
    }
}

animate()