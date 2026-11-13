
/* =========================================
   IVY - TILESET EDITOR 2.0
   Selección rectangular de sprites
========================================= */

// =========================================
// 1. CANVAS
// =========================================

const canvas = document.getElementById("tilesetCanvas");
const ctx = canvas.getContext("2d");

const previewCanvas = document.getElementById("previewCanvas");
const previewCtx = previewCanvas.getContext("2d");

ctx.imageSmoothingEnabled = false;
previewCtx.imageSmoothingEnabled = false;

// =========================================
// 2. TILESETS
// =========================================

const tilesets = {
    exterior: new Image(),
    general: new Image(),
    buildings: new Image()
};

tilesets.exterior.src = "assets/tilesets/tileset-exterior.png";
tilesets.general.src = "assets/tilesets/tileset-general.png";
tilesets.buildings.src = "assets/tilesets/tileset-edificios.jpg";

let currentTileset = "exterior";
let currentImage = null;

let tileSize = 16;
let zoom = 3;
let showGrid = true;

// Selección libre
let selection = null;
let dragging = false;
let dragStart = null;

// =========================================
// 3. ELEMENTOS HTML
// =========================================

const tilesetSelect = document.getElementById("tilesetSelect");
const tileSizeSelect = document.getElementById("tileSize");
const zoomSelect = document.getElementById("zoom");
const gridCheckbox = document.getElementById("showGrid");

const widthInput = document.getElementById("selectionWidth");
const heightInput = document.getElementById("selectionHeight");

const imageDimensions = document.getElementById("imageDimensions");

const selectedStatus = document.getElementById("selectedStatus");
const tileColumn = document.getElementById("tileColumn");
const tileRow = document.getElementById("tileRow");
const tileX = document.getElementById("tileX");
const tileY = document.getElementById("tileY");
const tileDimensions = document.getElementById("tileDimensions");

// =========================================
// 4. CARGAR IMAGEN
// =========================================

function loadTileset() {

    currentImage = tilesets[currentTileset];

    selection = null;

    if (!currentImage.complete || !currentImage.naturalWidth) {

        selectedStatus.textContent = "Cargando imagen...";

        imageDimensions.textContent = "Cargando...";

        currentImage.onload = () => {
            if (currentImage === tilesets[currentTileset]) {
                finishLoading();
            }
        };

        currentImage.onerror = () => {
            selectedStatus.textContent =
                "No se pudo cargar la imagen";

            imageDimensions.textContent = "Error de carga";

            console.error("Error al cargar:", currentImage.src);
        };

        clearSelection();

        return;
    }

    finishLoading();
}

function finishLoading() {

    canvas.width = currentImage.naturalWidth;
    canvas.height = currentImage.naturalHeight;

    imageDimensions.textContent =
        `${canvas.width} × ${canvas.height} px`;

    clearSelection();
    renderEditor();
}

// =========================================
// 5. DIBUJAR EDITOR
// =========================================

