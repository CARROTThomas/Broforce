

// Start game
/* ####################################################################### */
/*                                START                                    */
/* ####################################################################### */
kaboom({
    global: true,
    fullscreen: true,
    scale: 3,
    debug: true,
    clearColor: [0, 0, 0, 1],
})

/* ####################################################################### */
/*                              Paramètre                                  */
/* ####################################################################### */

setGravity(1600)
const SPEED = 100

const ENEMY_SPEED = 100
const BULLET_SPEED = 400

/* ####################################################################### */
/*                                 Blocs                                   */
/* ####################################################################### */
loadSprite("bean", "ressources/joueur/mechant.png")

loadSprite("truc", "ressources/blocs/truc.png")
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

const map = addLevel([
    "                           .                                                                                              ",
    "                                                                                                                          ",
    "                                                                                                                          ",
    "                                                                                                                          ",
    "                                                                                                                          ",
    "                                                                                                                          ",
    "                                                                    =====                                                 ",
    "===================================                              ============              ====                           ",
    "..................................................     ..    .............................         .......................",
], {
    tileWidth: 16,
    tileHeight: 16,
    pos: vec2(100, 130),
    tiles: {
        "=": () => [
            sprite("truc"),
            area(),
            scale(2),
            body({isStatic: true}),
            tile({isObstacle: true}),
            "truc",
        ],
        ".": () => [
            sprite("vide"),
            area(),
            scale(2),
            body({isStatic: true}),
            tile({isObstacle: true}),
            "vide",
        ],
    }
});

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
/*                          Déplacement Joueur                             */
/* ####################################################################### */

// onKeyDown() registers an event that runs every frame as long as user is holding a certain key
onKeyDown("left", () => {
    // .move() is provided by pos() component, move by pixels per second
    player.move(-SPEED, 0)
})

onKeyDown("right", () => {
    player.move(SPEED, 0)
})

onKeyPress("space", () => {
    // .isGrounded() is provided by body()
    if (player.isGrounded()) {
        // .jump() is provided by body()
        player.jump()
    }
})


/* ####################################################################### */
/*                             Assets Joueur                               */
/* ####################################################################### */



// Asset Joueur Broforce


loadSpriteAtlas("Assets/Caractere.png", {
    "hero": {
        "x": .5,
        "y": 0,
        "width": 275,
        "height": 44,
        "sliceX": 8,
        "anims": {
            "run": {
                "from": 7,
                "to": 0,
                "speed": 10,
                "loop": true,
            },
            "hit": 8,
        },
    },
});

// joueur final
/*
const player = add([
    sprite("hero", {
        anim:"run"
    }),
    area(),
    body(),
    pos(100,200)
])

 */




// ##################################################################

// joueur test champi

const player = add([
    sprite("bean"),
    area(),
    body(),
    pos(100,130)
])






// Movements
onKeyDown("left", () => {
    player.move(-SPEED, 0)
})

onKeyDown("right", () => {
    player.move(SPEED, 0)
})


onKeyDown("z", () => {
    player.shoot()
})

//$ Caméra sur le joueur $//
player.onUpdate(() => {
    // Set the viewport center to player.pos
    camPos(player.worldPos())
})

player.onPhysicsResolve(() => {
    // Set the viewport center to player.pos
    camPos(player.worldPos())
})


/* ####################################################################### */
/*                                                                         */
/* ####################################################################### */
/*
function start() {
    // Start with the "game" scene, with initial parameters
    go("game", {
        levelIdx: 0,
    })
}


start()
*/



/* ####################################################################### */
/*                              Ennemie                                    */
/* ####################################################################### */

loadSprite("en", "ressources/joueur/mechant.png")

const enemy = add([
    sprite("en"),
    area(),
    body(),
    pos(400,130),
    // This enemy cycle between 3 states, and start from "idle" state
    state("move", [ "idle", "attack", "move" ]),
])

enemy.onStateEnter("idle", async () => {
    await wait(0.5)
    enemy.enterState("attack")
})

// When we enter "attack" state, we fire a bullet, and enter "move" state after 1 sec
enemy.onStateEnter("attack", async () => {

    // Don't do anything if player doesn't exist anymore
    if (player.exists()) {

        const dir = player.pos.sub(enemy.pos).unit()

        add([
            pos(enemy.pos),
            move(dir, BULLET_SPEED),
            rect(5, 5),
            area(),
            offscreen({ destroy: true }),
            anchor("center"),
            color(YELLOW),
            "bullet",
        ])

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

// Taking a bullet makes us disappear
player.onCollide("bullet", (bullet) => {
    destroy(bullet)
    destroy(player)
    addKaboom(bullet.pos)
})