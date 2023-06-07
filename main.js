// Start game
/* ####################################################################### */
/*                                START                                    */
/* ####################################################################### */
kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0, 0, 0, 1],
    background: [74, 48, 82],
})

/* ####################################################################### */
/*                              Paramètre                                  */
/* ####################################################################### */

setGravity(500)
const SPEED = 300

const ENEMY_SPEED = 40
const BULLET_SPEED = 500
const JUMP_FORCE = 270

positionFire = 1;

const regex1 = '>';
const regex2 = '@';
let arrayPositionEnemies = [];
let arrayPositionFlammesBar = [];

/* ####################################################################### */
/*                                 Blocs                                   */
/* ####################################################################### */
loadSprite("mario", "ressources/joueur/mario.png")
loadSprite("en", "ressources/joueur/mechant.png")

loadSprite("drapeau", "ressources/asset/drapeau.png")
loadSprite("coin", "ressources/asset/coin.png")
loadSprite("flame", "ressources/blocs/munition.png")

loadSprite("sol", "ressources/blocs/truc.png")
loadSprite("vide", "ressources/blocs/vide.png")
/* ####################################################################### */
/*                                 MAP                                     */
/* ####################################################################### */

const LEVELS = [
    [
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "        a                                       z                                                                         ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                            $   =                                                                                         ",
        "                           ...  =                                                                                         ",
        "                                =        $                                                                                ",
        "                 $              =      @...                                          $$$                                  ",
        "                ...             =          .                                 @==================                          ",
        "                                =                       >                                                                 ",
        "                                =                                        $                                            /   ",
        "                                =                                     ========                                       ///  ",
        "======================================================================........============================================",
        //"..........................................................................................................................",
    ],
    [
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                            $   =                                                                                         ",
        "                           ...  =                                                                                         ",
        "                                =        $                                                                                ",
        "                 $              =       ...                       @                  $$$                                  ",
        "                ...             =          .                                  ==================                          ",
        "                                =                       >                                                                 ",
        "                                =                                        $                                            /   ",
        "                                =                                     ========                                       ///  ",
        "======================================================================........============================================",
        //"..........................................................................................................................",
    ],
]

