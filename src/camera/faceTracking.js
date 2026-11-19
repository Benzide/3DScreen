import { FilesetResolver, FaceDetector } from "@mediapipe/tasks-vision";

export async function createFaceTracker() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    const faceDetector = await FaceDetector.createFromOptions(
        vision,
        {
            baseOptions: {
            modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_full_range/float16/latest/blaze_face_full_range.tflite",
            delegate: "GPU",
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

            const result = faceDetector.detectForVideo(
                video,
                performance.now()
            );

            if (result.detections.length > 0) {
                const rightEye = result.detections[0].keypoints[0];
                const leftEye = result.detections[0].keypoints[1];

                position = {
                    x: (rightEye.x + leftEye.x) / 2,
                    y: (rightEye.y + leftEye.y) / 2
                };
            }
        }

        return position;
    }

    return { update };
}