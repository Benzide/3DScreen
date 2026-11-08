
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

// Ladda MediaPipe
const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);

// Skapa FaceLandmarker
const faceLandmarker = await FaceLandmarker.createFromOptions(
    vision,
    {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numFaces: 1
    }
);


// hämta slider
const slider = document.getElementById("myRange");

// Hämta canvas
const canvas = document.getElementById("fullscreen");
const ctx = canvas.getContext("2d");

let sliderValue = slider.value;
slider.oninput = changeSliderValue;

function changeSliderValue () {
  sliderValue = slider.value;
}

// Anpassa canvas till fönstret
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Skapa dolt videoelement
const video = document.createElement("video");

video.autoplay = true;
video.playsInline = true;
video.muted = true;

// Starta kameran
const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
});

video.srcObject = stream;
await video.play();

let lastVideoTime = -1;

let currentX = null;
let currentY = null;

let targetX = null;
let targetY = null;

const smoothing = 0.15;



// Rita projicerat grid i polygonerna
function drawPerspectiveGrid(points, divisions = 10) {

    const [p0, p1, p2, p3] = points;

    ctx.save();

    // Beräkna perspektivtransformationens parametrar
    const dx1 = p1.x - p2.x;
    const dx2 = p3.x - p2.x;
    const dx3 = p0.x - p1.x + p2.x - p3.x;

    const dy1 = p1.y - p2.y;
    const dy2 = p3.y - p2.y;
    const dy3 = p0.y - p1.y + p2.y - p3.y;

    let g = 0;
    let h = 0;

    const denominator = dx1 * dy2 - dx2 * dy1;

    if (Math.abs(dx3) > 0.0001 || Math.abs(dy3) > 0.0001) {
        g = (dx3 * dy2 - dx2 * dy3) / denominator;
        h = (dx1 * dy3 - dx3 * dy1) / denominator;
    }

    const a = p1.x - p0.x + g * p1.x;
    const b = p3.x - p0.x + h * p3.x;
    const c = p0.x;

    const d = p1.y - p0.y + g * p1.y;
    const e = p3.y - p0.y + h * p3.y;
    const f = p0.y;

    // Omvandla koordinater från rutnätet till polygonen
    function project(u, v) {
        const w = g * u + h * v + 1;

        return {
            x: (a * u + b * v + c) / w,
            y: (d * u + e * v + f) / w
        };
    }

    // Rita rutnätet
    ctx.beginPath();

    for (let i = 0; i <= divisions; i++) {
        const t = i / divisions;

        // Vertikala linjer
        let start = project(t, 0);
        let end = project(t, 1);

        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);

        // Horisontella linjer
        start = project(0, t);
        end = project(1, t);

        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
    }

    ctx.strokeStyle = "rgba(0, 152, 253, 0.97)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
}



//Huvudloop
function renderLoop() {

    
    // 1. Hitta ansiktet
    if (
        video.readyState >= 2 &&
        video.currentTime !== lastVideoTime
    ) {

        lastVideoTime = video.currentTime;

        const result = faceLandmarker.detectForVideo(
            video,
            performance.now()
        );

        if (result.faceLandmarks.length > 0) {

            const landmarks = result.faceLandmarks[0];

            const leftIris = landmarks[468];
            const rightIris = landmarks[473];

            const irisX = (leftIris.x + rightIris.x) / 2;
            const irisY = (leftIris.y + rightIris.y) / 2;

            targetX = irisX * canvas.width;
            targetY = irisY * canvas.height;

            // Första positionen
            if (currentX === null) {
                currentX = targetX;
                currentY = targetY;
            }
        }
    }


    // 2. Mjuka upp det, mer smooth
    if (targetX !== null) {

        currentX += (targetX - currentX) * smoothing;
        currentY += (targetY - currentY) * smoothing;
    }


    // 3. Rita på canvasen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentX !== null) {

        const x = currentX;
        const y = currentY;

        const rectWidth = canvas.width - (sliderValue * canvas.width) / 100;
        const rectHeight = canvas.height - (sliderValue * canvas.height) / 100;

        const left = canvas.width - x - rectWidth / 2;
        const right = canvas.width - x + rectWidth / 2;
        const top = y - rectHeight / 2;
        const bottom = y + rectHeight / 2;


        // Polygoner
        const leftWall = [
            { x: 0, y: 0 },
            { x: 0, y: canvas.height },
            { x: left, y: bottom },
            { x: left, y: top }
        ];

        const roof = [
            { x: 0, y: 0 },
            { x: canvas.width, y: 0 },
            { x: right, y: top },
            { x: left, y: top }
        ];

        const rightWall = [
            { x: canvas.width, y: 0 },
            { x: canvas.width, y: canvas.height },
            { x: right, y: bottom },
            { x: right, y: top }
        ];

        const floor = [
            { x: 0, y: canvas.height },
            { x: canvas.width, y: canvas.height },
            { x: right, y: bottom },
            { x: left, y: bottom }
        ];

        const rectangle = [
            { x: left, y: top },
            { x: right, y: top },
            { x: right, y: bottom },
            { x: left, y: bottom }
        ];


        // Rita alla ytor
        const surfaces = [
            leftWall,
            roof,
            rightWall,
            floor,
            rectangle
        ];

        for (const points of surfaces) {

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }

            ctx.closePath();

            ctx.fillStyle = "rgb(20, 20, 20)";
            ctx.fill();

            ctx.strokeStyle = "white";
            ctx.lineWidth = 1;
            ctx.stroke();

            drawPerspectiveGrid(points, 10);
        }
    }

    requestAnimationFrame(renderLoop);
}

renderLoop();
