
/* =========================================
   IVY - UNA AVENTURA DE CUATRO RECUERDOS
   Motor inicial del videojuego
========================================= */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const TILE = 32;
const MAP_W = 60;
const MAP_H = 45;

const WORLD_W = MAP_W * TILE;
const WORLD_H = MAP_H * TILE;

const camera = { x: 0, y: 0 };

const keys = {};

const ivy = {
    x: 29 * TILE,
    y: 42 * TILE,
    speed: 3,
    direction: "down",
    moving: false,
    frame: 0
};

// =========================================
// 1. MAPA PROVISIONAL
// =========================================

const map = [];

for (let y = 0; y < MAP_H; y++) {
    map[y] = [];

    for (let x = 0; x < MAP_W; x++) {
        map[y][x] = "grass";
    }
}

// Caminos principales
function makePath(x1, y1, x2, y2) {
    for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
            if (map[y] && map[y][x] !== undefined) {
                map[y][x] = "path";
            }
        }
    }
}

makePath(27, 0, 32, 44);
makePath(8, 17, 51, 20);
makePath(12, 7, 47, 10);
makePath(10, 30, 49, 33);

// Acceso sur
makePath(26, 39, 33, 44);

// =========================================
// 2. EDIFICIOS PROVISIONALES
// =========================================

const buildings = [
    { x: 8, y: 5, w: 10, h: 6, name: "AULAS" },
    { x: 39, y: 5, w: 11, h: 6, name: "AULAS" },
    { x: 7, y: 23, w: 11, h: 7, name: "GALLINEROS" },
    { x: 39, y: 23, w: 12, h: 7, name: "CAFETERÍA" },
    { x: 22, y: 3, w: 8, h: 6, name: "MINARETE" },
    { x: 20, y: 35, w: 12, h: 5, name: "EDIFICIO" }
];

// =========================================
// 3. OBSTÁCULOS
// =========================================

const trees = [];

function addTree(x, y) {
    trees.push({ x: x * TILE, y: y * TILE });
}

// Árboles decorativos en los bordes
for (let x = 2; x < MAP_W - 2; x += 3) {
    addTree(x, 2);
    addTree(x, MAP_H - 3);
}

for (let y = 5; y < MAP_H - 5; y += 4) {
    addTree(3, y);
    addTree(MAP_W - 4, y);
}

function isBlocked(x, y) {
    const tx = Math.floor(x / TILE);
    const ty = Math.floor(y / TILE);

    if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) {
        return true;
    }

    for (const b of buildings) {
        if (
            tx >= b.x &&
            tx < b.x + b.w &&
            ty >= b.y &&
            ty < b.y + b.h
        ) return true;
    }

    for (const t of trees) {
        if (
            Math.abs(x - (t.x + TILE / 2)) < 13 &&
            Math.abs(y - (t.y + TILE / 2)) < 13
        ) return true;
    }

    return false;
}

// =========================================
// 4. DIBUJO DEL TERRENO
// =========================================

function drawGround() {
    const startX = Math.floor(camera.x / TILE);
    const startY = Math.floor(camera.y / TILE);

    const endX = Math.min(
        MAP_W,
        Math.ceil((camera.x + canvas.width) / TILE) + 1
    );

    const endY = Math.min(
        MAP_H,
        Math.ceil((camera.y + canvas.height) / TILE) + 1
    );

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const px = x * TILE - camera.x;
            const py = y * TILE - camera.y;

            if (map[y][x] === "grass") {
                ctx.fillStyle = "#80b95d";
            } else {
                ctx.fillStyle = "#d4bd86";
            }

            ctx.fillRect(px, py, TILE, TILE);

            // Detalles de textura
            if (map[y][x] === "grass" && (x + y) % 3 === 0) {
                ctx.fillStyle = "#70a952";
                ctx.fillRect(px + 8, py + 9, 3, 3);
            }

            if (map[y][x] === "path") {
                ctx.fillStyle = "#c5ac76";
                ctx.fillRect(px + 5, py + 5, 4, 3);
            }
        }
    }
}

// =========================================
// 5. DIBUJO DE EDIFICIOS
// =========================================

function drawBuildings() {
    for (const b of buildings) {
        const x = b.x * TILE - camera.x;
        const y = b.y * TILE - camera.y;
        const w = b.w * TILE;
        const h = b.h * TILE;

        // Sombra
        ctx.fillStyle = "#53604b";
        ctx.fillRect(x + 7, y + 8, w, h);

        // Paredes
        ctx.fillStyle = "#d9c69c";
        ctx.fillRect(x, y, w, h);

        // Techo
        ctx.fillStyle = "#9d5143";
        ctx.fillRect(x - 5, y - 5, w + 10, h * 0.38);

        // Borde del techo
        ctx.fillStyle = "#703c35";
        ctx.fillRect(x - 5, y + h * 0.38 - 5, w + 10, 5);

        // Ventanas
        ctx.fillStyle = "#77b7c3";

        for (let i = 0; i < b.w - 2; i += 2) {
            ctx.fillRect(
                x + 20 + i * TILE,
                y + h * 0.55,
                12,
                15
            );
        }

        // Puerta
        ctx.fillStyle = "#654735";
        ctx.fillRect(x + w / 2 - 13, y + h - 38, 26, 38);

        // Identificación provisional
        ctx.fillStyle = "#273c30";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText(b.name, x + w / 2, y + h + 16);
    }
}

