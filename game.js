// Start game
/* ####################################################################### */
/*                                START                                    */
/* ####################################################################### */
kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1],
    background: [74, 48, 82],
})

/* ####################################################################### */
/*                              Paramètre                                  */
/* ####################################################################### */

setGravity(1600)


const SPEED = 200
const ENEMY_SPEED = 100
const BULLET_SPEED = 400

/* ####################################################################### */
/*                                 Blocs                                   */
/* ####################################################################### */
loadSprite("ennemi", "ressources/joueur/mechant.png")
loadSprite("bean", "ressources/joueur/mario.png")

loadSprite("drapeau", "ressources/asset/drapeau.png")


loadSprite("sol", "ressources/blocs/truc.png")
loadSprite("vide", "ressources/blocs/vide.png")



loadSpriteAtlas("ressources/asset/blocmap.png", {
    "blocVide": {
        "x": 0,
        "y": 0,
        "width": 64,
        "height": 96,
        "sliceX": 8,
        "sliceY": 13,
    },
    "blocVerdure": {
        "x": 3,
        "y": 3,
        "width": 30,
        "height": 20,
        "sliceX": 3,
        "sliceY": 2,
    },
});

/* ####################################################################### */
/*                                 MAP                                     */
/* ####################################################################### */
const BOSS = [

    [
        ".                              .",
        ".                              .",
        ".                              .",
        ".                              .",
        ".                              .",
        ".                              .",
        ".                              .",
        ".                              .",
        ".                              .",
        ".                              .",
        ".                              .",
        ".                              .",
        ".                              .",
        ".                              .",
        ".       @                      .",
        ".                           /  .",
        ".==============================.",
        "................................",
    ],
]

scene("game", ({ levelIdBoss }) => {

    // Use the level passed, or first level
    const level = addLevel(BOSS[levelIdBoss || 0], {
        tileWidth: 24,
        tileHeight: 24,
        pos: vec2(0, 0),
        tiles: {
            "@": () => [
                sprite("bean"),
                area(),
                body(),
                anchor("bot"),
                "player",
            ],
            "=": () => [
                sprite("sol"),
                area(),
                scale(3),
                body({ isStatic: true }),
                tile({ isObstacle: true }),
                "sol",
            ],
            ".": () => [
                sprite("vide"),
                area(),
                scale(3),
                body({ isStatic: true }),
                tile({ isObstacle: true }),
                "vide",
            ],
            "$": () => [
                sprite("ennemi"),
                area(),
                scale(1),
                body({ isStatic: true }),
                tile({ isObstacle: true }),
                "ennemi",
            ],
            "/": () => [
                sprite("drapeau"),
                area(),
                scale(1),
                body({ isStatic: true }),
                tile({ isObstacle: true }),
                "drapeau",
            ],
        },
    })

    // Get the player object from tag
    const player = level.get("player")[0]

    onKeyDown("left", () => {
        player.move(-SPEED, 0)
    })

    onKeyDown("right", () => {
        player.move(SPEED, 0)
    })


    function spawnBullet() {
        add([
            rect(5, 5),
            area(),
            pos(player.pos.sub(0, 10)),
            anchor("center"),
            color(127, 127, 255),
            outline(4),
            move(UP, BULLET_SPEED),
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


    onKeyPress("space", async () => {
        spawnBullet()
    })

    // Fall death
    player.onUpdate(() => {
        if (player.pos.y >= 480) {

        }
    })


    player.onCollide("drapeau", () => {
        if (levelIdBoss < LEVELS.length - 1) {
            // If there's a next level, go() to the same scene but load the next level
            go("game", {
                levelIdBoss: levelIdBoss + 1,
            })
        } else {
            // Otherwise we have reached the end of game, go to "win" scene!
            go("win")
        }
    })
})

scene("win", () => {

    add([
        text(`You win !!!`, {
            width: width(),
        }),
        pos(200, 200),
    ])
    onKeyPress(start)
})

function start() {
    // Start with the "game" scene, with initial parameters
    go("game", {
        levelIdBoss: 0,
    })
}

start()



// sol de base
/*
add([
    rect(width(), 48),
    outline(4),
    area(),
    pos(0, height() - 48),
    // Give objects a body() component if you don't want other solid objects pass through
    body({ isStatic: true }),
])

 */

/* ####################################################################### */
/*                                   Joueur                                */
/* ####################################################################### */
// joueur broforce
/*
const player = add([
    sprite("hero", {
        anim:"run"
    }),
    area(),
    body(),
    pos(100,200)
])*/


/* ####################################################################### */
/*                              Ennemie                                    */
/* ####################################################################### */

loadSprite("en", "ressources/joueur/mechant.png")


let enemies = [];

for (let i=0;i<3;i++){

    let oneEnemy = add([
        sprite("en"),
        body(),
        area(),
        pos(20,130),
        // This enemy cycle between 3 states, and start from "idle" state
        state("move", [ "idle", "attack", "move" ]),
    ])
    enemies.push(oneEnemy)
}
console.log(enemies)



function wakeEnemy(enemy){

    enemy.onStateEnter("idle", async () => {
        await wait(0)
        enemy.enterState("attack")
    })

    // When we enter "attack" state, we fire a bullet, and enter "move" state after 1 sec
    enemy.onStateEnter("attack", async () => {

        if (enemy.exists()) {
            // Don't do anything if player doesn't exist anymore
            if (player.exists()) {

                const dir = player.pos.sub(enemy.pos)

                add([
                    pos(enemy.pos),
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
        await wait(0.2)
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

}

enemies.forEach((enemy)=>{
    wakeEnemy(enemy)
})
