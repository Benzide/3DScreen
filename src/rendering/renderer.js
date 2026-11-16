import { drawPerspectiveGrid } from "./projection.js";

export function drawRoom(ctx, room) {
    const surfaces = [
        room.leftWall,
        room.roof,
        room.rightWall,
        room.floor,
        room.middle
    ];

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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
        ctx.stroke();

        drawPerspectiveGrid(ctx, points, 15);
    }
}