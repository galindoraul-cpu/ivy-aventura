
/* =========================================
   IVY - TILESET EDITOR
   Visor y selector de elementos gráficos
========================================= */

const canvas = document.getElementById("tilesetCanvas");
const ctx = canvas.getContext("2d");

const previewCanvas = document.getElementById("previewCanvas");
const previewCtx = previewCanvas.getContext("2d");

ctx.imageSmoothingEnabled = false;
previewCtx.imageSmoothingEnabled = false;

// =========================================
// 1. CARGAR TILESETS
// =========================================

const tilesets = {
    exterior: new Image(),
    general: new Image()
};

tilesets.exterior.src = "assets/tilesets/tileset-exterior.png";
tilesets.general.src = "assets/tilesets/tileset-general.png";

let currentTileset = "exterior";
let currentImage = null;

let tileSize = 16;
let zoom = 3;
let showGrid = true;

let selectedTile = null;

// =========================================
// 2. ELEMENTOS HTML
// =========================================

const tilesetSelect = document.getElementById("tilesetSelect");
const tileSizeSelect = document.getElementById("tileSize");
const zoomSelect = document.getElementById("zoom");
const gridCheckbox = document.getElementById("showGrid");

const imageDimensions = document.getElementById("imageDimensions");

const selectedStatus = document.getElementById("selectedStatus");
const tileColumn = document.getElementById("tileColumn");
const tileRow = document.getElementById("tileRow");
const tileX = document.getElementById("tileX");
const tileY = document.getElementById("tileY");
const tileDimensions = document.getElementById("tileDimensions");

// =========================================
// 3. CARGA Y SELECCIÓN DE IMAGEN
// =========================================

function loadTileset() {

    currentImage = tilesets[currentTileset];

    if (!currentImage.complete || !currentImage.naturalWidth) {
        currentImage.onload = () => {
            renderEditor();
        };

        currentImage.onerror = () => {
            selectedStatus.textContent =
                "Error al cargar el tileset";
        };

        return;
    }

    selectedTile = null;

    imageDimensions.textContent =
        `${currentImage.naturalWidth} × ${currentImage.naturalHeight} px`;

    clearSelection();

    renderEditor();
}

// =========================================
// 4. DIBUJAR IMAGEN Y CUADRÍCULA
// =========================================

function renderEditor() {

    if (!currentImage || !currentImage.complete) return;

    const width = currentImage.naturalWidth;
    const height = currentImage.naturalHeight;

    canvas.width = width;
    canvas.height = height;

    canvas.style.width = `${width * zoom}px`;
    canvas.style.height = `${height * zoom}px`;

    ctx.clearRect(0, 0, width, height);

    ctx.drawImage(currentImage, 0, 0);

    if (showGrid) {
        drawGrid();
    }

    if (selectedTile) {
        drawSelection();
    }
}

function drawGrid() {

    ctx.strokeStyle = "rgba(30, 255, 190, 0.55)";
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= canvas.width; x += tileSize) {

        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, canvas.height);
        ctx.stroke();

    }

    for (let y = 0; y <= canvas.height; y += tileSize) {

        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(canvas.width, y + 0.5);
        ctx.stroke();

    }
}

// =========================================
// 5. SELECCIONAR TILE
// =========================================

canvas.addEventListener("click", (event) => {

    if (!currentImage) return;

    const rect = canvas.getBoundingClientRect();

    const x = Math.floor(
        (event.clientX - rect.left) *
        (canvas.width / rect.width)
    );

    const y = Math.floor(
        (event.clientY - rect.top) *
        (canvas.height / rect.height)
    );

    const column = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);

    const pixelX = column * tileSize;
    const pixelY = row * tileSize;

    if (
        pixelX + tileSize > canvas.width ||
        pixelY + tileSize > canvas.height
    ) {
        return;
    }

    selectedTile = {
        column,
        row,
        x: pixelX,
        y: pixelY
    };

    updateSelection();
    renderEditor();

});

// =========================================
// 6. ACTUALIZAR INFORMACIÓN
// =========================================

function updateSelection() {

    if (!selectedTile) return;

    selectedStatus.textContent =
        "Tile seleccionado correctamente";

    tileColumn.textContent = selectedTile.column;
    tileRow.textContent = selectedTile.row;

    tileX.textContent = `${selectedTile.x} px`;
    tileY.textContent = `${selectedTile.y} px`;

    tileDimensions.textContent =
        `${tileSize} × ${tileSize} px`;

    drawPreview();
}

function clearSelection() {

    selectedStatus.textContent =
        "Selecciona un tile de la imagen";

    tileColumn.textContent = "-";
    tileRow.textContent = "-";
    tileX.textContent = "-";
    tileY.textContent = "-";
    tileDimensions.textContent = "-";

    previewCanvas.width = 0;
    previewCanvas.height = 0;

}

// =========================================
// 7. RESALTAR SELECCIÓN
// =========================================

function drawSelection() {

    ctx.fillStyle = "rgba(255, 220, 60, 0.3)";

    ctx.fillRect(
        selectedTile.x,
        selectedTile.y,
        tileSize,
        tileSize
    );

    ctx.strokeStyle = "#ffe45c";
    ctx.lineWidth = 2;

    ctx.strokeRect(
        selectedTile.x + 1,
        selectedTile.y + 1,
        tileSize - 2,
        tileSize - 2
    );
}

// =========================================
// 8. VISTA PREVIA AMPLIADA
// =========================================

function drawPreview() {

    previewCanvas.width = tileSize;
    previewCanvas.height = tileSize;

    previewCanvas.style.width = `${tileSize * 6}px`;
    previewCanvas.style.height = `${tileSize * 6}px`;

    previewCtx.imageSmoothingEnabled = false;

    previewCtx.drawImage(
        currentImage,
        selectedTile.x,
        selectedTile.y,
        tileSize,
        tileSize,
        0,
        0,
        tileSize,
        tileSize
    );
}

// =========================================
// 9. CONTROLES
// =========================================

tilesetSelect.addEventListener("change", () => {

    currentTileset = tilesetSelect.value;

    loadTileset();

});

tileSizeSelect.addEventListener("change", () => {

    tileSize = Number(tileSizeSelect.value);

    selectedTile = null;

    clearSelection();
    renderEditor();

});

zoomSelect.addEventListener("change", () => {

    zoom = Number(zoomSelect.value);

    renderEditor();

});

gridCheckbox.addEventListener("change", () => {

    showGrid = gridCheckbox.checked;

    renderEditor();

});

// =========================================
// 10. COPIAR COORDENADAS
// =========================================

document.getElementById("copyCoordinates")
    .addEventListener("click", async () => {

        if (!selectedTile) {
            selectedStatus.textContent =
                "Primero selecciona un tile";
            return;
        }

        const information = {
            tileset: currentTileset,
            column: selectedTile.column,
            row: selectedTile.row,
            x: selectedTile.x,
            y: selectedTile.y,
            width: tileSize,
            height: tileSize
        };

        try {

            await navigator.clipboard.writeText(
                JSON.stringify(information, null, 2)
            );

            selectedStatus.textContent =
                "¡Coordenadas copiadas!";

        } catch (error) {

            selectedStatus.textContent =
                "No se pudo copiar. Usa la consola.";

            console.error(error);

        }

    });

// =========================================
// 11. INICIAR EDITOR
// =========================================

loadTileset();
