const video = document.getElementById("video");

function startRecording() {
    navigator.getUserMedia(
        { video: {} },
        stream => {
            video.srcObject = stream;
        },
        err => console.error(err)
    )
}

video.addEventListener('play', async () => {
    const canvas = document.getElementById("canvas");
    var ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const displaySize = { width: video.width, height: video.height };
    setInterval(async () => {
        // ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const detection = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();
        if (detection && detection[0] && detection[0].gender && detection[0].age) {
            document.getElementById("stats").innerHTML = detection[0].gender + ":" + detection[0].age;
        }

        if (detection) {
            // console.log("inside!");
            const resizedDetection = faceapi.resizeResults(detection, displaySize);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetection);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetection)
            faceapi.draw.drawFaceExpressions(canvas, resizedDetection);
        }
    }, 100);
});

Promise.all([
    faceapi.nets.ageGenderNet.loadFromUri("face-api.js-models/age_gender_model"),
    faceapi.nets.ssdMobilenetv1.loadFromUri("face-api.js-models/ssd_mobilenetv1"),
    faceapi.nets.tinyFaceDetector.loadFromUri("face-api.js-models/tiny_face_detector"),
    faceapi.nets.faceLandmark68Net.loadFromUri("face-api.js-models/face_landmark_68"),
    faceapi.nets.faceRecognitionNet.loadFromUri("face-api.js-models/face_recognition"),
    faceapi.nets.faceExpressionNet.loadFromUri("face-api.js-models/face_expression")
]).then(startRecording);

