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

setGravity(800)
const SPEED = 300

const ENEMY_SPEED = 100
const BULLET_SPEED = 500
const JUMP_FORCE = 420

positionFire = 1;

/* ####################################################################### */
/*                                 Blocs                                   */
/* ####################################################################### */
loadSprite("mario", "ressources/joueur/mario.png")
loadSprite("en", "ressources/joueur/mechant.png")

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
const map = addLevel(
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
    "                                =                                                                                         ",
    "                                =                                     ========                                         /  ",
    "======================================================================........============================================",
    "..........................................................................................................................",
    ],

    {
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


// joueur test champi
let player = add([
    sprite("mario"),
    area(),
    body(),
    pos(140,250)
])

// Taking a bullet makes us disappear
player.onCollide("bullet", (bullet) => {
    destroy(bullet)
    destroy(player)
})
//////////////////////////////////////////
//         Caméra sur le joueur         //
//////////////////////////////////////////
player.onUpdate(() => {
    // Set the viewport center to player.pos
    camPos(player.worldPos())
})

player.onPhysicsResolve(() => {
    // Set the viewport center to player.pos
    camPos(player.worldPos())
})

//////////////////////////////////////////
//              Déplacement             //
//////////////////////////////////////////
onKeyDown("left", () => {
    player.move(-SPEED, 0)
    positionFire = 180;
})

onKeyDown("right", () => {
    player.move(SPEED, 0)
    positionFire = 1;
})

onKeyPress("space", () => {
    // .isGrounded() is provided by body()
    if (player.isGrounded()) {
        // .jump() is provided by body()
        player.jump(JUMP_FORCE)
    }
})
//////////////////////////////////////////
//                Tirer                 //
//////////////////////////////////////////
function spawnBullet() {
    add([
        rect(5, 5),
        area(),
        pos(player.pos.sub(-10, -10)),
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
/* ####################################################################### */
/*                                                                         */
/* ####################################################################### */

/* ####################################################################### */
/*                              Ennemie                                    */
/* ####################################################################### */
let enemies = [];

for (let i=1;i<4;i++){

    let oneEnemy = add([
        sprite("en"),
        area(),
        body(),
        pos((400+(200*i)),130),
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