// =========================================
// 6. ÁRBOLES
// =========================================

function drawTrees() {
    for (const t of trees) {
        const x = t.x - camera.x;
        const y = t.y - camera.y;

        // Tronco
        ctx.fillStyle = "#765036";
        ctx.fillRect(x + 12, y + 17, 10, 17);

        // Copa
        ctx.fillStyle = "#326b42";
        ctx.fillRect(x + 3, y + 5, 26, 20);

        ctx.fillStyle = "#4d9953";
        ctx.fillRect(x + 7, y, 18, 19);

        ctx.fillStyle = "#70b85a";
        ctx.fillRect(x + 11, y + 4, 7, 7);
    }
}

// =========================================
// 7. PERSONAJE IVY
// =========================================

function drawIvy() {
    const x = ivy.x - camera.x;
    const y = ivy.y - camera.y;

    const walkOffset = ivy.moving
        ? Math.sin(ivy.frame * 0.8) * 2
        : 0;

    // Sombra
    ctx.fillStyle = "#40513c";
    ctx.fillRect(x - 9, y + 11, 18, 5);

    // Cabello
    ctx.fillStyle = "#573b2d";
    ctx.fillRect(x - 8, y - 13, 16, 12);

    ctx.fillRect(x - 10, y - 7, 5, 12);
    ctx.fillRect(x + 5, y - 7, 5, 12);

    // Cara
    ctx.fillStyle = "#f0c59e";
    ctx.fillRect(x - 6, y - 7, 12, 12);

    // Cabello superior
    ctx.fillStyle = "#573b2d";
    ctx.fillRect(x - 8, y - 15, 16, 6);

    // Ojos
    ctx.fillStyle = "#29251f";

    if (ivy.direction === "down") {
        ctx.fillRect(x - 4, y - 2, 2, 2);
        ctx.fillRect(x + 3, y - 2, 2, 2);
    }

    // Cuerpo
    ctx.fillStyle = "#e8a4ae";
    ctx.fillRect(x - 8, y + 5, 16, 12);

    // Brazos
    ctx.fillStyle = "#f0c59e";
    ctx.fillRect(x - 11, y + 6, 3, 8);
    ctx.fillRect(x + 8, y + 6, 3, 8);

    // Piernas
    ctx.fillStyle = "#354b73";

    ctx.fillRect(x - 7, y + 17 + walkOffset, 6, 8);
    ctx.fillRect(x + 1, y + 17 - walkOffset, 6, 8);

    // Zapatos
    ctx.fillStyle = "#49352e";
    ctx.fillRect(x - 8, y + 24 + walkOffset, 7, 3);
    ctx.fillRect(x + 1, y + 24 - walkOffset, 7, 3);
}

// =========================================
// 8. MOVIMIENTO
// =========================================


function moveIvy() {
    let dx = 0;
    let dy = 0;

    // Detectar movimiento vertical
    if (keys["arrowup"] || keys["w"]) {
        dy = -ivy.speed;
        ivy.direction = "up";
    }

    if (keys["arrowdown"] || keys["s"]) {
        dy = ivy.speed;
        ivy.direction = "down";
    }

    // Detectar movimiento horizontal
    if (keys["arrowleft"] || keys["a"]) {
        dx = -ivy.speed;
        ivy.direction = "left";
    }

    if (keys["arrowright"] || keys["d"]) {
        dx = ivy.speed;
        ivy.direction = "right";
    }

    ivy.moving = dx !== 0 || dy !== 0;

    // Evitar que Ivy camine más rápido en diagonal
    if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
    }

    const radius = 9;

    const nextX = ivy.x + dx;
    const nextY = ivy.y + dy;

    // Comprobar colisiones horizontales
    if (
        dx !== 0 &&
        !isBlocked(nextX - radius, ivy.y) &&
        !isBlocked(nextX + radius, ivy.y)
    ) {
        ivy.x = nextX;
    }

    // Comprobar colisiones verticales
    if (
        dy !== 0 &&
        !isBlocked(ivy.x, nextY - radius) &&
        !isBlocked(ivy.x, nextY + radius)
    ) {
        ivy.y = nextY;
    }

    if (ivy.moving) {
        ivy.frame++;
    }
}


// =========================================
// 9. CÁMARA
// =========================================

function updateCamera() {
    camera.x = ivy.x - canvas.width / 2;
    camera.y = ivy.y - canvas.height / 2;

    camera.x = Math.max(
        0,
        Math.min(camera.x, WORLD_W - canvas.width)
    );

    camera.y = Math.max(
        0,
        Math.min(camera.y, WORLD_H - canvas.height)
    );
}

// =========================================
// 10. BUCLE PRINCIPAL
// =========================================

function gameLoop() {
    moveIvy();
    updateCamera();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGround();
    drawTrees();
    drawBuildings();
    drawIvy();

    requestAnimationFrame(gameLoop);
}

// =========================================
// 11. CONTROLES
// =========================================

window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)
    ) {
        e.preventDefault();
    }

    keys[key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

window.addEventListener("blur", () => {
    for (const key in keys) {
        keys[key] = false;
    }
});

// Iniciar videojuego
gameLoop();
