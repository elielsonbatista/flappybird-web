const config = {
    fps: 60,
    lastFrameTime: Date.now(),
    width: 450,
    height: 600,

    game: {
        frames: 0,
        states: {
            home: 0,
            running: 1,
            score: 2
        }
    },

    bird: {
        gravity: 0.25,
        speed: 0,
        x: 80,
        y: 250,
        jumpForce: 4.8,
        angleRotate: -25
    },

    pipes: {
        width: 60,
        gap: 90
    },

    sprites: {
        n0: '0',
        n1: '1',
        n2: '2',
        n3: '3',
        n4: '4',
        n5: '5',
        n6: '6',
        n7: '7',
        n8: '8',
        n9: '9',
        backgroundDay: 'background-day',
        backgroundNight: 'background-night',
        yellowBirdMidFlap: 'yellowbird-midflap',
        yellowBirdUpFlap: 'yellowbird-upflap',
        yellowBirdDownFlap: 'yellowbird-downflap',
        blueBirdMidFlap: 'bluebird-midflap',
        blueBirdUpFlap: 'bluebird-upflap',
        blueBirdDownFlap: 'bluebird-downflap',
        redBirdMidFlap: 'redbird-midflap',
        redBirdUpFlap: 'redbird-upflap',
        redBirdDownFlap: 'redbird-downflap',
        pipeGreen: 'pipe-green',
        pipeGreenInverted: 'pipe-green-inverted',
        pipeRed: 'pipe-red',
        pipeRedInverted: 'pipe-red-inverted',
        bottom: 'base',
        home: 'message',
        gameOver: 'game-over',
        play: 'play',
        score: 'score',
    },

    sounds: {
        die: 'die',
        hit: 'hit',
        point: 'point',
        swooshing: 'swooshing',
        wing: 'wing'
    }
};

(async () => {
    try {
        await loadSprites();
        loadSounds();
        initListeners();

        game.start();
    } catch (error) {
        console.log(error);
    }
})();

var sprites = {};

var game = {
    frames: 0,
    states: {
        home: 0,
        running: 1,
        score: 2
    },
    interval: 0,
    currentState: 0,

    start () {
        update();
    },

    run () {
        this.frames = 0;
        this.currentState = this.states.running;
    },

    stop () {
        this.currentState = this.states.score;
    },

    restart () {
        bird = {
            ...bird,
            ...config.bird
        };
    
        pipes = {
            ...pipes,
            ...config.pipes
        };
    
        score.clear();
    
        pipes.collection = [];

        background.setVariation();
        bird.setVariation();
        pipes.setVariation();

        this.currentState = this.states.home;
    }
};

var background = {
    variation: 'Day',

    draw () {
        areaContext.drawImage(sprites[`background${this.variation}`], 0, config.height - sprites[`background${this.variation}`].height);
        areaContext.drawImage(sprites[`background${this.variation}`], sprites[`background${this.variation}`].width, config.height - sprites[`background${this.variation}`].height);
    },

    setVariation () {
        let types = [
            'Day',
            'Night'
        ];

        this.variation = types[Math.round(Math.random() * 1)];
        area.style.backgroundColor = this.variation === 'Day' ? '#4dc1cb' : '#008793';
    }
}

var sounds = {
    play (sound) {
        this[sound].currentTime = 0;
        this[sound].play();
    }
};

var home = {
    draw () {
        areaContext.drawImage(sprites.home, config.width / 2 - sprites.home.width / 2, 60);
    }
};

var bottom = {
    x: 0,
    pieces: [],
    collided: false,

    update () {
        if (game.currentState !== game.states.score) {
            this.x -= 2;
        }

        if (this.x === -sprites.bottom.width) {
            this.x = 0;
        }

        if (this.collision()) {
            if (game.currentState === game.states.running) {
                sounds.play('hit');
            }

            game.stop();
        }
    },

    draw () {
        areaContext.drawImage(sprites.bottom, this.x, config.height - sprites.bottom.height);
        areaContext.drawImage(sprites.bottom, this.x + sprites.bottom.width, config.height - sprites.bottom.height);
        areaContext.drawImage(sprites.bottom, this.x + sprites.bottom.width * 2, config.height - sprites.bottom.height);
    },

    collision () {
        let collider = config.height - sprites.bottom.height - bird.currentSprite.height;

        if (bird.y >= collider) {
            bird.y = collider;
            bird.speed = 0;
            this.collided = true;

            return true;
        }

        return false;
    }
}

