import { createFaceTracker } from "./camera/faceTracking.js";
import { calculateRoom } from "./room/roomGeometry.js";
import { drawRoom } from "./rendering/renderer.js";
import { getSubPolygon, projectElement } from "./rendering/projection.js";
import { initializeControls } from "./ui/controls.js";

async function startApp() {
    const canvas = document.getElementById("fullscreen");
    const ctx = canvas.getContext("2d");

    const elementContainer = document.getElementById("elementContainer");

    const controls = initializeControls();
    const faceTracker = await createFaceTracker();

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let currentX = null;
    let currentY = null;

    const smoothing = 0.3;

    function renderLoop() {
        const position = faceTracker.update();

        if (position !== null) {
            const targetX = position.x * canvas.width;
            const targetY = position.y * canvas.height;

            if (currentX === null) {
                currentX = targetX;
                currentY = targetY;
            }

            currentX += (targetX - currentX) * smoothing;
            currentY += (targetY - currentY) * smoothing;
        }

        if (currentX !== null) {
            const room = calculateRoom(
                currentX,
                currentY,
                canvas.width,
                canvas.height,
                controls.sliderValue
            );

            drawRoom(ctx, room);

            if (controls.projected) {
                const selectedSurface = {
                    left: room.leftWall,
                    top: room.roof,
                    right: room.rightWall,
                    bottom: room.floor,
                    middle: room.middle
                }[controls.selectedWall];

                projectElement(
                    elementContainer,
                    getSubPolygon(
                        selectedSurface,
                        controls.resizeValue.x,
                        controls.resizeValue.y
                    )
                );
            }
        }

        requestAnimationFrame(renderLoop);
    }

    renderLoop();
}

startApp();