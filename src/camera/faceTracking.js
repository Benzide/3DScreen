import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

export async function createFaceTracker() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

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

    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;

    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    });

    video.srcObject = stream;
    await video.play();

    let lastVideoTime = -1;
    let position = null;

    function update() {
        if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
            lastVideoTime = video.currentTime;

            const result = faceLandmarker.detectForVideo(
                video,
                performance.now()
            );

            if (result.faceLandmarks.length > 0) {
                const landmarks = result.faceLandmarks[0];

                position = {
                    x: (landmarks[468].x + landmarks[473].x) / 2,
                    y: (landmarks[468].y + landmarks[473].y) / 2
                };
            }
        }

        return position;
    }

    return { update };
}