function renderEditor() {

    if (!currentImage || !currentImage.complete) return;

    canvas.style.width = `${canvas.width * zoom}px`;
    canvas.style.height = `${canvas.height * zoom}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(currentImage, 0, 0);

    if (showGrid) {
        drawGrid();
    }

    if (selection) {
        drawSelection();
    }
}

// =========================================
// 6. CUADRÍCULA DE REFERENCIA
// =========================================

function drawGrid() {

    ctx.strokeStyle = "rgba(30, 255, 190, 0.5)";
    ctx.lineWidth = 1;

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
// 7. COORDENADAS DEL CURSOR
// =========================================

function getCanvasPosition(event) {

    const rect = canvas.getBoundingClientRect();

    const x = Math.floor(
        (event.clientX - rect.left) *
        (canvas.width / rect.width)
    );

    const y = Math.floor(
        (event.clientY - rect.top) *
        (canvas.height / rect.height)
    );

    return {
        x: Math.max(0, Math.min(x, canvas.width - 1)),
        y: Math.max(0, Math.min(y, canvas.height - 1))
    };
}

// =========================================
// 8. INICIAR SELECCIÓN
// =========================================

canvas.addEventListener("pointerdown", (event) => {

    if (!currentImage || !currentImage.naturalWidth) return;

    event.preventDefault();

    canvas.setPointerCapture(event.pointerId);

    const position = getCanvasPosition(event);

    dragging = true;

    dragStart = position;

    selection = {
        x: position.x,
        y: position.y,
        width: 1,
        height: 1
    };

    renderEditor();

});

// =========================================
// 9. ARRASTRAR SELECCIÓN
// =========================================

canvas.addEventListener("pointermove", (event) => {

    if (!dragging || !dragStart) return;

    const position = getCanvasPosition(event);

    const x = Math.min(dragStart.x, position.x);
    const y = Math.min(dragStart.y, position.y);

    const right = Math.max(dragStart.x, position.x);
    const bottom = Math.max(dragStart.y, position.y);

    selection = {
        x,
        y,
        width: right - x + 1,
        height: bottom - y + 1
    };

    updateSelectionInfo();
    renderEditor();

});

// =========================================
// 10. FINALIZAR SELECCIÓN
// =========================================

canvas.addEventListener("pointerup", () => {

    if (!dragging) return;

    dragging = false;
    dragStart = null;

    updateSelectionInfo();
    renderEditor();

});

// =========================================
// 11. DIBUJAR SELECCIÓN
// =========================================

function drawSelection() {

    ctx.fillStyle = "rgba(255, 220, 60, 0.25)";

    ctx.fillRect(
        selection.x,
        selection.y,
        selection.width,
        selection.height
    );

    ctx.strokeStyle = "#ffe45c";
    ctx.lineWidth = 2;

    ctx.strokeRect(
        selection.x + 1,
        selection.y + 1,
        Math.max(0, selection.width - 2),
        Math.max(0, selection.height - 2)
    );
}

// =========================================
// 12. ACTUALIZAR INFORMACIÓN
// =========================================

function updateSelectionInfo() {

    if (!selection) return;

    selectedStatus.textContent =
        "Región seleccionada";

    tileColumn.textContent =
        Math.floor(selection.x / tileSize);

    tileRow.textContent =
        Math.floor(selection.y / tileSize);

    tileX.textContent = `${selection.x} px`;
    tileY.textContent = `${selection.y} px`;

    tileDimensions.textContent =
        `${selection.width} × ${selection.height} px`;

    widthInput.value = selection.width;
    heightInput.value = selection.height;

    drawPreview();
}

// =========================================
// 13. MODIFICAR ANCHO Y ALTO
// =========================================

function resizeSelection() {

    if (!selection || !currentImage) return;

    const width = Math.max(
        1,
        Math.min(Number(widthInput.value) || 1, canvas.width - selection.x)
    );

    const height = Math.max(
        1,
        Math.min(Number(heightInput.value) || 1, canvas.height - selection.y)
    );

    selection.width = width;
    selection.height = height;

    updateSelectionInfo();
    renderEditor();
}

widthInput.addEventListener("change", resizeSelection);
heightInput.addEventListener("change", resizeSelection);

// =========================================
// 14. VISTA PREVIA
// =========================================

function drawPreview() {

    if (!selection) return;

    const maxPreview = 160;

    const scale = Math.min(
        maxPreview / selection.width,
        maxPreview / selection.height
    );

    const previewWidth = Math.max(
        1,
        Math.round(selection.width * scale)
    );

    const previewHeight = Math.max(
        1,
        Math.round(selection.height * scale)
    );

    previewCanvas.width = previewWidth;
    previewCanvas.height = previewHeight;

    previewCanvas.style.width = `${previewWidth}px`;
    previewCanvas.style.height = `${previewHeight}px`;

    previewCtx.clearRect(
        0, 0, previewWidth, previewHeight
    );

    previewCtx.drawImage(
        currentImage,
        selection.x,
        selection.y,
        selection.width,
        selection.height,
        0,
        0,
        previewWidth,
        previewHeight
    );
}

// =========================================
// 15. LIMPIAR SELECCIÓN
// =========================================

function clearSelection() {

    selection = null;

    selectedStatus.textContent =
        "Arrastra sobre la imagen para seleccionar";

    tileColumn.textContent = "-";
    tileRow.textContent = "-";
    tileX.textContent = "-";
    tileY.textContent = "-";
    tileDimensions.textContent = "-";

    previewCanvas.width = 0;
    previewCanvas.height = 0;

    widthInput.value = 32;
    heightInput.value = 32;
}

// =========================================
// 16. CONTROLES
// =========================================

tilesetSelect.addEventListener("change", () => {

    currentTileset = tilesetSelect.value;

    loadTileset();

});

tileSizeSelect.addEventListener("change", () => {

    tileSize = Number(tileSizeSelect.value);

    if (selection) {
        updateSelectionInfo();
    }

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
// 17. COPIAR COORDENADAS
// =========================================

document.getElementById("copyCoordinates")
    .addEventListener("click", async () => {

        if (!selection) {
            selectedStatus.textContent =
                "Primero selecciona una región";
            return;
        }

        const information = {
            tileset: currentTileset,
            x: selection.x,
            y: selection.y,
            width: selection.width,
            height: selection.height
        };

        try {

            await navigator.clipboard.writeText(
                JSON.stringify(information, null, 2)
            );

            selectedStatus.textContent =
                "¡Región copiada correctamente!";

        } catch (error) {

            selectedStatus.textContent =
                "No se pudo copiar";

            console.error(error);

        }

    });

// =========================================
// 18. INICIAR
// =========================================

loadTileset();