var score = {
    current: 0,
    best: 0,
    playButton: {
        x: 0,
        y: 0
    },

    update () {
        this.current++;
        sounds.play('point');
    },

    draw () {
        let value = this.current.toString();
        let center = config.width / 2 - sprites.n0.width / 2;

        this.drawEachNumber(value, center, 20);
    },

    drawEachNumber (value, x, y, spacement = 15, size = null) {
        for (let i = 0; i < value.length; i++) {
            let sprite = sprites[`n${value[i]}`];
            let positionX = -((value.length - 1 - i) * spacement) + x + i * spacement;

            let args = [
                sprite,
                positionX,
                y
            ];

            if (size && size.width && size.height) {
                args.push(size.width, size.height);
            }

            areaContext.drawImage(...args);
        }
    },

    drawBestScore () {
        let gameOverX = config.width / 2 - sprites.gameOver.width / 2;
        let gameOverY = config.width / 2 - sprites.gameOver.height / 2;
        let scoreX = config.width / 2 - sprites.score.width / 2;
        let scoreY = gameOverY + sprites.gameOver.height + 20;
        let playX = config.width / 2 - sprites.play.width / 2;
        let playY = scoreY + sprites.score.height + 20;
        let numberX = scoreX + sprites.score.width - 50;
        let numberY = scoreY + sprites.score.height - 82;

        let size = {
            width: 12,
            height: 18
        };

        if (this.current > this.best) {
            this.best = this.current;
        }

        this.playButton = {
            x: playX,
            y: playY
        };

        let current = this.current.toString();
        let best = this.best.toString();

        areaContext.drawImage(sprites.gameOver, gameOverX, gameOverY);
        areaContext.drawImage(sprites.score, scoreX, scoreY);
        areaContext.drawImage(sprites.play, playX, playY);
        this.drawEachNumber(current, numberX, numberY, 8, size);
        this.drawEachNumber(best, numberX, numberY + 42, 8, size);
    },

    clear () {
        if (this.current > this.best) {
            this.best = this.current;
        }

        this.current = 0;
    }
}

var bird = {
    ...config.bird,
    revertingSprites: false,
    currentSprite: '',
    variation: 'yellow',

    update () {
        if (game.currentState === game.states.home) {
            this.angleRotate = 0;
        } else {
            this.speed += this.gravity;
            this.y += this.speed;
        }
    },

    draw () {
        if (game.currentState === game.states.score) {
            this.currentSprite = sprites[`${this.variation}BirdMidFlap`];
        } else {
            if (! this.currentSprite) {
                this.currentSprite = sprites[`${this.variation}BirdUpFlap`];
            }

            if (game.frames % 5 === 0) {
                if (this.currentSprite === sprites[`${this.variation}BirdUpFlap`] || this.currentSprite === sprites[`${this.variation}BirdDownFlap`]) {
                    this.currentSprite = sprites[`${this.variation}BirdMidFlap`];
                } else if (this.speed <= this.jumpForce) {
                    this.currentSprite = this.revertingSprites ? sprites[`${this.variation}BirdUpFlap`] : sprites[`${this.variation}BirdDownFlap`];
                    this.revertingSprites = ! this.revertingSprites;
                }
            }
        }

        areaContext.save();
        
        areaContext.translate(this.x + 15, this.y + 10);

        if (game.currentState !== game.states.home) {
            if (this.speed < this.jumpForce) {
                this.angleRotate = config.bird.angleRotate;
            } else if (this.angleRotate < 90) {
                this.angleRotate += 10;
            }
        }

        areaContext.rotate(this.angleRotate * Math.PI / 180);
        
        areaContext.drawImage(this.currentSprite, -this.currentSprite.width / 2, -this.currentSprite.height / 2);
        areaContext.restore();
    },

    jump () {
        this.speed = -this.jumpForce;
        sounds.play('wing');
    },

    setVariation () {
        let types = [
            'yellow',
            'red',
            'blue'
        ];

        this.variation = types[Math.round(Math.random() * 2)];
    }
}

