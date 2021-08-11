import './style.css';

const md = navigator.mediaDevices
const hasGetUserMedia = !!(md && md.getUserMedia)

if (hasGetUserMedia) {
    const video = document.querySelector("video")
    const shotsample: HTMLImageElement = document.querySelector(".shot-sample")
    const shots: HTMLImageElement = document.querySelector(".shots")

    const canvas = document.createElement("canvas")
    const maxRow = 2
    const maxCol = 2
    let imageRow = 1
    let imageCol = 1

    // @ts-ignore
    const dispMedia: Promise<MediaStream> = md.getDisplayMedia({
        video: {
            width: { max: 96 }
        }
    })

    const userMedia: Promise<MediaStream> = md.getUserMedia({
        video: {
            width: { max: 96 }
        },
        audio: true
    })

    Promise.all([dispMedia, userMedia]).then(([stream, camStream]) => {

        video.srcObject = stream;

        // const audioContext = new AudioContext();
        // const mediaStreamSource = audioContext.createMediaStreamSource(stream)
        // const analyser = audioContext.createAnalyser();
        // analyser.fftSize = 2048;
        // mediaStreamSource.connect(analyser);

        video.oncanplay = () => {
            canvas.width = video.videoWidth * maxCol
            canvas.height = video.videoHeight * maxRow
            setInterval(() => {
                const startX = video.videoWidth * (imageCol - 1)
                const startY = video.videoHeight * (imageRow - 1)
                canvas.getContext("2d").drawImage(video, startX, startY)
                canvas.getContext("2d").drawImage(video, 0, 0)

                if (imageCol == maxCol && imageRow == maxRow) {
                    shotsample.src = canvas.toDataURL("image/webp")
                    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height)

                    imageCol = 1
                    imageRow = 1
                } else if (imageCol == maxCol && imageRow < maxRow) {
                    imageCol = 1
                    imageRow++
                } else if (imageCol < maxCol) {
                    imageCol++
                }
            }, 1000)
        }
    });

} else {
    alert("getUserMedia() is not supported by your browser");
}