export function calculateRoom(x, y, width, height, sliderValue) {
    const rectWidth = width - (sliderValue * width) / 100;
    const rectHeight = height - (sliderValue * height) / 100;

    const left = width - x - rectWidth / 2;
    const right = width - x + rectWidth / 2;
    const top = y - rectHeight / 2;
    const bottom = y + rectHeight / 2;

    const leftWall = [
        { x: 0, y: 0 },
        { x: left, y: top },
        { x: left, y: bottom },
        { x: 0, y: height }
    ];

    const roof = [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: right, y: top },
        { x: left, y: top }
    ];

    const rightWall = [
        { x: right, y: top },
        { x: width, y: 0 },
        { x: width, y: height },
        { x: right, y: bottom }
    ];

    const floor = [
        { x: left, y: bottom },
        { x: right, y: bottom },
        { x: width, y: height },
        { x: 0, y: height }
    ];

    const middle = [
        { x: left, y: top },
        { x: right, y: top },
        { x: right, y: bottom },
        { x: left, y: bottom }
    ];

    return {
        leftWall: leftWall,
        roof: roof,
        rightWall: rightWall,
        floor: floor,
        middle: middle
    };
}