var pipes = {
    ...config.pipes,
    collection: [],
    variation: 'Green',

    update () {
        if (game.currentState === game.states.running && game.frames % 100 === 0) {
            this.collection.push({
                x: config.width,
                y: Math.round(100 + (Math.random() * (config.height - sprites.bottom.height - 180) / 1.5))
            });
        }

        let collided = false;

        for (let current of this.collection) {
            if (current.x <= -current.width) {
                this.collection.splice(0, 1);
                i--;
                break;
            }

            if (game.currentState === game.states.running) {
                current.x -= 2;
            }

            if (this.collision(current)) {
                collided = true;
            }
        }

        if (collided) {
            if (game.currentState === game.states.running) {
                sounds.play('hit');

                setTimeout(function () {
                    sounds.play('die');
                }, 350);

                game.stop();
            }
        }
    },

    draw () {
        for (let pipe of this.collection) {
            areaContext.drawImage(sprites[`pipe${this.variation}Inverted`], pipe.x, -sprites[`pipe${this.variation}`].height + pipe.y);
            areaContext.drawImage(sprites[`pipe${this.variation}`], pipe.x, pipe.y + this.gap);
        }
    },

    collision (pipe) {
        if (
            pipe.x <= bird.x + bird.currentSprite.width &&
            pipe.x + sprites[`pipe${this.variation}`].width >= bird.x &&
            (
                pipe.y >= bird.y ||
                pipe.y + this.gap <= bird.y + bird.currentSprite.height
            )
        ) {
            return true;
        }

        if (pipe.x + sprites[`pipe${this.variation}`].width === bird.x - 2) {
            score.update();
        }

        return false;
    },

    setVariation () {
        let types = [
            'Green',
            'Red'
        ];

        this.variation = types[Math.round(Math.random() * 1)];
    }
}

const panel = document.getElementById('panel');
const area = document.createElement('canvas');
const areaContext = area.getContext('2d');
const requestAnimFrame = requestAnimationFrameSelector();

area.width = config.width;
area.height = config.height;

panel.appendChild(area);

function loadSprites() {
    let keys = Object.keys(config.sprites);

    for (let key of keys) {
        let current = new Image();
        current.src = `sprites/${config.sprites[key]}.png`;

        current.onload = function () {
            sprites[key] = current;
        }
    }

    return new Promise(function (resolve, reject) {
        let timeout = 0;

        let interval = setInterval(function () {
            if (Object.keys(sprites).length === keys.length) {
                clearInterval(interval);
                resolve();
            }

            if (timeout === 10) {
                reject('Was not possible to load the sprites');
            }

            timeout++;
        }, 1000);
    });
}

function loadSounds() {
    let keys = Object.keys(config.sounds);

    for (let key of keys) {
        sounds[key] = new Audio(`sounds/${key}.wav`);
    }
}

function initListeners() {
    area.addEventListener('pointerdown', action);

    window.addEventListener('keydown', function (event) {
        if (event.key === ' ') {
            action(event);
        }
    });
}

function action(event) {
    if (game.currentState === game.states.score) {
        let areaRect = area.getBoundingClientRect();
        
        if (
            event.type === 'keydown'
            || event.clientX >= areaRect.x + area.offsetLeft + score.playButton.x
            && event.clientX <= areaRect.x + area.offsetLeft + score.playButton.x + sprites.play.width
            && event.clientY >= areaRect.y + area.offsetTop + score.playButton.y
            && event.clientY <= areaRect.y + area.offsetTop + score.playButton.y + sprites.play.height
        ) {
            game.restart();
            return;
        }
    } else {
        if (game.currentState === game.states.home) {
            game.run();
        }

        bird.jump();
    }
}

function update() {
    requestAnimFrame(update);

    let now = Date.now();
    let delta = now - config.lastFrameTime;
    let interval = Math.min(1000 / config.fps);

    if (delta > interval) {
        config.lastFrameTime = now - (delta % interval);

        pipes.update();
        bird.update();
        bottom.update();

        clear();

        background.draw();
        pipes.draw();
        bottom.draw();
        bird.draw();

        if (game.currentState === game.states.score) {
            score.drawBestScore();
        } else if (game.currentState === game.states.home) {
            home.draw();
        } else {
            score.draw();
        }

        game.frames++;

        requestAnimFrame(update);
    }
}

function clear() {
    areaContext.clearRect(0, 0, config.width, config.height);
}

function requestAnimationFrameSelector()
{
    return (
        window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
    );
}
