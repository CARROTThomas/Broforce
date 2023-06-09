/* ####################################################################### */
/*                                START                                    */
/* ####################################################################### */
kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0, 0, 0, 1],
    background: [11, 17, 30],
})

/* ####################################################################### */
/*                              Paramètre                                  */
/* ####################################################################### */
setGravity(800)

const SPEED = 300
let SPEED_FIRE = 1000
const ENEMY_SPEED = 40
const BOSS_SPEED = 300
const BULLET_SPEED = 500

const JUMP_FORCE = 400

const PLAYER_HEALTH = 3
const BOSS_HEALTH = 50

let positionFire = 1;

// chercher les éléments sur une map
const regex1 = '>';
const regex2 = '@';
const regex3 = 'ù';
// tableau de position trouver
let arrayPositionEnemies = [];
let arrayPositionFlammesBar = [];

// ajouter un bouton
function addButton(txt, p1, p2, f) {

    // add a parent background object
    const btn = add([
        rect(240, 80, {radius: 8}),
        pos(p1, p2),
        area(),
        scale(1),
        anchor("center"),
        outline(4),
    ])

    btn.add([
        text(txt),
        anchor("center"),
        color(0, 0, 0),
    ])

    btn.onClick(f)

    return btn
}
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

loadSpriteAtlas("/ressources/joueur/BroForce2.png", {
    "hero": {
        "x": 19,
        "y": 0,
        "width": 255,
        "height": 100,
        "sliceX": 8,
        "sliceY": 5,
        "anims": {
            "idle": {
                "from": 0,
                "to": 2,
                "speed": 3,
                "loop": true,
            },
            "run": {
                "from": 0,
                "to": 2,
                "speed": 3,
                "loop": true,
            },
        }
    }
})
/* ####################################################################### */
/*                          MAP + SCENE JEU                                */
/* ####################################################################### */
const LEVELS = [
    [
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
        "                 $              =       ...                                          $$$                                  ",
        "                ...             =          .     ù                            ============                                ",
        "                                =                                                                   >                     ",
        "                                =                        >               $                                            /   ",
        "                                =                                     ========                                       ///  ",
        "======================================================================        ============================================",
    ],
    [
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                            $                               @                                                             ",
        "                           ...                                                                                            ",
        "                                         $                                                                                ",
        "                 $                      ...                                          $$$                                  ",
        "                ...                        @                                  =============                               ",
        "                                =                                                                                         ",
        "                                =                                        $                                            /   ",
        "                                =                                     ========                                       ///  ",
        "======================================================================        ============================================",
    ],
    [
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                                                                                                                          ",
        "                            $                               @                                                             ",
        "                           ...                                                                                            ",
        "                                         $                                                                                ",
        "                 $                      ...                                          $$$                  @               ",
        "                ...                        @                                  =============                               ",
        "                                =                               >                            @                            ",
        "                                =                    @                   $                            >               /   ",
        "                                =             >                    @  ========                                       ///  ",
        "======================================================================        ============================================",
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

    //camScale(2)

    // Recherche de méchant ou flammesBarre dans la map
    for (let j = 0; j <= 15; j++) {
        posMechant = (LEVELS[levelIdx][j].search(regex1))
        posFlammesBar1 = (LEVELS[levelIdx][j].search(regex2))
        posFlammesBar2 = (LEVELS[levelIdx][j].search(regex3))
        //console.log(posMechant)
        if (posMechant !== -1) {
            arrayPositionEnemies.push(
                {
                    "x": (100 + (posMechant * 16)),
                    "y":(100 + (j)),
                }
            )
        }
        if (posFlammesBar1 !== -1) {
            arrayPositionFlammesBar.push(
                {
                    "x": (110 + (posFlammesBar1 * 16)),
                    "y":(130 + (j * 16)),
                    "deg": 60,
                    "num": 6,
                }
            )
        }
        if (posFlammesBar2 !== -1) {
            arrayPositionFlammesBar.push(
                {
                    "x": (110 + (posFlammesBar2 * 16)),
                    "y":(130 + (j * 16)),
                    "deg": -60,
                    "num": 6,
                }
            )
        }
    }

    // plein écran
    onKeyPress("f", () => {
        setFullscreen(!isFullscreen())
    })
    /* ####################################################################### */
    /*                             Joueur                                      */
    /* ####################################################################### */
    // Ajouter un joueur
    let player = add([
        sprite("mario"),
        //sprite("hero", { anim: "idle" }),
        area(),
        body(),
        //scale(1.5),
        scale(1),
        pos(140,300),
    ])

    // camera
    player.onUpdate(() => {
        // Set the viewport center to player.pos
        camPos(player.worldPos())
    })
    player.onPhysicsResolve(() => {
        // Set the viewport center to player.pos
        camPos(player.worldPos())
    })

    // Movements + direction de tire
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

    // direction de tire
    onKeyDown("up", () => {
        positionFire = -90;
    })
    onKeyDown("down", () => {
        positionFire = 90;
    })

    // Fall death
    player.onUpdate(() => {
        if (player.pos.y >= 500) {
            go("lose", { score: score })
        }
    })
    // contact bullet
    player.onCollide("bullet", (bullet) => {
        destroy(bullet)
        destroy(player)
        go("lose", { score: score })
    })
    // contact flamme
    player.onCollide("flame", () => {
        player.destroy()
        go("lose", { score: score })
    })
    // collect de jeton
    player.onCollide("coin", (coin) => {
        destroy(coin)
        score++
        scoreLabel.text = score
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
            go("battle", {
                levelIdBoss: 0,
                score: score,
            })
        }
    })

    // Tirer
    function spawnBullet() {
        add([
            rect(5, 5),
            area(),
            pos(player.pos.sub(0, -5)),
            anchor("center"),
            color(YELLOW),
            move(positionFire, BULLET_SPEED),
            offscreen({ destroy: true }),
            // strings here means a tag
            "feu",
        ])
    }

    onKeyPress("z", async () => {
        spawnBullet();
    })

    // Si une bullet touche un bloc
    onCollide("feu", "sol", (feu) => {
        destroy(feu)
    })
    onCollide("feu", "vide", (feu) => {
        destroy(feu)
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
                        offscreen({ destroy: true }),
                        anchor("center"),
                        color(RED),
                        "bullet",
                    ])
                }
            }
            await wait(.5)
            enemy.enterState("move")
        })

        enemy.onStateEnter("move", async () => {
            await wait(.7)
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

const BOSS = [
    [
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".                                      .",
        ".======================================.",
    ],
]
scene("battle", ({levelIdBoss, score})=> {
    // Use the level passed, or first level
    const level = addLevel(BOSS[levelIdBoss || 0], {
        // 40
        tileWidth: 24,
        tileHeight: 24,
        pos: vec2(100, 100),
        tiles: {
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
        },
    })
    /* ########################################################################### */
    /* ########################################################################### */

    // Plein écran
    onKeyPress("f", () => {
        setFullscreen(!isFullscreen())
    })

    // affichage titre KILL THE BOSS
    function late(t) {
        let timer = 0
        return {
            add() {
                this.hidden = true
            },
            update() {
                timer += dt()
                if (timer >= t) {
                    this.hidden = false
                }
            },
        }
    }
    add([
        text("KILL", { size: 160 }),
        pos(width() / 2, height() / 2),
        anchor("center"),
        lifespan(1),
        fixed(),
    ])
    add([
        text("THE", { size: 80 }),
        pos(width() / 2, height() / 2),
        anchor("center"),
        lifespan(2),
        late(1),
        fixed(),
    ])
    add([
        text("BOSS", { size: 120 }),
        pos(width() / 2, height() / 2),
        anchor("center"),
        lifespan(4),
        late(2),
        fixed(),
    ])
    /* ########                ######                ###### */

    /* ########                PLAYER                ###### */
    const player = add([
        sprite("mario"),
        area(),
        health(PLAYER_HEALTH),
        body(),
        scale(2),
        pos(140,300),
        "player",
    ])

    onCollide("feu", "enemy", (b, e) => {
        destroy(b)
        e.hurt(1)
    })
    // déplacement
    onKeyDown("left", () => {
        player.move(-SPEED, 0)
        if (player.pos.x < 0) {
            player.pos.x = width()
        }
    })
    onKeyDown("right", () => {
        player.move(SPEED, 0)
        if (player.pos.x > width()) {
            player.pos.x = 0
        }
    })
    // tirer
    function spawnBullet(p) {
        add([
            rect(12, 48),
            area(),
            pos(p),
            anchor("center"),
            color(127, 127, 255),
            outline(4),
            move(UP, BULLET_SPEED),
            offscreen({ destroy: true }),
            "feu",
        ])
    }
    onKeyPress("z", () => {
        spawnBullet(player.pos.sub(-20, 10))
    })

    // contact bullet
    player.onCollide("bullet", (bullet) => {
        destroy(bullet)
        player.hurt(1)
    })
    player.onHurt(() => {
        healthbar.set(player.hp())
    })
    // boss mort
    player.onDeath(() => {
        go("lose", { score: (score) })
    })

    /* ########                BOSS                ###### */
    // création
    const boss = add([
        sprite("en"),
        area(),
        pos(width() / 2, 40),
        health(BOSS_HEALTH),
        scale(5),
        anchor("top"),
        state("attack"),
        "enemy",
        {
            dir: 1,
        },
    ])
    // déplacement
    boss.onUpdate( () => {
        boss.move(BOSS_SPEED * boss.dir, 0)
        if (boss.dir === 1 && boss.pos.x >= 960) {
            boss.dir = -1
        }
        if (boss.dir === -1 && boss.pos.x <= 170) {
            boss.dir = 1
        }
    })

    // boss toucher
    onCollide("feu", "enemy", (b, e) => {
        destroy(b)
        e.hurt(1)
    })
    boss.onHurt(() => {
        healthbar.set(boss.hp())
    })
    // boss mort
    boss.onDeath(() => {
        go("win", { score: (score) })
    })
    // barre de vie
    const healthbar = add([
        rect(width(), 24),
        pos(0, 0),
        color(107, 201, 108),
        fixed(),
        {
            max: BOSS_HEALTH,
            set(hp) {
                this.width = width() * hp / this.max
            },
        },
    ])

    boss.onStateEnter("attack", async () => {
            // Don't do anything if player doesn't exist anymore
            if (player.exists()) {
                while(player.exists()) {
                    let dir = player.pos.sub(boss.pos)
                    add([
                        pos(boss.pos.sub(-10, -10)),
                        move(dir, BULLET_SPEED),
                        rect(15, 15),
                        area(),
                        offscreen({ destroy: true }),
                        anchor("center"),
                        color(RED),
                        "bullet",
                    ])
                    await wait(.5)
                }
            }
    })
    /* ########################################################################### */
    /* ########################################################################### */
})
/* ####################################################################### */
/*                        START / LOSE / WIN / MENU                        */
/* ####################################################################### */
scene("menu", ()=> {
    add([
        sprite("mario"),
        pos(width() / 2, height() / 2 - 108),
        scale(3),
        anchor("center"),
    ])
    addButton("Start", (width() / 2), (height() / 2) , () => {
        go("game", {
            levelIdx: 0,
            score: 0,
        })
    })
    onKeyPress("space", () => go("game", {
        levelIdx: 0,
        score: 0,
    }))
})

scene("lose", ({ score }) => {

    // display player
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
    // return to menu
    onKeyPress("space", () => go("menu", {
        levelIdx: 0,
        score: 0,
    }))
    onClick(() => go("menu", {
        levelIdx: 0,
        score: 0,
    }))
})
scene("win", ({ score }) => {

    // display player
    add([
        sprite("mario"),
        pos(width() / 2, height() / 2 - 108),
        scale(3),
        anchor("center"),
    ])
    // display score
    add([
        text(`GG ! You Win and you have ${score} coins  !!!`),
        pos(width() / 2, height() / 2 + 108),
        scale(1),
        anchor("center"),
    ])

    // return to menu
    onKeyPress("space", () => go("menu",))
    onClick(() => go("menu"))
})

function start() {
    // Start with the "game" scene, with initial parameters
    /*
    go("battle", {
        levelIdBoss: 0,
        score: 0,
    })


    go("game", {
        levelIdx: 0,
        score: 0,
    })
    */
    go("menu")
}
start()
/* ##################################################################################################################################### */
/* ##################################################################################################################################### */
/* ##################################################################################################################################### */