scene("game", ({ levelIdx, score }) => {

    // Use the level passed, or first level
    const level = addLevel(LEVELS[levelIdx || 0], {
        tileWidth: 16,
        tileHeight: 16,
        pos: vec2(100, 140),
        tiles: {
            "=": () => [
                sprite("sol"),
                area(),
                scale(2),
                body({ isStatic: true }),
                tile({ isObstacle: true }),
                "sol",
            ],
            ".": () => [
                sprite("vide"),
                area(),
                scale(2),
                body({ isStatic: true }),
                tile({ isObstacle: true }),
                "vide",
            ],
            "/": () => [
                sprite("drapeau"),
                area(),
                scale(2),
                body({ isStatic: true }),
                tile({ isObstacle: true }),
                "drapeau",
            ],
            "$": () => [
                sprite("coin"),
                area(),
                scale(1),
                anchor("bot"),
                "coin",
            ],
            "a": () => [
                scale(1),
                text('space for jump'),
            ],
            "z": () => [
                scale(1),
                text('z for shoot'),
            ],
        },

    })

    for (let j = 0; j < 18; j++) {
        posMechant = (LEVELS[levelIdx][j].search(regex1))
        posFlammesBar = (LEVELS[levelIdx][j].search(regex2))
        //console.log(posMechant)
        if (posMechant !== -1) {
            arrayPositionEnemies.push(
                {
                    "x": (100 + (posMechant * 16)),
                    "y":(100 + (j)),
                }
            )
        }
        if (posFlammesBar !== -1) {
            arrayPositionFlammesBar.push(
                {
                    "x": (100 + (posFlammesBar * 16)),
                    "y":(345 + (j)),
                    "deg": 60,
                    "num": 6,
                }
            )
        }
    }

    onKeyPress("f", () => {
        setFullscreen(!isFullscreen())
    })

    posMechant = null;
    //console.log(arrayPositionEnemies);

    player = add([
        sprite("mario"),
        area(),
        body(),
        pos(140,300),
    ])
    // Get the player object from tag

    player.onCollide("coin", (coin) => {
        destroy(coin)
        score++
        scoreLabel.text = score
    })
    // Movements
    onKeyPress("space", () => {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE)
        }
    })

    onKeyDown("left", () => {
        player.move(-SPEED, 0)
        positionFire = 180;
    })

    onKeyDown("right", () => {
        player.move(SPEED, 0)
        positionFire = 1;
    })
    // Fall death
    player.onUpdate(() => {
        if (player.pos.y >= 500) {
            go("lose", { score: score })
        }
    })

    player.onUpdate(() => {
        // Set the viewport center to player.pos
        camPos(player.worldPos())
    })

    player.onPhysicsResolve(() => {
        // Set the viewport center to player.pos
        camPos(player.worldPos())
    })


    player.onCollide("bullet", (bullet) => {
        destroy(bullet)
        destroy(player)
        go("lose", { score: score })
    })

    // Enter the next level on drapeau
    player.onCollide("drapeau", () => {
        if (levelIdx < LEVELS.length - 1) {
            // If there's a next level, go() to the same scene but load the next level
            go("game", {
                levelIdx: levelIdx + 1,
                score: score,
            })
        } else {
            // Otherwise we have reached the end of game, go to "win" scene!
            go("win", { score: score })
        }
    })

    player.onCollide("flame", () => {
        player.destroy()
        go("lose", { score: score })
    })

    function spawnBullet() {
        add([
            rect(5, 5),
            area(),
            pos(player.pos.sub(0, -5)),
            anchor("center"),
            color(127, 127, 255),
            outline(4),
            move(positionFire, BULLET_SPEED),
            offscreen({ destroy: true }),
            // strings here means a tag
            "feu",
        ])
    }


    onCollide("feu", "sol", (feu) => {
        destroy(feu)
    })

    onCollide("feu", "vide", (feu) => {
        destroy(feu)
    })


    onKeyPress("z", async () => {
        spawnBullet()
    })

    /* ####################################################################### */
    /*                           Flamme Barre                                  */
    /* ####################################################################### */
    function addFlamebar(obj) {

        // Create a parent game object for position and rotation
        const flameHead = add([
            pos(obj.x, obj.y),
            rotate(),
        ])

        // Add each section of flame as children
        for (let i = 0; i < obj.num; i++) {
            flameHead.add([
                sprite("flame"),
                pos(0, i * 24),
                area(),
                anchor("center"),
                "flame",
            ])
        }
        flameHead.onUpdate(() => {
            flameHead.angle += dt() * 60
        })

        return flameHead
    }
    arrayPositionFlammesBar.forEach((OneFlammeBarre)=>{
        addFlamebar(OneFlammeBarre)
    })
    arrayPositionFlammesBar.splice(0, arrayPositionFlammesBar.length)
    /* ####################################################################### */
    /*                             Enemies                                     */
    /* ####################################################################### */
    let enemies = [];
    for (let i=0;i<arrayPositionEnemies.length;i++){

        let oneEnemy = add([
            sprite("en"),
            area(),
            body(),
            pos((arrayPositionEnemies[i].x),(arrayPositionEnemies[i].y)),
            // This enemy cycle between 3 states, and start from "idle" state
            state("move", [ "idle", "attack", "move" ]),
        ])
        enemies.push(oneEnemy)
    }
    arrayPositionEnemies.splice(0, arrayPositionEnemies.length)
    function wakeEnemy(enemy){

        enemy.onStateEnter("idle", async () => {
            await wait(.5)
            enemy.enterState("attack")
        })

        // When we enter "attack" state, we fire a bullet, and enter "move" state after 1 sec
        enemy.onStateEnter("attack", async () => {

            if (enemy.exists()) {
                // Don't do anything if player doesn't exist anymore
                if (player.exists()) {

                    const dir = player.pos.sub(enemy.pos)

                    add([
                        pos(enemy.pos.sub(-10, -10)),
                        move(dir, BULLET_SPEED),
                        rect(5, 5),
                        area(),
                        offscreen({destroy: true}),
                        anchor("center"),
                        color(RED),
                        "bullet",
                    ])
                }
            }
            await wait(1)
            enemy.enterState("move")
        })

        enemy.onStateEnter("move", async () => {
            await wait(1)
            enemy.enterState("idle")
        })

        // Like .onUpdate() which runs every frame, but only runs when the current state is "move"
        // Here we move towards the player every frame if the current state is "move"
        enemy.onStateUpdate("move", () => {
            if (!player.exists()) return
            const dir = player.pos.sub(enemy.pos).unit()
            enemy.move(dir.scale(ENEMY_SPEED))
        })
        enemy.onCollide("feu", (bullet) => {
            destroy(bullet)
            destroy(enemy)
        })
        onCollide("bullet", "sol", (bullet) => {
            destroy(bullet)
        })
        onCollide("bullet", "vide", (bullet) => {
            destroy(bullet)
        })
    }
    enemies.forEach((enemy)=>{
        wakeEnemy(enemy)
    })
    /* ####################################################################### */
    /*                              SCORE                                      */
    /* ####################################################################### */
    const scoreLabel = add([
        text(score),
        pos(0, 0),
        follow(player, vec2(-700,-400)),
    ])
})




/* ########################################################################### */
/*                            START / LOSE / WIN                               */
/* ########################################################################### */
scene("lose", ({ score }) => {

    add([
        sprite("mario"),
        pos(width() / 2, height() / 2 - 108),
        scale(3),
        anchor("center"),
    ])

    // display score
    add([
        text(score),
        pos(width() / 2, height() / 2 + 108),
        scale(3),
        anchor("center"),
    ])

    // go back to game with space is pressed
    onKeyPress("space", () => go("game", {
        levelIdx: 0,
        score: 0,
    }))
    onClick(() => go("game", {
        levelIdx: 0,
        score: 0,
    }))

})
scene("win", ({ score }) => {

    add([
        text(`GG ! You Win and you have ${score} coins  !!!`, {
            width: width(),
        }),
        pos(12),
    ])
    onKeyPress(start)

})

function start() {
    // Start with the "game" scene, with initial parameters
    go("game", {
        levelIdx: 0,
        score: 0,
    })
}
start()

/* ################################################################################################################## */
/* ################################################################################################################## */
/* ################################################################################################################## */