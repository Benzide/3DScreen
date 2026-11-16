// Rita projicerat grid i polygonerna
export function drawPerspectiveGrid(ctx, points, divisions = 10) {

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


export function projectElement(element, points) {
    const [p0, p1, p2, p3] = points;

    const width = element.offsetWidth;
    const height = element.offsetHeight;

    const dx1 = p1.x - p2.x;
    const dx2 = p3.x - p2.x;
    const dx3 = p0.x - p1.x + p2.x - p3.x;

    const dy1 = p1.y - p2.y;
    const dy2 = p3.y - p2.y;
    const dy3 = p0.y - p1.y + p2.y - p3.y;

    const denominator = dx1 * dy2 - dx2 * dy1;

    let g = 0;
    let h = 0;

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

    const matrix = [
        a / width, d / width, 0, g / width,
        b / height, e / height, 0, h / height,
        0, 0, 1, 0,
        c, f, 0, 1
    ];

    element.style.transformOrigin = "0 0";
    element.style.transform = `matrix3d(${matrix.join(",")})`;
}

export function getSubPolygon(points, scaleX, scaleY, offsetX = 0.5, offsetY = 0.5) {

    const [p0, p1, p2, p3] = points;

    // Perspektivens beräkningar
    const dx1 = p1.x - p2.x;
    const dx2 = p3.x - p2.x;
    const dx3 = p0.x - p1.x + p2.x - p3.x;

    const dy1 = p1.y - p2.y;
    const dy2 = p3.y - p2.y;
    const dy3 = p0.y - p1.y + p2.y - p3.y;

    const denominator = dx1 * dy2 - dx2 * dy1;

    let g = 0;
    let h = 0;

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

    function project(u, v) {
        const w = g * u + h * v + 1;

        return {
            x: (a * u + b * v + c) / w,
            y: (d * u + e * v + f) / w
        };
    }

    const left = offsetX - scaleX / 2;
    const right = offsetX + scaleX / 2;
    const top = offsetY - scaleY / 2;
    const bottom = offsetY + scaleY / 2;

    return [
        project(left, top),
        project(right, top),
        project(right, bottom),
        project(left, bottom)
    ];
}