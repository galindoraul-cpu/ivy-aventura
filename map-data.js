
/* =========================================
   IVY - MAPA DE LA PREPARATORIA
   Sector 1: Gallineros, TONYS y laboratorios
========================================= */

const MAP_DATA = {
    width: 80,
    height: 44,
    tileSize: 32,

    // Colores generales del escenario
    colors: {
        grass: "#659b50",
        dirt: "#b99470",
        concrete: "#a9a69e",
        concreteLight: "#bbb8b0",
        turquoise: "#55bfae",
        beige: "#d9c69c"
    },

    // Áreas de terreno
    terrain: [
        {
            type: "grass",
            points: [
                [0, 0], [80, 0],
                [80, 44], [0, 44]
            ]
        },

        // Camino inicial de tierra
        {
            type: "dirt",
            points: [
                [75, 40],
                [70, 37],
                [58, 33],
                [45, 29],
                [32, 25],
                [23, 22],
                [18, 20],
                [15, 18],
                [12, 17],
                [10, 20],
                [17, 24],
                [31, 29],
                [46, 34],
                [62, 39],
                [74, 43]
            ]
        },

        // Zona de cemento
        {
            type: "concrete",
            points: [
                [10, 11], [48, 11],
                [48, 25], [42, 29],
                [24, 23], [10, 19]
            ]
        }
    ],

    // Edificios: posiciones iniciales aproximadas
    buildings: [
        { id: "gallinero-5", x: 14, y: 4, w: 18, h: 6, floors: 2 },
        { id: "gallinero-6", x: 14, y: 13, w: 27, h: 5, floors: 2 },
        { id: "tonys-9", x: 42, y: 8, w: 10, h: 6, floors: 1 },

        { id: "laboratorio-11", x: 49, y: 8, w: 10, h: 16, floors: 2 },
        { id: "laboratorio-12", x: 68, y: 8, w: 7, h: 16, floors: 2 },
        { id: "laboratorio-10", x: 53, y: 25, w: 22, h: 6, floors: 2 }
    ],

    // Rejas: posiciones pendientes de ajustar con el plano
    fences: [],

    // Mesas y bancos
    furniture: {
        circularAreas: [],
        rectangularAreas: []
    },

    // Escaleras visuales y transitables
    stairs: []
};
