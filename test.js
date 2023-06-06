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

const ENEMY_SPEED = 50
const BULLET_SPEED = 500
const JUMP_FORCE = 250

positionFire = 1;

/* ####################################################################### */
/*                                 Blocs                                   */
/* ####################################################################### */
loadSprite("mario", "ressources/joueur/mario.png")
loadSprite("en", "ressources/joueur/mechant.png")

loadSprite("drapeau", "ressources/asset/drapeau.png")

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
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                =                                                                                         ",
        "                           ...  =                                                                                         ",
        "                                =                                                                                         ",
        "                                =       ...                                                                               ",
        "                ...             =                                             ==================                          ",
        "                                =                                                                                         ",
        "                                =                                                                                    /    ",
        "                                =                                     ========                                      ///   ",
        "======================================================================........============================================",
        "..........................................................................................................................",
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
        "                                                                                                                          ",
        "                           ...                                                                                            ",
        "                                                                                                                          ",
        "                                        ...                                                                               ",
        "                ...                                                           ==================                          ",
        "                                =                                                                                         ",
        "                                =                                                                                     /   ",
        "                                =                                     ========                                       ///  ",
        "======================================================================........============================================",
        "..........................................................................................................................",
    ],
]

scene("game", ({ levelIdx, score }) => {

    // Use the level passed, or first level
    const level = addLevel(LEVELS[levelIdx || 0], {
        tileWidth: 16,
        tileHeight: 16,
        pos: vec2(100, 140),
        tiles: {

            "@": () => [
                "player",
            ],

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
        },
    })

    player = add([
        sprite("mario"),
        area(),
        body(),
        pos(140,300),
    ])
    // Get the player object from tag

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
            go("lose")
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
        go("lose")
    })

    // Enter the next level on drapeau
    player.onCollide("drapeau", () => {
        if (levelIdx < LEVELS.length - 1) {
            // If there's a next level, go() to the same scene but load the next level
            go("game", {
                levelIdx: levelIdx + 1,
            })
        } else {
            // Otherwise we have reached the end of game, go to "win" scene!
            go("win")
        }
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
    /*                                                                         */
    /* ####################################################################### */
    let enemies = [];

    for (let i=2;i<5;i++){

        let oneEnemy = add([
            sprite("en"),
            area(),
            body(),
            pos((400+(200*i)),200),
            // This enemy cycle between 3 states, and start from "idle" state
            state("move", [ "idle", "attack", "move" ]),
        ])
        enemies.push(oneEnemy)
    }

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
    /*                                                                         */
    /* ####################################################################### */


    let array = [
        {
            "x":300,
            "y": 270,
        },
        {
            "x":300,
            "y": 270,
        },
    ]



})

scene("lose", () => {

    add([
        text("You Lose"),
        pos(12),
    ])

    // Press any key to go back
    onKeyPress(start)

})

scene("win", () => {

    add([
        text(`You win !!!`, {
            width: width(),
        }),
        pos(12),
    ])
    onKeyPress(start)

})

/* ####################################################################### */
/*                                                                         */
/* ####################################################################### */

/* ####################################################################### */
/*                                                                         */
/* ####################################################################### */

function start() {
    // Start with the "game" scene, with initial parameters
    go("game", {
        levelIdx: 0,
    })
}

start()